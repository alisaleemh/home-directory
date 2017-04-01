Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

var _utils = require('./utils');

'use babel';

exports['default'] = {

  config: {
    expandedWidth: {
      title: 'Focused Pane Width',
      description: 'Sets the Percentage between 0 and 100 of how much the focused pane will grow',
      type: 'integer',
      'default': 94,
      minimum: 1,
      maximum: 100
    }
  },

  subscriptions: null,
  ActivePane: null,
  FollowObserver: null,
  modifiedPanes: [],
  incompatiblePlugins: ['nuclide'],

  activate: function activate(state) {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.packages.onDidActivatePackage(this.checkIncompatibility.bind(this)));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'hey-pane:toggle-focus-of-active-pane': function heyPaneToggleFocusOfActivePane() {
        return _this.toggleFocus();
      },
      'hey-pane:toggle-follow-mode': function heyPaneToggleFollowMode() {
        return _this.followMe();
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();

    if (this.FollowObserver != null) this.FollowObserver.dispose();
  },

  // Activate/deactivate follow mode
  followMe: function followMe() {
    var _this2 = this;

    if (this.FollowObserver != null) {
      this.FollowObserver.dispose();
      this.FollowObserver = null;
    } else {
      this.FollowObserver = atom.workspace.onDidStopChangingActivePaneItem(function (pane) {
        _this2.setAutoFocus();
      });
    }
  },

  setAutoFocus: function setAutoFocus() {
    if (this.ActivePane != null) {
      this.undoFocus();
    }
    this.doFocus();
  },

  // Toggle Focus of active pane
  toggleFocus: function toggleFocus() {
    if (this.ActivePane != null) {
      this.undoFocus();
    } else {
      this.doFocus();
    }
  },

  doFocus: function doFocus() {
    var _this3 = this;

    this.ActivePane = this.getActivePane();
    this.ActivePane.classList.add('hey-pane-focus');

    var expandedWidth = atom.config.get('hey-pane.expandedWidth') / 100;
    var collapsedWidth = 1 - expandedWidth;

    var recursiveSet = function recursiveSet(node) {
      if (node.parentNode.nodeName === 'ATOM-PANE-AXIS') {
        _this3.saveElementStateAndSetFlex(node, expandedWidth);
        (0, _utils.getSiblings)(node).filter(function (pane) {
          return pane.nodeName !== 'ATOM-PANE-RESIZE-HANDLE';
        }).forEach(function (pane) {
          _this3.saveElementStateAndSetFlex(pane, collapsedWidth);
        });

        if (node.parentNode.parentNode.nodeName !== 'ATOM-PANE-CONTAINER') {
          recursiveSet(node.parentNode);
        }
      }
    };

    recursiveSet(this.ActivePane);
  },

  undoFocus: function undoFocus() {
    this.ActivePane.classList.remove('hey-pane-focus');
    this.ActivePane = null;
    this.restorePanes();
    this.emptyPaneStates();
  },

  saveElementStateAndSetFlex: function saveElementStateAndSetFlex(el, newFlexValue) {
    var oldFlexValue = el.style.flexGrow;
    this.modifiedPanes.push({ el: el, oldFlexValue: oldFlexValue });
    el.style.flexGrow = newFlexValue;
  },

  restorePanes: function restorePanes() {
    var Container = this.getPanesContainer();
    this.modifiedPanes.forEach(function (pane) {
      if (Container.contains(pane.el)) {
        pane.el.style.flexGrow = pane.oldFlexValue;
      }
    });
  },

  emptyPaneStates: function emptyPaneStates() {
    this.modifiedPanes = [];
  },

  getPanesContainer: function getPanesContainer() {
    var View = atom.views.getView(atom.workspace);
    return View.querySelector('.panes');
  },

  getActivePane: function getActivePane() {
    var View = atom.views.getView(atom.workspace);
    return View.querySelector('.pane.active');
  },

  checkIncompatibility: function checkIncompatibility(plugin) {
    if (this.incompatiblePlugins.includes(plugin.name)) {
      atom.notifications.addError('Incompatible Package Detected', {
        dismissable: true,
        detail: 'hey-pane does not work when package "' + plugin.name + '" is activated.'
      });
    }
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvaGV5LXBhbmUvbGliL2hleS1wYW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRW9DLE1BQU07O3FCQUNkLFNBQVM7O0FBSHJDLFdBQVcsQ0FBQTs7cUJBS0k7O0FBRWIsUUFBTSxFQUFFO0FBQ04saUJBQWEsRUFBRTtBQUNiLFdBQUssRUFBRSxvQkFBb0I7QUFDM0IsaUJBQVcsRUFBRSw4RUFBOEU7QUFDM0YsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxFQUFFO0FBQ1gsYUFBTyxFQUFFLENBQUM7QUFDVixhQUFPLEVBQUUsR0FBRztLQUNiO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFLElBQUk7QUFDbkIsWUFBVSxFQUFFLElBQUk7QUFDaEIsZ0JBQWMsRUFBRSxJQUFJO0FBQ3BCLGVBQWEsRUFBRSxFQUFFO0FBQ2pCLHFCQUFtQixFQUFFLENBQUMsU0FBUyxDQUFDOztBQUVoQyxVQUFRLEVBQUEsa0JBQUMsS0FBSyxFQUFFOzs7QUFDZCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUN2RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFeEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsNENBQXNDLEVBQUU7ZUFBTSxNQUFLLFdBQVcsRUFBRTtPQUFBO0FBQ2hFLG1DQUE2QixFQUFFO2VBQU0sTUFBSyxRQUFRLEVBQUU7T0FBQTtLQUNyRCxDQUFDLENBQUMsQ0FBQTtHQUNKOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7O0FBRTVC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RUYiLCJmaWxlIjoiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9oZXktcGFuZS9saWIvaGV5LXBhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGdldFNpYmxpbmdzIH0gZnJvbSAnLi91dGlscydcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGNvbmZpZzoge1xuICAgIGV4cGFuZGVkV2lkdGg6IHtcbiAgICAgIHRpdGxlOiAnRm9jdXNlZCBQYW5lIFdpZHRoJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2V0cyB0aGUgUGVyY2VudGFnZSBiZXR3ZWVuIDAgYW5kIDEwMCBvZiBob3cgbXVjaCB0aGUgZm9jdXNlZCBwYW5lIHdpbGwgZ3JvdycsXG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA5NCxcbiAgICAgIG1pbmltdW06IDEsXG4gICAgICBtYXhpbXVtOiAxMDBcbiAgICB9XG4gIH0sXG5cbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcbiAgQWN0aXZlUGFuZTogbnVsbCxcbiAgRm9sbG93T2JzZXJ2ZXI6IG51bGwsXG4gIG1vZGlmaWVkUGFuZXM6IFtdLFxuICBpbmNvbXBhdGlibGVQbHVnaW5zOiBbJ251Y2xpZGUnXSxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZShcbiAgICAgIHRoaXMuY2hlY2tJbmNvbXBhdGliaWxpdHkuYmluZCh0aGlzKSkpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdoZXktcGFuZTp0b2dnbGUtZm9jdXMtb2YtYWN0aXZlLXBhbmUnOiAoKSA9PiB0aGlzLnRvZ2dsZUZvY3VzKCksXG4gICAgICAnaGV5LXBhbmU6dG9nZ2xlLWZvbGxvdy1tb2RlJzogKCkgPT4gdGhpcy5mb2xsb3dNZSgpXG4gICAgfSkpXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiAodGhpcy5Gb2xsb3dPYnNlcnZlciAhPSBudWxsKVxuICAgICAgdGhpcy5Gb2xsb3dPYnNlcnZlci5kaXNwb3NlKClcbiAgfSxcblxuICAvLyBBY3RpdmF0ZS9kZWFjdGl2YXRlIGZvbGxvdyBtb2RlXG4gIGZvbGxvd01lKCkge1xuICAgIGlmICh0aGlzLkZvbGxvd09ic2VydmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuRm9sbG93T2JzZXJ2ZXIuZGlzcG9zZSgpXG4gICAgICB0aGlzLkZvbGxvd09ic2VydmVyID0gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLkZvbGxvd09ic2VydmVyID0gYXRvbS53b3Jrc3BhY2Uub25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbShcbiAgICAgICAgKHBhbmUpID0+IHsgdGhpcy5zZXRBdXRvRm9jdXMoKSB9XG4gICAgICApXG4gICAgfVxuICB9LFxuXG4gIHNldEF1dG9Gb2N1cygpIHtcbiAgICBpZiAodGhpcy5BY3RpdmVQYW5lICE9IG51bGwpIHtcbiAgICAgIHRoaXMudW5kb0ZvY3VzKClcbiAgICB9XG4gICAgdGhpcy5kb0ZvY3VzKClcbiAgfSxcblxuICAvLyBUb2dnbGUgRm9jdXMgb2YgYWN0aXZlIHBhbmVcbiAgdG9nZ2xlRm9jdXMoKSB7XG4gICAgaWYgKHRoaXMuQWN0aXZlUGFuZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnVuZG9Gb2N1cygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG9Gb2N1cygpXG4gICAgfVxuICB9LFxuXG4gIGRvRm9jdXMoKSB7XG4gICAgdGhpcy5BY3RpdmVQYW5lID0gdGhpcy5nZXRBY3RpdmVQYW5lKClcbiAgICB0aGlzLkFjdGl2ZVBhbmUuY2xhc3NMaXN0LmFkZCgnaGV5LXBhbmUtZm9jdXMnKVxuXG4gICAgY29uc3QgZXhwYW5kZWRXaWR0aCA9IGF0b20uY29uZmlnLmdldCgnaGV5LXBhbmUuZXhwYW5kZWRXaWR0aCcpIC8gMTAwXG4gICAgY29uc3QgY29sbGFwc2VkV2lkdGggPSAxIC0gZXhwYW5kZWRXaWR0aFxuXG4gICAgdmFyIHJlY3Vyc2l2ZVNldCA9IChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5wYXJlbnROb2RlLm5vZGVOYW1lID09PSAnQVRPTS1QQU5FLUFYSVMnKSB7XG4gICAgICAgIHRoaXMuc2F2ZUVsZW1lbnRTdGF0ZUFuZFNldEZsZXgobm9kZSwgZXhwYW5kZWRXaWR0aClcbiAgICAgICAgZ2V0U2libGluZ3Mobm9kZSlcbiAgICAgICAgLmZpbHRlcihwYW5lID0+IHBhbmUubm9kZU5hbWUgIT09ICdBVE9NLVBBTkUtUkVTSVpFLUhBTkRMRScpXG4gICAgICAgIC5mb3JFYWNoKHBhbmUgPT4ge1xuICAgICAgICAgIHRoaXMuc2F2ZUVsZW1lbnRTdGF0ZUFuZFNldEZsZXgocGFuZSwgY29sbGFwc2VkV2lkdGgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLm5vZGVOYW1lICE9PSAnQVRPTS1QQU5FLUNPTlRBSU5FUicpIHtcbiAgICAgICAgICByZWN1cnNpdmVTZXQobm9kZS5wYXJlbnROb2RlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVjdXJzaXZlU2V0KHRoaXMuQWN0aXZlUGFuZSk7XG4gIH0sXG5cbiAgdW5kb0ZvY3VzKCkge1xuICAgIHRoaXMuQWN0aXZlUGFuZS5jbGFzc0xpc3QucmVtb3ZlKCdoZXktcGFuZS1mb2N1cycpXG4gICAgdGhpcy5BY3RpdmVQYW5lID0gbnVsbFxuICAgIHRoaXMucmVzdG9yZVBhbmVzKClcbiAgICB0aGlzLmVtcHR5UGFuZVN0YXRlcygpXG4gIH0sXG5cbiAgc2F2ZUVsZW1lbnRTdGF0ZUFuZFNldEZsZXgoZWwsIG5ld0ZsZXhWYWx1ZSkge1xuICAgIGNvbnN0IG9sZEZsZXhWYWx1ZSA9IGVsLnN0eWxlLmZsZXhHcm93XG4gICAgdGhpcy5tb2RpZmllZFBhbmVzLnB1c2goeyBlbCwgb2xkRmxleFZhbHVlIH0pXG4gICAgZWwuc3R5bGUuZmxleEdyb3cgPSBuZXdGbGV4VmFsdWVcbiAgfSxcblxuICByZXN0b3JlUGFuZXMoKSB7XG4gICAgY29uc3QgQ29udGFpbmVyID0gdGhpcy5nZXRQYW5lc0NvbnRhaW5lcigpXG4gICAgdGhpcy5tb2RpZmllZFBhbmVzLmZvckVhY2gocGFuZSA9PiB7XG4gICAgICBpZiAoQ29udGFpbmVyLmNvbnRhaW5zKHBhbmUuZWwpKSB7XG4gICAgICAgIHBhbmUuZWwuc3R5bGUuZmxleEdyb3cgPSBwYW5lLm9sZEZsZXhWYWx1ZVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG5cbiAgZW1wdHlQYW5lU3RhdGVzKCkge1xuICAgIHRoaXMubW9kaWZpZWRQYW5lcyA9IFtdXG4gIH0sXG5cbiAgZ2V0UGFuZXNDb250YWluZXIoKSB7XG4gICAgY29uc3QgVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICByZXR1cm4gVmlldy5xdWVyeVNlbGVjdG9yKCcucGFuZXMnKVxuICB9LFxuXG4gIGdldEFjdGl2ZVBhbmUoKSB7XG4gICAgY29uc3QgVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICByZXR1cm4gVmlldy5xdWVyeVNlbGVjdG9yKCcucGFuZS5hY3RpdmUnKVxuICB9LFxuXG4gIGNoZWNrSW5jb21wYXRpYmlsaXR5KHBsdWdpbikge1xuICAgIGlmICh0aGlzLmluY29tcGF0aWJsZVBsdWdpbnMuaW5jbHVkZXMocGx1Z2luLm5hbWUpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0luY29tcGF0aWJsZSBQYWNrYWdlIERldGVjdGVkJyxcbiAgICAgICAge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIGRldGFpbDogYGhleS1wYW5lIGRvZXMgbm90IHdvcmsgd2hlbiBwYWNrYWdlIFwiJHtwbHVnaW4ubmFtZX1cIiBpcyBhY3RpdmF0ZWQuYFxuICAgICAgICB9XG4gICAgICApXG4gICAgfVxuICB9XG5cbn07XG4iXX0=
//# sourceURL=/home/alisaleemh/.atom/packages/hey-pane/lib/hey-pane.js