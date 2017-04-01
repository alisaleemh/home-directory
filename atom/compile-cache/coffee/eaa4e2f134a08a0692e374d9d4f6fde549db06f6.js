(function() {
  var AAngleBracket, AAngleBracketAllowForwarding, AAnyPair, AAnyPairAllowForwarding, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurlyBracketAllowForwarding, ACurrentLine, ADoubleQuote, AEdge, AEntire, AFold, AFunction, AIndentation, ALatestChange, APair, AParagraph, AParenthesis, AParenthesisAllowForwarding, APersistentSelection, ASingleQuote, ASmartWord, ASquareBracket, ASquareBracketAllowForwarding, ASubword, ATag, AVisibleArea, AWholeWord, AWord, All, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, BracketFinder, Comment, CurlyBracket, CurrentLine, DoubleQuote, Edge, Empty, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAngleBracketAllowForwarding, InnerAnyPair, InnerAnyPairAllowForwarding, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurlyBracketAllowForwarding, InnerCurrentLine, InnerDoubleQuote, InnerEdge, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerParenthesisAllowForwarding, InnerPersistentSelection, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerSquareBracketAllowForwarding, InnerSubword, InnerTag, InnerVisibleArea, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, QuoteFinder, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Subword, Tag, TagFinder, TextObject, VisibleArea, WholeWord, Word, _, expandRangeToWhiteSpaces, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRangesContainesForRow, getIndentLevelForBufferRow, getLineTextToBufferPosition, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, ref, ref1, ref2, sortRanges, swrap, translatePointAndClip, trimRange,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  ref1 = require('./utils'), getLineTextToBufferPosition = ref1.getLineTextToBufferPosition, getIndentLevelForBufferRow = ref1.getIndentLevelForBufferRow, getCodeFoldRowRangesContainesForRow = ref1.getCodeFoldRowRangesContainesForRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, expandRangeToWhiteSpaces = ref1.expandRangeToWhiteSpaces, getVisibleBufferRange = ref1.getVisibleBufferRange, translatePointAndClip = ref1.translatePointAndClip, getBufferRows = ref1.getBufferRows, getValidVimBufferRow = ref1.getValidVimBufferRow, trimRange = ref1.trimRange, sortRanges = ref1.sortRanges, pointIsAtEndOfLine = ref1.pointIsAtEndOfLine;

  ref2 = require('./pair-finder.coffee'), BracketFinder = ref2.BracketFinder, QuoteFinder = ref2.QuoteFinder, TagFinder = ref2.TagFinder;

  TextObject = (function(superClass) {
    extend(TextObject, superClass);

    TextObject.extend(false);

    TextObject.prototype.wise = null;

    TextObject.prototype.supportCount = false;

    function TextObject() {
      this.constructor.prototype.inner = this.getName().startsWith('Inner');
      TextObject.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.isInner();
    };

    TextObject.prototype.isSuportCount = function() {
      return this.supportCount;
    };

    TextObject.prototype.getWise = function() {
      if ((this.wise != null) && this.getOperator().isOccurrence()) {
        return 'characterwise';
      } else {
        return this.wise;
      }
    };

    TextObject.prototype.isCharacterwise = function() {
      return this.getWise() === 'characterwise';
    };

    TextObject.prototype.isLinewise = function() {
      return this.getWise() === 'linewise';
    };

    TextObject.prototype.isBlockwise = function() {
      return this.getWise() === 'blockwise';
    };

    TextObject.prototype.getNormalizedHeadBufferPosition = function(selection) {
      var head;
      head = selection.getHeadBufferPosition();
      if (this.isMode('visual') && !selection.isReversed()) {
        head = translatePointAndClip(this.editor, head, 'backward');
      }
      return head;
    };

    TextObject.prototype.getNormalizedHeadScreenPosition = function(selection) {
      var bufferPosition;
      bufferPosition = this.getNormalizedHeadBufferPosition(selection);
      return this.editor.screenPositionForBufferPosition(bufferPosition);
    };

    TextObject.prototype.needToKeepColumn = function() {
      return this.wise === 'linewise' && this.getConfig('keepColumnOnSelectTextObject') && this.getOperator()["instanceof"]('Select');
    };

    TextObject.prototype.execute = function() {
      if (this.operator != null) {
        return this.select();
      } else {
        throw new Error('in TextObject: Must not happen');
      }
    };

    TextObject.prototype.select = function() {
      var i, len, ref3, selectResults, selection;
      selectResults = [];
      this.countTimes(this.getCount(), (function(_this) {
        return function(arg) {
          var i, len, ref3, selection, stop;
          stop = arg.stop;
          _this.stopSelection = stop;
          ref3 = _this.editor.getSelections();
          for (i = 0, len = ref3.length; i < len; i++) {
            selection = ref3[i];
            selectResults.push(_this.selectTextObject(selection));
          }
          if (!_this.isSuportCount()) {
            return stop();
          }
        };
      })(this));
      if (this.needToKeepColumn()) {
        ref3 = this.editor.getSelections();
        for (i = 0, len = ref3.length; i < len; i++) {
          selection = ref3[i];
          swrap(selection).clipPropertiesTillEndOfLine();
        }
      }
      this.editor.mergeIntersectingSelections();
      if (selectResults.some(function(value) {
        return value;
      })) {
        return this.wise != null ? this.wise : this.wise = swrap.detectWise(this.editor);
      } else {
        return this.wise = null;
      }
    };

    TextObject.prototype.selectTextObject = function(selection) {
      var needToKeepColumn, newRange, oldRange, options, range;
      if (range = this.getRange(selection)) {
        oldRange = selection.getBufferRange();
        needToKeepColumn = this.needToKeepColumn();
        if (needToKeepColumn && !this.isMode('visual', 'linewise')) {
          this.vimState.modeManager.activate('visual', 'linewise');
        }
        options = {
          autoscroll: selection.isLastSelection() && !this.getOperator().supportEarlySelect,
          keepGoalColumn: needToKeepColumn
        };
        swrap(selection).setBufferRangeSafely(range, options);
        newRange = selection.getBufferRange();
        if (newRange.isEqual(oldRange)) {
          this.stopSelection();
        }
        return true;
      } else {
        this.stopSelection();
        return false;
      }
    };

    TextObject.prototype.getRange = function() {};

    return TextObject;

  })(Base);

  Word = (function(superClass) {
    extend(Word, superClass);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.prototype.getRange = function(selection) {
      var point, range;
      point = this.getNormalizedHeadBufferPosition(selection);
      range = this.getWordBufferRangeAndKindAtBufferPosition(point, {
        wordRegex: this.wordRegex
      }).range;
      if (this.isA()) {
        return expandRangeToWhiteSpaces(this.editor, range);
      } else {
        return range;
      }
    };

    return Word;

  })(TextObject);

  AWord = (function(superClass) {
    extend(AWord, superClass);

    function AWord() {
      return AWord.__super__.constructor.apply(this, arguments);
    }

    AWord.extend();

    return AWord;

  })(Word);

  InnerWord = (function(superClass) {
    extend(InnerWord, superClass);

    function InnerWord() {
      return InnerWord.__super__.constructor.apply(this, arguments);
    }

    InnerWord.extend();

    return InnerWord;

  })(Word);

  WholeWord = (function(superClass) {
    extend(WholeWord, superClass);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.prototype.wordRegex = /\S+/;

    return WholeWord;

  })(Word);

  AWholeWord = (function(superClass) {
    extend(AWholeWord, superClass);

    function AWholeWord() {
      return AWholeWord.__super__.constructor.apply(this, arguments);
    }

    AWholeWord.extend();

    return AWholeWord;

  })(WholeWord);

  InnerWholeWord = (function(superClass) {
    extend(InnerWholeWord, superClass);

    function InnerWholeWord() {
      return InnerWholeWord.__super__.constructor.apply(this, arguments);
    }

    InnerWholeWord.extend();

    return InnerWholeWord;

  })(WholeWord);

  SmartWord = (function(superClass) {
    extend(SmartWord, superClass);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.prototype.wordRegex = /[\w-]+/;

    return SmartWord;

  })(Word);

  ASmartWord = (function(superClass) {
    extend(ASmartWord, superClass);

    function ASmartWord() {
      return ASmartWord.__super__.constructor.apply(this, arguments);
    }

    ASmartWord.description = "A word that consists of alphanumeric chars(`/[A-Za-z0-9_]/`) and hyphen `-`";

    ASmartWord.extend();

    return ASmartWord;

  })(SmartWord);

  InnerSmartWord = (function(superClass) {
    extend(InnerSmartWord, superClass);

    function InnerSmartWord() {
      return InnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InnerSmartWord.description = "Currently No diff from `a-smart-word`";

    InnerSmartWord.extend();

    return InnerSmartWord;

  })(SmartWord);

  Subword = (function(superClass) {
    extend(Subword, superClass);

    function Subword() {
      return Subword.__super__.constructor.apply(this, arguments);
    }

    Subword.extend(false);

    Subword.prototype.getRange = function(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return Subword.__super__.getRange.apply(this, arguments);
    };

    return Subword;

  })(Word);

  ASubword = (function(superClass) {
    extend(ASubword, superClass);

    function ASubword() {
      return ASubword.__super__.constructor.apply(this, arguments);
    }

    ASubword.extend();

    return ASubword;

  })(Subword);

  InnerSubword = (function(superClass) {
    extend(InnerSubword, superClass);

    function InnerSubword() {
      return InnerSubword.__super__.constructor.apply(this, arguments);
    }

    InnerSubword.extend();

    return InnerSubword;

  })(Subword);

  Pair = (function(superClass) {
    extend(Pair, superClass);

    Pair.extend(false);

    Pair.prototype.allowNextLine = null;

    Pair.prototype.adjustInnerRange = true;

    Pair.prototype.pair = null;

    Pair.prototype.wise = 'characterwise';

    Pair.prototype.supportCount = true;

    Pair.prototype.isAllowNextLine = function() {
      var ref3;
      return (ref3 = this.allowNextLine) != null ? ref3 : (this.pair != null) && this.pair[0] !== this.pair[1];
    };

    function Pair() {
      if (this.allowForwarding == null) {
        this.allowForwarding = this.getName().endsWith('AllowForwarding');
      }
      Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.prototype.adjustRange = function(arg) {
      var end, start;
      start = arg.start, end = arg.end;
      if (pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }
      if (getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.isMode('visual')) {
          end = new Point(end.row - 1, 2e308);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    };

    Pair.prototype.getFinder = function() {
      var options;
      options = {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair
      };
      if (this.pair[0] === this.pair[1]) {
        return new QuoteFinder(this.editor, options);
      } else {
        return new BracketFinder(this.editor, options);
      }
    };

    Pair.prototype.getPairInfo = function(from) {
      var pairInfo;
      pairInfo = this.getFinder().find(from);
      if (pairInfo == null) {
        return null;
      }
      if (this.adjustInnerRange) {
        pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
      }
      pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
      return pairInfo;
    };

    Pair.prototype.getPointToSearchFrom = function(selection, searchFrom) {
      switch (searchFrom) {
        case 'head':
          return this.getNormalizedHeadBufferPosition(selection);
        case 'start':
          return swrap(selection).getBufferPositionFor('start');
      }
    };

    Pair.prototype.getRange = function(selection, options) {
      var allowForwarding, originalRange, pairInfo, searchFrom;
      if (options == null) {
        options = {};
      }
      allowForwarding = options.allowForwarding, searchFrom = options.searchFrom;
      if (searchFrom == null) {
        searchFrom = 'head';
      }
      if (allowForwarding != null) {
        this.allowForwarding = allowForwarding;
      }
      originalRange = selection.getBufferRange();
      pairInfo = this.getPairInfo(this.getPointToSearchFrom(selection, searchFrom));
      if (pairInfo != null ? pairInfo.targetRange.isEqual(originalRange) : void 0) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      return pairInfo != null ? pairInfo.targetRange : void 0;
    };

    return Pair;

  })(TextObject);

  APair = (function(superClass) {
    extend(APair, superClass);

    function APair() {
      return APair.__super__.constructor.apply(this, arguments);
    }

    APair.extend(false);

    return APair;

  })(Pair);

  AnyPair = (function(superClass) {
    extend(AnyPair, superClass);

    function AnyPair() {
      return AnyPair.__super__.constructor.apply(this, arguments);
    }

    AnyPair.extend(false);

    AnyPair.prototype.allowForwarding = false;

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRangeBy = function(klass, selection) {
      return this["new"](klass).getRange(selection, {
        allowForwarding: this.allowForwarding,
        searchFrom: this.searchFrom
      });
    };

    AnyPair.prototype.getRanges = function(selection) {
      var i, klass, len, prefix, range, ranges, ref3;
      prefix = this.isInner() ? 'Inner' : 'A';
      ranges = [];
      ref3 = this.member;
      for (i = 0, len = ref3.length; i < len; i++) {
        klass = ref3[i];
        if (range = this.getRangeBy(prefix + klass, selection)) {
          ranges.push(range);
        }
      }
      return ranges;
    };

    AnyPair.prototype.getRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.last(sortRanges(ranges));
      }
    };

    return AnyPair;

  })(Pair);

  AAnyPair = (function(superClass) {
    extend(AAnyPair, superClass);

    function AAnyPair() {
      return AAnyPair.__super__.constructor.apply(this, arguments);
    }

    AAnyPair.extend();

    return AAnyPair;

  })(AnyPair);

  InnerAnyPair = (function(superClass) {
    extend(InnerAnyPair, superClass);

    function InnerAnyPair() {
      return InnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPair.extend();

    return InnerAnyPair;

  })(AnyPair);

  AnyPairAllowForwarding = (function(superClass) {
    extend(AnyPairAllowForwarding, superClass);

    function AnyPairAllowForwarding() {
      return AnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AnyPairAllowForwarding.extend(false);

    AnyPairAllowForwarding.description = "Range surrounded by auto-detected paired chars from enclosed and forwarding area";

    AnyPairAllowForwarding.prototype.allowForwarding = true;

    AnyPairAllowForwarding.prototype.searchFrom = 'start';

    AnyPairAllowForwarding.prototype.getRange = function(selection) {
      var enclosingRange, enclosingRanges, forwardingRanges, from, ranges, ref3;
      ranges = this.getRanges(selection);
      from = selection.cursor.getBufferPosition();
      ref3 = _.partition(ranges, function(range) {
        return range.start.isGreaterThanOrEqual(from);
      }), forwardingRanges = ref3[0], enclosingRanges = ref3[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return forwardingRanges[0] || enclosingRange;
    };

    return AnyPairAllowForwarding;

  })(AnyPair);

  AAnyPairAllowForwarding = (function(superClass) {
    extend(AAnyPairAllowForwarding, superClass);

    function AAnyPairAllowForwarding() {
      return AAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAnyPairAllowForwarding.extend();

    return AAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  InnerAnyPairAllowForwarding = (function(superClass) {
    extend(InnerAnyPairAllowForwarding, superClass);

    function InnerAnyPairAllowForwarding() {
      return InnerAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPairAllowForwarding.extend();

    return InnerAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  AnyQuote = (function(superClass) {
    extend(AnyQuote, superClass);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

    AnyQuote.prototype.allowForwarding = true;

    AnyQuote.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];

    AnyQuote.prototype.getRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.first(_.sortBy(ranges, function(r) {
          return r.end.column;
        }));
      }
    };

    return AnyQuote;

  })(AnyPair);

  AAnyQuote = (function(superClass) {
    extend(AAnyQuote, superClass);

    function AAnyQuote() {
      return AAnyQuote.__super__.constructor.apply(this, arguments);
    }

    AAnyQuote.extend();

    return AAnyQuote;

  })(AnyQuote);

  InnerAnyQuote = (function(superClass) {
    extend(InnerAnyQuote, superClass);

    function InnerAnyQuote() {
      return InnerAnyQuote.__super__.constructor.apply(this, arguments);
    }

    InnerAnyQuote.extend();

    return InnerAnyQuote;

  })(AnyQuote);

  Quote = (function(superClass) {
    extend(Quote, superClass);

    function Quote() {
      return Quote.__super__.constructor.apply(this, arguments);
    }

    Quote.extend(false);

    Quote.prototype.allowForwarding = true;

    return Quote;

  })(Pair);

  DoubleQuote = (function(superClass) {
    extend(DoubleQuote, superClass);

    function DoubleQuote() {
      return DoubleQuote.__super__.constructor.apply(this, arguments);
    }

    DoubleQuote.extend(false);

    DoubleQuote.prototype.pair = ['"', '"'];

    return DoubleQuote;

  })(Quote);

  ADoubleQuote = (function(superClass) {
    extend(ADoubleQuote, superClass);

    function ADoubleQuote() {
      return ADoubleQuote.__super__.constructor.apply(this, arguments);
    }

    ADoubleQuote.extend();

    return ADoubleQuote;

  })(DoubleQuote);

  InnerDoubleQuote = (function(superClass) {
    extend(InnerDoubleQuote, superClass);

    function InnerDoubleQuote() {
      return InnerDoubleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerDoubleQuote.extend();

    return InnerDoubleQuote;

  })(DoubleQuote);

  SingleQuote = (function(superClass) {
    extend(SingleQuote, superClass);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.prototype.pair = ["'", "'"];

    return SingleQuote;

  })(Quote);

  ASingleQuote = (function(superClass) {
    extend(ASingleQuote, superClass);

    function ASingleQuote() {
      return ASingleQuote.__super__.constructor.apply(this, arguments);
    }

    ASingleQuote.extend();

    return ASingleQuote;

  })(SingleQuote);

  InnerSingleQuote = (function(superClass) {
    extend(InnerSingleQuote, superClass);

    function InnerSingleQuote() {
      return InnerSingleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerSingleQuote.extend();

    return InnerSingleQuote;

  })(SingleQuote);

  BackTick = (function(superClass) {
    extend(BackTick, superClass);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.prototype.pair = ['`', '`'];

    return BackTick;

  })(Quote);

  ABackTick = (function(superClass) {
    extend(ABackTick, superClass);

    function ABackTick() {
      return ABackTick.__super__.constructor.apply(this, arguments);
    }

    ABackTick.extend();

    return ABackTick;

  })(BackTick);

  InnerBackTick = (function(superClass) {
    extend(InnerBackTick, superClass);

    function InnerBackTick() {
      return InnerBackTick.__super__.constructor.apply(this, arguments);
    }

    InnerBackTick.extend();

    return InnerBackTick;

  })(BackTick);

  CurlyBracket = (function(superClass) {
    extend(CurlyBracket, superClass);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.prototype.pair = ['{', '}'];

    return CurlyBracket;

  })(Pair);

  ACurlyBracket = (function(superClass) {
    extend(ACurlyBracket, superClass);

    function ACurlyBracket() {
      return ACurlyBracket.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracket.extend();

    return ACurlyBracket;

  })(CurlyBracket);

  InnerCurlyBracket = (function(superClass) {
    extend(InnerCurlyBracket, superClass);

    function InnerCurlyBracket() {
      return InnerCurlyBracket.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracket.extend();

    return InnerCurlyBracket;

  })(CurlyBracket);

  ACurlyBracketAllowForwarding = (function(superClass) {
    extend(ACurlyBracketAllowForwarding, superClass);

    function ACurlyBracketAllowForwarding() {
      return ACurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracketAllowForwarding.extend();

    return ACurlyBracketAllowForwarding;

  })(CurlyBracket);

  InnerCurlyBracketAllowForwarding = (function(superClass) {
    extend(InnerCurlyBracketAllowForwarding, superClass);

    function InnerCurlyBracketAllowForwarding() {
      return InnerCurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracketAllowForwarding.extend();

    return InnerCurlyBracketAllowForwarding;

  })(CurlyBracket);

  SquareBracket = (function(superClass) {
    extend(SquareBracket, superClass);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.prototype.pair = ['[', ']'];

    return SquareBracket;

  })(Pair);

  ASquareBracket = (function(superClass) {
    extend(ASquareBracket, superClass);

    function ASquareBracket() {
      return ASquareBracket.__super__.constructor.apply(this, arguments);
    }

    ASquareBracket.extend();

    return ASquareBracket;

  })(SquareBracket);

  InnerSquareBracket = (function(superClass) {
    extend(InnerSquareBracket, superClass);

    function InnerSquareBracket() {
      return InnerSquareBracket.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracket.extend();

    return InnerSquareBracket;

  })(SquareBracket);

  ASquareBracketAllowForwarding = (function(superClass) {
    extend(ASquareBracketAllowForwarding, superClass);

    function ASquareBracketAllowForwarding() {
      return ASquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ASquareBracketAllowForwarding.extend();

    return ASquareBracketAllowForwarding;

  })(SquareBracket);

  InnerSquareBracketAllowForwarding = (function(superClass) {
    extend(InnerSquareBracketAllowForwarding, superClass);

    function InnerSquareBracketAllowForwarding() {
      return InnerSquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracketAllowForwarding.extend();

    return InnerSquareBracketAllowForwarding;

  })(SquareBracket);

  Parenthesis = (function(superClass) {
    extend(Parenthesis, superClass);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.prototype.pair = ['(', ')'];

    return Parenthesis;

  })(Pair);

  AParenthesis = (function(superClass) {
    extend(AParenthesis, superClass);

    function AParenthesis() {
      return AParenthesis.__super__.constructor.apply(this, arguments);
    }

    AParenthesis.extend();

    return AParenthesis;

  })(Parenthesis);

  InnerParenthesis = (function(superClass) {
    extend(InnerParenthesis, superClass);

    function InnerParenthesis() {
      return InnerParenthesis.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesis.extend();

    return InnerParenthesis;

  })(Parenthesis);

  AParenthesisAllowForwarding = (function(superClass) {
    extend(AParenthesisAllowForwarding, superClass);

    function AParenthesisAllowForwarding() {
      return AParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AParenthesisAllowForwarding.extend();

    return AParenthesisAllowForwarding;

  })(Parenthesis);

  InnerParenthesisAllowForwarding = (function(superClass) {
    extend(InnerParenthesisAllowForwarding, superClass);

    function InnerParenthesisAllowForwarding() {
      return InnerParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesisAllowForwarding.extend();

    return InnerParenthesisAllowForwarding;

  })(Parenthesis);

  AngleBracket = (function(superClass) {
    extend(AngleBracket, superClass);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  AAngleBracket = (function(superClass) {
    extend(AAngleBracket, superClass);

    function AAngleBracket() {
      return AAngleBracket.__super__.constructor.apply(this, arguments);
    }

    AAngleBracket.extend();

    return AAngleBracket;

  })(AngleBracket);

  InnerAngleBracket = (function(superClass) {
    extend(InnerAngleBracket, superClass);

    function InnerAngleBracket() {
      return InnerAngleBracket.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracket.extend();

    return InnerAngleBracket;

  })(AngleBracket);

  AAngleBracketAllowForwarding = (function(superClass) {
    extend(AAngleBracketAllowForwarding, superClass);

    function AAngleBracketAllowForwarding() {
      return AAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAngleBracketAllowForwarding.extend();

    return AAngleBracketAllowForwarding;

  })(AngleBracket);

  InnerAngleBracketAllowForwarding = (function(superClass) {
    extend(InnerAngleBracketAllowForwarding, superClass);

    function InnerAngleBracketAllowForwarding() {
      return InnerAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracketAllowForwarding.extend();

    return InnerAngleBracketAllowForwarding;

  })(AngleBracket);

  Tag = (function(superClass) {
    extend(Tag, superClass);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

    Tag.prototype.allowNextLine = true;

    Tag.prototype.allowForwarding = true;

    Tag.prototype.adjustInnerRange = false;

    Tag.prototype.getTagStartPoint = function(from) {
      var pattern, tagRange;
      tagRange = null;
      pattern = TagFinder.prototype.pattern;
      this.scanForward(pattern, {
        from: [from.row, 0]
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.containsPoint(from, true)) {
          tagRange = range;
          return stop();
        }
      });
      return tagRange != null ? tagRange.start : void 0;
    };

    Tag.prototype.getFinder = function() {
      return new TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding
      });
    };

    Tag.prototype.getPairInfo = function(from) {
      var ref3;
      return Tag.__super__.getPairInfo.call(this, (ref3 = this.getTagStartPoint(from)) != null ? ref3 : from);
    };

    return Tag;

  })(Pair);

  ATag = (function(superClass) {
    extend(ATag, superClass);

    function ATag() {
      return ATag.__super__.constructor.apply(this, arguments);
    }

    ATag.extend();

    return ATag;

  })(Tag);

  InnerTag = (function(superClass) {
    extend(InnerTag, superClass);

    function InnerTag() {
      return InnerTag.__super__.constructor.apply(this, arguments);
    }

    InnerTag.extend();

    return InnerTag;

  })(Tag);

  Paragraph = (function(superClass) {
    extend(Paragraph, superClass);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

    Paragraph.prototype.wise = 'linewise';

    Paragraph.prototype.supportCount = true;

    Paragraph.prototype.findRow = function(fromRow, direction, fn) {
      var foundRow, i, len, ref3, row;
      if (typeof fn.reset === "function") {
        fn.reset();
      }
      foundRow = fromRow;
      ref3 = getBufferRows(this.editor, {
        startRow: fromRow,
        direction: direction
      });
      for (i = 0, len = ref3.length; i < len; i++) {
        row = ref3[i];
        if (!fn(row, direction)) {
          break;
        }
        foundRow = row;
      }
      return foundRow;
    };

    Paragraph.prototype.findRowRangeBy = function(fromRow, fn) {
      var endRow, startRow;
      startRow = this.findRow(fromRow, 'previous', fn);
      endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    };

    Paragraph.prototype.getPredictFunction = function(fromRow, selection) {
      var directionToExtend, flip, fromRowResult, predict;
      fromRowResult = this.editor.isBufferRowBlank(fromRow);
      if (this.isInner()) {
        predict = (function(_this) {
          return function(row, direction) {
            return _this.editor.isBufferRowBlank(row) === fromRowResult;
          };
        })(this);
      } else {
        if (selection.isReversed()) {
          directionToExtend = 'previous';
        } else {
          directionToExtend = 'next';
        }
        flip = false;
        predict = (function(_this) {
          return function(row, direction) {
            var result;
            result = _this.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if ((!result) && (direction === directionToExtend)) {
                flip = true;
                return true;
              }
              return result;
            }
          };
        })(this);
        predict.reset = function() {
          return flip = false;
        };
      }
      return predict;
    };

    Paragraph.prototype.getRange = function(selection) {
      var fromRow, originalRange, rowRange;
      originalRange = selection.getBufferRange();
      fromRow = this.getNormalizedHeadBufferPosition(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) {
          fromRow--;
        } else {
          fromRow++;
        }
        fromRow = getValidVimBufferRow(this.editor, fromRow);
      }
      rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(getBufferRangeForRowRange(this.editor, rowRange));
    };

    return Paragraph;

  })(TextObject);

  AParagraph = (function(superClass) {
    extend(AParagraph, superClass);

    function AParagraph() {
      return AParagraph.__super__.constructor.apply(this, arguments);
    }

    AParagraph.extend();

    return AParagraph;

  })(Paragraph);

  InnerParagraph = (function(superClass) {
    extend(InnerParagraph, superClass);

    function InnerParagraph() {
      return InnerParagraph.__super__.constructor.apply(this, arguments);
    }

    InnerParagraph.extend();

    return InnerParagraph;

  })(Paragraph);

  Indentation = (function(superClass) {
    extend(Indentation, superClass);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.prototype.getRange = function(selection) {
      var baseIndentLevel, fromRow, predict, rowRange;
      fromRow = this.getNormalizedHeadBufferPosition(selection).row;
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, fromRow);
      predict = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isA();
          } else {
            return getIndentLevelForBufferRow(_this.editor, row) >= baseIndentLevel;
          }
        };
      })(this);
      rowRange = this.findRowRangeBy(fromRow, predict);
      return getBufferRangeForRowRange(this.editor, rowRange);
    };

    return Indentation;

  })(Paragraph);

  AIndentation = (function(superClass) {
    extend(AIndentation, superClass);

    function AIndentation() {
      return AIndentation.__super__.constructor.apply(this, arguments);
    }

    AIndentation.extend();

    return AIndentation;

  })(Indentation);

  InnerIndentation = (function(superClass) {
    extend(InnerIndentation, superClass);

    function InnerIndentation() {
      return InnerIndentation.__super__.constructor.apply(this, arguments);
    }

    InnerIndentation.extend();

    return InnerIndentation;

  })(Indentation);

  Comment = (function(superClass) {
    extend(Comment, superClass);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.prototype.wise = 'linewise';

    Comment.prototype.getRange = function(selection) {
      var row, rowRange;
      row = swrap(selection).getStartRow();
      rowRange = this.editor.languageMode.rowRangeForCommentAtBufferRow(row);
      if (this.editor.isBufferRowCommented(row)) {
        if (rowRange == null) {
          rowRange = [row, row];
        }
      }
      if (rowRange) {
        return getBufferRangeForRowRange(selection.editor, rowRange);
      }
    };

    return Comment;

  })(TextObject);

  AComment = (function(superClass) {
    extend(AComment, superClass);

    function AComment() {
      return AComment.__super__.constructor.apply(this, arguments);
    }

    AComment.extend();

    return AComment;

  })(Comment);

  InnerComment = (function(superClass) {
    extend(InnerComment, superClass);

    function InnerComment() {
      return InnerComment.__super__.constructor.apply(this, arguments);
    }

    InnerComment.extend();

    return InnerComment;

  })(Comment);

  Fold = (function(superClass) {
    extend(Fold, superClass);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.prototype.wise = 'linewise';

    Fold.prototype.adjustRowRange = function(rowRange) {
      var endRow, endRowIndentLevel, startRow, startRowIndentLevel;
      if (!this.isInner()) {
        return rowRange;
      }
      startRow = rowRange[0], endRow = rowRange[1];
      startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      endRowIndentLevel = getIndentLevelForBufferRow(this.editor, endRow);
      if (startRowIndentLevel === endRowIndentLevel) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      return getCodeFoldRowRangesContainesForRow(this.editor, row, {
        includeStartRow: true
      }).reverse();
    };

    Fold.prototype.getRange = function(selection) {
      var range, rowRanges;
      rowRanges = this.getFoldRowRangesContainsForRow(swrap(selection).getStartRow());
      if (!rowRanges.length) {
        return;
      }
      range = getBufferRangeForRowRange(this.editor, this.adjustRowRange(rowRanges.shift()));
      if (rowRanges.length && range.isEqual(selection.getBufferRange())) {
        range = getBufferRangeForRowRange(this.editor, this.adjustRowRange(rowRanges.shift()));
      }
      return range;
    };

    return Fold;

  })(TextObject);

  AFold = (function(superClass) {
    extend(AFold, superClass);

    function AFold() {
      return AFold.__super__.constructor.apply(this, arguments);
    }

    AFold.extend();

    return AFold;

  })(Fold);

  InnerFold = (function(superClass) {
    extend(InnerFold, superClass);

    function InnerFold() {
      return InnerFold.__super__.constructor.apply(this, arguments);
    }

    InnerFold.extend();

    return InnerFold;

  })(Fold);

  Function = (function(superClass) {
    extend(Function, superClass);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.prototype.scopeNamesOmittingEndRow = ['source.go', 'source.elixir'];

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      var ref3, rowRanges;
      rowRanges = (ref3 = getCodeFoldRowRangesContainesForRow(this.editor, row)) != null ? ref3.reverse() : void 0;
      return rowRanges != null ? rowRanges.filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this)) : void 0;
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, ref3, ref4, startRow;
      ref3 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = ref3[0], endRow = ref3[1];
      if (this.isA() && (ref4 = this.editor.getGrammar().scopeName, indexOf.call(this.scopeNamesOmittingEndRow, ref4) >= 0)) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  AFunction = (function(superClass) {
    extend(AFunction, superClass);

    function AFunction() {
      return AFunction.__super__.constructor.apply(this, arguments);
    }

    AFunction.extend();

    return AFunction;

  })(Function);

  InnerFunction = (function(superClass) {
    extend(InnerFunction, superClass);

    function InnerFunction() {
      return InnerFunction.__super__.constructor.apply(this, arguments);
    }

    InnerFunction.extend();

    return InnerFunction;

  })(Function);

  CurrentLine = (function(superClass) {
    extend(CurrentLine, superClass);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.prototype.getRange = function(selection) {
      var range, row;
      row = this.getNormalizedHeadBufferPosition(selection).row;
      range = this.editor.bufferRangeForBufferRow(row);
      if (this.isA()) {
        return range;
      } else {
        return trimRange(this.editor, range);
      }
    };

    return CurrentLine;

  })(TextObject);

  ACurrentLine = (function(superClass) {
    extend(ACurrentLine, superClass);

    function ACurrentLine() {
      return ACurrentLine.__super__.constructor.apply(this, arguments);
    }

    ACurrentLine.extend();

    return ACurrentLine;

  })(CurrentLine);

  InnerCurrentLine = (function(superClass) {
    extend(InnerCurrentLine, superClass);

    function InnerCurrentLine() {
      return InnerCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InnerCurrentLine.extend();

    return InnerCurrentLine;

  })(CurrentLine);

  Entire = (function(superClass) {
    extend(Entire, superClass);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.prototype.getRange = function(selection) {
      this.stopSelection();
      return this.editor.buffer.getRange();
    };

    return Entire;

  })(TextObject);

  AEntire = (function(superClass) {
    extend(AEntire, superClass);

    function AEntire() {
      return AEntire.__super__.constructor.apply(this, arguments);
    }

    AEntire.extend();

    return AEntire;

  })(Entire);

  InnerEntire = (function(superClass) {
    extend(InnerEntire, superClass);

    function InnerEntire() {
      return InnerEntire.__super__.constructor.apply(this, arguments);
    }

    InnerEntire.extend();

    return InnerEntire;

  })(Entire);

  All = (function(superClass) {
    extend(All, superClass);

    function All() {
      return All.__super__.constructor.apply(this, arguments);
    }

    All.extend(false);

    return All;

  })(Entire);

  Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.extend(false);

    return Empty;

  })(TextObject);

  LatestChange = (function(superClass) {
    extend(LatestChange, superClass);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.prototype.getRange = function() {
      this.stopSelection();
      return this.vimState.mark.getRange('[', ']');
    };

    return LatestChange;

  })(TextObject);

  ALatestChange = (function(superClass) {
    extend(ALatestChange, superClass);

    function ALatestChange() {
      return ALatestChange.__super__.constructor.apply(this, arguments);
    }

    ALatestChange.extend();

    return ALatestChange;

  })(LatestChange);

  InnerLatestChange = (function(superClass) {
    extend(InnerLatestChange, superClass);

    function InnerLatestChange() {
      return InnerLatestChange.__super__.constructor.apply(this, arguments);
    }

    InnerLatestChange.extend();

    return InnerLatestChange;

  })(LatestChange);

  SearchMatchForward = (function(superClass) {
    extend(SearchMatchForward, superClass);

    function SearchMatchForward() {
      return SearchMatchForward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchForward.extend();

    SearchMatchForward.prototype.backward = false;

    SearchMatchForward.prototype.findMatch = function(fromPoint, pattern) {
      var found;
      if (this.isMode('visual')) {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "forward");
      }
      found = null;
      this.scanForward(pattern, {
        from: [fromPoint.row, 0]
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.end.isGreaterThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'end'
      };
    };

    SearchMatchForward.prototype.getRange = function(selection) {
      var fromPoint, pattern, range, ref3, whichIsHead;
      pattern = this.globalState.get('lastSearchPattern');
      if (pattern == null) {
        return;
      }
      fromPoint = selection.getHeadBufferPosition();
      ref3 = this.findMatch(fromPoint, pattern), range = ref3.range, whichIsHead = ref3.whichIsHead;
      if (range != null) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    };

    SearchMatchForward.prototype.unionRangeAndDetermineReversedState = function(selection, found, whichIsHead) {
      var head, tail;
      if (selection.isEmpty()) {
        return found;
      } else {
        head = found[whichIsHead];
        tail = selection.getTailBufferPosition();
        if (this.backward) {
          if (tail.isLessThan(head)) {
            head = translatePointAndClip(this.editor, head, 'forward');
          }
        } else {
          if (head.isLessThan(tail)) {
            head = translatePointAndClip(this.editor, head, 'backward');
          }
        }
        this.reversed = head.isLessThan(tail);
        return new Range(tail, head).union(swrap(selection).getTailBufferRange());
      }
    };

    SearchMatchForward.prototype.selectTextObject = function(selection) {
      var range, ref3;
      if (!(range = this.getRange(selection))) {
        return;
      }
      swrap(selection).setBufferRange(range, {
        reversed: (ref3 = this.reversed) != null ? ref3 : this.backward
      });
      selection.cursor.autoscroll();
      return true;
    };

    return SearchMatchForward;

  })(TextObject);

  SearchMatchBackward = (function(superClass) {
    extend(SearchMatchBackward, superClass);

    function SearchMatchBackward() {
      return SearchMatchBackward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchBackward.extend();

    SearchMatchBackward.prototype.backward = true;

    SearchMatchBackward.prototype.findMatch = function(fromPoint, pattern) {
      var found;
      if (this.isMode('visual')) {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "backward");
      }
      found = null;
      this.scanBackward(pattern, {
        from: [fromPoint.row, 2e308]
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.start.isLessThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'start'
      };
    };

    return SearchMatchBackward;

  })(SearchMatchForward);

  PreviousSelection = (function(superClass) {
    extend(PreviousSelection, superClass);

    function PreviousSelection() {
      return PreviousSelection.__super__.constructor.apply(this, arguments);
    }

    PreviousSelection.extend();

    PreviousSelection.prototype.select = function() {
      var properties, ref3, selection, submode;
      ref3 = this.vimState.previousSelection, properties = ref3.properties, submode = ref3.submode;
      if ((properties != null) && (submode != null)) {
        selection = this.editor.getLastSelection();
        swrap(selection).selectByProperties(properties, {
          keepGoalColumn: false
        });
        return this.wise = submode;
      }
    };

    return PreviousSelection;

  })(TextObject);

  PersistentSelection = (function(superClass) {
    extend(PersistentSelection, superClass);

    function PersistentSelection() {
      return PersistentSelection.__super__.constructor.apply(this, arguments);
    }

    PersistentSelection.extend(false);

    PersistentSelection.prototype.select = function() {
      var persistentSelection;
      persistentSelection = this.vimState.persistentSelection;
      if (!persistentSelection.isEmpty()) {
        persistentSelection.setSelectedBufferRanges();
        return this.wise = swrap.detectWise(this.editor);
      }
    };

    return PersistentSelection;

  })(TextObject);

  APersistentSelection = (function(superClass) {
    extend(APersistentSelection, superClass);

    function APersistentSelection() {
      return APersistentSelection.__super__.constructor.apply(this, arguments);
    }

    APersistentSelection.extend();

    return APersistentSelection;

  })(PersistentSelection);

  InnerPersistentSelection = (function(superClass) {
    extend(InnerPersistentSelection, superClass);

    function InnerPersistentSelection() {
      return InnerPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    InnerPersistentSelection.extend();

    return InnerPersistentSelection;

  })(PersistentSelection);

  VisibleArea = (function(superClass) {
    extend(VisibleArea, superClass);

    function VisibleArea() {
      return VisibleArea.__super__.constructor.apply(this, arguments);
    }

    VisibleArea.extend(false);

    VisibleArea.prototype.getRange = function(selection) {
      var bufferRange;
      this.stopSelection();
      bufferRange = getVisibleBufferRange(this.editor);
      if (bufferRange.getRows() > this.editor.getRowsPerPage()) {
        return bufferRange.translate([+1, 0], [-3, 0]);
      } else {
        return bufferRange;
      }
    };

    return VisibleArea;

  })(TextObject);

  AVisibleArea = (function(superClass) {
    extend(AVisibleArea, superClass);

    function AVisibleArea() {
      return AVisibleArea.__super__.constructor.apply(this, arguments);
    }

    AVisibleArea.extend();

    return AVisibleArea;

  })(VisibleArea);

  InnerVisibleArea = (function(superClass) {
    extend(InnerVisibleArea, superClass);

    function InnerVisibleArea() {
      return InnerVisibleArea.__super__.constructor.apply(this, arguments);
    }

    InnerVisibleArea.extend();

    return InnerVisibleArea;

  })(VisibleArea);

  Edge = (function(superClass) {
    extend(Edge, superClass);

    function Edge() {
      return Edge.__super__.constructor.apply(this, arguments);
    }

    Edge.extend(false);

    Edge.prototype.wise = 'linewise';

    Edge.prototype.getRange = function(selection) {
      var endScreenPoint, fromPoint, moveDownToEdge, moveUpToEdge, range, screenRange, startScreenPoint;
      fromPoint = this.getNormalizedHeadScreenPosition(selection);
      moveUpToEdge = this["new"]('MoveUpToEdge');
      moveDownToEdge = this["new"]('MoveDownToEdge');
      if (!moveUpToEdge.isStoppablePoint(fromPoint)) {
        return;
      }
      startScreenPoint = endScreenPoint = null;
      if (moveUpToEdge.isEdge(fromPoint)) {
        startScreenPoint = endScreenPoint = fromPoint;
      }
      if (moveUpToEdge.isStoppablePoint(fromPoint.translate([-1, 0]))) {
        startScreenPoint = moveUpToEdge.getPoint(fromPoint);
      }
      if (moveDownToEdge.isStoppablePoint(fromPoint.translate([+1, 0]))) {
        endScreenPoint = moveDownToEdge.getPoint(fromPoint);
      }
      if ((startScreenPoint != null) && (endScreenPoint != null)) {
        screenRange = new Range(startScreenPoint, endScreenPoint);
        range = this.editor.bufferRangeForScreenRange(screenRange);
        return getBufferRangeForRowRange(this.editor, [range.start.row, range.end.row]);
      }
    };

    return Edge;

  })(TextObject);

  AEdge = (function(superClass) {
    extend(AEdge, superClass);

    function AEdge() {
      return AEdge.__super__.constructor.apply(this, arguments);
    }

    AEdge.extend();

    return AEdge;

  })(Edge);

  InnerEdge = (function(superClass) {
    extend(InnerEdge, superClass);

    function InnerEdge() {
      return InnerEdge.__super__.constructor.apply(this, arguments);
    }

    InnerEdge.extend();

    return InnerEdge;

  })(Edge);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDh3REFBQTtJQUFBOzs7O0VBQUEsTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBT0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsT0FlSSxPQUFBLENBQVEsU0FBUixDQWZKLEVBQ0UsOERBREYsRUFFRSw0REFGRixFQUdFLDhFQUhGLEVBSUUsMERBSkYsRUFLRSxnRUFMRixFQU1FLHdEQU5GLEVBT0Usa0RBUEYsRUFRRSxrREFSRixFQVNFLGtDQVRGLEVBVUUsZ0RBVkYsRUFXRSwwQkFYRixFQWFFLDRCQWJGLEVBY0U7O0VBRUYsT0FBMEMsT0FBQSxDQUFRLHNCQUFSLENBQTFDLEVBQUMsa0NBQUQsRUFBZ0IsOEJBQWhCLEVBQTZCOztFQUV2Qjs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzt5QkFDQSxJQUFBLEdBQU07O3lCQUNOLFlBQUEsR0FBYzs7SUFFRCxvQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFXLENBQUEsU0FBRSxDQUFBLEtBQWQsR0FBc0IsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsVUFBWCxDQUFzQixPQUF0QjtNQUN0Qiw2Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUhXOzt5QkFLYixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQTtJQURNOzt5QkFHVCxHQUFBLEdBQUssU0FBQTthQUNILENBQUksSUFBQyxDQUFBLE9BQUQsQ0FBQTtJQUREOzt5QkFHTCxhQUFBLEdBQWUsU0FBQTthQUNi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LGdCQUFmLENBQWdDLFNBQVMsQ0FBQyxTQUFWLENBQW9CLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUFwQixDQUFoQyxDQUFIO1FBQ0UsY0FBQSxHQUFpQixjQUFjLENBQUMsUUFBZixDQUF3QixTQUF4QixFQURuQjs7TUFHQSxJQUFHLDBCQUFBLElBQXNCLHdCQUF6QjtRQUNFLFdBQUEsR0FBa0IsSUFBQSxLQUFBLENBQU0sZ0JBQU4sRUFBd0IsY0FBeEI7UUFDbEIsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsV0FBbEM7ZUFDUix5QkFBQSxDQUEwQixJQUFDLENBQUEsTUFBM0IsRUFBbUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQWIsRUFBa0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUE1QixDQUFuQyxFQUhGOztJQWhCUTs7OztLQUpPOztFQXlCYjs7Ozs7OztJQUNKLEtBQUMsQ0FBQSxNQUFELENBQUE7Ozs7S0FEa0I7O0VBRWQ7Ozs7Ozs7SUFDSixTQUFDLENBQUEsTUFBRCxDQUFBOzs7O0tBRHNCO0FBaHlCeEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG4jIFtUT0RPXSBOZWVkIG92ZXJoYXVsXG4jICAtIFsgXSBtdXN0IGhhdmUgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSAtPlxuIyAgLSBbIF0gUmVtb3ZlIHNlbGVjdFRleHRPYmplY3Q/XG4jICAtIFsgXSBNYWtlIGV4cGFuZGFibGUgYnkgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24oQGdldFJhbmdlKHNlbGVjdGlvbikpXG4jICAtIFsgXSBDb3VudCBzdXBwb3J0KHByaW9yaXR5IGxvdyk/XG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xue1xuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3dcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlc1xuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldEJ1ZmZlclJvd3NcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgdHJpbVJhbmdlXG5cbiAgc29ydFJhbmdlc1xuICBwb2ludElzQXRFbmRPZkxpbmVcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xue0JyYWNrZXRGaW5kZXIsIFF1b3RlRmluZGVyLCBUYWdGaW5kZXJ9ID0gcmVxdWlyZSAnLi9wYWlyLWZpbmRlci5jb2ZmZWUnXG5cbmNsYXNzIFRleHRPYmplY3QgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6IG51bGxcbiAgc3VwcG9ydENvdW50OiBmYWxzZSAjIEZJWE1FICM0NzIsICM2NlxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBjb25zdHJ1Y3Rvcjo6aW5uZXIgPSBAZ2V0TmFtZSgpLnN0YXJ0c1dpdGgoJ0lubmVyJylcbiAgICBzdXBlclxuICAgIEBpbml0aWFsaXplKClcblxuICBpc0lubmVyOiAtPlxuICAgIEBpbm5lclxuXG4gIGlzQTogLT5cbiAgICBub3QgQGlzSW5uZXIoKVxuXG4gIGlzU3Vwb3J0Q291bnQ6IC0+XG4gICAgQHN1cHBvcnRDb3VudFxuXG4gIGdldFdpc2U6IC0+XG4gICAgaWYgQHdpc2U/IGFuZCBAZ2V0T3BlcmF0b3IoKS5pc09jY3VycmVuY2UoKVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG4gICAgZWxzZVxuICAgICAgQHdpc2VcblxuICBpc0NoYXJhY3Rlcndpc2U6IC0+XG4gICAgQGdldFdpc2UoKSBpcyAnY2hhcmFjdGVyd2lzZSdcblxuICBpc0xpbmV3aXNlOiAtPlxuICAgIEBnZXRXaXNlKCkgaXMgJ2xpbmV3aXNlJ1xuXG4gIGlzQmxvY2t3aXNlOiAtPlxuICAgIEBnZXRXaXNlKCkgaXMgJ2Jsb2Nrd2lzZSdcblxuICBnZXROb3JtYWxpemVkSGVhZEJ1ZmZlclBvc2l0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGhlYWQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKSBhbmQgbm90IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIGhlYWQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgaGVhZCwgJ2JhY2t3YXJkJylcbiAgICBoZWFkXG5cbiAgZ2V0Tm9ybWFsaXplZEhlYWRTY3JlZW5Qb3NpdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBidWZmZXJQb3NpdGlvbiA9IEBnZXROb3JtYWxpemVkSGVhZEJ1ZmZlclBvc2l0aW9uKHNlbGVjdGlvbilcbiAgICBAZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG5cbiAgbmVlZFRvS2VlcENvbHVtbjogLT5cbiAgICBAd2lzZSBpcyAnbGluZXdpc2UnIGFuZFxuICAgICAgQGdldENvbmZpZygna2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdCcpIGFuZFxuICAgICAgQGdldE9wZXJhdG9yKCkuaW5zdGFuY2VvZignU2VsZWN0JylcblxuICBleGVjdXRlOiAtPlxuICAgICMgV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICAjIENhbGxlZCBmcm9tIE9wZXJhdG9yOjpzZWxlY3RUYXJnZXQoKVxuICAgICMgIC0gYHYgaSBwYCwgaXMgYFNlbGVjdGAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgICAjICAtIGBkIGkgcGAsIGlzIGBEZWxldGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gICAgaWYgQG9wZXJhdG9yP1xuICAgICAgQHNlbGVjdCgpXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbiBUZXh0T2JqZWN0OiBNdXN0IG5vdCBoYXBwZW4nKVxuXG4gIHNlbGVjdDogLT5cbiAgICBzZWxlY3RSZXN1bHRzID0gW11cbiAgICBAY291bnRUaW1lcyBAZ2V0Q291bnQoKSwgKHtzdG9wfSkgPT5cbiAgICAgIEBzdG9wU2VsZWN0aW9uID0gc3RvcFxuXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIHNlbGVjdFJlc3VsdHMucHVzaChAc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pKVxuXG4gICAgICB1bmxlc3MgQGlzU3Vwb3J0Q291bnQoKVxuICAgICAgICBzdG9wKCkgIyBGSVhNRTogcXVpY2stZml4IGZvciAjNTYwXG5cbiAgICBpZiBAbmVlZFRvS2VlcENvbHVtbigpXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIHN3cmFwKHNlbGVjdGlvbikuY2xpcFByb3BlcnRpZXNUaWxsRW5kT2ZMaW5lKClcblxuICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICBpZiBzZWxlY3RSZXN1bHRzLnNvbWUoKHZhbHVlKSAtPiB2YWx1ZSlcbiAgICAgIEB3aXNlID89IHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcilcbiAgICBlbHNlXG4gICAgICBAd2lzZSA9IG51bGxcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHJhbmdlID0gQGdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgICAgbmVlZFRvS2VlcENvbHVtbiA9IEBuZWVkVG9LZWVwQ29sdW1uKClcbiAgICAgIGlmIG5lZWRUb0tlZXBDb2x1bW4gYW5kIG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG5cbiAgICAgICMgUHJldmVudCBhdXRvc2Nyb2xsIHRvIGNsb3NpbmcgY2hhciBvbiBgY2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyYC5cbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGF1dG9zY3JvbGw6IHNlbGVjdGlvbi5pc0xhc3RTZWxlY3Rpb24oKSBhbmQgbm90IEBnZXRPcGVyYXRvcigpLnN1cHBvcnRFYXJseVNlbGVjdFxuICAgICAgICBrZWVwR29hbENvbHVtbjogbmVlZFRvS2VlcENvbHVtblxuICAgICAgfVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZVNhZmVseShyYW5nZSwgb3B0aW9ucylcblxuICAgICAgbmV3UmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgbmV3UmFuZ2UuaXNFcXVhbChvbGRSYW5nZSlcbiAgICAgICAgQHN0b3BTZWxlY3Rpb24oKSAjIEZJWE1FOiBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBzdG9wU2VsZWN0aW9uKCkgIyBGSVhNRTogcXVpY2stZml4IGZvciAjNTYwXG4gICAgICBmYWxzZVxuXG4gIGdldFJhbmdlOiAtPlxuICAgICMgSSB3YW50IHRvXG4gICAgIyB0aHJvdyBuZXcgRXJyb3IoJ3RleHQtb2JqZWN0IG11c3QgcmVzcG9uZCB0byByYW5nZSBieSBnZXRSYW5nZSgpIScpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBwb2ludCA9IEBnZXROb3JtYWxpemVkSGVhZEJ1ZmZlclBvc2l0aW9uKHNlbGVjdGlvbilcbiAgICB7cmFuZ2V9ID0gQGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7QHdvcmRSZWdleH0pXG4gICAgaWYgQGlzQSgpXG4gICAgICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXMoQGVkaXRvciwgcmFuZ2UpXG4gICAgZWxzZVxuICAgICAgcmFuZ2VcblxuY2xhc3MgQVdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbmNsYXNzIEFXaG9sZVdvcmQgZXh0ZW5kcyBXaG9sZVdvcmRcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lcldob2xlV29yZCBleHRlbmRzIFdob2xlV29yZFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbmNsYXNzIEFTbWFydFdvcmQgZXh0ZW5kcyBTbWFydFdvcmRcbiAgQGRlc2NyaXB0aW9uOiBcIkEgd29yZCB0aGF0IGNvbnNpc3RzIG9mIGFscGhhbnVtZXJpYyBjaGFycyhgL1tBLVphLXowLTlfXS9gKSBhbmQgaHlwaGVuIGAtYFwiXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJTbWFydFdvcmQgZXh0ZW5kcyBTbWFydFdvcmRcbiAgQGRlc2NyaXB0aW9uOiBcIkN1cnJlbnRseSBObyBkaWZmIGZyb20gYGEtc21hcnQtd29yZGBcIlxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTdWJ3b3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAd29yZFJlZ2V4ID0gc2VsZWN0aW9uLmN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBBU3Vid29yZCBleHRlbmRzIFN1YndvcmRcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclN1YndvcmQgZXh0ZW5kcyBTdWJ3b3JkXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFBhaXIgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIGFsbG93TmV4dExpbmU6IG51bGxcbiAgYWRqdXN0SW5uZXJSYW5nZTogdHJ1ZVxuICBwYWlyOiBudWxsXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICBzdXBwb3J0Q291bnQ6IHRydWVcblxuICBpc0FsbG93TmV4dExpbmU6IC0+XG4gICAgQGFsbG93TmV4dExpbmUgPyAoQHBhaXI/IGFuZCBAcGFpclswXSBpc250IEBwYWlyWzFdKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgICMgYXV0by1zZXQgcHJvcGVydHkgZnJvbSBjbGFzcyBuYW1lLlxuICAgIEBhbGxvd0ZvcndhcmRpbmcgPz0gQGdldE5hbWUoKS5lbmRzV2l0aCgnQWxsb3dGb3J3YXJkaW5nJylcbiAgICBzdXBlclxuXG4gIGFkanVzdFJhbmdlOiAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICMgRGlydHkgd29yayB0byBmZWVsIG5hdHVyYWwgZm9yIGh1bWFuLCB0byBiZWhhdmUgY29tcGF0aWJsZSB3aXRoIHB1cmUgVmltLlxuICAgICMgV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgICMgb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgIyBvcC0yOiBgZGl7YCBkZWxldGUgb25seSAybmQgbGluZS5cbiAgICAjIHRleHQ6XG4gICAgIyAge1xuICAgICMgICAgYWFhXG4gICAgIyAgfVxuICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZShAZWRpdG9yLCBzdGFydClcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gICAgaWYgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pXG4gICAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgICAjIFRoaXMgaXMgc2xpZ2h0bHkgaW5uY29uc2lzdGVudCB3aXRoIHJlZ3VsYXIgVmltXG4gICAgICAgICMgLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAjIC0gdmltLW1vZGUtcGx1czogc2VsZWN0IHRvIEVPTChiZWZvcmUgbmV3IGxpbmUpXG4gICAgICAgICMgVGhpcyBpcyBpbnRlbnRpb25hbCBzaW5jZSB0byBtYWtlIHN1Ym1vZGUgYGNoYXJhY3Rlcndpc2VgIHdoZW4gYXV0by1kZXRlY3Qgc3VibW9kZVxuICAgICAgICAjIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgZWxzZVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdywgMClcblxuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG4gIGdldEZpbmRlcjogLT5cbiAgICBvcHRpb25zID0ge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZywgQHBhaXJ9XG4gICAgaWYgQHBhaXJbMF0gaXMgQHBhaXJbMV1cbiAgICAgIG5ldyBRdW90ZUZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIG5ldyBCcmFja2V0RmluZGVyKEBlZGl0b3IsIG9wdGlvbnMpXG5cbiAgZ2V0UGFpckluZm86IChmcm9tKSAtPlxuICAgIHBhaXJJbmZvID0gQGdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICB1bmxlc3MgcGFpckluZm8/XG4gICAgICByZXR1cm4gbnVsbFxuICAgIHBhaXJJbmZvLmlubmVyUmFuZ2UgPSBAYWRqdXN0UmFuZ2UocGFpckluZm8uaW5uZXJSYW5nZSkgaWYgQGFkanVzdElubmVyUmFuZ2VcbiAgICBwYWlySW5mby50YXJnZXRSYW5nZSA9IGlmIEBpc0lubmVyKCkgdGhlbiBwYWlySW5mby5pbm5lclJhbmdlIGVsc2UgcGFpckluZm8uYVJhbmdlXG4gICAgcGFpckluZm9cblxuICBnZXRQb2ludFRvU2VhcmNoRnJvbTogKHNlbGVjdGlvbiwgc2VhcmNoRnJvbSkgLT5cbiAgICBzd2l0Y2ggc2VhcmNoRnJvbVxuICAgICAgd2hlbiAnaGVhZCcgdGhlbiBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pXG4gICAgICB3aGVuICdzdGFydCcgdGhlbiBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdzdGFydCcpXG5cbiAgIyBBbGxvdyBvdmVycmlkZSBAYWxsb3dGb3J3YXJkaW5nIGJ5IDJuZCBhcmd1bWVudC5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24sIG9wdGlvbnM9e30pIC0+XG4gICAge2FsbG93Rm9yd2FyZGluZywgc2VhcmNoRnJvbX0gPSBvcHRpb25zXG4gICAgc2VhcmNoRnJvbSA/PSAnaGVhZCdcbiAgICBAYWxsb3dGb3J3YXJkaW5nID0gYWxsb3dGb3J3YXJkaW5nIGlmIGFsbG93Rm9yd2FyZGluZz9cbiAgICBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBwYWlySW5mbyA9IEBnZXRQYWlySW5mbyhAZ2V0UG9pbnRUb1NlYXJjaEZyb20oc2VsZWN0aW9uLCBzZWFyY2hGcm9tKSlcbiAgICAjIFdoZW4gcmFuZ2Ugd2FzIHNhbWUsIHRyeSB0byBleHBhbmQgcmFuZ2VcbiAgICBpZiBwYWlySW5mbz8udGFyZ2V0UmFuZ2UuaXNFcXVhbChvcmlnaW5hbFJhbmdlKVxuICAgICAgcGFpckluZm8gPSBAZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICBwYWlySW5mbz8udGFyZ2V0UmFuZ2VcblxuIyBVc2VkIGJ5IERlbGV0ZVN1cnJvdW5kXG5jbGFzcyBBUGFpciBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBBbnlQYWlyIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBhbGxvd0ZvcndhcmRpbmc6IGZhbHNlXG4gIG1lbWJlcjogW1xuICAgICdEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljaycsXG4gICAgJ0N1cmx5QnJhY2tldCcsICdBbmdsZUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCcsICdQYXJlbnRoZXNpcydcbiAgXVxuXG4gIGdldFJhbmdlQnk6IChrbGFzcywgc2VsZWN0aW9uKSAtPlxuICAgIEBuZXcoa2xhc3MpLmdldFJhbmdlKHNlbGVjdGlvbiwge0BhbGxvd0ZvcndhcmRpbmcsIEBzZWFyY2hGcm9tfSlcblxuICBnZXRSYW5nZXM6IChzZWxlY3Rpb24pIC0+XG4gICAgcHJlZml4ID0gaWYgQGlzSW5uZXIoKSB0aGVuICdJbm5lcicgZWxzZSAnQSdcbiAgICByYW5nZXMgPSBbXVxuICAgIGZvciBrbGFzcyBpbiBAbWVtYmVyIHdoZW4gcmFuZ2UgPSBAZ2V0UmFuZ2VCeShwcmVmaXggKyBrbGFzcywgc2VsZWN0aW9uKVxuICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2VzID0gQGdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgXy5sYXN0KHNvcnRSYW5nZXMocmFuZ2VzKSkgaWYgcmFuZ2VzLmxlbmd0aFxuXG5jbGFzcyBBQW55UGFpciBleHRlbmRzIEFueVBhaXJcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckFueVBhaXIgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXNjcmlwdGlvbjogXCJSYW5nZSBzdXJyb3VuZGVkIGJ5IGF1dG8tZGV0ZWN0ZWQgcGFpcmVkIGNoYXJzIGZyb20gZW5jbG9zZWQgYW5kIGZvcndhcmRpbmcgYXJlYVwiXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuICBzZWFyY2hGcm9tOiAnc3RhcnQnXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgIGZyb20gPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IF8ucGFydGl0aW9uIHJhbmdlcywgKHJhbmdlKSAtPlxuICAgICAgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoZnJvbSlcbiAgICBlbmNsb3NpbmdSYW5nZSA9IF8ubGFzdChzb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHNvcnRSYW5nZXMoZm9yd2FyZGluZ1JhbmdlcylcblxuICAgICMgV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgIyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgICMgU28gY2hvb3NlIGZyb20gcmFuZ2VzIGNvbnRhaW5lZCBpbiBlbmNsb3NpbmdSYW5nZS5cbiAgICBpZiBlbmNsb3NpbmdSYW5nZVxuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyIChyYW5nZSkgLT5cbiAgICAgICAgZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSlcblxuICAgIGZvcndhcmRpbmdSYW5nZXNbMF0gb3IgZW5jbG9zaW5nUmFuZ2VcblxuY2xhc3MgQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpckFsbG93Rm9yd2FyZGluZ1xuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBBbnlRdW90ZSBleHRlbmRzIEFueVBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIG1lbWJlcjogWydEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljayddXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgICMgUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIF8uZmlyc3QoXy5zb3J0QnkocmFuZ2VzLCAocikgLT4gci5lbmQuY29sdW1uKSkgaWYgcmFuZ2VzLmxlbmd0aFxuXG5jbGFzcyBBQW55UXVvdGUgZXh0ZW5kcyBBbnlRdW90ZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQW55UXVvdGUgZXh0ZW5kcyBBbnlRdW90ZVxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyOiBbJ1wiJywgJ1wiJ11cblxuY2xhc3MgQURvdWJsZVF1b3RlIGV4dGVuZHMgRG91YmxlUXVvdGVcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckRvdWJsZVF1b3RlIGV4dGVuZHMgRG91YmxlUXVvdGVcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2luZ2xlUXVvdGUgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyOiBbXCInXCIsIFwiJ1wiXVxuXG5jbGFzcyBBU2luZ2xlUXVvdGUgZXh0ZW5kcyBTaW5nbGVRdW90ZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyU2luZ2xlUXVvdGUgZXh0ZW5kcyBTaW5nbGVRdW90ZVxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXI6IFsnYCcsICdgJ11cblxuY2xhc3MgQUJhY2tUaWNrIGV4dGVuZHMgQmFja1RpY2tcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckJhY2tUaWNrIGV4dGVuZHMgQmFja1RpY2tcbiAgQGV4dGVuZCgpXG5cbiMgUGFpciBleHBhbmRzIG11bHRpLWxpbmVzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEN1cmx5QnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWyd7JywgJ30nXVxuXG5jbGFzcyBBQ3VybHlCcmFja2V0IGV4dGVuZHMgQ3VybHlCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDdXJseUJyYWNrZXQgZXh0ZW5kcyBDdXJseUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5jbGFzcyBBQ3VybHlCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ3VybHlCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDdXJseUJyYWNrZXRBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBDdXJseUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWydbJywgJ10nXVxuXG5jbGFzcyBBU3F1YXJlQnJhY2tldCBleHRlbmRzIFNxdWFyZUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBTcXVhcmVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgQVNxdWFyZUJyYWNrZXRBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBTcXVhcmVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJTcXVhcmVCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgU3F1YXJlQnJhY2tldFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWycoJywgJyknXVxuXG5jbGFzcyBBUGFyZW50aGVzaXMgZXh0ZW5kcyBQYXJlbnRoZXNpc1xuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyUGFyZW50aGVzaXMgZXh0ZW5kcyBQYXJlbnRoZXNpc1xuICBAZXh0ZW5kKClcbmNsYXNzIEFQYXJlbnRoZXNpc0FsbG93Rm9yd2FyZGluZyBleHRlbmRzIFBhcmVudGhlc2lzXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJQYXJlbnRoZXNpc0FsbG93Rm9yd2FyZGluZyBleHRlbmRzIFBhcmVudGhlc2lzXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEFuZ2xlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWyc8JywgJz4nXVxuXG5jbGFzcyBBQW5nbGVCcmFja2V0IGV4dGVuZHMgQW5nbGVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJBbmdsZUJyYWNrZXQgZXh0ZW5kcyBBbmdsZUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5jbGFzcyBBQW5nbGVCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW5nbGVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJBbmdsZUJyYWNrZXRBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbmdsZUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5cbiMgVGFnXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRhZyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dOZXh0TGluZTogdHJ1ZVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZTogZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50OiAoZnJvbSkgLT5cbiAgICB0YWdSYW5nZSA9IG51bGxcbiAgICBwYXR0ZXJuID0gVGFnRmluZGVyOjpwYXR0ZXJuXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbS5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5jb250YWluc1BvaW50KGZyb20sIHRydWUpXG4gICAgICAgIHRhZ1JhbmdlID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAgdGFnUmFuZ2U/LnN0YXJ0XG5cbiAgZ2V0RmluZGVyOiAtPlxuICAgIG5ldyBUYWdGaW5kZXIoQGVkaXRvciwge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZ30pXG5cbiAgZ2V0UGFpckluZm86IChmcm9tKSAtPlxuICAgIHN1cGVyKEBnZXRUYWdTdGFydFBvaW50KGZyb20pID8gZnJvbSlcblxuY2xhc3MgQVRhZyBleHRlbmRzIFRhZ1xuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyVGFnIGV4dGVuZHMgVGFnXG4gIEBleHRlbmQoKVxuXG4jIFBhcmFncmFwaFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgc3VwcG9ydENvdW50OiB0cnVlXG5cbiAgZmluZFJvdzogKGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIC0+XG4gICAgZm4ucmVzZXQ/KClcbiAgICBmb3VuZFJvdyA9IGZyb21Sb3dcbiAgICBmb3Igcm93IGluIGdldEJ1ZmZlclJvd3MoQGVkaXRvciwge3N0YXJ0Um93OiBmcm9tUm93LCBkaXJlY3Rpb259KVxuICAgICAgYnJlYWsgdW5sZXNzIGZuKHJvdywgZGlyZWN0aW9uKVxuICAgICAgZm91bmRSb3cgPSByb3dcblxuICAgIGZvdW5kUm93XG5cbiAgZmluZFJvd1JhbmdlQnk6IChmcm9tUm93LCBmbikgLT5cbiAgICBzdGFydFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICdwcmV2aW91cycsIGZuKVxuICAgIGVuZFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICduZXh0JywgZm4pXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiAgZ2V0UHJlZGljdEZ1bmN0aW9uOiAoZnJvbVJvdywgc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3dSZXN1bHQgPSBAZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbVJvdylcblxuICAgIGlmIEBpc0lubmVyKClcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICBlbHNlXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIGRpcmVjdGlvblRvRXh0ZW5kID0gJ3ByZXZpb3VzJ1xuICAgICAgZWxzZVxuICAgICAgICBkaXJlY3Rpb25Ub0V4dGVuZCA9ICduZXh0J1xuXG4gICAgICBmbGlwID0gZmFsc2VcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIHJlc3VsdCA9IEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICAgICAgaWYgZmxpcFxuICAgICAgICAgIG5vdCByZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIChub3QgcmVzdWx0KSBhbmQgKGRpcmVjdGlvbiBpcyBkaXJlY3Rpb25Ub0V4dGVuZClcbiAgICAgICAgICAgIGZsaXAgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIHJlc3VsdFxuXG4gICAgICBwcmVkaWN0LnJlc2V0ID0gLT5cbiAgICAgICAgZmxpcCA9IGZhbHNlXG4gICAgcHJlZGljdFxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGZyb21Sb3cgPSBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pLnJvd1xuXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgZnJvbVJvdy0tXG4gICAgICBlbHNlXG4gICAgICAgIGZyb21Sb3crK1xuICAgICAgZnJvbVJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIGZyb21Sb3cpXG5cbiAgICByb3dSYW5nZSA9IEBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBAZ2V0UHJlZGljdEZ1bmN0aW9uKGZyb21Sb3csIHNlbGVjdGlvbikpXG4gICAgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24oZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSkpXG5cbmNsYXNzIEFQYXJhZ3JhcGggZXh0ZW5kcyBQYXJhZ3JhcGhcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclBhcmFncmFwaCBleHRlbmRzIFBhcmFncmFwaFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaFxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3cgPSBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pLnJvd1xuXG4gICAgYmFzZUluZGVudExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgZnJvbVJvdylcbiAgICBwcmVkaWN0ID0gKHJvdykgPT5cbiAgICAgIGlmIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICAgIEBpc0EoKVxuICAgICAgZWxzZVxuICAgICAgICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuXG4gICAgcm93UmFuZ2UgPSBAZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcHJlZGljdClcbiAgICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIHJvd1JhbmdlKVxuXG5jbGFzcyBBSW5kZW50YXRpb24gZXh0ZW5kcyBJbmRlbnRhdGlvblxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVySW5kZW50YXRpb24gZXh0ZW5kcyBJbmRlbnRhdGlvblxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRTdGFydFJvdygpXG4gICAgcm93UmFuZ2UgPSBAZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckNvbW1lbnRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgcm93UmFuZ2UgPz0gW3Jvdywgcm93XSBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Q29tbWVudGVkKHJvdylcbiAgICBpZiByb3dSYW5nZVxuICAgICAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShzZWxlY3Rpb24uZWRpdG9yLCByb3dSYW5nZSlcblxuY2xhc3MgQUNvbW1lbnQgZXh0ZW5kcyBDb21tZW50XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDb21tZW50IGV4dGVuZHMgQ29tbWVudFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBGb2xkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgYWRqdXN0Um93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICByZXR1cm4gcm93UmFuZ2UgdW5sZXNzIEBpc0lubmVyKClcblxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IHJvd1JhbmdlXG4gICAgc3RhcnRSb3dJbmRlbnRMZXZlbCA9IGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHN0YXJ0Um93KVxuICAgIGVuZFJvd0luZGVudExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgZW5kUm93KVxuICAgIGVuZFJvdyAtPSAxIGlmIChzdGFydFJvd0luZGVudExldmVsIGlzIGVuZFJvd0luZGVudExldmVsKVxuICAgIHN0YXJ0Um93ICs9IDFcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3c6IChyb3cpIC0+XG4gICAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3coQGVkaXRvciwgcm93LCBpbmNsdWRlU3RhcnRSb3c6IHRydWUpLnJldmVyc2UoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvd1JhbmdlcyA9IEBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3coc3dyYXAoc2VsZWN0aW9uKS5nZXRTdGFydFJvdygpKVxuICAgIHJldHVybiB1bmxlc3Mgcm93UmFuZ2VzLmxlbmd0aFxuXG4gICAgcmFuZ2UgPSBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIEBhZGp1c3RSb3dSYW5nZShyb3dSYW5nZXMuc2hpZnQoKSkpXG4gICAgaWYgcm93UmFuZ2VzLmxlbmd0aCBhbmQgcmFuZ2UuaXNFcXVhbChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICAgIHJhbmdlID0gZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCBAYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2VzLnNoaWZ0KCkpKVxuICAgIHJhbmdlXG5cbmNsYXNzIEFGb2xkIGV4dGVuZHMgRm9sZFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyRm9sZCBleHRlbmRzIEZvbGRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBOT1RFOiBGdW5jdGlvbiByYW5nZSBkZXRlcm1pbmF0aW9uIGlzIGRlcGVuZGluZyBvbiBmb2xkLlxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBGb2xkXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgIyBTb21lIGxhbmd1YWdlIGRvbid0IGluY2x1ZGUgY2xvc2luZyBgfWAgaW50byBmb2xkLlxuICBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3c6IFsnc291cmNlLmdvJywgJ3NvdXJjZS5lbGl4aXInXVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdzogKHJvdykgLT5cbiAgICByb3dSYW5nZXMgPSBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyhAZWRpdG9yLCByb3cpPy5yZXZlcnNlKClcbiAgICByb3dSYW5nZXM/LmZpbHRlciAocm93UmFuZ2UpID0+XG4gICAgICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KEBlZGl0b3IsIHJvd1JhbmdlWzBdKVxuXG4gIGFkanVzdFJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gc3VwZXJcbiAgICBpZiBAaXNBKCkgYW5kIEBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSBpbiBAc2NvcGVOYW1lc09taXR0aW5nRW5kUm93XG4gICAgICBlbmRSb3cgKz0gMVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG5jbGFzcyBBRnVuY3Rpb24gZXh0ZW5kcyBGdW5jdGlvblxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyRnVuY3Rpb24gZXh0ZW5kcyBGdW5jdGlvblxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDdXJyZW50TGluZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gQGdldE5vcm1hbGl6ZWRIZWFkQnVmZmVyUG9zaXRpb24oc2VsZWN0aW9uKS5yb3dcbiAgICByYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIGlmIEBpc0EoKVxuICAgICAgcmFuZ2VcbiAgICBlbHNlXG4gICAgICB0cmltUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbmNsYXNzIEFDdXJyZW50TGluZSBleHRlbmRzIEN1cnJlbnRMaW5lXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDdXJyZW50TGluZSBleHRlbmRzIEN1cnJlbnRMaW5lXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAc3RvcFNlbGVjdGlvbigpXG4gICAgQGVkaXRvci5idWZmZXIuZ2V0UmFuZ2UoKVxuXG5jbGFzcyBBRW50aXJlIGV4dGVuZHMgRW50aXJlXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJFbnRpcmUgZXh0ZW5kcyBFbnRpcmVcbiAgQGV4dGVuZCgpXG5jbGFzcyBBbGwgZXh0ZW5kcyBFbnRpcmUgIyBBbGlhcyBhcyBhY2Nlc3NpYmxlIG5hbWVcbiAgQGV4dGVuZChmYWxzZSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIGdldFJhbmdlOiAtPlxuICAgIEBzdG9wU2VsZWN0aW9uKClcbiAgICBAdmltU3RhdGUubWFyay5nZXRSYW5nZSgnWycsICddJylcblxuY2xhc3MgQUxhdGVzdENoYW5nZSBleHRlbmRzIExhdGVzdENoYW5nZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyTGF0ZXN0Q2hhbmdlIGV4dGVuZHMgTGF0ZXN0Q2hhbmdlICMgTm8gZGlmZiBmcm9tIEFMYXRlc3RDaGFuZ2VcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoTWF0Y2hGb3J3YXJkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmQ6IGZhbHNlXG5cbiAgZmluZE1hdGNoOiAoZnJvbVBvaW50LCBwYXR0ZXJuKSAtPlxuICAgIGZyb21Qb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBmcm9tUG9pbnQsIFwiZm9yd2FyZFwiKSBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAge3JhbmdlOiBmb3VuZCwgd2hpY2hJc0hlYWQ6ICdlbmQnfVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHBhdHRlcm4gPSBAZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpXG4gICAgcmV0dXJuIHVubGVzcyBwYXR0ZXJuP1xuXG4gICAgZnJvbVBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAge3JhbmdlLCB3aGljaElzSGVhZH0gPSBAZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybilcbiAgICBpZiByYW5nZT9cbiAgICAgIEB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZClcblxuICB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZTogKHNlbGVjdGlvbiwgZm91bmQsIHdoaWNoSXNIZWFkKSAtPlxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGZvdW5kXG4gICAgZWxzZVxuICAgICAgaGVhZCA9IGZvdW5kW3doaWNoSXNIZWFkXVxuICAgICAgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBpZiBAYmFja3dhcmRcbiAgICAgICAgaGVhZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBoZWFkLCAnZm9yd2FyZCcpIGlmIHRhaWwuaXNMZXNzVGhhbihoZWFkKVxuICAgICAgZWxzZVxuICAgICAgICBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGhlYWQsICdiYWNrd2FyZCcpIGlmIGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuXG4gICAgICBAcmV2ZXJzZWQgPSBoZWFkLmlzTGVzc1RoYW4odGFpbClcbiAgICAgIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbihzd3JhcChzZWxlY3Rpb24pLmdldFRhaWxCdWZmZXJSYW5nZSgpKVxuXG4gIHNlbGVjdFRleHRPYmplY3Q6IChzZWxlY3Rpb24pIC0+XG4gICAgcmV0dXJuIHVubGVzcyByYW5nZSA9IEBnZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkOiBAcmV2ZXJzZWQgPyBAYmFja3dhcmR9KVxuICAgIHNlbGVjdGlvbi5jdXJzb3IuYXV0b3Njcm9sbCgpXG4gICAgdHJ1ZVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZDogdHJ1ZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImJhY2t3YXJkXCIpIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG4gICAgZm91bmQgPSBudWxsXG4gICAgQHNjYW5CYWNrd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIEluZmluaXR5XX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAge3JhbmdlOiBmb3VuZCwgd2hpY2hJc0hlYWQ6ICdzdGFydCd9XG5cbiMgW0xpbWl0YXRpb246IHdvbid0IGZpeF06IFNlbGVjdGVkIHJhbmdlIGlzIG5vdCBzdWJtb2RlIGF3YXJlLiBhbHdheXMgY2hhcmFjdGVyd2lzZS5cbiMgU28gZXZlbiBpZiBvcmlnaW5hbCBzZWxlY3Rpb24gd2FzIHZMIG9yIHZCLCBzZWxlY3RlZCByYW5nZSBieSB0aGlzIHRleHQtb2JqZWN0XG4jIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKClcblxuICBzZWxlY3Q6IC0+XG4gICAge3Byb3BlcnRpZXMsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgcHJvcGVydGllcz8gYW5kIHN1Ym1vZGU/XG4gICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcywga2VlcEdvYWxDb2x1bW46IGZhbHNlKVxuICAgICAgQHdpc2UgPSBzdWJtb2RlXG5cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgc2VsZWN0OiAtPlxuICAgIHtwZXJzaXN0ZW50U2VsZWN0aW9ufSA9IEB2aW1TdGF0ZVxuICAgIHVubGVzcyBwZXJzaXN0ZW50U2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbi5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgICBAd2lzZSA9IHN3cmFwLmRldGVjdFdpc2UoQGVkaXRvcilcblxuY2xhc3MgQVBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBQZXJzaXN0ZW50U2VsZWN0aW9uXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgUGVyc2lzdGVudFNlbGVjdGlvblxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBWaXNpYmxlQXJlYSBleHRlbmRzIFRleHRPYmplY3QgIyA4MjIgdG8gODYzXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgQHN0b3BTZWxlY3Rpb24oKVxuICAgICMgW0JVRz9dIE5lZWQgdHJhbnNsYXRlIHRvIHNoaWxuayB0b3AgYW5kIGJvdHRvbSB0byBmaXQgYWN0dWFsIHJvdy5cbiAgICAjIFRoZSByZWFzb24gSSBuZWVkIC0yIGF0IGJvdHRvbSBpcyBiZWNhdXNlIG9mIHN0YXR1cyBiYXI/XG4gICAgYnVmZmVyUmFuZ2UgPSBnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvcilcbiAgICBpZiBidWZmZXJSYW5nZS5nZXRSb3dzKCkgPiBAZWRpdG9yLmdldFJvd3NQZXJQYWdlKClcbiAgICAgIGJ1ZmZlclJhbmdlLnRyYW5zbGF0ZShbKzEsIDBdLCBbLTMsIDBdKVxuICAgIGVsc2VcbiAgICAgIGJ1ZmZlclJhbmdlXG5cbmNsYXNzIEFWaXNpYmxlQXJlYSBleHRlbmRzIFZpc2libGVBcmVhXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJWaXNpYmxlQXJlYSBleHRlbmRzIFZpc2libGVBcmVhXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgW0ZJWE1FXSB3aXNlIG1pc21hdGNoIHNjZWVuUG9zaXRpb24gdnMgYnVmZmVyUG9zaXRpb25cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBmcm9tUG9pbnQgPSBAZ2V0Tm9ybWFsaXplZEhlYWRTY3JlZW5Qb3NpdGlvbihzZWxlY3Rpb24pXG5cbiAgICBtb3ZlVXBUb0VkZ2UgPSBAbmV3KCdNb3ZlVXBUb0VkZ2UnKVxuICAgIG1vdmVEb3duVG9FZGdlID0gQG5ldygnTW92ZURvd25Ub0VkZ2UnKVxuICAgIHJldHVybiB1bmxlc3MgbW92ZVVwVG9FZGdlLmlzU3RvcHBhYmxlUG9pbnQoZnJvbVBvaW50KVxuXG4gICAgc3RhcnRTY3JlZW5Qb2ludCA9IGVuZFNjcmVlblBvaW50ID0gbnVsbFxuICAgIHN0YXJ0U2NyZWVuUG9pbnQgPSBlbmRTY3JlZW5Qb2ludCA9IGZyb21Qb2ludCBpZiBtb3ZlVXBUb0VkZ2UuaXNFZGdlKGZyb21Qb2ludClcblxuICAgIGlmIG1vdmVVcFRvRWRnZS5pc1N0b3BwYWJsZVBvaW50KGZyb21Qb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpXG4gICAgICBzdGFydFNjcmVlblBvaW50ID0gbW92ZVVwVG9FZGdlLmdldFBvaW50KGZyb21Qb2ludClcblxuICAgIGlmIG1vdmVEb3duVG9FZGdlLmlzU3RvcHBhYmxlUG9pbnQoZnJvbVBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSlcbiAgICAgIGVuZFNjcmVlblBvaW50ID0gbW92ZURvd25Ub0VkZ2UuZ2V0UG9pbnQoZnJvbVBvaW50KVxuXG4gICAgaWYgc3RhcnRTY3JlZW5Qb2ludD8gYW5kIGVuZFNjcmVlblBvaW50P1xuICAgICAgc2NyZWVuUmFuZ2UgPSBuZXcgUmFuZ2Uoc3RhcnRTY3JlZW5Qb2ludCwgZW5kU2NyZWVuUG9pbnQpXG4gICAgICByYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShzY3JlZW5SYW5nZSlcbiAgICAgIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGVkaXRvciwgW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd10pXG5cbmNsYXNzIEFFZGdlIGV4dGVuZHMgRWRnZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyRWRnZSBleHRlbmRzIEVkZ2VcbiAgQGV4dGVuZCgpXG4iXX0=
