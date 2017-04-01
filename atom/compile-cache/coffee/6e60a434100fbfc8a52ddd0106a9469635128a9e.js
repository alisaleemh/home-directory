(function() {
  var highlightSearch, indentGuide, lineNumbers, moveToLine, moveToLineAndColumn, moveToLineByPercent, moveToRelativeLine, nohlsearch, normalCommands, numberCommands, q, qall, showInvisible, softWrap, split, toggleCommands, toggleConfig, vsplit, w, wall, wq, wqall, x, xall;

  toggleConfig = require('./utils').toggleConfig;

  w = function(arg) {
    var editor;
    editor = (arg != null ? arg : {}).editor;
    if (editor != null ? editor.getPath() : void 0) {
      return editor.save();
    } else {
      return atom.workspace.saveActivePaneItem();
    }
  };

  q = function() {
    return atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
  };

  wq = x = function() {
    w();
    return q();
  };

  qall = function() {
    var i, item, len, ref, results;
    ref = atom.workspace.getPaneItems();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(q());
    }
    return results;
  };

  wall = function() {
    var editor, i, len, ref, results;
    ref = atom.workspace.getTextEditors();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      editor = ref[i];
      if (editor.isModified()) {
        results.push(w({
          editor: editor
        }));
      }
    }
    return results;
  };

  wqall = xall = function() {
    var i, item, len, ref, results;
    ref = atom.workspace.getPaneItems();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(wq());
    }
    return results;
  };

  split = function(arg) {
    var editor, editorElement;
    editor = arg.editor, editorElement = arg.editorElement;
    return atom.commands.dispatch(editorElement, 'pane:split-down-and-copy-active-item');
  };

  vsplit = function(arg) {
    var editor, editorElement;
    editor = arg.editor, editorElement = arg.editorElement;
    return atom.commands.dispatch(editorElement, 'pane:split-right-and-copy-active-item');
  };

  nohlsearch = function(arg) {
    var globalState;
    globalState = arg.globalState;
    return globalState.set('highlightSearchPattern', null);
  };

  showInvisible = function() {
    return toggleConfig('editor.showInvisibles');
  };

  highlightSearch = function() {
    return toggleConfig('vim-mode-plus.highlightSearch');
  };

  softWrap = function(arg) {
    var editorElement;
    editorElement = arg.editorElement;
    return atom.commands.dispatch(editorElement, 'editor:toggle-soft-wrap');
  };

  indentGuide = function(arg) {
    var editorElement;
    editorElement = arg.editorElement;
    return atom.commands.dispatch(editorElement, 'editor:toggle-indent-guide');
  };

  lineNumbers = function(arg) {
    var editorElement;
    editorElement = arg.editorElement;
    return atom.commands.dispatch(editorElement, 'editor:toggle-line-numbers');
  };

  moveToLine = function(vimState, arg) {
    var row;
    row = arg.row;
    vimState.setCount(row);
    return vimState.operationStack.run('MoveToFirstLine');
  };

  moveToLineAndColumn = function(vimState, arg) {
    var column, row;
    row = arg.row, column = arg.column;
    vimState.setCount(row);
    return vimState.operationStack.run('MoveToLineAndColumn', {
      column: column
    });
  };

  moveToLineByPercent = function(vimState, arg) {
    var percent;
    percent = arg.percent;
    vimState.setCount(percent);
    return vimState.operationStack.run('MoveToLineByPercent');
  };

  moveToRelativeLine = function(vimState, arg) {
    var offset;
    offset = arg.offset;
    vimState.setCount(offset + 1);
    return vimState.operationStack.run('MoveToRelativeLine');
  };

  normalCommands = {
    w: w,
    wq: wq,
    x: x,
    wall: wall,
    wqall: wqall,
    xall: xall,
    q: q,
    qall: qall,
    split: split,
    vsplit: vsplit,
    nohlsearch: nohlsearch
  };

  toggleCommands = {
    showInvisible: showInvisible,
    softWrap: softWrap,
    indentGuide: indentGuide,
    lineNumbers: lineNumbers,
    highlightSearch: highlightSearch
  };

  numberCommands = {
    moveToLine: moveToLine,
    moveToLineAndColumn: moveToLineAndColumn,
    moveToLineByPercent: moveToLineByPercent,
    moveToRelativeLine: moveToRelativeLine
  };

  module.exports = {
    normalCommands: normalCommands,
    toggleCommands: toggleCommands,
    numberCommands: numberCommands
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzLWV4LW1vZGUvbGliL2NvbW1hbmRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsZUFBZ0IsT0FBQSxDQUFRLFNBQVI7O0VBSWpCLENBQUEsR0FBSSxTQUFDLEdBQUQ7QUFDRixRQUFBO0lBREksd0JBQUQsTUFBUztJQUNaLHFCQUFHLE1BQU0sQ0FBRSxPQUFSLENBQUEsVUFBSDthQUNFLE1BQU0sQ0FBQyxJQUFQLENBQUEsRUFERjtLQUFBLE1BQUE7YUFHRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQUEsRUFIRjs7RUFERTs7RUFNSixDQUFBLEdBQUksU0FBQTtXQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsc0NBQWYsQ0FBQTtFQUFIOztFQUNKLEVBQUEsR0FBSyxDQUFBLEdBQUksU0FBQTtJQUFHLENBQUEsQ0FBQTtXQUFLLENBQUEsQ0FBQTtFQUFSOztFQUNULElBQUEsR0FBTyxTQUFBO0FBQUcsUUFBQTtBQUFBO0FBQUE7U0FBQSxxQ0FBQTs7bUJBQUEsQ0FBQSxDQUFBO0FBQUE7O0VBQUg7O0VBQ1AsSUFBQSxHQUFPLFNBQUE7QUFBRyxRQUFBO0FBQUE7QUFBQTtTQUFBLHFDQUFBOztVQUErRCxNQUFNLENBQUMsVUFBUCxDQUFBO3FCQUEvRCxDQUFBLENBQUU7VUFBQyxRQUFBLE1BQUQ7U0FBRjs7QUFBQTs7RUFBSDs7RUFDUCxLQUFBLEdBQVEsSUFBQSxHQUFPLFNBQUE7QUFBRyxRQUFBO0FBQUE7QUFBQTtTQUFBLHFDQUFBOzttQkFBQSxFQUFBLENBQUE7QUFBQTs7RUFBSDs7RUFDZixLQUFBLEdBQVEsU0FBQyxHQUFEO0FBQTZCLFFBQUE7SUFBM0IscUJBQVE7V0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLHNDQUF0QztFQUE3Qjs7RUFDUixNQUFBLEdBQVMsU0FBQyxHQUFEO0FBQTZCLFFBQUE7SUFBM0IscUJBQVE7V0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLHVDQUF0QztFQUE3Qjs7RUFDVCxVQUFBLEdBQWEsU0FBQyxHQUFEO0FBQW1CLFFBQUE7SUFBakIsY0FBRDtXQUFrQixXQUFXLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsSUFBMUM7RUFBbkI7O0VBSWIsYUFBQSxHQUFnQixTQUFBO1dBQUcsWUFBQSxDQUFhLHVCQUFiO0VBQUg7O0VBQ2hCLGVBQUEsR0FBa0IsU0FBQTtXQUFHLFlBQUEsQ0FBYSwrQkFBYjtFQUFIOztFQUNsQixRQUFBLEdBQVcsU0FBQyxHQUFEO0FBQXFCLFFBQUE7SUFBbkIsZ0JBQUQ7V0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLHlCQUF0QztFQUFyQjs7RUFDWCxXQUFBLEdBQWMsU0FBQyxHQUFEO0FBQXFCLFFBQUE7SUFBbkIsZ0JBQUQ7V0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLDRCQUF0QztFQUFyQjs7RUFDZCxXQUFBLEdBQWMsU0FBQyxHQUFEO0FBQXFCLFFBQUE7SUFBbkIsZ0JBQUQ7V0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLDRCQUF0QztFQUFyQjs7RUFJZCxVQUFBLEdBQWEsU0FBQyxRQUFELEVBQVcsR0FBWDtBQUNYLFFBQUE7SUFEdUIsTUFBRDtJQUN0QixRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtXQUNBLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBeEIsQ0FBNEIsaUJBQTVCO0VBRlc7O0VBSWIsbUJBQUEsR0FBc0IsU0FBQyxRQUFELEVBQVcsR0FBWDtBQUNwQixRQUFBO0lBRGdDLGVBQUs7SUFDckMsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEI7V0FDQSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQXhCLENBQTRCLHFCQUE1QixFQUFtRDtNQUFDLFFBQUEsTUFBRDtLQUFuRDtFQUZvQjs7RUFJdEIsbUJBQUEsR0FBc0IsU0FBQyxRQUFELEVBQVcsR0FBWDtBQUNwQixRQUFBO0lBRGdDLFVBQUQ7SUFDL0IsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsT0FBbEI7V0FDQSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQXhCLENBQTRCLHFCQUE1QjtFQUZvQjs7RUFJdEIsa0JBQUEsR0FBcUIsU0FBQyxRQUFELEVBQVcsR0FBWDtBQUNuQixRQUFBO0lBRCtCLFNBQUQ7SUFDOUIsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsTUFBQSxHQUFTLENBQTNCO1dBQ0EsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUF4QixDQUE0QixvQkFBNUI7RUFGbUI7O0VBSXJCLGNBQUEsR0FBaUI7SUFDZixHQUFBLENBRGU7SUFFZixJQUFBLEVBRmU7SUFFWCxHQUFBLENBRlc7SUFHZixNQUFBLElBSGU7SUFJZixPQUFBLEtBSmU7SUFJUixNQUFBLElBSlE7SUFLZixHQUFBLENBTGU7SUFNZixNQUFBLElBTmU7SUFPZixPQUFBLEtBUGU7SUFPUixRQUFBLE1BUFE7SUFRZixZQUFBLFVBUmU7OztFQVdqQixjQUFBLEdBQWlCO0lBQ2YsZUFBQSxhQURlO0lBRWYsVUFBQSxRQUZlO0lBR2YsYUFBQSxXQUhlO0lBSWYsYUFBQSxXQUplO0lBS2YsaUJBQUEsZUFMZTs7O0VBUWpCLGNBQUEsR0FBaUI7SUFDZixZQUFBLFVBRGU7SUFFZixxQkFBQSxtQkFGZTtJQUdmLHFCQUFBLG1CQUhlO0lBSWYsb0JBQUEsa0JBSmU7OztFQU9qQixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLGdCQUFBLGNBQUQ7SUFBaUIsZ0JBQUEsY0FBakI7SUFBaUMsZ0JBQUEsY0FBakM7O0FBdkVqQiIsInNvdXJjZXNDb250ZW50IjpbInt0b2dnbGVDb25maWd9ID0gcmVxdWlyZSAnLi91dGlscydcblxuIyBleCBjb21tYW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbncgPSAoe2VkaXRvcn09e30pIC0+XG4gIGlmIGVkaXRvcj8uZ2V0UGF0aCgpXG4gICAgZWRpdG9yLnNhdmUoKVxuICBlbHNlXG4gICAgYXRvbS53b3Jrc3BhY2Uuc2F2ZUFjdGl2ZVBhbmVJdGVtKClcblxucSA9IC0+IGF0b20ud29ya3NwYWNlLmNsb3NlQWN0aXZlUGFuZUl0ZW1PckVtcHR5UGFuZU9yV2luZG93KClcbndxID0geCA9IC0+IHcoKTsgcSgpXG5xYWxsID0gLT4gcSgpIGZvciBpdGVtIGluIGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpXG53YWxsID0gLT4gdyh7ZWRpdG9yfSkgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpIHdoZW4gZWRpdG9yLmlzTW9kaWZpZWQoKVxud3FhbGwgPSB4YWxsID0gLT4gd3EoKSBmb3IgaXRlbSBpbiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKVxuc3BsaXQgPSAoe2VkaXRvciwgZWRpdG9yRWxlbWVudH0pIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ3BhbmU6c3BsaXQtZG93bi1hbmQtY29weS1hY3RpdmUtaXRlbScpXG52c3BsaXQgPSAoe2VkaXRvciwgZWRpdG9yRWxlbWVudH0pIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ3BhbmU6c3BsaXQtcmlnaHQtYW5kLWNvcHktYWN0aXZlLWl0ZW0nKVxubm9obHNlYXJjaCA9ICh7Z2xvYmFsU3RhdGV9KSAtPiBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuXG4jIENvbmZpZ3VyYXRpb24gc3dpdGNoXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNob3dJbnZpc2libGUgPSAtPiB0b2dnbGVDb25maWcoJ2VkaXRvci5zaG93SW52aXNpYmxlcycpXG5oaWdobGlnaHRTZWFyY2ggPSAtPiB0b2dnbGVDb25maWcoJ3ZpbS1tb2RlLXBsdXMuaGlnaGxpZ2h0U2VhcmNoJylcbnNvZnRXcmFwID0gKHtlZGl0b3JFbGVtZW50fSkgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZWRpdG9yOnRvZ2dsZS1zb2Z0LXdyYXAnKVxuaW5kZW50R3VpZGUgPSAoe2VkaXRvckVsZW1lbnR9KSAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdlZGl0b3I6dG9nZ2xlLWluZGVudC1ndWlkZScpXG5saW5lTnVtYmVycyA9ICh7ZWRpdG9yRWxlbWVudH0pIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2VkaXRvcjp0b2dnbGUtbGluZS1udW1iZXJzJylcblxuIyBXaGVuIG51bWJlciB3YXMgdHlwZWRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubW92ZVRvTGluZSA9ICh2aW1TdGF0ZSwge3Jvd30pIC0+XG4gIHZpbVN0YXRlLnNldENvdW50KHJvdylcbiAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKCdNb3ZlVG9GaXJzdExpbmUnKVxuXG5tb3ZlVG9MaW5lQW5kQ29sdW1uID0gKHZpbVN0YXRlLCB7cm93LCBjb2x1bW59KSAtPlxuICB2aW1TdGF0ZS5zZXRDb3VudChyb3cpXG4gIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bignTW92ZVRvTGluZUFuZENvbHVtbicsIHtjb2x1bW59KVxuXG5tb3ZlVG9MaW5lQnlQZXJjZW50ID0gKHZpbVN0YXRlLCB7cGVyY2VudH0pIC0+XG4gIHZpbVN0YXRlLnNldENvdW50KHBlcmNlbnQpXG4gIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bignTW92ZVRvTGluZUJ5UGVyY2VudCcpXG5cbm1vdmVUb1JlbGF0aXZlTGluZSA9ICh2aW1TdGF0ZSwge29mZnNldH0pIC0+XG4gIHZpbVN0YXRlLnNldENvdW50KG9mZnNldCArIDEpXG4gIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bignTW92ZVRvUmVsYXRpdmVMaW5lJylcblxubm9ybWFsQ29tbWFuZHMgPSB7XG4gIHdcbiAgd3EsIHhcbiAgd2FsbFxuICB3cWFsbCwgeGFsbFxuICBxXG4gIHFhbGxcbiAgc3BsaXQsIHZzcGxpdFxuICBub2hsc2VhcmNoXG59XG5cbnRvZ2dsZUNvbW1hbmRzID0ge1xuICBzaG93SW52aXNpYmxlXG4gIHNvZnRXcmFwXG4gIGluZGVudEd1aWRlXG4gIGxpbmVOdW1iZXJzXG4gIGhpZ2hsaWdodFNlYXJjaFxufVxuXG5udW1iZXJDb21tYW5kcyA9IHtcbiAgbW92ZVRvTGluZVxuICBtb3ZlVG9MaW5lQW5kQ29sdW1uXG4gIG1vdmVUb0xpbmVCeVBlcmNlbnRcbiAgbW92ZVRvUmVsYXRpdmVMaW5lXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge25vcm1hbENvbW1hbmRzLCB0b2dnbGVDb21tYW5kcywgbnVtYmVyQ29tbWFuZHN9XG4iXX0=
