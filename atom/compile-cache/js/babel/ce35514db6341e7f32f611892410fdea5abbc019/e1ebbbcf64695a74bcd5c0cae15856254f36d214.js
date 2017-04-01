Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _greeter = require('./greeter');

var _greeter2 = _interopRequireDefault(_greeter);

var greeter = undefined;
var instance = undefined;

exports['default'] = {
  activate: function activate() {
    if (!atom.inSpecMode()) {
      // eslint-disable-next-line global-require
      require('atom-package-deps').install('linter', true);
    }
    greeter = new _greeter2['default']();
    instance = new _main2['default']();

    greeter.activate()['catch'](function (e) {
      return console.error('[Linter-UI-Default] Error', e);
    });
  },
  consumeLinter: function consumeLinter(linter) {
    var linters = [].concat(linter);
    for (var entry of linters) {
      instance.addLinter(entry);
    }
    return new _atom.Disposable(function () {
      for (var entry of linters) {
        instance.deleteLinter(entry);
      }
    });
  },
  consumeLinterLegacy: function consumeLinterLegacy(linter) {
    var linters = [].concat(linter);
    for (var entry of linters) {
      linter.name = linter.name || 'Unknown';
      linter.lintOnFly = Boolean(linter.lintOnFly);
      instance.addLinter(entry, true);
    }
    return new _atom.Disposable(function () {
      for (var entry of linters) {
        instance.deleteLinter(entry);
      }
    });
  },
  consumeUI: function consumeUI(ui) {
    var uis = [].concat(ui);
    for (var entry of uis) {
      instance.addUI(entry);
    }
    return new _atom.Disposable(function () {
      for (var entry of uis) {
        instance.deleteUI(entry);
      }
    });
  },
  provideIndie: function provideIndie() {
    return function (indie) {
      return instance.registryIndie.register(indie, 2);
    };
  },
  provideIndieLegacy: function provideIndieLegacy() {
    return {
      register: function register(indie) {
        return instance.registryIndie.register(indie, 1);
      }
    };
  },
  deactivate: function deactivate() {
    instance.dispose();
    greeter.dispose();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRTJCLE1BQU07O29CQUNkLFFBQVE7Ozs7dUJBQ1AsV0FBVzs7OztBQUcvQixJQUFJLE9BQU8sWUFBQSxDQUFBO0FBQ1gsSUFBSSxRQUFRLFlBQUEsQ0FBQTs7cUJBRUc7QUFDYixVQUFRLEVBQUEsb0JBQUc7QUFDVCxRQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFOztBQUV0QixhQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO0tBQ3JEO0FBQ0QsV0FBTyxHQUFHLDBCQUFhLENBQUE7QUFDdkIsWUFBUSxHQUFHLHVCQUFZLENBQUE7O0FBRXZCLFdBQU8sQ0FBQyxRQUFRLEVBQUUsU0FBTSxDQUFDLFVBQUEsQ0FBQzthQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDO0tBQUEsQ0FBQyxDQUFBO0dBQzdFO0FBQ0QsZUFBYSxFQUFBLHVCQUFDLE1BQXNCLEVBQWM7QUFDaEQsUUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQyxTQUFLLElBQU0sS0FBSyxJQUFJLE9BQU8sRUFBRTtBQUMzQixjQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQzFCO0FBQ0QsV0FBTyxxQkFBZSxZQUFNO0FBQzFCLFdBQUssSUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO0FBQzNCLGdCQUFRLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzdCO0tBQ0YsQ0FBQyxDQUFBO0dBQ0g7QUFDRCxxQkFBbUIsRUFBQSw2QkFBQyxNQUFzQixFQUFjO0FBQ3RELFFBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDakMsU0FBSyxJQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7QUFDM0IsWUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQTtBQUN0QyxZQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDNUMsY0FBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDaEM7QUFDRCxXQUFPLHFCQUFlLFlBQU07QUFDMUIsV0FBSyxJQUFNLEtBQUssSUFBSSxPQUFPLEVBQUU7QUFDM0IsZ0JBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDN0I7S0FDRixDQUFDLENBQUE7R0FDSDtBQUNELFdBQVMsRUFBQSxtQkFBQyxFQUFNLEVBQWM7QUFDNUIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUN6QixTQUFLLElBQU0sS0FBSyxJQUFJLEdBQUcsRUFBRTtBQUN2QixjQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ3RCO0FBQ0QsV0FBTyxxQkFBZSxZQUFNO0FBQzFCLFdBQUssSUFBTSxLQUFLLElBQUksR0FBRyxFQUFFO0FBQ3ZCLGdCQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQ3pCO0tBQ0YsQ0FBQyxDQUFBO0dBQ0g7QUFDRCxjQUFZLEVBQUEsd0JBQVc7QUFDckIsV0FBTyxVQUFBLEtBQUs7YUFDVixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQUEsQ0FBQTtHQUM1QztBQUNELG9CQUFrQixFQUFBLDhCQUFXO0FBQzNCLFdBQU87QUFDTCxjQUFRLEVBQUUsa0JBQUEsS0FBSztlQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7T0FBQTtLQUM3RCxDQUFBO0dBQ0Y7QUFDRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxZQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDbEIsV0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQ2xCO0NBQ0YiLCJmaWxlIjoiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgTGludGVyIGZyb20gJy4vbWFpbidcbmltcG9ydCBHcmVldGVyIGZyb20gJy4vZ3JlZXRlcidcbmltcG9ydCB0eXBlIHsgVUksIExpbnRlciBhcyBMaW50ZXJQcm92aWRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmxldCBncmVldGVyXG5sZXQgaW5zdGFuY2VcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIWF0b20uaW5TcGVjTW9kZSgpKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZ2xvYmFsLXJlcXVpcmVcbiAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyJywgdHJ1ZSlcbiAgICB9XG4gICAgZ3JlZXRlciA9IG5ldyBHcmVldGVyKClcbiAgICBpbnN0YW5jZSA9IG5ldyBMaW50ZXIoKVxuXG4gICAgZ3JlZXRlci5hY3RpdmF0ZSgpLmNhdGNoKGUgPT4gY29uc29sZS5lcnJvcignW0xpbnRlci1VSS1EZWZhdWx0XSBFcnJvcicsIGUpKVxuICB9LFxuICBjb25zdW1lTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIpOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBsaW50ZXJzID0gW10uY29uY2F0KGxpbnRlcilcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxpbnRlcnMpIHtcbiAgICAgIGluc3RhbmNlLmFkZExpbnRlcihlbnRyeSlcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGludGVycykge1xuICAgICAgICBpbnN0YW5jZS5kZWxldGVMaW50ZXIoZW50cnkpXG4gICAgICB9XG4gICAgfSlcbiAgfSxcbiAgY29uc3VtZUxpbnRlckxlZ2FjeShsaW50ZXI6IExpbnRlclByb3ZpZGVyKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgbGludGVycyA9IFtdLmNvbmNhdChsaW50ZXIpXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBsaW50ZXJzKSB7XG4gICAgICBsaW50ZXIubmFtZSA9IGxpbnRlci5uYW1lIHx8ICdVbmtub3duJ1xuICAgICAgbGludGVyLmxpbnRPbkZseSA9IEJvb2xlYW4obGludGVyLmxpbnRPbkZseSlcbiAgICAgIGluc3RhbmNlLmFkZExpbnRlcihlbnRyeSwgdHJ1ZSlcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGludGVycykge1xuICAgICAgICBpbnN0YW5jZS5kZWxldGVMaW50ZXIoZW50cnkpXG4gICAgICB9XG4gICAgfSlcbiAgfSxcbiAgY29uc3VtZVVJKHVpOiBVSSk6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IHVpcyA9IFtdLmNvbmNhdCh1aSlcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHVpcykge1xuICAgICAgaW5zdGFuY2UuYWRkVUkoZW50cnkpXG4gICAgfVxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHVpcykge1xuICAgICAgICBpbnN0YW5jZS5kZWxldGVVSShlbnRyeSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuICBwcm92aWRlSW5kaWUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4gaW5kaWUgPT5cbiAgICAgIGluc3RhbmNlLnJlZ2lzdHJ5SW5kaWUucmVnaXN0ZXIoaW5kaWUsIDIpXG4gIH0sXG4gIHByb3ZpZGVJbmRpZUxlZ2FjeSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICByZWdpc3RlcjogaW5kaWUgPT4gaW5zdGFuY2UucmVnaXN0cnlJbmRpZS5yZWdpc3RlcihpbmRpZSwgMSksXG4gICAgfVxuICB9LFxuICBkZWFjdGl2YXRlKCkge1xuICAgIGluc3RhbmNlLmRpc3Bvc2UoKVxuICAgIGdyZWV0ZXIuZGlzcG9zZSgpXG4gIH0sXG59XG4iXX0=