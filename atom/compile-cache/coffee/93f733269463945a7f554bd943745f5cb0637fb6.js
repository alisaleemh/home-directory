(function() {
  var Disposable, Point, Range, _, addClassList, adjustRangeToRowRange, assert, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, registerElement, removeClassList, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, trimRange,
    slice = [].slice;

  fs = require('fs-plus');

  settings = require('./settings');

  ref = require('atom'), Disposable = ref.Disposable, Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  assert = function(condition, message, fn) {
    if (fn == null) {
      fn = function(error) {
        return console.error(error.message);
      };
    }
    return atom.assert(condition, message, fn);
  };

  assertWithException = function(condition, message, fn) {
    return atom.assert(condition, message, function(error) {
      throw new Error(error.message);
    });
  };

  getAncestors = function(obj) {
    var ancestors, current, ref1;
    ancestors = [];
    current = obj;
    while (true) {
      ancestors.push(current);
      current = (ref1 = current.__super__) != null ? ref1.constructor : void 0;
      if (!current) {
        break;
      }
    }
    return ancestors;
  };

  getKeyBindingForCommand = function(command, arg) {
    var i, keymap, keymapPath, keymaps, keystrokes, len, packageName, results, selector;
    packageName = arg.packageName;
    results = null;
    keymaps = atom.keymaps.getKeyBindings();
    if (packageName != null) {
      keymapPath = atom.packages.getActivePackage(packageName).getKeymapPaths().pop();
      keymaps = keymaps.filter(function(arg1) {
        var source;
        source = arg1.source;
        return source === keymapPath;
      });
    }
    for (i = 0, len = keymaps.length; i < len; i++) {
      keymap = keymaps[i];
      if (!(keymap.command === command)) {
        continue;
      }
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/shift-/, '');
      (results != null ? results : results = []).push({
        keystrokes: keystrokes,
        selector: selector
      });
    }
    return results;
  };

  include = function(klass, module) {
    var key, results1, value;
    results1 = [];
    for (key in module) {
      value = module[key];
      results1.push(klass.prototype[key] = value);
    }
    return results1;
  };

  debug = function() {
    var filePath, messages;
    messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!settings.get('debug')) {
      return;
    }
    switch (settings.get('debugOutput')) {
      case 'console':
        return console.log.apply(console, messages);
      case 'file':
        filePath = fs.normalize(settings.get('debugOutputFilePath'));
        if (fs.existsSync(filePath)) {
          return fs.appendFileSync(filePath, messages + "\n");
        }
    }
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = editor.element;
    scrollTop = editorElement.getScrollTop();
    foldStartRows = editor.displayLayer.foldsMarkerLayer.findMarkers({}).map(function(m) {
      return m.getStartPosition().row;
    });
    return function() {
      var i, len, ref1, row;
      ref1 = foldStartRows.reverse();
      for (i = 0, len = ref1.length; i < len; i++) {
        row = ref1[i];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return editorElement.setScrollTop(scrollTop);
    };
  };

  isLinewiseRange = function(arg) {
    var end, ref1, start;
    start = arg.start, end = arg.end;
    return (start.row !== end.row) && ((start.column === (ref1 = end.column) && ref1 === 0));
  };

  isEndsWithNewLineForBufferRow = function(editor, row) {
    var end, ref1, start;
    ref1 = editor.bufferRangeForBufferRow(row, {
      includeNewline: true
    }), start = ref1.start, end = ref1.end;
    return start.row !== end.row;
  };

  haveSomeNonEmptySelection = function(editor) {
    return editor.getSelections().some(isNotEmpty);
  };

  sortRanges = function(collection) {
    return collection.sort(function(a, b) {
      return a.compare(b);
    });
  };

  getIndex = function(index, list) {
    var length;
    length = list.length;
    if (length === 0) {
      return -1;
    } else {
      index = index % length;
      if (index >= 0) {
        return index;
      } else {
        return length + index;
      }
    }
  };

  getVisibleBufferRange = function(editor) {
    var endRow, ref1, startRow;
    ref1 = editor.element.getVisibleRowRange(), startRow = ref1[0], endRow = ref1[1];
    if (!((startRow != null) && (endRow != null))) {
      return null;
    }
    startRow = editor.bufferRowForScreenRow(startRow);
    endRow = editor.bufferRowForScreenRow(endRow);
    return new Range([startRow, 0], [endRow, 2e308]);
  };

  getVisibleEditors = function() {
    var editor, i, len, pane, ref1, results1;
    ref1 = atom.workspace.getPanes();
    results1 = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      pane = ref1[i];
      if (editor = pane.getActiveEditor()) {
        results1.push(editor);
      }
    }
    return results1;
  };

  getEndOfLineForBufferRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEndOfLineForBufferRow(editor, point.row).isEqual(point);
  };

  pointIsOnWhiteSpace = function(editor, point) {
    var char;
    char = getRightCharacterForBufferPosition(editor, point);
    return !/\S/.test(char);
  };

  pointIsAtEndOfLineAtNonEmptyRow = function(editor, point) {
    point = Point.fromObject(point);
    return point.column !== 0 && pointIsAtEndOfLine(editor, point);
  };

  pointIsAtVimEndOfFile = function(editor, point) {
    return getVimEofBufferPosition(editor).isEqual(point);
  };

  isEmptyRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).isEmpty();
  };

  cursorIsAtEndOfLineAtNonEmptyRow = function(cursor) {
    return pointIsAtEndOfLineAtNonEmptyRow(cursor.editor, cursor.getBufferPosition());
  };

  cursorIsAtVimEndOfFile = function(cursor) {
    return pointIsAtVimEndOfFile(cursor.editor, cursor.getBufferPosition());
  };

  getRightCharacterForBufferPosition = function(editor, point, amount) {
    if (amount == null) {
      amount = 1;
    }
    return editor.getTextInBufferRange(Range.fromPointWithDelta(point, 0, amount));
  };

  getLeftCharacterForBufferPosition = function(editor, point, amount) {
    if (amount == null) {
      amount = 1;
    }
    return editor.getTextInBufferRange(Range.fromPointWithDelta(point, 0, -amount));
  };

  getTextInScreenRange = function(editor, screenRange) {
    var bufferRange;
    bufferRange = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(bufferRange);
  };

  getNonWordCharactersForCursor = function(cursor) {
    var scope;
    if (cursor.getNonWordCharacters != null) {
      return cursor.getNonWordCharacters();
    } else {
      scope = cursor.getScopeDescriptor().getScopesArray();
      return atom.config.get('editor.nonWordCharacters', {
        scope: scope
      });
    }
  };

  moveCursorToNextNonWhitespace = function(cursor) {
    var editor, originalPoint, point, vimEof;
    originalPoint = cursor.getBufferPosition();
    editor = cursor.editor;
    vimEof = getVimEofBufferPosition(editor);
    while (pointIsOnWhiteSpace(editor, point = cursor.getBufferPosition()) && !point.isGreaterThanOrEqual(vimEof)) {
      cursor.moveRight();
    }
    return !originalPoint.isEqual(cursor.getBufferPosition());
  };

  getBufferRows = function(editor, arg) {
    var direction, endRow, i, j, ref1, ref2, results1, results2, startRow;
    startRow = arg.startRow, direction = arg.direction;
    switch (direction) {
      case 'previous':
        if (startRow <= 0) {
          return [];
        } else {
          return (function() {
            results1 = [];
            for (var i = ref1 = startRow - 1; ref1 <= 0 ? i <= 0 : i >= 0; ref1 <= 0 ? i++ : i--){ results1.push(i); }
            return results1;
          }).apply(this);
        }
        break;
      case 'next':
        endRow = getVimLastBufferRow(editor);
        if (startRow >= endRow) {
          return [];
        } else {
          return (function() {
            results2 = [];
            for (var j = ref2 = startRow + 1; ref2 <= endRow ? j <= endRow : j >= endRow; ref2 <= endRow ? j++ : j--){ results2.push(j); }
            return results2;
          }).apply(this);
        }
    }
  };

  getVimEofBufferPosition = function(editor) {
    var eof;
    eof = editor.getEofBufferPosition();
    if ((eof.row === 0) || (eof.column > 0)) {
      return eof;
    } else {
      return getEndOfLineForBufferRow(editor, eof.row - 1);
    }
  };

  getVimEofScreenPosition = function(editor) {
    return editor.screenPositionForBufferPosition(getVimEofBufferPosition(editor));
  };

  getVimLastBufferRow = function(editor) {
    return getVimEofBufferPosition(editor).row;
  };

  getVimLastScreenRow = function(editor) {
    return getVimEofScreenPosition(editor).row;
  };

  getFirstVisibleScreenRow = function(editor) {
    return editor.element.getFirstVisibleScreenRow();
  };

  getLastVisibleScreenRow = function(editor) {
    return editor.element.getLastVisibleScreenRow();
  };

  getFirstCharacterPositionForBufferRow = function(editor, row) {
    var range, ref1;
    range = findRangeInBufferRow(editor, /\S/, row);
    return (ref1 = range != null ? range.start : void 0) != null ? ref1 : new Point(row, 0);
  };

  trimRange = function(editor, scanRange) {
    var end, pattern, ref1, setEnd, setStart, start;
    pattern = /\S/;
    ref1 = [], start = ref1[0], end = ref1[1];
    setStart = function(arg) {
      var range;
      range = arg.range;
      return start = range.start, range;
    };
    setEnd = function(arg) {
      var range;
      range = arg.range;
      return end = range.end, range;
    };
    editor.scanInBufferRange(pattern, scanRange, setStart);
    if (start != null) {
      editor.backwardsScanInBufferRange(pattern, scanRange, setEnd);
    }
    if ((start != null) && (end != null)) {
      return new Range(start, end);
    } else {
      return scanRange;
    }
  };

  setBufferRow = function(cursor, row, options) {
    var column, ref1;
    column = (ref1 = cursor.goalColumn) != null ? ref1 : cursor.getBufferColumn();
    cursor.setBufferPosition([row, column], options);
    return cursor.goalColumn = column;
  };

  setBufferColumn = function(cursor, column) {
    return cursor.setBufferPosition([cursor.getBufferRow(), column]);
  };

  moveCursor = function(cursor, arg, fn) {
    var goalColumn, preserveGoalColumn;
    preserveGoalColumn = arg.preserveGoalColumn;
    goalColumn = cursor.goalColumn;
    fn(cursor);
    if (preserveGoalColumn && (goalColumn != null)) {
      return cursor.goalColumn = goalColumn;
    }
  };

  shouldPreventWrapLine = function(cursor) {
    var column, ref1, row, tabLength, text;
    ref1 = cursor.getBufferPosition(), row = ref1.row, column = ref1.column;
    if (atom.config.get('editor.softTabs')) {
      tabLength = atom.config.get('editor.tabLength');
      if ((0 < column && column < tabLength)) {
        text = cursor.editor.getTextInBufferRange([[row, 0], [row, tabLength]]);
        return /^\s+$/.test(text);
      } else {
        return false;
      }
    }
  };

  moveCursorLeft = function(cursor, options) {
    var allowWrap, motion, needSpecialCareToPreventWrapLine;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap, needSpecialCareToPreventWrapLine = options.needSpecialCareToPreventWrapLine;
    delete options.allowWrap;
    if (needSpecialCareToPreventWrapLine) {
      if (shouldPreventWrapLine(cursor)) {
        return;
      }
    }
    if (!cursor.isAtBeginningOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveLeft();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorRight = function(cursor, options) {
    var allowWrap, motion;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtEndOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveRight();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorUpScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      motion = function(cursor) {
        return cursor.moveUp();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      motion = function(cursor) {
        return cursor.moveDown();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (getVimLastBufferRow(cursor.editor) !== point.row) {
      return cursor.setBufferPosition(point.translate([+1, 0]));
    }
  };

  moveCursorUpBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (point.row !== 0) {
      return cursor.setBufferPosition(point.translate([-1, 0]));
    }
  };

  moveCursorToFirstCharacterAtRow = function(cursor, row) {
    cursor.setBufferPosition([row, 0]);
    return cursor.moveToFirstCharacterOfLine();
  };

  getValidVimBufferRow = function(editor, row) {
    return limitNumber(row, {
      min: 0,
      max: getVimLastBufferRow(editor)
    });
  };

  getValidVimScreenRow = function(editor, row) {
    return limitNumber(row, {
      min: 0,
      max: getVimLastScreenRow(editor)
    });
  };

  getLineTextToBufferPosition = function(editor, arg, arg1) {
    var column, exclusive, row;
    row = arg.row, column = arg.column;
    exclusive = (arg1 != null ? arg1 : {}).exclusive;
    if (exclusive != null ? exclusive : true) {
      return editor.lineTextForBufferRow(row).slice(0, column);
    } else {
      return editor.lineTextForBufferRow(row).slice(0, +column + 1 || 9e9);
    }
  };

  getIndentLevelForBufferRow = function(editor, row) {
    return editor.indentLevelForLine(editor.lineTextForBufferRow(row));
  };

  getCodeFoldRowRanges = function(editor) {
    var i, ref1, results1;
    return (function() {
      results1 = [];
      for (var i = 0, ref1 = editor.getLastBufferRow(); 0 <= ref1 ? i <= ref1 : i >= ref1; 0 <= ref1 ? i++ : i--){ results1.push(i); }
      return results1;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    });
  };

  getCodeFoldRowRangesContainesForRow = function(editor, bufferRow, arg) {
    var includeStartRow;
    includeStartRow = (arg != null ? arg : {}).includeStartRow;
    if (includeStartRow == null) {
      includeStartRow = true;
    }
    return getCodeFoldRowRanges(editor).filter(function(arg1) {
      var endRow, startRow;
      startRow = arg1[0], endRow = arg1[1];
      if (includeStartRow) {
        return (startRow <= bufferRow && bufferRow <= endRow);
      } else {
        return (startRow < bufferRow && bufferRow <= endRow);
      }
    });
  };

  getBufferRangeForRowRange = function(editor, rowRange) {
    var endRange, ref1, startRange;
    ref1 = rowRange.map(function(row) {
      return editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    }), startRange = ref1[0], endRange = ref1[1];
    return startRange.union(endRange);
  };

  getTokenizedLineForRow = function(editor, row) {
    return editor.tokenizedBuffer.tokenizedLineForRow(row);
  };

  getScopesForTokenizedLine = function(line) {
    var i, len, ref1, results1, tag;
    ref1 = line.tags;
    results1 = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      tag = ref1[i];
      if (tag < 0 && (tag % 2 === -1)) {
        results1.push(atom.grammars.scopeForId(tag));
      }
    }
    return results1;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, i, isValidToken, j, k, len, len1, len2, position, ref1, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var i, j, ref1, ref2, ref3, results1, results2;
      switch (direction) {
        case 'forward':
          return (function() {
            results1 = [];
            for (var i = ref1 = fromPoint.row, ref2 = editor.getLastBufferRow(); ref1 <= ref2 ? i <= ref2 : i >= ref2; ref1 <= ref2 ? i++ : i--){ results1.push(i); }
            return results1;
          }).apply(this);
        case 'backward':
          return (function() {
            results2 = [];
            for (var j = ref3 = fromPoint.row; ref3 <= 0 ? j <= 0 : j >= 0; ref3 <= 0 ? j++ : j--){ results2.push(j); }
            return results2;
          }).apply(this);
      }
    })();
    continueScan = true;
    stop = function() {
      return continueScan = false;
    };
    isValidToken = (function() {
      switch (direction) {
        case 'forward':
          return function(arg) {
            var position;
            position = arg.position;
            return position.isGreaterThan(fromPoint);
          };
        case 'backward':
          return function(arg) {
            var position;
            position = arg.position;
            return position.isLessThan(fromPoint);
          };
      }
    })();
    for (i = 0, len = scanRows.length; i < len; i++) {
      row = scanRows[i];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      ref1 = tokenizedLine.tags;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        tag = ref1[j];
        tokenIterator.next();
        if (tag < 0) {
          scope = atom.grammars.scopeForId(tag);
          if ((tag % 2) === 0) {
            null;
          } else {
            position = new Point(row, column);
            results.push({
              scope: scope,
              position: position,
              stop: stop
            });
          }
        } else {
          column += tag;
        }
      }
      results = results.filter(isValidToken);
      if (direction === 'backward') {
        results.reverse();
      }
      for (k = 0, len2 = results.length; k < len2; k++) {
        result = results[k];
        fn(result);
        if (!continueScan) {
          return;
        }
      }
      if (!continueScan) {
        return;
      }
    }
  };

  detectScopeStartPositionForScope = function(editor, fromPoint, direction, scope) {
    var point;
    point = null;
    scanForScopeStart(editor, fromPoint, direction, function(info) {
      if (info.scope.search(scope) >= 0) {
        info.stop();
        return point = info.position;
      }
    });
    return point;
  };

  isIncludeFunctionScopeForRow = function(editor, row) {
    var tokenizedLine;
    if (tokenizedLine = getTokenizedLineForRow(editor, row)) {
      return getScopesForTokenizedLine(tokenizedLine).some(function(scope) {
        return isFunctionScope(editor, scope);
      });
    } else {
      return false;
    }
  };

  isFunctionScope = function(editor, scope) {
    var pattern, scopes;
    switch (editor.getGrammar().scopeName) {
      case 'source.go':
      case 'source.elixir':
        scopes = ['entity.name.function'];
        break;
      case 'source.ruby':
        scopes = ['meta.function.', 'meta.class.', 'meta.module.'];
        break;
      default:
        scopes = ['meta.function.', 'meta.class.'];
    }
    pattern = new RegExp('^' + scopes.map(_.escapeRegExp).join('|'));
    return pattern.test(scope);
  };

  smartScrollToBufferPosition = function(editor, point) {
    var center, editorAreaHeight, editorElement, onePageDown, onePageUp, target;
    editorElement = editor.element;
    editorAreaHeight = editor.getLineHeightInPixels() * (editor.getRowsPerPage() - 1);
    onePageUp = editorElement.getScrollTop() - editorAreaHeight;
    onePageDown = editorElement.getScrollBottom() + editorAreaHeight;
    target = editorElement.pixelPositionForBufferPosition(point).top;
    center = (onePageDown < target) || (target < onePageUp);
    return editor.scrollToBufferPosition(point, {
      center: center
    });
  };

  matchScopes = function(editorElement, scopes) {
    var className, classNames, classes, containsCount, i, j, len, len1;
    classes = scopes.map(function(scope) {
      return scope.split('.');
    });
    for (i = 0, len = classes.length; i < len; i++) {
      classNames = classes[i];
      containsCount = 0;
      for (j = 0, len1 = classNames.length; j < len1; j++) {
        className = classNames[j];
        if (editorElement.classList.contains(className)) {
          containsCount += 1;
        }
      }
      if (containsCount === classNames.length) {
        return true;
      }
    }
    return false;
  };

  isSingleLineText = function(text) {
    return text.split(/\n|\r\n/).length === 1;
  };

  getWordBufferRangeAndKindAtBufferPosition = function(editor, point, options) {
    var characterAtPoint, cursor, kind, nonWordCharacters, nonWordRegex, range, ref1, singleNonWordChar, source, wordRegex;
    if (options == null) {
      options = {};
    }
    singleNonWordChar = options.singleNonWordChar, wordRegex = options.wordRegex, nonWordCharacters = options.nonWordCharacters, cursor = options.cursor;
    if ((wordRegex == null) || (nonWordCharacters == null)) {
      if (cursor == null) {
        cursor = editor.getLastCursor();
      }
      ref1 = _.extend(options, buildWordPatternByCursor(cursor, options)), wordRegex = ref1.wordRegex, nonWordCharacters = ref1.nonWordCharacters;
    }
    if (singleNonWordChar == null) {
      singleNonWordChar = true;
    }
    characterAtPoint = getRightCharacterForBufferPosition(editor, point);
    nonWordRegex = new RegExp("[" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    if (/\s/.test(characterAtPoint)) {
      source = "[\t ]+";
      kind = 'white-space';
      wordRegex = new RegExp(source);
    } else if (nonWordRegex.test(characterAtPoint) && !wordRegex.test(characterAtPoint)) {
      kind = 'non-word';
      if (singleNonWordChar) {
        source = _.escapeRegExp(characterAtPoint);
        wordRegex = new RegExp(source);
      } else {
        wordRegex = nonWordRegex;
      }
    } else {
      kind = 'word';
    }
    range = getWordBufferRangeAtBufferPosition(editor, point, {
      wordRegex: wordRegex
    });
    return {
      kind: kind,
      range: range
    };
  };

  getWordPatternAtBufferPosition = function(editor, point, options) {
    var boundarizeForWord, endBoundary, kind, pattern, range, ref1, ref2, startBoundary, text;
    if (options == null) {
      options = {};
    }
    boundarizeForWord = (ref1 = options.boundarizeForWord) != null ? ref1 : true;
    delete options.boundarizeForWord;
    ref2 = getWordBufferRangeAndKindAtBufferPosition(editor, point, options), range = ref2.range, kind = ref2.kind;
    text = editor.getTextInBufferRange(range);
    pattern = _.escapeRegExp(text);
    if (kind === 'word' && boundarizeForWord) {
      startBoundary = /^\w/.test(text) ? "\\b" : '';
      endBoundary = /\w$/.test(text) ? "\\b" : '';
      pattern = startBoundary + pattern + endBoundary;
    }
    return new RegExp(pattern, 'g');
  };

  getSubwordPatternAtBufferPosition = function(editor, point, options) {
    if (options == null) {
      options = {};
    }
    options = {
      wordRegex: editor.getLastCursor().subwordRegExp(),
      boundarizeForWord: false
    };
    return getWordPatternAtBufferPosition(editor, point, options);
  };

  buildWordPatternByCursor = function(cursor, arg) {
    var nonWordCharacters, wordRegex;
    wordRegex = arg.wordRegex;
    nonWordCharacters = getNonWordCharactersForCursor(cursor);
    if (wordRegex == null) {
      wordRegex = new RegExp("^[\t ]*$|[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    }
    return {
      wordRegex: wordRegex,
      nonWordCharacters: nonWordCharacters
    };
  };

  getBeginningOfWordBufferPosition = function(editor, point, arg) {
    var found, scanRange, wordRegex;
    wordRegex = (arg != null ? arg : {}).wordRegex;
    scanRange = [[point.row, 0], point];
    found = null;
    editor.backwardsScanInBufferRange(wordRegex, scanRange, function(arg1) {
      var matchText, range, stop;
      range = arg1.range, matchText = arg1.matchText, stop = arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.start.isLessThan(point)) {
        if (range.end.isGreaterThanOrEqual(point)) {
          found = range.start;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getEndOfWordBufferPosition = function(editor, point, arg) {
    var found, scanRange, wordRegex;
    wordRegex = (arg != null ? arg : {}).wordRegex;
    scanRange = [point, [point.row, 2e308]];
    found = null;
    editor.scanInBufferRange(wordRegex, scanRange, function(arg1) {
      var matchText, range, stop;
      range = arg1.range, matchText = arg1.matchText, stop = arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.end.isGreaterThan(point)) {
        if (range.start.isLessThanOrEqual(point)) {
          found = range.end;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getWordBufferRangeAtBufferPosition = function(editor, position, options) {
    var endPosition, startPosition;
    if (options == null) {
      options = {};
    }
    endPosition = getEndOfWordBufferPosition(editor, position, options);
    startPosition = getBeginningOfWordBufferPosition(editor, endPosition, options);
    return new Range(startPosition, endPosition);
  };

  adjustRangeToRowRange = function(arg, options) {
    var end, endRow, ref1, start;
    start = arg.start, end = arg.end;
    if (options == null) {
      options = {};
    }
    endRow = end.row;
    if (end.column === 0) {
      endRow = limitNumber(end.row - 1, {
        min: start.row
      });
    }
    if ((ref1 = options.endOnly) != null ? ref1 : false) {
      return new Range(start, [endRow, 2e308]);
    } else {
      return new Range([start.row, 0], [endRow, 2e308]);
    }
  };

  shrinkRangeEndToBeforeNewLine = function(range) {
    var end, endRow, start;
    start = range.start, end = range.end;
    if (end.column === 0) {
      endRow = limitNumber(end.row - 1, {
        min: start.row
      });
      return new Range(start, [endRow, 2e308]);
    } else {
      return range;
    }
  };

  scanEditor = function(editor, pattern) {
    var ranges;
    ranges = [];
    editor.scan(pattern, function(arg) {
      var range;
      range = arg.range;
      return ranges.push(range);
    });
    return ranges;
  };

  collectRangeInBufferRow = function(editor, row, pattern) {
    var ranges, scanRange;
    ranges = [];
    scanRange = editor.bufferRangeForBufferRow(row);
    editor.scanInBufferRange(pattern, scanRange, function(arg) {
      var range;
      range = arg.range;
      return ranges.push(range);
    });
    return ranges;
  };

  findRangeInBufferRow = function(editor, pattern, row, arg) {
    var direction, range, scanFunctionName, scanRange;
    direction = (arg != null ? arg : {}).direction;
    if (direction === 'backward') {
      scanFunctionName = 'backwardsScanInBufferRange';
    } else {
      scanFunctionName = 'scanInBufferRange';
    }
    range = null;
    scanRange = editor.bufferRangeForBufferRow(row);
    editor[scanFunctionName](pattern, scanRange, function(event) {
      return range = event.range;
    });
    return range;
  };

  getLargestFoldRangeContainsBufferRow = function(editor, row) {
    var end, endPoint, i, len, marker, markers, ref1, ref2, start, startPoint;
    markers = editor.displayLayer.foldsMarkerLayer.findMarkers({
      intersectsRow: row
    });
    startPoint = null;
    endPoint = null;
    ref1 = markers != null ? markers : [];
    for (i = 0, len = ref1.length; i < len; i++) {
      marker = ref1[i];
      ref2 = marker.getRange(), start = ref2.start, end = ref2.end;
      if (!startPoint) {
        startPoint = start;
        endPoint = end;
        continue;
      }
      if (start.isLessThan(startPoint)) {
        startPoint = start;
        endPoint = end;
      }
    }
    if ((startPoint != null) && (endPoint != null)) {
      return new Range(startPoint, endPoint);
    }
  };

  translatePointAndClip = function(editor, point, direction, arg) {
    var dontClip, eol, newRow, screenPoint, translate;
    translate = (arg != null ? arg : {}).translate;
    if (translate == null) {
      translate = true;
    }
    point = Point.fromObject(point);
    dontClip = false;
    switch (direction) {
      case 'forward':
        if (translate) {
          point = point.translate([0, +1]);
        }
        eol = editor.bufferRangeForBufferRow(point.row).end;
        if (point.isEqual(eol)) {
          dontClip = true;
        }
        if (point.isGreaterThan(eol)) {
          point = new Point(point.row + 1, 0);
          dontClip = true;
        }
        point = Point.min(point, editor.getEofBufferPosition());
        break;
      case 'backward':
        if (translate) {
          point = point.translate([0, -1]);
        }
        if (point.column < 0) {
          newRow = point.row - 1;
          eol = editor.bufferRangeForBufferRow(newRow).end;
          point = new Point(newRow, eol.column);
        }
        point = Point.max(point, Point.ZERO);
    }
    if (dontClip) {
      return point;
    } else {
      screenPoint = editor.screenPositionForBufferPosition(point, {
        clipDirection: direction
      });
      return editor.bufferPositionForScreenPosition(screenPoint);
    }
  };

  getRangeByTranslatePointAndClip = function(editor, range, which, direction, options) {
    var newPoint;
    newPoint = translatePointAndClip(editor, range[which], direction, options);
    switch (which) {
      case 'start':
        return new Range(newPoint, range.end);
      case 'end':
        return new Range(range.start, newPoint);
    }
  };

  registerElement = function(name, options) {
    var Element, element;
    element = document.createElement(name);
    if (element.constructor === HTMLElement) {
      Element = document.registerElement(name, options);
    } else {
      Element = element.constructor;
      if (options.prototype != null) {
        Element.prototype = options.prototype;
      }
    }
    return Element;
  };

  getPackage = function(name, fn) {
    return new Promise(function(resolve) {
      var disposable, pkg;
      if (atom.packages.isPackageActive(name)) {
        pkg = atom.packages.getActivePackage(name);
        return resolve(pkg);
      } else {
        return disposable = atom.packages.onDidActivatePackage(function(pkg) {
          if (pkg.name === name) {
            disposable.dispose();
            return resolve(pkg);
          }
        });
      }
    });
  };

  searchByProjectFind = function(editor, text) {
    atom.commands.dispatch(editor.element, 'project-find:show');
    return getPackage('find-and-replace').then(function(pkg) {
      var projectFindView;
      projectFindView = pkg.mainModule.projectFindView;
      if (projectFindView != null) {
        projectFindView.findEditor.setText(text);
        return projectFindView.confirm();
      }
    });
  };

  limitNumber = function(number, arg) {
    var max, min, ref1;
    ref1 = arg != null ? arg : {}, max = ref1.max, min = ref1.min;
    if (max != null) {
      number = Math.min(number, max);
    }
    if (min != null) {
      number = Math.max(number, min);
    }
    return number;
  };

  findRangeContainsPoint = function(ranges, point) {
    var i, len, range;
    for (i = 0, len = ranges.length; i < len; i++) {
      range = ranges[i];
      if (range.containsPoint(point)) {
        return range;
      }
    }
    return null;
  };

  negateFunction = function(fn) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return !fn.apply(null, args);
    };
  };

  isEmpty = function(target) {
    return target.isEmpty();
  };

  isNotEmpty = negateFunction(isEmpty);

  isSingleLineRange = function(range) {
    return range.isSingleLine();
  };

  isNotSingleLineRange = negateFunction(isSingleLineRange);

  isLeadingWhiteSpaceRange = function(editor, range) {
    return /^[\t ]*$/.test(editor.getTextInBufferRange(range));
  };

  isNotLeadingWhiteSpaceRange = negateFunction(isLeadingWhiteSpaceRange);

  isEscapedCharRange = function(editor, range) {
    var chars;
    range = Range.fromObject(range);
    chars = getLeftCharacterForBufferPosition(editor, range.start, 2);
    return chars.endsWith('\\') && !chars.endsWith('\\\\');
  };

  insertTextAtBufferPosition = function(editor, point, text) {
    return editor.setTextInBufferRange([point, point], text);
  };

  ensureEndsWithNewLineForBufferRow = function(editor, row) {
    var eol;
    if (!isEndsWithNewLineForBufferRow(editor, row)) {
      eol = getEndOfLineForBufferRow(editor, row);
      return insertTextAtBufferPosition(editor, eol, "\n");
    }
  };

  forEachPaneAxis = function(fn, base) {
    var child, i, len, ref1, results1;
    if (base == null) {
      base = atom.workspace.getActivePane().getContainer().getRoot();
    }
    if (base.children != null) {
      fn(base);
      ref1 = base.children;
      results1 = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        child = ref1[i];
        results1.push(forEachPaneAxis(fn, child));
      }
      return results1;
    }
  };

  modifyClassList = function() {
    var action, classNames, element, ref1;
    action = arguments[0], element = arguments[1], classNames = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return (ref1 = element.classList)[action].apply(ref1, classNames);
  };

  addClassList = modifyClassList.bind(null, 'add');

  removeClassList = modifyClassList.bind(null, 'remove');

  toggleClassList = modifyClassList.bind(null, 'toggle');

  toggleCaseForCharacter = function(char) {
    var charLower;
    charLower = char.toLowerCase();
    if (charLower === char) {
      return char.toUpperCase();
    } else {
      return charLower;
    }
  };

  splitTextByNewLine = function(text) {
    if (text.endsWith("\n")) {
      return text.trimRight().split(/\r?\n/g);
    } else {
      return text.split(/\r?\n/g);
    }
  };

  humanizeBufferRange = function(editor, range) {
    var end, newEnd, newStart, start;
    if (isSingleLineRange(range) || isLinewiseRange(range)) {
      return range;
    }
    start = range.start, end = range.end;
    if (pointIsAtEndOfLine(editor, start)) {
      newStart = start.traverse([1, 0]);
    }
    if (pointIsAtEndOfLine(editor, end)) {
      newEnd = end.traverse([1, 0]);
    }
    if ((newStart != null) || (newEnd != null)) {
      return new Range(newStart != null ? newStart : start, newEnd != null ? newEnd : end);
    } else {
      return range;
    }
  };

  expandRangeToWhiteSpaces = function(editor, range) {
    var end, newEnd, newStart, scanRange, start;
    start = range.start, end = range.end;
    newEnd = null;
    scanRange = [end, getEndOfLineForBufferRow(editor, end.row)];
    editor.scanInBufferRange(/\S/, scanRange, function(arg) {
      var range;
      range = arg.range;
      return newEnd = range.start;
    });
    if (newEnd != null ? newEnd.isGreaterThan(end) : void 0) {
      return new Range(start, newEnd);
    }
    newStart = null;
    scanRange = [[start.row, 0], range.start];
    editor.backwardsScanInBufferRange(/\S/, scanRange, function(arg) {
      var range;
      range = arg.range;
      return newStart = range.end;
    });
    if (newStart != null ? newStart.isLessThan(start) : void 0) {
      return new Range(newStart, end);
    }
    return range;
  };

  scanEditorInDirection = function(editor, direction, pattern, options, fn) {
    var allowNextLine, from, scanFunction, scanRange;
    if (options == null) {
      options = {};
    }
    allowNextLine = options.allowNextLine, from = options.from, scanRange = options.scanRange;
    if ((from == null) && (scanRange == null)) {
      throw new Error("You must either of 'from' or 'scanRange' options");
    }
    if (scanRange) {
      allowNextLine = true;
    } else {
      if (allowNextLine == null) {
        allowNextLine = true;
      }
    }
    if (from != null) {
      from = Point.fromObject(from);
    }
    switch (direction) {
      case 'forward':
        if (scanRange == null) {
          scanRange = new Range(from, getVimEofBufferPosition(editor));
        }
        scanFunction = 'scanInBufferRange';
        break;
      case 'backward':
        if (scanRange == null) {
          scanRange = new Range([0, 0], from);
        }
        scanFunction = 'backwardsScanInBufferRange';
    }
    return editor[scanFunction](pattern, scanRange, function(event) {
      if (!allowNextLine && event.range.start.row !== from.row) {
        event.stop();
        return;
      }
      return fn(event);
    });
  };

  module.exports = {
    assert: assert,
    assertWithException: assertWithException,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    saveEditorState: saveEditorState,
    isLinewiseRange: isLinewiseRange,
    haveSomeNonEmptySelection: haveSomeNonEmptySelection,
    sortRanges: sortRanges,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsOnWhiteSpace: pointIsOnWhiteSpace,
    pointIsAtEndOfLineAtNonEmptyRow: pointIsAtEndOfLineAtNonEmptyRow,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
    cursorIsAtVimEndOfFile: cursorIsAtVimEndOfFile,
    getVimEofBufferPosition: getVimEofBufferPosition,
    getVimEofScreenPosition: getVimEofScreenPosition,
    getVimLastBufferRow: getVimLastBufferRow,
    getVimLastScreenRow: getVimLastScreenRow,
    setBufferRow: setBufferRow,
    setBufferColumn: setBufferColumn,
    moveCursorLeft: moveCursorLeft,
    moveCursorRight: moveCursorRight,
    moveCursorUpScreen: moveCursorUpScreen,
    moveCursorDownScreen: moveCursorDownScreen,
    getEndOfLineForBufferRow: getEndOfLineForBufferRow,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    getLineTextToBufferPosition: getLineTextToBufferPosition,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    getTextInScreenRange: getTextInScreenRange,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    isEmptyRow: isEmptyRow,
    cursorIsAtEndOfLineAtNonEmptyRow: cursorIsAtEndOfLineAtNonEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    trimRange: trimRange,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    registerElement: registerElement,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    matchScopes: matchScopes,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
    isSingleLineText: isSingleLineText,
    getWordBufferRangeAtBufferPosition: getWordBufferRangeAtBufferPosition,
    getWordBufferRangeAndKindAtBufferPosition: getWordBufferRangeAndKindAtBufferPosition,
    getWordPatternAtBufferPosition: getWordPatternAtBufferPosition,
    getSubwordPatternAtBufferPosition: getSubwordPatternAtBufferPosition,
    getNonWordCharactersForCursor: getNonWordCharactersForCursor,
    shrinkRangeEndToBeforeNewLine: shrinkRangeEndToBeforeNewLine,
    scanEditor: scanEditor,
    collectRangeInBufferRow: collectRangeInBufferRow,
    findRangeInBufferRow: findRangeInBufferRow,
    getLargestFoldRangeContainsBufferRow: getLargestFoldRangeContainsBufferRow,
    translatePointAndClip: translatePointAndClip,
    getRangeByTranslatePointAndClip: getRangeByTranslatePointAndClip,
    getPackage: getPackage,
    searchByProjectFind: searchByProjectFind,
    limitNumber: limitNumber,
    findRangeContainsPoint: findRangeContainsPoint,
    isEmpty: isEmpty,
    isNotEmpty: isNotEmpty,
    isSingleLineRange: isSingleLineRange,
    isNotSingleLineRange: isNotSingleLineRange,
    insertTextAtBufferPosition: insertTextAtBufferPosition,
    ensureEndsWithNewLineForBufferRow: ensureEndsWithNewLineForBufferRow,
    isLeadingWhiteSpaceRange: isLeadingWhiteSpaceRange,
    isNotLeadingWhiteSpaceRange: isNotLeadingWhiteSpaceRange,
    isEscapedCharRange: isEscapedCharRange,
    forEachPaneAxis: forEachPaneAxis,
    addClassList: addClassList,
    removeClassList: removeClassList,
    toggleClassList: toggleClassList,
    toggleCaseForCharacter: toggleCaseForCharacter,
    splitTextByNewLine: splitTextByNewLine,
    humanizeBufferRange: humanizeBufferRange,
    expandRangeToWhiteSpaces: expandRangeToWhiteSpaces,
    scanEditorInDirection: scanEditorInDirection
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi91dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDQxRUFBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQywyQkFBRCxFQUFhLGlCQUFiLEVBQW9COztFQUNwQixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE1BQUEsR0FBUyxTQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLEVBQXJCO0lBQ1AsSUFBTyxVQUFQO01BQ0UsRUFBQSxHQUFLLFNBQUMsS0FBRDtlQUNILE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBSyxDQUFDLE9BQXBCO01BREcsRUFEUDs7V0FHQSxJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVosRUFBdUIsT0FBdkIsRUFBZ0MsRUFBaEM7RUFKTzs7RUFNVCxtQkFBQSxHQUFzQixTQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLEVBQXJCO1dBQ3BCLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWixFQUF1QixPQUF2QixFQUFnQyxTQUFDLEtBQUQ7QUFDOUIsWUFBVSxJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsT0FBWjtJQURvQixDQUFoQztFQURvQjs7RUFJdEIsWUFBQSxHQUFlLFNBQUMsR0FBRDtBQUNiLFFBQUE7SUFBQSxTQUFBLEdBQVk7SUFDWixPQUFBLEdBQVU7QUFDVixXQUFBLElBQUE7TUFDRSxTQUFTLENBQUMsSUFBVixDQUFlLE9BQWY7TUFDQSxPQUFBLDRDQUEyQixDQUFFO01BQzdCLElBQUEsQ0FBYSxPQUFiO0FBQUEsY0FBQTs7SUFIRjtXQUlBO0VBUGE7O0VBU2YsdUJBQUEsR0FBMEIsU0FBQyxPQUFELEVB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bUNBQUEsaUNBMURlO0lBMkRmLCtCQUFBLDZCQTNEZTtJQTREZiwrQkFBQSw2QkE1RGU7SUE2RGYsWUFBQSxVQTdEZTtJQThEZix5QkFBQSx1QkE5RGU7SUErRGYsc0JBQUEsb0JBL0RlO0lBZ0VmLHNDQUFBLG9DQWhFZTtJQWlFZix1QkFBQSxxQkFqRWU7SUFrRWYsaUNBQUEsK0JBbEVlO0lBbUVmLFlBQUEsVUFuRWU7SUFvRWYscUJBQUEsbUJBcEVlO0lBcUVmLGFBQUEsV0FyRWU7SUFzRWYsd0JBQUEsc0JBdEVlO0lBd0VmLFNBQUEsT0F4RWU7SUF3RU4sWUFBQSxVQXhFTTtJQXlFZixtQkFBQSxpQkF6RWU7SUF5RUksc0JBQUEsb0JBekVKO0lBMkVmLDRCQUFBLDBCQTNFZTtJQTRFZixtQ0FBQSxpQ0E1RWU7SUE2RWYsMEJBQUEsd0JBN0VlO0lBOEVmLDZCQUFBLDJCQTlFZTtJQStFZixvQkFBQSxrQkEvRWU7SUFpRmYsaUJBQUEsZUFqRmU7SUFrRmYsY0FBQSxZQWxGZTtJQW1GZixpQkFBQSxlQW5GZTtJQW9GZixpQkFBQSxlQXBGZTtJQXFGZix3QkFBQSxzQkFyRmU7SUFzRmYsb0JBQUEsa0JBdEZlO0lBdUZmLHFCQUFBLG1CQXZGZTtJQXdGZiwwQkFBQSx3QkF4RmU7SUF5RmYsdUJBQUEscUJBekZlOztBQTd4QmpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG57RGlzcG9zYWJsZSwgUmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5hc3NlcnQgPSAoY29uZGl0aW9uLCBtZXNzYWdlLCBmbikgLT5cbiAgdW5sZXNzIGZuP1xuICAgIGZuID0gKGVycm9yKSAtPlxuICAgICAgY29uc29sZS5lcnJvciBlcnJvci5tZXNzYWdlXG4gIGF0b20uYXNzZXJ0KGNvbmRpdGlvbiwgbWVzc2FnZSwgZm4pXG5cbmFzc2VydFdpdGhFeGNlcHRpb24gPSAoY29uZGl0aW9uLCBtZXNzYWdlLCBmbikgLT5cbiAgYXRvbS5hc3NlcnQgY29uZGl0aW9uLCBtZXNzYWdlLCAoZXJyb3IpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpXG5cbmdldEFuY2VzdG9ycyA9IChvYmopIC0+XG4gIGFuY2VzdG9ycyA9IFtdXG4gIGN1cnJlbnQgPSBvYmpcbiAgbG9vcFxuICAgIGFuY2VzdG9ycy5wdXNoKGN1cnJlbnQpXG4gICAgY3VycmVudCA9IGN1cnJlbnQuX19zdXBlcl9fPy5jb25zdHJ1Y3RvclxuICAgIGJyZWFrIHVubGVzcyBjdXJyZW50XG4gIGFuY2VzdG9yc1xuXG5nZXRLZXlCaW5kaW5nRm9yQ29tbWFuZCA9IChjb21tYW5kLCB7cGFja2FnZU5hbWV9KSAtPlxuICByZXN1bHRzID0gbnVsbFxuICBrZXltYXBzID0gYXRvbS5rZXltYXBzLmdldEtleUJpbmRpbmdzKClcbiAgaWYgcGFja2FnZU5hbWU/XG4gICAga2V5bWFwUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShwYWNrYWdlTmFtZSkuZ2V0S2V5bWFwUGF0aHMoKS5wb3AoKVxuICAgIGtleW1hcHMgPSBrZXltYXBzLmZpbHRlcigoe3NvdXJjZX0pIC0+IHNvdXJjZSBpcyBrZXltYXBQYXRoKVxuXG4gIGZvciBrZXltYXAgaW4ga2V5bWFwcyB3aGVuIGtleW1hcC5jb21tYW5kIGlzIGNvbW1hbmRcbiAgICB7a2V5c3Ryb2tlcywgc2VsZWN0b3J9ID0ga2V5bWFwXG4gICAga2V5c3Ryb2tlcyA9IGtleXN0cm9rZXMucmVwbGFjZSgvc2hpZnQtLywgJycpXG4gICAgKHJlc3VsdHMgPz0gW10pLnB1c2goe2tleXN0cm9rZXMsIHNlbGVjdG9yfSlcbiAgcmVzdWx0c1xuXG4jIEluY2x1ZGUgbW9kdWxlKG9iamVjdCB3aGljaCBub3JtYWx5IHByb3ZpZGVzIHNldCBvZiBtZXRob2RzKSB0byBrbGFzc1xuaW5jbHVkZSA9IChrbGFzcywgbW9kdWxlKSAtPlxuICBmb3Iga2V5LCB2YWx1ZSBvZiBtb2R1bGVcbiAgICBrbGFzczo6W2tleV0gPSB2YWx1ZVxuXG5kZWJ1ZyA9IChtZXNzYWdlcy4uLikgLT5cbiAgcmV0dXJuIHVubGVzcyBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgc3dpdGNoIHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXQnKVxuICAgIHdoZW4gJ2NvbnNvbGUnXG4gICAgICBjb25zb2xlLmxvZyBtZXNzYWdlcy4uLlxuICAgIHdoZW4gJ2ZpbGUnXG4gICAgICBmaWxlUGF0aCA9IGZzLm5vcm1hbGl6ZSBzZXR0aW5ncy5nZXQoJ2RlYnVnT3V0cHV0RmlsZVBhdGgnKVxuICAgICAgaWYgZnMuZXhpc3RzU3luYyhmaWxlUGF0aClcbiAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMgZmlsZVBhdGgsIG1lc3NhZ2VzICsgXCJcXG5cIlxuXG4jIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlIGVkaXRvcidzIHNjcm9sbFRvcCBhbmQgZm9sZCBzdGF0ZS5cbnNhdmVFZGl0b3JTdGF0ZSA9IChlZGl0b3IpIC0+XG4gIGVkaXRvckVsZW1lbnQgPSBlZGl0b3IuZWxlbWVudFxuICBzY3JvbGxUb3AgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG5cbiAgZm9sZFN0YXJ0Um93cyA9IGVkaXRvci5kaXNwbGF5TGF5ZXIuZm9sZHNNYXJrZXJMYXllci5maW5kTWFya2Vycyh7fSkubWFwIChtKSAtPiBtLmdldFN0YXJ0UG9zaXRpb24oKS5yb3dcbiAgLT5cbiAgICBmb3Igcm93IGluIGZvbGRTdGFydFJvd3MucmV2ZXJzZSgpIHdoZW4gbm90IGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdylcbiAgICAgIGVkaXRvci5mb2xkQnVmZmVyUm93KHJvdylcbiAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChzY3JvbGxUb3ApXG5cbmlzTGluZXdpc2VSYW5nZSA9ICh7c3RhcnQsIGVuZH0pIC0+XG4gIChzdGFydC5yb3cgaXNudCBlbmQucm93KSBhbmQgKHN0YXJ0LmNvbHVtbiBpcyBlbmQuY29sdW1uIGlzIDApXG5cbmlzRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICB7c3RhcnQsIGVuZH0gPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnQucm93IGlzbnQgZW5kLnJvd1xuXG5oYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5zb21lKGlzTm90RW1wdHkpXG5cbnNvcnRSYW5nZXMgPSAoY29sbGVjdGlvbikgLT5cbiAgY29sbGVjdGlvbi5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYilcblxuIyBSZXR1cm4gYWRqdXN0ZWQgaW5kZXggZml0IHdoaXRpbiBnaXZlbiBsaXN0J3MgbGVuZ3RoXG4jIHJldHVybiAtMSBpZiBsaXN0IGlzIGVtcHR5LlxuZ2V0SW5kZXggPSAoaW5kZXgsIGxpc3QpIC0+XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoXG4gIGlmIGxlbmd0aCBpcyAwXG4gICAgLTFcbiAgZWxzZVxuICAgIGluZGV4ID0gaW5kZXggJSBsZW5ndGhcbiAgICBpZiBpbmRleCA+PSAwXG4gICAgICBpbmRleFxuICAgIGVsc2VcbiAgICAgIGxlbmd0aCArIGluZGV4XG5cbiMgTk9URTogZW5kUm93IGJlY29tZSB1bmRlZmluZWQgaWYgQGVkaXRvckVsZW1lbnQgaXMgbm90IHlldCBhdHRhY2hlZC5cbiMgZS5nLiBCZWdpbmcgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIG9wZW4gZmlsZS5cbmdldFZpc2libGVCdWZmZXJSYW5nZSA9IChlZGl0b3IpIC0+XG4gIFtzdGFydFJvdywgZW5kUm93XSA9IGVkaXRvci5lbGVtZW50LmdldFZpc2libGVSb3dSYW5nZSgpXG4gIHJldHVybiBudWxsIHVubGVzcyAoc3RhcnRSb3c/IGFuZCBlbmRSb3c/KVxuICBzdGFydFJvdyA9IGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc3RhcnRSb3cpXG4gIGVuZFJvdyA9IGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coZW5kUm93KVxuICBuZXcgUmFuZ2UoW3N0YXJ0Um93LCAwXSwgW2VuZFJvdywgSW5maW5pdHldKVxuXG5nZXRWaXNpYmxlRWRpdG9ycyA9IC0+XG4gIChlZGl0b3IgZm9yIHBhbmUgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKSB3aGVuIGVkaXRvciA9IHBhbmUuZ2V0QWN0aXZlRWRpdG9yKCkpXG5cbmdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdykuZW5kXG5cbiMgUG9pbnQgdXRpbFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5wb2ludElzQXRFbmRPZkxpbmUgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBwb2ludC5yb3cpLmlzRXF1YWwocG9pbnQpXG5cbnBvaW50SXNPbldoaXRlU3BhY2UgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgY2hhciA9IGdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludClcbiAgbm90IC9cXFMvLnRlc3QoY2hhcilcblxucG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gIHBvaW50LmNvbHVtbiBpc250IDAgYW5kIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIHBvaW50KVxuXG5wb2ludElzQXRWaW1FbmRPZkZpbGUgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5pc0VxdWFsKHBvaW50KVxuXG5pc0VtcHR5Um93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KS5pc0VtcHR5KClcblxuIyBDdXJzb3Igc3RhdGUgdmFsaWRhdGVpb25cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY3Vyc29ySXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3cgPSAoY3Vyc29yKSAtPlxuICBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93KGN1cnNvci5lZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG5jdXJzb3JJc0F0VmltRW5kT2ZGaWxlID0gKGN1cnNvcikgLT5cbiAgcG9pbnRJc0F0VmltRW5kT2ZGaWxlKGN1cnNvci5lZGl0b3IsIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIGFtb3VudCkpXG5cbmdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBhbW91bnQ9MSkgLT5cbiAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgLWFtb3VudCkpXG5cbmdldFRleHRJblNjcmVlblJhbmdlID0gKGVkaXRvciwgc2NyZWVuUmFuZ2UpIC0+XG4gIGJ1ZmZlclJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShidWZmZXJSYW5nZSlcblxuZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IgPSAoY3Vyc29yKSAtPlxuICAjIEF0b20gMS4xMS4wLWJldGE1IGhhdmUgdGhpcyBleHBlcmltZW50YWwgbWV0aG9kLlxuICBpZiBjdXJzb3IuZ2V0Tm9uV29yZENoYXJhY3RlcnM/XG4gICAgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzKClcbiAgZWxzZVxuICAgIHNjb3BlID0gY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KClcbiAgICBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5ub25Xb3JkQ2hhcmFjdGVycycsIHtzY29wZX0pXG5cbiMgRklYTUU6IHJlbW92ZSB0aGlzXG4jIHJldHVybiB0cnVlIGlmIG1vdmVkXG5tb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZSA9IChjdXJzb3IpIC0+XG4gIG9yaWdpbmFsUG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBlZGl0b3IgPSBjdXJzb3IuZWRpdG9yXG4gIHZpbUVvZiA9IGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcilcblxuICB3aGlsZSBwb2ludElzT25XaGl0ZVNwYWNlKGVkaXRvciwgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkgYW5kIG5vdCBwb2ludC5pc0dyZWF0ZXJUaGFuT3JFcXVhbCh2aW1Fb2YpXG4gICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gIG5vdCBvcmlnaW5hbFBvaW50LmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbmdldEJ1ZmZlclJvd3MgPSAoZWRpdG9yLCB7c3RhcnRSb3csIGRpcmVjdGlvbn0pIC0+XG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdwcmV2aW91cydcbiAgICAgIGlmIHN0YXJ0Um93IDw9IDBcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyAtIDEpLi4wXVxuICAgIHdoZW4gJ25leHQnXG4gICAgICBlbmRSb3cgPSBnZXRWaW1MYXN0QnVmZmVyUm93KGVkaXRvcilcbiAgICAgIGlmIHN0YXJ0Um93ID49IGVuZFJvd1xuICAgICAgICBbXVxuICAgICAgZWxzZVxuICAgICAgICBbKHN0YXJ0Um93ICsgMSkuLmVuZFJvd11cblxuIyBSZXR1cm4gVmltJ3MgRU9GIHBvc2l0aW9uIHJhdGhlciB0aGFuIEF0b20ncyBFT0YgcG9zaXRpb24uXG4jIFRoaXMgZnVuY3Rpb24gY2hhbmdlIG1lYW5pbmcgb2YgRU9GIGZyb20gbmF0aXZlIFRleHRFZGl0b3I6OmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiMgQXRvbSBpcyBzcGVjaWFsKHN0cmFuZ2UpIGZvciBjdXJzb3IgY2FuIHBhc3QgdmVyeSBsYXN0IG5ld2xpbmUgY2hhcmFjdGVyLlxuIyBCZWNhdXNlIG9mIHRoaXMsIEF0b20ncyBFT0YgcG9zaXRpb24gaXMgW2FjdHVhbExhc3RSb3crMSwgMF0gcHJvdmlkZWQgbGFzdC1ub24tYmxhbmstcm93XG4jIGVuZHMgd2l0aCBuZXdsaW5lIGNoYXIuXG4jIEJ1dCBpbiBWaW0sIGN1cm9yIGNhbiBOT1QgcGFzdCBsYXN0IG5ld2xpbmUuIEVPRiBpcyBuZXh0IHBvc2l0aW9uIG9mIHZlcnkgbGFzdCBjaGFyYWN0ZXIuXG5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVvZiA9IGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4gIGlmIChlb2Yucm93IGlzIDApIG9yIChlb2YuY29sdW1uID4gMClcbiAgICBlb2ZcbiAgZWxzZVxuICAgIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIGVvZi5yb3cgLSAxKVxuXG5nZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikpXG5cbmdldFZpbUxhc3RCdWZmZXJSb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0VmltTGFzdFNjcmVlblJvdyA9IChlZGl0b3IpIC0+IGdldFZpbUVvZlNjcmVlblBvc2l0aW9uKGVkaXRvcikucm93XG5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBlZGl0b3IuZWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBlZGl0b3IuZWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHJhbmdlID0gZmluZFJhbmdlSW5CdWZmZXJSb3coZWRpdG9yLCAvXFxTLywgcm93KVxuICByYW5nZT8uc3RhcnQgPyBuZXcgUG9pbnQocm93LCAwKVxuXG50cmltUmFuZ2UgPSAoZWRpdG9yLCBzY2FuUmFuZ2UpIC0+XG4gIHBhdHRlcm4gPSAvXFxTL1xuICBbc3RhcnQsIGVuZF0gPSBbXVxuICBzZXRTdGFydCA9ICh7cmFuZ2V9KSAtPiB7c3RhcnR9ID0gcmFuZ2VcbiAgc2V0RW5kID0gKHtyYW5nZX0pIC0+IHtlbmR9ID0gcmFuZ2VcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHBhdHRlcm4sIHNjYW5SYW5nZSwgc2V0U3RhcnQpXG4gIGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldEVuZCkgaWYgc3RhcnQ/XG4gIGlmIHN0YXJ0PyBhbmQgZW5kP1xuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICBlbHNlXG4gICAgc2NhblJhbmdlXG5cbiMgQ3Vyc29yIG1vdGlvbiB3cmFwcGVyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgSnVzdCB1cGRhdGUgYnVmZmVyUm93IHdpdGgga2VlcGluZyBjb2x1bW4gYnkgcmVzcGVjdGluZyBnb2FsQ29sdW1uXG5zZXRCdWZmZXJSb3cgPSAoY3Vyc29yLCByb3csIG9wdGlvbnMpIC0+XG4gIGNvbHVtbiA9IGN1cnNvci5nb2FsQ29sdW1uID8gY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpXG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBjb2x1bW5dLCBvcHRpb25zKVxuICBjdXJzb3IuZ29hbENvbHVtbiA9IGNvbHVtblxuXG5zZXRCdWZmZXJDb2x1bW4gPSAoY3Vyc29yLCBjb2x1bW4pIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbY3Vyc29yLmdldEJ1ZmZlclJvdygpLCBjb2x1bW5dKVxuXG5tb3ZlQ3Vyc29yID0gKGN1cnNvciwge3ByZXNlcnZlR29hbENvbHVtbn0sIGZuKSAtPlxuICB7Z29hbENvbHVtbn0gPSBjdXJzb3JcbiAgZm4oY3Vyc29yKVxuICBpZiBwcmVzZXJ2ZUdvYWxDb2x1bW4gYW5kIGdvYWxDb2x1bW4/XG4gICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uXG5cbiMgV29ya2Fyb3VuZCBpc3N1ZSBmb3IgdDltZC92aW0tbW9kZS1wbHVzIzIyNiBhbmQgYXRvbS9hdG9tIzMxNzRcbiMgSSBjYW5ub3QgZGVwZW5kIGN1cnNvcidzIGNvbHVtbiBzaW5jZSBpdHMgY2xhaW0gMCBhbmQgY2xpcHBpbmcgZW1tdWxhdGlvbiBkb24ndFxuIyByZXR1cm4gd3JhcHBlZCBsaW5lLCBidXQgSXQgYWN0dWFsbHkgd3JhcCwgc28gSSBuZWVkIHRvIGRvIHZlcnkgZGlydHkgd29yayB0b1xuIyBwcmVkaWN0IHdyYXAgaHVyaXN0aWNhbGx5Llxuc2hvdWxkUHJldmVudFdyYXBMaW5lID0gKGN1cnNvcikgLT5cbiAge3JvdywgY29sdW1ufSA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIGlmIGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRUYWJzJylcbiAgICB0YWJMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnKVxuICAgIGlmIDAgPCBjb2x1bW4gPCB0YWJMZW5ndGhcbiAgICAgIHRleHQgPSBjdXJzb3IuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbcm93LCAwXSwgW3JvdywgdGFiTGVuZ3RoXV0pXG4gICAgICAvXlxccyskLy50ZXN0KHRleHQpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuIyBvcHRpb25zOlxuIyAgIGFsbG93V3JhcDogdG8gY29udHJvbGwgYWxsb3cgd3JhcFxuIyAgIHByZXNlcnZlR29hbENvbHVtbjogcHJlc2VydmUgb3JpZ2luYWwgZ29hbENvbHVtblxubW92ZUN1cnNvckxlZnQgPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB7YWxsb3dXcmFwLCBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZX0gPSBvcHRpb25zXG4gIGRlbGV0ZSBvcHRpb25zLmFsbG93V3JhcFxuICBpZiBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZVxuICAgIHJldHVybiBpZiBzaG91bGRQcmV2ZW50V3JhcExpbmUoY3Vyc29yKVxuXG4gIGlmIG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpIG9yIGFsbG93V3JhcFxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlTGVmdCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclJpZ2h0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcH0gPSBvcHRpb25zXG4gIGRlbGV0ZSBvcHRpb25zLmFsbG93V3JhcFxuICBpZiBub3QgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yVXBTY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgY3Vyc29yLmdldFNjcmVlblJvdygpIGlzIDBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVVwKClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yRG93blNjcmVlbiA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHVubGVzcyBnZXRWaW1MYXN0U2NyZWVuUm93KGN1cnNvci5lZGl0b3IpIGlzIGN1cnNvci5nZXRTY3JlZW5Sb3coKVxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlRG93bigpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxuIyBGSVhNRVxubW92ZUN1cnNvckRvd25CdWZmZXIgPSAoY3Vyc29yKSAtPlxuICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIHVubGVzcyBnZXRWaW1MYXN0QnVmZmVyUm93KGN1cnNvci5lZGl0b3IpIGlzIHBvaW50LnJvd1xuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG5cbiMgRklYTUVcbm1vdmVDdXJzb3JVcEJ1ZmZlciA9IChjdXJzb3IpIC0+XG4gIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgdW5sZXNzIHBvaW50LnJvdyBpcyAwXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSlcblxubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyA9IChjdXJzb3IsIHJvdykgLT5cbiAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5nZXRWYWxpZFZpbUJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT4gbGltaXROdW1iZXIocm93LCBtaW46IDAsIG1heDogZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpKVxuXG5nZXRWYWxpZFZpbVNjcmVlblJvdyA9IChlZGl0b3IsIHJvdykgLT4gbGltaXROdW1iZXIocm93LCBtaW46IDAsIG1heDogZ2V0VmltTGFzdFNjcmVlblJvdyhlZGl0b3IpKVxuXG4jIEJ5IGRlZmF1bHQgbm90IGluY2x1ZGUgY29sdW1uXG5nZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCB7cm93LCBjb2x1bW59LCB7ZXhjbHVzaXZlfT17fSkgLT5cbiAgaWYgZXhjbHVzaXZlID8gdHJ1ZVxuICAgIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpWzAuLi5jb2x1bW5dXG4gIGVsc2VcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi5jb2x1bW5dXG5cbmdldEluZGVudExldmVsRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuaW5kZW50TGV2ZWxGb3JMaW5lKGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpKVxuXG5nZXRDb2RlRm9sZFJvd1JhbmdlcyA9IChlZGl0b3IpIC0+XG4gIFswLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIC5tYXAgKHJvdykgLT5cbiAgICAgIGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb2RlRm9sZEF0QnVmZmVyUm93KHJvdylcbiAgICAuZmlsdGVyIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlPyBhbmQgcm93UmFuZ2VbMF0/IGFuZCByb3dSYW5nZVsxXT9cblxuZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3cgPSAoZWRpdG9yLCBidWZmZXJSb3csIHtpbmNsdWRlU3RhcnRSb3d9PXt9KSAtPlxuICBpbmNsdWRlU3RhcnRSb3cgPz0gdHJ1ZVxuICBnZXRDb2RlRm9sZFJvd1JhbmdlcyhlZGl0b3IpLmZpbHRlciAoW3N0YXJ0Um93LCBlbmRSb3ddKSAtPlxuICAgIGlmIGluY2x1ZGVTdGFydFJvd1xuICAgICAgc3RhcnRSb3cgPD0gYnVmZmVyUm93IDw9IGVuZFJvd1xuICAgIGVsc2VcbiAgICAgIHN0YXJ0Um93IDwgYnVmZmVyUm93IDw9IGVuZFJvd1xuXG5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlID0gKGVkaXRvciwgcm93UmFuZ2UpIC0+XG4gIFtzdGFydFJhbmdlLCBlbmRSYW5nZV0gPSByb3dSYW5nZS5tYXAgKHJvdykgLT5cbiAgICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnRSYW5nZS51bmlvbihlbmRSYW5nZSlcblxuZ2V0VG9rZW5pemVkTGluZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KHJvdylcblxuZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSA9IChsaW5lKSAtPlxuICBmb3IgdGFnIGluIGxpbmUudGFncyB3aGVuIHRhZyA8IDAgYW5kICh0YWcgJSAyIGlzIC0xKVxuICAgIGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG5cbnNjYW5Gb3JTY29wZVN0YXJ0ID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIGZuKSAtPlxuICBmcm9tUG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KGZyb21Qb2ludClcbiAgc2NhblJvd3MgPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLjBdXG5cbiAgY29udGludWVTY2FuID0gdHJ1ZVxuICBzdG9wID0gLT5cbiAgICBjb250aW51ZVNjYW4gPSBmYWxzZVxuXG4gIGlzVmFsaWRUb2tlbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNMZXNzVGhhbihmcm9tUG9pbnQpXG5cbiAgZm9yIHJvdyBpbiBzY2FuUm93cyB3aGVuIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGNvbHVtbiA9IDBcbiAgICByZXN1bHRzID0gW11cblxuICAgIHRva2VuSXRlcmF0b3IgPSB0b2tlbml6ZWRMaW5lLmdldFRva2VuSXRlcmF0b3IoKVxuICAgIGZvciB0YWcgaW4gdG9rZW5pemVkTGluZS50YWdzXG4gICAgICB0b2tlbkl0ZXJhdG9yLm5leHQoKVxuICAgICAgaWYgdGFnIDwgMCAjIE5lZ2F0aXZlOiBzdGFydC9zdG9wIHRva2VuXG4gICAgICAgIHNjb3BlID0gYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcbiAgICAgICAgaWYgKHRhZyAlIDIpIGlzIDAgIyBFdmVuOiBzY29wZSBzdG9wXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlICMgT2RkOiBzY29wZSBzdGFydFxuICAgICAgICAgIHBvc2l0aW9uID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgICAgIHJlc3VsdHMucHVzaCB7c2NvcGUsIHBvc2l0aW9uLCBzdG9wfVxuICAgICAgZWxzZVxuICAgICAgICBjb2x1bW4gKz0gdGFnXG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoaXNWYWxpZFRva2VuKVxuICAgIHJlc3VsdHMucmV2ZXJzZSgpIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICBmbihyZXN1bHQpXG4gICAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG5cbmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIHNjb3BlKSAtPlxuICBwb2ludCA9IG51bGxcbiAgc2NhbkZvclNjb3BlU3RhcnQgZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgKGluZm8pIC0+XG4gICAgaWYgaW5mby5zY29wZS5zZWFyY2goc2NvcGUpID49IDBcbiAgICAgIGluZm8uc3RvcCgpXG4gICAgICBwb2ludCA9IGluZm8ucG9zaXRpb25cbiAgcG9pbnRcblxuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgIyBbRklYTUVdIEJ1ZyBvZiB1cHN0cmVhbT9cbiAgIyBTb21ldGltZSB0b2tlbml6ZWRMaW5lcyBsZW5ndGggaXMgbGVzcyB0aGFuIGxhc3QgYnVmZmVyIHJvdy5cbiAgIyBTbyB0b2tlbml6ZWRMaW5lIGlzIG5vdCBhY2Nlc3NpYmxlIGV2ZW4gaWYgdmFsaWQgcm93LlxuICAjIEluIHRoYXQgY2FzZSBJIHNpbXBseSByZXR1cm4gZW1wdHkgQXJyYXkuXG4gIGlmIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGdldFNjb3Blc0ZvclRva2VuaXplZExpbmUodG9rZW5pemVkTGluZSkuc29tZSAoc2NvcGUpIC0+XG4gICAgICBpc0Z1bmN0aW9uU2NvcGUoZWRpdG9yLCBzY29wZSlcbiAgZWxzZVxuICAgIGZhbHNlXG5cbiMgW0ZJWE1FXSB2ZXJ5IHJvdWdoIHN0YXRlLCBuZWVkIGltcHJvdmVtZW50LlxuaXNGdW5jdGlvblNjb3BlID0gKGVkaXRvciwgc2NvcGUpIC0+XG4gIHN3aXRjaCBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZVxuICAgIHdoZW4gJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ1xuICAgICAgc2NvcGVzID0gWydlbnRpdHkubmFtZS5mdW5jdGlvbiddXG4gICAgd2hlbiAnc291cmNlLnJ1YnknXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJywgJ21ldGEubW9kdWxlLiddXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLiddXG4gIHBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeJyArIHNjb3Blcy5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKSlcbiAgcGF0dGVybi50ZXN0KHNjb3BlKVxuXG4jIFNjcm9sbCB0byBidWZmZXJQb3NpdGlvbiB3aXRoIG1pbmltdW0gYW1vdW50IHRvIGtlZXAgb3JpZ2luYWwgdmlzaWJsZSBhcmVhLlxuIyBJZiB0YXJnZXQgcG9zaXRpb24gd29uJ3QgZml0IHdpdGhpbiBvbmVQYWdlVXAgb3Igb25lUGFnZURvd24sIGl0IGNlbnRlciB0YXJnZXQgcG9pbnQuXG5zbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIGVkaXRvckFyZWFIZWlnaHQgPSBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgLSAxKVxuICBvbmVQYWdlVXAgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpIC0gZWRpdG9yQXJlYUhlaWdodCAjIE5vIG5lZWQgdG8gbGltaXQgdG8gbWluPTBcbiAgb25lUGFnZURvd24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEJvdHRvbSgpICsgZWRpdG9yQXJlYUhlaWdodFxuICB0YXJnZXQgPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCkudG9wXG5cbiAgY2VudGVyID0gKG9uZVBhZ2VEb3duIDwgdGFyZ2V0KSBvciAodGFyZ2V0IDwgb25lUGFnZVVwKVxuICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb2ludCwge2NlbnRlcn0pXG5cbm1hdGNoU2NvcGVzID0gKGVkaXRvckVsZW1lbnQsIHNjb3BlcykgLT5cbiAgY2xhc3NlcyA9IHNjb3Blcy5tYXAgKHNjb3BlKSAtPiBzY29wZS5zcGxpdCgnLicpXG5cbiAgZm9yIGNsYXNzTmFtZXMgaW4gY2xhc3Nlc1xuICAgIGNvbnRhaW5zQ291bnQgPSAwXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBjbGFzc05hbWVzXG4gICAgICBjb250YWluc0NvdW50ICs9IDEgaWYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKVxuICAgIHJldHVybiB0cnVlIGlmIGNvbnRhaW5zQ291bnQgaXMgY2xhc3NOYW1lcy5sZW5ndGhcbiAgZmFsc2VcblxuaXNTaW5nbGVMaW5lVGV4dCA9ICh0ZXh0KSAtPlxuICB0ZXh0LnNwbGl0KC9cXG58XFxyXFxuLykubGVuZ3RoIGlzIDFcblxuIyBSZXR1cm4gYnVmZmVyUmFuZ2UgYW5kIGtpbmQgWyd3aGl0ZS1zcGFjZScsICdub24td29yZCcsICd3b3JkJ11cbiNcbiMgVGhpcyBmdW5jdGlvbiBtb2RpZnkgd29yZFJlZ2V4IHNvIHRoYXQgaXQgZmVlbCBOQVRVUkFMIGluIFZpbSdzIG5vcm1hbCBtb2RlLlxuIyBJbiBub3JtYWwtbW9kZSwgY3Vyc29yIGlzIHJhY3RhbmdsZShub3QgcGlwZSh8KSBjaGFyKS5cbiMgQ3Vyc29yIGlzIGxpa2UgT04gd29yZCByYXRoZXIgdGhhbiBCRVRXRUVOIHdvcmQuXG4jIFRoZSBtb2RpZmljYXRpb24gaXMgdGFpbG9yZCBsaWtlIHRoaXNcbiMgICAtIE9OIHdoaXRlLXNwYWNlOiBJbmNsdWRzIG9ubHkgd2hpdGUtc3BhY2VzLlxuIyAgIC0gT04gbm9uLXdvcmQ6IEluY2x1ZHMgb25seSBub24gd29yZCBjaGFyKD1leGNsdWRlcyBub3JtYWwgd29yZCBjaGFyKS5cbiNcbiMgVmFsaWQgb3B0aW9uc1xuIyAgLSB3b3JkUmVnZXg6IGluc3RhbmNlIG9mIFJlZ0V4cFxuIyAgLSBub25Xb3JkQ2hhcmFjdGVyczogc3RyaW5nXG5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICB7c2luZ2xlTm9uV29yZENoYXIsIHdvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnMsIGN1cnNvcn0gPSBvcHRpb25zXG4gIGlmIG5vdCB3b3JkUmVnZXg/IG9yIG5vdCBub25Xb3JkQ2hhcmFjdGVycz8gIyBDb21wbGVtZW50IGZyb20gY3Vyc29yXG4gICAgY3Vyc29yID89IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc30gPSBfLmV4dGVuZChvcHRpb25zLCBidWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IoY3Vyc29yLCBvcHRpb25zKSlcbiAgc2luZ2xlTm9uV29yZENoYXIgPz0gdHJ1ZVxuXG4gIGNoYXJhY3RlckF0UG9pbnQgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vbldvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcblxuICBpZiAvXFxzLy50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAgc291cmNlID0gXCJbXFx0IF0rXCJcbiAgICBraW5kID0gJ3doaXRlLXNwYWNlJ1xuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICBlbHNlIGlmIG5vbldvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpIGFuZCBub3Qgd29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBraW5kID0gJ25vbi13b3JkJ1xuICAgIGlmIHNpbmdsZU5vbldvcmRDaGFyXG4gICAgICBzb3VyY2UgPSBfLmVzY2FwZVJlZ0V4cChjaGFyYWN0ZXJBdFBvaW50KVxuICAgICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gICAgZWxzZVxuICAgICAgd29yZFJlZ2V4ID0gbm9uV29yZFJlZ2V4XG4gIGVsc2VcbiAgICBraW5kID0gJ3dvcmQnXG5cbiAgcmFuZ2UgPSBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9KVxuICB7a2luZCwgcmFuZ2V9XG5cbmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBib3VuZGFyaXplRm9yV29yZCA9IG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmQgPyB0cnVlXG4gIGRlbGV0ZSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkXG4gIHtyYW5nZSwga2luZH0gPSBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAodGV4dClcblxuICBpZiBraW5kIGlzICd3b3JkJyBhbmQgYm91bmRhcml6ZUZvcldvcmRcbiAgICAjIFNldCB3b3JkLWJvdW5kYXJ5KCBcXGIgKSBhbmNob3Igb25seSB3aGVuIGl0J3MgZWZmZWN0aXZlICM2ODlcbiAgICBzdGFydEJvdW5kYXJ5ID0gaWYgL15cXHcvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIGVuZEJvdW5kYXJ5ID0gaWYgL1xcdyQvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIHBhdHRlcm4gPSBzdGFydEJvdW5kYXJ5ICsgcGF0dGVybiArIGVuZEJvdW5kYXJ5XG4gIG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKVxuXG5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAgb3B0aW9ucyA9IHt3b3JkUmVnZXg6IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc3Vid29yZFJlZ0V4cCgpLCBib3VuZGFyaXplRm9yV29yZDogZmFsc2V9XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4jIFJldHVybiBvcHRpb25zIHVzZWQgZm9yIGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb25cbmJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvciA9IChjdXJzb3IsIHt3b3JkUmVnZXh9KSAtPlxuICBub25Xb3JkQ2hhcmFjdGVycyA9IGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgd29yZFJlZ2V4ID89IG5ldyBSZWdFeHAoXCJeW1xcdCBdKiR8W15cXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIpXG4gIHt3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzfVxuXG5nZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW1twb2ludC5yb3csIDBdLCBwb2ludF1cblxuICBmb3VuZCA9IG51bGxcbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHdvcmRSZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcblxuICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH09e30pIC0+XG4gIHNjYW5SYW5nZSA9IFtwb2ludCwgW3BvaW50LnJvdywgSW5maW5pdHldXVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvc2l0aW9uLCBvcHRpb25zPXt9KSAtPlxuICBlbmRQb3NpdGlvbiA9IGdldEVuZE9mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnMpXG4gIHN0YXJ0UG9zaXRpb24gPSBnZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGVuZFBvc2l0aW9uLCBvcHRpb25zKVxuICBuZXcgUmFuZ2Uoc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24pXG5cbmFkanVzdFJhbmdlVG9Sb3dSYW5nZSA9ICh7c3RhcnQsIGVuZH0sIG9wdGlvbnM9e30pIC0+XG4gICMgd2hlbiBsaW5ld2lzZSwgZW5kIHJvdyBpcyBhdCBjb2x1bW4gMCBvZiBORVhUIGxpbmVcbiAgIyBTbyBuZWVkIGFkanVzdCB0byBhY3R1YWxseSBzZWxlY3RlZCByb3cgaW4gc2FtZSB3YXkgYXMgU2VsZWNpdG9uOjpnZXRCdWZmZXJSb3dSYW5nZSgpXG4gIGVuZFJvdyA9IGVuZC5yb3dcbiAgaWYgZW5kLmNvbHVtbiBpcyAwXG4gICAgZW5kUm93ID0gbGltaXROdW1iZXIoZW5kLnJvdyAtIDEsIG1pbjogc3RhcnQucm93KVxuICBpZiBvcHRpb25zLmVuZE9ubHkgPyBmYWxzZVxuICAgIG5ldyBSYW5nZShzdGFydCwgW2VuZFJvdywgSW5maW5pdHldKVxuICBlbHNlXG4gICAgbmV3IFJhbmdlKFtzdGFydC5yb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV0pXG5cbiMgV2hlbiByYW5nZSBpcyBsaW5ld2lzZSByYW5nZSwgcmFuZ2UgZW5kIGhhdmUgY29sdW1uIDAgb2YgTkVYVCByb3cuXG4jIFdoaWNoIGlzIHZlcnkgdW5pbnR1aXRpdmUgYW5kIHVud2FudGVkIHJlc3VsdC5cbnNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lID0gKHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBlbmQuY29sdW1uIGlzIDBcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihlbmQucm93IC0gMSwgbWluOiBzdGFydC5yb3cpXG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBbZW5kUm93LCBJbmZpbml0eV0pXG4gIGVsc2VcbiAgICByYW5nZVxuXG5zY2FuRWRpdG9yID0gKGVkaXRvciwgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgZWRpdG9yLnNjYW4gcGF0dGVybiwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5jb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdywgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgc2NhblJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHBhdHRlcm4sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5maW5kUmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHBhdHRlcm4sIHJvdywge2RpcmVjdGlvbn09e30pIC0+XG4gIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgc2NhbkZ1bmN0aW9uTmFtZSA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgZWxzZVxuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgcmFuZ2UgPSBudWxsXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25OYW1lXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT4gcmFuZ2UgPSBldmVudC5yYW5nZVxuICByYW5nZVxuXG5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIG1hcmtlcnMgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c1Jvdzogcm93KVxuXG4gIHN0YXJ0UG9pbnQgPSBudWxsXG4gIGVuZFBvaW50ID0gbnVsbFxuXG4gIGZvciBtYXJrZXIgaW4gbWFya2VycyA/IFtdXG4gICAge3N0YXJ0LCBlbmR9ID0gbWFya2VyLmdldFJhbmdlKClcbiAgICB1bmxlc3Mgc3RhcnRQb2ludFxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuICAgICAgY29udGludWVcblxuICAgIGlmIHN0YXJ0LmlzTGVzc1RoYW4oc3RhcnRQb2ludClcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcblxuICBpZiBzdGFydFBvaW50PyBhbmQgZW5kUG9pbnQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0UG9pbnQsIGVuZFBvaW50KVxuXG50cmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCBwb2ludCwgZGlyZWN0aW9uLCB7dHJhbnNsYXRlfT17fSkgLT5cbiAgdHJhbnNsYXRlID89IHRydWVcbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuXG4gIGRvbnRDbGlwID0gZmFsc2VcbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKSBpZiB0cmFuc2xhdGVcbiAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwb2ludC5yb3cpLmVuZFxuXG4gICAgICBpZiBwb2ludC5pc0VxdWFsKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG5cbiAgICAgIGlmIHBvaW50LmlzR3JlYXRlclRoYW4oZW9sKVxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludC5yb3cgKyAxLCAwKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcblxuICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKSBpZiB0cmFuc2xhdGVcblxuICAgICAgaWYgcG9pbnQuY29sdW1uIDwgMFxuICAgICAgICBuZXdSb3cgPSBwb2ludC5yb3cgLSAxXG4gICAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhuZXdSb3cpLmVuZFxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChuZXdSb3csIGVvbC5jb2x1bW4pXG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWF4KHBvaW50LCBQb2ludC5aRVJPKVxuXG4gIGlmIGRvbnRDbGlwXG4gICAgcG9pbnRcbiAgZWxzZVxuICAgIHNjcmVlblBvaW50ID0gZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQsIGNsaXBEaXJlY3Rpb246IGRpcmVjdGlvbilcbiAgICBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb2ludClcblxuZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHJhbmdlLCB3aGljaCwgZGlyZWN0aW9uLCBvcHRpb25zKSAtPlxuICBuZXdQb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHJhbmdlW3doaWNoXSwgZGlyZWN0aW9uLCBvcHRpb25zKVxuICBzd2l0Y2ggd2hpY2hcbiAgICB3aGVuICdzdGFydCdcbiAgICAgIG5ldyBSYW5nZShuZXdQb2ludCwgcmFuZ2UuZW5kKVxuICAgIHdoZW4gJ2VuZCdcbiAgICAgIG5ldyBSYW5nZShyYW5nZS5zdGFydCwgbmV3UG9pbnQpXG5cbiMgUmVsb2FkYWJsZSByZWdpc3RlckVsZW1lbnRcbnJlZ2lzdGVyRWxlbWVudCA9IChuYW1lLCBvcHRpb25zKSAtPlxuICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAjIGlmIGNvbnN0cnVjdG9yIGlzIEhUTUxFbGVtZW50LCB3ZSBoYXZlbid0IHJlZ2lzdGVyZCB5ZXRcbiAgaWYgZWxlbWVudC5jb25zdHJ1Y3RvciBpcyBIVE1MRWxlbWVudFxuICAgIEVsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQobmFtZSwgb3B0aW9ucylcbiAgZWxzZVxuICAgIEVsZW1lbnQgPSBlbGVtZW50LmNvbnN0cnVjdG9yXG4gICAgRWxlbWVudC5wcm90b3R5cGUgPSBvcHRpb25zLnByb3RvdHlwZSBpZiBvcHRpb25zLnByb3RvdHlwZT9cbiAgRWxlbWVudFxuXG5nZXRQYWNrYWdlID0gKG5hbWUsIGZuKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShuYW1lKVxuICAgICAgcGtnID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKG5hbWUpXG4gICAgICByZXNvbHZlKHBrZylcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSAtPlxuICAgICAgICBpZiBwa2cubmFtZSBpcyBuYW1lXG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgICByZXNvbHZlKHBrZylcblxuc2VhcmNoQnlQcm9qZWN0RmluZCA9IChlZGl0b3IsIHRleHQpIC0+XG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdwcm9qZWN0LWZpbmQ6c2hvdycpXG4gIGdldFBhY2thZ2UoJ2ZpbmQtYW5kLXJlcGxhY2UnKS50aGVuIChwa2cpIC0+XG4gICAge3Byb2plY3RGaW5kVmlld30gPSBwa2cubWFpbk1vZHVsZVxuICAgIGlmIHByb2plY3RGaW5kVmlldz9cbiAgICAgIHByb2plY3RGaW5kVmlldy5maW5kRWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIHByb2plY3RGaW5kVmlldy5jb25maXJtKClcblxubGltaXROdW1iZXIgPSAobnVtYmVyLCB7bWF4LCBtaW59PXt9KSAtPlxuICBudW1iZXIgPSBNYXRoLm1pbihudW1iZXIsIG1heCkgaWYgbWF4P1xuICBudW1iZXIgPSBNYXRoLm1heChudW1iZXIsIG1pbikgaWYgbWluP1xuICBudW1iZXJcblxuZmluZFJhbmdlQ29udGFpbnNQb2ludCA9IChyYW5nZXMsIHBvaW50KSAtPlxuICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICByZXR1cm4gcmFuZ2VcbiAgbnVsbFxuXG5uZWdhdGVGdW5jdGlvbiA9IChmbikgLT5cbiAgKGFyZ3MuLi4pIC0+XG4gICAgbm90IGZuKGFyZ3MuLi4pXG5cbmlzRW1wdHkgPSAodGFyZ2V0KSAtPiB0YXJnZXQuaXNFbXB0eSgpXG5pc05vdEVtcHR5ID0gbmVnYXRlRnVuY3Rpb24oaXNFbXB0eSlcblxuaXNTaW5nbGVMaW5lUmFuZ2UgPSAocmFuZ2UpIC0+IHJhbmdlLmlzU2luZ2xlTGluZSgpXG5pc05vdFNpbmdsZUxpbmVSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzU2luZ2xlTGluZVJhbmdlKVxuXG5pc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT4gL15bXFx0IF0qJC8udGVzdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKVxuaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gbmVnYXRlRnVuY3Rpb24oaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKVxuXG5pc0VzY2FwZWRDaGFyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgcmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlKVxuICBjaGFycyA9IGdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHJhbmdlLnN0YXJ0LCAyKVxuICBjaGFycy5lbmRzV2l0aCgnXFxcXCcpIGFuZCBub3QgY2hhcnMuZW5kc1dpdGgoJ1xcXFxcXFxcJylcblxuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgdGV4dCkgLT5cbiAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCB0ZXh0KVxuXG5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHVubGVzcyBpc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICBlb2wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBlb2wsIFwiXFxuXCIpXG5cbmZvckVhY2hQYW5lQXhpcyA9IChmbiwgYmFzZSkgLT5cbiAgYmFzZSA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0Q29udGFpbmVyKCkuZ2V0Um9vdCgpXG4gIGlmIGJhc2UuY2hpbGRyZW4/XG4gICAgZm4oYmFzZSlcblxuICAgIGZvciBjaGlsZCBpbiBiYXNlLmNoaWxkcmVuXG4gICAgICBmb3JFYWNoUGFuZUF4aXMoZm4sIGNoaWxkKVxuXG5tb2RpZnlDbGFzc0xpc3QgPSAoYWN0aW9uLCBlbGVtZW50LCBjbGFzc05hbWVzLi4uKSAtPlxuICBlbGVtZW50LmNsYXNzTGlzdFthY3Rpb25dKGNsYXNzTmFtZXMuLi4pXG5cbmFkZENsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdhZGQnKVxucmVtb3ZlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3JlbW92ZScpXG50b2dnbGVDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAndG9nZ2xlJylcblxudG9nZ2xlQ2FzZUZvckNoYXJhY3RlciA9IChjaGFyKSAtPlxuICBjaGFyTG93ZXIgPSBjaGFyLnRvTG93ZXJDYXNlKClcbiAgaWYgY2hhckxvd2VyIGlzIGNoYXJcbiAgICBjaGFyLnRvVXBwZXJDYXNlKClcbiAgZWxzZVxuICAgIGNoYXJMb3dlclxuXG5zcGxpdFRleHRCeU5ld0xpbmUgPSAodGV4dCkgLT5cbiAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIHRleHQudHJpbVJpZ2h0KCkuc3BsaXQoL1xccj9cXG4vZylcbiAgZWxzZVxuICAgIHRleHQuc3BsaXQoL1xccj9cXG4vZylcblxuIyBNb2RpZnkgcmFuZ2UgdXNlZCBmb3IgdW5kby9yZWRvIGZsYXNoIGhpZ2hsaWdodCB0byBtYWtlIGl0IGZlZWwgbmF0dXJhbGx5IGZvciBodW1hbi5cbiMgIC0gVHJpbSBzdGFydGluZyBuZXcgbGluZShcIlxcblwiKVxuIyAgICAgXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jICAtIElmIHJhbmdlLmVuZCBpcyBFT0wgZXh0ZW5kIHJhbmdlIHRvIGZpcnN0IGNvbHVtbiBvZiBuZXh0IGxpbmUuXG4jICAgICBcImFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgZS5nLlxuIyAtIHdoZW4gJ2MnIGlzIGF0RU9MOiBcIlxcbmFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgLSB3aGVuICdjJyBpcyBOT1QgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcIlxuI1xuIyBTbyBhbHdheXMgdHJpbSBpbml0aWFsIFwiXFxuXCIgcGFydCByYW5nZSBiZWNhdXNlIGZsYXNoaW5nIHRyYWlsaW5nIGxpbmUgaXMgY291bnRlcmludHVpdGl2ZS5cbmh1bWFuaXplQnVmZmVyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgaWYgaXNTaW5nbGVMaW5lUmFuZ2UocmFuZ2UpIG9yIGlzTGluZXdpc2VSYW5nZShyYW5nZSlcbiAgICByZXR1cm4gcmFuZ2VcblxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBzdGFydClcbiAgICBuZXdTdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBlbmQpXG4gICAgbmV3RW5kID0gZW5kLnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBuZXdTdGFydD8gb3IgbmV3RW5kP1xuICAgIG5ldyBSYW5nZShuZXdTdGFydCA/IHN0YXJ0LCBuZXdFbmQgPyBlbmQpXG4gIGVsc2VcbiAgICByYW5nZVxuXG4jIEV4cGFuZCByYW5nZSB0byB3aGl0ZSBzcGFjZVxuIyAgMS4gRXhwYW5kIHRvIGZvcndhcmQgZGlyZWN0aW9uLCBpZiBzdWNlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDIuIEV4cGFuZCB0byBiYWNrd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2NlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDMuIFdoZW4gZmFpbGQgdG8gZXhwYW5kIGVpdGhlciBkaXJlY3Rpb24sIHJldHVybiBvcmlnaW5hbCByYW5nZS5cbmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuXG4gIG5ld0VuZCA9IG51bGxcbiAgc2NhblJhbmdlID0gW2VuZCwgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgZW5kLnJvdyldXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSAvXFxTLywgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT4gbmV3RW5kID0gcmFuZ2Uuc3RhcnRcblxuICBpZiBuZXdFbmQ/LmlzR3JlYXRlclRoYW4oZW5kKVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIG5ld0VuZClcblxuICBuZXdTdGFydCA9IG51bGxcbiAgc2NhblJhbmdlID0gW1tzdGFydC5yb3csIDBdLCByYW5nZS5zdGFydF1cbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdTdGFydCA9IHJhbmdlLmVuZFxuXG4gIGlmIG5ld1N0YXJ0Py5pc0xlc3NUaGFuKHN0YXJ0KVxuICAgIHJldHVybiBuZXcgUmFuZ2UobmV3U3RhcnQsIGVuZClcblxuICByZXR1cm4gcmFuZ2UgIyBmYWxsYmFja1xuXG5zY2FuRWRpdG9ySW5EaXJlY3Rpb24gPSAoZWRpdG9yLCBkaXJlY3Rpb24sIHBhdHRlcm4sIG9wdGlvbnM9e30sIGZuKSAtPlxuICB7YWxsb3dOZXh0TGluZSwgZnJvbSwgc2NhblJhbmdlfSA9IG9wdGlvbnNcbiAgaWYgbm90IGZyb20/IGFuZCBub3Qgc2NhblJhbmdlP1xuICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGVpdGhlciBvZiAnZnJvbScgb3IgJ3NjYW5SYW5nZScgb3B0aW9uc1wiKVxuXG4gIGlmIHNjYW5SYW5nZVxuICAgIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGVsc2VcbiAgICBhbGxvd05leHRMaW5lID89IHRydWVcbiAgZnJvbSA9IFBvaW50LmZyb21PYmplY3QoZnJvbSkgaWYgZnJvbT9cbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKGZyb20sIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikpXG4gICAgICBzY2FuRnVuY3Rpb24gPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKFswLCAwXSwgZnJvbSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcblxuICBlZGl0b3Jbc2NhbkZ1bmN0aW9uXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT5cbiAgICBpZiBub3QgYWxsb3dOZXh0TGluZSBhbmQgZXZlbnQucmFuZ2Uuc3RhcnQucm93IGlzbnQgZnJvbS5yb3dcbiAgICAgIGV2ZW50LnN0b3AoKVxuICAgICAgcmV0dXJuXG4gICAgZm4oZXZlbnQpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxuICBnZXRBbmNlc3RvcnNcbiAgZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmRcbiAgaW5jbHVkZVxuICBkZWJ1Z1xuICBzYXZlRWRpdG9yU3RhdGVcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb25cbiAgc29ydFJhbmdlc1xuICBnZXRJbmRleFxuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgZ2V0VmlzaWJsZUVkaXRvcnNcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lXG4gIHBvaW50SXNPbldoaXRlU3BhY2VcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBwb2ludElzQXRWaW1FbmRPZkZpbGVcbiAgY3Vyc29ySXNBdFZpbUVuZE9mRmlsZVxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvblxuICBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvblxuICBnZXRWaW1MYXN0QnVmZmVyUm93XG4gIGdldFZpbUxhc3RTY3JlZW5Sb3dcbiAgc2V0QnVmZmVyUm93XG4gIHNldEJ1ZmZlckNvbHVtblxuICBtb3ZlQ3Vyc29yTGVmdFxuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgbW92ZUN1cnNvclVwU2NyZWVuXG4gIG1vdmVDdXJzb3JEb3duU2NyZWVuXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgZ2V0VGV4dEluU2NyZWVuUmFuZ2VcbiAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2VcbiAgaXNFbXB0eVJvd1xuICBjdXJzb3JJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIHRyaW1SYW5nZVxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93XG4gIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3dcbiAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGVcbiAgZ2V0QnVmZmVyUm93c1xuICByZWdpc3RlckVsZW1lbnRcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIG1hdGNoU2NvcGVzXG4gIG1vdmVDdXJzb3JEb3duQnVmZmVyXG4gIG1vdmVDdXJzb3JVcEJ1ZmZlclxuICBpc1NpbmdsZUxpbmVUZXh0XG4gIGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvclxuICBzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZVxuICBzY2FuRWRpdG9yXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG4gIGZpbmRSYW5nZUluQnVmZmVyUm93XG4gIGdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvd1xuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRQYWNrYWdlXG4gIHNlYXJjaEJ5UHJvamVjdEZpbmRcbiAgbGltaXROdW1iZXJcbiAgZmluZFJhbmdlQ29udGFpbnNQb2ludFxuXG4gIGlzRW1wdHksIGlzTm90RW1wdHlcbiAgaXNTaW5nbGVMaW5lUmFuZ2UsIGlzTm90U2luZ2xlTGluZVJhbmdlXG5cbiAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb25cbiAgZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93XG4gIGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZVxuICBpc05vdExlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaXNFc2NhcGVkQ2hhclJhbmdlXG5cbiAgZm9yRWFjaFBhbmVBeGlzXG4gIGFkZENsYXNzTGlzdFxuICByZW1vdmVDbGFzc0xpc3RcbiAgdG9nZ2xlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXJcbiAgc3BsaXRUZXh0QnlOZXdMaW5lXG4gIGh1bWFuaXplQnVmZmVyUmFuZ2VcbiAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzXG4gIHNjYW5FZGl0b3JJbkRpcmVjdGlvblxufVxuIl19
