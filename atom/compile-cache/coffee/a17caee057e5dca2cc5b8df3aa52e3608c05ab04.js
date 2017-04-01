
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  'Command finder' view, which lists all available commands and variables.
 */

(function() {
  var $$, ATPCommandFinderView, SelectListView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = include('atom-space-pen-views'), SelectListView = _ref.SelectListView, $$ = _ref.$$;

  module.exports = ATPCommandFinderView = (function(_super) {
    __extends(ATPCommandFinderView, _super);

    function ATPCommandFinderView() {
      return ATPCommandFinderView.__super__.constructor.apply(this, arguments);
    }

    ATPCommandFinderView.thisPanel = null;

    ATPCommandFinderView.thisCaller = null;

    ATPCommandFinderView.prototype.initialize = function(listOfItems) {
      this.listOfItems = listOfItems;
      ATPCommandFinderView.__super__.initialize.apply(this, arguments);
      return this.setItems(this.listOfItems);
    };

    ATPCommandFinderView.prototype.viewForItem = function(item) {
      var descr_prefix, icon_style;
      icon_style = '';
      descr_prefix = '';
      if (item.source === 'external') {
        icon_style = 'book';
        descr_prefix = 'External: ';
      } else if (item.source === 'internal') {
        icon_style = 'repo';
        descr_prefix = 'Builtin: ';
      } else if (item.source === 'internal-atom') {
        icon_style = 'repo';
        descr_prefix = 'Atom command: ';
      } else if (item.source === 'external-functional') {
        icon_style = 'plus';
        descr_prefix = 'Functional: ';
      } else if (item.source === 'global-variable') {
        icon_style = 'briefcase';
        descr_prefix = 'Global variable: ';
      }
      return $$(function() {
        return this.li({
          "class": 'two-lines selected'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": "status status-" + icon_style + " icon icon-" + icon_style
            });
            _this.div({
              "class": 'primary-line'
            }, function() {
              return _this.span(item.name);
            });
            return _this.div({
              "class": 'secondary-line'
            }, function() {
              return _this.span(descr_prefix + item.description);
            });
          };
        })(this));
      });
    };

    ATPCommandFinderView.prototype.shown = function(panel, caller) {
      this.thisPanel = panel;
      return this.thisCaller = caller;
    };

    ATPCommandFinderView.prototype.close = function(item) {
      var e;
      if (this.thisPanel != null) {
        try {
          this.thisPanel.destroy();
        } catch (_error) {
          e = _error;
        }
      }
      if (item != null) {
        return this.thisCaller.onCommand(item.name);
      }
    };

    ATPCommandFinderView.prototype.cancel = function() {
      return this.close(null);
    };

    ATPCommandFinderView.prototype.confirmed = function(item) {
      return this.close(item);
    };

    ATPCommandFinderView.prototype.getFilterKey = function() {
      return "name";
    };

    return ATPCommandFinderView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAtY29tbWFuZC1maW5kZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBUUEsT0FBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsc0JBQUEsY0FBRCxFQUFpQixVQUFBLEVBUmpCLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osMkNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsb0JBQUMsQ0FBQSxTQUFELEdBQVksSUFBWixDQUFBOztBQUFBLElBQ0Esb0JBQUMsQ0FBQSxVQUFELEdBQWEsSUFEYixDQUFBOztBQUFBLG1DQUdBLFVBQUEsR0FBWSxTQUFFLFdBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLGNBQUEsV0FDWixDQUFBO0FBQUEsTUFBQSxzREFBQSxTQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFdBQVgsRUFGVTtJQUFBLENBSFosQ0FBQTs7QUFBQSxtQ0FRQSxXQUFBLEdBQWEsU0FBQyxJQUFELEdBQUE7QUFDWCxVQUFBLHdCQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsRUFBYixDQUFBO0FBQUEsTUFDQSxZQUFBLEdBQWUsRUFEZixDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsVUFBbEI7QUFDRSxRQUFBLFVBQUEsR0FBYSxNQUFiLENBQUE7QUFBQSxRQUNBLFlBQUEsR0FBZSxZQURmLENBREY7T0FBQSxNQUdLLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxVQUFsQjtBQUNILFFBQUEsVUFBQSxHQUFh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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp-command-finder.coffee
