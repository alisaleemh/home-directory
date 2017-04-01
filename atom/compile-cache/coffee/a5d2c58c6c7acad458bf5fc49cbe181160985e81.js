(function() {
  var CompositeDisposable, PersistentSelectionManager, _, decorationOptions;

  _ = require('underscore-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  decorationOptions = {
    type: 'highlight',
    "class": 'vim-mode-plus-persistent-selection'
  };

  module.exports = PersistentSelectionManager = (function() {
    PersistentSelectionManager.prototype.patterns = null;

    function PersistentSelectionManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
      this.markerLayer.onDidUpdate((function(_this) {
        return function() {
          return _this.editorElement.classList.toggle("has-persistent-selection", _this.hasMarkers());
        };
      })(this));
    }

    PersistentSelectionManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    PersistentSelectionManager.prototype.select = function() {
      var i, len, range, ref;
      ref = this.getMarkerBufferRanges();
      for (i = 0, len = ref.length; i < len; i++) {
        range = ref[i];
        this.editor.addSelectionForBufferRange(range);
      }
      return this.clear();
    };

    PersistentSelectionManager.prototype.setSelectedBufferRanges = function() {
      this.editor.setSelectedBufferRanges(this.getMarkerBufferRanges());
      return this.clear();
    };

    PersistentSelectionManager.prototype.clear = function() {
      return this.clearMarkers();
    };

    PersistentSelectionManager.prototype.isEmpty = function() {
      return this.markerLayer.getMarkerCount() === 0;
    };

    PersistentSelectionManager.prototype.markBufferRange = function(range) {
      return this.markerLayer.markBufferRange(range);
    };

    PersistentSelectionManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    PersistentSelectionManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    PersistentSelectionManager.prototype.getMarkerCount = function() {
      return this.markerLayer.getMarkerCount();
    };

    PersistentSelectionManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    PersistentSelectionManager.prototype.getMarkerBufferRanges = function() {
      return this.markerLayer.getMarkers().map(function(marker) {
        return marker.getBufferRange();
      });
    };

    PersistentSelectionManager.prototype.getMarkerAtPoint = function(point) {
      return this.markerLayer.findMarkers({
        containsBufferPosition: point
      })[0];
    };

    return PersistentSelectionManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9wZXJzaXN0ZW50LXNlbGVjdGlvbi1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLGlCQUFBLEdBQW9CO0lBQUMsSUFBQSxFQUFNLFdBQVA7SUFBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQ0FBM0I7OztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUNNO3lDQUNKLFFBQUEsR0FBVTs7SUFFRyxvQ0FBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osTUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUE0QixJQUFDLENBQUEsV0FBN0IsRUFBMEMsaUJBQTFDO01BR25CLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3ZCLEtBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQXpCLENBQWdDLDBCQUFoQyxFQUE0RCxLQUFDLENBQUEsVUFBRCxDQUFBLENBQTVEO1FBRHVCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtJQVRXOzt5Q0FZYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxlQUFlLENBQUMsT0FBakIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7SUFITzs7eUNBS1QsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO0FBQUE7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsS0FBbkM7QUFERjthQUVBLElBQUMsQ0FBQSxLQUFELENBQUE7SUFITTs7eUNBS1IsdUJBQUEsR0FBeUIsU0FBQTtNQUN2QixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQWhDO2FBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUZ1Qjs7eUNBSXpCLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQURLOzt5Q0FHUCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQUEsS0FBaUM7SUFEMUI7O3lDQUtULGVBQUEsR0FBaUIsU0FBQyxLQUFEO2FBQ2YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxlQUFiLENBQTZCLEtBQTdCO0lBRGU7O3lDQUdqQixVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsY0FBYixDQUFBLENBQUEsR0FBZ0M7SUFEdEI7O3lDQUdaLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUE7SUFEVTs7eUNBR1osY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUE7SUFEYzs7eUNBR2hCLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQUE7SUFEWTs7eUNBR2QscUJBQUEsR0FBdUIsU0FBQTthQUNyQixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQSxDQUF5QixDQUFDLEdBQTFCLENBQThCLFNBQUMsTUFBRDtlQUM1QixNQUFNLENBQUMsY0FBUCxDQUFBO01BRDRCLENBQTlCO0lBRHFCOzt5Q0FJdkIsZ0JBQUEsR0FBa0IsU0FBQyxLQUFEO2FBQ2hCLElBQUMsQ0FBQSxXQUFXLENBQUMsV0FBYixDQUF5QjtRQUFBLHNCQUFBLEVBQXdCLEtBQXhCO09BQXpCLENBQXdELENBQUEsQ0FBQTtJQUR4Qzs7Ozs7QUE5RHBCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmRlY29yYXRpb25PcHRpb25zID0ge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtcGVyc2lzdGVudC1zZWxlY3Rpb24nfVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uTWFuYWdlclxuICBwYXR0ZXJuczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQGRlY29yYXRpb25MYXllciA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihAbWFya2VyTGF5ZXIsIGRlY29yYXRpb25PcHRpb25zKVxuXG4gICAgIyBVcGRhdGUgY3NzIG9uIGV2ZXJ5IG1hcmtlciB1cGRhdGUuXG4gICAgQG1hcmtlckxheWVyLm9uRGlkVXBkYXRlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIEBoYXNNYXJrZXJzKCkpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG5cbiAgc2VsZWN0OiAtPlxuICAgIGZvciByYW5nZSBpbiBAZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKClcbiAgICAgIEBlZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgQGNsZWFyKClcblxuICBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlczogLT5cbiAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKEBnZXRNYXJrZXJCdWZmZXJSYW5nZXMoKSlcbiAgICBAY2xlYXIoKVxuXG4gIGNsZWFyOiAtPlxuICAgIEBjbGVhck1hcmtlcnMoKVxuXG4gIGlzRW1wdHk6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgaXMgMFxuXG4gICMgTWFya2Vyc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbWFya0J1ZmZlclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyYW5nZSlcblxuICBoYXNNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpID4gMFxuXG4gIGdldE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuXG4gIGdldE1hcmtlckNvdW50OiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG5cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG5cbiAgZ2V0TWFya2VyQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJzKCkubWFwIChtYXJrZXIpIC0+XG4gICAgICBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGdldE1hcmtlckF0UG9pbnQ6IChwb2ludCkgLT5cbiAgICBAbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoY29udGFpbnNCdWZmZXJQb3NpdGlvbjogcG9pbnQpWzBdXG4iXX0=
