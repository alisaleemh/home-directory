(function() {
  var CompositeDisposable, MinimapHighlightSelected, requirePackages,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  requirePackages = require('atom-utils').requirePackages;

  MinimapHighlightSelected = (function() {
    function MinimapHighlightSelected() {
      this.markersDestroyed = __bind(this.markersDestroyed, this);
      this.markerCreated = __bind(this.markerCreated, this);
      this.dispose = __bind(this.dispose, this);
      this.init = __bind(this.init, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapHighlightSelected.prototype.activate = function(state) {};

    MinimapHighlightSelected.prototype.consumeMinimapServiceV1 = function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('highlight-selected', this);
    };

    MinimapHighlightSelected.prototype.consumeHighlightSelectedServiceV1 = function(highlightSelected) {
      this.highlightSelected = highlightSelected;
      if ((this.minimap != null) && (this.active != null)) {
        return this.init();
      }
    };

    MinimapHighlightSelected.prototype.deactivate = function() {
      this.deactivatePlugin();
      this.minimapPackage = null;
      this.highlightSelectedPackage = null;
      this.highlightSelected = null;
      return this.minimap = null;
    };

    MinimapHighlightSelected.prototype.isActive = function() {
      return this.active;
    };

    MinimapHighlightSelected.prototype.activatePlugin = function() {
      if (this.active) {
        return;
      }
      this.subscriptions.add(this.minimap.onDidActivate(this.init));
      this.subscriptions.add(this.minimap.onDidDeactivate(this.dispose));
      this.active = true;
      if (this.highlightSelected != null) {
        return this.init();
      }
    };

    MinimapHighlightSelected.prototype.init = function() {
      this.decorations = [];
      this.highlightSelected.onDidAddMarker((function(_this) {
        return function(marker) {
          return _this.markerCreated(marker);
        };
      })(this));
      this.highlightSelected.onDidAddSelectedMarker((function(_this) {
        return function(marker) {
          return _this.markerCreated(marker, true);
        };
      })(this));
      return this.highlightSelected.onDidRemoveAllMarkers((function(_this) {
        return function() {
          return _this.markersDestroyed();
        };
      })(this));
    };

    MinimapHighlightSelected.prototype.dispose = function() {
      var _ref;
      if ((_ref = this.decorations) != null) {
        _ref.forEach(function(decoration) {
          return decoration.destroy();
        });
      }
      return this.decorations = null;
    };

    MinimapHighlightSelected.prototype.markerCreated = function(marker, selected) {
      var activeMinimap, className, decoration;
      if (selected == null) {
        selected = false;
      }
      activeMinimap = this.minimap.getActiveMinimap();
      if (activeMinimap == null) {
        return;
      }
      className = 'highlight-selected';
      if (selected) {
        className += ' selected';
      }
      decoration = activeMinimap.decorateMarker(marker, {
        type: 'highlight',
        "class": className
      });
      return this.decorations.push(decoration);
    };

    MinimapHighlightSelected.prototype.markersDestroyed = function() {
      this.decorations.forEach(function(decoration) {
        return decoration.destroy();
      });
      return this.decorations = [];
    };

    MinimapHighlightSelected.prototype.deactivatePlugin = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.dispose();
      return this.subscriptions.dispose();
    };

    return MinimapHighlightSelected;

  })();

  module.exports = new MinimapHighlightSelected;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC9saWIvbWluaW1hcC1oaWdobGlnaHQtc2VsZWN0ZWQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNDLGtCQUFtQixPQUFBLENBQVEsWUFBUixFQUFuQixlQURELENBQUE7O0FBQUEsRUFHTTtBQUNTLElBQUEsa0NBQUEsR0FBQTtBQUNYLGlFQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FEVztJQUFBLENBQWI7O0FBQUEsdUNBR0EsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBLENBSFYsQ0FBQTs7QUFBQSx1Q0FLQSx1QkFBQSxHQUF5QixTQUFFLE9BQUYsR0FBQTtBQUN2QixNQUR3QixJQUFDLENBQUEsVUFBQSxPQUN6QixDQUFBO2FBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQXdCLG9CQUF4QixFQUE4QyxJQUE5QyxFQUR1QjtJQUFBLENBTHpCLENBQUE7O0FBQUEsdUNBUUEsaUNBQUEsR0FBbUMsU0FBRSxpQkFBRixHQUFBO0FBQ2pDLE1BRGtDLElBQUMsQ0FBQSxvQkFBQSxpQkFDbkMsQ0FBQTtBQUFBLE1BQUEsSUFBVyxzQkFBQSxJQUFjLHFCQUF6QjtlQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsRUFBQTtPQURpQztJQUFBLENBUm5DLENBQUE7O0FBQUEsdUNBV0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1B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

//# sourceURL=/home/alisaleemh/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected.coffee
