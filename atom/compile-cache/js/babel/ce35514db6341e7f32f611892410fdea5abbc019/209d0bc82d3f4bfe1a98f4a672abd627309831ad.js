Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atomClockView = require('./atom-clock-view');

var _atomClockView2 = _interopRequireDefault(_atomClockView);

'use babel';

exports['default'] = {

  config: {
    dateFormat: {
      type: 'string',
      title: 'Time format',
      description: 'Specify the time format. [Here](http://momentjs.com/docs/#/displaying/format/) you can find all the available formats.',
      'default': 'H:mm',
      order: 1
    }, locale: {
      type: 'string',
      title: 'Locale',
      description: 'Specify the time locale. [Here](https://github.com/moment/moment/tree/master/locale) you can find all the available locales.',
      'default': 'en',
      order: 2
    }, refreshInterval: {
      type: 'integer',
      title: 'Clock interval',
      description: 'Specify the refresh interval (in seconds) for the plugin to evaluate the date.',
      'default': 60,
      minimum: 1,
      order: 3
    }, showClockIcon: {
      type: 'boolean',
      title: 'Icon clock',
      description: 'Show clock icon in the status bar?',
      'default': false,
      order: 4
    }
  },

  activate: function activate(state) {},

  deactivate: function deactivate() {
    if (this.atomClockView) this.atomClockView.destroy();
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.atomClockView = new _atomClockView2['default'](statusBar);
    this.atomClockView.start();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9saWIvYXRvbS1jbG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7NkJBRTBCLG1CQUFtQjs7OztBQUY3QyxXQUFXLENBQUM7O3FCQUlHOztBQUViLFFBQU0sRUFBRTtBQUNOLGNBQVUsRUFBRTtBQUNWLFVBQUksRUFBRSxRQUFRO0FBQ2QsV0FBSyxFQUFFLGFBQWE7QUFDcEIsaUJBQVcsRUFBRSx3SEFBd0g7QUFDckksaUJBQVMsTUFBTTtBQUNmLFdBQUssRUFBRSxDQUFDO0tBQ1QsRUFBRSxNQUFNLEVBQUU7QUFDVCxVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxRQUFRO0FBQ2YsaUJBQVcsRUFBRSw4SEFBOEg7QUFDM0ksaUJBQVMsSUFBSTtBQUNiLFdBQUssRUFBRSxDQUFDO0tBQ1QsRUFBRSxlQUFlLEVBQUU7QUFDbEIsVUFBSSxFQUFFLFNBQVM7QUFDZixXQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGlCQUFXLEVBQUUsZ0ZBQWdGO0FBQzdGLGlCQUFTLEVBQUU7QUFDWCxhQUFPLEVBQUUsQ0FBQztBQUNWLFdBQUssRUFBRSxDQUFDO0tBQ1QsRUFBRSxhQUFhLEVBQUU7QUFDaEIsVUFBSSxFQUFFLFNBQVM7QUFDZixXQUFLLEVBQUUsWUFBWTtBQUNuQixpQkFBVyxFQUFFLG9DQUFvQztBQUNqRCxpQkFBUyxLQUFLO0FBQ2QsV0FBSyxFQUFFLENBQUM7S0FDVDtHQUNGOztBQUVELFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUUsRUFBRTs7QUFFbEIsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxJQUFJLENBQUMsYUFBYSxFQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQy9COztBQUVELGtCQUFnQixFQUFBLDBCQUFDLFNBQVMsRUFBRTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUFrQixTQUFTLENBQUMsQ0FBQTtBQUNqRCxRQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFBO0dBQzNCOztDQUVGIiwiZmlsZSI6Ii9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9saWIvYXRvbS1jbG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgQXRvbUNsb2NrVmlldyBmcm9tICcuL2F0b20tY2xvY2stdmlldydcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGNvbmZpZzoge1xuICAgIGRhdGVGb3JtYXQ6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgdGl0bGU6ICdUaW1lIGZvcm1hdCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdGhlIHRpbWUgZm9ybWF0LiBbSGVyZV0oaHR0cDovL21vbWVudGpzLmNvbS9kb2NzLyMvZGlzcGxheWluZy9mb3JtYXQvKSB5b3UgY2FuIGZpbmQgYWxsIHRoZSBhdmFpbGFibGUgZm9ybWF0cy4nLFxuICAgICAgZGVmYXVsdDogJ0g6bW0nLFxuICAgICAgb3JkZXI6IDFcbiAgICB9LCBsb2NhbGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgdGl0bGU6ICdMb2NhbGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHRoZSB0aW1lIGxvY2FsZS4gW0hlcmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L3RyZWUvbWFzdGVyL2xvY2FsZSkgeW91IGNhbiBmaW5kIGFsbCB0aGUgYXZhaWxhYmxlIGxvY2FsZXMuJyxcbiAgICAgIGRlZmF1bHQ6ICdlbicsXG4gICAgICBvcmRlcjogMlxuICAgIH0sIHJlZnJlc2hJbnRlcnZhbDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgdGl0bGU6ICdDbG9jayBpbnRlcnZhbCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdGhlIHJlZnJlc2ggaW50ZXJ2YWwgKGluIHNlY29uZHMpIGZvciB0aGUgcGx1Z2luIHRvIGV2YWx1YXRlIHRoZSBkYXRlLicsXG4gICAgICBkZWZhdWx0OiA2MCxcbiAgICAgIG1pbmltdW06IDEsXG4gICAgICBvcmRlcjogM1xuICAgIH0sIHNob3dDbG9ja0ljb246IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIHRpdGxlOiAnSWNvbiBjbG9jaycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgY2xvY2sgaWNvbiBpbiB0aGUgc3RhdHVzIGJhcj8nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogNFxuICAgIH1cbiAgfSxcblxuICBhY3RpdmF0ZShzdGF0ZSkge30sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy5hdG9tQ2xvY2tWaWV3KVxuICAgICAgdGhpcy5hdG9tQ2xvY2tWaWV3LmRlc3Ryb3koKVxuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5hdG9tQ2xvY2tWaWV3ID0gbmV3IEF0b21DbG9ja1ZpZXcoc3RhdHVzQmFyKVxuICAgIHRoaXMuYXRvbUNsb2NrVmlldy5zdGFydCgpXG4gIH1cblxufVxuIl19
//# sourceURL=/home/alisaleemh/.atom/packages/atom-clock/lib/atom-clock.js
