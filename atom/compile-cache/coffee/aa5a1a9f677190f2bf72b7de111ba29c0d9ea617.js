(function() {
  var CompositeDisposable, Emitter, HighlightedAreaView, MarkerLayer, Range, StatusBarView, _, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter, MarkerLayer = ref.MarkerLayer;

  _ = require('underscore-plus');

  StatusBarView = require('./status-bar-view');

  module.exports = HighlightedAreaView = (function() {
    function HighlightedAreaView() {
      this.listenForStatusBarChange = bind(this.listenForStatusBarChange, this);
      this.removeStatusBar = bind(this.removeStatusBar, this);
      this.setupStatusBar = bind(this.setupStatusBar, this);
      this.removeMarkers = bind(this.removeMarkers, this);
      this.handleSelection = bind(this.handleSelection, this);
      this.debouncedHandleSelection = bind(this.debouncedHandleSelection, this);
      this.setStatusBar = bind(this.setStatusBar, this);
      this.enable = bind(this.enable, this);
      this.disable = bind(this.disable, this);
      this.onDidRemoveAllMarkers = bind(this.onDidRemoveAllMarkers, this);
      this.onDidAddSelectedMarker = bind(this.onDidAddSelectedMarker, this);
      this.onDidAddMarker = bind(this.onDidAddMarker, this);
      this.destroy = bind(this.destroy, this);
      this.emitter = new Emitter;
      this.markerLayers = [];
      this.resultCount = 0;
      this.enable();
      this.listenForTimeoutChange();
      this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.debouncedHandleSelection();
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.subscribeToActiveTextEditor();
      this.listenForStatusBarChange();
    }

    HighlightedAreaView.prototype.destroy = function() {
      var ref1, ref2, ref3;
      clearTimeout(this.handleSelectionTimeout);
      this.activeItemSubscription.dispose();
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.statusBarView) != null) {
        ref2.removeElement();
      }
      if ((ref3 = this.statusBarTile) != null) {
        ref3.destroy();
      }
      return this.statusBarTile = null;
    };

    HighlightedAreaView.prototype.onDidAddMarker = function(callback) {
      return this.emitter.on('did-add-marker', callback);
    };

    HighlightedAreaView.prototype.onDidAddSelectedMarker = function(callback) {
      return this.emitter.on('did-add-selected-marker', callback);
    };

    HighlightedAreaView.prototype.onDidRemoveAllMarkers = function(callback) {
      return this.emitter.on('did-remove-marker-layer', callback);
    };

    HighlightedAreaView.prototype.disable = function() {
      this.disabled = true;
      return this.removeMarkers();
    };

    HighlightedAreaView.prototype.enable = function() {
      this.disabled = false;
      return this.debouncedHandleSelection();
    };

    HighlightedAreaView.prototype.setStatusBar = function(statusBar) {
      this.statusBar = statusBar;
      return this.setupStatusBar();
    };

    HighlightedAreaView.prototype.debouncedHandleSelection = function() {
      clearTimeout(this.handleSelectionTimeout);
      return this.handleSelectionTimeout = setTimeout((function(_this) {
        return function() {
          return _this.handleSelection();
        };
      })(this), atom.config.get('highlight-selected.timeout'));
    };

    HighlightedAreaView.prototype.listenForTimeoutChange = function() {
      return atom.config.onDidChange('highlight-selected.timeout', (function(_this) {
        return function() {
          return _this.debouncedHandleSelection();
        };
      })(this));
    };

    HighlightedAreaView.prototype.subscribeToActiveTextEditor = function() {
      var editor, ref1;
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      this.selectionSubscription = new CompositeDisposable;
      this.selectionSubscription.add(editor.onDidAddSelection(this.debouncedHandleSelection));
      this.selectionSubscription.add(editor.onDidChangeSelectionRange(this.debouncedHandleSelection));
      return this.handleSelection();
    };

    HighlightedAreaView.prototype.getActiveEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    HighlightedAreaView.prototype.getActiveEditors = function() {
      return atom.workspace.getPanes().map(function(pane) {
        var activeItem;
        activeItem = pane.activeItem;
        if (activeItem && activeItem.constructor.name === 'TextEditor') {
          return activeItem;
        }
      });
    };

    HighlightedAreaView.prototype.handleSelection = function() {
      var editor, range, ref1, ref2, regex, regexFlags, regexSearch, result, text;
      this.removeMarkers();
      if (this.disabled) {
        return;
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      if (editor.getLastSelection().isEmpty()) {
        return;
      }
      if (!this.isWordSelected(editor.getLastSelection())) {
        return;
      }
      this.selections = editor.getSelections();
      text = _.escapeRegExp(this.selections[0].getText());
      regex = new RegExp("\\S*\\w*\\b", 'gi');
      result = regex.exec(text);
      if (result == null) {
        return;
      }
      if (result[0].length < atom.config.get('highlight-selected.minimumLength') || result.index !== 0 || result[0] !== result.input) {
        return;
      }
      regexFlags = 'g';
      if (atom.config.get('highlight-selected.ignoreCase')) {
        regexFlags = 'gi';
      }
      range = [[0, 0], editor.getEofBufferPosition()];
      this.ranges = [];
      regexSearch = result[0];
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        if (regexSearch.indexOf("\$") !== -1 && ((ref1 = editor.getGrammar()) != null ? ref1.name : void 0) === 'PHP') {
          regexSearch = regexSearch.replace("\$", "\$\\b");
        } else {
          regexSearch = "\\b" + regexSearch;
        }
        regexSearch = regexSearch + "\\b";
      }
      this.resultCount = 0;
      if (atom.config.get('highlight-selected.highlightInPanes')) {
        this.getActiveEditors().forEach((function(_this) {
          return function(editor) {
            return _this.highlightSelectionInEditor(editor, regexSearch, regexFlags, range);
          };
        })(this));
      } else {
        this.highlightSelectionInEditor(editor, regexSearch, regexFlags, range);
      }
      return (ref2 = this.statusBarElement) != null ? ref2.updateCount(this.resultCount) : void 0;
    };

    HighlightedAreaView.prototype.highlightSelectionInEditor = function(editor, regexSearch, regexFlags, range) {
      var markerLayer, markerLayerForHiddenMarkers;
      markerLayer = editor != null ? editor.addMarkerLayer() : void 0;
      if (markerLayer == null) {
        return;
      }
      markerLayerForHiddenMarkers = editor.addMarkerLayer();
      this.markerLayers.push(markerLayer);
      this.markerLayers.push(markerLayerForHiddenMarkers);
      editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
        return function(result) {
          var marker;
          _this.resultCount += 1;
          if (_this.showHighlightOnSelectedWord(result.range, _this.selections)) {
            marker = markerLayerForHiddenMarkers.markBufferRange(result.range);
            return _this.emitter.emit('did-add-selected-marker', marker);
          } else {
            marker = markerLayer.markBufferRange(result.range);
            return _this.emitter.emit('did-add-marker', marker);
          }
        };
      })(this));
      return editor.decorateMarkerLayer(markerLayer, {
        type: 'highlight',
        "class": this.makeClasses()
      });
    };

    HighlightedAreaView.prototype.makeClasses = function() {
      var className;
      className = 'highlight-selected';
      if (atom.config.get('highlight-selected.lightTheme')) {
        className += ' light-theme';
      }
      if (atom.config.get('highlight-selected.highlightBackground')) {
        className += ' background';
      }
      return className;
    };

    HighlightedAreaView.prototype.showHighlightOnSelectedWord = function(range, selections) {
      var i, len, outcome, selection, selectionRange;
      if (!atom.config.get('highlight-selected.hideHighlightOnSelectedWord')) {
        return false;
      }
      outcome = false;
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        selectionRange = selection.getBufferRange();
        outcome = (range.start.column === selectionRange.start.column) && (range.start.row === selectionRange.start.row) && (range.end.column === selectionRange.end.column) && (range.end.row === selectionRange.end.row);
        if (outcome) {
          break;
        }
      }
      return outcome;
    };

    HighlightedAreaView.prototype.removeMarkers = function() {
      var ref1;
      this.markerLayers.forEach(function(markerLayer) {
        return markerLayer.destroy();
      });
      this.markerLayers = [];
      if ((ref1 = this.statusBarElement) != null) {
        ref1.updateCount(0);
      }
      return this.emitter.emit('did-remove-marker-layer');
    };

    HighlightedAreaView.prototype.isWordSelected = function(selection) {
      var lineRange, nonWordCharacterToTheLeft, nonWordCharacterToTheRight, selectionRange;
      if (selection.getBufferRange().isSingleLine()) {
        selectionRange = selection.getBufferRange();
        lineRange = this.getActiveEditor().bufferRangeForBufferRow(selectionRange.start.row);
        nonWordCharacterToTheLeft = _.isEqual(selectionRange.start, lineRange.start) || this.isNonWordCharacterToTheLeft(selection);
        nonWordCharacterToTheRight = _.isEqual(selectionRange.end, lineRange.end) || this.isNonWordCharacterToTheRight(selection);
        return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
      } else {
        return false;
      }
    };

    HighlightedAreaView.prototype.isNonWordCharacter = function(character) {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp("[ \t" + (_.escapeRegExp(nonWordCharacters)) + "]").test(character);
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheLeft = function(selection) {
      var range, selectionStart;
      selectionStart = selection.getBufferRange().start;
      range = Range.fromPointWithDelta(selectionStart, 0, -1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheRight = function(selection) {
      var range, selectionEnd;
      selectionEnd = selection.getBufferRange().end;
      range = Range.fromPointWithDelta(selectionEnd, 0, 1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.setupStatusBar = function() {
      if (this.statusBarElement != null) {
        return;
      }
      if (!atom.config.get('highlight-selected.showInStatusBar')) {
        return;
      }
      this.statusBarElement = new StatusBarView();
      return this.statusBarTile = this.statusBar.addLeftTile({
        item: this.statusBarElement.getElement(),
        priority: 100
      });
    };

    HighlightedAreaView.prototype.removeStatusBar = function() {
      var ref1;
      if (this.statusBarElement == null) {
        return;
      }
      if ((ref1 = this.statusBarTile) != null) {
        ref1.destroy();
      }
      this.statusBarTile = null;
      return this.statusBarElement = null;
    };

    HighlightedAreaView.prototype.listenForStatusBarChange = function() {
      return atom.config.onDidChange('highlight-selected.showInStatusBar', (function(_this) {
        return function(changed) {
          if (changed.newValue) {
            return _this.setupStatusBar();
          } else {
            return _this.removeStatusBar();
          }
        };
      })(this));
    };

    return HighlightedAreaView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9oaWdobGlnaHQtc2VsZWN0ZWQvbGliL2hpZ2hsaWdodGVkLWFyZWEtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRGQUFBO0lBQUE7O0VBQUEsTUFBcUQsT0FBQSxDQUFRLE1BQVIsQ0FBckQsRUFBQyxpQkFBRCxFQUFRLDZDQUFSLEVBQTZCLHFCQUE3QixFQUFzQzs7RUFDdEMsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUjs7RUFFaEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUVTLDZCQUFBOzs7Ozs7Ozs7Ozs7OztNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsTUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHNCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDakUsS0FBQyxDQUFBLHdCQUFELENBQUE7aUJBQ0EsS0FBQyxDQUFBLDJCQUFELENBQUE7UUFGaUU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDO01BRzFCLElBQUMsQ0FBQSwyQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7SUFWVzs7a0NBWWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxzQkFBZDtNQUNBLElBQUMsQ0FBQSxzQkFBc0IsQ0FBQyxPQUF4QixDQUFBOztZQUNzQixDQUFFLE9BQXhCLENBQUE7OztZQUNjLENBQUUsYUFBaEIsQ0FBQTs7O1lBQ2MsQ0FB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VjtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQ0FBaEIsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLGdCQUFELEdBQXdCLElBQUEsYUFBQSxDQUFBO2FBQ3hCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUNmO1FBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxVQUFsQixDQUFBLENBQU47UUFBc0MsUUFBQSxFQUFVLEdBQWhEO09BRGU7SUFKSDs7a0NBT2hCLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxJQUFjLDZCQUFkO0FBQUEsZUFBQTs7O1lBQ2MsQ0FBRSxPQUFoQixDQUFBOztNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO2FBQ2pCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQUpMOztrQ0FNakIsd0JBQUEsR0FBMEIsU0FBQTthQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0Isb0NBQXhCLEVBQThELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO1VBQzVELElBQUcsT0FBTyxDQUFDLFFBQVg7bUJBQ0UsS0FBQyxDQUFBLGNBQUQsQ0FBQSxFQURGO1dBQUEsTUFBQTttQkFHRSxLQUFDLENBQUEsZUFBRCxDQUFBLEVBSEY7O1FBRDREO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5RDtJQUR3Qjs7Ozs7QUEvTjVCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyLCBNYXJrZXJMYXllcn0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblN0YXR1c0JhclZpZXcgPSByZXF1aXJlICcuL3N0YXR1cy1iYXItdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSGlnaGxpZ2h0ZWRBcmVhVmlld1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAbWFya2VyTGF5ZXJzID0gW11cbiAgICBAcmVzdWx0Q291bnQgPSAwXG4gICAgQGVuYWJsZSgpXG4gICAgQGxpc3RlbkZvclRpbWVvdXRDaGFuZ2UoKVxuICAgIEBhY3RpdmVJdGVtU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSA9PlxuICAgICAgQGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvbigpXG4gICAgICBAc3Vic2NyaWJlVG9BY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAc3Vic2NyaWJlVG9BY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAbGlzdGVuRm9yU3RhdHVzQmFyQ2hhbmdlKClcblxuICBkZXN0cm95OiA9PlxuICAgIGNsZWFyVGltZW91dChAaGFuZGxlU2VsZWN0aW9uVGltZW91dClcbiAgICBAYWN0aXZlSXRlbVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBAc2VsZWN0aW9uU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcbiAgICBAc3RhdHVzQmFyVmlldz8ucmVtb3ZlRWxlbWVudCgpXG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gbnVsbFxuXG4gIG9uRGlkQWRkTWFya2VyOiAoY2FsbGJhY2spID0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1hZGQtbWFya2VyJywgY2FsbGJhY2tcblxuICBvbkRpZEFkZFNlbGVjdGVkTWFya2VyOiAoY2FsbGJhY2spID0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1hZGQtc2VsZWN0ZWQtbWFya2VyJywgY2FsbGJhY2tcblxuICBvbkRpZFJlbW92ZUFsbE1hcmtlcnM6IChjYWxsYmFjaykgPT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXJlbW92ZS1tYXJrZXItbGF5ZXInLCBjYWxsYmFja1xuXG4gIGRpc2FibGU6ID0+XG4gICAgQGRpc2FibGVkID0gdHJ1ZVxuICAgIEByZW1vdmVNYXJrZXJzKClcblxuICBlbmFibGU6ID0+XG4gICAgQGRpc2FibGVkID0gZmFsc2VcbiAgICBAZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uKClcblxuICBzZXRTdGF0dXNCYXI6IChzdGF0dXNCYXIpID0+XG4gICAgQHN0YXR1c0JhciA9IHN0YXR1c0JhclxuICAgIEBzZXR1cFN0YXR1c0JhcigpXG5cbiAgZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uOiA9PlxuICAgIGNsZWFyVGltZW91dChAaGFuZGxlU2VsZWN0aW9uVGltZW91dClcbiAgICBAaGFuZGxlU2VsZWN0aW9uVGltZW91dCA9IHNldFRpbWVvdXQgPT5cbiAgICAgIEBoYW5kbGVTZWxlY3Rpb24oKVxuICAgICwgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQudGltZW91dCcpXG5cbiAgbGlzdGVuRm9yVGltZW91dENoYW5nZTogLT5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaGlnaGxpZ2h0LXNlbGVjdGVkLnRpbWVvdXQnLCA9PlxuICAgICAgQGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvbigpXG5cbiAgc3Vic2NyaWJlVG9BY3RpdmVUZXh0RWRpdG9yOiAtPlxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuXG4gICAgZWRpdG9yID0gQGdldEFjdGl2ZUVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcblxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICBlZGl0b3Iub25EaWRBZGRTZWxlY3Rpb24gQGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvblxuICAgIClcbiAgICBAc2VsZWN0aW9uU3Vic2NyaXB0aW9uLmFkZChcbiAgICAgIGVkaXRvci5vbkRpZENoYW5nZVNlbGVjdGlvblJhbmdlIEBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb25cbiAgICApXG4gICAgQGhhbmRsZVNlbGVjdGlvbigpXG5cbiAgZ2V0QWN0aXZlRWRpdG9yOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gIGdldEFjdGl2ZUVkaXRvcnM6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKS5tYXAgKHBhbmUpIC0+XG4gICAgICBhY3RpdmVJdGVtID0gcGFuZS5hY3RpdmVJdGVtXG4gICAgICBhY3RpdmVJdGVtIGlmIGFjdGl2ZUl0ZW0gYW5kIGFjdGl2ZUl0ZW0uY29uc3RydWN0b3IubmFtZSA9PSAnVGV4dEVkaXRvcidcblxuICBoYW5kbGVTZWxlY3Rpb246ID0+XG4gICAgQHJlbW92ZU1hcmtlcnMoKVxuXG4gICAgcmV0dXJuIGlmIEBkaXNhYmxlZFxuXG4gICAgZWRpdG9yID0gQGdldEFjdGl2ZUVkaXRvcigpXG5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvclxuICAgIHJldHVybiBpZiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzRW1wdHkoKVxuICAgIHJldHVybiB1bmxlc3MgQGlzV29yZFNlbGVjdGVkKGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG5cbiAgICBAc2VsZWN0aW9ucyA9IGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIHRleHQgPSBfLmVzY2FwZVJlZ0V4cChAc2VsZWN0aW9uc1swXS5nZXRUZXh0KCkpXG4gICAgcmVnZXggPSBuZXcgUmVnRXhwKFwiXFxcXFMqXFxcXHcqXFxcXGJcIiwgJ2dpJylcbiAgICByZXN1bHQgPSByZWdleC5leGVjKHRleHQpXG5cbiAgICByZXR1cm4gdW5sZXNzIHJlc3VsdD9cbiAgICByZXR1cm4gaWYgcmVzdWx0WzBdLmxlbmd0aCA8IGF0b20uY29uZmlnLmdldChcbiAgICAgICdoaWdobGlnaHQtc2VsZWN0ZWQubWluaW11bUxlbmd0aCcpIG9yXG4gICAgICAgICAgICAgIHJlc3VsdC5pbmRleCBpc250IDAgb3JcbiAgICAgICAgICAgICAgcmVzdWx0WzBdIGlzbnQgcmVzdWx0LmlucHV0XG5cbiAgICByZWdleEZsYWdzID0gJ2cnXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQuaWdub3JlQ2FzZScpXG4gICAgICByZWdleEZsYWdzID0gJ2dpJ1xuXG4gICAgcmFuZ2UgPSAgW1swLCAwXSwgZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKCldXG5cbiAgICBAcmFuZ2VzID0gW11cbiAgICByZWdleFNlYXJjaCA9IHJlc3VsdFswXVxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQub25seUhpZ2hsaWdodFdob2xlV29yZHMnKVxuICAgICAgaWYgcmVnZXhTZWFyY2guaW5kZXhPZihcIlxcJFwiKSBpc250IC0xIFxcXG4gICAgICBhbmQgZWRpdG9yLmdldEdyYW1tYXIoKT8ubmFtZSBpcyAnUEhQJ1xuICAgICAgICByZWdleFNlYXJjaCA9IHJlZ2V4U2VhcmNoLnJlcGxhY2UoXCJcXCRcIiwgXCJcXCRcXFxcYlwiKVxuICAgICAgZWxzZVxuICAgICAgICByZWdleFNlYXJjaCA9ICBcIlxcXFxiXCIgKyByZWdleFNlYXJjaFxuICAgICAgcmVnZXhTZWFyY2ggPSByZWdleFNlYXJjaCArIFwiXFxcXGJcIlxuXG4gICAgQHJlc3VsdENvdW50ID0gMFxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLmhpZ2hsaWdodEluUGFuZXMnKVxuICAgICAgQGdldEFjdGl2ZUVkaXRvcnMoKS5mb3JFYWNoIChlZGl0b3IpID0+XG4gICAgICAgIEBoaWdobGlnaHRTZWxlY3Rpb25JbkVkaXRvcihlZGl0b3IsIHJlZ2V4U2VhcmNoLCByZWdleEZsYWdzLCByYW5nZSlcbiAgICBlbHNlXG4gICAgICBAaGlnaGxpZ2h0U2VsZWN0aW9uSW5FZGl0b3IoZWRpdG9yLCByZWdleFNlYXJjaCwgcmVnZXhGbGFncywgcmFuZ2UpXG5cbiAgICBAc3RhdHVzQmFyRWxlbWVudD8udXBkYXRlQ291bnQoQHJlc3VsdENvdW50KVxuXG4gIGhpZ2hsaWdodFNlbGVjdGlvbkluRWRpdG9yOiAoZWRpdG9yLCByZWdleFNlYXJjaCwgcmVnZXhGbGFncywgcmFuZ2UpIC0+XG4gICAgbWFya2VyTGF5ZXIgPSBlZGl0b3I/LmFkZE1hcmtlckxheWVyKClcbiAgICByZXR1cm4gdW5sZXNzIG1hcmtlckxheWVyP1xuICAgIG1hcmtlckxheWVyRm9ySGlkZGVuTWFya2VycyA9IGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQG1hcmtlckxheWVycy5wdXNoKG1hcmtlckxheWVyKVxuICAgIEBtYXJrZXJMYXllcnMucHVzaChtYXJrZXJMYXllckZvckhpZGRlbk1hcmtlcnMpXG4gICAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIG5ldyBSZWdFeHAocmVnZXhTZWFyY2gsIHJlZ2V4RmxhZ3MpLCByYW5nZSxcbiAgICAgIChyZXN1bHQpID0+XG4gICAgICAgIEByZXN1bHRDb3VudCArPSAxXG4gICAgICAgIGlmIEBzaG93SGlnaGxpZ2h0T25TZWxlY3RlZFdvcmQocmVzdWx0LnJhbmdlLCBAc2VsZWN0aW9ucylcbiAgICAgICAgICBtYXJrZXIgPSBtYXJrZXJMYXllckZvckhpZGRlbk1hcmtlcnMubWFya0J1ZmZlclJhbmdlKHJlc3VsdC5yYW5nZSlcbiAgICAgICAgICBAZW1pdHRlci5lbWl0ICdkaWQtYWRkLXNlbGVjdGVkLW1hcmtlcicsIG1hcmtlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgbWFya2VyID0gbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJlc3VsdC5yYW5nZSlcbiAgICAgICAgICBAZW1pdHRlci5lbWl0ICdkaWQtYWRkLW1hcmtlcicsIG1hcmtlclxuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKG1hcmtlckxheWVyLCB7XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgIGNsYXNzOiBAbWFrZUNsYXNzZXMoKVxuICAgIH0pXG5cbiAgbWFrZUNsYXNzZXM6IC0+XG4gICAgY2xhc3NOYW1lID0gJ2hpZ2hsaWdodC1zZWxlY3RlZCdcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5saWdodFRoZW1lJylcbiAgICAgIGNsYXNzTmFtZSArPSAnIGxpZ2h0LXRoZW1lJ1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQuaGlnaGxpZ2h0QmFja2dyb3VuZCcpXG4gICAgICBjbGFzc05hbWUgKz0gJyBiYWNrZ3JvdW5kJ1xuICAgIGNsYXNzTmFtZVxuXG4gIHNob3dIaWdobGlnaHRPblNlbGVjdGVkV29yZDogKHJhbmdlLCBzZWxlY3Rpb25zKSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgYXRvbS5jb25maWcuZ2V0KFxuICAgICAgJ2hpZ2hsaWdodC1zZWxlY3RlZC5oaWRlSGlnaGxpZ2h0T25TZWxlY3RlZFdvcmQnKVxuICAgIG91dGNvbWUgPSBmYWxzZVxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgc2VsZWN0aW9uUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgb3V0Y29tZSA9IChyYW5nZS5zdGFydC5jb2x1bW4gaXMgc2VsZWN0aW9uUmFuZ2Uuc3RhcnQuY29sdW1uKSBhbmRcbiAgICAgICAgICAgICAgICAocmFuZ2Uuc3RhcnQucm93IGlzIHNlbGVjdGlvblJhbmdlLnN0YXJ0LnJvdykgYW5kXG4gICAgICAgICAgICAgICAgKHJhbmdlLmVuZC5jb2x1bW4gaXMgc2VsZWN0aW9uUmFuZ2UuZW5kLmNvbHVtbikgYW5kXG4gICAgICAgICAgICAgICAgKHJhbmdlLmVuZC5yb3cgaXMgc2VsZWN0aW9uUmFuZ2UuZW5kLnJvdylcbiAgICAgIGJyZWFrIGlmIG91dGNvbWVcbiAgICBvdXRjb21lXG5cbiAgcmVtb3ZlTWFya2VyczogPT5cbiAgICBAbWFya2VyTGF5ZXJzLmZvckVhY2ggKG1hcmtlckxheWVyKSAtPlxuICAgICAgbWFya2VyTGF5ZXIuZGVzdHJveSgpXG4gICAgQG1hcmtlckxheWVycyA9IFtdXG4gICAgQHN0YXR1c0JhckVsZW1lbnQ/LnVwZGF0ZUNvdW50KDApXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXJlbW92ZS1tYXJrZXItbGF5ZXInXG5cbiAgaXNXb3JkU2VsZWN0ZWQ6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNTaW5nbGVMaW5lKClcbiAgICAgIHNlbGVjdGlvblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGxpbmVSYW5nZSA9IEBnZXRBY3RpdmVFZGl0b3IoKS5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhcbiAgICAgICAgc2VsZWN0aW9uUmFuZ2Uuc3RhcnQucm93KVxuICAgICAgbm9uV29yZENoYXJhY3RlclRvVGhlTGVmdCA9XG4gICAgICAgIF8uaXNFcXVhbChzZWxlY3Rpb25SYW5nZS5zdGFydCwgbGluZVJhbmdlLnN0YXJ0KSBvclxuICAgICAgICBAaXNOb25Xb3JkQ2hhcmFjdGVyVG9UaGVMZWZ0KHNlbGVjdGlvbilcbiAgICAgIG5vbldvcmRDaGFyYWN0ZXJUb1RoZVJpZ2h0ID1cbiAgICAgICAgXy5pc0VxdWFsKHNlbGVjdGlvblJhbmdlLmVuZCwgbGluZVJhbmdlLmVuZCkgb3JcbiAgICAgICAgQGlzTm9uV29yZENoYXJhY3RlclRvVGhlUmlnaHQoc2VsZWN0aW9uKVxuXG4gICAgICBub25Xb3JkQ2hhcmFjdGVyVG9UaGVMZWZ0IGFuZCBub25Xb3JkQ2hhcmFjdGVyVG9UaGVSaWdodFxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgaXNOb25Xb3JkQ2hhcmFjdGVyOiAoY2hhcmFjdGVyKSAtPlxuICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnKVxuICAgIG5ldyBSZWdFeHAoXCJbIFxcdCN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV1cIikudGVzdChjaGFyYWN0ZXIpXG5cbiAgaXNOb25Xb3JkQ2hhcmFjdGVyVG9UaGVMZWZ0OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvblN0YXJ0ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICByYW5nZSA9IFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShzZWxlY3Rpb25TdGFydCwgMCwgLTEpXG4gICAgQGlzTm9uV29yZENoYXJhY3RlcihAZ2V0QWN0aXZlRWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKVxuXG4gIGlzTm9uV29yZENoYXJhY3RlclRvVGhlUmlnaHQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uRW5kID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kXG4gICAgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEoc2VsZWN0aW9uRW5kLCAwLCAxKVxuICAgIEBpc05vbldvcmRDaGFyYWN0ZXIoQGdldEFjdGl2ZUVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcblxuICBzZXR1cFN0YXR1c0JhcjogPT5cbiAgICByZXR1cm4gaWYgQHN0YXR1c0JhckVsZW1lbnQ/XG4gICAgcmV0dXJuIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5zaG93SW5TdGF0dXNCYXInKVxuICAgIEBzdGF0dXNCYXJFbGVtZW50ID0gbmV3IFN0YXR1c0JhclZpZXcoKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gQHN0YXR1c0Jhci5hZGRMZWZ0VGlsZShcbiAgICAgIGl0ZW06IEBzdGF0dXNCYXJFbGVtZW50LmdldEVsZW1lbnQoKSwgcHJpb3JpdHk6IDEwMClcblxuICByZW1vdmVTdGF0dXNCYXI6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAc3RhdHVzQmFyRWxlbWVudD9cbiAgICBAc3RhdHVzQmFyVGlsZT8uZGVzdHJveSgpXG4gICAgQHN0YXR1c0JhclRpbGUgPSBudWxsXG4gICAgQHN0YXR1c0JhckVsZW1lbnQgPSBudWxsXG5cbiAgbGlzdGVuRm9yU3RhdHVzQmFyQ2hhbmdlOiA9PlxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdoaWdobGlnaHQtc2VsZWN0ZWQuc2hvd0luU3RhdHVzQmFyJywgKGNoYW5nZWQpID0+XG4gICAgICBpZiBjaGFuZ2VkLm5ld1ZhbHVlXG4gICAgICAgIEBzZXR1cFN0YXR1c0JhcigpXG4gICAgICBlbHNlXG4gICAgICAgIEByZW1vdmVTdGF0dXNCYXIoKVxuIl19
