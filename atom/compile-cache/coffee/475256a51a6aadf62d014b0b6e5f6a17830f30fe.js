(function() {
  var BlockwiseSelection, _, isEmpty, ref, sortRanges, swrap;

  _ = require('underscore-plus');

  ref = require('./utils'), sortRanges = ref.sortRanges, isEmpty = ref.isEmpty;

  swrap = require('./selection-wrapper');

  BlockwiseSelection = (function() {
    BlockwiseSelection.prototype.editor = null;

    BlockwiseSelection.prototype.selections = null;

    BlockwiseSelection.prototype.goalColumn = null;

    BlockwiseSelection.prototype.reversed = false;

    function BlockwiseSelection(selection) {
      var i, len, memberSelection, ref1;
      this.editor = selection.editor;
      this.initialize(selection);
      ref1 = this.getSelections();
      for (i = 0, len = ref1.length; i < len; i++) {
        memberSelection = ref1[i];
        swrap(memberSelection).saveProperties();
        swrap(memberSelection).setWiseProperty('blockwise');
      }
    }

    BlockwiseSelection.prototype.getSelections = function() {
      return this.selections;
    };

    BlockwiseSelection.prototype.isEmpty = function() {
      return this.getSelections().every(isEmpty);
    };

    BlockwiseSelection.prototype.initialize = function(selection) {
      var end, i, j, len, range, ranges, ref1, ref2, results, reversed, start, wasReversed;
      this.goalColumn = selection.cursor.goalColumn;
      this.selections = [selection];
      wasReversed = reversed = selection.isReversed();
      range = selection.getBufferRange();
      if (range.end.column === 0) {
        range.end.row -= 1;
      }
      if (this.goalColumn != null) {
        if (wasReversed) {
          range.start.column = this.goalColumn;
        } else {
          range.end.column = this.goalColumn + 1;
        }
      }
      if (range.start.column >= range.end.column) {
        reversed = !reversed;
        range = range.translate([0, 1], [0, -1]);
      }
      start = range.start, end = range.end;
      ranges = (function() {
        results = [];
        for (var i = ref1 = start.row, ref2 = end.row; ref1 <= ref2 ? i <= ref2 : i >= ref2; ref1 <= ref2 ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this).map(function(row) {
        return [[row, start.column], [row, end.column]];
      });
      selection.setBufferRange(ranges.shift(), {
        reversed: reversed
      });
      for (j = 0, len = ranges.length; j < len; j++) {
        range = ranges[j];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      if (wasReversed) {
        this.reverse();
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.isReversed = function() {
      return this.reversed;
    };

    BlockwiseSelection.prototype.reverse = function() {
      return this.reversed = !this.reversed;
    };

    BlockwiseSelection.prototype.updateGoalColumn = function() {
      var i, len, ref1, results, selection;
      if (this.goalColumn != null) {
        ref1 = this.selections;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          selection = ref1[i];
          results.push(selection.cursor.goalColumn = this.goalColumn);
        }
        return results;
      }
    };

    BlockwiseSelection.prototype.isSingleRow = function() {
      return this.selections.length === 1;
    };

    BlockwiseSelection.prototype.getHeight = function() {
      var endRow, ref1, startRow;
      ref1 = this.getBufferRowRange(), startRow = ref1[0], endRow = ref1[1];
      return (endRow - startRow) + 1;
    };

    BlockwiseSelection.prototype.getStartSelection = function() {
      return this.selections[0];
    };

    BlockwiseSelection.prototype.getEndSelection = function() {
      return _.last(this.selections);
    };

    BlockwiseSelection.prototype.getHeadSelection = function() {
      if (this.isReversed()) {
        return this.getStartSelection();
      } else {
        return this.getEndSelection();
      }
    };

    BlockwiseSelection.prototype.getTailSelection = function() {
      if (this.isReversed()) {
        return this.getEndSelection();
      } else {
        return this.getStartSelection();
      }
    };

    BlockwiseSelection.prototype.getHeadBufferPosition = function() {
      return this.getHeadSelection().getHeadBufferPosition();
    };

    BlockwiseSelection.prototype.getTailBufferPosition = function() {
      return this.getTailSelection().getTailBufferPosition();
    };

    BlockwiseSelection.prototype.getStartBufferPosition = function() {
      return this.getStartSelection().getBufferRange().start;
    };

    BlockwiseSelection.prototype.getEndBufferPosition = function() {
      return this.getEndSelection().getBufferRange().end;
    };

    BlockwiseSelection.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getStartSelection().getBufferRowRange()[0];
      endRow = this.getEndSelection().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    BlockwiseSelection.prototype.headReversedStateIsInSync = function() {
      return this.isReversed() === this.getHeadSelection().isReversed();
    };

    BlockwiseSelection.prototype.setSelectedBufferRanges = function(ranges, arg) {
      var i, len, range, reversed;
      reversed = arg.reversed;
      sortRanges(ranges);
      range = ranges.shift();
      this.setHeadBufferRange(range, {
        reversed: reversed
      });
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.setPositionForSelections = function(which) {
      var i, len, ref1, results, selection;
      ref1 = this.selections;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        results.push(swrap(selection).setBufferPositionTo(which));
      }
      return results;
    };

    BlockwiseSelection.prototype.clearSelections = function(arg) {
      var except, i, len, ref1, results, selection;
      except = (arg != null ? arg : {}).except;
      ref1 = this.selections.slice();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (selection !== except) {
          results.push(this.removeSelection(selection));
        }
      }
      return results;
    };

    BlockwiseSelection.prototype.setHeadBufferPosition = function(point) {
      var head;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      return head.cursor.setBufferPosition(point);
    };

    BlockwiseSelection.prototype.removeSelection = function(selection) {
      _.remove(this.selections, selection);
      return selection.destroy();
    };

    BlockwiseSelection.prototype.setHeadBufferRange = function(range, options) {
      var base, goalColumn, head;
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      head.setBufferRange(range, options);
      if (goalColumn != null) {
        return (base = head.cursor).goalColumn != null ? base.goalColumn : base.goalColumn = goalColumn;
      }
    };

    BlockwiseSelection.prototype.getCharacterwiseProperties = function() {
      var end, head, ref1, ref2, start, tail;
      head = this.getHeadBufferPosition();
      tail = this.getTailBufferPosition();
      if (this.isReversed()) {
        ref1 = [head, tail], start = ref1[0], end = ref1[1];
      } else {
        ref2 = [tail, head], start = ref2[0], end = ref2[1];
      }
      if (!(this.isSingleRow() || this.headReversedStateIsInSync())) {
        start.column -= 1;
        end.column += 1;
      }
      return {
        head: head,
        tail: tail
      };
    };

    BlockwiseSelection.prototype.getBufferRange = function() {
      var end, start;
      if (this.headReversedStateIsInSync()) {
        start = this.getStartSelection.getBufferrange().start;
        end = this.getEndSelection.getBufferrange().end;
      } else {
        start = this.getStartSelection.getBufferrange().end.translate([0, -1]);
        end = this.getEndSelection.getBufferrange().start.translate([0, +1]);
      }
      return {
        start: start,
        end: end
      };
    };

    BlockwiseSelection.prototype.restoreCharacterwise = function() {
      var head, properties;
      if (this.isEmpty()) {
        return;
      }
      properties = this.getCharacterwiseProperties();
      head = this.getHeadSelection();
      this.clearSelections({
        except: head
      });
      swrap(head).selectByProperties(properties);
      if (head.getBufferRange().end.column === 0) {
        return swrap(head).translateSelectionEndAndClip('forward');
      }
    };

    BlockwiseSelection.prototype.autoscroll = function(options) {
      return this.getHeadSelection().autoscroll(options);
    };

    BlockwiseSelection.prototype.autoscrollIfReversed = function(options) {
      if (this.isReversed()) {
        return this.autoscroll(options);
      }
    };

    return BlockwiseSelection;

  })();

  module.exports = BlockwiseSelection;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9ibG9ja3dpc2Utc2VsZWN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUF3QixPQUFBLENBQVEsU0FBUixDQUF4QixFQUFDLDJCQUFELEVBQWE7O0VBQ2IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFRjtpQ0FDSixNQUFBLEdBQVE7O2lDQUNSLFVBQUEsR0FBWTs7aUNBQ1osVUFBQSxHQUFZOztpQ0FDWixRQUFBLEdBQVU7O0lBRUcsNEJBQUMsU0FBRDtBQUNYLFVBQUE7TUFBQyxJQUFDLENBQUEsU0FBVSxVQUFWO01BQ0YsSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFaO0FBRUE7QUFBQSxXQUFBLHNDQUFBOztRQUNFLEtBQUEsQ0FBTSxlQUFOLENBQXNCLENBQUMsY0FBdkIsQ0FBQTtRQUNBLEtBQUEsQ0FBTSxlQUFOLENBQXNCLENBQUMsZUFBdkIsQ0FBdUMsV0FBdkM7QUFGRjtJQUpXOztpQ0FRYixhQUFBLEdBQWUsU0FBQTthQUNiLElBQUMsQ0FBQTtJQURZOztpQ0FHZixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZ0IsQ0FBQyxLQUFqQixDQUF1QixPQUF2QjtJQURPOztpQ0FHVCxVQUFBLEdBQVksU0FBQyxTQUFEO0FBQ1YsVUFBQTtNQUFDLElBQUMsQ0FBQSxhQUFjLFNBQVMsQ0FBQyxPQUF4QjtNQUNGLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQyxTQUFEO01BQ2QsV0FBQSxHQUFjLFFBQUEsR0FBVyxTQUFTLENBQUMsVUFBVixDQUFBO01BRXpCLEtBQUEsR0FBUSxTQUFTLENBQUMsY0FBVixDQUFBO01BQ1IsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFD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TUFBQSxJQUFVLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVjtBQUFBLGVBQUE7O01BRUEsVUFBQSxHQUFhLElBQUMsQ0FBQSwwQkFBRCxDQUFBO01BQ2IsSUFBQSxHQUFPLElBQUMsQ0FBQSxnQkFBRCxDQUFBO01BQ1AsSUFBQyxDQUFBLGVBQUQsQ0FBaUI7UUFBQSxNQUFBLEVBQVEsSUFBUjtPQUFqQjtNQUNBLEtBQUEsQ0FBTSxJQUFOLENBQVcsQ0FBQyxrQkFBWixDQUErQixVQUEvQjtNQUNBLElBQUcsSUFBSSxDQUFDLGNBQUwsQ0FBQSxDQUFxQixDQUFDLEdBQUcsQ0FBQyxNQUExQixLQUFvQyxDQUF2QztlQUNFLEtBQUEsQ0FBTSxJQUFOLENBQVcsQ0FBQyw0QkFBWixDQUF5QyxTQUF6QyxFQURGOztJQVRvQjs7aUNBWXRCLFVBQUEsR0FBWSxTQUFDLE9BQUQ7YUFDVixJQUFDLENBQUEsZ0JBQUQsQ0FBQSxDQUFtQixDQUFDLFVBQXBCLENBQStCLE9BQS9CO0lBRFU7O2lDQUdaLG9CQUFBLEdBQXNCLFNBQUMsT0FBRDtNQUdwQixJQUF3QixJQUFDLENBQUEsVUFBRCxDQUFBLENBQXhCO2VBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxPQUFaLEVBQUE7O0lBSG9COzs7Ozs7RUFLeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFqTWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue3NvcnRSYW5nZXMsIGlzRW1wdHl9ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcblxuY2xhc3MgQmxvY2t3aXNlU2VsZWN0aW9uXG4gIGVkaXRvcjogbnVsbFxuICBzZWxlY3Rpb25zOiBudWxsXG4gIGdvYWxDb2x1bW46IG51bGxcbiAgcmV2ZXJzZWQ6IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6IChzZWxlY3Rpb24pIC0+XG4gICAge0BlZGl0b3J9ID0gc2VsZWN0aW9uXG4gICAgQGluaXRpYWxpemUoc2VsZWN0aW9uKVxuXG4gICAgZm9yIG1lbWJlclNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzd3JhcChtZW1iZXJTZWxlY3Rpb24pLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgIHN3cmFwKG1lbWJlclNlbGVjdGlvbikuc2V0V2lzZVByb3BlcnR5KCdibG9ja3dpc2UnKVxuXG4gIGdldFNlbGVjdGlvbnM6IC0+XG4gICAgQHNlbGVjdGlvbnNcblxuICBpc0VtcHR5OiAtPlxuICAgIEBnZXRTZWxlY3Rpb25zKCkuZXZlcnkoaXNFbXB0eSlcblxuICBpbml0aWFsaXplOiAoc2VsZWN0aW9uKSAtPlxuICAgIHtAZ29hbENvbHVtbn0gPSBzZWxlY3Rpb24uY3Vyc29yXG4gICAgQHNlbGVjdGlvbnMgPSBbc2VsZWN0aW9uXVxuICAgIHdhc1JldmVyc2VkID0gcmV2ZXJzZWQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG5cbiAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgaWYgcmFuZ2UuZW5kLmNvbHVtbiBpcyAwXG4gICAgICByYW5nZS5lbmQucm93IC09IDFcblxuICAgIGlmIEBnb2FsQ29sdW1uP1xuICAgICAgaWYgd2FzUmV2ZXJzZWRcbiAgICAgICAgcmFuZ2Uuc3RhcnQuY29sdW1uID0gQGdvYWxDb2x1bW5cbiAgICAgIGVsc2VcbiAgICAgICAgcmFuZ2UuZW5kLmNvbHVtbiA9IEBnb2FsQ29sdW1uICsgMVxuXG4gICAgaWYgcmFuZ2Uuc3RhcnQuY29sdW1uID49IHJhbmdlLmVuZC5jb2x1bW5cbiAgICAgIHJldmVyc2VkID0gbm90IHJldmVyc2VkXG4gICAgICByYW5nZSA9IHJhbmdlLnRyYW5zbGF0ZShbMCwgMV0sIFswLCAtMV0pXG5cbiAgICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIHJhbmdlcyA9IFtzdGFydC5yb3cuLmVuZC5yb3ddLm1hcCAocm93KSAtPlxuICAgICAgW1tyb3csIHN0YXJ0LmNvbHVtbl0sIFtyb3csIGVuZC5jb2x1bW5dXVxuXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlcy5zaGlmdCgpLCB7cmV2ZXJzZWR9KVxuICAgIGZvciByYW5nZSBpbiByYW5nZXNcbiAgICAgIEBzZWxlY3Rpb25zLnB1c2goQGVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkfSkpXG4gICAgQHJldmVyc2UoKSBpZiB3YXNSZXZlcnNlZFxuICAgIEB1cGRhdGVHb2FsQ29sdW1uKClcblxuICBpc1JldmVyc2VkOiAtPlxuICAgIEByZXZlcnNlZFxuXG4gIHJldmVyc2U6IC0+XG4gICAgQHJldmVyc2VkID0gbm90IEByZXZlcnNlZFxuXG4gIHVwZGF0ZUdvYWxDb2x1bW46IC0+XG4gICAgaWYgQGdvYWxDb2x1bW4/XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBzZWxlY3Rpb25zXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtbiA9IEBnb2FsQ29sdW1uXG5cbiAgaXNTaW5nbGVSb3c6IC0+XG4gICAgQHNlbGVjdGlvbnMubGVuZ3RoIGlzIDFcblxuICBnZXRIZWlnaHQ6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQGdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICAoZW5kUm93IC0gc3RhcnRSb3cpICsgMVxuXG4gIGdldFN0YXJ0U2VsZWN0aW9uOiAtPlxuICAgIEBzZWxlY3Rpb25zWzBdXG5cbiAgZ2V0RW5kU2VsZWN0aW9uOiAtPlxuICAgIF8ubGFzdChAc2VsZWN0aW9ucylcblxuICBnZXRIZWFkU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc1JldmVyc2VkKClcbiAgICAgIEBnZXRTdGFydFNlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGdldEVuZFNlbGVjdGlvbigpXG5cbiAgZ2V0VGFpbFNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNSZXZlcnNlZCgpXG4gICAgICBAZ2V0RW5kU2VsZWN0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZ2V0U3RhcnRTZWxlY3Rpb24oKVxuXG4gIGdldEhlYWRCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAZ2V0SGVhZFNlbGVjdGlvbigpLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG5cbiAgZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBnZXRUYWlsU2VsZWN0aW9uKCkuZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRTdGFydEJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBnZXRTdGFydFNlbGVjdGlvbigpLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcblxuICBnZXRFbmRCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAZ2V0RW5kU2VsZWN0aW9uKCkuZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcblxuICBnZXRCdWZmZXJSb3dSYW5nZTogLT5cbiAgICBzdGFydFJvdyA9IEBnZXRTdGFydFNlbGVjdGlvbigpLmdldEJ1ZmZlclJvd1JhbmdlKClbMF1cbiAgICBlbmRSb3cgPSBAZ2V0RW5kU2VsZWN0aW9uKCkuZ2V0QnVmZmVyUm93UmFuZ2UoKVswXVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gIGhlYWRSZXZlcnNlZFN0YXRlSXNJblN5bmM6IC0+XG4gICAgQGlzUmV2ZXJzZWQoKSBpcyBAZ2V0SGVhZFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKVxuXG4gICMgW05PVEVdIFVzZWQgYnkgcGx1Z2luIHBhY2thZ2Ugdm1wOm1vdmUtc2VsZWN0ZWQtdGV4dFxuICBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlczogKHJhbmdlcywge3JldmVyc2VkfSkgLT5cbiAgICBzb3J0UmFuZ2VzKHJhbmdlcylcbiAgICByYW5nZSA9IHJhbmdlcy5zaGlmdCgpXG4gICAgQHNldEhlYWRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkfSlcbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzXG4gICAgICBAc2VsZWN0aW9ucy5wdXNoIEBlZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZH0pXG4gICAgQHVwZGF0ZUdvYWxDb2x1bW4oKVxuXG4gICMgd2hpY2ggbXVzdCBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cbiAgc2V0UG9zaXRpb25Gb3JTZWxlY3Rpb25zOiAod2hpY2gpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAc2VsZWN0aW9uc1xuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJQb3NpdGlvblRvKHdoaWNoKVxuXG4gIGNsZWFyU2VsZWN0aW9uczogKHtleGNlcHR9PXt9KSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQHNlbGVjdGlvbnMuc2xpY2UoKSB3aGVuIChzZWxlY3Rpb24gaXNudCBleGNlcHQpXG4gICAgICBAcmVtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbilcblxuICBzZXRIZWFkQnVmZmVyUG9zaXRpb246IChwb2ludCkgLT5cbiAgICBoZWFkID0gQGdldEhlYWRTZWxlY3Rpb24oKVxuICAgIEBjbGVhclNlbGVjdGlvbnMoZXhjZXB0OiBoZWFkKVxuICAgIGhlYWQuY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHJlbW92ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBfLnJlbW92ZShAc2VsZWN0aW9ucywgc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5kZXN0cm95KClcblxuICBzZXRIZWFkQnVmZmVyUmFuZ2U6IChyYW5nZSwgb3B0aW9ucykgLT5cbiAgICBoZWFkID0gQGdldEhlYWRTZWxlY3Rpb24oKVxuICAgIEBjbGVhclNlbGVjdGlvbnMoZXhjZXB0OiBoZWFkKVxuICAgIHtnb2FsQ29sdW1ufSA9IGhlYWQuY3Vyc29yXG4gICAgIyBXaGVuIHJldmVyc2VkIHN0YXRlIG9mIHNlbGVjdGlvbiBjaGFuZ2UsIGdvYWxDb2x1bW4gaXMgY2xlYXJlZC5cbiAgICAjIEJ1dCBoZXJlIGZvciBibG9ja3dpc2UsIEkgd2FudCB0byBrZWVwIGdvYWxDb2x1bW4gdW5jaGFuZ2VkLlxuICAgICMgVGhpcyBiZWhhdmlvciBpcyBub3QgaWRlbnRpY2FsIHRvIHB1cmUgVmltIEkga25vdy5cbiAgICAjIEJ1dCBJIGJlbGlldmUgdGhpcyBpcyBtb3JlIHVubm9pc3kgYW5kIGxlc3MgY29uZnVzaW9uIHdoaWxlIG1vdmluZ1xuICAgICMgY3Vyc29yIGluIHZpc3VhbC1ibG9jayBtb2RlLlxuICAgIGhlYWQuc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG4gICAgaGVhZC5jdXJzb3IuZ29hbENvbHVtbiA/PSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4/XG5cbiAgZ2V0Q2hhcmFjdGVyd2lzZVByb3BlcnRpZXM6IC0+XG4gICAgaGVhZCA9IEBnZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBAZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIGlmIEBpc1JldmVyc2VkKClcbiAgICAgIFtzdGFydCwgZW5kXSA9IFtoZWFkLCB0YWlsXVxuICAgIGVsc2VcbiAgICAgIFtzdGFydCwgZW5kXSA9IFt0YWlsLCBoZWFkXVxuXG4gICAgdW5sZXNzIChAaXNTaW5nbGVSb3coKSBvciBAaGVhZFJldmVyc2VkU3RhdGVJc0luU3luYygpKVxuICAgICAgc3RhcnQuY29sdW1uIC09IDFcbiAgICAgIGVuZC5jb2x1bW4gKz0gMVxuICAgIHtoZWFkLCB0YWlsfVxuXG4gIGdldEJ1ZmZlclJhbmdlOiAtPlxuICAgIGlmIEBoZWFkUmV2ZXJzZWRTdGF0ZUlzSW5TeW5jKClcbiAgICAgIHN0YXJ0ID0gQGdldFN0YXJ0U2VsZWN0aW9uLmdldEJ1ZmZlcnJhbmdlKCkuc3RhcnRcbiAgICAgIGVuZCA9IEBnZXRFbmRTZWxlY3Rpb24uZ2V0QnVmZmVycmFuZ2UoKS5lbmRcbiAgICBlbHNlXG4gICAgICBzdGFydCA9IEBnZXRTdGFydFNlbGVjdGlvbi5nZXRCdWZmZXJyYW5nZSgpLmVuZC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICAgIGVuZCA9IEBnZXRFbmRTZWxlY3Rpb24uZ2V0QnVmZmVycmFuZ2UoKS5zdGFydC50cmFuc2xhdGUoWzAsICsxXSlcbiAgICB7c3RhcnQsIGVuZH1cblxuICAjIFtGSVhNRV0gZHVwbGljYXRlIGNvZGVzIHdpdGggc2V0SGVhZEJ1ZmZlclJhbmdlXG4gIHJlc3RvcmVDaGFyYWN0ZXJ3aXNlOiAtPlxuICAgICMgV2hlbiBhbGwgc2VsZWN0aW9uIGlzIGVtcHR5LCB3ZSBkb24ndCB3YW50IHRvIGxvb3NlIG11bHRpLWN1cnNvclxuICAgICMgYnkgcmVzdG9yZWluZyBjaGFyYWN0ZXJ3aXNlIHJhbmdlLlxuICAgIHJldHVybiBpZiBAaXNFbXB0eSgpXG5cbiAgICBwcm9wZXJ0aWVzID0gQGdldENoYXJhY3Rlcndpc2VQcm9wZXJ0aWVzKClcbiAgICBoZWFkID0gQGdldEhlYWRTZWxlY3Rpb24oKVxuICAgIEBjbGVhclNlbGVjdGlvbnMoZXhjZXB0OiBoZWFkKVxuICAgIHN3cmFwKGhlYWQpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgIGlmIGhlYWQuZ2V0QnVmZmVyUmFuZ2UoKS5lbmQuY29sdW1uIGlzIDBcbiAgICAgIHN3cmFwKGhlYWQpLnRyYW5zbGF0ZVNlbGVjdGlvbkVuZEFuZENsaXAoJ2ZvcndhcmQnKVxuXG4gIGF1dG9zY3JvbGw6IChvcHRpb25zKSAtPlxuICAgIEBnZXRIZWFkU2VsZWN0aW9uKCkuYXV0b3Njcm9sbChvcHRpb25zKVxuXG4gIGF1dG9zY3JvbGxJZlJldmVyc2VkOiAob3B0aW9ucykgLT5cbiAgICAjIFNlZSAjNTQ2IGN1cnNvciBvdXQtb2Ytc2NyZWVuIGlzc3VlIGhhcHBlbnMgb25seSBpbiByZXZlcnNlZC5cbiAgICAjIFNvIHNraXAgaGVyZSBmb3IgcGVyZm9ybWFuY2UoYnV0IGRvbid0IGtub3cgaWYgaXQncyB3b3J0aClcbiAgICBAYXV0b3Njcm9sbChvcHRpb25zKSBpZiBAaXNSZXZlcnNlZCgpXG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2t3aXNlU2VsZWN0aW9uXG4iXX0=
