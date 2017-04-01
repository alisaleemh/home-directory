(function() {
  var AutocompleteView, CompositeDisposable, Disposable, _, _ref;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ = require('underscore-plus');

  AutocompleteView = require('./autocomplete-view');

  module.exports = {
    config: {
      includeCompletionsFromAllBuffers: {
        type: 'boolean',
        "default": false
      }
    },
    autocompleteViewsByEditor: null,
    deactivationDisposables: null,
    activate: function() {
      var getAutocompleteView;
      this.autocompleteViewsByEditor = new WeakMap;
      this.deactivationDisposables = new CompositeDisposable;
      this.deactivationDisposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var autocompleteView, disposable;
          if (editor.mini) {
            return;
          }
          autocompleteView = new AutocompleteView(editor);
          _this.autocompleteViewsByEditor.set(editor, autocompleteView);
          disposable = new Disposable(function() {
            return autocompleteView.destroy();
          });
          _this.deactivationDisposables.add(editor.onDidDestroy(function() {
            return disposable.dispose();
          }));
          return _this.deactivationDisposables.add(disposable);
        };
      })(this)));
      getAutocompleteView = (function(_this) {
        return function(editorElement) {
          return _this.autocompleteViewsByEditor.get(editorElement.getModel());
        };
      })(this);
      return this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete:toggle': function() {
          var _ref1;
          return (_ref1 = getAutocompleteView(this)) != null ? _ref1.toggle() : void 0;
        },
        'autocomplete:next': function() {
          var _ref1;
          return (_ref1 = getAutocompleteView(this)) != null ? _ref1.selectNextItemView() : void 0;
        },
        'autocomplete:previous': function() {
          var _ref1;
          return (_ref1 = getAutocompleteView(this)) != null ? _ref1.selectPreviousItemView() : void 0;
        }
      }));
    },
    deactivate: function() {
      return this.deactivationDisposables.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUvbGliL2F1dG9jb21wbGV0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMERBQUE7O0FBQUEsRUFBQSxPQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDJCQUFBLG1CQUFELEVBQXNCLGtCQUFBLFVBQXRCLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxxQkFBUixDQUZuQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxnQ0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FERjtLQURGO0FBQUEsSUFLQSx5QkFBQSxFQUEyQixJQUwzQjtBQUFBLElBTUEsdUJBQUEsRUFBeUIsSUFOekI7QUFBQSxJQVFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixVQUFBLG1CQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEseUJBQUQsR0FBNkIsR0FBQSxDQUFBLE9BQTdCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixHQUFBLENBQUEsbUJBRDNCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxHQUF6QixDQUE2QixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUM3RCxjQUFBLDRCQUFBO0FBQUEsVUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFqQjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUFBLFVBRUEsZ0JBQUEsR0FBdUIsSUFBQSxnQkFBQSxDQUFpQixNQUFqQixDQUZ2QixDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEseUJBQXlCLENBQUMsR0FBM0IsQ0FBK0IsTUFBL0IsRUFBdUMsZ0JBQXZDLENBSEEsQ0FBQTtBQUFBLFVBS0EsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7bUJBQUcsZ0JBQWdCLENBQUMsT0FBakIsQ0FBQSxFQUFIO1VBQUEsQ0FBWCxDQUxqQixDQUFBO0FBQUEsVUFNQSxLQUFDLENBQUEsdUJBQXVCLENBQUMsR0FBekIsQ0FBNkIsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsU0FBQSxHQUFBO21CQUFHLFVBQVUsQ0FBQyxPQUFYLENBQUEsRUFBSDtVQUFBLENBQXBCLENBQTdCLENBTkEsQ0FBQTtpQkFPQSxLQUFDLENBQUEsdUJBQXVCLENBQUMsR0FBekIsQ0FBNkIsVUFBN0IsRUFSNkQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUE3QixDQUhBLENBQUE7QUFBQSxNQWFBLG1CQUFBLEdBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLGFBQUQsR0FBQTtpQkFDcEIsS0FBQyxDQUFBLHlCQUF5QixDQUFDLEdBQTNCLENBQStCLGFBQWEsQ0FBQyxRQUFkLENBQUEsQ0FBL0IsRUFEb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWJ0QixDQUFBO2FBZ0JBLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxHQUF6QixDQUE2QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsOEJBQWxCLEVBQzNCO0FBQUEsUUFBQSxxQkFBQSxFQUF1QixTQUFBLEdBQUE7QUFDckIsY0FBQSxLQUFBO29FQUF5QixDQUFFLE1BQTNCLENBQUEsV0FEcUI7UUFBQSxDQUF2QjtBQUFBLFFBRUEsbUJBQUEsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLGNBQUEsS0FBQTtvRUFBeUIsQ0FBRSxrQkFBM0IsQ0FBQSxXQURtQjtRQUFBLENBRnJCO0FBQUEsUUFJQSx1QkFBQSxFQUF5QixTQUFBLEdBQUE7QUFDdkIsY0FBQSxLQUFBO29FQUF5QixDQUFFLHNCQUEzQixDQUFBLFdBRHVCO1FBQUEsQ0FKekI7T0FEMkIsQ0FBN0IsRUFqQlE7SUFBQSxDQVJWO0FBQUEsSUFpQ0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxPQUF6QixDQUFBLEVBRFU7SUFBQSxDQWpDWjtHQUxGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/autocomplete/lib/autocomplete.coffee
