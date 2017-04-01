(function() {
  var BrowserPlusZoom, CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = BrowserPlusZoom = {
    subscriptions: null,
    activate: function(state) {
      return this.subscriptions = new CompositeDisposable;
    },
    consumeAddPlugin: function(bp) {
      var requires;
      this.bp = bp;
      requires = {
        onInit: function() {
          return jQuery.jStorage.set('zoomfactor', '100');
        },
        menus: [
          {
            ctrlkey: 'ctrl+=',
            fn: function(evt, data) {
              var zoomFactor;
              if (location.href === 'browser-plus://blank') {
                return;
              }
              zoomFactor = 5 + Number(jQuery.jStorage.get('zoomfactor') || 100);
              if (zoomFactor > 300) {
                zoomFactor = 300;
                alert('max zoom-out reached');
              }
              jQuery('body').css('zoom', zoomFactor + "%");
              jQuery.jStorage.set('zoomfactor', zoomFactor);
              return jQuery.notifyBar({
                html: "zoom: " + zoomFactor + "%",
                delay: 2000,
                animationSpeed: "normal"
              });
            }
          }, {
            ctrlkey: 'ctrl+-',
            fn: function(evt, data) {
              var zoomFactor;
              if (location.href === 'browser-plus://blank') {
                return;
              }
              zoomFactor = Number(jQuery.jStorage.get('zoomfactor') || 100) - 5;
              if (zoomFactor < 30) {
                zoomFactor = 30;
                alert('max zoom-out reached');
              }
              jQuery('body').css('zoom', zoomFactor + "%");
              jQuery.jStorage.set('zoomfactor', zoomFactor);
              return jQuery.notifyBar({
                html: "zoom: " + zoomFactor + "%",
                delay: 2000,
                animationSpeed: "normal"
              });
            }
          }
        ]
      };
      return this.bp.addPlugin(requires, this);
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMtem9vbS9saWIvYnJvd3Nlci1wbHVzLXpvb20uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGVBQUEsR0FDZjtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDthQUVSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7SUFGYixDQUZWO0lBTUEsZ0JBQUEsRUFBa0IsU0FBQyxFQUFEO0FBQ2hCLFVBQUE7TUFEaUIsSUFBQyxDQUFBLEtBQUQ7TUFDakIsUUFBQSxHQUNFO1FBQUEsTUFBQSxFQUFRLFNBQUE7aUJBQ04sTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFoQixDQUFvQixZQUFwQixFQUFpQyxLQUFqQztRQURNLENBQVI7UUFJQSxLQUFBLEVBQU07VUFDSjtZQUNFLE9BQUEsRUFBUyxRQURYO1lBRUUsRUFBQSxFQUFJLFNBQUMsR0FBRCxFQUFLLElBQUw7QUFDRixrQkFBQTtjQUFBLElBQVUsUUFBUSxDQUFDLElBQVQsS0FBaUIsc0JBQTNCO0FBQUEsdUJBQUE7O2NBQ0EsVUFBQSxHQUFhLENBQUEsR0FBSSxNQUFBLENBQVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFoQixDQUFvQixZQUFwQixDQUFBLElBQXFDLEdBQTdDO2NBQ2pCLElBQUcsVUFBQSxHQUFhLEdBQWhCO2dCQUNFLFVBQUEsR0FBYTtnQkFDYixLQUFBLENBQU0sc0JBQU4sRUFGRjs7Y0FHQSxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsR0FBZixDQUFtQixNQUFuQixFQUE4QixVQUFELEdBQVksR0FBekM7Y0FDQSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQWhCLENBQW9CLFlBQXBCLEVBQWlDLFVBQWpDO3FCQUNBLE1BQU0sQ0FBQyxTQUFQLENBQ0k7Z0JBQUEsSUFBQSxFQUFNLFFBQUEsR0FBUyxVQUFULEdBQW9CLEdBQTFCO2dCQUNBLEtBQUEsRUFBTyxJQURQO2dCQUVBLGNBQUEsRUFBZ0IsUUFGaEI7ZUFESjtZQVJFLENBRk47V0FESSxFQWdCSjtZQUNFLE9BQUEsRUFBUyxRQURYO1lBRUUsRUFBQSxFQUFJLFNBQUMsR0FBRCxFQUFLLElBQUw7QUFDRixrQkFBQTtjQUFBLElBQVUsUUFBUSxDQUFDLElBQVQsS0FBaUIsc0JBQTNCO0FBQUEsdUJBQUE7O2NBQ0EsVUFBQSxHQUFhLE1BQUEsQ0FBUSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQWhCLENBQW9CLFlBQXBCLENBQUEsSUFBcUMsR0FBN0MsQ0FBQSxHQUFxRDtjQUNsRSxJQUFHLFVBQUEsR0FBYSxFQUFoQjtnQkFDRSxVQUFBLEdBQWE7Z0JBQ2IsS0FBQSxDQUFNLHNCQUFOLEVBRkY7O2NBR0EsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLEdBQWYsQ0FBbUIsTUFBbkIsRUFBOEIsVUFBRCxHQUFZLEdBQXpDO2NBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFoQixDQUFvQixZQUFwQixFQUFpQyxVQUFqQztxQkFDQSxNQUFNLENBQUMsU0FBUCxDQUNJO2dCQUFBLElBQUEsRUFBTSxRQUFBLEdBQVMsVUFBVCxHQUFvQixHQUExQjtnQkFDQSxLQUFBLEVBQU8sSUFEUDtnQkFFQSxjQUFBLEVBQWdCLFFBRmhCO2VBREo7WUFSRSxDQUZOO1dBaEJJO1NBSk47O2FBcUNGLElBQUMsQ0FBQSxFQUFFLENBQUMsU0FBSixDQUFjLFFBQWQsRUFBdUIsSUFBdkI7SUF2Q2dCLENBTmxCO0lBK0NBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQS9DWjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlclBsdXNab29tID1cbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgY29uc3VtZUFkZFBsdWdpbjogKEBicCktPlxuICAgIHJlcXVpcmVzID1cbiAgICAgIG9uSW5pdDogLT5cbiAgICAgICAgalF1ZXJ5LmpTdG9yYWdlLnNldCgnem9vbWZhY3RvcicsJzEwMCcpXG4gICAgICAjIGpzOiBbXCJyZXNvdXJjZXMvaW5pdC5qc1wiXVxuICAgICAgIyBjc3M6W1wicmVzb3VyY2VzL2Jyb3dzZXItcGx1cy16b29tLmNzc1wiXVxuICAgICAgbWVudXM6W1xuICAgICAgICB7XG4gICAgICAgICAgY3RybGtleTogJ2N0cmwrPSdcbiAgICAgICAgICBmbjogKGV2dCxkYXRhKS0+XG4gICAgICAgICAgICByZXR1cm4gaWYgbG9jYXRpb24uaHJlZiBpcyAnYnJvd3Nlci1wbHVzOi8vYmxhbmsnXG4gICAgICAgICAgICB6b29tRmFjdG9yID0gNSArIE51bWJlciggalF1ZXJ5LmpTdG9yYWdlLmdldCgnem9vbWZhY3RvcicpIG9yIDEwMCApXG4gICAgICAgICAgICBpZiB6b29tRmFjdG9yID4gMzAwXG4gICAgICAgICAgICAgIHpvb21GYWN0b3IgPSAzMDBcbiAgICAgICAgICAgICAgYWxlcnQoJ21heCB6b29tLW91dCByZWFjaGVkJylcbiAgICAgICAgICAgIGpRdWVyeSgnYm9keScpLmNzcygnem9vbScsIFwiI3t6b29tRmFjdG9yfSVcIilcbiAgICAgICAgICAgIGpRdWVyeS5qU3RvcmFnZS5zZXQoJ3pvb21mYWN0b3InLHpvb21GYWN0b3IpXG4gICAgICAgICAgICBqUXVlcnkubm90aWZ5QmFyXG4gICAgICAgICAgICAgICAgaHRtbDogXCJ6b29tOiAje3pvb21GYWN0b3J9JVwiXG4gICAgICAgICAgICAgICAgZGVsYXk6IDIwMDBcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TcGVlZDogXCJub3JtYWxcIlxuICAgICAgICB9XG4gICAgICAgIHtcbiAgICAgICAgICBjdHJsa2V5OiAnY3RybCstJ1xuICAgICAgICAgIGZuOiAoZXZ0LGRhdGEpLT5cbiAgICAgICAgICAgIHJldHVybiBpZiBsb2NhdGlvbi5ocmVmIGlzICdicm93c2VyLXBsdXM6Ly9ibGFuaydcbiAgICAgICAgICAgIHpvb21GYWN0b3IgPSBOdW1iZXIoIGpRdWVyeS5qU3RvcmFnZS5nZXQoJ3pvb21mYWN0b3InKSBvciAxMDAgKSAtIDVcbiAgICAgICAgICAgIGlmIHpvb21GYWN0b3IgPCAzMFxuICAgICAgICAgICAgICB6b29tRmFjdG9yID0gMzBcbiAgICAgICAgICAgICAgYWxlcnQoJ21heCB6b29tLW91dCByZWFjaGVkJylcbiAgICAgICAgICAgIGpRdWVyeSgnYm9keScpLmNzcygnem9vbScsIFwiI3t6b29tRmFjdG9yfSVcIilcbiAgICAgICAgICAgIGpRdWVyeS5qU3RvcmFnZS5zZXQoJ3pvb21mYWN0b3InLHpvb21GYWN0b3IpXG4gICAgICAgICAgICBqUXVlcnkubm90aWZ5QmFyXG4gICAgICAgICAgICAgICAgaHRtbDogXCJ6b29tOiAje3pvb21GYWN0b3J9JVwiXG4gICAgICAgICAgICAgICAgZGVsYXk6IDIwMDBcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TcGVlZDogXCJub3JtYWxcIlxuXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICBAYnAuYWRkUGx1Z2luIHJlcXVpcmVzLEBcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuIl19
