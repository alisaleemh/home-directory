(function() {
  var $, FavView, SelectListView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), View = _ref.View, SelectListView = _ref.SelectListView;

  $ = require('jquery');

  FavView = (function(_super) {
    __extends(FavView, _super);

    function FavView() {
      return FavView.__super__.constructor.apply(this, arguments);
    }

    FavView.prototype.initialize = function(items) {
      this.items = items;
      FavView.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      this.setItems(items);
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    FavView.prototype.viewForItem = function(item) {
      var _ref1, _ref2;
      if (!item.favIcon) {
        item.favIcon = (_ref1 = window.$.jStorage.get('bp.favIcon')) != null ? _ref1[item.url] : void 0;
      }
      return "<li><img src='" + item.favIcon + "'width='20' height='20' >&nbsp; &nbsp; " + ((_ref2 = item.title) != null ? _ref2.slice(0, 31) : void 0) + "</li>";
    };

    FavView.prototype.confirmed = function(item) {
      atom.workspace.open(item.url, {
        split: 'left',
        searchAllPanes: true
      });
      return this.parent().remove();
    };

    FavView.prototype.cancelled = function() {
      return this.parent().remove();
    };

    FavView.prototype.getFilterKey = function() {
      return "title";
    };

    return FavView;

  })(SelectListView);

  module.exports = FavView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMvbGliL2Zhdi12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBd0IsT0FBQSxDQUFRLHNCQUFSLENBQXhCLEVBQUMsWUFBQSxJQUFELEVBQU0sc0JBQUEsY0FBTixDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBRkosQ0FBQTs7QUFBQSxFQUdNO0FBQ0osOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHNCQUFBLFVBQUEsR0FBWSxTQUFFLEtBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLFFBQUEsS0FDWixDQUFBO0FBQUEsTUFBQSx5Q0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxrQkFBVixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVixDQUZBLENBQUE7O1FBR0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQUssSUFBTDtTQUE3QjtPQUhWO0FBQUEsTUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQUpBLENBQUE7YUFLQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQU5VO0lBQUEsQ0FBWixDQUFBOztBQUFBLHNCQVFBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTtBQUNULFVBQUEsWUFBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQVcsQ0FBQyxPQUFaO0FBQ0UsUUFBQSxJQUFJLENBQUMsT0FBTCxnRUFBb0QsQ0FBQSxJQUFJLENBQUMsR0FBTCxVQUFwRCxDQURGO09BQUE7YUFFQyxnQkFBQSxHQUFnQixJQUFJLENBQUMsT0FBckIsR0FBNkIseUNBQTdCLEdBQXFFLHFDQUFhLHNCQUFiLENBQXJFLEdBQXlGLFFBSGpGO0lBQUEsQ0FSYixDQUFBOztBQUFBLHNCQWFBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNQLE1BQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLElBQUksQ0FBQyxHQUF6QixFQUE4QjtBQUFBLFFBQUMsS0FBQSxFQUFNLE1BQVA7QUFBQSxRQUFjLGNBQUEsRUFBZSxJQUE3QjtPQUE5QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyxNQUFWLENBQUEsRUFGTztJQUFBLENBYlgsQ0FBQTs7QUFBQSxzQkFpQkEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxFQURTO0lBQUEsQ0FqQlgsQ0FBQTs7QUFBQSxzQkFvQkEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLFFBRFk7SUFBQSxDQXBCZCxDQUFBOzttQkFBQTs7S0FEb0IsZUFIdEIsQ0FBQTs7QUFBQSxFQTBCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixPQTFCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/browser-plus/lib/fav-view.coffee
