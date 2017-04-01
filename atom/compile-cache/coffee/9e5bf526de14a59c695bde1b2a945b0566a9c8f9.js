(function() {
  var Base, CompositeDisposable, Disposable, Emitter, ModeManager, Range, _, moveCursorLeft, ref, swrap,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  moveCursorLeft = require('./utils').moveCursorLeft;

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    function ModeManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.mode = 'insert';
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
    }

    ModeManager.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ModeManager.prototype.isMode = function(mode, submodes) {
      var ref1;
      if (submodes != null) {
        return (this.mode === mode) && (ref1 = this.submode, indexOf.call([].concat(submodes), ref1) >= 0);
      } else {
        return this.mode === mode;
      }
    };

    ModeManager.prototype.onWillActivateMode = function(fn) {
      return this.emitter.on('will-activate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.preemptWillDeactivateMode = function(fn) {
      return this.emitter.preempt('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidDeactivateMode = function(fn) {
      return this.emitter.on('did-deactivate-mode', fn);
    };

    ModeManager.prototype.activate = function(newMode, newSubmode) {
      var ref1, ref2;
      if (newSubmode == null) {
        newSubmode = null;
      }
      if ((newMode === 'visual') && this.editor.isEmpty()) {
        return;
      }
      this.emitter.emit('will-activate-mode', {
        mode: newMode,
        submode: newSubmode
      });
      if ((newMode === 'visual') && (this.submode != null) && (newSubmode === this.submode)) {
        ref1 = ['normal', null], newMode = ref1[0], newSubmode = ref1[1];
      }
      if (newMode !== this.mode) {
        this.deactivate();
      }
      this.deactivator = (function() {
        switch (newMode) {
          case 'normal':
            return this.activateNormalMode();
          case 'operator-pending':
            return this.activateOperatorPendingMode();
          case 'insert':
            return this.activateInsertMode(newSubmode);
          case 'visual':
            return this.activateVisualMode(newSubmode);
        }
      }).call(this);
      this.editorElement.classList.remove(this.mode + "-mode");
      this.editorElement.classList.remove(this.submode);
      ref2 = [newMode, newSubmode], this.mode = ref2[0], this.submode = ref2[1];
      this.editorElement.classList.add(this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      if (this.mode === 'visual') {
        this.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      this.vimState.updateCursorsVisibility();
      return this.emitter.emit('did-activate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.deactivate = function() {
      var ref1, ref2;
      if (!((ref1 = this.deactivator) != null ? ref1.disposed : void 0)) {
        this.emitter.emit('will-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
        if ((ref2 = this.deactivator) != null) {
          ref2.dispose();
        }
        this.editorElement.classList.remove(this.mode + "-mode");
        this.editorElement.classList.remove(this.submode);
        return this.emitter.emit('did-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
      }
    };

    ModeManager.prototype.activateNormalMode = function() {
      var ref1;
      this.vimState.reset();
      if ((ref1 = this.editorElement.component) != null) {
        ref1.setInputEnabled(false);
      }
      return new Disposable;
    };

    ModeManager.prototype.activateOperatorPendingMode = function() {
      return new Disposable;
    };

    ModeManager.prototype.activateInsertMode = function(submode) {
      var replaceModeDeactivator;
      if (submode == null) {
        submode = null;
      }
      this.editorElement.component.setInputEnabled(true);
      if (submode === 'replace') {
        replaceModeDeactivator = this.activateReplaceMode();
      }
      return new Disposable((function(_this) {
        return function() {
          var cursor, i, len, needSpecialCareToPreventWrapLine, ref1, ref2, results;
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          needSpecialCareToPreventWrapLine = (ref1 = atom.config.get('editor.atomicSoftTabs')) != null ? ref1 : true;
          ref2 = _this.editor.getCursors();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            cursor = ref2[i];
            results.push(moveCursorLeft(cursor, {
              needSpecialCareToPreventWrapLine: needSpecialCareToPreventWrapLine
            }));
          }
          return results;
        };
      })(this));
    };

    ModeManager.prototype.activateReplaceMode = function() {
      var subs;
      this.replacedCharsBySelection = new WeakMap;
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(arg) {
          var cancel, text;
          text = arg.text, cancel = arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(selection) {
            var char, i, len, ref1, ref2, results, selectedText;
            ref2 = (ref1 = text.split('')) != null ? ref1 : [];
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              char = ref2[i];
              if ((char !== "\n") && (!selection.cursor.isAtEndOfLine())) {
                selection.selectRight();
              }
              selectedText = selection.getText();
              selection.insertText(char);
              if (!_this.replacedCharsBySelection.has(selection)) {
                _this.replacedCharsBySelection.set(selection, []);
              }
              results.push(_this.replacedCharsBySelection.get(selection).push(selectedText));
            }
            return results;
          });
        };
      })(this)));
      subs.add(new Disposable((function(_this) {
        return function() {
          return _this.replacedCharsBySelection = null;
        };
      })(this)));
      return subs;
    };

    ModeManager.prototype.getReplacedCharForSelection = function(selection) {
      var ref1;
      return (ref1 = this.replacedCharsBySelection.get(selection)) != null ? ref1.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(newSubmode) {
      this.vimState.assertWithException(newSubmode != null, "activate visual-mode without submode");
      this.normalizeSelections();
      swrap.applyWise(this.editor, 'characterwise');
      switch (newSubmode) {
        case 'linewise':
          swrap.applyWise(this.editor, 'linewise');
          break;
        case 'blockwise':
          this.vimState.selectBlockwise();
      }
      return new Disposable((function(_this) {
        return function() {
          var i, len, ref1, selection;
          _this.normalizeSelections();
          ref1 = _this.editor.getSelections();
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            selection.clear({
              autoscroll: false
            });
          }
          return _this.updateNarrowedState(false);
        };
      })(this));
    };

    ModeManager.prototype.normalizeSelections = function() {
      var bs, i, len, ref1;
      if (this.submode === 'blockwise') {
        ref1 = this.vimState.getBlockwiseSelections();
        for (i = 0, len = ref1.length; i < len; i++) {
          bs = ref1[i];
          bs.restoreCharacterwise();
        }
        this.vimState.clearBlockwiseSelections();
      }
      return swrap.normalize(this.editor);
    };

    ModeManager.prototype.hasMultiLineSelection = function() {
      var ref1;
      if (this.isMode('visual', 'blockwise')) {
        return !((ref1 = this.vimState.getLastBlockwiseSelection()) != null ? ref1.isSingleRow() : void 0);
      } else {
        return !swrap(this.editor.getLastSelection()).isSingleRow();
      }
    };

    ModeManager.prototype.updateNarrowedState = function(value) {
      if (value == null) {
        value = null;
      }
      return this.editorElement.classList.toggle('is-narrowed', value != null ? value : this.hasMultiLineSelection());
    };

    ModeManager.prototype.isNarrowed = function() {
      return this.editorElement.classList.contains('is-narrowed');
    };

    return ModeManager;

  })();

  module.exports = ModeManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb2RlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpR0FBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxxQkFBRCxFQUFVLGlCQUFWLEVBQWlCLDZDQUFqQixFQUFzQzs7RUFDdEMsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1AsaUJBQWtCLE9BQUEsQ0FBUSxTQUFSOztFQUViOzBCQUNKLElBQUEsR0FBTTs7MEJBQ04sT0FBQSxHQUFTOzswQkFDVCx3QkFBQSxHQUEwQjs7SUFFYixxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVE7TUFDUixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFuQjtJQUxXOzswQkFPYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRE87OzBCQUdULE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxRQUFQO0FBQ04sVUFBQTtNQUFBLElBQUcsZ0JBQUg7ZUFDRSxDQUFDLElBQUMsQ0FBQSxJ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TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7SUFYYzs7MEJBZ0JwQixtQkFBQSxHQUFxQixTQUFBO0FBQ25CLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFELEtBQVksV0FBZjtBQUNFO0FBQUEsYUFBQSxzQ0FBQTs7VUFDRSxFQUFFLENBQUMsb0JBQUgsQ0FBQTtBQURGO1FBRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyx3QkFBVixDQUFBLEVBSEY7O2FBS0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsSUFBQyxDQUFBLE1BQWpCO0lBTm1COzswQkFVckIscUJBQUEsR0FBdUIsU0FBQTtBQUNyQixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFBa0IsV0FBbEIsQ0FBSDtlQUVFLG1FQUF5QyxDQUFFLFdBQXZDLENBQUEsWUFGTjtPQUFBLE1BQUE7ZUFJRSxDQUFJLEtBQUEsQ0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBTixDQUFpQyxDQUFDLFdBQWxDLENBQUEsRUFKTjs7SUFEcUI7OzBCQU92QixtQkFBQSxHQUFxQixTQUFDLEtBQUQ7O1FBQUMsUUFBTTs7YUFDMUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsYUFBaEMsa0JBQStDLFFBQVEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBdkQ7SUFEbUI7OzBCQUdyQixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXpCLENBQWtDLGFBQWxDO0lBRFU7Ozs7OztFQUdkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBNUxqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgUmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG57bW92ZUN1cnNvckxlZnR9ID0gcmVxdWlyZSAnLi91dGlscydcblxuY2xhc3MgTW9kZU1hbmFnZXJcbiAgbW9kZTogJ2luc2VydCcgIyBOYXRpdmUgYXRvbSBpcyBub3QgbW9kYWwgZWRpdG9yIGFuZCBpdHMgZGVmYXVsdCBpcyAnaW5zZXJ0J1xuICBzdWJtb2RlOiBudWxsXG4gIHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAbW9kZSA9ICdpbnNlcnQnXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgaXNNb2RlOiAobW9kZSwgc3VibW9kZXMpIC0+XG4gICAgaWYgc3VibW9kZXM/XG4gICAgICAoQG1vZGUgaXMgbW9kZSkgYW5kIChAc3VibW9kZSBpbiBbXS5jb25jYXQoc3VibW9kZXMpKVxuICAgIGVsc2VcbiAgICAgIEBtb2RlIGlzIG1vZGVcblxuICAjIEV2ZW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ3dpbGwtYWN0aXZhdGUtbW9kZScsIGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIucHJlZW1wdCgnd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuXG4gICMgYWN0aXZhdGU6IFB1YmxpY1xuICAjICBVc2UgdGhpcyBtZXRob2QgdG8gY2hhbmdlIG1vZGUsIERPTlQgdXNlIG90aGVyIGRpcmVjdCBtZXRob2QuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZTogKG5ld01vZGUsIG5ld1N1Ym1vZGU9bnVsbCkgLT5cbiAgICAjIEF2b2lkIG9kZCBzdGF0ZSg9dmlzdWFsLW1vZGUgYnV0IHNlbGVjdGlvbiBpcyBlbXB0eSlcbiAgICByZXR1cm4gaWYgKG5ld01vZGUgaXMgJ3Zpc3VhbCcpIGFuZCBAZWRpdG9yLmlzRW1wdHkoKVxuXG4gICAgQGVtaXR0ZXIuZW1pdCgnd2lsbC1hY3RpdmF0ZS1tb2RlJywgbW9kZTogbmV3TW9kZSwgc3VibW9kZTogbmV3U3VibW9kZSlcblxuICAgIGlmIChuZXdNb2RlIGlzICd2aXN1YWwnKSBhbmQgQHN1Ym1vZGU/IGFuZCAobmV3U3VibW9kZSBpcyBAc3VibW9kZSlcbiAgICAgIFtuZXdNb2RlLCBuZXdTdWJtb2RlXSA9IFsnbm9ybWFsJywgbnVsbF1cblxuICAgIEBkZWFjdGl2YXRlKCkgaWYgKG5ld01vZGUgaXNudCBAbW9kZSlcblxuICAgIEBkZWFjdGl2YXRvciA9IHN3aXRjaCBuZXdNb2RlXG4gICAgICB3aGVuICdub3JtYWwnIHRoZW4gQGFjdGl2YXRlTm9ybWFsTW9kZSgpXG4gICAgICB3aGVuICdvcGVyYXRvci1wZW5kaW5nJyB0aGVuIEBhY3RpdmF0ZU9wZXJhdG9yUGVuZGluZ01vZGUoKVxuICAgICAgd2hlbiAnaW5zZXJ0JyB0aGVuIEBhY3RpdmF0ZUluc2VydE1vZGUobmV3U3VibW9kZSlcbiAgICAgIHdoZW4gJ3Zpc3VhbCcgdGhlbiBAYWN0aXZhdGVWaXN1YWxNb2RlKG5ld1N1Ym1vZGUpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQHN1Ym1vZGUpXG5cbiAgICBbQG1vZGUsIEBzdWJtb2RlXSA9IFtuZXdNb2RlLCBuZXdTdWJtb2RlXVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIiN7QG1vZGV9LW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKEBzdWJtb2RlKSBpZiBAc3VibW9kZT9cblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAdXBkYXRlTmFycm93ZWRTdGF0ZSgpXG4gICAgICBAdmltU3RhdGUudXBkYXRlUHJldmlvdXNTZWxlY3Rpb24oKVxuXG4gICAgQHZpbVN0YXRlLnN0YXR1c0Jhck1hbmFnZXIudXBkYXRlKEBtb2RlLCBAc3VibW9kZSlcbiAgICBAdmltU3RhdGUudXBkYXRlQ3Vyc29yc1Zpc2liaWxpdHkoKVxuXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIHVubGVzcyBAZGVhY3RpdmF0b3I/LmRpc3Bvc2VkXG4gICAgICBAZW1pdHRlci5lbWl0KCd3aWxsLWRlYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuICAgICAgQGRlYWN0aXZhdG9yPy5kaXNwb3NlKClcbiAgICAgICMgUmVtb3ZlIGNzcyBjbGFzcyBoZXJlIGluLWNhc2UgQGRlYWN0aXZhdGUoKSBjYWxsZWQgc29sZWx5KG9jY3VycmVuY2UgaW4gdmlzdWFsLW1vZGUpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAc3VibW9kZSlcblxuICAgICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWRlYWN0aXZhdGUtbW9kZScsIHtAbW9kZSwgQHN1Ym1vZGV9KVxuXG4gICMgTm9ybWFsXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZU5vcm1hbE1vZGU6IC0+XG4gICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICAjIENvbXBvbmVudCBpcyBub3QgbmVjZXNzYXJ5IGF2YWlhYmxlIHNlZSAjOTguXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQoZmFsc2UpXG4gICAgbmV3IERpc3Bvc2FibGVcblxuICAjIE9wZXJhdG9yIFBlbmRpbmdcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZTogLT5cbiAgICBuZXcgRGlzcG9zYWJsZVxuXG4gICMgSW5zZXJ0XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZUluc2VydE1vZGU6IChzdWJtb2RlPW51bGwpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnNldElucHV0RW5hYmxlZCh0cnVlKVxuICAgIHJlcGxhY2VNb2RlRGVhY3RpdmF0b3IgPSBAYWN0aXZhdGVSZXBsYWNlTW9kZSgpIGlmIHN1Ym1vZGUgaXMgJ3JlcGxhY2UnXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvcj8uZGlzcG9zZSgpXG4gICAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yID0gbnVsbFxuXG4gICAgICAjIFdoZW4gZXNjYXBlIGZyb20gaW5zZXJ0LW1vZGUsIGN1cnNvciBtb3ZlIExlZnQuXG4gICAgICBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZSA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmF0b21pY1NvZnRUYWJzJykgPyB0cnVlXG4gICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICAgIG1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge25lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lfSlcblxuICBhY3RpdmF0ZVJlcGxhY2VNb2RlOiAtPlxuICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBuZXcgV2Vha01hcFxuICAgIHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHN1YnMuYWRkIEBlZGl0b3Iub25XaWxsSW5zZXJ0VGV4dCAoe3RleHQsIGNhbmNlbH0pID0+XG4gICAgICBjYW5jZWwoKVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBmb3IgY2hhciBpbiB0ZXh0LnNwbGl0KCcnKSA/IFtdXG4gICAgICAgICAgaWYgKGNoYXIgaXNudCBcIlxcblwiKSBhbmQgKG5vdCBzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSlcbiAgICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXIpXG5cbiAgICAgICAgICB1bmxlc3MgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBbXSlcbiAgICAgICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnB1c2goc2VsZWN0ZWRUZXh0KVxuXG4gICAgc3Vicy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24gPSBudWxsXG4gICAgc3Vic1xuXG4gIGdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pPy5wb3AoKVxuXG4gICMgVmlzdWFsXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFdlIHRyZWF0IGFsbCBzZWxlY3Rpb24gaXMgaW5pdGlhbGx5IE5PVCBub3JtYWxpemVkXG4gICNcbiAgIyAxLiBGaXJzdCB3ZSBub3JtYWxpemUgc2VsZWN0aW9uXG4gICMgMi4gVGhlbiB1cGRhdGUgc2VsZWN0aW9uIG9yaWVudGF0aW9uKD13aXNlKS5cbiAgI1xuICAjIFJlZ2FyZGxlc3Mgb2Ygc2VsZWN0aW9uIGlzIG1vZGlmaWVkIGJ5IHZtcC1jb21tYW5kIG9yIG91dGVyLXZtcC1jb21tYW5kIGxpa2UgYGNtZC1sYC5cbiAgIyBXaGVuIG5vcm1hbGl6ZSwgd2UgbW92ZSBjdXJzb3IgdG8gbGVmdChzZWxlY3RMZWZ0IGVxdWl2YWxlbnQpLlxuICAjIFNpbmNlIFZpbSdzIHZpc3VhbC1tb2RlIGlzIGFsd2F5cyBzZWxlY3RSaWdodGVkLlxuICAjXG4gICMgLSB1bi1ub3JtYWxpemVkIHNlbGVjdGlvbjogVGhpcyBpcyB0aGUgcmFuZ2Ugd2Ugc2VlIGluIHZpc3VhbC1tb2RlLiggU28gbm9ybWFsIHZpc3VhbC1tb2RlIHJhbmdlIGluIHVzZXIgcGVyc3BlY3RpdmUgKS5cbiAgIyAtIG5vcm1hbGl6ZWQgc2VsZWN0aW9uOiBPbmUgY29sdW1uIGxlZnQgc2VsY3RlZCBhdCBzZWxlY3Rpb24gZW5kIHBvc2l0aW9uXG4gICMgLSBXaGVuIHNlbGVjdFJpZ2h0IGF0IGVuZCBwb3NpdGlvbiBvZiBub3JtYWxpemVkLXNlbGVjdGlvbiwgaXQgYmVjb21lIHVuLW5vcm1hbGl6ZWQgc2VsZWN0aW9uXG4gICMgICB3aGljaCBpcyB0aGUgcmFuZ2UgaW4gdmlzdWFsLW1vZGUuXG4gICNcbiAgYWN0aXZhdGVWaXN1YWxNb2RlOiAobmV3U3VibW9kZSkgLT5cbiAgICBAdmltU3RhdGUuYXNzZXJ0V2l0aEV4Y2VwdGlvbihuZXdTdWJtb2RlPywgXCJhY3RpdmF0ZSB2aXN1YWwtbW9kZSB3aXRob3V0IHN1Ym1vZGVcIilcbiAgICBAbm9ybWFsaXplU2VsZWN0aW9ucygpXG4gICAgc3dyYXAuYXBwbHlXaXNlKEBlZGl0b3IsICdjaGFyYWN0ZXJ3aXNlJylcblxuICAgIHN3aXRjaCBuZXdTdWJtb2RlXG4gICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgc3dyYXAuYXBwbHlXaXNlKEBlZGl0b3IsICdsaW5ld2lzZScpXG4gICAgICB3aGVuICdibG9ja3dpc2UnXG4gICAgICAgIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKVxuXG4gICAgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jbGVhcihhdXRvc2Nyb2xsOiBmYWxzZSkgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHVwZGF0ZU5hcnJvd2VkU3RhdGUoZmFsc2UpXG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uczogLT5cbiAgICBpZiBAc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgZm9yIGJzIGluIEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKClcbiAgICAgICAgYnMucmVzdG9yZUNoYXJhY3Rlcndpc2UoKVxuICAgICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpXG5cbiAgICBzd3JhcC5ub3JtYWxpemUoQGVkaXRvcilcblxuICAjIE5hcnJvdyB0byBzZWxlY3Rpb25cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc011bHRpTGluZVNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICMgW0ZJWE1FXSB3aHkgSSBuZWVkIG51bGwgZ3VhcmQgaGVyZVxuICAgICAgbm90IEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LmlzU2luZ2xlUm93KClcbiAgICBlbHNlXG4gICAgICBub3Qgc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmlzU2luZ2xlUm93KClcblxuICB1cGRhdGVOYXJyb3dlZFN0YXRlOiAodmFsdWU9bnVsbCkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdpcy1uYXJyb3dlZCcsIHZhbHVlID8gQGhhc011bHRpTGluZVNlbGVjdGlvbigpKVxuXG4gIGlzTmFycm93ZWQ6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1uYXJyb3dlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gTW9kZU1hbmFnZXJcbiJdfQ==
