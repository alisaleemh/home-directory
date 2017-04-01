(function() {
  var hasCommand, mainModule;

  mainModule = require('../lib/main');

  hasCommand = require('./spec-helper').hasCommand;

  describe("OpenHtmlInBrowser", function() {
    var activationPromise, editor, editorElement, otherEditor, otherEditorElement, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], otherEditor = _ref[2], otherEditorElement = _ref[3], activationPromise = _ref[4];
    beforeEach(function() {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      activationPromise = atom.packages.activatePackage('open-html-in-browser');
      spyOn(mainModule, 'open');
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-html');
      });
      waitsForPromise(function() {
        return atom.workspace.open('test.coffee').then(function(_editor) {
          otherEditor = _editor;
          return otherEditorElement = atom.views.getView(otherEditor);
        });
      });
      return waitsForPromise(function() {
        return atom.workspace.open('test.html').then(function(_editor) {
          editor = _editor;
          return editorElement = atom.views.getView(editor);
        });
      });
    });
    return describe("when the open-html-in-browser:open event is triggered", function() {
      it("open browser", function() {
        atom.commands.dispatch(editorElement, 'open-html-in-browser:open');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(mainModule.open).toHaveBeenCalled();
          return expect(mainModule.open).toHaveBeenCalledWith(editor.getPath());
        });
      });
      return it('creates the commands', function() {
        expect(hasCommand(editorElement, 'open-html-in-browser:open')).toBeTruthy();
        expect(hasCommand(otherEditorElement, 'open-html-in-browser:open')).toBeFalsy();
        atom.commands.dispatch(editorElement, 'open-html-in-browser:open');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(hasCommand(editorElement, 'open-html-in-browser:open')).toBeTruthy();
          return expect(hasCommand(otherEditorElement, 'open-html-in-browser:open')).toBeFalsy();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9vcGVuLWh0bWwtaW4tYnJvd3Nlci9zcGVjL29wZW4taHRtbC1pbi1icm93c2VyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBOztBQUFBLEVBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUNDLGFBQWMsT0FBQSxDQUFRLGVBQVIsRUFBZCxVQURELENBQUE7O0FBQUEsRUFHQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFFBQUEsK0VBQUE7QUFBQSxJQUFBLE9BQThFLEVBQTlFLEVBQUMsZ0JBQUQsRUFBUyx1QkFBVCxFQUF3QixxQkFBeEIsRUFBcUMsNEJBQXJDLEVBQXlELDJCQUF6RCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxnQkFBQTtBQUFBLE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO0FBQUEsTUFDQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsc0JBQTlCLENBRHBCLENBQUE7QUFBQSxNQUVBLEtBQUEsQ0FBTSxVQUFOLEVBQWtCLE1BQWxCLENBRkEsQ0FBQTtBQUFBLE1BSUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztNQUFBLENBQWhCLENBSkEsQ0FBQTtBQUFBLE1BT0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsYUFBcEIsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxTQUFDLE9BQUQsR0FBQTtBQUN0QyxVQUFBLFdBQUEsR0FBYyxPQUFkLENBQUE7aUJBQ0Esa0JBQUEsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFdBQW5CLEVBRmlCO1FBQUEsQ0FBeEMsRUFEYztNQUFBLENBQWhCLENBUEEsQ0FBQTthQWFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFdBQXBCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsU0FBQyxPQUFELEdBQUE7QUFDcEMsVUFBQSxNQUFBLEdBQVMsT0FBVCxDQUFBO2lCQUNBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLEVBRm9CO1FBQUEsQ0FBdEMsRUFEYztNQUFBLENBQWhCLEVBZFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQXNCQSxRQUFBLENBQVMsdURBQVQsRUFBa0UsU0FBQSxHQUFBO0FBQ2hFLE1BQUEsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLDJCQUF0QyxDQUFBLENBQUE7QUFBQSxRQUVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FGQSxDQUFBO2VBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLFVBQVUsQ0FBQyxJQUFsQixDQUF1QixDQUFDLGdCQUF4QixDQUFBLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sVUFBVSxDQUFDLElBQWxCLENBQXVCLENBQUMsb0JBQXhCLENBQTZDLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBN0MsRUFGRztRQUFBLENBQUwsRUFOaUI7TUFBQSxDQUFuQixDQUFBLENBQUE7YUFVQSxFQUFBLENBQUcsc0JBQUgsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFFBQUEsTUFBQSxDQUFPLFVBQUEsQ0FBVyxhQUFYLEVBQTBCLDJCQUExQixDQUFQLENBQThELENBQUMsVUFBL0QsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxVQUFBLENBQVcsa0JBQVgsRUFBK0IsMkJBQS9CLENBQVAsQ0FBbUUsQ0FBQyxTQUFwRSxDQUFBLENBREEsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLDJCQUF0QyxDQUhBLENBQUE7QUFBQSxRQUtBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FMQSxDQUFBO2VBUUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsTUFBQSxDQUFPLFVBQUEsQ0FBVyxhQUFYLEVBQTBCLDJCQUExQixDQUFQLENBQThELENBQUMsVUFBL0QsQ0FBQSxDQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLFVBQUEsQ0FBVyxrQkFBWCxFQUErQiwyQkFBL0IsQ0FBUCxDQUFtRSxDQUFDLFNBQXBFLENBQUEsRUFGRztRQUFBLENBQUwsRUFUeUI7TUFBQSxDQUEzQixFQVhnRTtJQUFBLENBQWxFLEVBdkI0QjtFQUFBLENBQTlCLENBSEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/open-html-in-browser/spec/open-html-in-browser-spec.coffee
