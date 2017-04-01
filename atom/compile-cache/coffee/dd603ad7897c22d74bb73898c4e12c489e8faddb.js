(function() {
  var Point, SublimeSelectEditorHandler,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('atom').Point;

  module.exports = SublimeSelectEditorHandler = (function() {
    function SublimeSelectEditorHandler(editor, inputCfg) {
      this.onRangeChange = bind(this.onRangeChange, this);
      this.onBlur = bind(this.onBlur, this);
      this.onMouseEventToHijack = bind(this.onMouseEventToHijack, this);
      this.onMouseMove = bind(this.onMouseMove, this);
      this.onMouseDown = bind(this.onMouseDown, this);
      this.editor = editor;
      this.inputCfg = inputCfg;
      this._resetState();
      this._setup_vars();
    }

    SublimeSelectEditorHandler.prototype.subscribe = function() {
      this.selection_observer = this.editor.onDidChangeSelectionRange(this.onRangeChange);
      this.editorElement.addEventListener('mousedown', this.onMouseDown);
      this.editorElement.addEventListener('mousemove', this.onMouseMove);
      this.editorElement.addEventListener('mouseup', this.onMouseEventToHijack);
      this.editorElement.addEventListener('mouseleave', this.onMouseEventToHijack);
      this.editorElement.addEventListener('mouseenter', this.onMouseEventToHijack);
      this.editorElement.addEventListener('contextmenu', this.onMouseEventToHijack);
      return this.editorElement.addEventListener('blur', this.onBlur);
    };

    SublimeSelectEditorHandler.prototype.unsubscribe = function() {
      this._resetState();
      this.selection_observer.dispose();
      this.editorElement.removeEventListener('mousedown', this.onMouseDown);
      this.editorElement.removeEventListener('mousemove', this.onMouseMove);
      this.editorElement.removeEventListener('mouseup', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('mouseleave', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('mouseenter', this.onMouseEventToHijack);
      this.editorElement.removeEventListener('contextmenu', this.onMouseEventToHijack);
      return this.editorElement.removeEventListener('blur', this.onBlur);
    };

    SublimeSelectEditorHandler.prototype.onMouseDown = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        return false;
      }
      if (this._mainMouseAndKeyDown(e)) {
        this._resetState();
        this.mouseStartPos = this._screenPositionForMouseEvent(e);
        this.mouseEndPos = this.mouseStartPos;
        e.preventDefault();
        return false;
      }
    };

    SublimeSelectEditorHandler.prototype.onMouseMove = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        if (this._mainMouseDown(e)) {
          this.mouseEndPos = this._screenPositionForMouseEvent(e);
          if (this.mouseEndPos.isEqual(this.mouseEndPosPrev)) {
            return;
          }
          this._selectBoxAroundCursors();
          this.mouseEndPosPrev = this.mouseEndPos;
          return false;
        }
        if (e.which === 0) {
          return this._resetState();
        }
      }
    };

    SublimeSelectEditorHandler.prototype.onMouseEventToHijack = function(e) {
      if (this.mouseStartPos) {
        e.preventDefault();
        return false;
      }
    };

    SublimeSelectEditorHandler.prototype.onBlur = function(e) {
      return this._resetState();
    };

    SublimeSelectEditorHandler.prototype.onRangeChange = function(newVal) {
      if (this.mouseStartPos && !newVal.selection.isSingleScreenLine()) {
        newVal.selection.destroy();
        return this._selectBoxAroundCursors();
      }
    };

    SublimeSelectEditorHandler.prototype._resetState = function() {
      this.mouseStartPos = null;
      return this.mouseEndPos = null;
    };

    SublimeSelectEditorHandler.prototype._setup_vars = function() {
      if (this.editorElement == null) {
        this.editorElement = atom.views.getView(this.editor);
      }
      return this.editorComponent != null ? this.editorComponent : this.editorComponent = this.editorElement.component;
    };

    SublimeSelectEditorHandler.prototype._screenPositionForMouseEvent = function(e) {
      var column, defaultCharWidth, pixelPosition, row, targetLeft, targetTop;
      this._setup_vars();
      pixelPosition = this.editorComponent.pixelPositionForMouseEvent(e);
      targetTop = pixelPosition.top;
      targetLeft = pixelPosition.left;
      defaultCharWidth = this.editor.getDefaultCharWidth();
      row = Math.floor(targetTop / this.editor.getLineHeightInPixels());
      if (row > this.editor.getLastBufferRow()) {
        targetLeft = 2e308;
      }
      row = Math.min(row, this.editor.getLastBufferRow());
      row = Math.max(0, row);
      column = Math.round(targetLeft / defaultCharWidth);
      return new Point(row, column);
    };

    SublimeSelectEditorHandler.prototype._mainMouseDown = function(e) {
      return e.which === this.inputCfg.mouseNum;
    };

    SublimeSelectEditorHandler.prototype._mainMouseAndKeyDown = function(e) {
      if (this.inputCfg.selectKey) {
        return this._mainMouseDown(e) && e[this.inputCfg.selectKey];
      } else {
        return this._mainMouseDown(e);
      }
    };

    SublimeSelectEditorHandler.prototype._numCharsInScreenRange = function(screenRange) {
      var bufferRange, contentsOfRange;
      bufferRange = this.editor.bufferRangeForScreenRange(screenRange);
      contentsOfRange = this.editor.getTextInBufferRange(bufferRange);
      return contentsOfRange.length;
    };

    SublimeSelectEditorHandler.prototype._selectBoxAroundCursors = function() {
      var emptyRanges, finalRanges, i, isReversed, numChars, range, ranges, ref, ref1, row;
      if (this.mouseStartPos && this.mouseEndPos) {
        emptyRanges = [];
        ranges = [];
        for (row = i = ref = this.mouseStartPos.row, ref1 = this.mouseEndPos.row; ref <= ref1 ? i <= ref1 : i >= ref1; row = ref <= ref1 ? ++i : --i) {
          if (this.mouseEndPos.column < 0) {
            this.mouseEndPos.column = 0;
          }
          range = [[row, this.mouseStartPos.column], [row, this.mouseEndPos.column]];
          numChars = this._numCharsInScreenRange(range);
          if (numChars === 0) {
            emptyRanges.push(range);
          } else {
            ranges.push(range);
          }
        }
        finalRanges = ranges.length ? ranges : emptyRanges;
        if (finalRanges.length) {
          isReversed = this.mouseEndPos.column < this.mouseStartPos.column;
          return this.editor.setSelectedScreenRanges(finalRanges, {
            reversed: isReversed
          });
        }
      }
    };

    return SublimeSelectEditorHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9TdWJsaW1lLVN0eWxlLUNvbHVtbi1TZWxlY3Rpb24vbGliL2VkaXRvci1oYW5kbGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7SUFDUyxvQ0FBQyxNQUFELEVBQVMsUUFBVDs7Ozs7O01BQ1gsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsV0FBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQUpXOzt5Q0FNYixTQUFBLEdBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLHlCQUFSLENBQWtDLElBQUMsQ0FBQSxhQUFuQztNQUN0QixJQUFDLENBQUEsYUFBYSxDQUFDLGdCQUFmLENBQWdDLFdBQWhDLEVBQStDLElBQUMsQ0FBQSxXQUFoRDtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsV0FBaEMsRUFBK0MsSUFBQyxDQUFBLFdBQWhEO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxTQUFoQyxFQUErQyxJQUFDLENBQUEsb0JBQWhEO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxZQUFoQyxFQUErQyxJQUFDLENBQUEsb0JBQWhEO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxZQUFoQyxFQUErQyxJQUFDLENBQUEsb0JBQWhEO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFBZixDQUFnQyxhQUFoQyxFQUErQyxJQUFDLENBQUEsb0JBQWhEO2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxnQkFB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QUFSLENBQWdDLFdBQWhDLEVBQTZDO1lBQUMsUUFBQSxFQUFVLFVBQVg7V0FBN0MsRUFGRjtTQWRGOztJQUR1Qjs7Ozs7QUFuSDdCIiwic291cmNlc0NvbnRlbnQiOlsie1BvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgU3VibGltZVNlbGVjdEVkaXRvckhhbmRsZXJcbiAgICBjb25zdHJ1Y3RvcjogKGVkaXRvciwgaW5wdXRDZmcpIC0+XG4gICAgICBAZWRpdG9yID0gZWRpdG9yXG4gICAgICBAaW5wdXRDZmcgPSBpbnB1dENmZ1xuICAgICAgQF9yZXNldFN0YXRlKClcbiAgICAgIEBfc2V0dXBfdmFycygpXG5cbiAgICBzdWJzY3JpYmU6IC0+XG4gICAgICBAc2VsZWN0aW9uX29ic2VydmVyID0gQGVkaXRvci5vbkRpZENoYW5nZVNlbGVjdGlvblJhbmdlIEBvblJhbmdlQ2hhbmdlXG4gICAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgIEBvbk1vdXNlRG93blxuICAgICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgICBAb25Nb3VzZU1vdmVcbiAgICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAgICAgQG9uTW91c2VFdmVudFRvSGlqYWNrXG4gICAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWxlYXZlJywgIEBvbk1vdXNlRXZlbnRUb0hpamFja1xuICAgICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2VlbnRlcicsICBAb25Nb3VzZUV2ZW50VG9IaWphY2tcbiAgICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgQG9uTW91c2VFdmVudFRvSGlqYWNrXG4gICAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdibHVyJywgICAgICAgIEBvbkJsdXJcblxuICAgIHVuc3Vic2NyaWJlOiAtPlxuICAgICAgQF9yZXNldFN0YXRlKClcbiAgICAgIEBzZWxlY3Rpb25fb2JzZXJ2ZXIuZGlzcG9zZSgpXG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgIEBvbk1vdXNlRG93blxuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgICBAb25Nb3VzZU1vdmVcbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAgICAgQG9uTW91c2VFdmVudFRvSGlqYWNrXG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZWxlYXZlJywgIEBvbk1vdXNlRXZlbnRUb0hpamFja1xuICAgICAgQGVkaXRvckVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2VlbnRlcicsICBAb25Nb3VzZUV2ZW50VG9IaWphY2tcbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbnRleHRtZW51JywgQG9uTW91c2VFdmVudFRvSGlqYWNrXG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdibHVyJywgICAgICAgIEBvbkJsdXJcblxuICAgICMgLS0tLS0tLVxuICAgICMgRXZlbnQgSGFuZGxlcnNcbiAgICAjIC0tLS0tLS1cblxuICAgIG9uTW91c2VEb3duOiAoZSkgPT5cbiAgICAgIGlmIEBtb3VzZVN0YXJ0UG9zXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgaWYgQF9tYWluTW91c2VBbmRLZXlEb3duKGUpXG4gICAgICAgIEBfcmVzZXRTdGF0ZSgpXG4gICAgICAgIEBtb3VzZVN0YXJ0UG9zID0gQF9zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZSlcbiAgICAgICAgQG1vdXNlRW5kUG9zICAgPSBAbW91c2VTdGFydFBvc1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBvbk1vdXNlTW92ZTogKGUpID0+XG4gICAgICBpZiBAbW91c2VTdGFydFBvc1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgaWYgQF9tYWluTW91c2VEb3duKGUpXG4gICAgICAgICAgQG1vdXNlRW5kUG9zID0gQF9zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZSlcbiAgICAgICAgICByZXR1cm4gaWYgQG1vdXNlRW5kUG9zLmlzRXF1YWwgQG1vdXNlRW5kUG9zUHJldlxuICAgICAgICAgIEBfc2VsZWN0Qm94QXJvdW5kQ3Vyc29ycygpXG4gICAgICAgICAgQG1vdXNlRW5kUG9zUHJldiA9IEBtb3VzZUVuZFBvc1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBpZiBlLndoaWNoID09IDBcbiAgICAgICAgICBAX3Jlc2V0U3RhdGUoKVxuXG4gICAgIyBIaWphY2sgYWxsIHRoZSBtb3VzZSBldmVudHMgd2hpbGUgc2VsZWN0aW5nXG4gICAgb25Nb3VzZUV2ZW50VG9IaWphY2s6IChlKSA9PlxuICAgICAgaWYgQG1vdXNlU3RhcnRQb3NcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgb25CbHVyOiAoZSkgPT5cbiAgICAgIEBfcmVzZXRTdGF0ZSgpXG5cbiAgICBvblJhbmdlQ2hhbmdlOiAobmV3VmFsKSA9PlxuICAgICAgaWYgQG1vdXNlU3RhcnRQb3MgYW5kICFuZXdWYWwuc2VsZWN0aW9uLmlzU2luZ2xlU2NyZWVuTGluZSgpXG4gICAgICAgIG5ld1ZhbC5zZWxlY3Rpb24uZGVzdHJveSgpXG4gICAgICAgIEBfc2VsZWN0Qm94QXJvdW5kQ3Vyc29ycygpXG5cbiAgICAjIC0tLS0tLS1cbiAgICAjIE1ldGhvZHNcbiAgICAjIC0tLS0tLS1cblxuICAgIF9yZXNldFN0YXRlOiAtPlxuICAgICAgQG1vdXNlU3RhcnRQb3MgPSBudWxsXG4gICAgICBAbW91c2VFbmRQb3MgICA9IG51bGxcblxuICAgIF9zZXR1cF92YXJzOiAtPlxuICAgICAgQGVkaXRvckVsZW1lbnQgPz0gYXRvbS52aWV3cy5nZXRWaWV3IEBlZGl0b3JcbiAgICAgIEBlZGl0b3JDb21wb25lbnQgPz0gQGVkaXRvckVsZW1lbnQuY29tcG9uZW50XG5cbiAgICAjIEkgaGFkIHRvIGNyZWF0ZSBteSBvd24gdmVyc2lvbiBvZiBAZWRpdG9yQ29tcG9uZW50LnNjcmVlblBvc2l0aW9uRnJvbU1vdXNlRXZlbnRcbiAgICBfc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50OiAoZSkgLT5cbiAgICAgIEBfc2V0dXBfdmFycygpXG4gICAgICBwaXhlbFBvc2l0aW9uICAgID0gQGVkaXRvckNvbXBvbmVudC5waXhlbFBvc2l0aW9uRm9yTW91c2VFdmVudChlKVxuICAgICAgdGFyZ2V0VG9wICAgICAgICA9IHBpeGVsUG9zaXRpb24udG9wXG4gICAgICB0YXJnZXRMZWZ0ICAgICAgID0gcGl4ZWxQb3NpdGlvbi5sZWZ0XG4gICAgICBkZWZhdWx0Q2hhcldpZHRoID0gQGVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKClcbiAgICAgIHJvdyAgICAgICAgICAgICAgPSBNYXRoLmZsb29yKHRhcmdldFRvcCAvIEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkpXG4gICAgICB0YXJnZXRMZWZ0ICAgICAgID0gSW5maW5pdHkgaWYgcm93ID4gQGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KClcbiAgICAgIHJvdyAgICAgICAgICAgICAgPSBNYXRoLm1pbihyb3csIEBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKVxuICAgICAgcm93ICAgICAgICAgICAgICA9IE1hdGgubWF4KDAsIHJvdylcbiAgICAgIGNvbHVtbiAgICAgICAgICAgPSBNYXRoLnJvdW5kICh0YXJnZXRMZWZ0KSAvIGRlZmF1bHRDaGFyV2lkdGhcbiAgICAgIG5ldyBQb2ludChyb3csIGNvbHVtbilcblxuICAgICMgbWV0aG9kcyBmb3IgY2hlY2tpbmcgbW91c2Uva2V5IHN0YXRlIGFnYWluc3QgY29uZmlnXG4gICAgX21haW5Nb3VzZURvd246IChlKSAtPlxuICAgICAgZS53aGljaCBpcyBAaW5wdXRDZmcubW91c2VOdW1cblxuICAgIF9tYWluTW91c2VBbmRLZXlEb3duOiAoZSkgLT5cbiAgICAgIGlmIEBpbnB1dENmZy5zZWxlY3RLZXlcbiAgICAgICAgQF9tYWluTW91c2VEb3duKGUpIGFuZCBlW0BpbnB1dENmZy5zZWxlY3RLZXldXG4gICAgICBlbHNlXG4gICAgICAgIEBfbWFpbk1vdXNlRG93bihlKVxuXG4gICAgX251bUNoYXJzSW5TY3JlZW5SYW5nZTogKHNjcmVlblJhbmdlKSAtPlxuICAgICAgYnVmZmVyUmFuZ2UgPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG4gICAgICBjb250ZW50c09mUmFuZ2UgPSBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlKVxuICAgICAgY29udGVudHNPZlJhbmdlLmxlbmd0aFxuXG4gICAgIyBEbyB0aGUgYWN0dWFsIHNlbGVjdGluZ1xuICAgIF9zZWxlY3RCb3hBcm91bmRDdXJzb3JzOiAtPlxuICAgICAgaWYgQG1vdXNlU3RhcnRQb3MgYW5kIEBtb3VzZUVuZFBvc1xuICAgICAgICBlbXB0eVJhbmdlcyA9IFtdXG4gICAgICAgIHJhbmdlcyA9IFtdXG5cbiAgICAgICAgZm9yIHJvdyBpbiBbQG1vdXNlU3RhcnRQb3Mucm93Li5AbW91c2VFbmRQb3Mucm93XVxuICAgICAgICAgIEBtb3VzZUVuZFBvcy5jb2x1bW4gPSAwIGlmIEBtb3VzZUVuZFBvcy5jb2x1bW4gPCAwXG4gICAgICAgICAgcmFuZ2UgPSBbW3JvdywgQG1vdXNlU3RhcnRQb3MuY29sdW1uXSwgW3JvdywgQG1vdXNlRW5kUG9zLmNvbHVtbl1dXG4gICAgICAgICAgbnVtQ2hhcnMgPSBAX251bUNoYXJzSW5TY3JlZW5SYW5nZShyYW5nZSlcbiAgICAgICAgICBpZiBudW1DaGFycyA9PSAwXG4gICAgICAgICAgICBlbXB0eVJhbmdlcy5wdXNoIHJhbmdlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFuZ2VzLnB1c2ggcmFuZ2VcblxuICAgICAgICBmaW5hbFJhbmdlcyA9IGlmIHJhbmdlcy5sZW5ndGggdGhlbiByYW5nZXMgZWxzZSBlbXB0eVJhbmdlc1xuICAgICAgICBpZiBmaW5hbFJhbmdlcy5sZW5ndGhcbiAgICAgICAgICBpc1JldmVyc2VkID0gQG1vdXNlRW5kUG9zLmNvbHVtbiA8IEBtb3VzZVN0YXJ0UG9zLmNvbHVtblxuICAgICAgICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRTY3JlZW5SYW5nZXMgZmluYWxSYW5nZXMsIHtyZXZlcnNlZDogaXNSZXZlcnNlZH1cbiJdfQ==
