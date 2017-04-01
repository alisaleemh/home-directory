(function() {
  var AddBlankLineAbove, AddBlankLineBelow, AddPresetOccurrenceFromLastOccurrencePattern, Base, CreatePersistentSelection, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteLine, DeleteRight, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Operator, PutAfter, PutBefore, Select, SelectLatestChange, SelectOccurrence, SelectPersistentSelection, SelectPreviousSelection, TogglePersistentSelection, TogglePresetOccurrence, TogglePresetSubwordOccurrence, Yank, YankLine, YankToLastCharacterOfLine, _, ensureEndsWithNewLineForBufferRow, getSubwordPatternAtBufferPosition, getValidVimBufferRow, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, insertTextAtBufferPosition, isEmptyRow, moveCursorToFirstCharacterAtRow, ref, setBufferRow, swrap,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./utils'), haveSomeNonEmptySelection = ref.haveSomeNonEmptySelection, getValidVimBufferRow = ref.getValidVimBufferRow, isEmptyRow = ref.isEmptyRow, getWordPatternAtBufferPosition = ref.getWordPatternAtBufferPosition, getSubwordPatternAtBufferPosition = ref.getSubwordPatternAtBufferPosition, insertTextAtBufferPosition = ref.insertTextAtBufferPosition, setBufferRow = ref.setBufferRow, moveCursorToFirstCharacterAtRow = ref.moveCursorToFirstCharacterAtRow, ensureEndsWithNewLineForBufferRow = ref.ensureEndsWithNewLineForBufferRow;

  swrap = require('./selection-wrapper');

  Base = require('./base');

  Operator = (function(superClass) {
    extend(Operator, superClass);

    Operator.extend(false);

    Operator.prototype.requireTarget = true;

    Operator.prototype.recordable = true;

    Operator.prototype.wise = null;

    Operator.prototype.occurrence = false;

    Operator.prototype.occurrenceType = 'base';

    Operator.prototype.flashTarget = true;

    Operator.prototype.flashCheckpoint = 'did-finish';

    Operator.prototype.flashType = 'operator';

    Operator.prototype.flashTypeForOccurrence = 'operator-occurrence';

    Operator.prototype.trackChange = false;

    Operator.prototype.patternForOccurrence = null;

    Operator.prototype.stayAtSamePosition = null;

    Operator.prototype.stayOptionName = null;

    Operator.prototype.stayByMarker = false;

    Operator.prototype.restorePositions = true;

    Operator.prototype.acceptPresetOccurrence = true;

    Operator.prototype.acceptPersistentSelection = true;

    Operator.prototype.acceptCurrentSelection = true;

    Operator.prototype.bufferCheckpointByPurpose = null;

    Operator.prototype.mutateSelectionOrderd = false;

    Operator.prototype.supportEarlySelect = false;

    Operator.prototype.targetSelected = null;

    Operator.prototype.canEarlySelect = function() {
      return this.supportEarlySelect && !this.isRepeated();
    };

    Operator.prototype.resetState = function() {
      this.targetSelected = null;
      return this.occurrenceSelected = false;
    };

    Operator.prototype.createBufferCheckpoint = function(purpose) {
      if (this.bufferCheckpointByPurpose == null) {
        this.bufferCheckpointByPurpose = {};
      }
      return this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    };

    Operator.prototype.getBufferCheckpoint = function(purpose) {
      var ref1;
      return (ref1 = this.bufferCheckpointByPurpose) != null ? ref1[purpose] : void 0;
    };

    Operator.prototype.deleteBufferCheckpoint = function(purpose) {
      if (this.bufferCheckpointByPurpose != null) {
        return delete this.bufferCheckpointByPurpose[purpose];
      }
    };

    Operator.prototype.groupChangesSinceBufferCheckpoint = function(purpose) {
      var checkpoint;
      if (checkpoint = this.getBufferCheckpoint(purpose)) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        return this.deleteBufferCheckpoint(purpose);
      }
    };

    Operator.prototype.needStay = function() {
      var ref1;
      return ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.isOccurrence() && this.getConfig('stayOnOccurrence')) || this.getConfig(this.stayOptionName);
    };

    Operator.prototype.needStayOnRestore = function() {
      var ref1;
      return ((ref1 = this.stayAtSamePosition) != null ? ref1 : this.isOccurrence() && this.getConfig('stayOnOccurrence') && this.occurrenceSelected) || this.getConfig(this.stayOptionName);
    };

    Operator.prototype.isOccurrence = function() {
      return this.occurrence;
    };

    Operator.prototype.setOccurrence = function(occurrence) {
      this.occurrence = occurrence;
      return this.occurrence;
    };

    Operator.prototype.setMarkForChange = function(range) {
      return this.vimState.mark.setRange('[', ']', range);
    };

    Operator.prototype.needFlash = function() {
      var mode, ref1, ref2, submode;
      if (!this.flashTarget) {
        return;
      }
      ref1 = this.vimState, mode = ref1.mode, submode = ref1.submode;
      if (mode !== 'visual' || (this.target.isMotion() && submode !== this.target.wise)) {
        return this.getConfig('flashOnOperate') && (ref2 = this.getName(), indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref2) < 0);
      }
    };

    Operator.prototype.flashIfNecessary = function(ranges) {
      if (!this.needFlash()) {
        return;
      }
      return this.vimState.flash(ranges, {
        type: this.getFlashType()
      });
    };

    Operator.prototype.flashChangeIfNecessary = function() {
      if (!this.needFlash()) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var ranges;
          if (_this.flashCheckpoint === 'did-finish') {
            ranges = _this.mutationManager.getMarkerBufferRanges().filter(function(range) {
              return !range.isEmpty();
            });
          } else {
            ranges = _this.mutationManager.getBufferRangesForCheckpoint(_this.flashCheckpoint);
          }
          return _this.vimState.flash(ranges, {
            type: _this.getFlashType()
          });
        };
      })(this));
    };

    Operator.prototype.getFlashType = function() {
      if (this.occurrenceSelected) {
        return this.flashTypeForOccurrence;
      } else {
        return this.flashType;
      }
    };

    Operator.prototype.trackChangeIfNecessary = function() {
      if (!this.trackChange) {
        return;
      }
      return this.onDidFinishOperation((function(_this) {
        return function() {
          var marker, ref1;
          if (marker = (ref1 = _this.mutationManager.getMutationForSelection(_this.editor.getLastSelection())) != null ? ref1.marker : void 0) {
            return _this.setMarkForChange(marker.getBufferRange());
          }
        };
      })(this));
    };

    function Operator() {
      var ref1, ref2;
      Operator.__super__.constructor.apply(this, arguments);
      ref1 = this.vimState, this.mutationManager = ref1.mutationManager, this.occurrenceManager = ref1.occurrenceManager, this.persistentSelection = ref1.persistentSelection;
      this.subscribeResetOccurrencePatternIfNeeded();
      this.initialize();
      this.onDidSetOperatorModifier(this.setModifier.bind(this));
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.setOccurrence(true);
      }
      if (this.isOccurrence() && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern((ref2 = this.patternForOccurrence) != null ? ref2 : this.getPatternForOccurrenceType(this.occurrenceType));
      }
      if (this.selectPersistentSelectionIfNecessary()) {
        if (this.isMode('visual')) {
          null;
        } else {
          this.vimState.modeManager.activate('visual', swrap.detectWise(this.editor));
        }
      }
      if (this.isMode('visual') && this.acceptCurrentSelection) {
        this.target = 'CurrentSelection';
      }
      if (_.isString(this.target)) {
        this.setTarget(this["new"](this.target));
      }
    }

    Operator.prototype.subscribeResetOccurrencePatternIfNeeded = function() {
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        return this.onDidResetOperationStack((function(_this) {
          return function() {
            return _this.occurrenceManager.resetPatterns();
          };
        })(this));
      }
    };

    Operator.prototype.setModifier = function(options) {
      var pattern;
      if (options.wise != null) {
        this.wise = options.wise;
        return;
      }
      if (options.occurrence != null) {
        this.setOccurrence(options.occurrence);
        if (this.isOccurrence()) {
          this.occurrenceType = options.occurrenceType;
          pattern = this.getPatternForOccurrenceType(this.occurrenceType);
          this.occurrenceManager.addPattern(pattern, {
            reset: true,
            occurrenceType: this.occurrenceType
          });
          return this.onDidResetOperationStack((function(_this) {
            return function() {
              return _this.occurrenceManager.resetPatterns();
            };
          })(this));
        }
      }
    };

    Operator.prototype.selectPersistentSelectionIfNecessary = function() {
      if (this.acceptPersistentSelection && this.getConfig('autoSelectPersistentSelectionOnOperate') && !this.persistentSelection.isEmpty()) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        swrap.saveProperties(this.editor);
        return true;
      } else {
        return false;
      }
    };

    Operator.prototype.getPatternForOccurrenceType = function(occurrenceType) {
      switch (occurrenceType) {
        case 'base':
          return getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
        case 'subword':
          return getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      }
    };

    Operator.prototype.setTarget = function(target) {
      this.target = target;
      this.target.setOperator(this);
      this.emitDidSetTarget(this);
      if (this.canEarlySelect()) {
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint('undo');
        this.selectTarget();
      }
      return this;
    };

    Operator.prototype.setTextToRegisterForSelection = function(selection) {
      return this.setTextToRegister(selection.getText(), selection);
    };

    Operator.prototype.setTextToRegister = function(text, selection) {
      if (this.target.isLinewise() && (!text.endsWith('\n'))) {
        text += "\n";
      }
      if (text) {
        return this.vimState.register.set({
          text: text,
          selection: selection
        });
      }
    };

    Operator.prototype.normalizeSelectionsIfNecessary = function() {
      var ref1;
      if (((ref1 = this.target) != null ? ref1.isMotion() : void 0) && this.isMode('visual')) {
        return this.vimState.modeManager.normalizeSelections();
      }
    };

    Operator.prototype.startMutation = function(fn) {
      if (this.canEarlySelect()) {
        fn();
        this.emitWillFinishMutation();
        this.groupChangesSinceBufferCheckpoint('undo');
      } else {
        this.normalizeSelectionsIfNecessary();
        this.editor.transact((function(_this) {
          return function() {
            fn();
            return _this.emitWillFinishMutation();
          };
        })(this));
      }
      return this.emitDidFinishMutation();
    };

    Operator.prototype.execute = function() {
      this.startMutation((function(_this) {
        return function() {
          var i, len, selection, selections;
          if (_this.selectTarget()) {
            if (_this.mutateSelectionOrderd) {
              selections = _this.editor.getSelectionsOrderedByBufferPosition();
            } else {
              selections = _this.editor.getSelections();
            }
            for (i = 0, len = selections.length; i < len; i++) {
              selection = selections[i];
              _this.mutateSelection(selection);
            }
            return _this.restoreCursorPositionsIfNecessary();
          }
        };
      })(this));
      return this.activateMode('normal');
    };

    Operator.prototype.selectTarget = function() {
      var base;
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({
        useMarker: this.needStay() && this.stayByMarker
      });
      if (this.wise != null) {
        if (typeof (base = this.target).forceWise === "function") {
          base.forceWise(this.wise);
        }
      }
      this.emitWillSelectTarget();
      this.mutationManager.setCheckpoint('will-select');
      if (this.isRepeated() && this.isOccurrence() && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, {
          occurrenceType: this.occurrenceType
        });
      }
      this.target.execute();
      this.mutationManager.setCheckpoint('did-select');
      if (this.isOccurrence()) {
        if (this.patternForOccurrence == null) {
          this.patternForOccurrence = this.occurrenceManager.buildPattern();
        }
        if (this.occurrenceManager.select()) {
          swrap.clearProperties(this.editor);
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint('did-select-occurrence');
        }
      }
      if (haveSomeNonEmptySelection(this.editor) || this.target.getName() === "Empty") {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
        this.targetSelected = true;
        return true;
      } else {
        this.emitDidFailSelectTarget();
        this.targetSelected = false;
        return false;
      }
    };

    Operator.prototype.restoreCursorPositionsIfNecessary = function() {
      var options, ref1;
      if (!this.restorePositions) {
        return;
      }
      options = {
        stay: this.needStayOnRestore(),
        occurrenceSelected: this.occurrenceSelected,
        isBlockwise: (ref1 = this.target) != null ? typeof ref1.isBlockwise === "function" ? ref1.isBlockwise() : void 0 : void 0
      };
      this.mutationManager.restoreCursorPositions(options);
      return this.emitDidRestoreCursorPositions();
    };

    return Operator;

  })(Base);

  Select = (function(superClass) {
    extend(Select, superClass);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.extend(false);

    Select.prototype.flashTarget = false;

    Select.prototype.recordable = false;

    Select.prototype.acceptPresetOccurrence = false;

    Select.prototype.acceptPersistentSelection = false;

    Select.prototype.execute = function() {
      var wise;
      this.startMutation(this.selectTarget.bind(this));
      if (this.target.isTextObject() && (wise = this.target.getWise())) {
        if (this.isMode('visual')) {
          switch (wise) {
            case 'characterwise':
              swrap.saveProperties(this.editor);
              break;
            case 'linewise':
              swrap.fixPropertiesForLinewise(this.editor);
          }
        }
        return this.activateModeIfNecessary('visual', wise);
      }
    };

    return Select;

  })(Operator);

  SelectLatestChange = (function(superClass) {
    extend(SelectLatestChange, superClass);

    function SelectLatestChange() {
      return SelectLatestChange.__super__.constructor.apply(this, arguments);
    }

    SelectLatestChange.extend();

    SelectLatestChange.description = "Select latest yanked or changed range";

    SelectLatestChange.prototype.target = 'ALatestChange';

    return SelectLatestChange;

  })(Select);

  SelectPreviousSelection = (function(superClass) {
    extend(SelectPreviousSelection, superClass);

    function SelectPreviousSelection() {
      return SelectPreviousSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPreviousSelection.extend();

    SelectPreviousSelection.prototype.target = "PreviousSelection";

    return SelectPreviousSelection;

  })(Select);

  SelectPersistentSelection = (function(superClass) {
    extend(SelectPersistentSelection, superClass);

    function SelectPersistentSelection() {
      return SelectPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    SelectPersistentSelection.extend();

    SelectPersistentSelection.description = "Select persistent-selection and clear all persistent-selection, it's like convert to real-selection";

    SelectPersistentSelection.prototype.target = "APersistentSelection";

    return SelectPersistentSelection;

  })(Select);

  SelectOccurrence = (function(superClass) {
    extend(SelectOccurrence, superClass);

    function SelectOccurrence() {
      return SelectOccurrence.__super__.constructor.apply(this, arguments);
    }

    SelectOccurrence.extend();

    SelectOccurrence.description = "Add selection onto each matching word within target range";

    SelectOccurrence.prototype.occurrence = true;

    SelectOccurrence.prototype.execute = function() {
      return this.startMutation((function(_this) {
        return function() {
          if (_this.selectTarget()) {
            return _this.activateModeIfNecessary('visual', swrap.detectWise(_this.editor));
          }
        };
      })(this));
    };

    return SelectOccurrence;

  })(Operator);

  CreatePersistentSelection = (function(superClass) {
    extend(CreatePersistentSelection, superClass);

    function CreatePersistentSelection() {
      return CreatePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    CreatePersistentSelection.extend();

    CreatePersistentSelection.prototype.flashTarget = false;

    CreatePersistentSelection.prototype.stayAtSamePosition = true;

    CreatePersistentSelection.prototype.acceptPresetOccurrence = false;

    CreatePersistentSelection.prototype.acceptPersistentSelection = false;

    CreatePersistentSelection.prototype.execute = function() {
      this.restorePositions = !this.isMode('visual', 'blockwise');
      return CreatePersistentSelection.__super__.execute.apply(this, arguments);
    };

    CreatePersistentSelection.prototype.mutateSelection = function(selection) {
      return this.persistentSelection.markBufferRange(selection.getBufferRange());
    };

    return CreatePersistentSelection;

  })(Operator);

  TogglePersistentSelection = (function(superClass) {
    extend(TogglePersistentSelection, superClass);

    function TogglePersistentSelection() {
      return TogglePersistentSelection.__super__.constructor.apply(this, arguments);
    }

    TogglePersistentSelection.extend();

    TogglePersistentSelection.prototype.isComplete = function() {
      var point;
      point = this.editor.getCursorBufferPosition();
      this.markerToRemove = this.persistentSelection.getMarkerAtPoint(point);
      if (this.markerToRemove) {
        return true;
      } else {
        return TogglePersistentSelection.__super__.isComplete.apply(this, arguments);
      }
    };

    TogglePersistentSelection.prototype.execute = function() {
      if (this.markerToRemove) {
        return this.markerToRemove.destroy();
      } else {
        return TogglePersistentSelection.__super__.execute.apply(this, arguments);
      }
    };

    return TogglePersistentSelection;

  })(CreatePersistentSelection);

  TogglePresetOccurrence = (function(superClass) {
    extend(TogglePresetOccurrence, superClass);

    function TogglePresetOccurrence() {
      return TogglePresetOccurrence.__super__.constructor.apply(this, arguments);
    }

    TogglePresetOccurrence.extend();

    TogglePresetOccurrence.prototype.flashTarget = false;

    TogglePresetOccurrence.prototype.requireTarget = false;

    TogglePresetOccurrence.prototype.acceptPresetOccurrence = false;

    TogglePresetOccurrence.prototype.acceptPersistentSelection = false;

    TogglePresetOccurrence.prototype.occurrenceType = 'base';

    TogglePresetOccurrence.prototype.execute = function() {
      var isNarrowed, marker, pattern;
      if (marker = this.occurrenceManager.getMarkerAtPoint(this.editor.getCursorBufferPosition())) {
        return this.occurrenceManager.destroyMarkers([marker]);
      } else {
        pattern = null;
        isNarrowed = this.vimState.modeManager.isNarrowed();
        if (this.isMode('visual') && !isNarrowed) {
          this.occurrenceType = 'base';
          pattern = new RegExp(_.escapeRegExp(this.editor.getSelectedText()), 'g');
        } else {
          pattern = this.getPatternForOccurrenceType(this.occurrenceType);
        }
        this.occurrenceManager.addPattern(pattern, {
          occurrenceType: this.occurrenceType
        });
        this.occurrenceManager.saveLastPattern(this.occurrenceType);
        if (!isNarrowed) {
          return this.activateMode('normal');
        }
      }
    };

    return TogglePresetOccurrence;

  })(Operator);

  TogglePresetSubwordOccurrence = (function(superClass) {
    extend(TogglePresetSubwordOccurrence, superClass);

    function TogglePresetSubwordOccurrence() {
      return TogglePresetSubwordOccurrence.__super__.constructor.apply(this, arguments);
    }

    TogglePresetSubwordOccurrence.extend();

    TogglePresetSubwordOccurrence.prototype.occurrenceType = 'subword';

    return TogglePresetSubwordOccurrence;

  })(TogglePresetOccurrence);

  AddPresetOccurrenceFromLastOccurrencePattern = (function(superClass) {
    extend(AddPresetOccurrenceFromLastOccurrencePattern, superClass);

    function AddPresetOccurrenceFromLastOccurrencePattern() {
      return AddPresetOccurrenceFromLastOccurrencePattern.__super__.constructor.apply(this, arguments);
    }

    AddPresetOccurrenceFromLastOccurrencePattern.extend();

    AddPresetOccurrenceFromLastOccurrencePattern.prototype.execute = function() {
      var occurrenceType, pattern;
      this.occurrenceManager.resetPatterns();
      if (pattern = this.vimState.globalState.get('lastOccurrencePattern')) {
        occurrenceType = this.vimState.globalState.get("lastOccurrenceType");
        this.occurrenceManager.addPattern(pattern, {
          occurrenceType: occurrenceType
        });
        return this.activateMode('normal');
      }
    };

    return AddPresetOccurrenceFromLastOccurrencePattern;

  })(TogglePresetOccurrence);

  Delete = (function(superClass) {
    extend(Delete, superClass);

    function Delete() {
      this.mutateSelection = bind(this.mutateSelection, this);
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.extend();

    Delete.prototype.trackChange = true;

    Delete.prototype.flashCheckpoint = 'did-select-occurrence';

    Delete.prototype.flashTypeForOccurrence = 'operator-remove-occurrence';

    Delete.prototype.stayOptionName = 'stayOnDelete';

    Delete.prototype.execute = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          if (_this.occurrenceSelected) {
            return;
          }
          if (_this.target.isLinewise()) {
            return _this.onDidRestoreCursorPositions(function() {
              var cursor, i, len, ref1, results;
              ref1 = _this.editor.getCursors();
              results = [];
              for (i = 0, len = ref1.length; i < len; i++) {
                cursor = ref1[i];
                results.push(_this.adjustCursor(cursor));
              }
              return results;
            });
          }
        };
      })(this));
      return Delete.__super__.execute.apply(this, arguments);
    };

    Delete.prototype.mutateSelection = function(selection) {
      this.setTextToRegisterForSelection(selection);
      return selection.deleteSelectedText();
    };

    Delete.prototype.adjustCursor = function(cursor) {
      var point, row;
      row = getValidVimBufferRow(this.editor, cursor.getBufferRow());
      if (this.needStayOnRestore()) {
        point = this.mutationManager.getInitialPointForSelection(cursor.selection);
        return cursor.setBufferPosition([row, point.column]);
      } else {
        return cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row));
      }
    };

    return Delete;

  })(Operator);

  DeleteRight = (function(superClass) {
    extend(DeleteRight, superClass);

    function DeleteRight() {
      return DeleteRight.__super__.constructor.apply(this, arguments);
    }

    DeleteRight.extend();

    DeleteRight.prototype.target = 'MoveRight';

    return DeleteRight;

  })(Delete);

  DeleteLeft = (function(superClass) {
    extend(DeleteLeft, superClass);

    function DeleteLeft() {
      return DeleteLeft.__super__.constructor.apply(this, arguments);
    }

    DeleteLeft.extend();

    DeleteLeft.prototype.target = 'MoveLeft';

    return DeleteLeft;

  })(Delete);

  DeleteToLastCharacterOfLine = (function(superClass) {
    extend(DeleteToLastCharacterOfLine, superClass);

    function DeleteToLastCharacterOfLine() {
      return DeleteToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    DeleteToLastCharacterOfLine.extend();

    DeleteToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    DeleteToLastCharacterOfLine.prototype.initialize = function() {
      if (this.isMode('visual', 'blockwise')) {
        this.acceptCurrentSelection = false;
        swrap.setReversedState(this.editor, false);
      }
      return DeleteToLastCharacterOfLine.__super__.initialize.apply(this, arguments);
    };

    return DeleteToLastCharacterOfLine;

  })(Delete);

  DeleteLine = (function(superClass) {
    extend(DeleteLine, superClass);

    function DeleteLine() {
      return DeleteLine.__super__.constructor.apply(this, arguments);
    }

    DeleteLine.extend();

    DeleteLine.prototype.wise = 'linewise';

    DeleteLine.prototype.target = "MoveToRelativeLine";

    return DeleteLine;

  })(Delete);

  Yank = (function(superClass) {
    extend(Yank, superClass);

    function Yank() {
      return Yank.__super__.constructor.apply(this, arguments);
    }

    Yank.extend();

    Yank.prototype.trackChange = true;

    Yank.prototype.stayOptionName = 'stayOnYank';

    Yank.prototype.mutateSelection = function(selection) {
      return this.setTextToRegisterForSelection(selection);
    };

    return Yank;

  })(Operator);

  YankLine = (function(superClass) {
    extend(YankLine, superClass);

    function YankLine() {
      return YankLine.__super__.constructor.apply(this, arguments);
    }

    YankLine.extend();

    YankLine.prototype.wise = 'linewise';

    YankLine.prototype.target = "MoveToRelativeLine";

    return YankLine;

  })(Yank);

  YankToLastCharacterOfLine = (function(superClass) {
    extend(YankToLastCharacterOfLine, superClass);

    function YankToLastCharacterOfLine() {
      return YankToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    YankToLastCharacterOfLine.extend();

    YankToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    return YankToLastCharacterOfLine;

  })(Yank);

  Increase = (function(superClass) {
    extend(Increase, superClass);

    function Increase() {
      return Increase.__super__.constructor.apply(this, arguments);
    }

    Increase.extend();

    Increase.prototype.target = "InnerCurrentLine";

    Increase.prototype.flashTarget = false;

    Increase.prototype.restorePositions = false;

    Increase.prototype.step = 1;

    Increase.prototype.execute = function() {
      var ref1;
      this.newRanges = [];
      Increase.__super__.execute.apply(this, arguments);
      if (this.newRanges.length) {
        if (this.getConfig('flashOnOperate') && (ref1 = this.getName(), indexOf.call(this.getConfig('flashOnOperateBlacklist'), ref1) < 0)) {
          return this.vimState.flash(this.newRanges, {
            type: this.flashTypeForOccurrence
          });
        }
      }
    };

    Increase.prototype.replaceNumberInBufferRange = function(scanRange, fn) {
      var newRanges;
      if (fn == null) {
        fn = null;
      }
      newRanges = [];
      if (this.pattern == null) {
        this.pattern = RegExp("" + (this.getConfig('numberRegex')), "g");
      }
      this.scanForward(this.pattern, {
        scanRange: scanRange
      }, (function(_this) {
        return function(event) {
          var matchText, nextNumber, replace;
          if ((fn != null) && !fn(event)) {
            return;
          }
          matchText = event.matchText, replace = event.replace;
          nextNumber = _this.getNextNumber(matchText);
          return newRanges.push(replace(String(nextNumber)));
        };
      })(this));
      return newRanges;
    };

    Increase.prototype.mutateSelection = function(selection) {
      var initialPoint, newRanges, point, ref1, ref2, ref3, scanRange;
      scanRange = selection.getBufferRange();
      if (this["instanceof"]('IncrementNumber') || this.target.is('CurrentSelection')) {
        (ref1 = this.newRanges).push.apply(ref1, this.replaceNumberInBufferRange(scanRange));
        return selection.cursor.setBufferPosition(scanRange.start);
      } else {
        initialPoint = this.mutationManager.getInitialPointForSelection(selection);
        newRanges = this.replaceNumberInBufferRange(scanRange, function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          if (range.end.isGreaterThan(initialPoint)) {
            stop();
            return true;
          } else {
            return false;
          }
        });
        point = (ref2 = (ref3 = newRanges[0]) != null ? ref3.end.translate([0, -1]) : void 0) != null ? ref2 : initialPoint;
        return selection.cursor.setBufferPosition(point);
      }
    };

    Increase.prototype.getNextNumber = function(numberString) {
      return Number.parseInt(numberString, 10) + this.step * this.getCount();
    };

    return Increase;

  })(Operator);

  Decrease = (function(superClass) {
    extend(Decrease, superClass);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.extend();

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  IncrementNumber = (function(superClass) {
    extend(IncrementNumber, superClass);

    function IncrementNumber() {
      return IncrementNumber.__super__.constructor.apply(this, arguments);
    }

    IncrementNumber.extend();

    IncrementNumber.prototype.baseNumber = null;

    IncrementNumber.prototype.target = null;

    IncrementNumber.prototype.mutateSelectionOrderd = true;

    IncrementNumber.prototype.getNextNumber = function(numberString) {
      if (this.baseNumber != null) {
        this.baseNumber += this.step * this.getCount();
      } else {
        this.baseNumber = Number.parseInt(numberString, 10);
      }
      return this.baseNumber;
    };

    return IncrementNumber;

  })(Increase);

  DecrementNumber = (function(superClass) {
    extend(DecrementNumber, superClass);

    function DecrementNumber() {
      return DecrementNumber.__super__.constructor.apply(this, arguments);
    }

    DecrementNumber.extend();

    DecrementNumber.prototype.step = -1;

    return DecrementNumber;

  })(IncrementNumber);

  PutBefore = (function(superClass) {
    extend(PutBefore, superClass);

    function PutBefore() {
      return PutBefore.__super__.constructor.apply(this, arguments);
    }

    PutBefore.extend();

    PutBefore.prototype.location = 'before';

    PutBefore.prototype.target = 'Empty';

    PutBefore.prototype.flashType = 'operator-long';

    PutBefore.prototype.restorePositions = false;

    PutBefore.prototype.flashTarget = true;

    PutBefore.prototype.trackChange = false;

    PutBefore.prototype.execute = function() {
      var ref1, text, type;
      this.mutationsBySelection = new Map();
      ref1 = this.vimState.register.get(null, this.editor.getLastSelection()), text = ref1.text, type = ref1.type;
      if (!text) {
        return;
      }
      this.onDidFinishMutation(this.adjustCursorPosition.bind(this));
      this.onDidFinishOperation((function(_this) {
        return function() {
          var newRange, ref2, toRange;
          if (newRange = _this.mutationsBySelection.get(_this.editor.getLastSelection())) {
            _this.setMarkForChange(newRange);
          }
          if (_this.getConfig('flashOnOperate') && (ref2 = _this.getName(), indexOf.call(_this.getConfig('flashOnOperateBlacklist'), ref2) < 0)) {
            toRange = function(selection) {
              return _this.mutationsBySelection.get(selection);
            };
            return _this.vimState.flash(_this.editor.getSelections().map(toRange), {
              type: _this.getFlashType()
            });
          }
        };
      })(this));
      return PutBefore.__super__.execute.apply(this, arguments);
    };

    PutBefore.prototype.adjustCursorPosition = function() {
      var cursor, end, i, len, newRange, ref1, ref2, results, selection, start;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        cursor = selection.cursor;
        ref2 = newRange = this.mutationsBySelection.get(selection), start = ref2.start, end = ref2.end;
        if (this.linewisePaste) {
          results.push(moveCursorToFirstCharacterAtRow(cursor, start.row));
        } else {
          if (newRange.isSingleLine()) {
            results.push(cursor.setBufferPosition(end.translate([0, -1])));
          } else {
            results.push(cursor.setBufferPosition(start));
          }
        }
      }
      return results;
    };

    PutBefore.prototype.mutateSelection = function(selection) {
      var newRange, ref1, text, type;
      ref1 = this.vimState.register.get(null, selection), text = ref1.text, type = ref1.type;
      text = _.multiplyString(text, this.getCount());
      this.linewisePaste = type === 'linewise' || this.isMode('visual', 'linewise');
      newRange = this.paste(selection, text, {
        linewisePaste: this.linewisePaste
      });
      return this.mutationsBySelection.set(selection, newRange);
    };

    PutBefore.prototype.paste = function(selection, text, arg) {
      var linewisePaste;
      linewisePaste = arg.linewisePaste;
      if (linewisePaste) {
        return this.pasteLinewise(selection, text);
      } else {
        return this.pasteCharacterwise(selection, text);
      }
    };

    PutBefore.prototype.pasteCharacterwise = function(selection, text) {
      var cursor;
      cursor = selection.cursor;
      if (selection.isEmpty() && this.location === 'after' && !isEmptyRow(this.editor, cursor.getBufferRow())) {
        cursor.moveRight();
      }
      return selection.insertText(text);
    };

    PutBefore.prototype.pasteLinewise = function(selection, text) {
      var cursor, cursorRow, newRange;
      cursor = selection.cursor;
      cursorRow = cursor.getBufferRow();
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      newRange = null;
      if (selection.isEmpty()) {
        if (this.location === 'before') {
          newRange = insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
          setBufferRow(cursor, newRange.start.row);
        } else if (this.location === 'after') {
          ensureEndsWithNewLineForBufferRow(this.editor, cursorRow);
          newRange = insertTextAtBufferPosition(this.editor, [cursorRow + 1, 0], text);
        }
      } else {
        if (!this.isMode('visual', 'linewise')) {
          selection.insertText("\n");
        }
        newRange = selection.insertText(text);
      }
      return newRange;
    };

    return PutBefore;

  })(Operator);

  PutAfter = (function(superClass) {
    extend(PutAfter, superClass);

    function PutAfter() {
      return PutAfter.__super__.constructor.apply(this, arguments);
    }

    PutAfter.extend();

    PutAfter.prototype.location = 'after';

    return PutAfter;

  })(PutBefore);

  AddBlankLineBelow = (function(superClass) {
    extend(AddBlankLineBelow, superClass);

    function AddBlankLineBelow() {
      return AddBlankLineBelow.__super__.constructor.apply(this, arguments);
    }

    AddBlankLineBelow.extend();

    AddBlankLineBelow.prototype.flashTarget = false;

    AddBlankLineBelow.prototype.target = "Empty";

    AddBlankLineBelow.prototype.stayAtSamePosition = true;

    AddBlankLineBelow.prototype.stayByMarker = true;

    AddBlankLineBelow.prototype.where = 'below';

    AddBlankLineBelow.prototype.mutateSelection = function(selection) {
      var point, row;
      row = selection.getHeadBufferPosition().row;
      if (this.where === 'below') {
        row += 1;
      }
      point = [row, 0];
      return this.editor.setTextInBufferRange([point, point], "\n".repeat(this.getCount()));
    };

    return AddBlankLineBelow;

  })(Operator);

  AddBlankLineAbove = (function(superClass) {
    extend(AddBlankLineAbove, superClass);

    function AddBlankLineAbove() {
      return AddBlankLineAbove.__super__.constructor.apply(this, arguments);
    }

    AddBlankLineAbove.extend();

    AddBlankLineAbove.prototype.where = 'above';

    return AddBlankLineAbove;

  })(AddBlankLineBelow);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDh1QkFBQTtJQUFBOzs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFVSSxPQUFBLENBQVEsU0FBUixDQVZKLEVBQ0UseURBREYsRUFFRSwrQ0FGRixFQUdFLDJCQUhGLEVBSUUsbUVBSkYsRUFLRSx5RUFMRixFQU1FLDJEQU5GLEVBT0UsK0JBUEYsRUFRRSxxRUFSRixFQVNFOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUVEOzs7SUFDSixRQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O3VCQUNBLGFBQUEsR0FBZTs7dUJBQ2YsVUFBQSxHQUFZOzt1QkFFWixJQUFBLEdBQU07O3VCQUNOLFVBQUEsR0FBWTs7dUJBQ1osY0FBQSxHQUFnQjs7dUJBRWhCLFdBQUEsR0FBYTs7dUJBQ2IsZUFBQSxHQUFpQjs7dUJBQ2pCLFNBQUEsR0FBVzs7dUJBQ1gsc0JBQUEsR0FBd0I7O3VCQUN4QixXQUFBLEdBQWE7O3VCQUViLG9CQUFBLEdBQXNCOzt1QkFDdEIsa0JBQUEsR0FBb0I7O3VCQUNwQixjQUFBLEdBQWdCOzt1QkFDaEIsWUFBQSxHQUFjOzt1QkFDZCxnQkFBQSxHQUFrQjs7dUJBRWxCLHNCQUFBLEdBQXdCOzt1QkFDeEIseUJBQUEsR0FBMkI7O3VCQUMzQixzQkFBQSxHQUF3Qjs7dUJBRXhCLHlCQUFBLEdBQTJCOzt1QkFDM0IscUJBQUEsR0FBdUI7O3VCQUl2QixrQkFBQSxHQUFvQjs7dUJBQ3BCLGNBQUEsR0FBZ0I7O3VCQUNoQixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFDLENBQUEsa0JBQUQsSUFBd0IsQ0FBSSxJQUFD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QSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUFBOztRQUNBLFFBQUEsR0FBVyxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQVRiOztBQVdBLGFBQU87SUFoQk07Ozs7S0EzRE87O0VBNkVsQjs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxNQUFELENBQUE7O3VCQUNBLFFBQUEsR0FBVTs7OztLQUZXOztFQUlqQjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxXQUFBLEdBQWE7O2dDQUNiLE1BQUEsR0FBUTs7Z0NBQ1Isa0JBQUEsR0FBb0I7O2dDQUNwQixZQUFBLEdBQWM7O2dDQUNkLEtBQUEsR0FBTzs7Z0NBRVAsZUFBQSxHQUFpQixTQUFDLFNBQUQ7QUFDZixVQUFBO01BQUEsR0FBQSxHQUFNLFNBQVMsQ0FBQyxxQkFBVixDQUFBLENBQWlDLENBQUM7TUFDeEMsSUFBWSxJQUFDLENBQUEsS0FBRCxLQUFVLE9BQXRCO1FBQUEsR0FBQSxJQUFPLEVBQVA7O01BQ0EsS0FBQSxHQUFRLENBQUMsR0FBRCxFQUFNLENBQU47YUFDUixJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBN0IsRUFBNkMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVosQ0FBN0M7SUFKZTs7OztLQVJhOztFQWMxQjs7Ozs7OztJQUNKLGlCQUFDLENBQUEsTUFBRCxDQUFBOztnQ0FDQSxLQUFBLEdBQU87Ozs7S0FGdUI7QUFycUJoQyIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57XG4gIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb25cbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgaXNFbXB0eVJvd1xuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIHNldEJ1ZmZlclJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICByZWNvcmRhYmxlOiB0cnVlXG5cbiAgd2lzZTogbnVsbFxuICBvY2N1cnJlbmNlOiBmYWxzZVxuICBvY2N1cnJlbmNlVHlwZTogJ2Jhc2UnXG5cbiAgZmxhc2hUYXJnZXQ6IHRydWVcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLWZpbmlzaCdcbiAgZmxhc2hUeXBlOiAnb3BlcmF0b3InXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2U6ICdvcGVyYXRvci1vY2N1cnJlbmNlJ1xuICB0cmFja0NoYW5nZTogZmFsc2VcblxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZTogbnVsbFxuICBzdGF5QXRTYW1lUG9zaXRpb246IG51bGxcbiAgc3RheU9wdGlvbk5hbWU6IG51bGxcbiAgc3RheUJ5TWFya2VyOiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiB0cnVlXG5cbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogdHJ1ZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiB0cnVlXG4gIGFjY2VwdEN1cnJlbnRTZWxlY3Rpb246IHRydWVcblxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlOiBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZDogZmFsc2VcblxuICAjIEV4cGVyaW1lbnRhbHkgYWxsb3cgc2VsZWN0VGFyZ2V0IGJlZm9yZSBpbnB1dCBDb21wbGV0ZVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiBmYWxzZVxuICB0YXJnZXRTZWxlY3RlZDogbnVsbFxuICBjYW5FYXJseVNlbGVjdDogLT5cbiAgICBAc3VwcG9ydEVhcmx5U2VsZWN0IGFuZCBub3QgQGlzUmVwZWF0ZWQoKVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAjIENhbGxlZCB3aGVuIG9wZXJhdGlvbiBmaW5pc2hlZFxuICAjIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGU6IC0+XG4gICAgQHRhcmdldFNlbGVjdGVkID0gbnVsbFxuICAgIEBvY2N1cnJlbmNlU2VsZWN0ZWQgPSBmYWxzZVxuXG4gICMgVHdvIGNoZWNrcG9pbnQgZm9yIGRpZmZlcmVudCBwdXJwb3NlXG4gICMgLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgIyAtIG9uZSBmb3IgcHJlc2VydmUgbGFzdCBpbnNlcnRlZCB0ZXh0XG4gIGNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID89IHt9XG4gICAgQGJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSBAZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1twdXJwb3NlXVxuXG4gIGRlbGV0ZUJ1ZmZlckNoZWNrcG9pbnQ6IChwdXJwb3NlKSAtPlxuICAgIGlmIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlP1xuICAgICAgZGVsZXRlIEBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50OiAocHVycG9zZSkgLT5cbiAgICBpZiBjaGVja3BvaW50ID0gQGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICAgIEBlZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICBAZGVsZXRlQnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuXG4gIG5lZWRTdGF5OiAtPlxuICAgIEBzdGF5QXRTYW1lUG9zaXRpb24gP1xuICAgICAgKEBpc09jY3VycmVuY2UoKSBhbmQgQGdldENvbmZpZygnc3RheU9uT2NjdXJyZW5jZScpKSBvciBAZ2V0Q29uZmlnKEBzdGF5T3B0aW9uTmFtZSlcblxuICBuZWVkU3RheU9uUmVzdG9yZTogLT5cbiAgICBAc3RheUF0U2FtZVBvc2l0aW9uID9cbiAgICAgIChAaXNPY2N1cnJlbmNlKCkgYW5kIEBnZXRDb25maWcoJ3N0YXlPbk9jY3VycmVuY2UnKSBhbmQgQG9jY3VycmVuY2VTZWxlY3RlZCkgb3IgQGdldENvbmZpZyhAc3RheU9wdGlvbk5hbWUpXG5cbiAgaXNPY2N1cnJlbmNlOiAtPlxuICAgIEBvY2N1cnJlbmNlXG5cbiAgc2V0T2NjdXJyZW5jZTogKEBvY2N1cnJlbmNlKSAtPlxuICAgIEBvY2N1cnJlbmNlXG5cbiAgc2V0TWFya0ZvckNoYW5nZTogKHJhbmdlKSAtPlxuICAgIEB2aW1TdGF0ZS5tYXJrLnNldFJhbmdlKCdbJywgJ10nLCByYW5nZSlcblxuICBuZWVkRmxhc2g6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZmxhc2hUYXJnZXRcbiAgICB7bW9kZSwgc3VibW9kZX0gPSBAdmltU3RhdGVcbiAgICBpZiBtb2RlIGlzbnQgJ3Zpc3VhbCcgb3IgKEB0YXJnZXQuaXNNb3Rpb24oKSBhbmQgc3VibW9kZSBpc250IEB0YXJnZXQud2lzZSlcbiAgICAgIEBnZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgYW5kIChAZ2V0TmFtZSgpIG5vdCBpbiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdCcpKVxuXG4gIGZsYXNoSWZOZWNlc3Nhcnk6IChyYW5nZXMpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAbmVlZEZsYXNoKClcbiAgICBAdmltU3RhdGUuZmxhc2gocmFuZ2VzLCB0eXBlOiBAZ2V0Rmxhc2hUeXBlKCkpXG5cbiAgZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBuZWVkRmxhc2goKVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBpZiBAZmxhc2hDaGVja3BvaW50IGlzICdkaWQtZmluaXNoJ1xuICAgICAgICByYW5nZXMgPSBAbXV0YXRpb25NYW5hZ2VyLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpLmZpbHRlciAocmFuZ2UpIC0+IG5vdCByYW5nZS5pc0VtcHR5KClcbiAgICAgIGVsc2VcbiAgICAgICAgcmFuZ2VzID0gQG11dGF0aW9uTWFuYWdlci5nZXRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50KEBmbGFzaENoZWNrcG9pbnQpXG4gICAgICBAdmltU3RhdGUuZmxhc2gocmFuZ2VzLCB0eXBlOiBAZ2V0Rmxhc2hUeXBlKCkpXG5cbiAgZ2V0Rmxhc2hUeXBlOiAtPlxuICAgIGlmIEBvY2N1cnJlbmNlU2VsZWN0ZWRcbiAgICAgIEBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlXG4gICAgZWxzZVxuICAgICAgQGZsYXNoVHlwZVxuXG4gIHRyYWNrQ2hhbmdlSWZOZWNlc3Nhcnk6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAdHJhY2tDaGFuZ2VcblxuICAgIEBvbkRpZEZpbmlzaE9wZXJhdGlvbiA9PlxuICAgICAgaWYgbWFya2VyID0gQG11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGlvbkZvclNlbGVjdGlvbihAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSk/Lm1hcmtlclxuICAgICAgICBAc2V0TWFya0ZvckNoYW5nZShtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIHtAbXV0YXRpb25NYW5hZ2VyLCBAb2NjdXJyZW5jZU1hbmFnZXIsIEBwZXJzaXN0ZW50U2VsZWN0aW9ufSA9IEB2aW1TdGF0ZVxuICAgIEBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQoKVxuICAgIEBpbml0aWFsaXplKClcbiAgICBAb25EaWRTZXRPcGVyYXRvck1vZGlmaWVyKEBzZXRNb2RpZmllci5iaW5kKHRoaXMpKVxuXG4gICAgIyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgQGFjY2VwdFByZXNldE9jY3VycmVuY2UgYW5kIEBvY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKClcbiAgICAgIEBzZXRPY2N1cnJlbmNlKHRydWUpXG5cbiAgICAjIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgIyBUbyBwaWNrIGN1cnNvci13b3JkIHRvIGZpbmQgb2NjdXJyZW5jZSBiYXNlIHBhdHRlcm4uXG4gICAgIyBUaGlzIGhhcyB0byBiZSBkb25lIEJFRk9SRSBjb252ZXJ0aW5nIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGludG8gcmVhbC1zZWxlY3Rpb24uXG4gICAgIyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGwgc2VsZWN0ZWQsIGl0IGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgQGlzT2NjdXJyZW5jZSgpIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlID8gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpKVxuXG4gICAgIyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgQHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeSgpXG4gICAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgICAjIFtGSVhNRV0gU3luYyBzZWxlY3Rpb24td2lzZSB0aGlzIHBoYXNlP1xuICAgICAgICAjIGUuZy4gc2VsZWN0ZWQgcGVyc2lzdGVkIHNlbGVjdGlvbiBjb252ZXJ0IHRvIHZCIHNlbCBpbiB2Qi1tb2RlP1xuICAgICAgICBudWxsXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5hY3RpdmF0ZSgndmlzdWFsJywgc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSlcblxuICAgIEB0YXJnZXQgPSAnQ3VycmVudFNlbGVjdGlvbicgaWYgQGlzTW9kZSgndmlzdWFsJykgYW5kIEBhY2NlcHRDdXJyZW50U2VsZWN0aW9uXG4gICAgQHNldFRhcmdldChAbmV3KEB0YXJnZXQpKSBpZiBfLmlzU3RyaW5nKEB0YXJnZXQpXG5cbiAgc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkOiAtPlxuICAgICMgW0NBVVRJT05dXG4gICAgIyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgIyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgIyBUcmVhdCB0aGF0IGBvY2N1cnJlbmNlYCBpcyBCT1VOREVEIHRvIG9wZXJhdG9yIGl0c2VsZiwgc28gY2xlYW5wIGF0IGZpbmlzaGVkLlxuICAgIGlmIEBvY2N1cnJlbmNlIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gIHNldE1vZGlmaWVyOiAob3B0aW9ucykgLT5cbiAgICBpZiBvcHRpb25zLndpc2U/XG4gICAgICBAd2lzZSA9IG9wdGlvbnMud2lzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBvcHRpb25zLm9jY3VycmVuY2U/XG4gICAgICBAc2V0T2NjdXJyZW5jZShvcHRpb25zLm9jY3VycmVuY2UpXG4gICAgICBpZiBAaXNPY2N1cnJlbmNlKClcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gb3B0aW9ucy5vY2N1cnJlbmNlVHlwZVxuICAgICAgICAjIFRoaXMgaXMgbyBtb2RpZmllciBjYXNlKGUuZy4gYGMgbyBwYCwgYGQgTyBmYClcbiAgICAgICAgIyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgICBwYXR0ZXJuID0gQGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShAb2NjdXJyZW5jZVR5cGUpXG4gICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtyZXNldDogdHJ1ZSwgQG9jY3VycmVuY2VUeXBlfSlcbiAgICAgICAgQG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayg9PiBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuXG4gICMgcmV0dXJuIHRydWUvZmFsc2UgdG8gaW5kaWNhdGUgc3VjY2Vzc1xuICBzZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3Nhcnk6IC0+XG4gICAgaWYgQGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gYW5kXG4gICAgICAgIEBnZXRDb25maWcoJ2F1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlJykgYW5kXG4gICAgICAgIG5vdCBAcGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcblxuICAgICAgQHBlcnNpc3RlbnRTZWxlY3Rpb24uc2VsZWN0KClcbiAgICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAgIHN3cmFwLnNhdmVQcm9wZXJ0aWVzKEBlZGl0b3IpXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZTogKG9jY3VycmVuY2VUeXBlKSAtPlxuICAgIHN3aXRjaCBvY2N1cnJlbmNlVHlwZVxuICAgICAgd2hlbiAnYmFzZSdcbiAgICAgICAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgd2hlbiAnc3Vid29yZCdcbiAgICAgICAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuXG4gICMgdGFyZ2V0IGlzIFRleHRPYmplY3Qgb3IgTW90aW9uIHRvIG9wZXJhdGUgb24uXG4gIHNldFRhcmdldDogKEB0YXJnZXQpIC0+XG4gICAgQHRhcmdldC5zZXRPcGVyYXRvcih0aGlzKVxuICAgIEBlbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG5cbiAgICBpZiBAY2FuRWFybHlTZWxlY3QoKVxuICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICBAY3JlYXRlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG4gICAgICBAc2VsZWN0VGFyZ2V0KClcbiAgICB0aGlzXG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcblxuICBzZXRUZXh0VG9SZWdpc3RlcjogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0ZXh0ICs9IFwiXFxuXCIgaWYgKEB0YXJnZXQuaXNMaW5ld2lzZSgpIGFuZCAobm90IHRleHQuZW5kc1dpdGgoJ1xcbicpKSlcbiAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KHt0ZXh0LCBzZWxlY3Rpb259KSBpZiB0ZXh0XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5OiAtPlxuICAgIGlmIEB0YXJnZXQ/LmlzTW90aW9uKCkgYW5kIEBpc01vZGUoJ3Zpc3VhbCcpXG4gICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIubm9ybWFsaXplU2VsZWN0aW9ucygpXG5cbiAgc3RhcnRNdXRhdGlvbjogKGZuKSAtPlxuICAgIGlmIEBjYW5FYXJseVNlbGVjdCgpXG4gICAgICAjIC0gU2tpcCBzZWxlY3Rpb24gbm9ybWFsaXphdGlvbjogYWxyZWFkeSBub3JtYWxpemVkIGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgICMgLSBNYW51YWwgY2hlY2twb2ludCBncm91cGluZzogdG8gY3JlYXRlIGNoZWNrcG9pbnQgYmVmb3JlIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgZm4oKVxuICAgICAgQGVtaXRXaWxsRmluaXNoTXV0YXRpb24oKVxuICAgICAgQGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCgndW5kbycpXG5cbiAgICBlbHNlXG4gICAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgICAgZm4oKVxuICAgICAgICBAZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG5cbiAgICBAZW1pdERpZEZpbmlzaE11dGF0aW9uKClcblxuICAjIE1haW5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIGlmIEBtdXRhdGVTZWxlY3Rpb25PcmRlcmRcbiAgICAgICAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgICAgIEBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcblxuICAgICMgRXZlbiB0aG91Z2ggd2UgZmFpbCB0byBzZWxlY3QgdGFyZ2V0IGFuZCBmYWlsIHRvIG11dGF0ZSxcbiAgICAjIHdlIGhhdmUgdG8gcmV0dXJuIHRvIG5vcm1hbC1tb2RlIGZyb20gb3BlcmF0b3ItcGVuZGluZyBvciB2aXN1YWxcbiAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4gICMgUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldDogLT5cbiAgICByZXR1cm4gQHRhcmdldFNlbGVjdGVkIGlmIEB0YXJnZXRTZWxlY3RlZD9cbiAgICBAbXV0YXRpb25NYW5hZ2VyLmluaXQodXNlTWFya2VyOiBAbmVlZFN0YXkoKSBhbmQgQHN0YXlCeU1hcmtlcilcblxuICAgICMgQ3VycmVudGx5IG9ubHkgbW90aW9uIGhhdmUgZm9yY2VXaXNlIG1ldGhvZHNcbiAgICBAdGFyZ2V0LmZvcmNlV2lzZT8oQHdpc2UpIGlmIEB3aXNlP1xuICAgIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG5cbiAgICAjIEFsbG93IGN1cnNvciBwb3NpdGlvbiBhZGp1c3RtZW50ICdvbi13aWxsLXNlbGVjdC10YXJnZXQnIGhvb2suXG4gICAgIyBzbyBjaGVja3BvaW50IGNvbWVzIEFGVEVSIEBlbWl0V2lsbFNlbGVjdFRhcmdldCgpXG4gICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCd3aWxsLXNlbGVjdCcpXG5cbiAgICAjIE5PVEVcbiAgICAjIFNpbmNlIE1vdmVUb05leHRPY2N1cnJlbmNlLCBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgbW90aW9uIG1vdmUgYnlcbiAgICAjICBvY2N1cnJlbmNlLW1hcmtlciwgb2NjdXJyZW5jZS1tYXJrZXIgaGFzIHRvIGJlIGNyZWF0ZWQgQkVGT1JFIGBAdGFyZ2V0LmV4ZWN1dGUoKWBcbiAgICAjIEFuZCB3aGVuIHJlcGVhdGVkLCBvY2N1cnJlbmNlIHBhdHRlcm4gaXMgYWxyZWFkeSBjYWNoZWQgYXQgQHBhdHRlcm5Gb3JPY2N1cnJlbmNlXG4gICAgaWYgQGlzUmVwZWF0ZWQoKSBhbmQgQGlzT2NjdXJyZW5jZSgpIGFuZCBub3QgQG9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQHBhdHRlcm5Gb3JPY2N1cnJlbmNlLCB7QG9jY3VycmVuY2VUeXBlfSlcblxuICAgIEB0YXJnZXQuZXhlY3V0ZSgpXG5cbiAgICBAbXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3QnKVxuICAgIGlmIEBpc09jY3VycmVuY2UoKVxuICAgICAgIyBUbyByZXBvZWF0KGAuYCkgb3BlcmF0aW9uIHdoZXJlIG11bHRpcGxlIG9jY3VycmVuY2UgcGF0dGVybnMgd2FzIHNldC5cbiAgICAgICMgSGVyZSB3ZSBzYXZlIHBhdHRlcm5zIHdoaWNoIHJlcHJlc2VudCB1bmlvbmVkIHJlZ2V4IHdoaWNoIEBvY2N1cnJlbmNlTWFuYWdlciBrbm93cy5cbiAgICAgIEBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA/PSBAb2NjdXJyZW5jZU1hbmFnZXIuYnVpbGRQYXR0ZXJuKClcblxuICAgICAgaWYgQG9jY3VycmVuY2VNYW5hZ2VyLnNlbGVjdCgpXG4gICAgICAgICMgVG8gc2tpcCByZXN0b3JlaW5nIHBvc2l0aW9uIGZyb20gc2VsZWN0aW9uIHByb3Agd2hlbiBzaGlmdCB2aXN1YWwtbW9kZSBzdWJtb2RlIG9uIFNlbGVjdE9jY3VycmVuY2VcbiAgICAgICAgc3dyYXAuY2xlYXJQcm9wZXJ0aWVzKEBlZGl0b3IpXG5cbiAgICAgICAgQG9jY3VycmVuY2VTZWxlY3RlZCA9IHRydWVcbiAgICAgICAgQG11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtc2VsZWN0LW9jY3VycmVuY2UnKVxuXG4gICAgaWYgaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbihAZWRpdG9yKSBvciBAdGFyZ2V0LmdldE5hbWUoKSBpcyBcIkVtcHR5XCJcbiAgICAgIEBlbWl0RGlkU2VsZWN0VGFyZ2V0KClcbiAgICAgIEBmbGFzaENoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIEB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICAgIEB0YXJnZXRTZWxlY3RlZCA9IHRydWVcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBAZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoKVxuICAgICAgQHRhcmdldFNlbGVjdGVkID0gZmFsc2VcbiAgICAgIGZhbHNlXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHJlc3RvcmVQb3NpdGlvbnNcbiAgICBvcHRpb25zID1cbiAgICAgIHN0YXk6IEBuZWVkU3RheU9uUmVzdG9yZSgpXG4gICAgICBvY2N1cnJlbmNlU2VsZWN0ZWQ6IEBvY2N1cnJlbmNlU2VsZWN0ZWRcbiAgICAgIGlzQmxvY2t3aXNlOiBAdGFyZ2V0Py5pc0Jsb2Nrd2lzZT8oKVxuXG4gICAgQG11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKG9wdGlvbnMpXG4gICAgQGVtaXREaWRSZXN0b3JlQ3Vyc29yUG9zaXRpb25zKClcblxuIyBTZWxlY3RcbiMgV2hlbiB0ZXh0LW9iamVjdCBpcyBpbnZva2VkIGZyb20gbm9ybWFsIG9yIHZpdXNhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbiMgID0+IFNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD10ZXh0LW9iamVjdFxuIyBXaGVuIG1vdGlvbiBpcyBpbnZva2VkIGZyb20gdmlzdWFsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuIyAgPT4gU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PW1vdGlvbilcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFNlbGVjdCBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoZmFsc2UpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZWNvcmRhYmxlOiBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlOiBmYWxzZVxuICBhY2NlcHRQZXJzaXN0ZW50U2VsZWN0aW9uOiBmYWxzZVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHN0YXJ0TXV0YXRpb24oQHNlbGVjdFRhcmdldC5iaW5kKHRoaXMpKVxuICAgIGlmIEB0YXJnZXQuaXNUZXh0T2JqZWN0KCkgYW5kIHdpc2UgPSBAdGFyZ2V0LmdldFdpc2UoKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgICAgc3dpdGNoIHdpc2VcbiAgICAgICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICAgICAgc3dyYXAuc2F2ZVByb3BlcnRpZXMoQGVkaXRvcilcbiAgICAgICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgICAgIHN3cmFwLmZpeFByb3BlcnRpZXNGb3JMaW5ld2lzZShAZWRpdG9yKVxuICAgICAgQGFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KCd2aXN1YWwnLCB3aXNlKVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgbGF0ZXN0IHlhbmtlZCBvciBjaGFuZ2VkIHJhbmdlXCJcbiAgdGFyZ2V0OiAnQUxhdGVzdENoYW5nZSdcblxuY2xhc3MgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJQcmV2aW91c1NlbGVjdGlvblwiXG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTZWxlY3QgcGVyc2lzdGVudC1zZWxlY3Rpb24gYW5kIGNsZWFyIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvbiwgaXQncyBsaWtlIGNvbnZlcnQgdG8gcmVhbC1zZWxlY3Rpb25cIlxuICB0YXJnZXQ6IFwiQVBlcnNpc3RlbnRTZWxlY3Rpb25cIlxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJBZGQgc2VsZWN0aW9uIG9udG8gZWFjaCBtYXRjaGluZyB3b3JkIHdpdGhpbiB0YXJnZXQgcmFuZ2VcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc3RhcnRNdXRhdGlvbiA9PlxuICAgICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICAgIEBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKSlcblxuIyBQZXJzaXN0ZW50IFNlbGVjdGlvblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBzdGF5QXRTYW1lUG9zaXRpb246IHRydWVcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcblxuICBleGVjdXRlOiAtPlxuICAgIEByZXN0b3JlUG9zaXRpb25zID0gbm90IEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgIHN1cGVyXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcblxuY2xhc3MgVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgQGV4dGVuZCgpXG5cbiAgaXNDb21wbGV0ZTogLT5cbiAgICBwb2ludCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIEBtYXJrZXJUb1JlbW92ZSA9IEBwZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckF0UG9pbnQocG9pbnQpXG4gICAgaWYgQG1hcmtlclRvUmVtb3ZlXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBleGVjdXRlOiAtPlxuICAgIGlmIEBtYXJrZXJUb1JlbW92ZVxuICAgICAgQG1hcmtlclRvUmVtb3ZlLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiMgUHJlc2V0IE9jY3VycmVuY2VcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZSBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZTogZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbjogZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGU6ICdiYXNlJ1xuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgbWFya2VyID0gQG9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckF0UG9pbnQoQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmRlc3Ryb3lNYXJrZXJzKFttYXJrZXJdKVxuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSBudWxsXG4gICAgICBpc05hcnJvd2VkID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuXG4gICAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKSBhbmQgbm90IGlzTmFycm93ZWRcbiAgICAgICAgQG9jY3VycmVuY2VUeXBlID0gJ2Jhc2UnXG4gICAgICAgIHBhdHRlcm4gPSBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpLCAnZycpXG4gICAgICBlbHNlXG4gICAgICAgIHBhdHRlcm4gPSBAZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQG9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocGF0dGVybiwge0BvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAb2NjdXJyZW5jZU1hbmFnZXIuc2F2ZUxhc3RQYXR0ZXJuKEBvY2N1cnJlbmNlVHlwZSlcblxuICAgICAgQGFjdGl2YXRlTW9kZSgnbm9ybWFsJykgdW5sZXNzIGlzTmFycm93ZWRcblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlXG4gIEBleHRlbmQoKVxuICBvY2N1cnJlbmNlVHlwZTogJ3N1YndvcmQnXG5cbiMgV2FudCB0byByZW5hbWUgUmVzdG9yZU9jY3VycmVuY2VNYXJrZXJcbmNsYXNzIEFkZFByZXNldE9jY3VycmVuY2VGcm9tTGFzdE9jY3VycmVuY2VQYXR0ZXJuIGV4dGVuZHMgVG9nZ2xlUHJlc2V0T2NjdXJyZW5jZVxuICBAZXh0ZW5kKClcbiAgZXhlY3V0ZTogLT5cbiAgICBAb2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpXG4gICAgaWYgcGF0dGVybiA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoJ2xhc3RPY2N1cnJlbmNlUGF0dGVybicpXG4gICAgICBvY2N1cnJlbmNlVHlwZSA9IEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIilcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHBhdHRlcm4sIHtvY2N1cnJlbmNlVHlwZX0pXG4gICAgICBAYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuXG4jIERlbGV0ZVxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGVsZXRlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZTogJ29wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJ1xuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbkRlbGV0ZSdcblxuICBleGVjdXRlOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgcmV0dXJuIGlmIEBvY2N1cnJlbmNlU2VsZWN0ZWRcbiAgICAgIGlmIEB0YXJnZXQuaXNMaW5ld2lzZSgpXG4gICAgICAgIEBvbkRpZFJlc3RvcmVDdXJzb3JQb3NpdGlvbnMgPT5cbiAgICAgICAgICBAYWRqdXN0Q3Vyc29yKGN1cnNvcikgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgIHN1cGVyXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSA9PlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLmRlbGV0ZVNlbGVjdGVkVGV4dCgpXG5cbiAgYWRqdXN0Q3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIHJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICBpZiBAbmVlZFN0YXlPblJlc3RvcmUoKVxuICAgICAgcG9pbnQgPSBAbXV0YXRpb25NYW5hZ2VyLmdldEluaXRpYWxQb2ludEZvclNlbGVjdGlvbihjdXJzb3Iuc2VsZWN0aW9uKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIHBvaW50LmNvbHVtbl0pXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdykpXG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVMZWZ0J1xuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG4gIGluaXRpYWxpemU6IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAjIEZJWE1FIE1heWJlIGJlY2F1c2Ugb2YgYnVnIG9mIEN1cnJlbnRTZWxlY3Rpb24sXG4gICAgICAjIHdlIHVzZSBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGFzIHRhcmdldFxuICAgICAgQGFjY2VwdEN1cnJlbnRTZWxlY3Rpb24gPSBmYWxzZVxuICAgICAgc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZShAZWRpdG9yLCBmYWxzZSkgIyBFbnN1cmUgYWxsIHNlbGVjdGlvbnMgdG8gdW4tcmV2ZXJzZWRcbiAgICBzdXBlclxuXG5jbGFzcyBEZWxldGVMaW5lIGV4dGVuZHMgRGVsZXRlXG4gIEBleHRlbmQoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuXG4jIFlhbmtcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoKVxuICB0cmFja0NoYW5nZTogdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZTogJ3N0YXlPbllhbmsnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbmNsYXNzIFlhbmtMaW5lIGV4dGVuZHMgWWFua1xuICBAZXh0ZW5kKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmtcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvclxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIklubmVyQ3VycmVudExpbmVcIiAjIGN0cmwtYSBpbiBub3JtYWwtbW9kZSBmaW5kIHRhcmdldCBudW1iZXIgaW4gQ3VycmVudExpbmVcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlICMgZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBkbyBtYW51YWxseVxuICBzdGVwOiAxXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbmV3UmFuZ2VzID0gW11cbiAgICBzdXBlclxuICAgIGlmIEBuZXdSYW5nZXMubGVuZ3RoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCAoQGdldE5hbWUoKSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSlcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBuZXdSYW5nZXMsIHR5cGU6IEBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlKVxuXG4gIHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlOiAoc2NhblJhbmdlLCBmbj1udWxsKSAtPlxuICAgIG5ld1JhbmdlcyA9IFtdXG4gICAgQHBhdHRlcm4gPz0gLy8vI3tAZ2V0Q29uZmlnKCdudW1iZXJSZWdleCcpfS8vL2dcbiAgICBAc2NhbkZvcndhcmQgQHBhdHRlcm4sIHtzY2FuUmFuZ2V9LCAoZXZlbnQpID0+XG4gICAgICByZXR1cm4gaWYgZm4/IGFuZCBub3QgZm4oZXZlbnQpXG4gICAgICB7bWF0Y2hUZXh0LCByZXBsYWNlfSA9IGV2ZW50XG4gICAgICBuZXh0TnVtYmVyID0gQGdldE5leHROdW1iZXIobWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2gocmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIG5ld1Jhbmdlc1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBzY2FuUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGlmIEBpbnN0YW5jZW9mKCdJbmNyZW1lbnROdW1iZXInKSBvciBAdGFyZ2V0LmlzKCdDdXJyZW50U2VsZWN0aW9uJylcbiAgICAgIEBuZXdSYW5nZXMucHVzaChAcmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlKS4uLilcbiAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc2NhblJhbmdlLnN0YXJ0KVxuICAgIGVsc2VcbiAgICAgICMgY3RybC1hLCBjdHJsLXggaW4gYG5vcm1hbC1tb2RlYFxuICAgICAgaW5pdGlhbFBvaW50ID0gQG11dGF0aW9uTWFuYWdlci5nZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgbmV3UmFuZ2VzID0gQHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGluaXRpYWxQb2ludClcbiAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmYWxzZVxuXG4gICAgICBwb2ludCA9IG5ld1Jhbmdlc1swXT8uZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSA/IGluaXRpYWxQb2ludFxuICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIE51bWJlci5wYXJzZUludChudW1iZXJTdHJpbmcsIDEwKSArIEBzdGVwICogQGdldENvdW50KClcblxuIyBbY3RybC14XVxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZVxuICBAZXh0ZW5kKClcbiAgc3RlcDogLTFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtnIGN0cmwtYV1cbmNsYXNzIEluY3JlbWVudE51bWJlciBleHRlbmRzIEluY3JlYXNlXG4gIEBleHRlbmQoKVxuICBiYXNlTnVtYmVyOiBudWxsXG4gIHRhcmdldDogbnVsbFxuICBtdXRhdGVTZWxlY3Rpb25PcmRlcmQ6IHRydWVcblxuICBnZXROZXh0TnVtYmVyOiAobnVtYmVyU3RyaW5nKSAtPlxuICAgIGlmIEBiYXNlTnVtYmVyP1xuICAgICAgQGJhc2VOdW1iZXIgKz0gQHN0ZXAgKiBAZ2V0Q291bnQoKVxuICAgIGVsc2VcbiAgICAgIEBiYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgQGJhc2VOdW1iZXJcblxuIyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXJcbiAgQGV4dGVuZCgpXG4gIHN0ZXA6IC0xXG5cbiMgUHV0XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQ3Vyc29yIHBsYWNlbWVudDpcbiMgLSBwbGFjZSBhdCBlbmQgb2YgbXV0YXRpb246IHBhc3RlIG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0XG4jIC0gcGxhY2UgYXQgc3RhcnQgb2YgbXV0YXRpb246IG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0KGNoYXJhY3Rlcndpc2UsIGxpbmV3aXNlKVxuY2xhc3MgUHV0QmVmb3JlIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYmVmb3JlJ1xuICB0YXJnZXQ6ICdFbXB0eSdcbiAgZmxhc2hUeXBlOiAnb3BlcmF0b3ItbG9uZydcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2UgIyBtYW5hZ2UgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQ6IHRydWUgIyBtYW5hZ2UgbWFudWFsbHlcbiAgdHJhY2tDaGFuZ2U6IGZhbHNlICMgbWFuYWdlIG1hbnVhbGx5XG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB7dGV4dCwgdHlwZX0gPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIHJldHVybiB1bmxlc3MgdGV4dFxuICAgIEBvbkRpZEZpbmlzaE11dGF0aW9uKEBhZGp1c3RDdXJzb3JQb3NpdGlvbi5iaW5kKHRoaXMpKVxuXG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICAjIFRyYWNrQ2hhbmdlXG4gICAgICBpZiBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICAgIEBzZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAjIEZsYXNoXG4gICAgICBpZiBAZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpIGFuZCAoQGdldE5hbWUoKSBub3QgaW4gQGdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKSlcbiAgICAgICAgdG9SYW5nZSA9IChzZWxlY3Rpb24pID0+IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHRvUmFuZ2UpLCB0eXBlOiBAZ2V0Rmxhc2hUeXBlKCkpXG5cbiAgICBzdXBlclxuXG4gIGFkanVzdEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgICB7c3RhcnQsIGVuZH0gPSBuZXdSYW5nZSA9IEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgQGxpbmV3aXNlUGFzdGVcbiAgICAgICAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIHN0YXJ0LnJvdylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgbmV3UmFuZ2UuaXNTaW5nbGVMaW5lKClcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzdGFydClcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAge3RleHQsIHR5cGV9ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24pXG4gICAgdGV4dCA9IF8ubXVsdGlwbHlTdHJpbmcodGV4dCwgQGdldENvdW50KCkpXG4gICAgQGxpbmV3aXNlUGFzdGUgPSB0eXBlIGlzICdsaW5ld2lzZScgb3IgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICBuZXdSYW5nZSA9IEBwYXN0ZShzZWxlY3Rpb24sIHRleHQsIHtAbGluZXdpc2VQYXN0ZX0pXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG5ld1JhbmdlKVxuXG4gIHBhc3RlOiAoc2VsZWN0aW9uLCB0ZXh0LCB7bGluZXdpc2VQYXN0ZX0pIC0+XG4gICAgaWYgbGluZXdpc2VQYXN0ZVxuICAgICAgQHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIGVsc2VcbiAgICAgIEBwYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZTogKHNlbGVjdGlvbiwgdGV4dCkgLT5cbiAgICB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KCkgYW5kIEBsb2NhdGlvbiBpcyAnYWZ0ZXInIGFuZCBub3QgaXNFbXB0eVJvdyhAZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICByZXR1cm4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcblxuICAjIFJldHVybiBuZXdSYW5nZVxuICBwYXN0ZUxpbmV3aXNlOiAoc2VsZWN0aW9uLCB0ZXh0KSAtPlxuICAgIHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgdGV4dCArPSBcIlxcblwiIHVubGVzcyB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgbmV3UmFuZ2UgPSBudWxsXG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgaWYgQGxvY2F0aW9uIGlzICdiZWZvcmUnXG4gICAgICAgIG5ld1JhbmdlID0gaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oQGVkaXRvciwgW2N1cnNvclJvdywgMF0sIHRleHQpXG4gICAgICAgIHNldEJ1ZmZlclJvdyhjdXJzb3IsIG5ld1JhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2UgaWYgQGxvY2F0aW9uIGlzICdhZnRlcidcbiAgICAgICAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KEBlZGl0b3IsIGN1cnNvclJvdylcbiAgICAgICAgbmV3UmFuZ2UgPSBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBbY3Vyc29yUm93ICsgMSwgMF0sIHRleHQpXG4gICAgZWxzZVxuICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIikgdW5sZXNzIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICBuZXdSYW5nZSA9IHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG5cbiAgICByZXR1cm4gbmV3UmFuZ2VcblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmVcbiAgQGV4dGVuZCgpXG4gIGxvY2F0aW9uOiAnYWZ0ZXInXG5cbmNsYXNzIEFkZEJsYW5rTGluZUJlbG93IGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICB0YXJnZXQ6IFwiRW1wdHlcIlxuICBzdGF5QXRTYW1lUG9zaXRpb246IHRydWVcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHdoZXJlOiAnYmVsb3cnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICByb3cgKz0gMSBpZiBAd2hlcmUgaXMgJ2JlbG93J1xuICAgIHBvaW50ID0gW3JvdywgMF1cbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCBcIlxcblwiLnJlcGVhdChAZ2V0Q291bnQoKSkpXG5cbmNsYXNzIEFkZEJsYW5rTGluZUFib3ZlIGV4dGVuZHMgQWRkQmxhbmtMaW5lQmVsb3dcbiAgQGV4dGVuZCgpXG4gIHdoZXJlOiAnYWJvdmUnXG4iXX0=
