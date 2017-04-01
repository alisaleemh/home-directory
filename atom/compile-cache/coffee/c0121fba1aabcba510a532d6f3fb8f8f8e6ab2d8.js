(function() {
  var Base, CompositeDisposable, Delegato, Input, OperationAbortedError, _, getEditorState, getFirstCharacterPositionForBufferRow, getVimEofBufferPosition, getVimLastBufferRow, getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition, ref, scanEditorInDirection, selectList, swrap, vimStateMethods,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('./utils'), getVimEofBufferPosition = ref.getVimEofBufferPosition, getVimLastBufferRow = ref.getVimLastBufferRow, getVimLastScreenRow = ref.getVimLastScreenRow, getWordBufferRangeAndKindAtBufferPosition = ref.getWordBufferRangeAndKindAtBufferPosition, getFirstCharacterPositionForBufferRow = ref.getFirstCharacterPositionForBufferRow, scanEditorInDirection = ref.scanEditorInDirection;

  swrap = require('./selection-wrapper');

  Input = require('./input');

  selectList = null;

  getEditorState = null;

  OperationAbortedError = require('./errors').OperationAbortedError;

  vimStateMethods = ["assert", "assertWithException", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onDidRestoreCursorPositions", "emitDidRestoreCursorPositions", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    function Base(vimState1, properties) {
      var ref1;
      this.vimState = vimState1;
      if (properties == null) {
        properties = null;
      }
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState;
      if (properties != null) {
        _.extend(this, properties);
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var ref1;
      if (this.isRequireInput() && !this.hasInput()) {
        return false;
      } else if (this.isRequireTarget()) {
        return (ref1 = this.getTarget()) != null ? typeof ref1.isComplete === "function" ? ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.target = null;

    Base.prototype.hasTarget = function() {
      return this.target != null;
    };

    Base.prototype.getTarget = function() {
      return this.target;
    };

    Base.prototype.requireTarget = false;

    Base.prototype.isRequireTarget = function() {
      return this.requireTarget;
    };

    Base.prototype.requireInput = false;

    Base.prototype.isRequireInput = function() {
      return this.requireInput;
    };

    Base.prototype.recordable = false;

    Base.prototype.isRecordable = function() {
      return this.recordable;
    };

    Base.prototype.repeated = false;

    Base.prototype.isRepeated = function() {
      return this.repeated;
    };

    Base.prototype.setRepeated = function() {
      return this.repeated = true;
    };

    Base.prototype.operator = null;

    Base.prototype.getOperator = function() {
      return this.operator;
    };

    Base.prototype.setOperator = function(operator) {
      this.operator = operator;
      return this.operator;
    };

    Base.prototype.isAsTargetExceptSelect = function() {
      return (this.operator != null) && !this.operator["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      throw new OperationAbortedError('aborted');
    };

    Base.prototype.count = null;

    Base.prototype.defaultCount = 1;

    Base.prototype.getCount = function(offset) {
      var ref1;
      if (offset == null) {
        offset = 0;
      }
      if (this.count == null) {
        this.count = (ref1 = this.vimState.getCount()) != null ? ref1 : this.defaultCount;
      }
      return this.count + offset;
    };

    Base.prototype.resetCount = function() {
      return this.count = null;
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.defaultCount;
    };

    Base.prototype.countTimes = function(last, fn) {
      var count, i, isFinal, ref1, results, stop, stopped;
      if (last < 1) {
        return;
      }
      stopped = false;
      stop = function() {
        return stopped = true;
      };
      results = [];
      for (count = i = 1, ref1 = last; 1 <= ref1 ? i <= ref1 : i >= ref1; count = 1 <= ref1 ? ++i : --i) {
        isFinal = count === last;
        fn({
          count: count,
          isFinal: isFinal,
          stop: stop
        });
        if (stopped) {
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.activateModeIfNecessary = function(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        return this.activateMode(mode, submode);
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.newInputUI = function() {
      return new Input(this.vimState);
    };

    Base.prototype.clone = function(vimState) {
      var excludeProperties, key, klass, properties, ref1, value;
      properties = {};
      excludeProperties = ['editor', 'editorElement', 'globalState', 'vimState', 'operator'];
      ref1 = this;
      for (key in ref1) {
        if (!hasProp.call(ref1, key)) continue;
        value = ref1[key];
        if (indexOf.call(excludeProperties, key) < 0) {
          properties[key] = value;
        }
      }
      klass = this.constructor;
      return new klass(vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.hasInput = function() {
      return this.input != null;
    };

    Base.prototype.getInput = function() {
      return this.input;
    };

    Base.prototype.focusInput = function(charsMax) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input1) {
          _this.input = input1;
          return _this.processOperation();
        };
      })(this));
      if (charsMax > 1) {
        inputUI.onDidChange((function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this));
      }
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus(charsMax);
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return getVimLastScreenRow(this.editor);
    };

    Base.prototype.getWordBufferRangeAndKindAtBufferPosition = function(point, options) {
      return getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    };

    Base.prototype.getFirstCharacterPositionForBufferRow = function(row) {
      return getFirstCharacterPositionForBufferRow(this.editor, row);
    };

    Base.prototype.scanForward = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return scanEditorInDirection.apply(null, [this.editor, 'forward'].concat(slice.call(args)));
    };

    Base.prototype.scanBackward = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return scanEditorInDirection.apply(null, [this.editor, 'backward'].concat(slice.call(args)));
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.is = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this["instanceof"]('Operator');
    };

    Base.prototype.isMotion = function() {
      return this["instanceof"]('Motion');
    };

    Base.prototype.isTextObject = function() {
      return this["instanceof"]('TextObject');
    };

    Base.prototype.getName = function() {
      return this.constructor.name;
    };

    Base.prototype.getCursorBufferPosition = function() {
      if (this.isMode('visual')) {
        return this.getCursorPositionForSelection(this.editor.getLastSelection());
      } else {
        return this.editor.getCursorBufferPosition();
      }
    };

    Base.prototype.getCursorBufferPositions = function() {
      if (this.isMode('visual')) {
        return this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this));
      } else {
        return this.editor.getCursorBufferPositions();
      }
    };

    Base.prototype.getBufferPositionForCursor = function(cursor) {
      if (this.isMode('visual')) {
        return this.getCursorPositionForSelection(cursor.selection);
      } else {
        return cursor.getBufferPosition();
      }
    };

    Base.prototype.getCursorPositionForSelection = function(selection) {
      return swrap(selection).getBufferPositionFor('head', {
        from: ['property', 'selection']
      });
    };

    Base.prototype.toString = function() {
      var str;
      str = this.getName();
      if (this.hasTarget()) {
        str += ", target=" + (this.getTarget().toString());
      }
      return str;
    };

    Base.init = function(service) {
      var __, klass, ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './insert-mode', './misc-command'].forEach(require);
      ref1 = this.getRegistries();
      for (__ in ref1) {
        klass = ref1[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var __, klass, ref1, results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      ref1 = this.getRegistries();
      results = [];
      for (__ in ref1) {
        klass = ref1[__];
        if (klass.isCommand()) {
          results.push(this.subscriptions.add(klass.registerCommand()));
        }
      }
      return results;
    };

    registries = {
      Base: Base
    };

    Base.extend = function(command) {
      this.command = command != null ? command : true;
      if ((this.name in registries) && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getClass = function(name) {
      var klass;
      if ((klass = registries[name]) != null) {
        return klass;
      } else {
        throw new Error("class '" + name + "' not found");
      }
    };

    Base.getRegistries = function() {
      return registries;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _.dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _.dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      var klass;
      klass = this;
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          vimState._event = event;
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseVNBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNWLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFPSSxPQUFBLENBQVEsU0FBUixDQVBKLEVBQ0UscURBREYsRUFFRSw2Q0FGRixFQUdFLDZDQUhGLEVBSUUseUZBSkYsRUFLRSxpRkFMRixFQU1FOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUNSLFVBQUEsR0FBYTs7RUFDYixjQUFBLEdBQWlCOztFQUNoQix3QkFBeUIsT0FBQSxDQUFRLFVBQVI7O0VBRTFCLGVBQUEsR0FBa0IsQ0FDaEIsUUFEZ0IsRUFFaEIscUJBRmdCLEVBR2hCLG1CQUhnQixFQUloQixvQkFKZ0IsRUFLaEIsbUJBTGdCLEVBTWhCLG9CQU5nQixFQVNoQixnQkFUZ0IsRUFVaEIsa0JBVmdCLEVBV1osb0JBWFksRUFZWixzQkFaWSxFQWFaLG1CQWJZLEVBY1oscUJBZFksRUFnQlosdUJBaEJZLEVBaUJaLHlCQWpCWSxFQW1CWiw2QkFuQlksRUFvQlosK0JBcEJZLEVBcUJkLHNCQXJCYyxFQXNCZCx3QkF0QmMsRUF1QmQscUJBdkJjLEVBd0JkLHVCQXhCYyxFQXlCaEIsc0JBekJnQixFQTBCaEIsMEJBMUJnQixFQTRCaEIsMEJBNUJnQixFQThCaEIsb0JBOUJnQixFQStCaEIsbUJBL0JnQixFQWdDaEIsMkJBaENnQixFQWlDaEIsc0JBakNnQixFQWtDaEIscUJBbENnQixFQW9DaEIsdUJBcENnQixFQXFDaEIsV0FyQ2dCLEVBc0NoQixR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LElBQUMsQ0FBQSxlQUFELEdBQWtCLFNBQUE7QUFDaEIsVUFBQTtNQUFBLEtBQUEsR0FBUTthQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsZUFBRCxDQUFBLENBQWxCLEVBQXNDLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBdEMsRUFBeUQsU0FBQyxLQUFEO0FBQ3ZELFlBQUE7UUFBQSxRQUFBLDZEQUF5QyxjQUFBLENBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQWY7UUFDekMsSUFBRyxnQkFBSDtVQUNFLFFBQVEsQ0FBQyxNQUFULEdBQWtCO1VBQ2xCLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBeEIsQ0FBNEIsS0FBNUIsRUFGRjs7ZUFHQSxLQUFLLENBQUMsZUFBTixDQUFBO01BTHVELENBQXpEO0lBRmdCOzs7Ozs7RUFTcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF2VWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvblxuICBnZXRWaW1MYXN0QnVmZmVyUm93XG4gIGdldFZpbUxhc3RTY3JlZW5Sb3dcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvd1xuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuSW5wdXQgPSByZXF1aXJlICcuL2lucHV0J1xuc2VsZWN0TGlzdCA9IG51bGxcbmdldEVkaXRvclN0YXRlID0gbnVsbCAjIHNldCBieSBCYXNlLmluaXQoKVxue09wZXJhdGlvbkFib3J0ZWRFcnJvcn0gPSByZXF1aXJlICcuL2Vycm9ycydcblxudmltU3RhdGVNZXRob2RzID0gW1xuICBcImFzc2VydFwiXG4gIFwiYXNzZXJ0V2l0aEV4Y2VwdGlvblwiXG4gIFwib25EaWRDaGFuZ2VTZWFyY2hcIlxuICBcIm9uRGlkQ29uZmlybVNlYXJjaFwiXG4gIFwib25EaWRDYW5jZWxTZWFyY2hcIlxuICBcIm9uRGlkQ29tbWFuZFNlYXJjaFwiXG5cbiAgIyBMaWZlIGN5Y2xlXG4gIFwib25EaWRTZXRUYXJnZXRcIlxuICBcImVtaXREaWRTZXRUYXJnZXRcIlxuICAgICAgXCJvbldpbGxTZWxlY3RUYXJnZXRcIlxuICAgICAgXCJlbWl0V2lsbFNlbGVjdFRhcmdldFwiXG4gICAgICBcIm9uRGlkU2VsZWN0VGFyZ2V0XCJcbiAgICAgIFwiZW1pdERpZFNlbGVjdFRhcmdldFwiXG5cbiAgICAgIFwib25EaWRGYWlsU2VsZWN0VGFyZ2V0XCJcbiAgICAgIFwiZW1pdERpZEZhaWxTZWxlY3RUYXJnZXRcIlxuXG4gICAgICBcIm9uRGlkUmVzdG9yZUN1cnNvclBvc2l0aW9uc1wiXG4gICAgICBcImVtaXREaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zXCJcbiAgICBcIm9uV2lsbEZpbmlzaE11dGF0aW9uXCJcbiAgICBcImVtaXRXaWxsRmluaXNoTXV0YXRpb25cIlxuICAgIFwib25EaWRGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJlbWl0RGlkRmluaXNoTXV0YXRpb25cIlxuICBcIm9uRGlkRmluaXNoT3BlcmF0aW9uXCJcbiAgXCJvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2tcIlxuXG4gIFwib25EaWRTZXRPcGVyYXRvck1vZGlmaWVyXCJcblxuICBcIm9uV2lsbEFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWRBY3RpdmF0ZU1vZGVcIlxuICBcInByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGVcIlxuICBcIm9uV2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbkRpZERlYWN0aXZhdGVNb2RlXCJcblxuICBcIm9uRGlkQ2FuY2VsU2VsZWN0TGlzdFwiXG4gIFwic3Vic2NyaWJlXCJcbiAgXCJpc01vZGVcIlxuICBcImdldEJsb2Nrd2lzZVNlbGVjdGlvbnNcIlxuICBcImdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb25cIlxuICBcImFkZFRvQ2xhc3NMaXN0XCJcbiAgXCJnZXRDb25maWdcIlxuXVxuXG5jbGFzcyBCYXNlXG4gIERlbGVnYXRvLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKHZpbVN0YXRlTWV0aG9kcy4uLiwgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgcHJvcGVydGllcz1udWxsKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlfSA9IEB2aW1TdGF0ZVxuICAgIF8uZXh0ZW5kKHRoaXMsIHByb3BlcnRpZXMpIGlmIHByb3BlcnRpZXM/XG5cbiAgIyBUbyBvdmVycmlkZVxuICBpbml0aWFsaXplOiAtPlxuXG4gICMgT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gICMgSWYgZmFsc2UsIG9wZXJhdGlvbiBwcm9jZXNzb3IgcG9zdHBvbmUgaXRzIGV4ZWN1dGlvbi5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBpZiBAaXNSZXF1aXJlSW5wdXQoKSBhbmQgbm90IEBoYXNJbnB1dCgpXG4gICAgICBmYWxzZVxuICAgIGVsc2UgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICAjIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgICMgdGFnZXJ0IGlzIHN0aWxsIHN0cmluZyBsaWtlIGBNb3ZlVG9SaWdodGAsIGluIHRoaXMgY2FzZSBpc0NvbXBsZXRlXG4gICAgICAjIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICBAZ2V0VGFyZ2V0KCk/LmlzQ29tcGxldGU/KClcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgdGFyZ2V0OiBudWxsXG4gIGhhc1RhcmdldDogLT4gQHRhcmdldD9cbiAgZ2V0VGFyZ2V0OiAtPiBAdGFyZ2V0XG5cbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgaXNSZXF1aXJlVGFyZ2V0OiAtPiBAcmVxdWlyZVRhcmdldFxuXG4gIHJlcXVpcmVJbnB1dDogZmFsc2VcbiAgaXNSZXF1aXJlSW5wdXQ6IC0+IEByZXF1aXJlSW5wdXRcblxuICByZWNvcmRhYmxlOiBmYWxzZVxuICBpc1JlY29yZGFibGU6IC0+IEByZWNvcmRhYmxlXG5cbiAgcmVwZWF0ZWQ6IGZhbHNlXG4gIGlzUmVwZWF0ZWQ6IC0+IEByZXBlYXRlZFxuICBzZXRSZXBlYXRlZDogLT4gQHJlcGVhdGVkID0gdHJ1ZVxuXG4gICMgSW50ZW5kZWQgdG8gYmUgdXNlZCBieSBUZXh0T2JqZWN0IG9yIE1vdGlvblxuICBvcGVyYXRvcjogbnVsbFxuICBnZXRPcGVyYXRvcjogLT4gQG9wZXJhdG9yXG4gIHNldE9wZXJhdG9yOiAoQG9wZXJhdG9yKSAtPiBAb3BlcmF0b3JcbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdDogLT5cbiAgICBAb3BlcmF0b3I/IGFuZCBub3QgQG9wZXJhdG9yLmluc3RhbmNlb2YoJ1NlbGVjdCcpXG5cbiAgYWJvcnQ6IC0+XG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcignYWJvcnRlZCcpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY291bnQ6IG51bGxcbiAgZGVmYXVsdENvdW50OiAxXG4gIGdldENvdW50OiAob2Zmc2V0PTApIC0+XG4gICAgQGNvdW50ID89IEB2aW1TdGF0ZS5nZXRDb3VudCgpID8gQGRlZmF1bHRDb3VudFxuICAgIEBjb3VudCArIG9mZnNldFxuXG4gIHJlc2V0Q291bnQ6IC0+XG4gICAgQGNvdW50ID0gbnVsbFxuXG4gIGlzRGVmYXVsdENvdW50OiAtPlxuICAgIEBjb3VudCBpcyBAZGVmYXVsdENvdW50XG5cbiAgIyBNaXNjXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudFRpbWVzOiAobGFzdCwgZm4pIC0+XG4gICAgcmV0dXJuIGlmIGxhc3QgPCAxXG5cbiAgICBzdG9wcGVkID0gZmFsc2VcbiAgICBzdG9wID0gLT4gc3RvcHBlZCA9IHRydWVcbiAgICBmb3IgY291bnQgaW4gWzEuLmxhc3RdXG4gICAgICBpc0ZpbmFsID0gY291bnQgaXMgbGFzdFxuICAgICAgZm4oe2NvdW50LCBpc0ZpbmFsLCBzdG9wfSlcbiAgICAgIGJyZWFrIGlmIHN0b3BwZWRcblxuICBhY3RpdmF0ZU1vZGU6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3Nhcnk6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIHVubGVzcyBAdmltU3RhdGUuaXNNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgICBAYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG5cbiAgbmV3OiAobmFtZSwgcHJvcGVydGllcykgLT5cbiAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3MobmFtZSlcbiAgICBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gIG5ld0lucHV0VUk6IC0+XG4gICAgbmV3IElucHV0KEB2aW1TdGF0ZSlcblxuICAjIEZJWE1FOiBUaGlzIGlzIHVzZWQgdG8gY2xvbmUgTW90aW9uOjpTZWFyY2ggdG8gc3VwcG9ydCBgbmAgYW5kIGBOYFxuICAjIEJ1dCBtYW51YWwgcmVzZXRpbmcgYW5kIG92ZXJyaWRpbmcgcHJvcGVydHkgaXMgYnVnIHByb25lLlxuICAjIFNob3VsZCBleHRyYWN0IGFzIHNlYXJjaCBzcGVjIG9iamVjdCBhbmQgdXNlIGl0IGJ5XG4gICMgY3JlYXRpbmcgY2xlYW4gaW5zdGFuY2Ugb2YgU2VhcmNoLlxuICBjbG9uZTogKHZpbVN0YXRlKSAtPlxuICAgIHByb3BlcnRpZXMgPSB7fVxuICAgIGV4Y2x1ZGVQcm9wZXJ0aWVzID0gWydlZGl0b3InLCAnZWRpdG9yRWxlbWVudCcsICdnbG9iYWxTdGF0ZScsICd2aW1TdGF0ZScsICdvcGVyYXRvciddXG4gICAgZm9yIG93biBrZXksIHZhbHVlIG9mIHRoaXMgd2hlbiBrZXkgbm90IGluIGV4Y2x1ZGVQcm9wZXJ0aWVzXG4gICAgICBwcm9wZXJ0aWVzW2tleV0gPSB2YWx1ZVxuICAgIGtsYXNzID0gdGhpcy5jb25zdHJ1Y3RvclxuICAgIG5ldyBrbGFzcyh2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICBjYW5jZWxPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCgpXG5cbiAgcHJvY2Vzc09wZXJhdGlvbjogLT5cbiAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucHJvY2VzcygpXG5cbiAgZm9jdXNTZWxlY3RMaXN0OiAob3B0aW9ucz17fSkgLT5cbiAgICBAb25EaWRDYW5jZWxTZWxlY3RMaXN0ID0+XG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcbiAgICBzZWxlY3RMaXN0ID89IHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QnXG4gICAgc2VsZWN0TGlzdC5zaG93KEB2aW1TdGF0ZSwgb3B0aW9ucylcblxuICBpbnB1dDogbnVsbFxuICBoYXNJbnB1dDogLT4gQGlucHV0P1xuICBnZXRJbnB1dDogLT4gQGlucHV0XG5cbiAgZm9jdXNJbnB1dDogKGNoYXJzTWF4KSAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0gKEBpbnB1dCkgPT5cbiAgICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICAgIGlmIGNoYXJzTWF4ID4gMVxuICAgICAgaW5wdXRVSS5vbkRpZENoYW5nZSAoaW5wdXQpID0+XG4gICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpXG5cbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKGNoYXJzTWF4KVxuXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvdzogLT5cbiAgICBnZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdFNjcmVlblJvdzogLT5cbiAgICBnZXRWaW1MYXN0U2NyZWVuUm93KEBlZGl0b3IpXG5cbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb246IChwb2ludCwgb3B0aW9ucykgLT5cbiAgICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93OiAocm93KSAtPlxuICAgIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIHNjYW5Gb3J3YXJkOiAoYXJncy4uLikgLT5cbiAgICBzY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2ZvcndhcmQnLCBhcmdzLi4uKVxuXG4gIHNjYW5CYWNrd2FyZDogKGFyZ3MuLi4pIC0+XG4gICAgc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdiYWNrd2FyZCcsIGFyZ3MuLi4pXG5cbiAgaW5zdGFuY2VvZjogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG5cbiAgaXM6IChrbGFzc05hbWUpIC0+XG4gICAgdGhpcy5jb25zdHJ1Y3RvciBpcyBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpc09wZXJhdG9yOiAtPlxuICAgIEBpbnN0YW5jZW9mKCdPcGVyYXRvcicpXG5cbiAgaXNNb3Rpb246IC0+XG4gICAgQGluc3RhbmNlb2YoJ01vdGlvbicpXG5cbiAgaXNUZXh0T2JqZWN0OiAtPlxuICAgIEBpbnN0YW5jZW9mKCdUZXh0T2JqZWN0JylcblxuICBnZXROYW1lOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5uYW1lXG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb246IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgIEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnM6IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24uYmluZCh0aGlzKSlcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgIEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG5cbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RyID0gQGdldE5hbWUoKVxuICAgIHN0ciArPSBcIiwgdGFyZ2V0PSN7QGdldFRhcmdldCgpLnRvU3RyaW5nKCl9XCIgaWYgQGhhc1RhcmdldCgpXG4gICAgc3RyXG5cbiAgIyBDbGFzcyBtZXRob2RzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAaW5pdDogKHNlcnZpY2UpIC0+XG4gICAge2dldEVkaXRvclN0YXRlfSA9IHNlcnZpY2VcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIFtcbiAgICAgICcuL29wZXJhdG9yJywgJy4vb3BlcmF0b3ItaW5zZXJ0JywgJy4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZycsXG4gICAgICAnLi9tb3Rpb24nLCAnLi9tb3Rpb24tc2VhcmNoJyxcbiAgICAgICcuL3RleHQtb2JqZWN0JyxcbiAgICAgICcuL2luc2VydC1tb2RlJywgJy4vbWlzYy1jb21tYW5kJ1xuICAgIF0uZm9yRWFjaChyZXF1aXJlKVxuXG4gICAgZm9yIF9fLCBrbGFzcyBvZiBAZ2V0UmVnaXN0cmllcygpIHdoZW4ga2xhc3MuaXNDb21tYW5kKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChrbGFzcy5yZWdpc3RlckNvbW1hbmQoKSlcbiAgICBAc3Vic2NyaXB0aW9uc1xuXG4gICMgRm9yIGRldmVsb3BtZW50IGVhc2luZXNzIHdpdGhvdXQgcmVsb2FkaW5nIHZpbS1tb2RlLXBsdXNcbiAgQHJlc2V0OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGZvciBfXywga2xhc3Mgb2YgQGdldFJlZ2lzdHJpZXMoKSB3aGVuIGtsYXNzLmlzQ29tbWFuZCgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQoa2xhc3MucmVnaXN0ZXJDb21tYW5kKCkpXG5cbiAgcmVnaXN0cmllcyA9IHtCYXNlfVxuICBAZXh0ZW5kOiAoQGNvbW1hbmQ9dHJ1ZSkgLT5cbiAgICBpZiAoQG5hbWUgb2YgcmVnaXN0cmllcykgYW5kIChub3QgQHN1cHByZXNzV2FybmluZylcbiAgICAgIGNvbnNvbGUud2FybihcIkR1cGxpY2F0ZSBjb25zdHJ1Y3RvciAje0BuYW1lfVwiKVxuICAgIHJlZ2lzdHJpZXNbQG5hbWVdID0gdGhpc1xuXG4gIEBnZXRDbGFzczogKG5hbWUpIC0+XG4gICAgaWYgKGtsYXNzID0gcmVnaXN0cmllc1tuYW1lXSk/XG4gICAgICBrbGFzc1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImNsYXNzICcje25hbWV9JyBub3QgZm91bmRcIilcblxuICBAZ2V0UmVnaXN0cmllczogLT5cbiAgICByZWdpc3RyaWVzXG5cbiAgQGlzQ29tbWFuZDogLT5cbiAgICBAY29tbWFuZFxuXG4gIEBjb21tYW5kUHJlZml4OiAndmltLW1vZGUtcGx1cydcbiAgQGdldENvbW1hbmROYW1lOiAtPlxuICAgIEBjb21tYW5kUHJlZml4ICsgJzonICsgXy5kYXNoZXJpemUoQG5hbWUpXG5cbiAgQGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeDogLT5cbiAgICBfLmRhc2hlcml6ZShAbmFtZSlcblxuICBAY29tbWFuZFNjb3BlOiAnYXRvbS10ZXh0LWVkaXRvcidcbiAgQGdldENvbW1hbmRTY29wZTogLT5cbiAgICBAY29tbWFuZFNjb3BlXG5cbiAgQGdldERlc2N0aXB0aW9uOiAtPlxuICAgIGlmIEBoYXNPd25Qcm9wZXJ0eShcImRlc2NyaXB0aW9uXCIpXG4gICAgICBAZGVzY3JpcHRpb25cbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgQHJlZ2lzdGVyQ29tbWFuZDogLT5cbiAgICBrbGFzcyA9IHRoaXNcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZ2V0Q29tbWFuZFNjb3BlKCksIEBnZXRDb21tYW5kTmFtZSgpLCAoZXZlbnQpIC0+XG4gICAgICB2aW1TdGF0ZSA9IGdldEVkaXRvclN0YXRlKEBnZXRNb2RlbCgpKSA/IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmIHZpbVN0YXRlPyAjIFBvc3NpYmx5IHVuZGVmaW5lZCBTZWUgIzg1XG4gICAgICAgIHZpbVN0YXRlLl9ldmVudCA9IGV2ZW50XG4gICAgICAgIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihrbGFzcylcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19
