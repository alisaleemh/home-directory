(function() {
  var CompositeDisposable, CursorStyleManager, Disposable, Point, getCursorNode, getOffset, isSpecMode, lineHeight, ref, setStyle, swrap,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  swrap = require('./selection-wrapper');

  isSpecMode = atom.inSpecMode();

  lineHeight = null;

  getCursorNode = function(editorElement, cursor) {
    var cursorsComponent;
    cursorsComponent = editorElement.component.linesComponent.cursorsComponent;
    return cursorsComponent.cursorNodesById[cursor.id];
  };

  getOffset = function(submode, cursor) {
    var bufferPoint, editor, offset, screenPoint, selection;
    selection = cursor.selection;
    switch (submode) {
      case 'characterwise':
        if (selection.isReversed()) {
          return;
        }
        if (cursor.isAtBeginningOfLine()) {
          return new Point(-1, 0);
        } else {
          return new Point(0, -1);
        }
        break;
      case 'blockwise':
        if (cursor.isAtBeginningOfLine() || selection.isReversed()) {
          return;
        }
        return new Point(0, -1);
      case 'linewise':
        bufferPoint = swrap(selection).getBufferPositionFor('head', {
          from: ['property']
        });
        editor = cursor.editor;
        if (editor.isSoftWrapped()) {
          screenPoint = editor.screenPositionForBufferPosition(bufferPoint);
          offset = screenPoint.traversalFrom(cursor.getScreenPosition());
        } else {
          offset = bufferPoint.traversalFrom(cursor.getBufferPosition());
        }
        if (!selection.isReversed() && cursor.isAtBeginningOfLine()) {
          offset.row = -1;
        }
        return offset;
    }
  };

  setStyle = function(style, arg) {
    var column, row;
    row = arg.row, column = arg.column;
    if (row !== 0) {
      style.setProperty('top', (row * lineHeight) + "em");
    }
    if (column !== 0) {
      style.setProperty('left', column + "ch");
    }
    return new Disposable(function() {
      style.removeProperty('top');
      return style.removeProperty('left');
    });
  };

  CursorStyleManager = (function() {
    function CursorStyleManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.lineHeightObserver = atom.config.observe('editor.lineHeight', (function(_this) {
        return function(newValue) {
          lineHeight = newValue;
          return _this.refresh();
        };
      })(this));
    }

    CursorStyleManager.prototype.destroy = function() {
      var ref1, ref2;
      if ((ref1 = this.styleDisporser) != null) {
        ref1.dispose();
      }
      this.lineHeightObserver.dispose();
      return ref2 = {}, this.styleDisporser = ref2.styleDisporser, this.lineHeightObserver = ref2.lineHeightObserver, ref2;
    };

    CursorStyleManager.prototype.refresh = function() {
      var cursor, cursorNode, cursors, cursorsToShow, i, j, len, len1, mode, offset, ref1, ref2, results, submode;
      ref1 = this.vimState, mode = ref1.mode, submode = ref1.submode;
      if ((ref2 = this.styleDisporser) != null) {
        ref2.dispose();
      }
      this.styleDisporser = new CompositeDisposable;
      if (!(mode === 'visual' && this.vimState.getConfig('showCursorInVisualMode'))) {
        return;
      }
      cursors = cursorsToShow = this.editor.getCursors();
      if (submode === 'blockwise') {
        cursorsToShow = this.vimState.getBlockwiseSelections().map(function(bs) {
          return bs.getHeadSelection().cursor;
        });
      }
      for (i = 0, len = cursors.length; i < len; i++) {
        cursor = cursors[i];
        if (indexOf.call(cursorsToShow, cursor) >= 0) {
          if (!cursor.isVisible()) {
            cursor.setVisible(true);
          }
        } else {
          if (cursor.isVisible()) {
            cursor.setVisible(false);
          }
        }
      }
      if (isSpecMode) {
        return;
      }
      this.editorElement.component.updateSync();
      results = [];
      for (j = 0, len1 = cursorsToShow.length; j < len1; j++) {
        cursor = cursorsToShow[j];
        if (offset = getOffset(submode, cursor)) {
          if (cursorNode = getCursorNode(this.editorElement, cursor)) {
            results.push(this.styleDisporser.add(setStyle(cursorNode.style, offset)));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };

    return CursorStyleManager;

  })();

  module.exports = CursorStyleManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9jdXJzb3Itc3R5bGUtbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtJQUFBO0lBQUE7O0VBQUEsTUFBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxpQkFBRCxFQUFRLDJCQUFSLEVBQW9COztFQUVwQixLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLFVBQUEsR0FBYSxJQUFJLENBQUMsVUFBTCxDQUFBOztFQUNiLFVBQUEsR0FBYTs7RUFFYixhQUFBLEdBQWdCLFNBQUMsYUFBRCxFQUFnQixNQUFoQjtBQUNkLFFBQUE7SUFBQSxnQkFBQSxHQUFtQixhQUFhLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztXQUMxRCxnQkFBZ0IsQ0FBQyxlQUFnQixDQUFBLE1BQU0sQ0FBQyxFQUFQO0VBRm5COztFQU1oQixTQUFBLEdBQVksU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNWLFFBQUE7SUFBQyxZQUFhO0FBQ2QsWUFBTyxPQUFQO0FBQUEsV0FDTyxlQURQO1FBRUksSUFBVSxTQUFTLENBQUMsVUFBVixDQUFBLENBQVY7QUFBQSxpQkFBQTs7UUFDQSxJQUFHLE1BQU0sQ0FBQyxtQkFBUCxDQUFBLENBQUg7aUJBQ00sSUFBQSxLQUFBLENBQU0sQ0FBQyxDQUFQLEVBQVUsQ0FBVixFQUROO1NBQUEsTUFBQTtpQkFHTSxJQUFBLEtBQUEsQ0FBTSxDQUFOLEVBQVMsQ0FBQyxDQUFWLEVBSE47O0FBRkc7QUFEUCxXQVFPLFdBUlA7UUFTSSxJQUFVLE1BQU0sQ0FBQyxtQkFBUCxDQUFBLENBQUEsSUFBZ0MsU0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUExQztBQUFBLGlCQUFBOztlQUNJLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxDQUFDLENBQVY7QUFWUixXQVlPLFVBWlA7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LGFBQVUsYUFBVixFQUFBLE1BQUEsTUFBSDtVQUNFLElBQUEsQ0FBK0IsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUEvQjtZQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCLEVBQUE7V0FERjtTQUFBLE1BQUE7VUFHRSxJQUE0QixNQUFNLENBQUMsU0FBUCxDQUFBLENBQTVCO1lBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsRUFBQTtXQUhGOztBQURGO01BT0EsSUFBVSxVQUFWO0FBQUEsZUFBQTs7TUFTQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUF6QixDQUFBO0FBRUE7V0FBQSxpREFBQTs7WUFBaUMsTUFBQSxHQUFTLFNBQUEsQ0FBVSxPQUFWLEVBQW1CLE1BQW5CO1VBQ3hDLElBQUcsVUFBQSxHQUFhLGFBQUEsQ0FBYyxJQUFDLENBQUEsYUFBZixFQUE4QixNQUE5QixDQUFoQjt5QkFDRSxJQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLFFBQUEsQ0FBUyxVQUFVLENBQUMsS0FBcEIsRUFBMkIsTUFBM0IsQ0FBcEIsR0FERjtXQUFBLE1BQUE7aUNBQUE7OztBQURGOztJQTdCTzs7Ozs7O0VBaUNYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBN0ZqQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG5pc1NwZWNNb2RlID0gYXRvbS5pblNwZWNNb2RlKClcbmxpbmVIZWlnaHQgPSBudWxsXG5cbmdldEN1cnNvck5vZGUgPSAoZWRpdG9yRWxlbWVudCwgY3Vyc29yKSAtPlxuICBjdXJzb3JzQ29tcG9uZW50ID0gZWRpdG9yRWxlbWVudC5jb21wb25lbnQubGluZXNDb21wb25lbnQuY3Vyc29yc0NvbXBvbmVudFxuICBjdXJzb3JzQ29tcG9uZW50LmN1cnNvck5vZGVzQnlJZFtjdXJzb3IuaWRdXG5cbiMgUmV0dXJuIGN1cnNvciBzdHlsZSBvZmZzZXQodG9wLCBsZWZ0KVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldE9mZnNldCA9IChzdWJtb2RlLCBjdXJzb3IpIC0+XG4gIHtzZWxlY3Rpb259ID0gY3Vyc29yXG4gIHN3aXRjaCBzdWJtb2RlXG4gICAgd2hlbiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgIHJldHVybiBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBpZiBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgICAgIG5ldyBQb2ludCgtMSwgMClcbiAgICAgIGVsc2VcbiAgICAgICAgbmV3IFBvaW50KDAsIC0xKVxuXG4gICAgd2hlbiAnYmxvY2t3aXNlJ1xuICAgICAgcmV0dXJuIGlmIGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKCkgb3Igc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgbmV3IFBvaW50KDAsIC0xKVxuXG4gICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICBidWZmZXJQb2ludCA9IHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgICBlZGl0b3IgPSBjdXJzb3IuZWRpdG9yXG5cbiAgICAgIGlmIGVkaXRvci5pc1NvZnRXcmFwcGVkKClcbiAgICAgICAgc2NyZWVuUG9pbnQgPSBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb2ludClcbiAgICAgICAgb2Zmc2V0ID0gc2NyZWVuUG9pbnQudHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKSlcbiAgICAgIGVsc2VcbiAgICAgICAgb2Zmc2V0ID0gYnVmZmVyUG9pbnQudHJhdmVyc2FsRnJvbShjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICAgIGlmIG5vdCBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGFuZCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgICAgIG9mZnNldC5yb3cgPSAtMVxuICAgICAgb2Zmc2V0XG5cbnNldFN0eWxlID0gKHN0eWxlLCB7cm93LCBjb2x1bW59KSAtPlxuICBzdHlsZS5zZXRQcm9wZXJ0eSgndG9wJywgXCIje3JvdyAqIGxpbmVIZWlnaHR9ZW1cIikgdW5sZXNzIHJvdyBpcyAwXG4gIHN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgXCIje2NvbHVtbn1jaFwiKSB1bmxlc3MgY29sdW1uIGlzIDBcbiAgbmV3IERpc3Bvc2FibGUgLT5cbiAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgndG9wJylcbiAgICBzdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbGVmdCcpXG5cbiMgRGlzcGxheSBjdXJzb3IgaW4gdmlzdWFsIG1vZGUuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEN1cnNvclN0eWxlTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvckVsZW1lbnQsIEBlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgQGxpbmVIZWlnaHRPYnNlcnZlciA9IGF0b20uY29uZmlnLm9ic2VydmUgJ2VkaXRvci5saW5lSGVpZ2h0JywgKG5ld1ZhbHVlKSA9PlxuICAgICAgbGluZUhlaWdodCA9IG5ld1ZhbHVlXG4gICAgICBAcmVmcmVzaCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3R5bGVEaXNwb3JzZXI/LmRpc3Bvc2UoKVxuICAgIEBsaW5lSGVpZ2h0T2JzZXJ2ZXIuZGlzcG9zZSgpXG4gICAge0BzdHlsZURpc3BvcnNlciwgQGxpbmVIZWlnaHRPYnNlcnZlcn0gPSB7fVxuXG4gIHJlZnJlc2g6IC0+XG4gICAge21vZGUsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlXG4gICAgQHN0eWxlRGlzcG9yc2VyPy5kaXNwb3NlKClcbiAgICBAc3R5bGVEaXNwb3JzZXIgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHJldHVybiB1bmxlc3MgbW9kZSBpcyAndmlzdWFsJyBhbmQgQHZpbVN0YXRlLmdldENvbmZpZygnc2hvd0N1cnNvckluVmlzdWFsTW9kZScpXG5cbiAgICBjdXJzb3JzID0gY3Vyc29yc1RvU2hvdyA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgaWYgc3VibW9kZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgY3Vyc29yc1RvU2hvdyA9IEB2aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkubWFwIChicykgLT4gYnMuZ2V0SGVhZFNlbGVjdGlvbigpLmN1cnNvclxuXG4gICAgIyB1cGRhdGUgdmlzaWJpbGl0eVxuICAgIGZvciBjdXJzb3IgaW4gY3Vyc29yc1xuICAgICAgaWYgY3Vyc29yIGluIGN1cnNvcnNUb1Nob3dcbiAgICAgICAgY3Vyc29yLnNldFZpc2libGUodHJ1ZSkgdW5sZXNzIGN1cnNvci5pc1Zpc2libGUoKVxuICAgICAgZWxzZVxuICAgICAgICBjdXJzb3Iuc2V0VmlzaWJsZShmYWxzZSkgaWYgY3Vyc29yLmlzVmlzaWJsZSgpXG5cbiAgICAjIFtGSVhNRV0gSW4gc3BlYyBtb2RlLCB3ZSBza2lwIGhlcmUgc2luY2Ugbm90IGFsbCBzcGVjIGhhdmUgZG9tIGF0dGFjaGVkLlxuICAgIHJldHVybiBpZiBpc1NwZWNNb2RlXG5cbiAgICAjIFtOT1RFXSBJbiBCbG9ja3dpc2VTZWxlY3Qgd2UgYWRkIHNlbGVjdGlvbnMoYW5kIGNvcnJlc3BvbmRpbmcgY3Vyc29ycykgaW4gYmx1ay5cbiAgICAjIEJ1dCBjb3JyZXNwb25kaW5nIGN1cnNvcnNDb21wb25lbnQoSFRNTCBlbGVtZW50KSBpcyBhZGRlZCBpbiBzeW5jLlxuICAgICMgU28gdG8gbW9kaWZ5IHN0eWxlIG9mIGN1cnNvcnNDb21wb25lbnQsIHdlIGhhdmUgdG8gbWFrZSBzdXJlIGNvcnJlc3BvbmRpbmcgY3Vyc29yc0NvbXBvbmVudFxuICAgICMgaXMgYXZhaWxhYmxlIGJ5IGNvbXBvbmVudCBpbiBzeW5jIHRvIG1vZGVsLlxuICAgICMgW0ZJWE1FXVxuICAgICMgV2hlbiBjdHJsLWYsIGIsIGQsIHUgaW4gdkwgbW9kZSwgSSBoYWQgdG8gY2FsbCB1cGRhdGVTeW5jIHRvIHNob3cgY3Vyc29yIGNvcnJlY3RseVxuICAgICMgQnV0IGl0IHdhc24ndCBuZWNlc3NhcnkgYmVmb3JlIEkgaWludHJvZHVjZSBgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uYCBmb3IgYGN0cmwtZmBcbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG5cbiAgICBmb3IgY3Vyc29yIGluIGN1cnNvcnNUb1Nob3cgd2hlbiBvZmZzZXQgPSBnZXRPZmZzZXQoc3VibW9kZSwgY3Vyc29yKVxuICAgICAgaWYgY3Vyc29yTm9kZSA9IGdldEN1cnNvck5vZGUoQGVkaXRvckVsZW1lbnQsIGN1cnNvcilcbiAgICAgICAgQHN0eWxlRGlzcG9yc2VyLmFkZCBzZXRTdHlsZShjdXJzb3JOb2RlLnN0eWxlLCBvZmZzZXQpXG5cbm1vZHVsZS5leHBvcnRzID0gQ3Vyc29yU3R5bGVNYW5hZ2VyXG4iXX0=
