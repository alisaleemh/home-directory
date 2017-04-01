(function() {
  var ActivateInsertMode, ActivateReplaceMode, Change, ChangeLine, ChangeOccurrence, ChangeToLastCharacterOfLine, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtEndOfOccurrence, InsertAtEndOfSmartWord, InsertAtEndOfTarget, InsertAtFirstCharacterOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertAtStartOfOccurrence, InsertAtStartOfSmartWord, InsertAtStartOfTarget, InsertBelowWithNewline, InsertByTarget, Operator, Range, Substitute, SubstituteLine, _, limitNumber, moveCursorLeft, moveCursorRight, ref, shrinkRangeEndToBeforeNewLine, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  ref = require('./utils'), moveCursorLeft = ref.moveCursorLeft, moveCursorRight = ref.moveCursorRight, limitNumber = ref.limitNumber, shrinkRangeEndToBeforeNewLine = ref.shrinkRangeEndToBeforeNewLine;

  swrap = require('./selection-wrapper');

  Operator = require('./base').getClass('Operator');

  ActivateInsertMode = (function(superClass) {
    extend(ActivateInsertMode, superClass);

    function ActivateInsertMode() {
      return ActivateInsertMode.__super__.constructor.apply(this, arguments);
    }

    ActivateInsertMode.extend();

    ActivateInsertMode.prototype.requireTarget = false;

    ActivateInsertMode.prototype.flashTarget = false;

    ActivateInsertMode.prototype.finalSubmode = null;

    ActivateInsertMode.prototype.supportInsertionCount = true;

    ActivateInsertMode.prototype.flashCheckpoint = 'custom';

    ActivateInsertMode.prototype.observeWillDeactivateMode = function() {
      var disposable;
      return disposable = this.vimState.modeManager.preemptWillDeactivateMode((function(_this) {
        return function(arg) {
          var change, changedRange, mode, textByUserInput;
          mode = arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          textByUserInput = '';
          if (change = _this.getChangeSinceCheckpoint('insert')) {
            _this.lastChange = change;
            changedRange = new Range(change.start, change.start.traverse(change.newExtent));
            _this.vimState.mark.setRange('[', ']', changedRange);
            textByUserInput = change.newText;
          }
          _this.vimState.register.set('.', {
            text: textByUserInput
          });
          _.times(_this.getInsertionCount(), function() {
            var i, len, ref1, results, selection, text;
            text = _this.textByOperator + textByUserInput;
            ref1 = _this.editor.getSelections();
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              results.push(selection.insertText(text, {
                autoIndent: true
              }));
            }
            return results;
          });
          if (_this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) {
            _this.vimState.clearSelections();
          }
          if (_this.getConfig('groupChangesWhenLeavingInsertMode')) {
            return _this.groupChangesSinceBufferCheckpoint('undo');
          }
        };
      })(this));
    };

    ActivateInsertMode.prototype.getChangeSinceCheckpoint = function(purpose) {
      var checkpoint;
      checkpoint = this.getBufferCheckpoint(purpose);
      return this.editor.buffer.getChangesSinceCheckpoint(checkpoint)[0];
    };

    ActivateInsertMode.prototype.replayLastChange = function(selection) {
      var deletionEnd, deletionStart, newExtent, newText, oldExtent, ref1, start, traversalToStartOfDelete;
      if (this.lastChange != null) {
        ref1 = this.lastChange, start = ref1.start, newExtent = ref1.newExtent, oldExtent = ref1.oldExtent, newText = ref1.newText;
        if (!oldExtent.isZero()) {
          traversalToStartOfDelete = start.traversalFrom(this.topCursorPositionAtInsertionStart);
          deletionStart = selection.cursor.getBufferPosition().traverse(traversalToStartOfDelete);
          deletionEnd = deletionStart.traverse(oldExtent);
          selection.setBufferRange([deletionStart, deletionEnd]);
        }
      } else {
        newText = '';
      }
      return selection.insertText(newText, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return this.replayLastChange(selection);
    };

    ActivateInsertMode.prototype.getInsertionCount = function() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount(-1) : 0;
      }
      return limitNumber(this.insertionCount, {
        max: 100
      });
    };

    ActivateInsertMode.prototype.execute = function() {
      var ref1, ref2, topCursor;
      if (this.isRepeated()) {
        this.flashTarget = this.trackChange = true;
        this.startMutation((function(_this) {
          return function() {
            var i, len, mutatedRanges, ref1, ref2, ref3, selection;
            if (_this.isRequireTarget()) {
              _this.selectTarget();
            }
            if (typeof _this.mutateText === "function") {
              _this.mutateText();
            }
            mutatedRanges = [];
            ref1 = _this.editor.getSelections();
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              mutatedRanges.push(_this.repeatInsert(selection, (ref2 = (ref3 = _this.lastChange) != null ? ref3.newText : void 0) != null ? ref2 : ''));
              moveCursorLeft(selection.cursor);
            }
            return _this.mutationManager.setBufferRangesForCustomCheckpoint(mutatedRanges);
          };
        })(this));
        if (this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) {
          return this.vimState.clearSelections();
        }
      } else {
        if (this.isRequireTarget()) {
          this.normalizeSelectionsIfNecessary();
        }
        this.createBufferCheckpoint('undo');
        if (this.isRequireTarget()) {
          this.selectTarget();
        }
        this.observeWillDeactivateMode();
        if (typeof this.mutateText === "function") {
          this.mutateText();
        }
        if (this.getInsertionCount() > 0) {
          this.textByOperator = (ref1 = (ref2 = this.getChangeSinceCheckpoint('undo')) != null ? ref2.newText : void 0) != null ? ref1 : '';
        }
        this.createBufferCheckpoint('insert');
        topCursor = this.editor.getCursorsOrderedByBufferPosition()[0];
        this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();
        return this.vimState.activate('insert', this.finalSubmode);
      }
    };

    return ActivateInsertMode;

  })(Operator);

  ActivateReplaceMode = (function(superClass) {
    extend(ActivateReplaceMode, superClass);

    function ActivateReplaceMode() {
      return ActivateReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ActivateReplaceMode.extend();

    ActivateReplaceMode.prototype.finalSubmode = 'replace';

    ActivateReplaceMode.prototype.repeatInsert = function(selection, text) {
      var char, i, len;
      for (i = 0, len = text.length; i < len; i++) {
        char = text[i];
        if (!(char !== "\n")) {
          continue;
        }
        if (selection.cursor.isAtEndOfLine()) {
          break;
        }
        selection.selectRight();
      }
      return selection.insertText(text, {
        autoIndent: false
      });
    };

    return ActivateReplaceMode;

  })(ActivateInsertMode);

  InsertAfter = (function(superClass) {
    extend(InsertAfter, superClass);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.extend();

    InsertAfter.prototype.execute = function() {
      var cursor, i, len, ref1;
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        moveCursorRight(cursor);
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(ActivateInsertMode);

  InsertAtBeginningOfLine = (function(superClass) {
    extend(InsertAtBeginningOfLine, superClass);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.extend();

    InsertAtBeginningOfLine.prototype.execute = function() {
      if (this.isMode('visual', ['characterwise', 'linewise'])) {
        this.editor.splitSelectionsIntoLines();
      }
      this.editor.moveToBeginningOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(ActivateInsertMode);

  InsertAfterEndOfLine = (function(superClass) {
    extend(InsertAfterEndOfLine, superClass);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.extend();

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(ActivateInsertMode);

  InsertAtFirstCharacterOfLine = (function(superClass) {
    extend(InsertAtFirstCharacterOfLine, superClass);

    function InsertAtFirstCharacterOfLine() {
      return InsertAtFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtFirstCharacterOfLine.extend();

    InsertAtFirstCharacterOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtFirstCharacterOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtFirstCharacterOfLine;

  })(ActivateInsertMode);

  InsertAtLastInsert = (function(superClass) {
    extend(InsertAtLastInsert, superClass);

    function InsertAtLastInsert() {
      return InsertAtLastInsert.__super__.constructor.apply(this, arguments);
    }

    InsertAtLastInsert.extend();

    InsertAtLastInsert.prototype.execute = function() {
      var point;
      if ((point = this.vimState.mark.get('^'))) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({
          center: true
        });
      }
      return InsertAtLastInsert.__super__.execute.apply(this, arguments);
    };

    return InsertAtLastInsert;

  })(ActivateInsertMode);

  InsertAboveWithNewline = (function(superClass) {
    extend(InsertAboveWithNewline, superClass);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.extend();

    InsertAboveWithNewline.prototype.groupChangesSinceBufferCheckpoint = function() {
      var cursorPosition, lastCursor;
      lastCursor = this.editor.getLastCursor();
      cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.vimState.getOriginalCursorPositionByMarker());
      InsertAboveWithNewline.__super__.groupChangesSinceBufferCheckpoint.apply(this, arguments);
      return lastCursor.setBufferPosition(cursorPosition);
    };

    InsertAboveWithNewline.prototype.mutateText = function() {
      return this.editor.insertNewlineAbove();
    };

    InsertAboveWithNewline.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text.trimLeft(), {
        autoIndent: true
      });
    };

    return InsertAboveWithNewline;

  })(ActivateInsertMode);

  InsertBelowWithNewline = (function(superClass) {
    extend(InsertBelowWithNewline, superClass);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.extend();

    InsertBelowWithNewline.prototype.mutateText = function() {
      return this.editor.insertNewlineBelow();
    };

    return InsertBelowWithNewline;

  })(InsertAboveWithNewline);

  InsertByTarget = (function(superClass) {
    extend(InsertByTarget, superClass);

    function InsertByTarget() {
      return InsertByTarget.__super__.constructor.apply(this, arguments);
    }

    InsertByTarget.extend(false);

    InsertByTarget.prototype.requireTarget = true;

    InsertByTarget.prototype.which = null;

    InsertByTarget.prototype.initialize = function() {
      this.getCount();
      return InsertByTarget.__super__.initialize.apply(this, arguments);
    };

    InsertByTarget.prototype.execute = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          var i, len, ref1, results, selection;
          if (_this.vimState.isMode('visual')) {
            _this.modifySelection();
          }
          ref1 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            results.push(swrap(selection).setBufferPositionTo(_this.which));
          }
          return results;
        };
      })(this));
      return InsertByTarget.__super__.execute.apply(this, arguments);
    };

    InsertByTarget.prototype.modifySelection = function() {
      var end, i, len, newRange, range, ref1, ref2, results, selection, start;
      switch (this.vimState.submode) {
        case 'characterwise':
          this.vimState.selectBlockwise();
          return this.vimState.clearBlockwiseSelections();
        case 'linewise':
          this.editor.splitSelectionsIntoLines();
          ref1 = this.editor.getSelections();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            ref2 = range = selection.getBufferRange(), start = ref2.start, end = ref2.end;
            if (this.which === 'start') {
              newRange = [this.getFirstCharacterPositionForBufferRow(start.row), end];
            } else {
              newRange = shrinkRangeEndToBeforeNewLine(range);
            }
            results.push(selection.setBufferRange(newRange));
          }
          return results;
      }
    };

    return InsertByTarget;

  })(ActivateInsertMode);

  InsertAtStartOfTarget = (function(superClass) {
    extend(InsertAtStartOfTarget, superClass);

    function InsertAtStartOfTarget() {
      return InsertAtStartOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfTarget.extend();

    InsertAtStartOfTarget.prototype.which = 'start';

    return InsertAtStartOfTarget;

  })(InsertByTarget);

  InsertAtEndOfTarget = (function(superClass) {
    extend(InsertAtEndOfTarget, superClass);

    function InsertAtEndOfTarget() {
      return InsertAtEndOfTarget.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfTarget.extend();

    InsertAtEndOfTarget.prototype.which = 'end';

    return InsertAtEndOfTarget;

  })(InsertByTarget);

  InsertAtStartOfOccurrence = (function(superClass) {
    extend(InsertAtStartOfOccurrence, superClass);

    function InsertAtStartOfOccurrence() {
      return InsertAtStartOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfOccurrence.extend();

    InsertAtStartOfOccurrence.prototype.which = 'start';

    InsertAtStartOfOccurrence.prototype.occurrence = true;

    return InsertAtStartOfOccurrence;

  })(InsertByTarget);

  InsertAtEndOfOccurrence = (function(superClass) {
    extend(InsertAtEndOfOccurrence, superClass);

    function InsertAtEndOfOccurrence() {
      return InsertAtEndOfOccurrence.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfOccurrence.extend();

    InsertAtEndOfOccurrence.prototype.which = 'end';

    InsertAtEndOfOccurrence.prototype.occurrence = true;

    return InsertAtEndOfOccurrence;

  })(InsertByTarget);

  InsertAtStartOfSmartWord = (function(superClass) {
    extend(InsertAtStartOfSmartWord, superClass);

    function InsertAtStartOfSmartWord() {
      return InsertAtStartOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtStartOfSmartWord.extend();

    InsertAtStartOfSmartWord.prototype.which = 'start';

    InsertAtStartOfSmartWord.prototype.target = "MoveToPreviousSmartWord";

    return InsertAtStartOfSmartWord;

  })(InsertByTarget);

  InsertAtEndOfSmartWord = (function(superClass) {
    extend(InsertAtEndOfSmartWord, superClass);

    function InsertAtEndOfSmartWord() {
      return InsertAtEndOfSmartWord.__super__.constructor.apply(this, arguments);
    }

    InsertAtEndOfSmartWord.extend();

    InsertAtEndOfSmartWord.prototype.which = 'end';

    InsertAtEndOfSmartWord.prototype.target = "MoveToEndOfSmartWord";

    return InsertAtEndOfSmartWord;

  })(InsertByTarget);

  InsertAtPreviousFoldStart = (function(superClass) {
    extend(InsertAtPreviousFoldStart, superClass);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.description = "Move to previous fold start then enter insert-mode";

    InsertAtPreviousFoldStart.prototype.which = 'start';

    InsertAtPreviousFoldStart.prototype.target = 'MoveToPreviousFoldStart';

    return InsertAtPreviousFoldStart;

  })(InsertByTarget);

  InsertAtNextFoldStart = (function(superClass) {
    extend(InsertAtNextFoldStart, superClass);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.description = "Move to next fold start then enter insert-mode";

    InsertAtNextFoldStart.prototype.which = 'end';

    InsertAtNextFoldStart.prototype.target = 'MoveToNextFoldStart';

    return InsertAtNextFoldStart;

  })(InsertByTarget);

  Change = (function(superClass) {
    extend(Change, superClass);

    function Change() {
      return Change.__super__.constructor.apply(this, arguments);
    }

    Change.extend();

    Change.prototype.requireTarget = true;

    Change.prototype.trackChange = true;

    Change.prototype.supportInsertionCount = false;

    Change.prototype.mutateText = function() {
      var i, isLinewiseTarget, len, ref1, results, selection;
      isLinewiseTarget = swrap.detectWise(this.editor) === 'linewise';
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        this.setTextToRegisterForSelection(selection);
        if (isLinewiseTarget) {
          selection.insertText("\n", {
            autoIndent: true
          });
          results.push(selection.cursor.moveLeft());
        } else {
          results.push(selection.insertText('', {
            autoIndent: true
          }));
        }
      }
      return results;
    };

    return Change;

  })(ActivateInsertMode);

  ChangeOccurrence = (function(superClass) {
    extend(ChangeOccurrence, superClass);

    function ChangeOccurrence() {
      return ChangeOccurrence.__super__.constructor.apply(this, arguments);
    }

    ChangeOccurrence.extend();

    ChangeOccurrence.description = "Change all matching word within target range";

    ChangeOccurrence.prototype.occurrence = true;

    return ChangeOccurrence;

  })(Change);

  Substitute = (function(superClass) {
    extend(Substitute, superClass);

    function Substitute() {
      return Substitute.__super__.constructor.apply(this, arguments);
    }

    Substitute.extend();

    Substitute.prototype.target = 'MoveRight';

    return Substitute;

  })(Change);

  SubstituteLine = (function(superClass) {
    extend(SubstituteLine, superClass);

    function SubstituteLine() {
      return SubstituteLine.__super__.constructor.apply(this, arguments);
    }

    SubstituteLine.extend();

    SubstituteLine.prototype.wise = 'linewise';

    SubstituteLine.prototype.target = 'MoveToRelativeLine';

    return SubstituteLine;

  })(Change);

  ChangeLine = (function(superClass) {
    extend(ChangeLine, superClass);

    function ChangeLine() {
      return ChangeLine.__super__.constructor.apply(this, arguments);
    }

    ChangeLine.extend();

    return ChangeLine;

  })(SubstituteLine);

  ChangeToLastCharacterOfLine = (function(superClass) {
    extend(ChangeToLastCharacterOfLine, superClass);

    function ChangeToLastCharacterOfLine() {
      return ChangeToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    ChangeToLastCharacterOfLine.extend();

    ChangeToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    ChangeToLastCharacterOfLine.prototype.initialize = function() {
      if (this.isMode('visual', 'blockwise')) {
        this.acceptCurrentSelection = false;
        swrap.setReversedState(this.editor, false);
      }
      return ChangeToLastCharacterOfLine.__super__.initialize.apply(this, arguments);
    };

    return ChangeToLastCharacterOfLine;

  })(Change);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci1pbnNlcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxbUJBQUE7SUFBQTs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLE1BS0ksT0FBQSxDQUFRLFNBQVIsQ0FMSixFQUNFLG1DQURGLEVBRUUscUNBRkYsRUFHRSw2QkFIRixFQUlFOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsUUFBbEIsQ0FBMkIsVUFBM0I7O0VBTUw7Ozs7Ozs7SUFDSixrQkFBQyxDQUFBLE1BQUQsQ0FBQTs7aUNBQ0EsYUFBQSxHQUFlOztpQ0FDZixXQUFBLEdBQWE7O2lDQUNiLFlBQUEsR0FBYzs7aUNBQ2QscUJBQUEsR0FBdUI7O2lDQUN2QixlQUFBLEdBQWlCOztpQ0FFakIseUJBQUEsR0FBMkIsU0FBQTtBQUN6QixVQUFBO2FBQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLHlCQUF0QixDQUFnRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUMzRCxjQUFBO1VBRDZELE9BQUQ7VUFDNUQsSUFBYyxJQUFBLEtBQVEsUUFBdEI7QUFBQSxtQkFBQTs7VUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO1VBRUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixHQUFuQixFQUF3QixLQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBeEI7VUFDQSxlQUFBLEdBQWtCO1VBQ2xCLElBQUcsTUFBQSxHQUFTLEtBQUMsQ0FBQSx3QkFBRCxDQUEwQixRQUExQixDQUFaO1lB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c0JBQUQsR0FBMEI7UUFDMUIsS0FBSyxDQUFDLGdCQUFOLENBQXVCLElBQUMsQ0FBQSxNQUF4QixFQUFnQyxLQUFoQyxFQUpGOzthQUtBLDZEQUFBLFNBQUE7SUFOVTs7OztLQUo0QjtBQS9UMUMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1JhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgbW92ZUN1cnNvckxlZnRcbiAgbW92ZUN1cnNvclJpZ2h0XG4gIGxpbWl0TnVtYmVyXG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG59ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbk9wZXJhdG9yID0gcmVxdWlyZSgnLi9iYXNlJykuZ2V0Q2xhc3MoJ09wZXJhdG9yJylcblxuIyBJbnNlcnQgZW50ZXJpbmcgb3BlcmF0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW05PVEVdXG4jIFJ1bGU6IERvbid0IG1ha2UgYW55IHRleHQgbXV0YXRpb24gYmVmb3JlIGNhbGxpbmcgYEBzZWxlY3RUYXJnZXQoKWAuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGUgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIGZpbmFsU3VibW9kZTogbnVsbFxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQ6IHRydWVcbiAgZmxhc2hDaGVja3BvaW50OiAnY3VzdG9tJ1xuXG4gIG9ic2VydmVXaWxsRGVhY3RpdmF0ZU1vZGU6IC0+XG4gICAgZGlzcG9zYWJsZSA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlICh7bW9kZX0pID0+XG4gICAgICByZXR1cm4gdW5sZXNzIG1vZGUgaXMgJ2luc2VydCdcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgIEB2aW1TdGF0ZS5tYXJrLnNldCgnXicsIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkgIyBMYXN0IGluc2VydC1tb2RlIHBvc2l0aW9uXG4gICAgICB0ZXh0QnlVc2VySW5wdXQgPSAnJ1xuICAgICAgaWYgY2hhbmdlID0gQGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCgnaW5zZXJ0JylcbiAgICAgICAgQGxhc3RDaGFuZ2UgPSBjaGFuZ2VcbiAgICAgICAgY2hhbmdlZFJhbmdlID0gbmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKVxuICAgICAgICBAdmltU3RhdGUubWFyay5zZXRSYW5nZSgnWycsICddJywgY2hhbmdlZFJhbmdlKVxuICAgICAgICB0ZXh0QnlVc2VySW5wdXQgPSBjaGFuZ2UubmV3VGV4dFxuICAgICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldCgnLicsIHRleHQ6IHRleHRCeVVzZXJJbnB1dCkgIyBMYXN0IGluc2VydGVkIHRleHRcblxuICAgICAgXy50aW1lcyBAZ2V0SW5zZXJ0aW9uQ291bnQoKSwgPT5cbiAgICAgICAgdGV4dCA9IEB0ZXh0QnlPcGVyYXRvciArIHRleHRCeVVzZXJJbnB1dFxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgYXV0b0luZGVudDogdHJ1ZSlcblxuICAgICAgIyBUaGlzIGN1cnNvciBzdGF0ZSBpcyByZXN0b3JlZCBvbiB1bmRvLlxuICAgICAgIyBTbyBjdXJzb3Igc3RhdGUgaGFzIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIG5leHQgZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KClcbiAgICAgIGlmIEBnZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJylcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgICMgZ3JvdXBpbmcgY2hhbmdlcyBmb3IgdW5kbyBjaGVja3BvaW50IG5lZWQgdG8gY29tZSBsYXN0XG4gICAgICBpZiBAZ2V0Q29uZmlnKCdncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGUnKVxuICAgICAgICBAZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcblxuICAjIFdoZW4gZWFjaCBtdXRhaW9uJ3MgZXh0ZW50IGlzIG5vdCBpbnRlcnNlY3RpbmcsIG11aXRpcGxlIGNoYW5nZXMgYXJlIHJlY29yZGVkXG4gICMgZS5nXG4gICMgIC0gTXVsdGljdXJzb3JzIGVkaXRcbiAgIyAgLSBDdXJzb3IgbW92ZWQgaW4gaW5zZXJ0LW1vZGUoZS5nIGN0cmwtZiwgY3RybC1iKVxuICAjIEJ1dCBJIGRvbid0IGNhcmUgbXVsdGlwbGUgY2hhbmdlcyBqdXN0IGJlY2F1c2UgSSdtIGxhenkoc28gbm90IHBlcmZlY3QgaW1wbGVtZW50YXRpb24pLlxuICAjIEkgb25seSB0YWtlIGNhcmUgb2Ygb25lIGNoYW5nZSBoYXBwZW5lZCBhdCBlYXJsaWVzdCh0b3BDdXJzb3IncyBjaGFuZ2UpIHBvc2l0aW9uLlxuICAjIFRoYXRzJyB3aHkgSSBzYXZlIHRvcEN1cnNvcidzIHBvc2l0aW9uIHRvIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgdG8gY29tcGFyZSB0cmF2ZXJzYWwgdG8gZGVsZXRpb25TdGFydFxuICAjIFdoeSBJIHVzZSB0b3BDdXJzb3IncyBjaGFuZ2U/IEp1c3QgYmVjYXVzZSBpdCdzIGVhc3kgdG8gdXNlIGZpcnN0IGNoYW5nZSByZXR1cm5lZCBieSBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoKS5cbiAgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBjaGVja3BvaW50ID0gQGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICBAZWRpdG9yLmJ1ZmZlci5nZXRDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpWzBdXG5cbiAgIyBbQlVHLUJVVC1PS10gUmVwbGF5aW5nIHRleHQtZGVsZXRpb24tb3BlcmF0aW9uIGlzIG5vdCBjb21wYXRpYmxlIHRvIHB1cmUgVmltLlxuICAjIFB1cmUgVmltIHJlY29yZCBhbGwgb3BlcmF0aW9uIGluIGluc2VydC1tb2RlIGFzIGtleXN0cm9rZSBsZXZlbCBhbmQgY2FuIGRpc3Rpbmd1aXNoXG4gICMgY2hhcmFjdGVyIGRlbGV0ZWQgYnkgYERlbGV0ZWAgb3IgYnkgYGN0cmwtdWAuXG4gICMgQnV0IEkgY2FuIG5vdCBhbmQgZG9uJ3QgdHJ5aW5nIHRvIG1pbmljIHRoaXMgbGV2ZWwgb2YgY29tcGF0aWJpbGl0eS5cbiAgIyBTbyBiYXNpY2FsbHkgZGVsZXRpb24tZG9uZS1pbi1vbmUgaXMgZXhwZWN0ZWQgdG8gd29yayB3ZWxsLlxuICByZXBsYXlMYXN0Q2hhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIEBsYXN0Q2hhbmdlP1xuICAgICAge3N0YXJ0LCBuZXdFeHRlbnQsIG9sZEV4dGVudCwgbmV3VGV4dH0gPSBAbGFzdENoYW5nZVxuICAgICAgdW5sZXNzIG9sZEV4dGVudC5pc1plcm8oKVxuICAgICAgICB0cmF2ZXJzYWxUb1N0YXJ0T2ZEZWxldGUgPSBzdGFydC50cmF2ZXJzYWxGcm9tKEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQpXG4gICAgICAgIGRlbGV0aW9uU3RhcnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhdmVyc2UodHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlKVxuICAgICAgICBkZWxldGlvbkVuZCA9IGRlbGV0aW9uU3RhcnQudHJhdmVyc2Uob2xkRXh0ZW50KVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW2RlbGV0aW9uU3RhcnQsIGRlbGV0aW9uRW5kXSlcbiAgICBlbHNlXG4gICAgICBuZXdUZXh0ID0gJydcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChuZXdUZXh0LCBhdXRvSW5kZW50OiB0cnVlKVxuXG4gICMgY2FsbGVkIHdoZW4gcmVwZWF0ZWRcbiAgIyBbRklYTUVdIHRvIHVzZSByZXBsYXlMYXN0Q2hhbmdlIGluIHJlcGVhdEluc2VydCBvdmVycmlkaW5nIHN1YmNsYXNzcy5cbiAgcmVwZWF0SW5zZXJ0OiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIEByZXBsYXlMYXN0Q2hhbmdlKHNlbGVjdGlvbilcblxuICBnZXRJbnNlcnRpb25Db3VudDogLT5cbiAgICBAaW5zZXJ0aW9uQ291bnQgPz0gaWYgQHN1cHBvcnRJbnNlcnRpb25Db3VudCB0aGVuIEBnZXRDb3VudCgtMSkgZWxzZSAwXG4gICAgIyBBdm9pZCBmcmVlemluZyBieSBhY2NjaWRlbnRhbCBiaWcgY291bnQoZS5nLiBgNTU1NTU1NTU1NTU1NWlgKSwgU2VlICM1NjAsICM1OTZcbiAgICBsaW1pdE51bWJlcihAaW5zZXJ0aW9uQ291bnQsIG1heDogMTAwKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQGlzUmVwZWF0ZWQoKVxuICAgICAgQGZsYXNoVGFyZ2V0ID0gQHRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgICBAc2VsZWN0VGFyZ2V0KCkgaWYgQGlzUmVxdWlyZVRhcmdldCgpXG4gICAgICAgIEBtdXRhdGVUZXh0PygpXG4gICAgICAgIG11dGF0ZWRSYW5nZXMgPSBbXVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgbXV0YXRlZFJhbmdlcy5wdXNoKEByZXBlYXRJbnNlcnQoc2VsZWN0aW9uLCBAbGFzdENoYW5nZT8ubmV3VGV4dCA/ICcnKSlcbiAgICAgICAgICBtb3ZlQ3Vyc29yTGVmdChzZWxlY3Rpb24uY3Vyc29yKVxuICAgICAgICBAbXV0YXRpb25NYW5hZ2VyLnNldEJ1ZmZlclJhbmdlc0ZvckN1c3RvbUNoZWNrcG9pbnQobXV0YXRlZFJhbmdlcylcblxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUnKVxuICAgICAgICBAdmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgIGVsc2VcbiAgICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKSBpZiBAaXNSZXF1aXJlVGFyZ2V0KClcbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIEBzZWxlY3RUYXJnZXQoKSBpZiBAaXNSZXF1aXJlVGFyZ2V0KClcbiAgICAgIEBvYnNlcnZlV2lsbERlYWN0aXZhdGVNb2RlKClcblxuICAgICAgQG11dGF0ZVRleHQ/KClcblxuICAgICAgaWYgQGdldEluc2VydGlvbkNvdW50KCkgPiAwXG4gICAgICAgIEB0ZXh0QnlPcGVyYXRvciA9IEBnZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoJ3VuZG8nKT8ubmV3VGV4dCA/ICcnXG5cbiAgICAgIEBjcmVhdGVCdWZmZXJDaGVja3BvaW50KCdpbnNlcnQnKVxuICAgICAgdG9wQ3Vyc29yID0gQGVkaXRvci5nZXRDdXJzb3JzT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVswXVxuICAgICAgQHRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydCA9IHRvcEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUoJ2luc2VydCcsIEBmaW5hbFN1Ym1vZGUpXG5cbmNsYXNzIEFjdGl2YXRlUmVwbGFjZU1vZGUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGZpbmFsU3VibW9kZTogJ3JlcGxhY2UnXG5cbiAgcmVwZWF0SW5zZXJ0OiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIGZvciBjaGFyIGluIHRleHQgd2hlbiAoY2hhciBpc250IFwiXFxuXCIpXG4gICAgICBicmVhayBpZiBzZWxlY3Rpb24uY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBhdXRvSW5kZW50OiBmYWxzZSlcblxuY2xhc3MgSW5zZXJ0QWZ0ZXIgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgbW92ZUN1cnNvclJpZ2h0KGN1cnNvcikgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIHN1cGVyXG5cbiMga2V5OiAnZyBJJyBpbiBhbGwgbW9kZVxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgWydjaGFyYWN0ZXJ3aXNlJywgJ2xpbmV3aXNlJ10pXG4gICAgICBAZWRpdG9yLnNwbGl0U2VsZWN0aW9uc0ludG9MaW5lcygpXG4gICAgQGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIHN1cGVyXG5cbiMga2V5OiBub3JtYWwgJ0EnXG5jbGFzcyBJbnNlcnRBZnRlckVuZE9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcblxuIyBrZXk6IG5vcm1hbCAnSSdcbmNsYXNzIEluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZCgpXG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICAgIHN1cGVyXG5cbmNsYXNzIEluc2VydEF0TGFzdEluc2VydCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBpZiAocG9pbnQgPSBAdmltU3RhdGUubWFyay5nZXQoJ14nKSlcbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICBAZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oe2NlbnRlcjogdHJ1ZX0pXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcblxuICAjIFRoaXMgaXMgZm9yIGBvYCBhbmQgYE9gIG9wZXJhdG9yLlxuICAjIE9uIHVuZG8vcmVkbyBwdXQgY3Vyc29yIGF0IG9yaWdpbmFsIHBvaW50IHdoZXJlIHVzZXIgdHlwZSBgb2Agb3IgYE9gLlxuICBncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQ6IC0+XG4gICAgbGFzdEN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY3Vyc29yUG9zaXRpb24gPSBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIoKSlcblxuICAgIHN1cGVyXG5cbiAgICBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvc2l0aW9uKVxuXG4gIG11dGF0ZVRleHQ6IC0+XG4gICAgQGVkaXRvci5pbnNlcnROZXdsaW5lQWJvdmUoKVxuXG4gIHJlcGVhdEluc2VydDogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LnRyaW1MZWZ0KCksIGF1dG9JbmRlbnQ6IHRydWUpXG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lXG4gIEBleHRlbmQoKVxuICBtdXRhdGVUZXh0OiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcblxuIyBBZHZhbmNlZCBJbnNlcnRpb25cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5zZXJ0QnlUYXJnZXQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICB3aGljaDogbnVsbCAjIG9uZSBvZiBbJ3N0YXJ0JywgJ2VuZCcsICdoZWFkJywgJ3RhaWwnXVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgIyBIQUNLXG4gICAgIyBXaGVuIGcgaSBpcyBtYXBwZWQgdG8gYGluc2VydC1hdC1zdGFydC1vZi10YXJnZXRgLlxuICAgICMgYGcgaSAzIGxgIHN0YXJ0IGluc2VydCBhdCAzIGNvbHVtbiByaWdodCBwb3NpdGlvbi5cbiAgICAjIEluIHRoaXMgY2FzZSwgd2UgZG9uJ3Qgd2FudCByZXBlYXQgaW5zZXJ0aW9uIDMgdGltZXMuXG4gICAgIyBUaGlzIEBnZXRDb3VudCgpIGNhbGwgY2FjaGUgbnVtYmVyIGF0IHRoZSB0aW1pbmcgQkVGT1JFICczJyBpcyBzcGVjaWZpZWQuXG4gICAgQGdldENvdW50KClcbiAgICBzdXBlclxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICBAbW9kaWZ5U2VsZWN0aW9uKCkgaWYgQHZpbVN0YXRlLmlzTW9kZSgndmlzdWFsJylcbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJQb3NpdGlvblRvKEB3aGljaClcbiAgICBzdXBlclxuXG4gIG1vZGlmeVNlbGVjdGlvbjogLT5cbiAgICBzd2l0Y2ggQHZpbVN0YXRlLnN1Ym1vZGVcbiAgICAgIHdoZW4gJ2NoYXJhY3Rlcndpc2UnXG4gICAgICAgICMgYEkob3IgQSlgIGlzIHNob3J0LWhhbmQgb2YgYGN0cmwtdiBJKG9yIEEpYFxuICAgICAgICBAdmltU3RhdGUuc2VsZWN0QmxvY2t3aXNlKClcbiAgICAgICAgQHZpbVN0YXRlLmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucygpICMganVzdCByZXNldCB2aW1TdGF0ZSdzIHN0b3JhZ2UuXG5cbiAgICAgIHdoZW4gJ2xpbmV3aXNlJ1xuICAgICAgICBAZWRpdG9yLnNwbGl0U2VsZWN0aW9uc0ludG9MaW5lcygpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICB7c3RhcnQsIGVuZH0gPSByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgICAgaWYgQHdoaWNoIGlzICdzdGFydCdcbiAgICAgICAgICAgIG5ld1JhbmdlID0gW0BnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0LnJvdyksIGVuZF1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBuZXdSYW5nZSA9IHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lKHJhbmdlKVxuXG4gICAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlKVxuXG4jIGtleTogJ0knLCBVc2VkIGluICd2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlJywgdmlzdWFsLW1vZGUuYmxvY2t3aXNlXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZUYXJnZXQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdzdGFydCdcblxuIyBrZXk6ICdBJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsICd2aXN1YWwtbW9kZS5ibG9ja3dpc2UnXG5jbGFzcyBJbnNlcnRBdEVuZE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnZW5kJ1xuXG5jbGFzcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG4gIG9jY3VycmVuY2U6IHRydWVcblxuY2xhc3MgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG4gIG9jY3VycmVuY2U6IHRydWVcblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXRcbiAgQGV4dGVuZCgpXG4gIHdoaWNoOiAnc3RhcnQnXG4gIHRhcmdldDogXCJNb3ZlVG9QcmV2aW91c1NtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0RW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgd2hpY2g6ICdlbmQnXG4gIHRhcmdldDogXCJNb3ZlVG9FbmRPZlNtYXJ0V29yZFwiXG5cbmNsYXNzIEluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBJbnNlcnRCeVRhcmdldFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIk1vdmUgdG8gcHJldmlvdXMgZm9sZCBzdGFydCB0aGVuIGVudGVyIGluc2VydC1tb2RlXCJcbiAgd2hpY2g6ICdzdGFydCdcbiAgdGFyZ2V0OiAnTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQnXG5cbmNsYXNzIEluc2VydEF0TmV4dEZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0XG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiTW92ZSB0byBuZXh0IGZvbGQgc3RhcnQgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiXG4gIHdoaWNoOiAnZW5kJ1xuICB0YXJnZXQ6ICdNb3ZlVG9OZXh0Rm9sZFN0YXJ0J1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZVxuICBAZXh0ZW5kKClcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdXBwb3J0SW5zZXJ0aW9uQ291bnQ6IGZhbHNlXG5cbiAgbXV0YXRlVGV4dDogLT5cbiAgICAjIEFsbHdheXMgZHluYW1pY2FsbHkgZGV0ZXJtaW5lIHNlbGVjdGlvbiB3aXNlIHd0aG91dCBjb25zdWx0aW5nIHRhcmdldC53aXNlXG4gICAgIyBSZWFzb246IHdoZW4gYGMgaSB7YCwgd2lzZSBpcyAnY2hhcmFjdGVyd2lzZScsIGJ1dCBhY3R1YWxseSBzZWxlY3RlZCByYW5nZSBpcyAnbGluZXdpc2UnXG4gICAgIyAgIHtcbiAgICAjICAgICBhXG4gICAgIyAgIH1cbiAgICBpc0xpbmV3aXNlVGFyZ2V0ID0gc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSBpcyAnbGluZXdpc2UnXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgQHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmIGlzTGluZXdpc2VUYXJnZXRcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIiwgYXV0b0luZGVudDogdHJ1ZSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KCcnLCBhdXRvSW5kZW50OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIGFsbCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbmNsYXNzIFN1YnN0aXR1dGUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgU3Vic3RpdHV0ZUxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHdpc2U6ICdsaW5ld2lzZScgIyBbRklYTUVdIHRvIHJlLW92ZXJyaWRlIHRhcmdldC53aXNlIGluIHZpc3VhbC1tb2RlXG4gIHRhcmdldDogJ01vdmVUb1JlbGF0aXZlTGluZSdcblxuIyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lXG4gIEBleHRlbmQoKVxuXG5jbGFzcyBDaGFuZ2VUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBDaGFuZ2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICMgRklYTUUgTWF5YmUgYmVjYXVzZSBvZiBidWcgb2YgQ3VycmVudFNlbGVjdGlvbixcbiAgICAgICMgd2UgdXNlIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgYXMgdGFyZ2V0XG4gICAgICBAYWNjZXB0Q3VycmVudFNlbGVjdGlvbiA9IGZhbHNlXG4gICAgICBzd3JhcC5zZXRSZXZlcnNlZFN0YXRlKEBlZGl0b3IsIGZhbHNlKSAjIEVuc3VyZSBhbGwgc2VsZWN0aW9ucyB0byB1bi1yZXZlcnNlZFxuICAgIHN1cGVyXG4iXX0=
