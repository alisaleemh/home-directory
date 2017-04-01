(function() {
  var Point, SublimeSelectEditorHandler,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('atom').Point;

  module.exports = SublimeSelectEditorHandler = (function() {
    function SublimeSelectEditorHandler(editor, inputCfg) {
      this.onRangeChange = __bind(this.onRangeChange, this);
      this.onBlur = __bind(this.onBlur, this);
      this.onMouseEventToHijack = __bind(this.onMouseEventToHijack, this);
      this.onMouseMove = __bind(this.onMouseMove, this);
      this.onMouseDown = __bind(this.onMouseDown, this);
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
        targetLeft = Infinity;
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

    SublimeSelectEditorHandler.prototype._selectBoxAroundCursors = function() {
      var isReversed, range, ranges, row, rowLength, _i, _ref, _ref1;
      if (this.mouseStartPos && this.mouseEndPos) {
        ranges = [];
        for (row = _i = _ref = this.mouseStartPos.row, _ref1 = this.mouseEndPos.row; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
          if (this.mouseEndPos.column < 0) {
            this.mouseEndPos.column = 0;
          }
          rowLength = this.editor.lineTextForScreenRow(row).length;
          if (rowLength > this.mouseStartPos.column || rowLength > this.mouseEndPos.column) {
            range = [[row, this.mouseStartPos.column], [row, this.mouseEndPos.column]];
            ranges.push(range);
          }
        }
        if (ranges.length) {
          isReversed = this.mouseEndPos.column < this.mouseStartPos.column;
          return this.editor.setSelectedScreenRanges(ranges, {
            reversed: isReversed
          });
        }
      }
    };

    return SublimeSelectEditorHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9TdWJsaW1lLVN0eWxlLUNvbHVtbi1TZWxlY3Rpb24vbGliL2VkaXRvci1oYW5kbGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7QUFDUyxJQUFBLG9DQUFDLE1BQUQsRUFBUyxRQUFULEdBQUE7QUFDWCwyREFBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHlFQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFEWixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUhBLENBRFc7SUFBQSxDQUFiOztBQUFBLHlDQU1BLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLHlCQUFSLENBQWtDLElBQUMsQ0FBQSxhQUFuQyxDQUF0QixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLGdCQUFmLENBQWdDLFdBQWhDLEVBQStDLElBQUMsQ0FBQSxXQUFoRCxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsV0FBaEMsRUFBK0MsSUFBQyxDQUFBLFdBQWhELENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGFBQWEs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

//# sourceURL=/home/alisaleemh/.atom/packages/Sublime-Style-Column-Selection/lib/editor-handler.coffee
