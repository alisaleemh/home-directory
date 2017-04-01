(function() {
  var CompositeDisposable, Emitter, OccurrenceManager, _, collectRangeInBufferRow, isInvalidMarker, ref, ref1, shrinkRangeEndToBeforeNewLine;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), shrinkRangeEndToBeforeNewLine = ref1.shrinkRangeEndToBeforeNewLine, collectRangeInBufferRow = ref1.collectRangeInBufferRow;

  isInvalidMarker = function(marker) {
    return !marker.isValid();
  };

  module.exports = OccurrenceManager = (function() {
    OccurrenceManager.prototype.patterns = null;

    OccurrenceManager.prototype.markerOptions = {
      invalidate: 'inside'
    };

    function OccurrenceManager(vimState) {
      var decorationOptions, ref2;
      this.vimState = vimState;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.emitter = new Emitter;
      this.patterns = [];
      this.markerLayer = this.editor.addMarkerLayer();
      decorationOptions = {
        type: 'highlight',
        "class": "vim-mode-plus-occurrence-base"
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.onDidChangePatterns((function(_this) {
        return function(arg) {
          var occurrenceType, pattern;
          pattern = arg.pattern, occurrenceType = arg.occurrenceType;
          if (pattern) {
            _this.markBufferRangeByPattern(pattern, occurrenceType);
            return _this.updateEditorElement();
          } else {
            return _this.clearMarkers();
          }
        };
      })(this));
      this.markerLayer.onDidUpdate(this.destroyInvalidMarkers.bind(this));
    }

    OccurrenceManager.prototype.markBufferRangeByPattern = function(pattern, occurrenceType) {
      var isSubwordRange, subwordPattern, subwordRangesByRow;
      if (occurrenceType === 'subword') {
        subwordRangesByRow = {};
        subwordPattern = this.editor.getLastCursor().subwordRegExp();
        isSubwordRange = (function(_this) {
          return function(range) {
            var row, subwordRanges;
            row = range.start.row;
            subwordRanges = subwordRangesByRow[row] != null ? subwordRangesByRow[row] : subwordRangesByRow[row] = collectRangeInBufferRow(_this.editor, row, subwordPattern);
            return subwordRanges.some(function(subwordRange) {
              return subwordRange.isEqual(range);
            });
          };
        })(this);
      }
      return this.editor.scan(pattern, (function(_this) {
        return function(arg) {
          var matchText, range;
          range = arg.range, matchText = arg.matchText;
          if (occurrenceType === 'subword') {
            if (!isSubwordRange(range)) {
              return;
            }
          }
          return _this.markerLayer.markBufferRange(range, _this.markerOptions);
        };
      })(this));
    };

    OccurrenceManager.prototype.updateEditorElement = function() {
      return this.editorElement.classList.toggle("has-occurrence", this.hasMarkers());
    };

    OccurrenceManager.prototype.onDidChangePatterns = function(fn) {
      return this.emitter.on('did-change-patterns', fn);
    };

    OccurrenceManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    OccurrenceManager.prototype.hasPatterns = function() {
      return this.patterns.length > 0;
    };

    OccurrenceManager.prototype.resetPatterns = function() {
      this.patterns = [];
      return this.emitter.emit('did-change-patterns', {});
    };

    OccurrenceManager.prototype.addPattern = function(pattern, arg) {
      var occurrenceType, ref2, reset;
      if (pattern == null) {
        pattern = null;
      }
      ref2 = arg != null ? arg : {}, reset = ref2.reset, occurrenceType = ref2.occurrenceType;
      if (reset) {
        this.clearMarkers();
      }
      this.patterns.push(pattern);
      if (occurrenceType == null) {
        occurrenceType = 'base';
      }
      return this.emitter.emit('did-change-patterns', {
        pattern: pattern,
        occurrenceType: occurrenceType
      });
    };

    OccurrenceManager.prototype.saveLastPattern = function(occurrenceType) {
      if (occurrenceType == null) {
        occurrenceType = null;
      }
      this.vimState.globalState.set("lastOccurrencePattern", this.buildPattern());
      return this.vimState.globalState.set("lastOccurrenceType", occurrenceType);
    };

    OccurrenceManager.prototype.buildPattern = function() {
      var source;
      source = this.patterns.map(function(pattern) {
        return pattern.source;
      }).join('|');
      return new RegExp(source, 'g');
    };

    OccurrenceManager.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.updateEditorElement();
    };

    OccurrenceManager.prototype.destroyMarkers = function(markers) {
      var i, len, marker;
      for (i = 0, len = markers.length; i < len; i++) {
        marker = markers[i];
        marker.destroy();
      }
      return this.updateEditorElement();
    };

    OccurrenceManager.prototype.destroyInvalidMarkers = function() {
      return this.destroyMarkers(this.getMarkers().filter(isInvalidMarker));
    };

    OccurrenceManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    OccurrenceManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    OccurrenceManager.prototype.getMarkerBufferRanges = function() {
      return this.markerLayer.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    OccurrenceManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    OccurrenceManager.prototype.getMarkersIntersectsWithRanges = function(ranges, exclusive) {
      var i, len, markers, range, ref2, results;
      if (exclusive == null) {
        exclusive = false;
      }
      results = [];
      ref2 = ranges.map(shrinkRangeEndToBeforeNewLine);
      for (i = 0, len = ref2.length; i < len; i++) {
        range = ref2[i];
        markers = this.markerLayer.findMarkers({
          intersectsBufferRange: range
        }).filter(function(marker) {
          return range.intersectsWith(marker.getBufferRange(), exclusive);
        });
        results.push.apply(results, markers);
      }
      return results;
    };

    OccurrenceManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    OccurrenceManager.prototype.select = function() {
      var isVisualMode, markers, range, ranges;
      isVisualMode = this.vimState.mode === 'visual';
      markers = this.getMarkersIntersectsWithRanges(this.editor.getSelectedBufferRanges(), isVisualMode);
      if (markers.length) {
        ranges = markers.map(function(marker) {
          return marker.getBufferRange();
        });
        this.destroyMarkers(markers);
        if (isVisualMode) {
          this.vimState.modeManager.deactivate();
          this.vimState.submode = null;
        }
        range = this.getRangeForLastSelection(ranges);
        _.remove(ranges, range);
        ranges.push(range);
        this.editor.setSelectedBufferRanges(ranges);
        return true;
      } else {
        return false;
      }
    };

    OccurrenceManager.prototype.getRangeForLastSelection = function(ranges) {
      var i, j, k, len, len1, len2, point, range, rangesStartFromSameRow;
      point = this.vimState.getOriginalCursorPosition();
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        if (range.containsPoint(point)) {
          return range;
        }
      }
      rangesStartFromSameRow = ranges.filter(function(range) {
        return range.start.row === point.row;
      });
      if (rangesStartFromSameRow.length) {
        for (j = 0, len1 = rangesStartFromSameRow.length; j < len1; j++) {
          range = rangesStartFromSameRow[j];
          if (range.start.isGreaterThan(point)) {
            return range;
          }
        }
        return rangesStartFromSameRow[0];
      }
      for (k = 0, len2 = ranges.length; k < len2; k++) {
        range = ranges[k];
        if (range.start.isGreaterThan(point)) {
          return range;
        }
      }
      return ranges[0];
    };

    return OccurrenceManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vY2N1cnJlbmNlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMscUJBQUQsRUFBVTs7RUFFVixPQUdJLE9BQUEsQ0FBUSxTQUFSLENBSEosRUFDRSxrRUFERixFQUVFOztFQUdGLGVBQUEsR0FBa0IsU0FBQyxNQUFEO1dBQVksQ0FBSSxNQUFNLENBQUMsT0FBUCxDQUFBO0VBQWhCOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUNNO2dDQUNKLFFBQUEsR0FBVTs7Z0NBQ1YsYUFBQSxHQUFlO01BQUMsVUFBQSxFQUFZLFFBQWI7OztJQUVGLDJCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFFWixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsaUJBQUEsR0FBb0I7UUFBQyxJQUFBLEVBQU0sV0FBUDtRQUFvQixDQUFBLEtBQUEsQ0FBQSxFQUFPLCtCQUEzQjs7TUFDcEIsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsaUJBQTFDO01BS25CLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNuQixjQUFBO1VBRHFCLHVCQUFTO1VBQzlCLElBQUcsT0FBSDtZQUNFLEtBQUMsQ0FBQSx3QkFBRCxDQUEwQixPQUExQixFQUFtQyxjQUFuQzttQkFDQSxLQUFDLENBQUEsbUJBQUQsQ0FBQSxFQUZGO1dBQUEsTUFBQTttQkFJRSxLQUFDLENBQUEsWUFBRCxDQUFBLEVBSkY7O1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQU9BLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixJQUFDLENBQUEscUJBQXFCLENBQUMsSUFBdkIsQ0FBNEIsSUFBNUIsQ0FBekI7SUFyQlc7O2dDQXVCYix3QkFBQSxHQUEwQixTQUFDLE9BQUQsRUFBVSxjQUFWO0FBQ3hCLFVBQUE7TUFBQSxJQUFHLGNBQUEsS0FBa0IsU0FBckI7UUFDRSxrQkFBQSxHQUFxQjtRQUNyQixjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXVCLENBQUMsYUFBeEIsQ0FBQTtRQUNqQixjQUFBLEdBQWlCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtBQUNmLGdCQUFBO1lBQUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDbEIsYUFBQSxxQ0FBZ0Isa0JBQW1CLENBQUEsR0FBQSxJQUFuQixrQkFBbUIsQ0FBQSxHQUFBLElBQVEsdUJBQUEsQ0FBd0IsS0FBQyxDQUFBLE1BQXpCLEVBQWlDLEdBQWpDLEVBQXNDLGNBQXRDO21CQUMzQyxhQUFhLENBQUMsSUFBZCxDQUFtQixTQUFDLFlBQUQ7cUJBQWtCLFlBQVksQ0FBQyxPQUFiLENBQXFCLEtBQXJCO1lBQWxCLENBQW5CO1VBSGU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEVBSG5COzthQVFBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLE9BQWIsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDcEIsY0FBQTtVQURzQixtQkFBTztVQUM3QixJQUFHLGNBQUEsS0FBa0IsU0FBckI7WUFDRSxJQUFBLENBQWMsY0FBQSxDQUFlLEtBQWYsQ0FBZDtBQUFBLHFCQUFBO2FBREY7O2lCQUVBLEtBQUMsQ0FBQSxXQUFXLENBQUMsZUFBYixDQUE2QixLQUE3QixFQUFvQyxLQUFDLENBQUEsYUFBckM7UUFIb0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBVHdCOztnQ0FjMUIsbUJBQUEsR0FBcUIsU0FBQTthQUNuQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFnQyxnQkFBaEMsRUFBa0QsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFsRDtJQURtQjs7Z0NBS3JCLG1CQUFBLEdBQXFCLFNBQUMsRUFBRDthQUNuQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxxQkFBWixFQUFtQyxFQUFuQztJQURtQjs7Z0NBR3JCLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQUhPOztnQ0FNVCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQjtJQURSOztnQ0FHYixhQUFBLEdBQWUsU0FBQTtNQUNiLElBQUMsQ0FBQSxRQUFELEdBQVk7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxxQkFBZCxFQUFxQyxFQUFyQztJQUZhOztnQ0FJZixVQUFBLEdBQVksU0FBQyxPQUFELEVBQWUsR0FBZjtBQUNWLFVBQUE7O1FBRFcsVUFBUTs7MkJBQU0sTUFBd0IsSUFBdkIsb0JBQU87TUFDakMsSUFBbUIsS0FBbkI7UUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBLEVBQUE7O01BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsT0FBZjs7UUFDQSxpQkFBa0I7O2FBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLHFCQUFkLEVBQXFDO1FBQUMsU0FBQSxPQUFEO1FBQVUsZ0JBQUEsY0FBVjtPQUFyQztJQUpVOztnQ0FNWixlQUFBLEdBQWlCLFNBQUMsY0FBRDs7UUFBQyxpQkFBZTs7TUFDL0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBdEIsQ0FBMEIsdUJBQTFCLEVBQW1ELElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBbkQ7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUF0QixDQUEwQixvQkFBMUIsRUFBZ0QsY0FBaEQ7SUFGZTs7Z0NBUWpCLFlBQUEsR0FBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxTQUFDLE9BQUQ7ZUFBYSxPQUFPLENBQUM7TUFBckIsQ0FBZCxDQUEwQyxDQUFDLElBQTNDLENBQWdELEdBQWhEO2FBQ0wsSUFBQSxNQUFBLENBQU8sTUFBUCxFQUFlLEdBQWY7SUFGUTs7Z0NBTWQsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO0lBRlk7O2dDQUlkLGNBQUEsR0FBZ0IsU0FBQyxPQUFEO0FBQ2QsVUFBQTtBQUFBLFdBQUEseUNBQUE7O1FBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQUFBO2FBRUEsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFIYzs7Z0NBS2hCLHFCQUFBLEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFhLENBQUMsTUFBZCxDQUFxQixlQUFyQixDQUFoQjtJQURxQjs7Z0NBR3ZCLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxHQUFnQztJQUR0Qjs7Z0NBR1osVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQTtJQURVOztnQ0FHWixxQkFBQSxHQUF1QixTQUFBO2FBQ3JCLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBLENBQXlCLENBQUMsR0FBMUIsQ0FBOEIsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLGNBQVAsQ0FBQTtNQUFaLENBQTlCO0lBRHFCOztnQ0FHdkIsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUE7SUFEYzs7Z0NBSWhCLDhCQUFBLEdBQWdDLFNBQUMsTUFBRCxFQUFTLFNBQVQ7QUFLOUIsVUFBQTs7UUFMdUMsWUFBVTs7TUFLakQsT0FBQSxHQUFVO0FBQ1Y7QUFBQSxXQUFBLHNDQUFBOztRQUNFLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLFdBQWIsQ0FBeUI7VUFBQSxxQkFBQSxFQUF1QixLQUF2QjtTQUF6QixDQUFzRCxDQUFDLE1BQXZELENBQThELFNBQUMsTUFBRDtpQkFDdEUsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUFyQixFQUE4QyxTQUE5QztRQURzRSxDQUE5RDtRQUVWLE9BQU8sQ0FBQyxJQUFSLGdCQUFhLE9BQWI7QUFIRjthQUlBO0lBVjhCOztnQ0FZaEMsZ0JBQUEsR0FBa0IsU0FBQyxLQUFEO2FBQ2hCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QjtRQUFBLHNCQUFBLEVBQXdCLEtBQXhCO09BQXpCLENBQXdELENBQUEsQ0FBQTtJQUR4Qzs7Z0NBVWxCLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtNQUFBLFlBQUEsR0FBZSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsS0FBa0I7TUFDakMsT0FBQSxHQUFVLElBQUMsQ0FBQSw4QkFBRCxDQUFnQyxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBaEMsRUFBbUUsWUFBbkU7TUFFVixJQUFHLE9BQU8sQ0FBQyxNQUFYO1FBTUUsTUFBQSxHQUFTLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBQyxNQUFEO2lCQUFZLE1BQU0sQ0FBQyxjQUFQLENBQUE7UUFBWixDQUFaO1FBQ1QsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsT0FBaEI7UUFFQSxJQUFHLFlBQUg7VUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxVQUF0QixDQUFBO1VBRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLEdBQW9CLEtBSHRCOztRQU1BLEtBQUEsR0FBUSxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsTUFBMUI7UUFDUixDQUFDLENBQUMsTUFBRixDQUFTLE1BQVQsRUFBaUIsS0FBakI7UUFDQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVo7UUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLE1BQWhDO2VBRUEsS0FyQkY7T0FBQSxNQUFBO2VBdUJFLE1BdkJGOztJQUpNOztnQ0FrQ1Isd0JBQUEsR0FBMEIsU0FBQyxNQUFEO0FBQ3hCLFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFFBQVEsQ0FBQyx5QkFBVixDQUFBO0FBRVIsV0FBQSx3Q0FBQTs7WUFBeUIsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEI7QUFDdkIsaUJBQU87O0FBRFQ7TUFHQSxzQkFBQSxHQUF5QixNQUFNLENBQUMsTUFBUCxDQUFjLFNBQUMsS0FBRDtlQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBWixLQUFtQixLQUFLLENBQUM7TUFBcEMsQ0FBZDtNQUV6QixJQUFHLHNCQUFzQixDQUFDLE1BQTFCO0FBQ0UsYUFBQSwwREFBQTs7Y0FBeUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFaLENBQTBCLEtBQTFCO0FBQ3ZDLG1CQUFPOztBQURUO0FBRUEsZUFBTyxzQkFBdUIsQ0FBQSxDQUFBLEVBSGhDOztBQUtBLFdBQUEsMENBQUE7O1lBQXlCLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBWixDQUEwQixLQUExQjtBQUN2QixpQkFBTzs7QUFEVDthQUdBLE1BQU8sQ0FBQSxDQUFBO0lBaEJpQjs7Ozs7QUE5SzVCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmVcbiAgY29sbGVjdFJhbmdlSW5CdWZmZXJSb3dcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5pc0ludmFsaWRNYXJrZXIgPSAobWFya2VyKSAtPiBub3QgbWFya2VyLmlzVmFsaWQoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBPY2N1cnJlbmNlTWFuYWdlclxuICBwYXR0ZXJuczogbnVsbFxuICBtYXJrZXJPcHRpb25zOiB7aW52YWxpZGF0ZTogJ2luc2lkZSd9XG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwYXR0ZXJucyA9IFtdXG5cbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBkZWNvcmF0aW9uT3B0aW9ucyA9IHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IFwidmltLW1vZGUtcGx1cy1vY2N1cnJlbmNlLWJhc2VcIn1cbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICAjIEBwYXR0ZXJucyBpcyBzaW5nbGUgc291cmNlIG9mIHRydXRoIChTU09UKVxuICAgICMgQWxsIG1ha2VyIGNyZWF0ZS9kZXN0cm95L2Nzcy11cGRhdGUgaXMgZG9uZSBieSByZWFjdGluZyBAcGF0dGVycydzIGNoYW5nZS5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBAb25EaWRDaGFuZ2VQYXR0ZXJucyAoe3BhdHRlcm4sIG9jY3VycmVuY2VUeXBlfSkgPT5cbiAgICAgIGlmIHBhdHRlcm5cbiAgICAgICAgQG1hcmtCdWZmZXJSYW5nZUJ5UGF0dGVybihwYXR0ZXJuLCBvY2N1cnJlbmNlVHlwZSlcbiAgICAgICAgQHVwZGF0ZUVkaXRvckVsZW1lbnQoKVxuICAgICAgZWxzZVxuICAgICAgICBAY2xlYXJNYXJrZXJzKClcblxuICAgIEBtYXJrZXJMYXllci5vbkRpZFVwZGF0ZShAZGVzdHJveUludmFsaWRNYXJrZXJzLmJpbmQodGhpcykpXG5cbiAgbWFya0J1ZmZlclJhbmdlQnlQYXR0ZXJuOiAocGF0dGVybiwgb2NjdXJyZW5jZVR5cGUpIC0+XG4gICAgaWYgb2NjdXJyZW5jZVR5cGUgaXMgJ3N1YndvcmQnXG4gICAgICBzdWJ3b3JkUmFuZ2VzQnlSb3cgPSB7fSAjIGNhY2hlXG4gICAgICBzdWJ3b3JkUGF0dGVybiA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLnN1YndvcmRSZWdFeHAoKVxuICAgICAgaXNTdWJ3b3JkUmFuZ2UgPSAocmFuZ2UpID0+XG4gICAgICAgIHJvdyA9IHJhbmdlLnN0YXJ0LnJvd1xuICAgICAgICBzdWJ3b3JkUmFuZ2VzID0gc3Vid29yZFJhbmdlc0J5Um93W3Jvd10gPz0gY29sbGVjdFJhbmdlSW5CdWZmZXJSb3coQGVkaXRvciwgcm93LCBzdWJ3b3JkUGF0dGVybilcbiAgICAgICAgc3Vid29yZFJhbmdlcy5zb21lIChzdWJ3b3JkUmFuZ2UpIC0+IHN1YndvcmRSYW5nZS5pc0VxdWFsKHJhbmdlKVxuXG4gICAgQGVkaXRvci5zY2FuIHBhdHRlcm4sICh7cmFuZ2UsIG1hdGNoVGV4dH0pID0+XG4gICAgICBpZiBvY2N1cnJlbmNlVHlwZSBpcyAnc3Vid29yZCdcbiAgICAgICAgcmV0dXJuIHVubGVzcyBpc1N1YndvcmRSYW5nZShyYW5nZSlcbiAgICAgIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIEBtYXJrZXJPcHRpb25zKVxuXG4gIHVwZGF0ZUVkaXRvckVsZW1lbnQ6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShcImhhcy1vY2N1cnJlbmNlXCIsIEBoYXNNYXJrZXJzKCkpXG5cbiAgIyBDYWxsYmFjayBnZXQgcGFzc2VkIGZvbGxvd2luZyBvYmplY3RcbiAgIyAtIHBhdHRlcm46IGNhbiBiZSB1bmRlZmluZWQgb24gcmVzZXQgZXZlbnRcbiAgb25EaWRDaGFuZ2VQYXR0ZXJuczogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXBhdHRlcm5zJywgZm4pXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG5cbiAgIyBQYXR0ZXJuc1xuICBoYXNQYXR0ZXJuczogLT5cbiAgICBAcGF0dGVybnMubGVuZ3RoID4gMFxuXG4gIHJlc2V0UGF0dGVybnM6IC0+XG4gICAgQHBhdHRlcm5zID0gW11cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdHRlcm5zJywge30pXG5cbiAgYWRkUGF0dGVybjogKHBhdHRlcm49bnVsbCwge3Jlc2V0LCBvY2N1cnJlbmNlVHlwZX09e30pIC0+XG4gICAgQGNsZWFyTWFya2VycygpIGlmIHJlc2V0XG4gICAgQHBhdHRlcm5zLnB1c2gocGF0dGVybilcbiAgICBvY2N1cnJlbmNlVHlwZSA/PSAnYmFzZSdcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdHRlcm5zJywge3BhdHRlcm4sIG9jY3VycmVuY2VUeXBlfSlcblxuICBzYXZlTGFzdFBhdHRlcm46IChvY2N1cnJlbmNlVHlwZT1udWxsKSAtPlxuICAgIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0T2NjdXJyZW5jZVBhdHRlcm5cIiwgQGJ1aWxkUGF0dGVybigpKVxuICAgIEB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5zZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIiwgb2NjdXJyZW5jZVR5cGUpXG5cbiAgIyBSZXR1cm4gcmVnZXggcmVwcmVzZW50aW5nIGZpbmFsIHBhdHRlcm4uXG4gICMgVXNlZCB0byBjYWNoZSBmaW5hbCBwYXR0ZXJuIHRvIGVhY2ggaW5zdGFuY2Ugb2Ygb3BlcmF0b3Igc28gdGhhdCB3ZSBjYW5cbiAgIyByZXBlYXQgcmVjb3JkZWQgb3BlcmF0aW9uIGJ5IGAuYC5cbiAgIyBQYXR0ZXJuIGNhbiBiZSBhZGRlZCBpbnRlcmFjdGl2ZWx5IG9uZSBieSBvbmUsIGJ1dCB3ZSBzYXZlIGl0IGFzIHVuaW9uIHBhdHRlcm4uXG4gIGJ1aWxkUGF0dGVybjogLT5cbiAgICBzb3VyY2UgPSBAcGF0dGVybnMubWFwKChwYXR0ZXJuKSAtPiBwYXR0ZXJuLnNvdXJjZSkuam9pbignfCcpXG4gICAgbmV3IFJlZ0V4cChzb3VyY2UsICdnJylcblxuICAjIE1hcmtlcnNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcblxuICBkZXN0cm95TWFya2VyczogKG1hcmtlcnMpIC0+XG4gICAgbWFya2VyLmRlc3Ryb3koKSBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAjIHdoZW5lcnZlciB3ZSBkZXN0cm95IG1hcmtlciwgd2Ugc2hvdWxkIHN5bmMgYGhhcy1vY2N1cnJlbmNlYCBzY29wZSBpbiBtYXJrZXIgc3RhdGUuLlxuICAgIEB1cGRhdGVFZGl0b3JFbGVtZW50KClcblxuICBkZXN0cm95SW52YWxpZE1hcmtlcnM6IC0+XG4gICAgQGRlc3Ryb3lNYXJrZXJzKEBnZXRNYXJrZXJzKCkuZmlsdGVyKGlzSW52YWxpZE1hcmtlcikpXG5cbiAgaGFzTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDBcblxuICBnZXRNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcblxuICBnZXRNYXJrZXJCdWZmZXJSYW5nZXM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKS5tYXAgKG1hcmtlcikgLT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcblxuICBnZXRNYXJrZXJDb3VudDogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuXG4gICMgUmV0dXJuIG9jY3VycmVuY2UgbWFya2VycyBpbnRlcnNlY3RpbmcgZ2l2ZW4gcmFuZ2VzXG4gIGdldE1hcmtlcnNJbnRlcnNlY3RzV2l0aFJhbmdlczogKHJhbmdlcywgZXhjbHVzaXZlPWZhbHNlKSAtPlxuICAgICMgZmluZG1hcmtlcnMoKSdzIGludGVyc2VjdHNCdWZmZXJSYW5nZSBwYXJhbSBoYXZlIG5vIGV4Y2x1c2l2ZSBjb250cm9sXG4gICAgIyBTbyBJIG5lZWQgZXh0cmEgY2hlY2sgdG8gZmlsdGVyIG91dCB1bndhbnRlZCBtYXJrZXIuXG4gICAgIyBCdXQgYmFzaWNhbGx5IEkgc2hvdWxkIHByZWZlciBmaW5kTWFya2VyIHNpbmNlIEl0J3MgZmFzdCB0aGFuIGl0ZXJhdGluZ1xuICAgICMgd2hvbGUgbWFya2VycyBtYW51YWxseS5cbiAgICByZXN1bHRzID0gW11cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzLm1hcChzaHJpbmtSYW5nZUVuZFRvQmVmb3JlTmV3TGluZSlcbiAgICAgIG1hcmtlcnMgPSBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c0J1ZmZlclJhbmdlOiByYW5nZSkuZmlsdGVyIChtYXJrZXIpIC0+XG4gICAgICAgIHJhbmdlLmludGVyc2VjdHNXaXRoKG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLCBleGNsdXNpdmUpXG4gICAgICByZXN1bHRzLnB1c2gobWFya2Vycy4uLilcbiAgICByZXN1bHRzXG5cbiAgZ2V0TWFya2VyQXRQb2ludDogKHBvaW50KSAtPlxuICAgIEBtYXJrZXJMYXllci5maW5kTWFya2Vycyhjb250YWluc0J1ZmZlclBvc2l0aW9uOiBwb2ludClbMF1cblxuICAjIFNlbGVjdCBvY2N1cnJlbmNlIG1hcmtlciBidWZmZXJSYW5nZSBpbnRlcnNlY3RpbmcgY3VycmVudCBzZWxlY3Rpb25zLlxuICAjIC0gUmV0dXJuOiB0cnVlL2ZhbHNlIHRvIGluZGljYXRlIHN1Y2Nlc3Mgb3IgZmFpbFxuICAjXG4gICMgRG8gc3BlY2lhbCBoYW5kbGluZyBmb3Igd2hpY2ggb2NjdXJyZW5jZSByYW5nZSBiZWNvbWUgbGFzdFNlbGVjdGlvblxuICAjIGUuZy5cbiAgIyAgLSBjKGNoYW5nZSk6IFNvIHRoYXQgYXV0b2NvbXBsZXRlK3BvcHVwIHNob3dzIGF0IG9yaWdpbmFsIGN1cnNvciBwb3NpdGlvbiBvciBuZWFyLlxuICAjICAtIGcgVSh1cHBlci1jYXNlKTogU28gdGhhdCB1bmRvL3JlZG8gY2FuIHJlc3BlY3QgbGFzdCBjdXJzb3IgcG9zaXRpb24uXG4gIHNlbGVjdDogLT5cbiAgICBpc1Zpc3VhbE1vZGUgPSBAdmltU3RhdGUubW9kZSBpcyAndmlzdWFsJ1xuICAgIG1hcmtlcnMgPSBAZ2V0TWFya2Vyc0ludGVyc2VjdHNXaXRoUmFuZ2VzKEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKSwgaXNWaXN1YWxNb2RlKVxuXG4gICAgaWYgbWFya2Vycy5sZW5ndGhcbiAgICAgICMgTk9URTogaW1tZWRpYXRlbHkgZGVzdHJveSBvY2N1cnJlbmNlLW1hcmtlciB3aGljaCB3ZSBhcmUgb3BlcmF0ZXMgb24gZnJvbSBub3cuXG4gICAgICAjIE1hcmtlcnMgYXJlIG5vdCBiZWVpbmcgaW1tZWRpYXRlbHkgZGVzdHJveWVkIHVubGVzcyBleHBsaWN0bHkgZGVzdHJveS5cbiAgICAgICMgTWFudWFsbHkgZGVzdHJveWluZyBtYXJrZXJzIGhlcmUgZ2l2ZXMgdXMgc2V2ZXJhbCBiZW5lZml0cyBsaWtlIGJlbGxvdy5cbiAgICAgICMgIC0gRWFzeSB0byB3cml0ZSBzcGVjIHNpbmNlIG1hcmtlcnMgYXJlIGRlc3Ryb3llZCBpbi1zeW5jLlxuICAgICAgIyAgLSBTZWxlY3RPY2N1cnJlbmNlIG9wZXJhdGlvbiBub3QgaW52YWxpZGF0ZSBtYXJrZXIgYnV0IGRlc3Ryb3llZCBvbmNlIHNlbGVjdGVkLlxuICAgICAgcmFuZ2VzID0gbWFya2Vycy5tYXAgKG1hcmtlcikgLT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIEBkZXN0cm95TWFya2VycyhtYXJrZXJzKVxuXG4gICAgICBpZiBpc1Zpc3VhbE1vZGVcbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmRlYWN0aXZhdGUoKVxuICAgICAgICAjIFNvIHRoYXQgU2VsZWN0T2NjdXJyZW5jZSBjYW4gYWNpdml2YXRlIHZpc3VhbC1tb2RlIHdpdGggY29ycmVjdCByYW5nZSwgd2UgaGF2ZSB0byB1bnNldCBzdWJtb2RlIGhlcmUuXG4gICAgICAgIEB2aW1TdGF0ZS5zdWJtb2RlID0gbnVsbFxuXG4gICAgICAjIEltcG9ydGFudDogVG8gbWFrZSBsYXN0LWN1cnNvciBiZWNvbWUgb3JpZ2luYWwgY3Vyc29yIHBvc2l0aW9uLlxuICAgICAgcmFuZ2UgPSBAZ2V0UmFuZ2VGb3JMYXN0U2VsZWN0aW9uKHJhbmdlcylcbiAgICAgIF8ucmVtb3ZlKHJhbmdlcywgcmFuZ2UpXG4gICAgICByYW5nZXMucHVzaChyYW5nZSlcblxuICAgICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhyYW5nZXMpXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gICMgV2hpY2ggb2NjdXJyZW5jZSBiZWNvbWUgbGFzdFNlbGVjdGlvbiBpcyBkZXRlcm1pbmVkIGJ5IGZvbGxvd2luZyBvcmRlclxuICAjICAxLiBPY2N1cnJlbmNlIHVuZGVyIG9yaWdpbmFsIGN1cnNvciBwb3NpdGlvblxuICAjICAyLiBmb3J3YXJkaW5nIGluIHNhbWUgcm93XG4gICMgIDMuIGZpcnN0IG9jY3VycmVuY2UgaW4gc2FtZSByb3dcbiAgIyAgNC4gZm9yd2FyZGluZyAod3JhcC1lbmQpXG4gIGdldFJhbmdlRm9yTGFzdFNlbGVjdGlvbjogKHJhbmdlcykgLT5cbiAgICBwb2ludCA9IEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKClcblxuICAgIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5jb250YWluc1BvaW50KHBvaW50KVxuICAgICAgcmV0dXJuIHJhbmdlXG5cbiAgICByYW5nZXNTdGFydEZyb21TYW1lUm93ID0gcmFuZ2VzLmZpbHRlcigocmFuZ2UpIC0+IHJhbmdlLnN0YXJ0LnJvdyBpcyBwb2ludC5yb3cpXG5cbiAgICBpZiByYW5nZXNTdGFydEZyb21TYW1lUm93Lmxlbmd0aFxuICAgICAgZm9yIHJhbmdlIGluIHJhbmdlc1N0YXJ0RnJvbVNhbWVSb3cgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgICByZXR1cm4gcmFuZ2UgIyBGb3J3YXJkaW5nXG4gICAgICByZXR1cm4gcmFuZ2VzU3RhcnRGcm9tU2FtZVJvd1swXVxuXG4gICAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4ocG9pbnQpICAjIEZvcndhcmRpbmdcbiAgICAgIHJldHVybiByYW5nZVxuXG4gICAgcmFuZ2VzWzBdICMgcmV0dXJuIGZpcnN0IGFzIGZhbGxiYWNrXG4iXX0=
