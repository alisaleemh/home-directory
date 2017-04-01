Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var TooltipDelegate = (function () {
  function TooltipDelegate() {
    var _this = this;

    _classCallCheck(this, TooltipDelegate);

    this.emitter = new _sbEventKit.Emitter();
    this.expanded = false;
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.showProviderName', function (showProviderName) {
      var shouldUpdate = typeof _this.showProviderName !== 'undefined';
      _this.showProviderName = showProviderName;
      if (shouldUpdate) {
        _this.emitter.emit('should-update');
      }
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:expand-tooltip': function linterUiDefaultExpandTooltip(event) {
        if (_this.expanded) {
          return;
        }
        _this.expanded = true;
        _this.emitter.emit('should-expand');

        // If bound to a key, collapse when that key is released, just like old times
        if (event.originalEvent && event.originalEvent.isTrusted) {
          document.body.addEventListener('keyup', function eventListener() {
            document.body.removeEventListener('keyup', eventListener);
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'linter-ui-default:collapse-tooltip');
          });
        }
      },
      'linter-ui-default:collapse-tooltip': function linterUiDefaultCollapseTooltip() {
        _this.expanded = false;
        _this.emitter.emit('should-collapse');
      }
    }));
  }

  _createClass(TooltipDelegate, [{
    key: 'onShouldUpdate',
    value: function onShouldUpdate(callback) {
      return this.emitter.on('should-update', callback);
    }
  }, {
    key: 'onShouldExpand',
    value: function onShouldExpand(callback) {
      return this.emitter.on('should-expand', callback);
    }
  }, {
    key: 'onShouldCollapse',
    value: function onShouldCollapse(callback) {
      return this.emitter.on('should-collapse', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.dispose();
    }
  }]);

  return TooltipDelegate;
})();

exports['default'] = TooltipDelegate;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvZGVsZWdhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7MEJBRTZDLGNBQWM7O0lBR3RDLGVBQWU7QUFNdkIsV0FOUSxlQUFlLEdBTXBCOzs7MEJBTkssZUFBZTs7QUFPaEMsUUFBSSxDQUFDLE9BQU8sR0FBRyx5QkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLFFBQUksQ0FBQyxhQUFhLEdBQUcscUNBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLGdCQUFnQixFQUFLO0FBQ3JHLFVBQU0sWUFBWSxHQUFHLE9BQU8sTUFBSyxnQkFBZ0IsS0FBSyxXQUFXLENBQUE7QUFDakUsWUFBSyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtBQUN4QyxVQUFJLFlBQVksRUFBRTtBQUNoQixjQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7T0FDbkM7S0FDRixDQUFDLENBQUMsQ0FBQTtBQUNILFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELHdDQUFrQyxFQUFFLHNDQUFDLEtBQUssRUFBSztBQUM3QyxZQUFJLE1BQUssUUFBUSxFQUFFO0FBQ2pCLGlCQUFNO1NBQ1A7QUFDRCxjQUFLLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDcEIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBOzs7QUFHbEMsWUFBSSxLQUFLLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFO0FBQ3hELGtCQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxTQUFTLGFBQWEsR0FBRztBQUMvRCxvQkFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUE7QUFDekQsZ0JBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFBO1dBQ2pHLENBQUMsQ0FBQTtTQUNIO09BQ0Y7QUFDRCwwQ0FBb0MsRUFBRSwwQ0FBTTtBQUMxQyxjQUFLLFFBQVEsR0FBRyxLQUFLLENBQUE7QUFDckIsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7T0FDckM7S0FDRixDQUFDLENBQUMsQ0FBQTtHQUNKOztlQXhDa0IsZUFBZTs7V0F5Q3BCLHdCQUFDLFFBQXFCLEVBQWM7QUFDaEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDbEQ7OztXQUNhLHdCQUFDLFFBQXFCLEVBQWM7QUFDaEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDbEQ7OztXQUNlLDBCQUFDLFFBQXFCLEVBQWM7QUFDbEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNwRDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ3ZCOzs7U0FwRGtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3Rvb2x0aXAvZGVsZWdhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IHR5cGUgeyBEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb29sdGlwRGVsZWdhdGUge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBleHBhbmRlZDogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgc2hvd1Byb3ZpZGVyTmFtZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5leHBhbmRlZCA9IGZhbHNlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93UHJvdmlkZXJOYW1lJywgKHNob3dQcm92aWRlck5hbWUpID0+IHtcbiAgICAgIGNvbnN0IHNob3VsZFVwZGF0ZSA9IHR5cGVvZiB0aGlzLnNob3dQcm92aWRlck5hbWUgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnNob3dQcm92aWRlck5hbWUgPSBzaG93UHJvdmlkZXJOYW1lXG4gICAgICBpZiAoc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtdXBkYXRlJylcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpleHBhbmQtdG9vbHRpcCc6IChldmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5leHBhbmRlZCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwYW5kZWQgPSB0cnVlXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzaG91bGQtZXhwYW5kJylcblxuICAgICAgICAvLyBJZiBib3VuZCB0byBhIGtleSwgY29sbGFwc2Ugd2hlbiB0aGF0IGtleSBpcyByZWxlYXNlZCwganVzdCBsaWtlIG9sZCB0aW1lc1xuICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudCAmJiBldmVudC5vcmlnaW5hbEV2ZW50LmlzVHJ1c3RlZCkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbiBldmVudExpc3RlbmVyKCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50TGlzdGVuZXIpXG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdsaW50ZXItdWktZGVmYXVsdDpjb2xsYXBzZS10b29sdGlwJylcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmNvbGxhcHNlLXRvb2x0aXAnOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuZXhwYW5kZWQgPSBmYWxzZVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWNvbGxhcHNlJylcbiAgICAgIH0sXG4gICAgfSkpXG4gIH1cbiAgb25TaG91bGRVcGRhdGUoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignc2hvdWxkLXVwZGF0ZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uU2hvdWxkRXhwYW5kKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC1leHBhbmQnLCBjYWxsYmFjaylcbiAgfVxuICBvblNob3VsZENvbGxhcHNlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC1jb2xsYXBzZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKVxuICB9XG59XG4iXX0=