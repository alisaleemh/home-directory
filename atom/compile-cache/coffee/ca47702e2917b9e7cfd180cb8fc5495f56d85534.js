(function() {
  var CompositeDisposable, Shell, exec;

  exec = require('child_process').exec;

  Shell = require('shell');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    subscriptions: null,
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar~="html"]', {
        'open-html-in-browser:open': (function(_this) {
          return function(_arg) {
            var target;
            target = _arg.target;
            return _this.open(target.getModel().getPath());
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add('.tree-view', {
        'open-html-in-browser:selected-entry': (function(_this) {
          return function(_arg) {
            var entry, filePath, target;
            target = _arg.currentTarget;
            entry = target != null ? target.querySelector('.selected .name') : void 0;
            filePath = entry != null ? entry.dataset.path : void 0;
            if (!(filePath != null ? filePath.endsWith('.html') : void 0)) {
              return;
            }
            return _this.open(filePath);
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    open: function(filePath) {
      switch (process.platform) {
        case 'darwin':
          return exec("open '" + filePath + "'");
        case 'linux':
          return exec("xdg-open '" + filePath + "'");
        case 'win32':
          return Shell.openExternal("file:///" + filePath);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9vcGVuLWh0bWwtaW4tYnJvd3Nlci9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxlQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUVDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFGRCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsYUFBQSxFQUFlLElBQWY7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQix3Q0FBbEIsRUFDakI7QUFBQSxRQUFBLDJCQUFBLEVBQTZCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxJQUFELEdBQUE7QUFDM0IsZ0JBQUEsTUFBQTtBQUFBLFlBRDZCLFNBQUQsS0FBQyxNQUM3QixDQUFBO21CQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFpQixDQUFDLE9BQWxCLENBQUEsQ0FBTixFQUQyQjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO09BRGlCLENBQW5CLENBREEsQ0FBQTthQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsWUFBbEIsRUFDakI7QUFBQSxRQUFBLHFDQUFBLEVBQXVDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxJQUFELEdBQUE7QUFDckMsZ0JBQUEsdUJBQUE7QUFBQSxZQURzRCxTQUFoQixLQUFDLGFBQ3ZDLENBQUE7QUFBQSxZQUFBLEtBQUEsb0JBQVMsTUFBTSxDQUFFLGFBQVIsQ0FBc0IsaUJBQXRCLFVBQVQsQ0FBQTtBQUFBLFlBQ0EsUUFBQSxtQkFBVyxLQUFLLENBQUUsT0FBTyxDQUFDLGFBRDFCLENBQUE7QUFFQSxZQUFBLElBQUEsQ0FBQSxvQkFBYyxRQUFRLENBQUUsUUFBVixDQUFtQixPQUFuQixXQUFkO0FBQUEsb0JBQUEsQ0FBQTthQUZBO21CQUdBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUpxQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZDO09BRGlCLENBQW5CLEVBTlE7SUFBQSxDQUZWO0FBQUEsSUFnQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQWhCWjtBQUFBLElBbUJBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtBQUNKLGNBQU8sT0FBTyxDQUFDLFFBQWY7QUFBQSxhQUNPLFFBRFA7aUJBRUksSUFBQSxDQUFNLFFBQUEsR0FBUSxRQUFSLEdBQWlCLEdBQXZCLEVBRko7QUFBQSxhQUdPLE9BSFA7aUJBSUksSUFBQSxDQUFNLFlBQUEsR0FBWSxRQUFaLEdBQXFCLEdBQTNCLEVBSko7QUFBQSxhQUtPLE9BTFA7aUJBTUksS0FBSyxDQUFDLFlBQU4sQ0FBb0IsVUFBQSxHQUFVLFFBQTlCLEVBTko7QUFBQSxPQURJO0lBQUEsQ0FuQk47R0FMRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/open-html-in-browser/lib/main.coffee
