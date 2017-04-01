(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, moveCursorLeft, ref, ref1, swrap;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  ref1 = {}, Select = ref1.Select, MoveToRelativeLine = ref1.MoveToRelativeLine;

  OperationAbortedError = require('./errors').OperationAbortedError;

  swrap = require('./selection-wrapper');

  OperationStack = (function() {
    Object.defineProperty(OperationStack.prototype, 'mode', {
      get: function() {
        return this.modeManager.mode;
      }
    });

    Object.defineProperty(OperationStack.prototype, 'submode', {
      get: function() {
        return this.modeManager.submode;
      }
    });

    function OperationStack(vimState) {
      var ref2;
      this.vimState = vimState;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.modeManager = ref2.modeManager;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      this.reset();
    }

    OperationStack.prototype.subscribe = function(handler) {
      this.operationSubscriptions.add(handler);
      return handler;
    };

    OperationStack.prototype.reset = function() {
      var ref2;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return ref3 = {}, this.stack = ref3.stack, this.operationSubscriptions = ref3.operationSubscriptions, ref3;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.run = function(klass, properties) {
      var error, isValidOperation, operation, ref2, type;
      try {
        if (this.isEmpty()) {
          this.vimState.init();
        }
        type = typeof klass;
        if (type === 'object') {
          operation = klass;
        } else {
          if (type === 'string') {
            klass = Base.getClass(klass);
          }
          if (((ref2 = this.peekTop()) != null ? ref2.constructor : void 0) === klass) {
            operation = new MoveToRelativeLine(this.vimState);
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        if (this.isEmpty()) {
          isValidOperation = true;
          if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
            operation = new Select(this.vimState).setTarget(operation);
          }
        } else {
          isValidOperation = this.peekTop().isOperator() && (operation.isMotion() || operation.isTextObject());
        }
        if (isValidOperation) {
          this.stack.push(operation);
          return this.process();
        } else {
          this.vimState.emitDidFailToPushToOperationStack();
          return this.vimState.resetNormalMode();
        }
      } catch (error1) {
        error = error1;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.runRecorded = function() {
      var count, operation, ref2;
      if (operation = this.recordedOperation) {
        operation.setRepeated();
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((ref2 = operation.target) != null) {
            ref2.count = count;
          }
        }
        operation.subscribeResetOccurrencePatternIfNeeded();
        return this.run(operation);
      }
    };

    OperationStack.prototype.runRecordedMotion = function(key, arg) {
      var operation, reverse;
      reverse = (arg != null ? arg : {}).reverse;
      if (!(operation = this.vimState.globalState.get(key))) {
        return;
      }
      operation = operation.clone(this.vimState);
      operation.setRepeated();
      operation.resetCount();
      if (reverse) {
        operation.backwards = !operation.backwards;
      }
      return this.run(operation);
    };

    OperationStack.prototype.runCurrentFind = function(options) {
      return this.runRecordedMotion('currentFind', options);
    };

    OperationStack.prototype.runCurrentSearch = function(options) {
      return this.runRecordedMotion('currentSearch', options);
    };

    OperationStack.prototype.handleError = function(error) {
      this.vimState.reset();
      if (!(error instanceof OperationAbortedError)) {
        throw error;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var base, commandName, operation, top;
      this.processing = true;
      if (this.stack.length === 2) {
        if (!this.peekTop().isComplete()) {
          return;
        }
        operation = this.stack.pop();
        this.peekTop().setTarget(operation);
      }
      top = this.peekTop();
      if (top.isComplete()) {
        return this.execute(this.stack.pop());
      } else {
        if (this.mode === 'normal' && top.isOperator()) {
          this.modeManager.activate('operator-pending');
        }
        if (commandName = typeof (base = top.constructor).getCommandNameWithoutPrefix === "function" ? base.getCommandNameWithoutPrefix() : void 0) {
          return this.addToClassList(commandName + "-pending");
        }
      }
    };

    OperationStack.prototype.execute = function(operation) {
      var execution;
      if (this.mode === 'visual') {
        this.vimState.updatePreviousSelection();
      }
      execution = operation.execute();
      if (execution instanceof Promise) {
        return execution.then((function(_this) {
          return function() {
            return _this.finish(operation);
          };
        })(this))["catch"]((function(_this) {
          return function() {
            return _this.handleError();
          };
        })(this));
      } else {
        return this.finish(operation);
      }
    };

    OperationStack.prototype.cancel = function() {
      var ref2;
      if ((ref2 = this.mode) !== 'visual' && ref2 !== 'insert') {
        this.vimState.resetNormalMode();
        this.vimState.restoreOriginalCursorPosition();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.isRecordable() : void 0) {
        this.recordedOperation = operation;
      }
      this.vimState.emitDidFinishOperation();
      if (operation != null ? operation.isOperator() : void 0) {
        operation.resetState();
      }
      if (this.mode === 'normal') {
        swrap.clearProperties(this.editor);
        this.ensureAllSelectionsAreEmpty(operation);
        this.ensureAllCursorsAreNotAtEndOfLine();
      } else if (this.mode === 'visual') {
        this.modeManager.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.updateCursorsVisibility();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      this.vimState.clearBlockwiseSelections();
      if (!this.editor.getLastSelection().isEmpty()) {
        if (this.vimState.getConfig('devThrowErrorOnNonEmptySelectionInNormalMode')) {
          throw new Error("Selection is not empty in normal-mode: " + (operation.toString()));
        } else {
          return this.vimState.clearSelections();
        }
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref2, results;
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (cursor.isAtEndOfLine()) {
          results.push(moveCursorLeft(cursor, {
            preserveGoalColumn: true
          }));
        }
      }
      return results;
    };

    OperationStack.prototype.addToClassList = function(className) {
      this.editorElement.classList.add(className);
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.classList.remove(className);
        };
      })(this)));
    };

    OperationStack.prototype.hasCount = function() {
      return (this.count['normal'] != null) || (this.count['operator-pending'] != null);
    };

    OperationStack.prototype.getCount = function() {
      var ref2, ref3;
      if (this.hasCount()) {
        return ((ref2 = this.count['normal']) != null ? ref2 : 1) * ((ref3 = this.count['operator-pending']) != null ? ref3 : 1);
      } else {
        return null;
      }
    };

    OperationStack.prototype.setCount = function(number) {
      var base, mode;
      mode = 'normal';
      if (this.mode === 'operator-pending') {
        mode = this.mode;
      }
      if ((base = this.count)[mode] == null) {
        base[mode] = 0;
      }
      this.count[mode] = (this.count[mode] * 10) + number;
      this.vimState.hover.set(this.buildCountString());
      return this.vimState.toggleClassList('with-count', true);
    };

    OperationStack.prototype.buildCountString = function() {
      return [this.count['normal'], this.count['operator-pending']].filter(function(count) {
        return count != null;
      }).map(function(count) {
        return String(count);
      }).join('x');
    };

    OperationStack.prototype.resetCount = function() {
      this.count = {};
      return this.vimState.toggleClassList('with-count', false);
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRpb24tc3RhY2suY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDJCQUFELEVBQWE7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGlCQUFrQixPQUFBLENBQVEsU0FBUjs7RUFDbkIsT0FBK0IsRUFBL0IsRUFBQyxvQkFBRCxFQUFTOztFQUNSLHdCQUF5QixPQUFBLENBQVEsVUFBUjs7RUFDMUIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFZRjtJQUNKLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxNQUFsQyxFQUEwQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTFDOztJQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxTQUFsQyxFQUE2QztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTdDOztJQUVhLHdCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUEwQyxJQUFDLENBQUEsUUFBM0MsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLG1CQUFBO01BRTNCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFk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QUFNLENBQUMsT0FBUCxHQUFpQjtBQTVPakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbnttb3ZlQ3Vyc29yTGVmdH0gPSByZXF1aXJlICcuL3V0aWxzJ1xue1NlbGVjdCwgTW92ZVRvUmVsYXRpdmVMaW5lfSA9IHt9XG57T3BlcmF0aW9uQWJvcnRlZEVycm9yfSA9IHJlcXVpcmUgJy4vZXJyb3JzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIG9wcmF0aW9uIGxpZmUgaW4gb3BlcmF0aW9uU3RhY2tcbiMgMS4gcnVuXG4jICAgIGluc3RhbnRpYXRlZCBieSBuZXcuXG4jICAgIGNvbXBsaW1lbnQgaW1wbGljaXQgT3BlcmF0b3IuU2VsZWN0IG9wZXJhdG9yIGlmIG5lY2Vzc2FyeS5cbiMgICAgcHVzaCBvcGVyYXRpb24gdG8gc3RhY2suXG4jIDIuIHByb2Nlc3NcbiMgICAgcmVkdWNlIHN0YWNrIGJ5LCBwb3BwaW5nIHRvcCBvZiBzdGFjayB0aGVuIHNldCBpdCBhcyB0YXJnZXQgb2YgbmV3IHRvcC5cbiMgICAgY2hlY2sgaWYgcmVtYWluaW5nIHRvcCBvZiBzdGFjayBpcyBleGVjdXRhYmxlIGJ5IGNhbGxpbmcgaXNDb21wbGV0ZSgpXG4jICAgIGlmIGV4ZWN1dGFibGUsIHRoZW4gcG9wIHN0YWNrIHRoZW4gZXhlY3V0ZShwb3BwZWRPcGVyYXRpb24pXG4jICAgIGlmIG5vdCBleGVjdXRhYmxlLCBlbnRlciBcIm9wZXJhdG9yLXBlbmRpbmctbW9kZVwiXG5jbGFzcyBPcGVyYXRpb25TdGFja1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgJ21vZGUnLCBnZXQ6IC0+IEBtb2RlTWFuYWdlci5tb2RlXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnc3VibW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLnN1Ym1vZGVcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBtb2RlTWFuYWdlcn0gPSBAdmltU3RhdGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgU2VsZWN0ID89IEJhc2UuZ2V0Q2xhc3MoJ1NlbGVjdCcpXG4gICAgTW92ZVRvUmVsYXRpdmVMaW5lID89IEJhc2UuZ2V0Q2xhc3MoJ01vdmVUb1JlbGF0aXZlTGluZScpXG5cbiAgICBAcmVzZXQoKVxuXG4gICMgUmV0dXJuIGhhbmRsZXJcbiAgc3Vic2NyaWJlOiAoaGFuZGxlcikgLT5cbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5hZGQoaGFuZGxlcilcbiAgICByZXR1cm4gaGFuZGxlciAjIERPTlQgUkVNT1ZFXG5cbiAgcmVzZXQ6IC0+XG4gICAgQHJlc2V0Q291bnQoKVxuICAgIEBzdGFjayA9IFtdXG4gICAgQHByb2Nlc3NpbmcgPSBmYWxzZVxuXG4gICAgIyB0aGlzIGhhcyB0byBiZSBCRUZPUkUgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHZpbVN0YXRlLmVtaXREaWRSZXNldE9wZXJhdGlvblN0YWNrKClcblxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAge0BzdGFjaywgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnN9ID0ge31cblxuICBwZWVrVG9wOiAtPlxuICAgIEBzdGFja1tAc3RhY2subGVuZ3RoIC0gMV1cblxuICBpc0VtcHR5OiAtPlxuICAgIEBzdGFjay5sZW5ndGggaXMgMFxuXG4gICMgTWFpblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcnVuOiAoa2xhc3MsIHByb3BlcnRpZXMpIC0+XG4gICAgdHJ5XG4gICAgICBAdmltU3RhdGUuaW5pdCgpIGlmIEBpc0VtcHR5KClcbiAgICAgIHR5cGUgPSB0eXBlb2Yoa2xhc3MpXG4gICAgICBpZiB0eXBlIGlzICdvYmplY3QnICMgLiByZXBlYXQgY2FzZSB3ZSBjYW4gZXhlY3V0ZSBhcy1pdC1pcy5cbiAgICAgICAgb3BlcmF0aW9uID0ga2xhc3NcbiAgICAgIGVsc2VcbiAgICAgICAga2xhc3MgPSBCYXNlLmdldENsYXNzKGtsYXNzKSBpZiB0eXBlIGlzICdzdHJpbmcnXG4gICAgICAgICMgUmVwbGFjZSBvcGVyYXRvciB3aGVuIGlkZW50aWNhbCBvbmUgcmVwZWF0ZWQsIGUuZy4gYGRkYCwgYGNjYCwgYGdVZ1VgXG4gICAgICAgIGlmIEBwZWVrVG9wKCk/LmNvbnN0cnVjdG9yIGlzIGtsYXNzXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IE1vdmVUb1JlbGF0aXZlTGluZShAdmltU3RhdGUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcGVyYXRpb24gPSBuZXcga2xhc3MoQHZpbVN0YXRlLCBwcm9wZXJ0aWVzKVxuXG4gICAgICBpZiBAaXNFbXB0eSgpXG4gICAgICAgIGlzVmFsaWRPcGVyYXRpb24gPSB0cnVlXG4gICAgICAgIGlmIChAbW9kZSBpcyAndmlzdWFsJyBhbmQgb3BlcmF0aW9uLmlzTW90aW9uKCkpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKVxuICAgICAgICAgIG9wZXJhdGlvbiA9IG5ldyBTZWxlY3QoQHZpbVN0YXRlKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuICAgICAgZWxzZVxuICAgICAgICBpc1ZhbGlkT3BlcmF0aW9uID0gQHBlZWtUb3AoKS5pc09wZXJhdG9yKCkgYW5kIChvcGVyYXRpb24uaXNNb3Rpb24oKSBvciBvcGVyYXRpb24uaXNUZXh0T2JqZWN0KCkpXG5cbiAgICAgIGlmIGlzVmFsaWRPcGVyYXRpb25cbiAgICAgICAgQHN0YWNrLnB1c2gob3BlcmF0aW9uKVxuICAgICAgICBAcHJvY2VzcygpXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2soKVxuICAgICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQGhhbmRsZUVycm9yKGVycm9yKVxuXG4gIHJ1blJlY29yZGVkOiAtPlxuICAgIGlmIG9wZXJhdGlvbiA9IEByZWNvcmRlZE9wZXJhdGlvblxuICAgICAgb3BlcmF0aW9uLnNldFJlcGVhdGVkKClcbiAgICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAgIGNvdW50ID0gQGdldENvdW50KClcbiAgICAgICAgb3BlcmF0aW9uLmNvdW50ID0gY291bnRcbiAgICAgICAgb3BlcmF0aW9uLnRhcmdldD8uY291bnQgPSBjb3VudCAjIFNvbWUgb3BlYXJ0b3IgaGF2ZSBubyB0YXJnZXQgbGlrZSBjdHJsLWEoaW5jcmVhc2UpLlxuXG4gICAgICBvcGVyYXRpb24uc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcbiAgICAgIEBydW4ob3BlcmF0aW9uKVxuXG4gIHJ1blJlY29yZGVkTW90aW9uOiAoa2V5LCB7cmV2ZXJzZX09e30pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBvcGVyYXRpb24gPSBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KGtleSlcblxuICAgIG9wZXJhdGlvbiA9IG9wZXJhdGlvbi5jbG9uZShAdmltU3RhdGUpXG4gICAgb3BlcmF0aW9uLnNldFJlcGVhdGVkKClcbiAgICBvcGVyYXRpb24ucmVzZXRDb3VudCgpXG4gICAgaWYgcmV2ZXJzZVxuICAgICAgb3BlcmF0aW9uLmJhY2t3YXJkcyA9IG5vdCBvcGVyYXRpb24uYmFja3dhcmRzXG4gICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuQ3VycmVudEZpbmQ6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudEZpbmQnLCBvcHRpb25zKVxuXG4gIHJ1bkN1cnJlbnRTZWFyY2g6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudFNlYXJjaCcsIG9wdGlvbnMpXG5cbiAgaGFuZGxlRXJyb3I6IChlcnJvcikgLT5cbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgIHVubGVzcyBlcnJvciBpbnN0YW5jZW9mIE9wZXJhdGlvbkFib3J0ZWRFcnJvclxuICAgICAgdGhyb3cgZXJyb3JcblxuICBpc1Byb2Nlc3Npbmc6IC0+XG4gICAgQHByb2Nlc3NpbmdcblxuICBwcm9jZXNzOiAtPlxuICAgIEBwcm9jZXNzaW5nID0gdHJ1ZVxuICAgIGlmIEBzdGFjay5sZW5ndGggaXMgMlxuICAgICAgIyBbRklYTUUgaWRlYWxseV1cbiAgICAgICMgSWYgdGFyZ2V0IGlzIG5vdCBjb21wbGV0ZSwgd2UgcG9zdHBvbmUgY29tcG9zaW5nIHRhcmdldCB3aXRoIG9wZXJhdG9yIHRvIGtlZXAgc2l0dWF0aW9uIHNpbXBsZS5cbiAgICAgICMgU28gdGhhdCB3ZSBjYW4gYXNzdW1lIHdoZW4gdGFyZ2V0IGlzIHNldCB0byBvcGVyYXRvciBpdCdzIGNvbXBsZXRlLlxuICAgICAgIyBlLmcuIGB5IHMgdCBhJyhzdXJyb3VuZCBmb3IgcmFuZ2UgZnJvbSBoZXJlIHRvIHRpbGwgYSlcbiAgICAgIHJldHVybiB1bmxlc3MgQHBlZWtUb3AoKS5pc0NvbXBsZXRlKClcblxuICAgICAgb3BlcmF0aW9uID0gQHN0YWNrLnBvcCgpXG4gICAgICBAcGVla1RvcCgpLnNldFRhcmdldChvcGVyYXRpb24pXG5cbiAgICB0b3AgPSBAcGVla1RvcCgpXG5cbiAgICBpZiB0b3AuaXNDb21wbGV0ZSgpXG4gICAgICBAZXhlY3V0ZShAc3RhY2sucG9wKCkpXG4gICAgZWxzZVxuICAgICAgaWYgQG1vZGUgaXMgJ25vcm1hbCcgYW5kIHRvcC5pc09wZXJhdG9yKClcbiAgICAgICAgQG1vZGVNYW5hZ2VyLmFjdGl2YXRlKCdvcGVyYXRvci1wZW5kaW5nJylcblxuICAgICAgIyBUZW1wb3Jhcnkgc2V0IHdoaWxlIGNvbW1hbmQgaXMgcnVubmluZ1xuICAgICAgaWYgY29tbWFuZE5hbWUgPSB0b3AuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4PygpXG4gICAgICAgIEBhZGRUb0NsYXNzTGlzdChjb21tYW5kTmFtZSArIFwiLXBlbmRpbmdcIilcblxuICBleGVjdXRlOiAob3BlcmF0aW9uKSAtPlxuICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgZXhlY3V0aW9uID0gb3BlcmF0aW9uLmV4ZWN1dGUoKVxuICAgIGlmIGV4ZWN1dGlvbiBpbnN0YW5jZW9mIFByb21pc2VcbiAgICAgIGV4ZWN1dGlvblxuICAgICAgICAudGhlbiA9PiBAZmluaXNoKG9wZXJhdGlvbilcbiAgICAgICAgLmNhdGNoID0+IEBoYW5kbGVFcnJvcigpXG4gICAgZWxzZVxuICAgICAgQGZpbmlzaChvcGVyYXRpb24pXG5cbiAgY2FuY2VsOiAtPlxuICAgIGlmIEBtb2RlIG5vdCBpbiBbJ3Zpc3VhbCcsICdpbnNlcnQnXVxuICAgICAgQHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAdmltU3RhdGUucmVzdG9yZU9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKVxuICAgIEBmaW5pc2goKVxuXG4gIGZpbmlzaDogKG9wZXJhdGlvbj1udWxsKSAtPlxuICAgIEByZWNvcmRlZE9wZXJhdGlvbiA9IG9wZXJhdGlvbiBpZiBvcGVyYXRpb24/LmlzUmVjb3JkYWJsZSgpXG4gICAgQHZpbVN0YXRlLmVtaXREaWRGaW5pc2hPcGVyYXRpb24oKVxuICAgIGlmIG9wZXJhdGlvbj8uaXNPcGVyYXRvcigpXG4gICAgICBvcGVyYXRpb24ucmVzZXRTdGF0ZSgpXG5cbiAgICBpZiBAbW9kZSBpcyAnbm9ybWFsJ1xuICAgICAgc3dyYXAuY2xlYXJQcm9wZXJ0aWVzKEBlZGl0b3IpXG4gICAgICBAZW5zdXJlQWxsU2VsZWN0aW9uc0FyZUVtcHR5KG9wZXJhdGlvbilcbiAgICAgIEBlbnN1cmVBbGxDdXJzb3JzQXJlTm90QXRFbmRPZkxpbmUoKVxuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEBtb2RlTWFuYWdlci51cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG4gICAgQHZpbVN0YXRlLnVwZGF0ZUN1cnNvcnNWaXNpYmlsaXR5KClcbiAgICBAdmltU3RhdGUucmVzZXQoKVxuXG4gIGVuc3VyZUFsbFNlbGVjdGlvbnNBcmVFbXB0eTogKG9wZXJhdGlvbikgLT5cbiAgICAjIFdoZW4gQHZpbVN0YXRlLnNlbGVjdEJsb2Nrd2lzZSgpIGlzIGNhbGxlZCBpbiBub24tdmlzdWFsLW1vZGUuXG4gICAgIyBlLmcuIGAuYCByZXBlYXQgb2Ygb3BlcmF0aW9uIHRhcmdldGVkIGJsb2Nrd2lzZSBgQ3VycmVudFNlbGVjdGlvbmAuXG4gICAgIyBXZSBuZWVkIHRvIG1hbnVhbGx5IGNsZWFyIGJsb2Nrd2lzZVNlbGVjdGlvbi5cbiAgICAjIFNlZSAjNjQ3XG4gICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpXG5cbiAgICB1bmxlc3MgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNFbXB0eSgpXG4gICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdkZXZUaHJvd0Vycm9yT25Ob25FbXB0eVNlbGVjdGlvbkluTm9ybWFsTW9kZScpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlbGVjdGlvbiBpcyBub3QgZW1wdHkgaW4gbm9ybWFsLW1vZGU6ICN7b3BlcmF0aW9uLnRvU3RyaW5nKCl9XCIpXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gIGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZTogLT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpIHdoZW4gY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgbW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7cHJlc2VydmVHb2FsQ29sdW1uOiB0cnVlfSlcblxuICBhZGRUb0NsYXNzTGlzdDogKGNsYXNzTmFtZSkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSlcbiAgICBAc3Vic2NyaWJlIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSlcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGtleXN0cm9rZSBgM2Qyd2AgZGVsZXRlIDYoMyoyKSB3b3Jkcy5cbiAgIyAgMm5kIG51bWJlcigyIGluIHRoaXMgY2FzZSkgaXMgYWx3YXlzIGVudGVyZCBpbiBvcGVyYXRvci1wZW5kaW5nLW1vZGUuXG4gICMgIFNvIGNvdW50IGhhdmUgdHdvIHRpbWluZyB0byBiZSBlbnRlcmVkLiB0aGF0J3Mgd2h5IGhlcmUgd2UgbWFuYWdlIGNvdW50ZXIgYnkgbW9kZS5cbiAgaGFzQ291bnQ6IC0+XG4gICAgQGNvdW50Wydub3JtYWwnXT8gb3IgQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ10/XG5cbiAgZ2V0Q291bnQ6IC0+XG4gICAgaWYgQGhhc0NvdW50KClcbiAgICAgIChAY291bnRbJ25vcm1hbCddID8gMSkgKiAoQGNvdW50WydvcGVyYXRvci1wZW5kaW5nJ10gPyAxKVxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuICBzZXRDb3VudDogKG51bWJlcikgLT5cbiAgICBtb2RlID0gJ25vcm1hbCdcbiAgICBtb2RlID0gQG1vZGUgaWYgQG1vZGUgaXMgJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgQGNvdW50W21vZGVdID89IDBcbiAgICBAY291bnRbbW9kZV0gPSAoQGNvdW50W21vZGVdICogMTApICsgbnVtYmVyXG4gICAgQHZpbVN0YXRlLmhvdmVyLnNldChAYnVpbGRDb3VudFN0cmluZygpKVxuICAgIEB2aW1TdGF0ZS50b2dnbGVDbGFzc0xpc3QoJ3dpdGgtY291bnQnLCB0cnVlKVxuXG4gIGJ1aWxkQ291bnRTdHJpbmc6IC0+XG4gICAgW0Bjb3VudFsnbm9ybWFsJ10sIEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddXVxuICAgICAgLmZpbHRlciAoY291bnQpIC0+IGNvdW50P1xuICAgICAgLm1hcCAoY291bnQpIC0+IFN0cmluZyhjb3VudClcbiAgICAgIC5qb2luKCd4JylcblxuICByZXNldENvdW50OiAtPlxuICAgIEBjb3VudCA9IHt9XG4gICAgQHZpbVN0YXRlLnRvZ2dsZUNsYXNzTGlzdCgnd2l0aC1jb3VudCcsIGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wZXJhdGlvblN0YWNrXG4iXX0=
