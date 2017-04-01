(function() {
  var MinimapHighlightSelected, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  MinimapHighlightSelected = require('../lib/minimap-highlight-selected');

  describe("MinimapHighlightSelected", function() {
    var activationPromise;
    activationPromise = null;
    return beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return waitsForPromise(function() {
        return atom.packages.activatePackage('minimap-highlight-selected');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC9zcGVjL21pbmltYXAtaGlnaGxpZ2h0LXNlbGVjdGVkLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUMsZ0JBQWlCLE9BQUEsQ0FBUSxNQUFSLEVBQWpCLGFBQUQsQ0FBQTs7QUFBQSxFQUNBLHdCQUFBLEdBQTJCLE9BQUEsQ0FBUSxtQ0FBUixDQUQzQixDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUEsR0FBQTtBQUNuQyxRQUFBLGlCQUFBO0FBQUEsSUFBQSxpQkFBQSxHQUFvQixJQUFwQixDQUFBO1dBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsR0FBQSxDQUFBLGFBQXJCLENBQUE7YUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qiw0QkFBOUIsRUFEYztNQUFBLENBQWhCLEVBSFM7SUFBQSxDQUFYLEVBSG1DO0VBQUEsQ0FBckMsQ0FSQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/minimap-highlight-selected/spec/minimap-highlight-selected-spec.coffee
