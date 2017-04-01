(function() {
  var CompositeDisposable, HighlightSearchManager, decorationOptions, matchScopes, ref, scanEditor;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('./utils'), scanEditor = ref.scanEditor, matchScopes = ref.matchScopes;

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-highlight-search'
  };

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState;
      this.disposables = new CompositeDisposable;
      this.markerLayer = this.editor.addMarkerLayer();
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.disposables.add(this.globalState.onDidChange((function(_this) {
        return function(arg) {
          var name, newValue;
          name = arg.name, newValue = arg.newValue;
          if (name === 'highlightSearchPattern') {
            if (newValue) {
              return _this.refresh();
            } else {
              return _this.clearMarkers();
            }
          }
        };
      })(this)));
    }

    HighlightSearchManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    HighlightSearchManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    HighlightSearchManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    HighlightSearchManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    HighlightSearchManager.prototype.refresh = function() {
      var i, len, pattern, range, ref1, results;
      this.clearMarkers();
      if (!this.vimState.getConfig('highlightSearch')) {
        return;
      }
      if (!this.vimState.isVisible()) {
        return;
      }
      if (!(pattern = this.globalState.get('highlightSearchPattern'))) {
        return;
      }
      if (matchScopes(this.editorElement, this.vimState.getConfig('highlightSearchExcludeScopes'))) {
        return;
      }
      ref1 = scanEditor(this.editor, pattern);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        range = ref1[i];
        results.push(this.markerLayer.markBufferRange(range, {
          invalidate: 'inside'
        }));
      }
      return results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9oaWdobGlnaHQtc2VhcmNoLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQTRCLE9BQUEsQ0FBUSxTQUFSLENBQTVCLEVBQUMsMkJBQUQsRUFBYTs7RUFFYixpQkFBQSxHQUNFO0lBQUEsSUFBQSxFQUFNLFdBQU47SUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdDQURQOzs7RUFJRixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsZ0NBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE9BQTBDLElBQUMsQ0FBQSxRQUEzQyxFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsbUJBQUE7TUFDM0IsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFFZixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLElBQUMsQ0FBQSxXQUE3QixFQUEwQyxpQkFBMUM7TUFJbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUN4QyxjQUFBO1VBRDBDLGlCQUFNO1VBQ2hELElBQUcsSUFBQSxLQUFRLHdCQUFYO1lBQ0UsSUFBRyxRQUFIO3FCQUNFLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFERjthQUFBLE1BQUE7cUJBR0UsS0FBQyxDQUFBLFlBQUQsQ0FBQSxFQUhGO2FBREY7O1FBRHdDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUFqQjtJQVZXOztxQ0FpQmIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsZUFBZSxDQUFDLE9BQWpCLENBQUE7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBSE87O3FDQU9ULFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxHQUFnQztJQUR0Qjs7cUNBR1osVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQTtJQURVOztxQ0FHWixZQUFBLEdBQWMsU0FBQTthQUNaLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFBO0lBRFk7O3FDQUdkLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxZQUFELENBQUE7TUFFQSxJQUFBLENBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGlCQUFwQixDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQUEsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLENBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQix3QkFBakIsQ0FBVixDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFVLFdBQUEsQ0FBWSxJQUFDLENBQUEsYUFBYixFQUE0QixJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsOEJBQXBCLENBQTVCLENBQVY7QUFBQSxlQUFBOztBQUVBO0FBQUE7V0FBQSxzQ0FBQTs7cUJBQ0UsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLEtBQTdCLEVBQW9DO1VBQUEsVUFBQSxFQUFZLFFBQVo7U0FBcEM7QUFERjs7SUFSTzs7Ozs7QUEzQ1giLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue3NjYW5FZGl0b3IsIG1hdGNoU2NvcGVzfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmRlY29yYXRpb25PcHRpb25zID1cbiAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWhpZ2hsaWdodC1zZWFyY2gnXG5cbiMgR2VuZXJhbCBwdXJwb3NlIHV0aWxpdHkgY2xhc3MgdG8gbWFrZSBBdG9tJ3MgbWFya2VyIG1hbmFnZW1lbnQgZWFzaWVyLlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSGlnaGxpZ2h0U2VhcmNoTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxTdGF0ZX0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgQGRlY29yYXRpb25MYXllciA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihAbWFya2VyTGF5ZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgIyBSZWZyZXNoIGhpZ2hsaWdodCBiYXNlZCBvbiBnbG9iYWxTdGF0ZS5oaWdobGlnaHRTZWFyY2hQYXR0ZXJuIGNoYW5nZXMuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAZ2xvYmFsU3RhdGUub25EaWRDaGFuZ2UgKHtuYW1lLCBuZXdWYWx1ZX0pID0+XG4gICAgICBpZiBuYW1lIGlzICdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJ1xuICAgICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICAgIEByZWZyZXNoKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjbGVhck1hcmtlcnMoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlY29yYXRpb25MYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuXG4gICMgTWFya2Vyc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaGFzTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKSA+IDBcblxuICBnZXRNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKClcblxuICBjbGVhck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmNsZWFyKClcblxuICByZWZyZXNoOiAtPlxuICAgIEBjbGVhck1hcmtlcnMoKVxuXG4gICAgcmV0dXJuIHVubGVzcyBAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaWdobGlnaHRTZWFyY2gnKVxuICAgIHJldHVybiB1bmxlc3MgQHZpbVN0YXRlLmlzVmlzaWJsZSgpXG4gICAgcmV0dXJuIHVubGVzcyBwYXR0ZXJuID0gQGdsb2JhbFN0YXRlLmdldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicpXG4gICAgcmV0dXJuIGlmIG1hdGNoU2NvcGVzKEBlZGl0b3JFbGVtZW50LCBAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaWdobGlnaHRTZWFyY2hFeGNsdWRlU2NvcGVzJykpXG5cbiAgICBmb3IgcmFuZ2UgaW4gc2NhbkVkaXRvcihAZWRpdG9yLCBwYXR0ZXJuKVxuICAgICAgQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwgaW52YWxpZGF0ZTogJ2luc2lkZScpXG4iXX0=
