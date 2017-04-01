Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpers = require('../helpers');

// Greets

var _greetV2Welcome = require('./greet-v2-welcome');

var _greetV2Welcome2 = _interopRequireDefault(_greetV2Welcome);

// Note: This package should not be used from "Main" class,
// Instead it should be used from the main package entry point directly

var Greeter = (function () {
  function Greeter() {
    _classCallCheck(this, Greeter);

    this.notifications = new Set();
  }

  _createClass(Greeter, [{
    key: 'activate',
    value: _asyncToGenerator(function* () {
      var updated = false;
      var configFile = yield (0, _helpers.getConfigFile)();
      var shown = yield configFile.get('greeter.shown');

      if (!shown.includes('V2_WELCOME_MESSAGE')) {
        updated = true;
        shown.push('V2_WELCOME_MESSAGE');
        (0, _greetV2Welcome2['default'])();
      }

      if (updated) {
        yield configFile.set('greeter.shown', shown);
      }
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this.notifications.forEach(function (n) {
        return n.dismiss();
      });
      this.notifications.clear();
    }
  }]);

  return Greeter;
})();

exports['default'] = Greeter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9ncmVldGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozt1QkFFOEIsWUFBWTs7Ozs4QkFHZixvQkFBb0I7Ozs7Ozs7SUFLMUIsT0FBTztBQUVmLFdBRlEsT0FBTyxHQUVaOzBCQUZLLE9BQU87O0FBR3hCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtHQUMvQjs7ZUFKa0IsT0FBTzs7NkJBS1osYUFBRztBQUNmLFVBQUksT0FBTyxHQUFHLEtBQUssQ0FBQTtBQUNuQixVQUFNLFVBQVUsR0FBRyxNQUFNLDZCQUFlLENBQUE7QUFDeEMsVUFBTSxLQUFLLEdBQUcsTUFBTSxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFBOztBQUVuRCxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO0FBQ3pDLGVBQU8sR0FBRyxJQUFJLENBQUE7QUFDZCxhQUFLLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDaEMsMENBQWdCLENBQUE7T0FDakI7O0FBRUQsVUFBSSxPQUFPLEVBQUU7QUFDWCxjQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFBO09BQzdDO0tBQ0Y7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQTtBQUM1QyxVQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFBO0tBQzNCOzs7U0F2QmtCLE9BQU87OztxQkFBUCxPQUFPIiwiZmlsZSI6Ii9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9ncmVldGVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgZ2V0Q29uZmlnRmlsZSB9IGZyb20gJy4uL2hlbHBlcnMnXG5cbi8vIEdyZWV0c1xuaW1wb3J0IGdyZWV0VjJXZWxjb21lIGZyb20gJy4vZ3JlZXQtdjItd2VsY29tZSdcblxuXG4vLyBOb3RlOiBUaGlzIHBhY2thZ2Ugc2hvdWxkIG5vdCBiZSB1c2VkIGZyb20gXCJNYWluXCIgY2xhc3MsXG4vLyBJbnN0ZWFkIGl0IHNob3VsZCBiZSB1c2VkIGZyb20gdGhlIG1haW4gcGFja2FnZSBlbnRyeSBwb2ludCBkaXJlY3RseVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JlZXRlciB7XG4gIG5vdGlmaWNhdGlvbnM6IFNldDxPYmplY3Q+O1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm5vdGlmaWNhdGlvbnMgPSBuZXcgU2V0KClcbiAgfVxuICBhc3luYyBhY3RpdmF0ZSgpIHtcbiAgICBsZXQgdXBkYXRlZCA9IGZhbHNlXG4gICAgY29uc3QgY29uZmlnRmlsZSA9IGF3YWl0IGdldENvbmZpZ0ZpbGUoKVxuICAgIGNvbnN0IHNob3duID0gYXdhaXQgY29uZmlnRmlsZS5nZXQoJ2dyZWV0ZXIuc2hvd24nKVxuXG4gICAgaWYgKCFzaG93bi5pbmNsdWRlcygnVjJfV0VMQ09NRV9NRVNTQUdFJykpIHtcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICBzaG93bi5wdXNoKCdWMl9XRUxDT01FX01FU1NBR0UnKVxuICAgICAgZ3JlZXRWMldlbGNvbWUoKVxuICAgIH1cblxuICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICBhd2FpdCBjb25maWdGaWxlLnNldCgnZ3JlZXRlci5zaG93bicsIHNob3duKVxuICAgIH1cbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMubm90aWZpY2F0aW9ucy5mb3JFYWNoKG4gPT4gbi5kaXNtaXNzKCkpXG4gICAgdGhpcy5ub3RpZmljYXRpb25zLmNsZWFyKClcbiAgfVxufVxuIl19