(function() {
  var CompositeDisposable, Emitter, SearchModel, getIndex, getVisibleBufferRange, hoverCounterTimeoutID, ref, ref1, smartScrollToBufferPosition;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getVisibleBufferRange = ref1.getVisibleBufferRange, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, getIndex = ref1.getIndex;

  hoverCounterTimeoutID = null;

  module.exports = SearchModel = (function() {
    SearchModel.prototype.relativeIndex = 0;

    SearchModel.prototype.lastRelativeIndex = null;

    SearchModel.prototype.onDidChangeCurrentMatch = function(fn) {
      return this.emitter.on('did-change-current-match', fn);
    };

    function SearchModel(vimState, options) {
      var ref2;
      this.vimState = vimState;
      this.options = options;
      this.emitter = new Emitter;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.editorElement.onDidChangeScrollTop(this.refreshMarkers.bind(this)));
      this.disposables.add(this.editorElement.onDidChangeScrollLeft(this.refreshMarkers.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.decoationByRange = {};
      this.onDidChangeCurrentMatch((function(_this) {
        return function() {
          var classList, point, text, timeout;
          _this.vimState.hoverSearchCounter.reset();
          if (_this.currentMatch == null) {
            if (_this.vimState.getConfig('flashScreenOnSearchHasNoMatch')) {
              _this.vimState.flash(getVisibleBufferRange(_this.editor), {
                type: 'screen'
              });
              atom.beep();
            }
            return;
          }
          if (_this.vimState.getConfig('showHoverSearchCounter')) {
            text = String(_this.currentMatchIndex + 1) + '/' + _this.matches.length;
            point = _this.currentMatch.start;
            classList = _this.classNamesForRange(_this.currentMatch);
            _this.resetHover();
            _this.vimState.hoverSearchCounter.set(text, point, {
              classList: classList
            });
            if (!_this.options.incrementalSearch) {
              timeout = _this.vimState.getConfig('showHoverSearchCounterDuration');
              hoverCounterTimeoutID = setTimeout(_this.resetHover.bind(_this), timeout);
            }
          }
          _this.editor.unfoldBufferRow(_this.currentMatch.start.row);
          smartScrollToBufferPosition(_this.editor, _this.currentMatch.start);
          if (_this.vimState.getConfig('flashOnSearch')) {
            return _this.vimState.flash(_this.currentMatch, {
              type: 'search'
            });
          }
        };
      })(this));
    }

    SearchModel.prototype.resetHover = function() {
      var ref2;
      if (hoverCounterTimeoutID != null) {
        clearTimeout(hoverCounterTimeoutID);
        hoverCounterTimeoutID = null;
      }
      return (ref2 = this.vimState.hoverSearchCounter) != null ? ref2.reset() : void 0;
    };

    SearchModel.prototype.destroy = function() {
      this.markerLayer.destroy();
      this.disposables.dispose();
      return this.decoationByRange = null;
    };

    SearchModel.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.decoationByRange = {};
    };

    SearchModel.prototype.classNamesForRange = function(range) {
      var classNames;
      classNames = [];
      if (range === this.firstMatch) {
        classNames.push('first');
      } else if (range === this.lastMatch) {
        classNames.push('last');
      }
      if (range === this.currentMatch) {
        classNames.push('current');
      }
      return classNames;
    };

    SearchModel.prototype.refreshMarkers = function() {
      var i, len, range, ref2, results;
      this.clearMarkers();
      ref2 = this.getVisibleMatchRanges();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        range = ref2[i];
        results.push(this.decoationByRange[range.toString()] = this.decorateRange(range));
      }
      return results;
    };

    SearchModel.prototype.getVisibleMatchRanges = function() {
      var visibleMatchRanges, visibleRange;
      visibleRange = getVisibleBufferRange(this.editor);
      return visibleMatchRanges = this.matches.filter(function(range) {
        return range.intersectsWith(visibleRange);
      });
    };

    SearchModel.prototype.decorateRange = function(range) {
      var classNames, ref2;
      classNames = this.classNamesForRange(range);
      classNames = (ref2 = ['vim-mode-plus-search-match']).concat.apply(ref2, classNames);
      return this.editor.decorateMarker(this.markerLayer.markBufferRange(range), {
        type: 'highlight',
        "class": classNames.join(' ')
      });
    };

    SearchModel.prototype.search = function(fromPoint, pattern, relativeIndex) {
      var currentMatch, i, j, len, range, ref2, ref3, ref4;
      this.pattern = pattern;
      this.matches = [];
      this.editor.scan(this.pattern, (function(_this) {
        return function(arg) {
          var range;
          range = arg.range;
          return _this.matches.push(range);
        };
      })(this));
      ref2 = this.matches, this.firstMatch = ref2[0], this.lastMatch = ref2[ref2.length - 1];
      currentMatch = null;
      if (relativeIndex >= 0) {
        ref3 = this.matches;
        for (i = 0, len = ref3.length; i < len; i++) {
          range = ref3[i];
          if (!(range.start.isGreaterThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.firstMatch;
        }
        relativeIndex--;
      } else {
        ref4 = this.matches;
        for (j = ref4.length - 1; j >= 0; j += -1) {
          range = ref4[j];
          if (!(range.start.isLessThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.lastMatch;
        }
        relativeIndex++;
      }
      this.currentMatchIndex = this.matches.indexOf(currentMatch);
      this.updateCurrentMatch(relativeIndex);
      if (this.options.incrementalSearch) {
        this.refreshMarkers();
      }
      this.initialCurrentMatchIndex = this.currentMatchIndex;
      return this.currentMatch;
    };

    SearchModel.prototype.updateCurrentMatch = function(relativeIndex) {
      this.currentMatchIndex = getIndex(this.currentMatchIndex + relativeIndex, this.matches);
      this.currentMatch = this.matches[this.currentMatchIndex];
      return this.emitter.emit('did-change-current-match');
    };

    SearchModel.prototype.visit = function(relativeIndex) {
      var newClass, newDecoration, oldClass, oldDecoration, ref2;
      if (relativeIndex == null) {
        relativeIndex = null;
      }
      if (relativeIndex != null) {
        this.lastRelativeIndex = relativeIndex;
      } else {
        relativeIndex = (ref2 = this.lastRelativeIndex) != null ? ref2 : +1;
      }
      if (!this.matches.length) {
        return;
      }
      oldDecoration = this.decoationByRange[this.currentMatch.toString()];
      this.updateCurrentMatch(relativeIndex);
      newDecoration = this.decoationByRange[this.currentMatch.toString()];
      if (oldDecoration != null) {
        oldClass = oldDecoration.getProperties()["class"];
        oldClass = oldClass.replace(/\s+current(\s+)?$/, '$1');
        oldDecoration.setProperties({
          type: 'highlight',
          "class": oldClass
        });
      }
      if (newDecoration != null) {
        newClass = newDecoration.getProperties()["class"];
        newClass = newClass.replace(/\s+current(\s+)?$/, '$1');
        newClass += ' current';
        return newDecoration.setProperties({
          type: 'highlight',
          "class": newClass
        });
      }
    };

    SearchModel.prototype.getRelativeIndex = function() {
      return this.currentMatchIndex - this.initialCurrentMatchIndex;
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtbW9kZWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBQ1YsT0FJSSxPQUFBLENBQVEsU0FBUixDQUpKLEVBQ0Usa0RBREYsRUFFRSw4REFGRixFQUdFOztFQUdGLHFCQUFBLEdBQXdCOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNOzBCQUNKLGFBQUEsR0FBZTs7MEJBQ2YsaUJBQUEsR0FBbUI7OzBCQUNuQix1QkFBQSxHQUF5QixTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSwwQkFBWixFQUF3QyxFQUF4QztJQUFSOztJQUVaLHFCQUFDLFFBQUQsRUFBWSxPQUFaO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQVcsSUFBQyxDQUFBLFVBQUQ7TUFDdkIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxvQkFBZixDQUFvQyxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCLENBQXBDLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxhQUFhLENBQUMscUJBQWYsQ0FBcUMsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUFyQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7TUFFcEIsSUFBQyxDQUFBLHVCQUFELENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUN2QixjQUFBO1VBQUEsS0FBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUE3QixDQUFBO1VBQ0EsSUFBTywwQkFBUDtZQUNFLElBQUcsS0FBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLCtCQUFwQixDQUFIO2NBQ0UsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLHFCQUFBLENBQXNCLEtBQUMsQ0FBQSxNQUF2QixDQUFoQixFQUFnRDtnQkFBQSxJQUFBLEVBQU0sUUFBTjtlQUFoRDtjQUNBLElBQUksQ0FBQyxJQUFMLENBQUEsRUFGRjs7QUFHQSxtQkFKRjs7VUFNQSxJQUFHLEtBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQix3QkFBcEIsQ0FBSDtZQUNFLElBQUEsR0FBTyxNQUFBLENBQU8sS0FBQyxDQUFBLGlCQUFELEdBQXFCLENBQTVCLENBQUEsR0FBaUMsR0FBakMsR0FBdUMsS0FBQyxDQUFBLE9BQU8sQ0FBQztZQUN2RCxLQUFBLEdBQVEsS0FBQyxDQUFBLFlBQVksQ0FBQztZQUN0QixTQUFBLEdBQVksS0FBQyxDQUFBLGtCQUFELENBQW9CLEtBQUMsQ0FBQSxZQUFyQjtZQUVaLEtBQUMsQ0FBQSxVQUFELENBQUE7WUFDQSxLQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQTdCLENBQWlDLElBQWpDLEVBQXVDLEtBQXZDLEVBQThDO2NBQUMsV0FBQSxTQUFEO2FBQTlDO1lBRUEsSUFBQSxDQUFPLEtBQUMsQ0FBQSxPQUFPLENBQUMsaUJBQWhCO2NBQ0UsT0FBQSxHQUFVLEtBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixnQ0FBcEI7Y0FDVixxQkFBQSxHQUF3QixVQUFBLENBQVcsS0FBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLEtBQWpCLENBQVgsRUFBbUMsT0FBbkMsRUFGMUI7YUFSRjs7VUFZQSxLQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsS0FBQyxDQUFBLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBNUM7VUFDQSwyQkFBQSxDQUE0QixLQUFDLENBQUEsTUFBN0IsRUFBcUMsS0FBQyxDQUFBLFlBQVksQ0FBQyxLQUFuRDtVQUVBLElBQUcsS0FBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGVBQXBCLENBQUg7bUJBQ0UsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLEtBQUMsQ0FBQSxZQUFqQixFQUErQjtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQS9CLEVBREY7O1FBdkJ1QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7SUFWVzs7MEJBb0NiLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLElBQUcsNkJBQUg7UUFDRSxZQUFBLENBQWEscUJBQWI7UUFDQSxxQkFBQSxHQUF3QixLQUYxQjs7cUVBTTRCLENBQUUsS0FBOUIsQ0FBQTtJQVBVOzswQkFTWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFIYjs7MEJBS1QsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQUZSOzswQkFJZCxrQkFBQSxHQUFvQixTQUFDLEtBQUQ7QUFDbEIsVUFBQTtNQUFBLFVBQUEsR0FBYTtNQUNiLElBQUcsS0FBQSxLQUFTLElBQUMsQ0FBQSxVQUFiO1FBQ0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsT0FBaEIsRUFERjtPQUFBLE1BRUssSUFBRyxLQUFBLEtBQVMsSUFBQyxDQUFBLFNBQWI7UUFDSCxVQUFVLENBQUMsSUFBWCxDQUFnQixNQUFoQixFQURHOztNQUdMLElBQUcsS0FBQSxLQUFTLElBQUMsQ0FBQSxZQUFiO1FBQ0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBaEIsRUFERjs7YUFHQTtJQVZrQjs7MEJBWXBCLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBO0FBQ0E7QUFBQTtXQUFBLHNDQUFBOztxQkFDRSxJQUFDLENBQUEsZ0JBQWlCLENBQUEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFBLENBQWxCLEdBQXNDLElBQUMsQ0FBQSxhQUFELENBQWUsS0FBZjtBQUR4Qzs7SUFGYzs7MEJBS2hCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtNQUFBLFlBQUEsR0FBZSxxQkFBQSxDQUFzQixJQUFDLENBQUEsTUFBdkI7YUFDZixrQkFBQSxHQUFxQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsU0FBQyxLQUFEO2VBQ25DLEtBQUssQ0FBQyxjQUFOLENBQXFCLFlBQXJCO01BRG1DLENBQWhCO0lBRkE7OzBCQUt2QixhQUFBLEdBQWUsU0FBQyxLQUFEO0FBQ2IsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsS0FBcEI7TUFDYixVQUFBLEdBQWEsUUFBQSxDQUFDLDRCQUFELENBQUEsQ0FBOEIsQ0FBQyxNQUEvQixhQUFzQyxVQUF0QzthQUNiLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0IsQ0FBdkIsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFVLENBQUMsSUFBWCxDQUFnQixHQUFoQixDQURQO09BREY7SUFIYTs7MEJBT2YsTUFBQSxHQUFRLFNBQUMsU0FBRCxFQUFZLE9BQVosRUFBc0IsYUFBdEI7QUFDTixVQUFBO01BRGtCLElBQUMsQ0FBQSxVQUFEO01BQ2xCLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsT0FBZCxFQUF1QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNyQixjQUFBO1VBRHVCLFFBQUQ7aUJBQ3RCLEtBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEtBQWQ7UUFEcUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO01BR0EsT0FBaUMsSUFBQyxDQUFBLE9BQWxDLEVBQUMsSUFBQyxDQUFBLG9CQUFGLEVBQW1CLElBQUMsQ0FBQTtNQUVwQixZQUFBLEdBQWU7TUFDZixJQUFHLGFBQUEsSUFBaUIsQ0FBcEI7QUFDRTtBQUFBLGFBQUEsc0NBQUE7O2dCQUEyQixLQUFLLENBQUMsS0FBSyxDQUFDLGFBQVosQ0FBMEIsU0FBMUI7OztVQUN6QixZQUFBLEdBQWU7QUFDZjtBQUZGOztVQUdBLGVBQWdCLElBQUMsQ0FBQTs7UUFDakIsYUFBQSxHQUxGO09BQUEsTUFBQTtBQU9FO0FBQUEsYUFBQSxvQ0FBQTs7Z0JBQWlDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixDQUF1QixTQUF2Qjs7O1VBQy9CLFlBQUEsR0FBZTtBQUNmO0FBRkY7O1VBR0EsZUFBZ0IsSUFBQyxDQUFBOztRQUNqQixhQUFBLEdBWEY7O01BYUEsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixZQUFqQjtNQUNyQixJQUFDLENBQUEsa0JBQUQsQ0FBb0IsYUFBcEI7TUFDQSxJQUFHLElBQUMsQ0FBQSxPQUFPLENBQUMsaUJBQVo7UUFDRSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBREY7O01BRUEsSUFBQyxDQUFBLHdCQUFELEdBQTRCLElBQUMsQ0FBQTthQUM3QixJQUFDLENBQUE7SUExQks7OzBCQTRCUixrQkFBQSxHQUFvQixTQUFDLGFBQUQ7TUFDbEIsSUFBQyxDQUFBLGlCQUFELEdBQXFCLFFBQUEsQ0FBUyxJQUFDLENBQUEsaUJBQUQsR0FBcUIsYUFBOUIsRUFBNkMsSUFBQyxDQUFBLE9BQTlDO01BQ3JCLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQyxDQUFBLGlCQUFEO2FBQ3pCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLDBCQUFkO0lBSGtCOzswQkFLcEIsS0FBQSxHQUFPLFNBQUMsYUFBRDtBQUNMLFVBQUE7O1FBRE0sZ0JBQWM7O01BQ3BCLElBQUcscUJBQUg7UUFDRSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsY0FEdkI7T0FBQSxNQUFBO1FBR0UsYUFBQSxvREFBcUMsQ0FBQyxFQUh4Qzs7TUFLQSxJQUFBLENBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUF2QjtBQUFBLGVBQUE7O01BQ0EsYUFBQSxHQUFnQixJQUFDLENBQUEsZ0JBQWlCLENBQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxRQUFkLENBQUEsQ0FBQTtNQUNsQyxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsYUFBcEI7TUFDQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxnQkFBaUIsQ0FBQSxJQUFDLENBQUEsWUFBWSxDQUFDLFFBQWQsQ0FBQSxDQUFBO01BRWxDLElBQUcscUJBQUg7UUFDRSxRQUFBLEdBQVcsYUFBYSxDQUFDLGFBQWQsQ0FBQSxDQUE2QixFQUFDLEtBQUQ7UUFDeEMsUUFBQSxHQUFXLFFBQVEsQ0FBQyxPQUFULENBQWlCLG1CQUFqQixFQUFzQyxJQUF0QztRQUNYLGFBQWEsQ0FBQyxhQUFkLENBQTRCO1VBQUEsSUFBQSxFQUFNLFdBQU47VUFBbUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUExQjtTQUE1QixFQUhGOztNQUtBLElBQUcscUJBQUg7UUFDRSxRQUFBLEdBQVcsYUFBYSxDQUFDLGFBQWQsQ0FBQSxDQUE2QixFQUFDLEtBQUQ7UUFDeEMsUUFBQSxHQUFXLFFBQVEsQ0FBQyxPQUFULENBQWlCLG1CQUFqQixFQUFzQyxJQUF0QztRQUNYLFFBQUEsSUFBWTtlQUNaLGFBQWEsQ0FBQyxhQUFkLENBQTRCO1VBQUEsSUFBQSxFQUFNLFdBQU47VUFBbUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUExQjtTQUE1QixFQUpGOztJQWhCSzs7MEJBc0JQLGdCQUFBLEdBQWtCLFNBQUE7YUFDaEIsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUMsQ0FBQTtJQUROOzs7OztBQXpKcEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue1xuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIGdldEluZGV4XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuaG92ZXJDb3VudGVyVGltZW91dElEID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWFyY2hNb2RlbFxuICByZWxhdGl2ZUluZGV4OiAwXG4gIGxhc3RSZWxhdGl2ZUluZGV4OiBudWxsXG4gIG9uRGlkQ2hhbmdlQ3VycmVudE1hdGNoOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLWN1cnJlbnQtbWF0Y2gnLCBmblxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlLCBAb3B0aW9ucykgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkKEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKEByZWZyZXNoTWFya2Vycy5iaW5kKHRoaXMpKSlcbiAgICBAZGlzcG9zYWJsZXMuYWRkKEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChAcmVmcmVzaE1hcmtlcnMuYmluZCh0aGlzKSkpXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQGRlY29hdGlvbkJ5UmFuZ2UgPSB7fVxuXG4gICAgQG9uRGlkQ2hhbmdlQ3VycmVudE1hdGNoID0+XG4gICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICAgIHVubGVzcyBAY3VycmVudE1hdGNoP1xuICAgICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdmbGFzaFNjcmVlbk9uU2VhcmNoSGFzTm9NYXRjaCcpXG4gICAgICAgICAgQHZpbVN0YXRlLmZsYXNoKGdldFZpc2libGVCdWZmZXJSYW5nZShAZWRpdG9yKSwgdHlwZTogJ3NjcmVlbicpXG4gICAgICAgICAgYXRvbS5iZWVwKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3Nob3dIb3ZlclNlYXJjaENvdW50ZXInKVxuICAgICAgICB0ZXh0ID0gU3RyaW5nKEBjdXJyZW50TWF0Y2hJbmRleCArIDEpICsgJy8nICsgQG1hdGNoZXMubGVuZ3RoXG4gICAgICAgIHBvaW50ID0gQGN1cnJlbnRNYXRjaC5zdGFydFxuICAgICAgICBjbGFzc0xpc3QgPSBAY2xhc3NOYW1lc0ZvclJhbmdlKEBjdXJyZW50TWF0Y2gpXG5cbiAgICAgICAgQHJlc2V0SG92ZXIoKVxuICAgICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnNldCh0ZXh0LCBwb2ludCwge2NsYXNzTGlzdH0pXG5cbiAgICAgICAgdW5sZXNzIEBvcHRpb25zLmluY3JlbWVudGFsU2VhcmNoXG4gICAgICAgICAgdGltZW91dCA9IEB2aW1TdGF0ZS5nZXRDb25maWcoJ3Nob3dIb3ZlclNlYXJjaENvdW50ZXJEdXJhdGlvbicpXG4gICAgICAgICAgaG92ZXJDb3VudGVyVGltZW91dElEID0gc2V0VGltZW91dChAcmVzZXRIb3Zlci5iaW5kKHRoaXMpLCB0aW1lb3V0KVxuXG4gICAgICBAZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhAY3VycmVudE1hdGNoLnN0YXJ0LnJvdylcbiAgICAgIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBAY3VycmVudE1hdGNoLnN0YXJ0KVxuXG4gICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdmbGFzaE9uU2VhcmNoJylcbiAgICAgICAgQHZpbVN0YXRlLmZsYXNoKEBjdXJyZW50TWF0Y2gsIHR5cGU6ICdzZWFyY2gnKVxuXG4gIHJlc2V0SG92ZXI6IC0+XG4gICAgaWYgaG92ZXJDb3VudGVyVGltZW91dElEP1xuICAgICAgY2xlYXJUaW1lb3V0KGhvdmVyQ291bnRlclRpbWVvdXRJRClcbiAgICAgIGhvdmVyQ291bnRlclRpbWVvdXRJRCA9IG51bGxcbiAgICAjIFNlZSAjNjc0XG4gICAgIyBUaGlzIG1ldGhvZCBjYWxsZWQgd2l0aCBzZXRUaW1lb3V0XG4gICAgIyBob3ZlclNlYXJjaENvdW50ZXIgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSB3aGVuIGVkaXRvciBkZXN0cm95ZWQuXG4gICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlcj8ucmVzZXQoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAZGVjb2F0aW9uQnlSYW5nZSA9IG51bGxcblxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcbiAgICBAZGVjb2F0aW9uQnlSYW5nZSA9IHt9XG5cbiAgY2xhc3NOYW1lc0ZvclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgY2xhc3NOYW1lcyA9IFtdXG4gICAgaWYgcmFuZ2UgaXMgQGZpcnN0TWF0Y2hcbiAgICAgIGNsYXNzTmFtZXMucHVzaCgnZmlyc3QnKVxuICAgIGVsc2UgaWYgcmFuZ2UgaXMgQGxhc3RNYXRjaFxuICAgICAgY2xhc3NOYW1lcy5wdXNoKCdsYXN0JylcblxuICAgIGlmIHJhbmdlIGlzIEBjdXJyZW50TWF0Y2hcbiAgICAgIGNsYXNzTmFtZXMucHVzaCgnY3VycmVudCcpXG5cbiAgICBjbGFzc05hbWVzXG5cbiAgcmVmcmVzaE1hcmtlcnM6IC0+XG4gICAgQGNsZWFyTWFya2VycygpXG4gICAgZm9yIHJhbmdlIGluIEBnZXRWaXNpYmxlTWF0Y2hSYW5nZXMoKVxuICAgICAgQGRlY29hdGlvbkJ5UmFuZ2VbcmFuZ2UudG9TdHJpbmcoKV0gPSBAZGVjb3JhdGVSYW5nZShyYW5nZSlcblxuICBnZXRWaXNpYmxlTWF0Y2hSYW5nZXM6IC0+XG4gICAgdmlzaWJsZVJhbmdlID0gZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKEBlZGl0b3IpXG4gICAgdmlzaWJsZU1hdGNoUmFuZ2VzID0gQG1hdGNoZXMuZmlsdGVyIChyYW5nZSkgLT5cbiAgICAgIHJhbmdlLmludGVyc2VjdHNXaXRoKHZpc2libGVSYW5nZSlcblxuICBkZWNvcmF0ZVJhbmdlOiAocmFuZ2UpIC0+XG4gICAgY2xhc3NOYW1lcyA9IEBjbGFzc05hbWVzRm9yUmFuZ2UocmFuZ2UpXG4gICAgY2xhc3NOYW1lcyA9IFsndmltLW1vZGUtcGx1cy1zZWFyY2gtbWF0Y2gnXS5jb25jYXQoY2xhc3NOYW1lcy4uLilcbiAgICBAZWRpdG9yLmRlY29yYXRlTWFya2VyIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UpLFxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiBjbGFzc05hbWVzLmpvaW4oJyAnKVxuXG4gIHNlYXJjaDogKGZyb21Qb2ludCwgQHBhdHRlcm4sIHJlbGF0aXZlSW5kZXgpIC0+XG4gICAgQG1hdGNoZXMgPSBbXVxuICAgIEBlZGl0b3Iuc2NhbiBAcGF0dGVybiwgKHtyYW5nZX0pID0+XG4gICAgICBAbWF0Y2hlcy5wdXNoKHJhbmdlKVxuXG4gICAgW0BmaXJzdE1hdGNoLCAuLi4sIEBsYXN0TWF0Y2hdID0gQG1hdGNoZXNcblxuICAgIGN1cnJlbnRNYXRjaCA9IG51bGxcbiAgICBpZiByZWxhdGl2ZUluZGV4ID49IDBcbiAgICAgIGZvciByYW5nZSBpbiBAbWF0Y2hlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgICBjdXJyZW50TWF0Y2ggPSByYW5nZVxuICAgICAgICBicmVha1xuICAgICAgY3VycmVudE1hdGNoID89IEBmaXJzdE1hdGNoXG4gICAgICByZWxhdGl2ZUluZGV4LS1cbiAgICBlbHNlXG4gICAgICBmb3IgcmFuZ2UgaW4gQG1hdGNoZXMgYnkgLTEgd2hlbiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgICAgY3VycmVudE1hdGNoID0gcmFuZ2VcbiAgICAgICAgYnJlYWtcbiAgICAgIGN1cnJlbnRNYXRjaCA/PSBAbGFzdE1hdGNoXG4gICAgICByZWxhdGl2ZUluZGV4KytcblxuICAgIEBjdXJyZW50TWF0Y2hJbmRleCA9IEBtYXRjaGVzLmluZGV4T2YoY3VycmVudE1hdGNoKVxuICAgIEB1cGRhdGVDdXJyZW50TWF0Y2gocmVsYXRpdmVJbmRleClcbiAgICBpZiBAb3B0aW9ucy5pbmNyZW1lbnRhbFNlYXJjaFxuICAgICAgQHJlZnJlc2hNYXJrZXJzKClcbiAgICBAaW5pdGlhbEN1cnJlbnRNYXRjaEluZGV4ID0gQGN1cnJlbnRNYXRjaEluZGV4XG4gICAgQGN1cnJlbnRNYXRjaFxuXG4gIHVwZGF0ZUN1cnJlbnRNYXRjaDogKHJlbGF0aXZlSW5kZXgpIC0+XG4gICAgQGN1cnJlbnRNYXRjaEluZGV4ID0gZ2V0SW5kZXgoQGN1cnJlbnRNYXRjaEluZGV4ICsgcmVsYXRpdmVJbmRleCwgQG1hdGNoZXMpXG4gICAgQGN1cnJlbnRNYXRjaCA9IEBtYXRjaGVzW0BjdXJyZW50TWF0Y2hJbmRleF1cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWN1cnJlbnQtbWF0Y2gnKVxuXG4gIHZpc2l0OiAocmVsYXRpdmVJbmRleD1udWxsKSAtPlxuICAgIGlmIHJlbGF0aXZlSW5kZXg/XG4gICAgICBAbGFzdFJlbGF0aXZlSW5kZXggPSByZWxhdGl2ZUluZGV4XG4gICAgZWxzZVxuICAgICAgcmVsYXRpdmVJbmRleCA9IEBsYXN0UmVsYXRpdmVJbmRleCA/ICsxXG5cbiAgICByZXR1cm4gdW5sZXNzIEBtYXRjaGVzLmxlbmd0aFxuICAgIG9sZERlY29yYXRpb24gPSBAZGVjb2F0aW9uQnlSYW5nZVtAY3VycmVudE1hdGNoLnRvU3RyaW5nKCldXG4gICAgQHVwZGF0ZUN1cnJlbnRNYXRjaChyZWxhdGl2ZUluZGV4KVxuICAgIG5ld0RlY29yYXRpb24gPSBAZGVjb2F0aW9uQnlSYW5nZVtAY3VycmVudE1hdGNoLnRvU3RyaW5nKCldXG5cbiAgICBpZiBvbGREZWNvcmF0aW9uP1xuICAgICAgb2xkQ2xhc3MgPSBvbGREZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKS5jbGFzc1xuICAgICAgb2xkQ2xhc3MgPSBvbGRDbGFzcy5yZXBsYWNlKC9cXHMrY3VycmVudChcXHMrKT8kLywgJyQxJylcbiAgICAgIG9sZERlY29yYXRpb24uc2V0UHJvcGVydGllcyh0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IG9sZENsYXNzKVxuXG4gICAgaWYgbmV3RGVjb3JhdGlvbj9cbiAgICAgIG5ld0NsYXNzID0gbmV3RGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkuY2xhc3NcbiAgICAgIG5ld0NsYXNzID0gbmV3Q2xhc3MucmVwbGFjZSgvXFxzK2N1cnJlbnQoXFxzKyk/JC8sICckMScpXG4gICAgICBuZXdDbGFzcyArPSAnIGN1cnJlbnQnXG4gICAgICBuZXdEZWNvcmF0aW9uLnNldFByb3BlcnRpZXModHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBuZXdDbGFzcylcblxuICBnZXRSZWxhdGl2ZUluZGV4OiAtPlxuICAgIEBjdXJyZW50TWF0Y2hJbmRleCAtIEBpbml0aWFsQ3VycmVudE1hdGNoSW5kZXhcbiJdfQ==
