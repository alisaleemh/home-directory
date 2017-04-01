Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var BusySignal = (function () {
  function BusySignal() {
    _classCallCheck(this, BusySignal);

    this.executing = new Set();
    this.subscriptions = new _sbEventKit.CompositeDisposable();
  }

  _createClass(BusySignal, [{
    key: 'attach',
    value: function attach(registry) {
      this.provider = registry.create();
      this.update();
    }
  }, {
    key: 'update',
    value: function update() {
      var provider = this.provider;
      if (!provider) {
        return;
      }
      provider.clear();
      var fileMap = new Map();

      for (var _ref2 of this.executing) {
        var _filePath = _ref2.filePath;
        var _linter = _ref2.linter;

        var names = fileMap.get(_filePath);
        if (!names) {
          fileMap.set(_filePath, names = []);
        }
        names.push(_linter.name);
      }

      for (var _ref33 of fileMap) {
        var _ref32 = _slicedToArray(_ref33, 2);

        var _filePath2 = _ref32[0];
        var names = _ref32[1];

        var path = _filePath2 ? ' on ' + atom.project.relativizePath(_filePath2)[1] : '';
        provider.add('' + names.join(', ') + path);
      }
      fileMap.clear();
    }
  }, {
    key: 'getExecuting',
    value: function getExecuting(linter, filePath) {
      for (var entry of this.executing) {
        if (entry.linter === linter && entry.filePath === filePath) {
          return entry;
        }
      }
      return null;
    }
  }, {
    key: 'didBeginLinting',
    value: function didBeginLinting(linter, filePath) {
      if (this.getExecuting(linter, filePath)) {
        return;
      }
      this.executing.add({ linter: linter, filePath: filePath });
      this.update();
    }
  }, {
    key: 'didFinishLinting',
    value: function didFinishLinting(linter, filePath) {
      var entry = this.getExecuting(linter, filePath);
      if (entry) {
        this.executing['delete'](entry);
        this.update();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.provider) {
        this.provider.clear();
      }
      this.executing.clear();
      this.subscriptions.dispose();
    }
  }]);

  return BusySignal;
})();

