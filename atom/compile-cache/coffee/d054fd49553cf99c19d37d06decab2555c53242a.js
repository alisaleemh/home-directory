(function() {
  var BrowserPlusZoom, CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = BrowserPlusZoom = {
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return atom.workspace.observePaneItems(function(editor) {
        var fn;
        fn = function() {
          var _ref, _ref1;
          if (!editor.view) {
            return;
          }
          if ((_ref = editor.view.subscriptions) != null) {
            _ref.add(atom.commands.add('.browser-plus', {
              'browser-plus-view:zoomIn': function() {
                return editor.view.zoom(10);
              }
            }));
          }
          if ((_ref1 = editor.view.subscriptions) != null) {
            _ref1.add(atom.commands.add('.browser-plus', {
              'browser-plus-view:zoomOut': function() {
                return editor.view.zoom(-10);
              }
            }));
          }
          editor.view.zoomFactor = 100;
          return editor.view.zoom = function(factor) {
            var _ref2, _ref3;
            if ((20 <= (_ref2 = this.zoomFactor + factor) && _ref2 <= 500)) {
              this.zoomFactor += factor;
            }
            if ((_ref3 = atom.notifications.getNotifications()[0]) != null) {
              _ref3.dismiss();
            }
            atom.notifications.clear();
            atom.notifications.addInfo("zoom: " + this.zoomFactor + "%", {
              dismissable: true
            });
            return this.htmlv[0].executeJavaScript("jQuery('body').css('zoom', '" + this.zoomFactor + "%')");
          };
        };
        if (editor.constructor.name === 'HTMLEditor') {
          if (editor.uri === 'browser-plus://blank') {
            return;
          }
          return setTimeout(fn, 1000);
        }
      });
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMtem9vbS9saWIvYnJvd3Nlci1wbHVzLXpvb20uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixlQUFBLEdBQ2Y7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFHUixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTthQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWYsQ0FBZ0MsU0FBQyxNQUFELEdBQUE7QUFDOUIsWUFBQSxFQUFBO0FBQUEsUUFBQSxFQUFBLEdBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxXQUFBO0FBQUEsVUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxJQUFyQjtBQUFBLGtCQUFBLENBQUE7V0FBQTs7Z0JBQ3lCLENBQUUsR0FBM0IsQ0FBK0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGVBQWxCLEVBQW1DO0FBQUEsY0FBQSwwQkFBQSxFQUE0QixTQUFBLEdBQUE7dUJBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLEVBQWpCLEVBQUg7Y0FBQSxDQUE1QjthQUFuQyxDQUEvQjtXQURBOztpQkFFeUIsQ0FBRSxHQUEzQixDQUErQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZUFBbEIsRUFBbUM7QUFBQSxjQUFBLDJCQUFBLEVBQTZCLFNBQUEsR0FBQTt1QkFBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVosQ0FBaUIsQ0FBQSxFQUFqQixFQUFIO2NBQUEsQ0FBN0I7YUFBbkMsQ0FBL0I7V0FGQTtBQUFBLFVBR0EsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFaLEdBQXlCLEdBSHpCLENBQUE7aUJBSUEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLEdBQW1CLFNBQUMsTUFBRCxHQUFBO0FBQ2YsZ0JBQUEsWUFBQTtBQUFBLFlBQUEsSUFBRyxDQUFBLEVBQUEsYUFBTSxJQUFDLENBQUEsVUFBRCxHQUFZLE9BQWxCLFNBQUEsSUFBNEIsR0FBNUIsQ0FBSDtBQUNFLGNBQUEsSUFBQyxDQUFBLFVBQUQsSUFBZSxNQUFmLENBREY7YUFBQTs7bUJBR3dDLENBQUUsT0FBMUMsQ0FBQTthQUhBO0FBQUEsWUFLQSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQW5CLENBQUEsQ0FMQSxDQUFBO0FBQUEsWUFNQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTRCLFFBQUEsR0FBUSxJQUFDLENBQUEsVUFBVCxHQUFvQixHQUFoRCxFQUFvRDtBQUFBLGNBQUMsV0FBQSxFQUFZLElBQWI7YUFBcEQsQ0FOQSxDQUFBO21CQU9BLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsaUJBQVYsQ0FBNkIsOEJBQUEsR0FBOEIsSUFBQyxDQUFBLFVBQS9CLEdBQTBDLEtBQXZFLEVBUmU7VUFBQSxFQUxoQjtRQUFBLENBQUwsQ0FBQTtBQWVBLFFBQUEsSUFBRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQW5CLEtBQTJCLFlBQTlCO0FBQ0csVUFBQSxJQUFVLE1BQU0sQ0FBQyxHQUFQLEtBQWMsc0JBQXhCO0FBQUEsa0JBQUEsQ0FBQTtXQUFBO2lCQUNBLFVBQUEsQ0FBVyxFQUFYLEVBQWMsSUFBZCxFQUZIO1NBaEI4QjtNQUFBLENBQWhDLEVBSlE7SUFBQSxDQUZWO0FBQUEsSUE0QkEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRFU7SUFBQSxDQTVCWjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/browser-plus-zoom/lib/browser-plus-zoom.coffee
