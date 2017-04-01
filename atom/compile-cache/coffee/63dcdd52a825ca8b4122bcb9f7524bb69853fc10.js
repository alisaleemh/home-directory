(function() {
  var $, $$, AutocompleteView, CompositeDisposable, Range, SelectListView, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, $$ = _ref1.$$, SelectListView = _ref1.SelectListView;

  module.exports = AutocompleteView = (function(_super) {
    __extends(AutocompleteView, _super);

    function AutocompleteView() {
      return AutocompleteView.__super__.constructor.apply(this, arguments);
    }

    AutocompleteView.prototype.currentBuffer = null;

    AutocompleteView.prototype.checkpoint = null;

    AutocompleteView.prototype.wordList = null;

    AutocompleteView.prototype.wordRegex = /\w+/g;

    AutocompleteView.prototype.originalSelectionBufferRanges = null;

    AutocompleteView.prototype.originalCursorPosition = null;

    AutocompleteView.prototype.aboveCursor = false;

    AutocompleteView.prototype.initialize = function(editor) {
      this.editor = editor;
      AutocompleteView.__super__.initialize.apply(this, arguments);
      this.addClass('autocomplete popover-list');
      this.handleEvents();
      return this.setCurrentBuffer(this.editor.getBuffer());
    };

    AutocompleteView.prototype.getFilterKey = function() {
      return 'word';
    };

    AutocompleteView.prototype.viewForItem = function(_arg) {
      var word;
      word = _arg.word;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            return _this.span(word);
          };
        })(this));
      });
    };

    AutocompleteView.prototype.handleEvents = function() {
      this.list.on('mousewheel', function(event) {
        return event.stopPropagation();
      });
      this.editor.onDidChangePath((function(_this) {
        return function() {
          return _this.setCurrentBuffer(_this.editor.getBuffer());
        };
      })(this));
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.subscriptions.dispose();
        };
      })(this)));
      return this.filterEditorView.getModel().onWillInsertText((function(_this) {
        return function(_arg) {
          var cancel, text;
          cancel = _arg.cancel, text = _arg.text;
          if (!text.match(_this.wordRegex)) {
            _this.confirmSelection();
            _this.editor.insertText(text);
            return cancel();
          }
        };
      })(this));
    };

    AutocompleteView.prototype.setCurrentBuffer = function(currentBuffer) {
      this.currentBuffer = currentBuffer;
    };

    AutocompleteView.prototype.selectItemView = function(item) {
      var match;
      AutocompleteView.__super__.selectItemView.apply(this, arguments);
      if (match = this.getSelectedItem()) {
        return this.replaceSelectedTextWithMatch(match);
      }
    };

    AutocompleteView.prototype.selectNextItemView = function() {
      AutocompleteView.__super__.selectNextItemView.apply(this, arguments);
      return false;
    };

    AutocompleteView.prototype.selectPreviousItemView = function() {
      AutocompleteView.__super__.selectPreviousItemView.apply(this, arguments);
      return false;
    };

    AutocompleteView.prototype.getCompletionsForCursorScope = function() {
      var completions, scope;
      scope = this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition());
      completions = atom.config.getAll('editor.completions', {
        scope: scope
      });
      return _.uniq(_.flatten(_.pluck(completions, 'value')));
    };

    AutocompleteView.prototype.buildWordList = function() {
      var buffer, buffers, matches, word, wordHash, _i, _j, _k, _len, _len1, _len2, _ref2, _ref3;
      wordHash = {};
      if (atom.config.get('autocomplete.includeCompletionsFromAllBuffers')) {
        buffers = atom.project.getBuffers();
      } else {
        buffers = [this.currentBuffer];
      }
      matches = [];
      for (_i = 0, _len = buffers.length; _i < _len; _i++) {
        buffer = buffers[_i];
        matches.push(buffer.getText().match(this.wordRegex));
      }
      _ref2 = _.flatten(matches);
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        word = _ref2[_j];
        if (word) {
          if (wordHash[word] == null) {
            wordHash[word] = true;
          }
        }
      }
      _ref3 = this.getCompletionsForCursorScope();
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        word = _ref3[_k];
        if (word) {
          if (wordHash[word] == null) {
            wordHash[word] = true;
          }
        }
      }
      return this.wordList = Object.keys(wordHash).sort(function(word1, word2) {
        return word1.toLowerCase().localeCompare(word2.toLowerCase());
      });
    };

    AutocompleteView.prototype.confirmed = function(match) {
      this.editor.getSelections().forEach(function(selection) {
        return selection.clear();
      });
      this.cancel();
      if (!match) {
        return;
      }
      this.replaceSelectedTextWithMatch(match);
      return this.editor.getCursors().forEach(function(cursor) {
        var position;
        position = cursor.getBufferPosition();
        return cursor.setBufferPosition([position.row, position.column + match.suffix.length]);
      });
    };

    AutocompleteView.prototype.cancelled = function() {
      var _ref2;
      if ((_ref2 = this.overlayDecoration) != null) {
        _ref2.destroy();
      }
      if (!this.editor.isDestroyed()) {
        this.editor.revertToCheckpoint(this.checkpoint);
        this.editor.setSelectedBufferRanges(this.originalSelectionBufferRanges);
        return atom.workspace.getActivePane().activate();
      }
    };

    AutocompleteView.prototype.attach = function() {
      var cursorMarker, matches;
      this.checkpoint = this.editor.createCheckpoint();
      this.aboveCursor = false;
      this.originalSelectionBufferRanges = this.editor.getSelections().map(function(selection) {
        return selection.getBufferRange();
      });
      this.originalCursorPosition = this.editor.getCursorScreenPosition();
      if (!this.allPrefixAndSuffixOfSelectionsMatch()) {
        return this.cancel();
      }
      this.buildWordList();
      matches = this.findMatchesForCurrentSelection();
      this.setItems(matches);
      if (matches.length === 1) {
        return this.confirmSelection();
      } else {
        cursorMarker = this.editor.getLastCursor().getMarker();
        return this.overlayDecoration = this.editor.decorateMarker(cursorMarker, {
          type: 'overlay',
          position: 'tail',
          item: this
        });
      }
    };

    AutocompleteView.prototype.destroy = function() {
      var _ref2;
      return (_ref2 = this.overlayDecoration) != null ? _ref2.destroy() : void 0;
    };

    AutocompleteView.prototype.toggle = function() {
      if (this.isVisible()) {
        return this.cancel();
      } else {
        return this.attach();
      }
    };

    AutocompleteView.prototype.findMatchesForCurrentSelection = function() {
      var currentWord, prefix, regex, selection, suffix, word, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _results, _results1;
      selection = this.editor.getLastSelection();
      _ref2 = this.prefixAndSuffixOfSelection(selection), prefix = _ref2.prefix, suffix = _ref2.suffix;
      if ((prefix.length + suffix.length) > 0) {
        regex = new RegExp("^" + prefix + ".+" + suffix + "$", "i");
        currentWord = prefix + this.editor.getSelectedText() + suffix;
        _ref3 = this.wordList;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          word = _ref3[_i];
          if (regex.test(word) && word !== currentWord) {
            _results.push({
              prefix: prefix,
              suffix: suffix,
              word: word
            });
          }
        }
        return _results;
      } else {
        _ref4 = this.wordList;
        _results1 = [];
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          word = _ref4[_j];
          _results1.push({
            word: word,
            prefix: prefix,
            suffix: suffix
          });
        }
        return _results1;
      }
    };

    AutocompleteView.prototype.replaceSelectedTextWithMatch = function(match) {
      var newSelectedBufferRanges;
      newSelectedBufferRanges = [];
      return this.editor.transact((function(_this) {
        return function() {
          var selections;
          selections = _this.editor.getSelections();
          selections.forEach(function(selection, i) {
            var buffer, cursorPosition, infixLength, startPosition;
            startPosition = selection.getBufferRange().start;
            buffer = _this.editor.getBuffer();
            selection.deleteSelectedText();
            cursorPosition = _this.editor.getCursors()[i].getBufferPosition();
            buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, match.suffix.length));
            buffer["delete"](Range.fromPointWithDelta(cursorPosition, 0, -match.prefix.length));
            infixLength = match.word.length - match.prefix.length - match.suffix.length;
            return newSelectedBufferRanges.push([startPosition, [startPosition.row, startPosition.column + infixLength]]);
          });
          _this.editor.insertText(match.word);
          return _this.editor.setSelectedBufferRanges(newSelectedBufferRanges);
        };
      })(this));
    };

    AutocompleteView.prototype.prefixAndSuffixOfSelection = function(selection) {
      var lineRange, prefix, selectionRange, suffix, _ref2;
      selectionRange = selection.getBufferRange();
      lineRange = [[selectionRange.start.row, 0], [selectionRange.end.row, this.editor.lineTextForBufferRow(selectionRange.end.row).length]];
      _ref2 = ["", ""], prefix = _ref2[0], suffix = _ref2[1];
      this.currentBuffer.scanInRange(this.wordRegex, lineRange, function(_arg) {
        var match, prefixOffset, range, stop, suffixOffset;
        match = _arg.match, range = _arg.range, stop = _arg.stop;
        if (range.start.isGreaterThan(selectionRange.end)) {
          stop();
        }
        if (range.intersectsWith(selectionRange)) {
          prefixOffset = selectionRange.start.column - range.start.column;
          suffixOffset = selectionRange.end.column - range.end.column;
          if (range.start.isLessThan(selectionRange.start)) {
            prefix = match[0].slice(0, prefixOffset);
          }
          if (range.end.isGreaterThan(selectionRange.end)) {
            return suffix = match[0].slice(suffixOffset);
          }
        }
      });
      return {
        prefix: prefix,
        suffix: suffix
      };
    };

    AutocompleteView.prototype.allPrefixAndSuffixOfSelectionsMatch = function() {
      var prefix, suffix, _ref2;
      _ref2 = {}, prefix = _ref2.prefix, suffix = _ref2.suffix;
      return this.editor.getSelections().every((function(_this) {
        return function(selection) {
          var previousPrefix, previousSuffix, _ref3, _ref4;
          _ref3 = [prefix, suffix], previousPrefix = _ref3[0], previousSuffix = _ref3[1];
          _ref4 = _this.prefixAndSuffixOfSelection(selection), prefix = _ref4.prefix, suffix = _ref4.suffix;
          if (!((previousPrefix != null) && (previousSuffix != null))) {
            return true;
          }
          return prefix === previousPrefix && suffix === previousSuffix;
        };
      })(this));
    };

    AutocompleteView.prototype.attached = function() {
      var widestCompletion;
      this.focusFilterEditor();
      widestCompletion = parseInt(this.css('min-width')) || 0;
      this.list.find('span').each(function() {
        return widestCompletion = Math.max(widestCompletion, $(this).outerWidth());
      });
      this.list.width(widestCompletion);
      return this.width(this.list.outerWidth());
    };

    AutocompleteView.prototype.detached = function() {};

    AutocompleteView.prototype.populateList = function() {
      return AutocompleteView.__super__.populateList.apply(this, arguments);
    };

    return AutocompleteView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUvbGliL2F1dG9jb21wbGV0ZS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtRkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFnQyxPQUFBLENBQVEsTUFBUixDQUFoQyxFQUFDLGFBQUEsS0FBRCxFQUFRLDJCQUFBLG1CQURSLENBQUE7O0FBQUEsRUFFQSxRQUEyQixPQUFBLENBQVEsc0JBQVIsQ0FBM0IsRUFBQyxVQUFBLENBQUQsRUFBSSxXQUFBLEVBQUosRUFBUSx1QkFBQSxjQUZSLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLGFBQUEsR0FBZSxJQUFmLENBQUE7O0FBQUEsK0JBQ0EsVUFBQSxHQUFZLElBRFosQ0FBQTs7QUFBQSwrQkFFQSxRQUFBLEdBQVUsSUFGVixDQUFBOztBQUFBLCtCQUdBLFNBQUEsR0FBVyxNQUhYLENBQUE7O0FBQUEsK0JBSUEsNkJBQUEsR0FBK0IsSUFKL0IsQ0FBQTs7QUFBQSwrQkFLQSxzQkFBQSxHQUF3QixJQUx4QixDQUFBOztBQUFBLCtCQU1BLFdBQUEsR0FBYSxLQU5iLENBQUE7O0FBQUEsK0JBUUEsVUFBQSxHQUFZLFNBQUUsTUFBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsU0FBQSxNQUNaLENBQUE7QUFBQSxNQUFBLGtEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLDJCQUFWLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUZBLENBQUE7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

//# sourceURL=/home/alisaleemh/.atom/packages/autocomplete/lib/autocomplete-view.coffee
