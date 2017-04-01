(function() {
  var BracketFinder, PairFinder, QuoteFinder, Range, ScopeState, TagFinder, _, collectRangeInBufferRow, getCharacterRangeInformation, getLineTextToBufferPosition, isEscapedCharRange, ref, scanEditorInDirection,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Range = require('atom').Range;

  _ = require('underscore-plus');

  ref = require('./utils'), isEscapedCharRange = ref.isEscapedCharRange, collectRangeInBufferRow = ref.collectRangeInBufferRow, scanEditorInDirection = ref.scanEditorInDirection, getLineTextToBufferPosition = ref.getLineTextToBufferPosition;

  getCharacterRangeInformation = function(editor, point, char) {
    var balanced, left, pattern, ref1, right, total;
    pattern = RegExp("" + (_.escapeRegExp(char)), "g");
    total = collectRangeInBufferRow(editor, point.row, pattern).filter(function(range) {
      return !isEscapedCharRange(editor, range);
    });
    ref1 = _.partition(total, function(arg) {
      var start;
      start = arg.start;
      return start.isLessThan(point);
    }), left = ref1[0], right = ref1[1];
    balanced = (total.length % 2) === 0;
    return {
      total: total,
      left: left,
      right: right,
      balanced: balanced
    };
  };

  ScopeState = (function() {
    function ScopeState(editor1, point) {
      this.editor = editor1;
      this.state = this.getScopeStateForBufferPosition(point);
    }

    ScopeState.prototype.getScopeStateForBufferPosition = function(point) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition(point).getScopesArray();
      return {
        inString: scopes.some(function(scope) {
          return scope.startsWith('string.');
        }),
        inComment: scopes.some(function(scope) {
          return scope.startsWith('comment.');
        }),
        inDoubleQuotes: this.isInDoubleQuotes(point)
      };
    };

    ScopeState.prototype.isInDoubleQuotes = function(point) {
      var balanced, left, ref1, total;
      ref1 = getCharacterRangeInformation(this.editor, point, '"'), total = ref1.total, left = ref1.left, balanced = ref1.balanced;
      if (total.length === 0 || !balanced) {
        return false;
      } else {
        return left.length % 2 === 1;
      }
    };

    ScopeState.prototype.isEqual = function(other) {
      return _.isEqual(this.state, other.state);
    };

    ScopeState.prototype.isInNormalCodeArea = function() {
      return !(this.state.inString || this.state.inComment || this.state.inDoubleQuotes);
    };

    return ScopeState;

  })();

  PairFinder = (function() {
    function PairFinder(editor1, options) {
      this.editor = editor1;
      if (options == null) {
        options = {};
      }
      this.allowNextLine = options.allowNextLine, this.allowForwarding = options.allowForwarding, this.pair = options.pair;
      if (this.pair != null) {
        this.setPatternForPair(this.pair);
      }
    }

    PairFinder.prototype.getPattern = function() {
      return this.pattern;
    };

    PairFinder.prototype.filterEvent = function() {
      return true;
    };

    PairFinder.prototype.findPair = function(which, direction, from) {
      var findingNonForwardingClosingQuote, found, scanner, stack;
      stack = [];
      found = null;
      findingNonForwardingClosingQuote = (this instanceof QuoteFinder) && which === 'close' && !this.allowForwarding;
      scanner = scanEditorInDirection.bind(null, this.editor, direction, this.getPattern(), {
        from: from,
        allowNextLine: this.allowNextLine
      });
      scanner((function(_this) {
        return function(event) {
          var eventState, range, stop;
          range = event.range, stop = event.stop;
          if (isEscapedCharRange(_this.editor, range)) {
            return;
          }
          if (!_this.filterEvent(event)) {
            return;
          }
          eventState = _this.getEventState(event);
          if (findingNonForwardingClosingQuote && eventState.state === 'open' && range.start.isGreaterThan(from)) {
            stop();
            return;
          }
          if (eventState.state !== which) {
            return stack.push(eventState);
          } else {
            if (_this.onFound(stack, {
              eventState: eventState,
              from: from
            })) {
              found = range;
              return stop();
            }
          }
        };
      })(this));
      return found;
    };

    PairFinder.prototype.spliceStack = function(stack, eventState) {
      return stack.pop();
    };

    PairFinder.prototype.onFound = function(stack, arg) {
      var eventState, from, openRange, openState;
      eventState = arg.eventState, from = arg.from;
      switch (eventState.state) {
        case 'open':
          this.spliceStack(stack, eventState);
          return stack.length === 0;
        case 'close':
          openState = this.spliceStack(stack, eventState);
          if (openState == null) {
            return true;
          }
          if (stack.length === 0) {
            openRange = openState.range;
            return openRange.start.isEqual(from) || (this.allowForwarding && openRange.start.row === from.row);
          }
      }
    };

    PairFinder.prototype.findCloseForward = function(from) {
      return this.findPair('close', 'forward', from);
    };

    PairFinder.prototype.findOpenBackward = function(from) {
      return this.findPair('open', 'backward', from);
    };

    PairFinder.prototype.find = function(from) {
      var closeRange, openRange;
      closeRange = this.closeRange = this.findCloseForward(from);
      if (closeRange != null) {
        openRange = this.findOpenBackward(closeRange.end);
      }
      if ((closeRange != null) && (openRange != null)) {
        return {
          aRange: new Range(openRange.start, closeRange.end),
          innerRange: new Range(openRange.end, closeRange.start),
          openRange: openRange,
          closeRange: closeRange
        };
      }
    };

    return PairFinder;

  })();

  BracketFinder = (function(superClass) {
    extend(BracketFinder, superClass);

    function BracketFinder() {
      return BracketFinder.__super__.constructor.apply(this, arguments);
    }

    BracketFinder.prototype.retry = false;

    BracketFinder.prototype.setPatternForPair = function(pair) {
      var close, open;
      open = pair[0], close = pair[1];
      return this.pattern = RegExp("(" + (_.escapeRegExp(open)) + ")|(" + (_.escapeRegExp(close)) + ")", "g");
    };

    BracketFinder.prototype.find = function(from) {
      var found, ref1;
      if (this.initialScope == null) {
        this.initialScope = new ScopeState(this.editor, from);
      }
      if (found = BracketFinder.__super__.find.apply(this, arguments)) {
        return found;
      }
      if (!this.retry) {
        this.retry = true;
        ref1 = [], this.closeRange = ref1[0], this.closeRangeScope = ref1[1];
        return this.find(from);
      }
    };

    BracketFinder.prototype.filterEvent = function(arg) {
      var range, scope;
      range = arg.range;
      scope = new ScopeState(this.editor, range.start);
      if (!this.closeRange) {
        if (!this.retry) {
          return this.initialScope.isEqual(scope);
        } else {
          if (this.initialScope.isInNormalCodeArea()) {
            return !scope.isInNormalCodeArea();
          } else {
            return scope.isInNormalCodeArea();
          }
        }
      } else {
        if (this.closeRangeScope == null) {
          this.closeRangeScope = new ScopeState(this.editor, this.closeRange.start);
        }
        return this.closeRangeScope.isEqual(scope);
      }
    };

    BracketFinder.prototype.getEventState = function(arg) {
      var match, range, state;
      match = arg.match, range = arg.range;
      state = (function() {
        switch (false) {
          case !match[1]:
            return 'open';
          case !match[2]:
            return 'close';
        }
      })();
      return {
        state: state,
        range: range
      };
    };

    return BracketFinder;

  })(PairFinder);

  QuoteFinder = (function(superClass) {
    extend(QuoteFinder, superClass);

    function QuoteFinder() {
      return QuoteFinder.__super__.constructor.apply(this, arguments);
    }

    QuoteFinder.prototype.setPatternForPair = function(pair) {
      this.quoteChar = pair[0];
      return this.pattern = RegExp("(" + (_.escapeRegExp(pair[0])) + ")", "g");
    };

    QuoteFinder.prototype.find = function(from) {
      var balanced, left, nextQuoteIsOpen, onQuoteChar, ref1, ref2, right, total;
      ref1 = getCharacterRangeInformation(this.editor, from, this.quoteChar), total = ref1.total, left = ref1.left, right = ref1.right, balanced = ref1.balanced;
      onQuoteChar = (ref2 = right[0]) != null ? ref2.start.isEqual(from) : void 0;
      if (balanced && onQuoteChar) {
        nextQuoteIsOpen = left.length % 2 === 0;
      } else {
        nextQuoteIsOpen = left.length === 0;
      }
      if (nextQuoteIsOpen) {
        this.pairStates = ['open', 'close', 'close', 'open'];
      } else {
        this.pairStates = ['close', 'close', 'open'];
      }
      return QuoteFinder.__super__.find.apply(this, arguments);
    };

    QuoteFinder.prototype.getEventState = function(arg) {
      var range, state;
      range = arg.range;
      state = this.pairStates.shift();
      return {
        state: state,
        range: range
      };
    };

    return QuoteFinder;

  })(PairFinder);

  TagFinder = (function(superClass) {
    extend(TagFinder, superClass);

    function TagFinder() {
      return TagFinder.__super__.constructor.apply(this, arguments);
    }

    TagFinder.prototype.pattern = /<(\/?)([^\s>]+)[^>]*>/g;

    TagFinder.prototype.lineTextToPointContainsNonWhiteSpace = function(point) {
      return /\S/.test(getLineTextToBufferPosition(this.editor, point));
    };

    TagFinder.prototype.find = function(from) {
      var found, tagStart;
      found = TagFinder.__super__.find.apply(this, arguments);
      if ((found != null) && this.allowForwarding) {
        tagStart = found.aRange.start;
        if (tagStart.isGreaterThan(from) && this.lineTextToPointContainsNonWhiteSpace(tagStart)) {
          this.allowForwarding = false;
          return this.find(from);
        }
      }
      return found;
    };

    TagFinder.prototype.getEventState = function(event) {
      var backslash;
      backslash = event.match[1];
      return {
        state: backslash === '' ? 'open' : 'close',
        name: event.match[2],
        range: event.range
      };
    };

    TagFinder.prototype.findPairState = function(stack, arg) {
      var i, name, state;
      name = arg.name;
      for (i = stack.length - 1; i >= 0; i += -1) {
        state = stack[i];
        if (state.name === name) {
          return state;
        }
      }
    };

    TagFinder.prototype.spliceStack = function(stack, eventState) {
      var pairEventState;
      if (pairEventState = this.findPairState(stack, eventState)) {
        stack.splice(stack.indexOf(pairEventState));
      }
      return pairEventState;
    };

    return TagFinder;

  })(PairFinder);

  module.exports = {
    BracketFinder: BracketFinder,
    QuoteFinder: QuoteFinder,
    TagFinder: TagFinder
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9wYWlyLWZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJNQUFBO0lBQUE7OztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSwyQ0FERixFQUVFLHFEQUZGLEVBR0UsaURBSEYsRUFJRTs7RUFHRiw0QkFBQSxHQUErQixTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLElBQWhCO0FBQzdCLFFBQUE7SUFBQSxPQUFBLEdBQVUsTUFBQSxDQUFBLEVBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQUFELENBQUosRUFBNkIsR0FBN0I7SUFDVixLQUFBLEdBQVEsdUJBQUEsQ0FBd0IsTUFBeEIsRUFBZ0MsS0FBSyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLENBQW1ELENBQUMsTUFBcEQsQ0FBMkQsU0FBQyxLQUFEO2FBQ2pFLENBQUksa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsS0FBM0I7SUFENkQsQ0FBM0Q7SUFFUixPQUFnQixDQUFDLENBQUMsU0FBRixDQUFZLEtBQVosRUFBbUIsU0FBQyxHQUFEO0FBQWEsVUFBQTtNQUFYLFFBQUQ7YUFBWSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtJQUFiLENBQW5CLENBQWhCLEVBQUMsY0FBRCxFQUFPO0lBQ1AsUUFBQSxHQUFXLENBQUMsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFoQixDQUFBLEtBQXNCO1dBQ2pDO01BQUMsT0FBQSxLQUFEO01BQVEsTUFBQSxJQUFSO01BQWMsT0FBQSxLQUFkO01BQXFCLFVBQUEsUUFBckI7O0VBTjZCOztFQVF6QjtJQUNTLG9CQUFDLE9BQUQsRUFBVSxLQUFW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RCxFQUFRLFVBQVI7QUFDWCxVQUFBO01BQUEsSUFBRyxjQUFBLEdBQWlCLElBQUMsQ0FBQSxhQUFELENBQWUsS0FBZixFQUFzQixVQUF0QixDQUFwQjtRQUNFLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxjQUFkLENBQWIsRUFERjs7YUFFQTtJQUhXOzs7O0tBN0JTOztFQWtDeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixlQUFBLGFBRGU7SUFFZixhQUFBLFdBRmU7SUFHZixXQUFBLFNBSGU7O0FBMU5qQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntcbiAgaXNFc2NhcGVkQ2hhclJhbmdlXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG4gIHNjYW5FZGl0b3JJbkRpcmVjdGlvblxuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5nZXRDaGFyYWN0ZXJSYW5nZUluZm9ybWF0aW9uID0gKGVkaXRvciwgcG9pbnQsIGNoYXIpIC0+XG4gIHBhdHRlcm4gPSAvLy8je18uZXNjYXBlUmVnRXhwKGNoYXIpfS8vL2dcbiAgdG90YWwgPSBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyhlZGl0b3IsIHBvaW50LnJvdywgcGF0dGVybikuZmlsdGVyIChyYW5nZSkgLT5cbiAgICBub3QgaXNFc2NhcGVkQ2hhclJhbmdlKGVkaXRvciwgcmFuZ2UpXG4gIFtsZWZ0LCByaWdodF0gPSBfLnBhcnRpdGlvbih0b3RhbCwgKHtzdGFydH0pIC0+IHN0YXJ0LmlzTGVzc1RoYW4ocG9pbnQpKVxuICBiYWxhbmNlZCA9ICh0b3RhbC5sZW5ndGggJSAyKSBpcyAwXG4gIHt0b3RhbCwgbGVmdCwgcmlnaHQsIGJhbGFuY2VkfVxuXG5jbGFzcyBTY29wZVN0YXRlXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgcG9pbnQpIC0+XG4gICAgQHN0YXRlID0gQGdldFNjb3BlU3RhdGVGb3JCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBnZXRTY29wZVN0YXRlRm9yQnVmZmVyUG9zaXRpb246IChwb2ludCkgLT5cbiAgICBzY29wZXMgPSBAZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHBvaW50KS5nZXRTY29wZXNBcnJheSgpXG4gICAge1xuICAgICAgaW5TdHJpbmc6IHNjb3Blcy5zb21lIChzY29wZSkgLT4gc2NvcGUuc3RhcnRzV2l0aCgnc3RyaW5nLicpXG4gICAgICBpbkNvbW1lbnQ6IHNjb3Blcy5zb21lIChzY29wZSkgLT4gc2NvcGUuc3RhcnRzV2l0aCgnY29tbWVudC4nKVxuICAgICAgaW5Eb3VibGVRdW90ZXM6IEBpc0luRG91YmxlUXVvdGVzKHBvaW50KVxuICAgIH1cblxuICBpc0luRG91YmxlUXVvdGVzOiAocG9pbnQpIC0+XG4gICAge3RvdGFsLCBsZWZ0LCBiYWxhbmNlZH0gPSBnZXRDaGFyYWN0ZXJSYW5nZUluZm9ybWF0aW9uKEBlZGl0b3IsIHBvaW50LCAnXCInKVxuICAgIGlmIHRvdGFsLmxlbmd0aCBpcyAwIG9yIG5vdCBiYWxhbmNlZFxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBsZWZ0Lmxlbmd0aCAlIDIgaXMgMVxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT5cbiAgICBfLmlzRXF1YWwoQHN0YXRlLCBvdGhlci5zdGF0ZSlcblxuICBpc0luTm9ybWFsQ29kZUFyZWE6IC0+XG4gICAgbm90IChAc3RhdGUuaW5TdHJpbmcgb3IgQHN0YXRlLmluQ29tbWVudCBvciBAc3RhdGUuaW5Eb3VibGVRdW90ZXMpXG5cbmNsYXNzIFBhaXJGaW5kZXJcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBvcHRpb25zPXt9KSAtPlxuICAgIHtAYWxsb3dOZXh0TGluZSwgQGFsbG93Rm9yd2FyZGluZywgQHBhaXJ9ID0gb3B0aW9uc1xuICAgIGlmIEBwYWlyP1xuICAgICAgQHNldFBhdHRlcm5Gb3JQYWlyKEBwYWlyKVxuXG4gIGdldFBhdHRlcm46IC0+XG4gICAgQHBhdHRlcm5cblxuICBmaWx0ZXJFdmVudDogLT5cbiAgICB0cnVlXG5cbiAgZmluZFBhaXI6ICh3aGljaCwgZGlyZWN0aW9uLCBmcm9tKSAtPlxuICAgIHN0YWNrID0gW11cbiAgICBmb3VuZCA9IG51bGxcblxuICAgICMgUXVvdGUgaXMgbm90IG5lc3RhYmxlLiBTbyB3aGVuIHdlIGVuY291bnRlciAnb3Blbicgd2hpbGUgZmluZGluZyAnY2xvc2UnLFxuICAgICMgaXQgaXMgZm9yd2FyZGluZyBwYWlyLCBzbyBzdG9wcGFibGUgaXMgbm90IEBhbGxvd0ZvcndhcmRpbmdcbiAgICBmaW5kaW5nTm9uRm9yd2FyZGluZ0Nsb3NpbmdRdW90ZSA9ICh0aGlzIGluc3RhbmNlb2YgUXVvdGVGaW5kZXIpIGFuZCB3aGljaCBpcyAnY2xvc2UnIGFuZCBub3QgQGFsbG93Rm9yd2FyZGluZ1xuICAgIHNjYW5uZXIgPSBzY2FuRWRpdG9ySW5EaXJlY3Rpb24uYmluZChudWxsLCBAZWRpdG9yLCBkaXJlY3Rpb24sIEBnZXRQYXR0ZXJuKCksIHtmcm9tLCBAYWxsb3dOZXh0TGluZX0pXG4gICAgc2Nhbm5lciAoZXZlbnQpID0+XG4gICAgICB7cmFuZ2UsIHN0b3B9ID0gZXZlbnRcblxuICAgICAgcmV0dXJuIGlmIGlzRXNjYXBlZENoYXJSYW5nZShAZWRpdG9yLCByYW5nZSlcbiAgICAgIHJldHVybiB1bmxlc3MgQGZpbHRlckV2ZW50KGV2ZW50KVxuXG4gICAgICBldmVudFN0YXRlID0gQGdldEV2ZW50U3RhdGUoZXZlbnQpXG5cbiAgICAgIGlmIGZpbmRpbmdOb25Gb3J3YXJkaW5nQ2xvc2luZ1F1b3RlIGFuZCBldmVudFN0YXRlLnN0YXRlIGlzICdvcGVuJyBhbmQgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKVxuICAgICAgICBzdG9wKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIGV2ZW50U3RhdGUuc3RhdGUgaXNudCB3aGljaFxuICAgICAgICBzdGFjay5wdXNoKGV2ZW50U3RhdGUpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIEBvbkZvdW5kKHN0YWNrLCB7ZXZlbnRTdGF0ZSwgZnJvbX0pXG4gICAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICAgIHN0b3AoKVxuXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgc3BsaWNlU3RhY2s6IChzdGFjaywgZXZlbnRTdGF0ZSkgLT5cbiAgICBzdGFjay5wb3AoKVxuXG4gIG9uRm91bmQ6IChzdGFjaywge2V2ZW50U3RhdGUsIGZyb219KSAtPlxuICAgIHN3aXRjaCBldmVudFN0YXRlLnN0YXRlXG4gICAgICB3aGVuICdvcGVuJ1xuICAgICAgICBAc3BsaWNlU3RhY2soc3RhY2ssIGV2ZW50U3RhdGUpXG4gICAgICAgIHN0YWNrLmxlbmd0aCBpcyAwXG4gICAgICB3aGVuICdjbG9zZSdcbiAgICAgICAgb3BlblN0YXRlID0gQHNwbGljZVN0YWNrKHN0YWNrLCBldmVudFN0YXRlKVxuICAgICAgICB1bmxlc3Mgb3BlblN0YXRlP1xuICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgaWYgc3RhY2subGVuZ3RoIGlzIDBcbiAgICAgICAgICBvcGVuUmFuZ2UgPSBvcGVuU3RhdGUucmFuZ2VcbiAgICAgICAgICBvcGVuUmFuZ2Uuc3RhcnQuaXNFcXVhbChmcm9tKSBvciAoQGFsbG93Rm9yd2FyZGluZyBhbmQgb3BlblJhbmdlLnN0YXJ0LnJvdyBpcyBmcm9tLnJvdylcblxuICBmaW5kQ2xvc2VGb3J3YXJkOiAoZnJvbSkgLT5cbiAgICBAZmluZFBhaXIoJ2Nsb3NlJywgJ2ZvcndhcmQnLCBmcm9tKVxuXG4gIGZpbmRPcGVuQmFja3dhcmQ6IChmcm9tKSAtPlxuICAgIEBmaW5kUGFpcignb3BlbicsICdiYWNrd2FyZCcsIGZyb20pXG5cbiAgZmluZDogKGZyb20pIC0+XG4gICAgY2xvc2VSYW5nZSA9IEBjbG9zZVJhbmdlID0gQGZpbmRDbG9zZUZvcndhcmQoZnJvbSlcbiAgICBvcGVuUmFuZ2UgPSBAZmluZE9wZW5CYWNrd2FyZChjbG9zZVJhbmdlLmVuZCkgaWYgY2xvc2VSYW5nZT9cblxuICAgIGlmIGNsb3NlUmFuZ2U/IGFuZCBvcGVuUmFuZ2U/XG4gICAgICB7XG4gICAgICAgIGFSYW5nZTogbmV3IFJhbmdlKG9wZW5SYW5nZS5zdGFydCwgY2xvc2VSYW5nZS5lbmQpXG4gICAgICAgIGlubmVyUmFuZ2U6IG5ldyBSYW5nZShvcGVuUmFuZ2UuZW5kLCBjbG9zZVJhbmdlLnN0YXJ0KVxuICAgICAgICBvcGVuUmFuZ2U6IG9wZW5SYW5nZVxuICAgICAgICBjbG9zZVJhbmdlOiBjbG9zZVJhbmdlXG4gICAgICB9XG5cbmNsYXNzIEJyYWNrZXRGaW5kZXIgZXh0ZW5kcyBQYWlyRmluZGVyXG4gIHJldHJ5OiBmYWxzZVxuXG4gIHNldFBhdHRlcm5Gb3JQYWlyOiAocGFpcikgLT5cbiAgICBbb3BlbiwgY2xvc2VdID0gcGFpclxuICAgIEBwYXR0ZXJuID0gLy8vKCN7Xy5lc2NhcGVSZWdFeHAob3Blbil9KXwoI3tfLmVzY2FwZVJlZ0V4cChjbG9zZSl9KS8vL2dcblxuICAjIFRoaXMgbWV0aG9kIGNhbiBiZSBjYWxsZWQgcmVjdXJzaXZlbHlcbiAgZmluZDogKGZyb20pIC0+XG4gICAgQGluaXRpYWxTY29wZSA/PSBuZXcgU2NvcGVTdGF0ZShAZWRpdG9yLCBmcm9tKVxuXG4gICAgcmV0dXJuIGZvdW5kIGlmIGZvdW5kID0gc3VwZXJcblxuICAgIGlmIG5vdCBAcmV0cnlcbiAgICAgIEByZXRyeSA9IHRydWVcbiAgICAgIFtAY2xvc2VSYW5nZSwgQGNsb3NlUmFuZ2VTY29wZV0gPSBbXVxuICAgICAgQGZpbmQoZnJvbSlcblxuICBmaWx0ZXJFdmVudDogKHtyYW5nZX0pIC0+XG4gICAgc2NvcGUgPSBuZXcgU2NvcGVTdGF0ZShAZWRpdG9yLCByYW5nZS5zdGFydClcbiAgICBpZiBub3QgQGNsb3NlUmFuZ2VcbiAgICAgICMgTm93IGZpbmRpbmcgY2xvc2VSYW5nZVxuICAgICAgaWYgbm90IEByZXRyeVxuICAgICAgICBAaW5pdGlhbFNjb3BlLmlzRXF1YWwoc2NvcGUpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIEBpbml0aWFsU2NvcGUuaXNJbk5vcm1hbENvZGVBcmVhKClcbiAgICAgICAgICBub3Qgc2NvcGUuaXNJbk5vcm1hbENvZGVBcmVhKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgZWxzZVxuICAgICAgIyBOb3cgZmluZGluZyBvcGVuUmFuZ2U6IHNlYXJjaCBmcm9tIHNhbWUgc2NvcGVcbiAgICAgIEBjbG9zZVJhbmdlU2NvcGUgPz0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgQGNsb3NlUmFuZ2Uuc3RhcnQpXG4gICAgICBAY2xvc2VSYW5nZVNjb3BlLmlzRXF1YWwoc2NvcGUpXG5cbiAgZ2V0RXZlbnRTdGF0ZTogKHttYXRjaCwgcmFuZ2V9KSAtPlxuICAgIHN0YXRlID0gc3dpdGNoXG4gICAgICB3aGVuIG1hdGNoWzFdIHRoZW4gJ29wZW4nXG4gICAgICB3aGVuIG1hdGNoWzJdIHRoZW4gJ2Nsb3NlJ1xuICAgIHtzdGF0ZSwgcmFuZ2V9XG5cbmNsYXNzIFF1b3RlRmluZGVyIGV4dGVuZHMgUGFpckZpbmRlclxuICBzZXRQYXR0ZXJuRm9yUGFpcjogKHBhaXIpIC0+XG4gICAgQHF1b3RlQ2hhciA9IHBhaXJbMF1cbiAgICBAcGF0dGVybiA9IC8vLygje18uZXNjYXBlUmVnRXhwKHBhaXJbMF0pfSkvLy9nXG5cbiAgZmluZDogKGZyb20pIC0+XG4gICAgIyBIQUNLOiBDYW50IGRldGVybWluZSBvcGVuL2Nsb3NlIGZyb20gcXVvdGUgY2hhciBpdHNlbGZcbiAgICAjIFNvIHByZXNldCBvcGVuL2Nsb3NlIHN0YXRlIHRvIGdldCBkZXNpYWJsZSByZXN1bHQuXG4gICAge3RvdGFsLCBsZWZ0LCByaWdodCwgYmFsYW5jZWR9ID0gZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbihAZWRpdG9yLCBmcm9tLCBAcXVvdGVDaGFyKVxuICAgIG9uUXVvdGVDaGFyID0gcmlnaHRbMF0/LnN0YXJ0LmlzRXF1YWwoZnJvbSkgIyBmcm9tIHBvaW50IGlzIG9uIHF1b3RlIGNoYXJcbiAgICBpZiBiYWxhbmNlZCBhbmQgb25RdW90ZUNoYXJcbiAgICAgIG5leHRRdW90ZUlzT3BlbiA9IGxlZnQubGVuZ3RoICUgMiBpcyAwXG4gICAgZWxzZVxuICAgICAgbmV4dFF1b3RlSXNPcGVuID0gbGVmdC5sZW5ndGggaXMgMFxuXG4gICAgaWYgbmV4dFF1b3RlSXNPcGVuXG4gICAgICBAcGFpclN0YXRlcyA9IFsnb3BlbicsICdjbG9zZScsICdjbG9zZScsICdvcGVuJ11cbiAgICBlbHNlXG4gICAgICBAcGFpclN0YXRlcyA9IFsnY2xvc2UnLCAnY2xvc2UnLCAnb3BlbiddXG5cbiAgICBzdXBlclxuXG4gIGdldEV2ZW50U3RhdGU6ICh7cmFuZ2V9KSAtPlxuICAgIHN0YXRlID0gQHBhaXJTdGF0ZXMuc2hpZnQoKVxuICAgIHtzdGF0ZSwgcmFuZ2V9XG5cbmNsYXNzIFRhZ0ZpbmRlciBleHRlbmRzIFBhaXJGaW5kZXJcbiAgcGF0dGVybjogLzwoXFwvPykoW15cXHM+XSspW14+XSo+L2dcblxuICBsaW5lVGV4dFRvUG9pbnRDb250YWluc05vbldoaXRlU3BhY2U6IChwb2ludCkgLT5cbiAgICAvXFxTLy50ZXN0KGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludCkpXG5cbiAgZmluZDogKGZyb20pIC0+XG4gICAgZm91bmQgPSBzdXBlclxuICAgIGlmIGZvdW5kPyBhbmQgQGFsbG93Rm9yd2FyZGluZ1xuICAgICAgdGFnU3RhcnQgPSBmb3VuZC5hUmFuZ2Uuc3RhcnRcbiAgICAgIGlmIHRhZ1N0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSkgYW5kIEBsaW5lVGV4dFRvUG9pbnRDb250YWluc05vbldoaXRlU3BhY2UodGFnU3RhcnQpXG4gICAgICAgICMgV2UgZm91bmQgcmFuZ2UgYnV0IGFsc28gZm91bmQgdGhhdCB3ZSBhcmUgSU4gYW5vdGhlciB0YWcsXG4gICAgICAgICMgc28gd2lsbCByZXRyeSBieSBleGNsdWRpbmcgZm9yd2FyZGluZyByYW5nZS5cbiAgICAgICAgQGFsbG93Rm9yd2FyZGluZyA9IGZhbHNlXG4gICAgICAgIHJldHVybiBAZmluZChmcm9tKSAjIHJldHJ5XG4gICAgZm91bmRcblxuICBnZXRFdmVudFN0YXRlOiAoZXZlbnQpIC0+XG4gICAgYmFja3NsYXNoID0gZXZlbnQubWF0Y2hbMV1cbiAgICB7XG4gICAgICBzdGF0ZTogaWYgKGJhY2tzbGFzaCBpcyAnJykgdGhlbiAnb3BlbicgZWxzZSAnY2xvc2UnXG4gICAgICBuYW1lOiBldmVudC5tYXRjaFsyXVxuICAgICAgcmFuZ2U6IGV2ZW50LnJhbmdlXG4gICAgfVxuXG4gIGZpbmRQYWlyU3RhdGU6IChzdGFjaywge25hbWV9KSAtPlxuICAgIGZvciBzdGF0ZSBpbiBzdGFjayBieSAtMSB3aGVuIHN0YXRlLm5hbWUgaXMgbmFtZVxuICAgICAgcmV0dXJuIHN0YXRlXG5cbiAgc3BsaWNlU3RhY2s6IChzdGFjaywgZXZlbnRTdGF0ZSkgLT5cbiAgICBpZiBwYWlyRXZlbnRTdGF0ZSA9IEBmaW5kUGFpclN0YXRlKHN0YWNrLCBldmVudFN0YXRlKVxuICAgICAgc3RhY2suc3BsaWNlKHN0YWNrLmluZGV4T2YocGFpckV2ZW50U3RhdGUpKVxuICAgIHBhaXJFdmVudFN0YXRlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBCcmFja2V0RmluZGVyXG4gIFF1b3RlRmluZGVyXG4gIFRhZ0ZpbmRlclxufVxuIl19
