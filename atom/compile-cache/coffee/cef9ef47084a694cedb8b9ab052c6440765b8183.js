(function() {
  var CompositeDisposable, Mutation, MutationManager, Point, ref, swrap;

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
      this.bufferRangesForCustomCheckpoint = [];
    }

    MutationManager.prototype.destroy = function() {
      var ref1, ref2;
      this.reset();
      ref1 = {}, this.mutationsBySelection = ref1.mutationsBySelection, this.editor = ref1.editor, this.vimState = ref1.vimState;
      return ref2 = {}, this.bufferRangesForCustomCheckpoint = ref2.bufferRangesForCustomCheckpoint, ref2;
    };

    MutationManager.prototype.init = function(options1) {
      this.options = options1;
      return this.reset();
    };

    MutationManager.prototype.reset = function() {
      this.markerLayer.clear();
      this.mutationsBySelection.clear();
      return this.bufferRangesForCustomCheckpoint = [];
    };

    MutationManager.prototype.getInitialPointForSelection = function(selection, options) {
      var ref1;
      return (ref1 = this.getMutationForSelection(selection)) != null ? ref1.getInitialPoint(options) : void 0;
    };

    MutationManager.prototype.setCheckpoint = function(checkpoint) {
      var i, initialPoint, len, options, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (this.mutationsBySelection.has(selection)) {
          results.push(this.mutationsBySelection.get(selection).update(checkpoint));
        } else {
          if (this.vimState.isMode('visual')) {
            initialPoint = swrap(selection).getBufferPositionFor('head', {
              from: ['property', 'selection']
            });
          } else {
            initialPoint = swrap(selection).getBufferPositionFor('head');
          }
          options = {
            selection: selection,
            initialPoint: initialPoint,
            checkpoint: checkpoint,
            markerLayer: this.markerLayer,
            useMarker: this.options.useMarker
          };
          results.push(this.mutationsBySelection.set(selection, new Mutation(options)));
        }
      }
      return results;
    };

    MutationManager.prototype.getMutationForSelection = function(selection) {
      return this.mutationsBySelection.get(selection);
    };

    MutationManager.prototype.getMarkerBufferRanges = function() {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation, selection) {
        var range, ref1;
        if (range = (ref1 = mutation.marker) != null ? ref1.getBufferRange() : void 0) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.getBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      if (checkpoint === 'custom') {
        return this.bufferRangesForCustomCheckpoint;
      }
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.getBufferRangeForCheckpoint(checkpoint)) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.setBufferRangesForCustomCheckpoint = function(ranges) {
      return this.bufferRangesForCustomCheckpoint = ranges;
    };

    MutationManager.prototype.restoreInitialPositions = function() {
      var i, len, point, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (point = this.getInitialPointForSelection(selection)) {
          results.push(selection.cursor.setBufferPosition(point));
        }
      }
      return results;
    };

    MutationManager.prototype.restoreCursorPositions = function(options) {
      var i, isBlockwise, j, len, len1, mutation, occurrenceSelected, point, points, ref1, ref2, ref3, results, results1, selection, stay;
      stay = options.stay, occurrenceSelected = options.occurrenceSelected, isBlockwise = options.isBlockwise;
      if (isBlockwise) {
        points = [];
        this.mutationsBySelection.forEach(function(mutation, selection) {
          var ref1;
          return points.push((ref1 = mutation.bufferRangeByCheckpoint['will-select']) != null ? ref1.start : void 0);
        });
        points = points.sort(function(a, b) {
          return a.compare(b);
        });
        points = points.filter(function(point) {
          return point != null;
        });
        if (this.vimState.isMode('visual', 'blockwise')) {
          if (point = points[0]) {
            return (ref1 = this.vimState.getLastBlockwiseSelection()) != null ? ref1.setHeadBufferPosition(point) : void 0;
          }
        } else {
          if (point = points[0]) {
            return this.editor.setCursorBufferPosition(point);
          } else {
            ref2 = this.editor.getSelections();
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              selection = ref2[i];
              if (!selection.isLastSelection()) {
                results.push(selection.destroy());
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        }
      } else {
        ref3 = this.editor.getSelections();
        results1 = [];
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          selection = ref3[j];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (occurrenceSelected && !mutation.isCreatedAt('will-select')) {
            selection.destroy();
          }
          if (occurrenceSelected && stay) {
            point = this.clipToMutationEndIfSomeMutationContainsPoint(this.vimState.getOriginalCursorPosition());
            results1.push(selection.cursor.setBufferPosition(point));
          } else if (point = mutation.getRestorePoint({
            stay: stay
          })) {
            results1.push(selection.cursor.setBufferPosition(point));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    MutationManager.prototype.clipToMutationEndIfSomeMutationContainsPoint = function(point) {
      var mutation;
      if (mutation = this.findMutationContainsPointAtCheckpoint(point, 'did-select-occurrence')) {
        return Point.min(mutation.getEndBufferPosition(), point);
      } else {
        return point;
      }
    };

    MutationManager.prototype.findMutationContainsPointAtCheckpoint = function(point, checkpoint) {
      var entry, iterator, mutation;
      iterator = this.mutationsBySelection.values();
      while ((entry = iterator.next()) && !entry.done) {
        mutation = entry.value;
        if (mutation.getBufferRangeForCheckpoint(checkpoint).containsPoint(point)) {
          return mutation;
        }
      }
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, checkpoint = options.checkpoint, this.markerLayer = options.markerLayer, this.useMarker = options.useMarker;
      this.createdAt = checkpoint;
      if (this.useMarker) {
        this.initialPointMarker = this.markerLayer.markBufferPosition(this.initialPoint, {
          invalidate: 'never'
        });
      }
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.update(checkpoint);
    }

    Mutation.prototype.isCreatedAt = function(timing) {
      return this.createdAt === timing;
    };

    Mutation.prototype.update = function(checkpoint) {
      var ref1;
      if (!this.selection.getBufferRange().isEmpty()) {
        if ((ref1 = this.marker) != null) {
          ref1.destroy();
        }
        this.marker = null;
      }
      if (this.marker == null) {
        this.marker = this.markerLayer.markBufferRange(this.selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.bufferRangeByCheckpoint[checkpoint] = this.marker.getBufferRange();
    };

    Mutation.prototype.getStartBufferPosition = function() {
      return this.marker.getBufferRange().start;
    };

    Mutation.prototype.getEndBufferPosition = function() {
      var end, point, ref1, start;
      ref1 = this.marker.getBufferRange(), start = ref1.start, end = ref1.end;
      point = Point.max(start, end.translate([0, -1]));
      return this.selection.editor.clipBufferPosition(point);
    };

    Mutation.prototype.getInitialPoint = function(arg) {
      var clip, point, ref1, ref2;
      clip = (arg != null ? arg : {}).clip;
      point = (ref1 = (ref2 = this.initialPointMarker) != null ? ref2.getHeadBufferPosition() : void 0) != null ? ref1 : this.initialPoint;
      if (clip) {
        return Point.min(this.getEndBufferPosition(), point);
      } else {
        return point;
      }
    };

    Mutation.prototype.getBufferRangeForCheckpoint = function(checkpoint) {
      return this.bufferRangeByCheckpoint[checkpoint];
    };

    Mutation.prototype.getRestorePoint = function(arg) {
      var ref1, ref2, ref3, stay;
      stay = (arg != null ? arg : {}).stay;
      if (stay) {
        return this.getInitialPoint({
          clip: true
        });
      } else {
        return (ref1 = (ref2 = this.bufferRangeByCheckpoint['did-move']) != null ? ref2.start : void 0) != null ? ref1 : (ref3 = this.bufferRangeByCheckpoint['did-select']) != null ? ref3.start : void 0;
      }
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tdXRhdGlvbi1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBK0IsT0FBQSxDQUFRLE1BQVIsQ0FBL0IsRUFBQyxpQkFBRCxFQUFROztFQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBYVIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHlCQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUNYLElBQUMsQ0FBQSxTQUFVLElBQUMsQ0FBQSxTQUFYO01BRUYsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSTtNQUM1QixJQUFDLENBQUEsK0JBQUQsR0FBbUM7SUFSeEI7OzhCQVViLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxLQUFELENBQUE7TUFDQSxPQUE4QyxFQUE5QyxFQUFDLElBQUMsQ0FBQSw0QkFBQSxvQkFBRixFQUF3QixJQUFDLENBQUEsY0FBQSxNQUF6QixFQUFpQyxJQUFDLENBQUEsZ0JBQUE7YUFDbEMsT0FBcUMsRUFBckMsRUFBQyxJQUFDLENBQUEsdUNBQUEsK0JBQUYsRUFBQTtJQUhPOzs4QkFLVCxJQUFBLEdBQU0sU0FBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFVBQUQ7YUFDTCxJQUFDLENBQUEsS0FBRCxDQUFBO0lBREk7OzhCQUdOLEtB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S0FBVixFQUFpQixHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFkLENBQWpCO2FBQ1IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsa0JBQWxCLENBQXFDLEtBQXJDO0lBSG9COzt1QkFLdEIsZUFBQSxHQUFpQixTQUFDLEdBQUQ7QUFDZixVQUFBO01BRGlCLHNCQUFELE1BQU87TUFDdkIsS0FBQSw4R0FBdUQsSUFBQyxDQUFBO01BQ3hELElBQUcsSUFBSDtlQUNFLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FBVixFQUFtQyxLQUFuQyxFQURGO09BQUEsTUFBQTtlQUdFLE1BSEY7O0lBRmU7O3VCQU9qQiwyQkFBQSxHQUE2QixTQUFDLFVBQUQ7YUFDM0IsSUFBQyxDQUFBLHVCQUF3QixDQUFBLFVBQUE7SUFERTs7dUJBRzdCLGVBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsVUFBQTtNQURpQixzQkFBRCxNQUFPO01BQ3ZCLElBQUcsSUFBSDtlQUNFLElBQUMsQ0FBQSxlQUFELENBQWlCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBakIsRUFERjtPQUFBLE1BQUE7MkxBR3NGLENBQUUsZUFIeEY7O0lBRGU7Ozs7O0FBL0tuQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG4jIGtlZXAgbXV0YXRpb24gc25hcHNob3QgbmVjZXNzYXJ5IGZvciBPcGVyYXRvciBwcm9jZXNzaW5nLlxuIyBtdXRhdGlvbiBzdG9yZWQgYnkgZWFjaCBTZWxlY3Rpb24gaGF2ZSBmb2xsb3dpbmcgZmllbGRcbiMgIG1hcmtlcjpcbiMgICAgbWFya2VyIHRvIHRyYWNrIG11dGF0aW9uLiBtYXJrZXIgaXMgY3JlYXRlZCB3aGVuIGBzZXRDaGVja3BvaW50YFxuIyAgY3JlYXRlZEF0OlxuIyAgICAnc3RyaW5nJyByZXByZXNlbnRpbmcgd2hlbiBtYXJrZXIgd2FzIGNyZWF0ZWQuXG4jICBjaGVja3BvaW50OiB7fVxuIyAgICBrZXkgaXMgWyd3aWxsLXNlbGVjdCcsICdkaWQtc2VsZWN0JywgJ3dpbGwtbXV0YXRlJywgJ2RpZC1tdXRhdGUnXVxuIyAgICBrZXkgaXMgY2hlY2twb2ludCwgdmFsdWUgaXMgYnVmZmVyUmFuZ2UgZm9yIG1hcmtlciBhdCB0aGF0IGNoZWNrcG9pbnRcbiMgIHNlbGVjdGlvbjpcbiMgICAgU2VsZWN0aW9uIGJlZWluZyB0cmFja2VkXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNdXRhdGlvbk1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3J9ID0gQHZpbVN0YXRlXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIEBidWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50ID0gW11cblxuICBkZXN0cm95OiAtPlxuICAgIEByZXNldCgpXG4gICAge0BtdXRhdGlvbnNCeVNlbGVjdGlvbiwgQGVkaXRvciwgQHZpbVN0YXRlfSA9IHt9XG4gICAge0BidWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50fSA9IHt9XG5cbiAgaW5pdDogKEBvcHRpb25zKSAtPlxuICAgIEByZXNldCgpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIEBidWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50ID0gW11cblxuICBnZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24sIG9wdGlvbnMpIC0+XG4gICAgQGdldE11dGF0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbik/LmdldEluaXRpYWxQb2ludChvcHRpb25zKVxuXG4gIHNldENoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGlmIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikudXBkYXRlKGNoZWNrcG9pbnQpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIEB2aW1TdGF0ZS5pc01vZGUoJ3Zpc3VhbCcpXG4gICAgICAgICAgaW5pdGlhbFBvaW50ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpbml0aWFsUG9pbnQgPSBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJylcblxuICAgICAgICBvcHRpb25zID0ge3NlbGVjdGlvbiwgaW5pdGlhbFBvaW50LCBjaGVja3BvaW50LCBAbWFya2VyTGF5ZXIsIHVzZU1hcmtlcjogQG9wdGlvbnMudXNlTWFya2VyfVxuICAgICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgbmV3IE11dGF0aW9uKG9wdGlvbnMpKVxuXG4gIGdldE11dGF0aW9uRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuXG4gIGdldE1hcmtlckJ1ZmZlclJhbmdlczogLT5cbiAgICByYW5nZXMgPSBbXVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5mb3JFYWNoIChtdXRhdGlvbiwgc2VsZWN0aW9uKSAtPlxuICAgICAgaWYgcmFuZ2UgPSBtdXRhdGlvbi5tYXJrZXI/LmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgZ2V0QnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludDogKGNoZWNrcG9pbnQpIC0+XG4gICAgIyBbRklYTUVdIGRpcnR5IHdvcmthcm91bmQganVzdCB1c2luZyBtdXRhdGlvbk1hbmFnZXIgYXMgbWVyZWx5IHN0YXRlIHJlZ2lzdHJ5XG4gICAgaWYgY2hlY2twb2ludCBpcyAnY3VzdG9tJ1xuICAgICAgcmV0dXJuIEBidWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50XG5cbiAgICByYW5nZXMgPSBbXVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5mb3JFYWNoIChtdXRhdGlvbikgLT5cbiAgICAgIGlmIHJhbmdlID0gbXV0YXRpb24uZ2V0QnVmZmVyUmFuZ2VGb3JDaGVja3BvaW50KGNoZWNrcG9pbnQpXG4gICAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICAgIHJhbmdlc1xuXG4gICMgW0ZJWE1FXSBkaXJ0eSB3b3JrYXJvdW5kIGp1c3QgdXNpbmcgbXV0YXRpb25tYW5hZ2VyIGZvciBzdGF0ZSByZWdpc3RyeVxuICBzZXRCdWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50OiAocmFuZ2VzKSAtPlxuICAgIEBidWZmZXJSYW5nZXNGb3JDdXN0b21DaGVja3BvaW50ID0gcmFuZ2VzXG5cbiAgcmVzdG9yZUluaXRpYWxQb3NpdGlvbnM6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIHBvaW50ID0gQGdldEluaXRpYWxQb2ludEZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnM6IChvcHRpb25zKSAtPlxuICAgIHtzdGF5LCBvY2N1cnJlbmNlU2VsZWN0ZWQsIGlzQmxvY2t3aXNlfSA9IG9wdGlvbnNcbiAgICBpZiBpc0Jsb2Nrd2lzZVxuICAgICAgIyBbRklYTUVdIHdoeSBJIG5lZWQgdGhpcyBkaXJlY3QgbWFudXBpbGF0aW9uP1xuICAgICAgIyBCZWNhdXNlIHRoZXJlJ3MgYnVnIHRoYXQgYmxvY2t3aXNlIHNlbGVjY3Rpb24gaXMgbm90IGFkZGVzIHRvIGVhY2hcbiAgICAgICMgYnNJbnN0YW5jZS5zZWxlY3Rpb24uIE5lZWQgaW52ZXN0aWdhdGlvbi5cbiAgICAgIHBvaW50cyA9IFtdXG4gICAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZm9yRWFjaCAobXV0YXRpb24sIHNlbGVjdGlvbikgLT5cbiAgICAgICAgcG9pbnRzLnB1c2gobXV0YXRpb24uYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbJ3dpbGwtc2VsZWN0J10/LnN0YXJ0KVxuICAgICAgcG9pbnRzID0gcG9pbnRzLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuICAgICAgcG9pbnRzID0gcG9pbnRzLmZpbHRlciAocG9pbnQpIC0+IHBvaW50P1xuICAgICAgaWYgQHZpbVN0YXRlLmlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICAgIGlmIHBvaW50ID0gcG9pbnRzWzBdXG4gICAgICAgICAgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKT8uc2V0SGVhZEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgZWxzZVxuICAgICAgICBpZiBwb2ludCA9IHBvaW50c1swXVxuICAgICAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgICBzZWxlY3Rpb24uZGVzdHJveSgpIHVubGVzcyBzZWxlY3Rpb24uaXNMYXN0U2VsZWN0aW9uKClcbiAgICBlbHNlXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgaWYgb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBub3QgbXV0YXRpb24uaXNDcmVhdGVkQXQoJ3dpbGwtc2VsZWN0JylcbiAgICAgICAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG5cbiAgICAgICAgaWYgb2NjdXJyZW5jZVNlbGVjdGVkIGFuZCBzdGF5XG4gICAgICAgICAgIyBUaGlzIGlzIGVzc2VuY2lhbGx5IHRvIGNsaXBUb011dGF0aW9uRW5kIHdoZW4gYGQgbyBmYCwgYGQgbyBwYCBjYXNlLlxuICAgICAgICAgIHBvaW50ID0gQGNsaXBUb011dGF0aW9uRW5kSWZTb21lTXV0YXRpb25Db250YWluc1BvaW50KEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG4gICAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgICAgZWxzZSBpZiBwb2ludCA9IG11dGF0aW9uLmdldFJlc3RvcmVQb2ludCh7c3RheX0pXG4gICAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBjbGlwVG9NdXRhdGlvbkVuZElmU29tZU11dGF0aW9uQ29udGFpbnNQb2ludDogKHBvaW50KSAtPlxuICAgIGlmIG11dGF0aW9uID0gQGZpbmRNdXRhdGlvbkNvbnRhaW5zUG9pbnRBdENoZWNrcG9pbnQocG9pbnQsICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnKVxuICAgICAgUG9pbnQubWluKG11dGF0aW9uLmdldEVuZEJ1ZmZlclBvc2l0aW9uKCksIHBvaW50KVxuICAgIGVsc2VcbiAgICAgIHBvaW50XG5cbiAgZmluZE11dGF0aW9uQ29udGFpbnNQb2ludEF0Q2hlY2twb2ludDogKHBvaW50LCBjaGVja3BvaW50KSAtPlxuICAgICMgQ29mZmVlc2NyaXB0IGNhbm5vdCBpdGVyYXRlIG92ZXIgaXRlcmF0b3IgYnkgSmF2YVNjcmlwdCdzICdvZicgYmVjYXVzZSBvZiBzeW50YXggY29uZmxpY3RzLlxuICAgIGl0ZXJhdG9yID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLnZhbHVlcygpXG4gICAgd2hpbGUgKGVudHJ5ID0gaXRlcmF0b3IubmV4dCgpKSBhbmQgbm90IGVudHJ5LmRvbmVcbiAgICAgIG11dGF0aW9uID0gZW50cnkudmFsdWVcbiAgICAgIGlmIG11dGF0aW9uLmdldEJ1ZmZlclJhbmdlRm9yQ2hlY2twb2ludChjaGVja3BvaW50KS5jb250YWluc1BvaW50KHBvaW50KVxuICAgICAgICByZXR1cm4gbXV0YXRpb25cblxuIyBNdXRhdGlvbiBpbmZvcm1hdGlvbiBpcyBjcmVhdGVkIGV2ZW4gaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuIyBTbyB0aGF0IHdlIGNhbiBmaWx0ZXIgc2VsZWN0aW9uIGJ5IHdoZW4gaXQgd2FzIGNyZWF0ZWQuXG4jICBlLmcuIFNvbWUgc2VsZWN0aW9uIGlzIGNyZWF0ZWQgYXQgJ3dpbGwtc2VsZWN0JyBjaGVja3BvaW50LCBvdGhlcnMgYXQgJ2RpZC1zZWxlY3QnIG9yICdkaWQtc2VsZWN0LW9jY3VycmVuY2UnXG5jbGFzcyBNdXRhdGlvblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAge0BzZWxlY3Rpb24sIEBpbml0aWFsUG9pbnQsIGNoZWNrcG9pbnQsIEBtYXJrZXJMYXllciwgQHVzZU1hcmtlcn0gPSBvcHRpb25zXG5cbiAgICBAY3JlYXRlZEF0ID0gY2hlY2twb2ludFxuICAgIGlmIEB1c2VNYXJrZXJcbiAgICAgIEBpbml0aWFsUG9pbnRNYXJrZXIgPSBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclBvc2l0aW9uKEBpbml0aWFsUG9pbnQsIGludmFsaWRhdGU6ICduZXZlcicpXG4gICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50ID0ge31cbiAgICBAbWFya2VyID0gbnVsbFxuICAgIEB1cGRhdGUoY2hlY2twb2ludClcblxuICBpc0NyZWF0ZWRBdDogKHRpbWluZykgLT5cbiAgICBAY3JlYXRlZEF0IGlzIHRpbWluZ1xuXG4gIHVwZGF0ZTogKGNoZWNrcG9pbnQpIC0+XG4gICAgIyBDdXJyZW50IG5vbi1lbXB0eSBzZWxlY3Rpb24gaXMgcHJpb3JpdGl6ZWQgb3ZlciBleGlzdGluZyBtYXJrZXIncyByYW5nZS5cbiAgICAjIFdlIGludmFsaWRhdGUgb2xkIG1hcmtlciB0byByZS10cmFjayBmcm9tIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgIHVubGVzcyBAc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNFbXB0eSgpXG4gICAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICAgIEBtYXJrZXIgPSBudWxsXG5cbiAgICBAbWFya2VyID89IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UoQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFtjaGVja3BvaW50XSA9IEBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldFN0YXJ0QnVmZmVyUG9zaXRpb246IC0+XG4gICAgQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG5cbiAgZ2V0RW5kQnVmZmVyUG9zaXRpb246IC0+XG4gICAge3N0YXJ0LCBlbmR9ID0gQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgcG9pbnQgPSBQb2ludC5tYXgoc3RhcnQsIGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG4gICAgQHNlbGVjdGlvbi5lZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGdldEluaXRpYWxQb2ludDogKHtjbGlwfT17fSkgLT5cbiAgICBwb2ludCA9IEBpbml0aWFsUG9pbnRNYXJrZXI/LmdldEhlYWRCdWZmZXJQb3NpdGlvbigpID8gQGluaXRpYWxQb2ludFxuICAgIGlmIGNsaXBcbiAgICAgIFBvaW50Lm1pbihAZ2V0RW5kQnVmZmVyUG9zaXRpb24oKSwgcG9pbnQpXG4gICAgZWxzZVxuICAgICAgcG9pbnRcblxuICBnZXRCdWZmZXJSYW5nZUZvckNoZWNrcG9pbnQ6IChjaGVja3BvaW50KSAtPlxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFtjaGVja3BvaW50XVxuXG4gIGdldFJlc3RvcmVQb2ludDogKHtzdGF5fT17fSkgLT5cbiAgICBpZiBzdGF5XG4gICAgICBAZ2V0SW5pdGlhbFBvaW50KGNsaXA6IHRydWUpXG4gICAgZWxzZVxuICAgICAgQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50WydkaWQtbW92ZSddPy5zdGFydCA/IEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludFsnZGlkLXNlbGVjdCddPy5zdGFydFxuIl19
