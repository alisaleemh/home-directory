(function() {
  var Shell, exec;

  exec = require('child_process').exec;

  Shell = require('shell');

  module.exports = {
    activate: function(state) {
      atom.commands.add('atom-text-editor', {
        'open-in-browser:open': (function(_this) {
          return function() {
            return _this.open();
          };
        })(this)
      });
      return atom.commands.add('atom-panel', {
        'open-in-browser:open-tree-view': (function(_this) {
          return function() {
            return _this.openTreeView();
          };
        })(this)
      });
    },
    openPath: function(filePath) {
      var process_architecture;
      process_architecture = process.platform;
      switch (process_architecture) {
        case 'darwin':
          return exec('open "' + filePath + '"');
        case 'linux':
          return exec('xdg-open "' + filePath + '"');
        case 'win32':
          return Shell.openExternal('file:///' + filePath);
      }
    },
    open: function() {
      var editor, file, filePath;
      editor = atom.workspace.getActivePaneItem();
      file = editor != null ? editor.buffer.file : void 0;
      filePath = file != null ? file.path : void 0;
      return this.openPath(filePath);
    },
    openTreeView: function() {
      var nuclideFileTree, packageObj, path, treeView, _ref;
      packageObj = null;
      if (atom.packages.isPackageLoaded('nuclide-file-tree') === true) {
        nuclideFileTree = atom.packages.getLoadedPackage('nuclide-file-tree');
        path = (_ref = nuclideFileTree.contextMenuManager.activeElement) != null ? _ref.getAttribute('data-path') : void 0;
        packageObj = {
          selectedPath: path
        };
      }
      if (atom.packages.isPackageLoaded('tree-view') === true) {
        treeView = atom.packages.getLoadedPackage('tree-view');
        treeView = require(treeView.mainModulePath);
        packageObj = treeView.serialize();
      }
      if (typeof packageObj !== 'undefined' && packageObj !== null) {
        if (packageObj.selectedPath) {
          return this.openPath(packageObj.selectedPath);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9vcGVuLWluLWJyb3dzZXIvbGliL29wZW4taW4tYnJvd3Nlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLGVBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FGUixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDO0FBQUEsUUFBQSxzQkFBQSxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtPQUF0QyxDQUFBLENBQUE7YUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsWUFBbEIsRUFBZ0M7QUFBQSxRQUFBLGdDQUFBLEVBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO21CQUFHLEtBQUMsQ0FBQSxZQUFELENBQUEsRUFBSDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5DO09BQWhDLEVBRlE7SUFBQSxDQUFWO0FBQUEsSUFJQSxRQUFBLEVBQVUsU0FBQyxRQUFELEdBQUE7QUFDUixVQUFBLG9CQUFBO0FBQUEsTUFBQSxvQkFBQSxHQUF1QixPQUFPLENBQUMsUUFBL0IsQ0FBQTtBQUNBLGNBQU8sb0JBQVA7QUFBQSxhQUNPLFFBRFA7aUJBQ3FCLElBQUEsQ0FBTSxRQUFBLEdBQVMsUUFBVCxHQUFrQixHQUF4QixFQURyQjtBQUFBLGFBRU8sT0FGUDtpQkFFb0IsSUFBQSxDQUFNLFlBQUEsR0FBYSxRQUFiLEdBQXNCLEdBQTVCLEVBRnBCO0FBQUEsYUFHTyxPQUhQO2lCQUdvQixLQUFLLENBQUMsWUFBTixDQUFtQixVQUFBLEdBQVcsUUFBOUIsRUFIcEI7QUFBQSxPQUZRO0lBQUEsQ0FKVjtBQUFBLElBV0EsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsc0JBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxJQUFBLG9CQUFPLE1BQU0sQ0FBRSxNQUFNLENBQUMsYUFEdEIsQ0FBQTtBQUFBLE1BRUEsUUFBQSxrQkFBVyxJQUFJLENBQUUsYUFGakIsQ0FBQTthQUdBLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQUpJO0lBQUEsQ0FYTjtBQUFBLElBaUJBLFlBQUEsRUFBYyxTQUFBLEdBQUE7QUFDWixVQUFBLGlEQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsSUFBYixDQUFBO0FBQ0EsTUFBQSxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixtQkFBOUIsQ0FBQSxLQUFzRCxJQUF6RDtBQUNFLFFBQUEsZUFBQSxHQUFrQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLG1CQUEvQixDQUFsQixDQUFBO0FBQUEsUUFDQSxJQUFBLDJFQUF1RCxDQUFFLFlBQWxELENBQStELFdBQS9ELFVBRFAsQ0FBQTtBQUFBLFFBRUEsVUFBQSxHQUFhO0FBQUEsVUFBQSxZQUFBLEVBQWEsSUFBYjtTQUZiLENBREY7T0FEQTtBQUtBLE1BQUEsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsV0FBOUIsQ0FBQSxLQUE4QyxJQUFqRDtBQUNFLFFBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsV0FBL0IsQ0FBWCxDQUFBO0FBQUEsUUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVEsQ0FBQyxjQUFqQixDQURYLENBQUE7QUFBQSxRQUVBLFVBQUEsR0FBYSxRQUFRLENBQUMsU0FBVCxDQUFBLENBRmIsQ0FERjtPQUxBO0FBU0EsTUFBQSxJQUFHLE1BQUEsQ0FBQSxVQUFBLEtBQXFCLFdBQXJCLElBQW9DLFVBQUEsS0FBYyxJQUFyRDtBQUNFLFFBQUEsSUFBRyxVQUFVLENBQUMsWUFBZDtpQkFDRSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVUsQ0FBQyxZQUFyQixFQURGO1NBREY7T0FWWTtJQUFBLENBakJkO0dBTkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/open-in-browser/lib/open-in-browser.coffee