exports['default'] = BusySignal;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2J1c3ktc2lnbmFsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7MEJBRW9DLGNBQWM7O0lBRzdCLFVBQVU7QUFRbEIsV0FSUSxVQUFVLEdBUWY7MEJBUkssVUFBVTs7QUFTM0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcscUNBQXlCLENBQUE7R0FDL0M7O2VBWGtCLFVBQVU7O1dBWXZCLGdCQUFDLFFBQWdCLEVBQUU7QUFDdkIsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDakMsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0tBQ2Q7OztXQUNLLGtCQUFHO0FBQ1AsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtBQUM5QixVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZUFBTTtPQUNQO0FBQ0QsY0FBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2hCLFVBQU0sT0FBb0MsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBOztBQUV0RCx3QkFBbUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUF0QyxTQUFRLFNBQVIsUUFBUTtZQUFFLE9BQU0sU0FBTixNQUFNOztBQUMzQixZQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVEsQ0FBQyxDQUFBO0FBQ2pDLFlBQUksQ0FBQyxLQUFLLEVBQUU7QUFDVixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxTQUFRLEVBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1NBQ2xDO0FBQ0QsYUFBSyxDQUFDLElBQUksQ0FBQyxPQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDeEI7O0FBRUQseUJBQWdDLE9BQU8sRUFBRTs7O1lBQTdCLFVBQVE7WUFBRSxLQUFLOztBQUN6QixZQUFNLElBQUksR0FBRyxVQUFRLFlBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUssRUFBRSxDQUFBO0FBQzlFLGdCQUFRLENBQUMsR0FBRyxNQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFHLENBQUE7T0FDM0M7QUFDRCxhQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDaEI7OztXQUNXLHNCQUFDLE1BQWMsRUFBRSxRQUFpQixFQUFXO0FBQ3ZELFdBQUssSUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQyxZQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO0FBQzFELGlCQUFPLEtBQUssQ0FBQTtTQUNiO09BQ0Y7QUFDRCxhQUFPLElBQUksQ0FBQTtLQUNaOzs7V0FDYyx5QkFBQyxNQUFjLEVBQUUsUUFBaUIsRUFBRTtBQUNqRCxVQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFO0FBQ3ZDLGVBQU07T0FDUDtBQUNELFVBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUN4QyxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7S0FDZDs7O1dBQ2UsMEJBQUMsTUFBYyxFQUFFLFFBQWlCLEVBQUU7QUFDbEQsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDakQsVUFBSSxLQUFLLEVBQUU7QUFDVCxZQUFJLENBQUMsU0FBUyxVQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDNUIsWUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO09BQ2Q7S0FDRjs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtPQUN0QjtBQUNELFVBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBbEVrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvaG9tZS9hbGlzYWxlZW1oLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9idXN5LXNpZ25hbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IExpbnRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1c3lTaWduYWwge1xuICBwcm92aWRlcjogP09iamVjdDtcbiAgZXhlY3V0aW5nOiBTZXQ8e1xuICAgIGxpbnRlcjogTGludGVyLFxuICAgIGZpbGVQYXRoOiA/c3RyaW5nLFxuICB9PjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmV4ZWN1dGluZyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgfVxuICBhdHRhY2gocmVnaXN0cnk6IE9iamVjdCkge1xuICAgIHRoaXMucHJvdmlkZXIgPSByZWdpc3RyeS5jcmVhdGUoKVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuICB1cGRhdGUoKSB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSB0aGlzLnByb3ZpZGVyXG4gICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHByb3ZpZGVyLmNsZWFyKClcbiAgICBjb25zdCBmaWxlTWFwOiBNYXA8P3N0cmluZywgQXJyYXk8c3RyaW5nPj4gPSBuZXcgTWFwKClcblxuICAgIGZvciAoY29uc3QgeyBmaWxlUGF0aCwgbGludGVyIH0gb2YgdGhpcy5leGVjdXRpbmcpIHtcbiAgICAgIGxldCBuYW1lcyA9IGZpbGVNYXAuZ2V0KGZpbGVQYXRoKVxuICAgICAgaWYgKCFuYW1lcykge1xuICAgICAgICBmaWxlTWFwLnNldChmaWxlUGF0aCwgbmFtZXMgPSBbXSlcbiAgICAgIH1cbiAgICAgIG5hbWVzLnB1c2gobGludGVyLm5hbWUpXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIG5hbWVzXSBvZiBmaWxlTWFwKSB7XG4gICAgICBjb25zdCBwYXRoID0gZmlsZVBhdGggPyBgIG9uICR7YXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVsxXX1gIDogJydcbiAgICAgIHByb3ZpZGVyLmFkZChgJHtuYW1lcy5qb2luKCcsICcpfSR7cGF0aH1gKVxuICAgIH1cbiAgICBmaWxlTWFwLmNsZWFyKClcbiAgfVxuICBnZXRFeGVjdXRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nKTogP09iamVjdCB7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmV4ZWN1dGluZykge1xuICAgICAgaWYgKGVudHJ5LmxpbnRlciA9PT0gbGludGVyICYmIGVudHJ5LmZpbGVQYXRoID09PSBmaWxlUGF0aCkge1xuICAgICAgICByZXR1cm4gZW50cnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBkaWRCZWdpbkxpbnRpbmcobGludGVyOiBMaW50ZXIsIGZpbGVQYXRoOiA/c3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuZ2V0RXhlY3V0aW5nKGxpbnRlciwgZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5leGVjdXRpbmcuYWRkKHsgbGludGVyLCBmaWxlUGF0aCB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuICBkaWRGaW5pc2hMaW50aW5nKGxpbnRlcjogTGludGVyLCBmaWxlUGF0aDogP3N0cmluZykge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5nZXRFeGVjdXRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICBpZiAoZW50cnkpIHtcbiAgICAgIHRoaXMuZXhlY3V0aW5nLmRlbGV0ZShlbnRyeSlcbiAgICAgIHRoaXMudXBkYXRlKClcbiAgICB9XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5wcm92aWRlcikge1xuICAgICAgdGhpcy5wcm92aWRlci5jbGVhcigpXG4gICAgfVxuICAgIHRoaXMuZXhlY3V0aW5nLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==