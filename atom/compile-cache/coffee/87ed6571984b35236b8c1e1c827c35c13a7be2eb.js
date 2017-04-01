(function() {
  var BlockwiseSelection, CompositeDisposable, CursorStyleManager, Delegato, Disposable, Emitter, FlashManager, HighlightSearchManager, HoverManager, MarkManager, ModeManager, MutationManager, OccurrenceManager, OperationStack, PersistentSelectionManager, Range, RegisterManager, SearchHistoryManager, SearchInputElement, VimState, _, assert, assertWithException, getVisibleEditors, jQuery, matchScopes, packageScope, ref, ref1, semver, settings, swrap,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  semver = require('semver');

  Delegato = require('delegato');

  jQuery = require('atom-space-pen-views').jQuery;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  HoverManager = require('./hover-manager');

  SearchInputElement = require('./search-input');

  ref1 = require('./utils'), getVisibleEditors = ref1.getVisibleEditors, matchScopes = ref1.matchScopes, assert = ref1.assert, assertWithException = ref1.assertWithException;

  swrap = require('./selection-wrapper');

  OperationStack = require('./operation-stack');

  MarkManager = require('./mark-manager');

  ModeManager = require('./mode-manager');

  RegisterManager = require('./register-manager');

  SearchHistoryManager = require('./search-history-manager');

  CursorStyleManager = require('./cursor-style-manager');

  BlockwiseSelection = require('./blockwise-selection');

  OccurrenceManager = require('./occurrence-manager');

  HighlightSearchManager = require('./highlight-search-manager');

  MutationManager = require('./mutation-manager');

  PersistentSelectionManager = require('./persistent-selection-manager');

  FlashManager = require('./flash-manager');

  packageScope = 'vim-mode-plus';

  module.exports = VimState = (function() {
    VimState.vimStatesByEditor = new Map;

    VimState.getByEditor = function(editor) {
      return this.vimStatesByEditor.get(editor);
    };

    VimState.forEach = function(fn) {
      return this.vimStatesByEditor.forEach(fn);
    };

    VimState.clear = function() {
      return this.vimStatesByEditor.clear();
    };

    Delegato.includeInto(VimState);

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('flash', 'flashScreenRange', {
      toProperty: 'flashManager'
    });

    VimState.delegatesMethods('subscribe', 'getCount', 'setCount', 'hasCount', 'addToClassList', {
      toProperty: 'operationStack'
    });

    function VimState(editor1, statusBarManager, globalState) {
      var refreshHighlightSearch;
      this.editor = editor1;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.mark = new MarkManager(this);
      this.register = new RegisterManager(this);
      this.hover = new HoverManager(this);
      this.hoverSearchCounter = new HoverManager(this);
      this.searchHistory = new SearchHistoryManager(this);
      this.highlightSearch = new HighlightSearchManager(this);
      this.persistentSelection = new PersistentSelectionManager(this);
      this.occurrenceManager = new OccurrenceManager(this);
      this.mutationManager = new MutationManager(this);
      this.flashManager = new FlashManager(this);
      this.searchInput = new SearchInputElement().initialize(this);
      this.operationStack = new OperationStack(this);
      this.cursorStyleManager = new CursorStyleManager(this);
      this.blockwiseSelections = [];
      this.previousSelection = {};
      this.observeSelections();
      refreshHighlightSearch = (function(_this) {
        return function() {
          return _this.highlightSearch.refresh();
        };
      })(this);
      this.subscriptions.add(this.editor.onDidStopChanging(refreshHighlightSearch));
      this.editorElement.classList.add(packageScope);
      if (this.getConfig('startInInsertMode') || matchScopes(this.editorElement, this.getConfig('startInInsertModeScopes'))) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.subscriptions.add(this.editor.onDidDestroy(this.destroy.bind(this)));
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

    VimState.prototype.assert = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return assert.apply(null, args);
    };

    VimState.prototype.assertWithException = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return assertWithException.apply(null, args);
    };

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.blockwiseSelections;
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return _.last(this.blockwiseSelections);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.getBlockwiseSelections().sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      return this.blockwiseSelections = [];
    };

    VimState.prototype.selectBlockwiseForSelection = function(selection) {
      return this.blockwiseSelections.push(new BlockwiseSelection(selection));
    };

    VimState.prototype.selectBlockwise = function() {
      var i, len, ref2, selection;
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        this.selectBlockwiseForSelection(selection);
      }
      return this.getLastBlockwiseSelection().autoscrollIfReversed();
    };

    VimState.prototype.selectLinewise = function() {
      return swrap.applyWise(this.editor, 'linewise');
    };

    VimState.prototype.toggleClassList = function(className, bool) {
      if (bool == null) {
        bool = void 0;
      }
      return this.editorElement.classList.toggle(className, bool);
    };

    VimState.prototype.swapClassName = function() {
      var classNames, oldMode, ref2;
      classNames = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      oldMode = this.mode;
      this.editorElement.classList.remove(oldMode + "-mode");
      this.editorElement.classList.remove('vim-mode-plus');
      (ref2 = this.editorElement.classList).add.apply(ref2, classNames);
      return new Disposable((function(_this) {
        return function() {
          var ref3;
          (ref3 = _this.editorElement.classList).remove.apply(ref3, classNames);
          if (_this.mode === oldMode) {
            _this.editorElement.classList.add(oldMode + "-mode");
          }
          _this.editorElement.classList.add('vim-mode-plus');
          return _this.editorElement.classList.add('is-focused');
        };
      })(this));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.emitDidSetTarget = function(operator) {
      return this.emitter.emit('did-set-target', operator);
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.emitWillSelectTarget = function() {
      return this.emitter.emit('will-select-target');
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.emitDidSelectTarget = function() {
      return this.emitter.emit('did-select-target');
    };

    VimState.prototype.onDidFailSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-fail-select-target', fn));
    };

    VimState.prototype.emitDidFailSelectTarget = function() {
      return this.emitter.emit('did-fail-select-target');
    };

    VimState.prototype.onWillFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-will-finish-mutation', fn));
    };

    VimState.prototype.emitWillFinishMutation = function() {
      return this.emitter.emit('on-will-finish-mutation');
    };

    VimState.prototype.onDidFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-did-finish-mutation', fn));
    };

    VimState.prototype.emitDidFinishMutation = function() {
      return this.emitter.emit('on-did-finish-mutation');
    };

    VimState.prototype.onDidRestoreCursorPositions = function(fn) {
      return this.subscribe(this.emitter.on('did-restore-cursor-positions', fn));
    };

    VimState.prototype.emitDidRestoreCursorPositions = function() {
      return this.emitter.emit('did-restore-cursor-positions');
    };

    VimState.prototype.onDidSetOperatorModifier = function(fn) {
      return this.subscribe(this.emitter.on('did-set-operator-modifier', fn));
    };

    VimState.prototype.emitDidSetOperatorModifier = function(options) {
      return this.emitter.emit('did-set-operator-modifier', options);
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.emitDidFinishOperation = function() {
      return this.emitter.emit('did-finish-operation');
    };

    VimState.prototype.onDidResetOperationStack = function(fn) {
      return this.subscribe(this.emitter.on('did-reset-operation-stack', fn));
    };

    VimState.prototype.emitDidResetOperationStack = function() {
      return this.emitter.emit('did-reset-operation-stack');
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onWillActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillActivateMode(fn));
    };

    VimState.prototype.onDidActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidActivateMode(fn));
    };

    VimState.prototype.onWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillDeactivateMode(fn));
    };

    VimState.prototype.preemptWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.preemptWillDeactivateMode(fn));
    };

    VimState.prototype.onDidDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidDeactivateMode(fn));
    };

    VimState.prototype.onDidFailToPushToOperationStack = function(fn) {
      return this.emitter.on('did-fail-to-push-to-operation-stack', fn);
    };

    VimState.prototype.emitDidFailToPushToOperationStack = function() {
      return this.emitter.emit('did-fail-to-push-to-operation-stack');
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.onDidSetMark = function(fn) {
      return this.emitter.on('did-set-mark', fn);
    };

    VimState.prototype.onDidSetInputChar = function(fn) {
      return this.emitter.on('did-set-input-char', fn);
    };

    VimState.prototype.emitDidSetInputChar = function(char) {
      return this.emitter.emit('did-set-input-char', char);
    };

    VimState.prototype.isAlive = function() {
      return this.constructor.vimStatesByEditor.has(this.editor);
    };

    VimState.prototype.destroy = function() {
      var ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
      if (!this.isAlive()) {
        return;
      }
      this.constructor.vimStatesByEditor["delete"](this.editor);
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((ref2 = this.editorElement.component) != null) {
          ref2.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((ref3 = this.hover) != null) {
        if (typeof ref3.destroy === "function") {
          ref3.destroy();
        }
      }
      if ((ref4 = this.hoverSearchCounter) != null) {
        if (typeof ref4.destroy === "function") {
          ref4.destroy();
        }
      }
      if ((ref5 = this.searchHistory) != null) {
        if (typeof ref5.destroy === "function") {
          ref5.destroy();
        }
      }
      if ((ref6 = this.cursorStyleManager) != null) {
        if (typeof ref6.destroy === "function") {
          ref6.destroy();
        }
      }
      if ((ref7 = this.search) != null) {
        if (typeof ref7.destroy === "function") {
          ref7.destroy();
        }
      }
      ((ref8 = this.register) != null ? ref8.destroy : void 0) != null;
      ref9 = {}, this.hover = ref9.hover, this.hoverSearchCounter = ref9.hoverSearchCounter, this.operationStack = ref9.operationStack, this.searchHistory = ref9.searchHistory, this.cursorStyleManager = ref9.cursorStyleManager, this.search = ref9.search, this.modeManager = ref9.modeManager, this.register = ref9.register, this.editor = ref9.editor, this.editorElement = ref9.editorElement, this.subscriptions = ref9.subscriptions, this.occurrenceManager = ref9.occurrenceManager, this.previousSelection = ref9.previousSelection, this.persistentSelection = ref9.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.isInterestingEvent = function(arg) {
      var target, type;
      target = arg.target, type = arg.type;
      if (this.mode === 'insert') {
        return false;
      } else {
        return (this.editor != null) && (target != null ? typeof target.closest === "function" ? target.closest('atom-text-editor') : void 0 : void 0) === this.editorElement && !this.isMode('visual', 'blockwise') && !type.startsWith('vim-mode-plus:');
      }
    };

    VimState.prototype.checkSelection = function(event) {
      var i, len, nonEmptySelecitons, selection, wise;
      if (this.operationStack.isProcessing()) {
        return;
      }
      if (!this.isInterestingEvent(event)) {
        return;
      }
      nonEmptySelecitons = this.editor.getSelections().filter(function(selection) {
        return !selection.isEmpty();
      });
      if (nonEmptySelecitons.length) {
        wise = swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          for (i = 0, len = nonEmptySelecitons.length; i < len; i++) {
            selection = nonEmptySelecitons[i];
            if (!swrap(selection).hasProperties()) {
              swrap(selection).saveProperties();
            }
          }
          return this.updateCursorsVisibility();
        } else {
          return this.activate('visual', wise);
        }
      } else {
        if (this.isMode('visual')) {
          return this.activate('normal');
        }
      }
    };

    VimState.prototype.saveProperties = function(event) {
      var i, len, ref2, results, selection;
      if (!this.isInterestingEvent(event)) {
        return;
      }
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(swrap(selection).saveProperties());
      }
      return results;
    };

    VimState.prototype.observeSelections = function() {
      var checkSelection;
      checkSelection = this.checkSelection.bind(this);
      this.editorElement.addEventListener('mouseup', checkSelection);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('mouseup', checkSelection);
        };
      })(this)));
      return this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
    };

    VimState.prototype.clearSelections = function() {
      return this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition());
    };

    VimState.prototype.resetNormalMode = function(arg) {
      var userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      if (userInvocation != null ? userInvocation : false) {
        if (this.editor.hasMultipleCursors()) {
          this.clearSelections();
        } else if (this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')) {
          this.clearPersistentSelections();
        } else if (this.occurrenceManager.hasPatterns()) {
          this.occurrenceManager.resetPatterns();
        }
        if (this.getConfig('clearHighlightSearchOnResetNormalMode')) {
          this.globalState.set('highlightSearchPattern', null);
        }
      } else {
        this.clearSelections();
      }
      return this.activate('normal');
    };

    VimState.prototype.init = function() {
      return this.saveOriginalCursorPosition();
    };

    VimState.prototype.reset = function() {
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      this.operationStack.reset();
      return this.mutationManager.reset();
    };

    VimState.prototype.isVisible = function() {
      var ref2;
      return ref2 = this.editor, indexOf.call(getVisibleEditors(), ref2) >= 0;
    };

    VimState.prototype.updateCursorsVisibility = function() {
      return this.cursorStyleManager.refresh();
    };

    VimState.prototype.updatePreviousSelection = function() {
      var head, properties, ref2, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref2 = this.getLastBlockwiseSelection()) != null ? ref2.getCharacterwiseProperties() : void 0;
      } else {
        properties = swrap(this.editor.getLastSelection()).captureProperties();
      }
      if (properties == null) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThan(tail)) {
        this.mark.setRange('<', '>', [tail, head]);
      } else {
        this.mark.setRange('<', '>', [head, tail]);
      }
      return this.previousSelection = {
        properties: properties,
        submode: this.submode
      };
    };

    VimState.prototype.hasPersistentSelections = function() {
      return this.persistentSelection.hasMarkers();
    };

    VimState.prototype.getPersistentSelectionBufferRanges = function() {
      return this.persistentSelection.getMarkerBufferRanges();
    };

    VimState.prototype.clearPersistentSelections = function() {
      return this.persistentSelection.clearMarkers();
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
      return this.scrollAnimationEffect = jQuery(from).animate(to, options);
    };

    VimState.prototype.finishScrollAnimation = function() {
      var ref2;
      if ((ref2 = this.scrollAnimationEffect) != null) {
        ref2.finish();
      }
      return this.scrollAnimationEffect = null;
    };

    VimState.prototype.saveOriginalCursorPosition = function() {
      var point, ref2, selection;
      this.originalCursorPosition = null;
      if ((ref2 = this.originalCursorPositionByMarker) != null) {
        ref2.destroy();
      }
      if (this.mode === 'visual') {
        selection = this.editor.getLastSelection();
        point = swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      } else {
        point = this.editor.getCursorBufferPosition();
      }
      this.originalCursorPosition = point;
      return this.originalCursorPositionByMarker = this.editor.markBufferPosition(point, {
        invalidate: 'never'
      });
    };

    VimState.prototype.restoreOriginalCursorPosition = function() {
      return this.editor.setCursorBufferPosition(this.getOriginalCursorPosition());
    };

    VimState.prototype.getOriginalCursorPosition = function() {
      return this.originalCursorPosition;
    };

    VimState.prototype.getOriginalCursorPositionByMarker = function() {
      return this.originalCursorPositionByMarker.getStartBufferPosition();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi92aW0tc3RhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4YkFBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNWLFNBQVUsT0FBQSxDQUFRLHNCQUFSOztFQUVYLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxxQkFBRCxFQUFVLDJCQUFWLEVBQXNCLDZDQUF0QixFQUEyQzs7RUFFM0MsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2Ysa0JBQUEsR0FBcUIsT0FBQSxDQUFRLGdCQUFSOztFQUNyQixPQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSwwQ0FERixFQUVFLDhCQUZGLEVBR0Usb0JBSEYsRUFJRTs7RUFFRixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUVSLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUNqQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsZUFBQSxHQUFrQixPQUFBLENBQVEsb0JBQVI7O0VBQ2xCLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwwQkFBUjs7RUFDdkIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSOztFQUNyQixrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVI7O0VBQ3JCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUjs7RUFDcEIsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSOztFQUN6QixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxv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LENBQUEsc0JBQUQsR0FBMEI7YUFDMUIsSUFBQyxDQUFBLDhCQUFELEdBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsS0FBM0IsRUFBa0M7UUFBQSxVQUFBLEVBQVksT0FBWjtPQUFsQztJQVZSOzt1QkFZNUIsNkJBQUEsR0FBK0IsU0FBQTthQUM3QixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLElBQUMsQ0FBQSx5QkFBRCxDQUFBLENBQWhDO0lBRDZCOzt1QkFHL0IseUJBQUEsR0FBMkIsU0FBQTthQUN6QixJQUFDLENBQUE7SUFEd0I7O3VCQUczQixpQ0FBQSxHQUFtQyxTQUFBO2FBQ2pDLElBQUMsQ0FBQSw4QkFBOEIsQ0FBQyxzQkFBaEMsQ0FBQTtJQURpQzs7Ozs7QUEvWHJDIiwic291cmNlc0NvbnRlbnQiOlsic2VtdmVyID0gcmVxdWlyZSAnc2VtdmVyJ1xuRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbntqUXVlcnl9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuSG92ZXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9ob3Zlci1tYW5hZ2VyJ1xuU2VhcmNoSW5wdXRFbGVtZW50ID0gcmVxdWlyZSAnLi9zZWFyY2gtaW5wdXQnXG57XG4gIGdldFZpc2libGVFZGl0b3JzXG4gIG1hdGNoU2NvcGVzXG4gIGFzc2VydFxuICBhc3NlcnRXaXRoRXhjZXB0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuT3BlcmF0aW9uU3RhY2sgPSByZXF1aXJlICcuL29wZXJhdGlvbi1zdGFjaydcbk1hcmtNYW5hZ2VyID0gcmVxdWlyZSAnLi9tYXJrLW1hbmFnZXInXG5Nb2RlTWFuYWdlciA9IHJlcXVpcmUgJy4vbW9kZS1tYW5hZ2VyJ1xuUmVnaXN0ZXJNYW5hZ2VyID0gcmVxdWlyZSAnLi9yZWdpc3Rlci1tYW5hZ2VyJ1xuU2VhcmNoSGlzdG9yeU1hbmFnZXIgPSByZXF1aXJlICcuL3NlYXJjaC1oaXN0b3J5LW1hbmFnZXInXG5DdXJzb3JTdHlsZU1hbmFnZXIgPSByZXF1aXJlICcuL2N1cnNvci1zdHlsZS1tYW5hZ2VyJ1xuQmxvY2t3aXNlU2VsZWN0aW9uID0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuT2NjdXJyZW5jZU1hbmFnZXIgPSByZXF1aXJlICcuL29jY3VycmVuY2UtbWFuYWdlcidcbkhpZ2hsaWdodFNlYXJjaE1hbmFnZXIgPSByZXF1aXJlICcuL2hpZ2hsaWdodC1zZWFyY2gtbWFuYWdlcidcbk11dGF0aW9uTWFuYWdlciA9IHJlcXVpcmUgJy4vbXV0YXRpb24tbWFuYWdlcidcblBlcnNpc3RlbnRTZWxlY3Rpb25NYW5hZ2VyID0gcmVxdWlyZSAnLi9wZXJzaXN0ZW50LXNlbGVjdGlvbi1tYW5hZ2VyJ1xuRmxhc2hNYW5hZ2VyID0gcmVxdWlyZSAnLi9mbGFzaC1tYW5hZ2VyJ1xuXG5wYWNrYWdlU2NvcGUgPSAndmltLW1vZGUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVmltU3RhdGVcbiAgQHZpbVN0YXRlc0J5RWRpdG9yOiBuZXcgTWFwXG5cbiAgQGdldEJ5RWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5nZXQoZWRpdG9yKVxuXG4gIEBmb3JFYWNoOiAoZm4pIC0+XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yLmZvckVhY2goZm4pXG5cbiAgQGNsZWFyOiAtPlxuICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5jbGVhcigpXG5cbiAgRGVsZWdhdG8uaW5jbHVkZUludG8odGhpcylcblxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICdtb2RlTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdpc01vZGUnLCAnYWN0aXZhdGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnZmxhc2gnLCAnZmxhc2hTY3JlZW5SYW5nZScsIHRvUHJvcGVydHk6ICdmbGFzaE1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnc3Vic2NyaWJlJywgJ2dldENvdW50JywgJ3NldENvdW50JywgJ2hhc0NvdW50JywgJ2FkZFRvQ2xhc3NMaXN0JywgdG9Qcm9wZXJ0eTogJ29wZXJhdGlvblN0YWNrJylcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEBzdGF0dXNCYXJNYW5hZ2VyLCBAZ2xvYmFsU3RhdGUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQgPSBAZWRpdG9yLmVsZW1lbnRcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBtb2RlTWFuYWdlciA9IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgIEBtYXJrID0gbmV3IE1hcmtNYW5hZ2VyKHRoaXMpXG4gICAgQHJlZ2lzdGVyID0gbmV3IFJlZ2lzdGVyTWFuYWdlcih0aGlzKVxuICAgIEBob3ZlciA9IG5ldyBIb3Zlck1hbmFnZXIodGhpcylcbiAgICBAaG92ZXJTZWFyY2hDb3VudGVyID0gbmV3IEhvdmVyTWFuYWdlcih0aGlzKVxuICAgIEBzZWFyY2hIaXN0b3J5ID0gbmV3IFNlYXJjaEhpc3RvcnlNYW5hZ2VyKHRoaXMpXG4gICAgQGhpZ2hsaWdodFNlYXJjaCA9IG5ldyBIaWdobGlnaHRTZWFyY2hNYW5hZ2VyKHRoaXMpXG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24gPSBuZXcgUGVyc2lzdGVudFNlbGVjdGlvbk1hbmFnZXIodGhpcylcbiAgICBAb2NjdXJyZW5jZU1hbmFnZXIgPSBuZXcgT2NjdXJyZW5jZU1hbmFnZXIodGhpcylcbiAgICBAbXV0YXRpb25NYW5hZ2VyID0gbmV3IE11dGF0aW9uTWFuYWdlcih0aGlzKVxuICAgIEBmbGFzaE1hbmFnZXIgPSBuZXcgRmxhc2hNYW5hZ2VyKHRoaXMpXG5cbiAgICBAc2VhcmNoSW5wdXQgPSBuZXcgU2VhcmNoSW5wdXRFbGVtZW50KCkuaW5pdGlhbGl6ZSh0aGlzKVxuXG4gICAgQG9wZXJhdGlvblN0YWNrID0gbmV3IE9wZXJhdGlvblN0YWNrKHRoaXMpXG4gICAgQGN1cnNvclN0eWxlTWFuYWdlciA9IG5ldyBDdXJzb3JTdHlsZU1hbmFnZXIodGhpcylcbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9ucyA9IFtdXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge31cbiAgICBAb2JzZXJ2ZVNlbGVjdGlvbnMoKVxuXG4gICAgcmVmcmVzaEhpZ2hsaWdodFNlYXJjaCA9ID0+XG4gICAgICBAaGlnaGxpZ2h0U2VhcmNoLnJlZnJlc2goKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nKHJlZnJlc2hIaWdobGlnaHRTZWFyY2gpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKHBhY2thZ2VTY29wZSlcbiAgICBpZiBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZScpIG9yIG1hdGNoU2NvcGVzKEBlZGl0b3JFbGVtZW50LCBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZVNjb3BlcycpKVxuICAgICAgQGFjdGl2YXRlKCdpbnNlcnQnKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuICAgIEBjb25zdHJ1Y3Rvci52aW1TdGF0ZXNCeUVkaXRvci5zZXQoQGVkaXRvciwgdGhpcylcblxuICBhc3NlcnQ6IChhcmdzLi4uKSAtPlxuICAgIGFzc2VydChhcmdzLi4uKVxuXG4gIGFzc2VydFdpdGhFeGNlcHRpb246IChhcmdzLi4uKSAtPlxuICAgIGFzc2VydFdpdGhFeGNlcHRpb24oYXJncy4uLilcblxuICBnZXRDb25maWc6IChwYXJhbSkgLT5cbiAgICBzZXR0aW5ncy5nZXQocGFyYW0pXG5cbiAgIyBCbG9ja3dpc2VTZWxlY3Rpb25zXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zOiAtPlxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zXG5cbiAgZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbjogLT5cbiAgICBfLmxhc3QoQGJsb2Nrd2lzZVNlbGVjdGlvbnMpXG5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBnZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkuc29ydCAoYSwgYikgLT5cbiAgICAgIGEuZ2V0U3RhcnRTZWxlY3Rpb24oKS5jb21wYXJlKGIuZ2V0U3RhcnRTZWxlY3Rpb24oKSlcblxuICBjbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnMgPSBbXVxuXG4gIHNlbGVjdEJsb2Nrd2lzZUZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9ucy5wdXNoKG5ldyBCbG9ja3dpc2VTZWxlY3Rpb24oc2VsZWN0aW9uKSlcblxuICBzZWxlY3RCbG9ja3dpc2U6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNlbGVjdEJsb2Nrd2lzZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgQGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsSWZSZXZlcnNlZCgpXG5cbiAgIyBPdGhlclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2VsZWN0TGluZXdpc2U6IC0+XG4gICAgc3dyYXAuYXBwbHlXaXNlKEBlZGl0b3IsICdsaW5ld2lzZScpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRvZ2dsZUNsYXNzTGlzdDogKGNsYXNzTmFtZSwgYm9vbD11bmRlZmluZWQpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUsIGJvb2wpXG5cbiAgIyBGSVhNRTogSSB3YW50IHRvIHJlbW92ZSB0aGlzIGRlbmdlcmlvdXMgYXBwcm9hY2gsIGJ1dCBJIGNvdWxkbid0IGZpbmQgdGhlIGJldHRlciB3YXkuXG4gIHN3YXBDbGFzc05hbWU6IChjbGFzc05hbWVzLi4uKSAtPlxuICAgIG9sZE1vZGUgPSBAbW9kZVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShvbGRNb2RlICsgXCItbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lcy4uLilcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZXMuLi4pXG4gICAgICBpZiBAbW9kZSBpcyBvbGRNb2RlXG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQob2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtZm9jdXNlZCcpXG5cbiAgIyBBbGwgc3Vic2NyaXB0aW9ucyBoZXJlIGlzIGNlbGFyZWQgb24gZWFjaCBvcGVyYXRpb24gZmluaXNoZWQuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZENoYW5nZVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENoYW5nZShmbilcbiAgb25EaWRDb25maXJtU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29uZmlybShmbilcbiAgb25EaWRDYW5jZWxTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDYW5jZWwoZm4pXG4gIG9uRGlkQ29tbWFuZFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbW1hbmQoZm4pXG5cbiAgIyBTZWxlY3QgYW5kIHRleHQgbXV0YXRpb24oQ2hhbmdlKVxuICBvbkRpZFNldFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2V0VGFyZ2V0OiAob3BlcmF0b3IpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtdGFyZ2V0Jywgb3BlcmF0b3IpXG5cbiAgb25XaWxsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ3dpbGwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnd2lsbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnM6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXJlc3RvcmUtY3Vyc29yLXBvc2l0aW9ucycsIGZuKVxuICBlbWl0RGlkUmVzdG9yZUN1cnNvclBvc2l0aW9uczogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXJlc3RvcmUtY3Vyc29yLXBvc2l0aW9ucycpXG5cbiAgb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBmbilcbiAgZW1pdERpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChvcHRpb25zKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LW9wZXJhdG9yLW1vZGlmaWVyJywgb3B0aW9ucylcblxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbjogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtZmluaXNoLW9wZXJhdGlvbicsIGZuKVxuICBlbWl0RGlkRmluaXNoT3BlcmF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLW9wZXJhdGlvbicpXG5cbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snLCBmbilcbiAgZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1yZXNldC1vcGVyYXRpb24tc3RhY2snKVxuXG4gICMgU2VsZWN0IGxpc3Qgdmlld1xuICBvbkRpZENvbmZpcm1TZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jb25maXJtLXNlbGVjdC1saXN0JywgZm4pXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtY2FuY2VsLXNlbGVjdC1saXN0JywgZm4pXG5cbiAgIyBQcm94eWluZyBtb2RlTWFuZ2VyJ3MgZXZlbnQgaG9vayB3aXRoIHNob3J0LWxpZmUgc3Vic2NyaXB0aW9uLlxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsQWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZEFjdGl2YXRlTW9kZShmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIub25XaWxsRGVhY3RpdmF0ZU1vZGUoZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQHN1YnNjcmliZSBAbW9kZU1hbmFnZXIucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbkRpZERlYWN0aXZhdGVNb2RlKGZuKVxuXG4gICMgRXZlbnRzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZEZhaWxUb1B1c2hUb09wZXJhdGlvblN0YWNrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtZmFpbC10by1wdXNoLXRvLW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJylcblxuICBvbkRpZERlc3Ryb3k6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgZm4pXG5cbiAgIyAqIGBmbmAge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiBtYXJrIHdhcyBzZXQuXG4gICMgICAqIGBuYW1lYCBOYW1lIG9mIG1hcmsgc3VjaCBhcyAnYScuXG4gICMgICAqIGBidWZmZXJQb3NpdGlvbmA6IGJ1ZmZlclBvc2l0aW9uIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYGVkaXRvcmA6IGVkaXRvciB3aGVyZSBtYXJrIHdhcyBzZXQuXG4gICMgUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgI1xuICAjICBVc2FnZTpcbiAgIyAgIG9uRGlkU2V0TWFyayAoe25hbWUsIGJ1ZmZlclBvc2l0aW9ufSkgLT4gZG8gc29tZXRoaW5nLi5cbiAgb25EaWRTZXRNYXJrOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LW1hcmsnLCBmbilcblxuICBvbkRpZFNldElucHV0Q2hhcjogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLXNldC1pbnB1dC1jaGFyJywgZm4pXG4gIGVtaXREaWRTZXRJbnB1dENoYXI6IChjaGFyKSAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2V0LWlucHV0LWNoYXInLCBjaGFyKVxuXG4gIGlzQWxpdmU6IC0+XG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmhhcyhAZWRpdG9yKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBbGl2ZSgpXG4gICAgQGNvbnN0cnVjdG9yLnZpbVN0YXRlc0J5RWRpdG9yLmRlbGV0ZShAZWRpdG9yKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiBAZWRpdG9yLmlzQWxpdmUoKVxuICAgICAgQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAcmVzZXQoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUocGFja2FnZVNjb3BlLCAnbm9ybWFsLW1vZGUnKVxuXG4gICAgQGhvdmVyPy5kZXN0cm95PygpXG4gICAgQGhvdmVyU2VhcmNoQ291bnRlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2hIaXN0b3J5Py5kZXN0cm95PygpXG4gICAgQGN1cnNvclN0eWxlTWFuYWdlcj8uZGVzdHJveT8oKVxuICAgIEBzZWFyY2g/LmRlc3Ryb3k/KClcbiAgICBAcmVnaXN0ZXI/LmRlc3Ryb3k/XG4gICAge1xuICAgICAgQGhvdmVyLCBAaG92ZXJTZWFyY2hDb3VudGVyLCBAb3BlcmF0aW9uU3RhY2ssXG4gICAgICBAc2VhcmNoSGlzdG9yeSwgQGN1cnNvclN0eWxlTWFuYWdlclxuICAgICAgQHNlYXJjaCwgQG1vZGVNYW5hZ2VyLCBAcmVnaXN0ZXJcbiAgICAgIEBlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAc3Vic2NyaXB0aW9ucyxcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlclxuICAgICAgQHByZXZpb3VzU2VsZWN0aW9uXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvblxuICAgIH0gPSB7fVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95J1xuXG4gIGlzSW50ZXJlc3RpbmdFdmVudDogKHt0YXJnZXQsIHR5cGV9KSAtPlxuICAgIGlmIEBtb2RlIGlzICdpbnNlcnQnXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3I/IGFuZFxuICAgICAgICB0YXJnZXQ/LmNsb3Nlc3Q/KCdhdG9tLXRleHQtZWRpdG9yJykgaXMgQGVkaXRvckVsZW1lbnQgYW5kXG4gICAgICAgIG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJykgYW5kXG4gICAgICAgIG5vdCB0eXBlLnN0YXJ0c1dpdGgoJ3ZpbS1tb2RlLXBsdXM6JylcblxuICBjaGVja1NlbGVjdGlvbjogKGV2ZW50KSAtPlxuICAgIHJldHVybiBpZiBAb3BlcmF0aW9uU3RhY2suaXNQcm9jZXNzaW5nKClcbiAgICByZXR1cm4gdW5sZXNzIEBpc0ludGVyZXN0aW5nRXZlbnQoZXZlbnQpXG5cbiAgICBub25FbXB0eVNlbGVjaXRvbnMgPSBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5maWx0ZXIgKHNlbGVjdGlvbikgLT4gbm90IHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICBpZiBub25FbXB0eVNlbGVjaXRvbnMubGVuZ3RoXG4gICAgICB3aXNlID0gc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJywgd2lzZSlcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBub25FbXB0eVNlbGVjaXRvbnMgd2hlbiBub3Qgc3dyYXAoc2VsZWN0aW9uKS5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgICBzd3JhcChzZWxlY3Rpb24pLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgQHVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcbiAgICAgIGVsc2VcbiAgICAgICAgQGFjdGl2YXRlKCd2aXN1YWwnLCB3aXNlKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZSgnbm9ybWFsJykgaWYgQGlzTW9kZSgndmlzdWFsJylcblxuICBzYXZlUHJvcGVydGllczogKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGlzSW50ZXJlc3RpbmdFdmVudChldmVudClcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzd3JhcChzZWxlY3Rpb24pLnNhdmVQcm9wZXJ0aWVzKClcblxuICBvYnNlcnZlU2VsZWN0aW9uczogLT5cbiAgICBjaGVja1NlbGVjdGlvbiA9IEBjaGVja1NlbGVjdGlvbi5iaW5kKHRoaXMpXG4gICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGNoZWNrU2VsZWN0aW9uKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGNoZWNrU2VsZWN0aW9uKVxuXG4gICAgIyBbRklYTUVdXG4gICAgIyBIb3ZlciBwb3NpdGlvbiBnZXQgd2lyZWQgd2hlbiBmb2N1cy1jaGFuZ2UgYmV0d2VlbiBtb3JlIHRoYW4gdHdvIHBhbmUuXG4gICAgIyBjb21tZW50aW5nIG91dCBpcyBmYXIgYmV0dGVyIHRoYW4gaW50cm9kdWNpbmcgQnVnZ3kgYmVoYXZpb3IuXG4gICAgIyBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbldpbGxEaXNwYXRjaChzYXZlUHJvcGVydGllcylcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoKGNoZWNrU2VsZWN0aW9uKVxuXG4gICMgV2hhdCdzIHRoaXM/XG4gICMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGRvZXNuJ3QgcmVzcGVjdCBsYXN0Q3Vyc29yIHBvc2l0b2luLlxuICAjIFRoaXMgbWV0aG9kIHdvcmtzIGluIHNhbWUgd2F5IGFzIGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKSBidXQgcmVzcGVjdCBsYXN0IGN1cnNvciBwb3NpdGlvbi5cbiAgY2xlYXJTZWxlY3Rpb25zOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuXG4gIHJlc2V0Tm9ybWFsTW9kZTogKHt1c2VySW52b2NhdGlvbn09e30pIC0+XG4gICAgaWYgdXNlckludm9jYXRpb24gPyBmYWxzZVxuICAgICAgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxuICAgICAgICBAY2xlYXJTZWxlY3Rpb25zKClcblxuICAgICAgZWxzZSBpZiBAaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKSBhbmQgQGdldENvbmZpZygnY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICBAY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG4gICAgICBlbHNlIGlmIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNQYXR0ZXJucygpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcblxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZScpXG4gICAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgIGVsc2VcbiAgICAgIEBjbGVhclNlbGVjdGlvbnMoKVxuICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICBpbml0OiAtPlxuICAgIEBzYXZlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQHJlZ2lzdGVyLnJlc2V0KClcbiAgICBAc2VhcmNoSGlzdG9yeS5yZXNldCgpXG4gICAgQGhvdmVyLnJlc2V0KClcbiAgICBAb3BlcmF0aW9uU3RhY2sucmVzZXQoKVxuICAgIEBtdXRhdGlvbk1hbmFnZXIucmVzZXQoKVxuXG4gIGlzVmlzaWJsZTogLT5cbiAgICBAZWRpdG9yIGluIGdldFZpc2libGVFZGl0b3JzKClcblxuICB1cGRhdGVDdXJzb3JzVmlzaWJpbGl0eTogLT5cbiAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyLnJlZnJlc2goKVxuXG4gIHVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uOiAtPiAjIEZJWE1FOiBuYW1pbmcsIHVwZGF0ZUxhc3RTZWxlY3RlZEluZm8gP1xuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgcHJvcGVydGllcyA9IEBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LmdldENoYXJhY3Rlcndpc2VQcm9wZXJ0aWVzKClcbiAgICBlbHNlXG4gICAgICBwcm9wZXJ0aWVzID0gc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmNhcHR1cmVQcm9wZXJ0aWVzKClcblxuICAgIHJldHVybiB1bmxlc3MgcHJvcGVydGllcz9cblxuICAgIHtoZWFkLCB0YWlsfSA9IHByb3BlcnRpZXNcbiAgICBpZiBoZWFkLmlzR3JlYXRlclRoYW4odGFpbClcbiAgICAgIEBtYXJrLnNldFJhbmdlKCc8JywgJz4nLCBbdGFpbCwgaGVhZF0pXG4gICAgZWxzZVxuICAgICAgQG1hcmsuc2V0UmFuZ2UoJzwnLCAnPicsIFtoZWFkLCB0YWlsXSlcbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7cHJvcGVydGllcywgQHN1Ym1vZGV9XG5cbiAgIyBQZXJzaXN0ZW50IHNlbGVjdGlvblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uaGFzTWFya2VycygpXG5cbiAgZ2V0UGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlczogLT5cbiAgICBAcGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbnM6IC0+XG4gICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uY2xlYXJNYXJrZXJzKClcblxuICAjIEFuaW1hdGlvbiBtYW5hZ2VtZW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzY3JvbGxBbmltYXRpb25FZmZlY3Q6IG51bGxcbiAgcmVxdWVzdFNjcm9sbEFuaW1hdGlvbjogKGZyb20sIHRvLCBvcHRpb25zKSAtPlxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3QgPSBqUXVlcnkoZnJvbSkuYW5pbWF0ZSh0bywgb3B0aW9ucylcblxuICBmaW5pc2hTY3JvbGxBbmltYXRpb246IC0+XG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdD8uZmluaXNoKClcbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0ID0gbnVsbFxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNhdmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uID0gbnVsbFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXI/LmRlc3Ryb3koKVxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpXG4gICAgICBwb2ludCA9IHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuICAgIGVsc2VcbiAgICAgIHBvaW50ID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb24gPSBwb2ludFxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihwb2ludCwgaW52YWxpZGF0ZTogJ25ldmVyJylcblxuICByZXN0b3JlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKEBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvblxuXG4gIGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlcjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyLmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuIl19
