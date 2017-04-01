var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

var _atom = require('atom');

var _packageJson = require('../package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _uiRegistry = require('./ui-registry');

var _uiRegistry2 = _interopRequireDefault(_uiRegistry);

var _toggleView = require('./toggle-view');

var _toggleView2 = _interopRequireDefault(_toggleView);

var _indieRegistry = require('./indie-registry');

var _indieRegistry2 = _interopRequireDefault(_indieRegistry);

var _linterRegistry = require('./linter-registry');

var _linterRegistry2 = _interopRequireDefault(_linterRegistry);

var _messageRegistry = require('./message-registry');

var _messageRegistry2 = _interopRequireDefault(_messageRegistry);

var _editorRegistry = require('./editor-registry');

var _editorRegistry2 = _interopRequireDefault(_editorRegistry);

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var Linter = (function () {
  function Linter() {
    var _this = this;

    _classCallCheck(this, Linter);

    this.commands = new _commands2['default']();
    this.registryUI = new _uiRegistry2['default']();
    this.registryIndie = new _indieRegistry2['default']();
    this.registryEditors = new _editorRegistry2['default']();
    this.registryLinters = new _linterRegistry2['default']();
    this.registryMessages = new _messageRegistry2['default']();

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.registryUI);
    this.subscriptions.add(this.registryIndie);
    this.subscriptions.add(this.registryMessages);
    this.subscriptions.add(this.registryEditors);
    this.subscriptions.add(this.registryLinters);

    this.commands.onShouldLint(function () {
      var editorLinter = _this.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorLinter) {
        editorLinter.lint();
      }
    });
    this.commands.onShouldToggleActiveEditor(function () {
      var textEditor = atom.workspace.getActiveTextEditor();
      var editor = _this.registryEditors.get(textEditor);
      if (editor) {
        editor.dispose();
      } else if (textEditor) {
        _this.registryEditors.createFromTextEditor(textEditor);
      }
    });
    // NOTE: ESLint arrow-parens rule has a bug
    // eslint-disable-next-line arrow-parens
    this.commands.onShouldDebug(_asyncToGenerator(function* () {
      var linters = _this.registryLinters.getLinters();
      var configFile = yield Helpers.getConfigFile();
      var textEditor = atom.workspace.getActiveTextEditor();
      var textEditorScopes = Helpers.getEditorCursorScopes(textEditor);

      var allLinters = linters.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return '  - ' + linter.name;
      }).join('\n');
      var matchingLinters = linters.filter(function (linter) {
        return Helpers.shouldTriggerLinter(linter, false, textEditorScopes);
      }).sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return '  - ' + linter.name;
      }).join('\n');
      var humanizedScopes = textEditorScopes.map(function (scope) {
        return '  - ' + scope;
      }).join('\n');
      var disabledLinters = (yield configFile.get('disabled')).map(function (linter) {
        return '  - ' + linter;
      }).join('\n');

      atom.notifications.addInfo('Linter Debug Info', {
        detail: ['Platform: ' + process.platform, 'Atom Version: ' + atom.getVersion(), 'Linter Version: ' + _packageJson2['default'].version, 'All Linter Providers: \n' + allLinters, 'Matching Linter Providers: \n' + matchingLinters, 'Disabled Linter Providers; \n' + disabledLinters, 'Current File scopes: \n' + humanizedScopes].join('\n'),
        dismissable: true
      });
    }));
    this.commands.onShouldToggleLinter(function (action) {
      var toggleView = new _toggleView2['default'](action, (0, _lodashUniq2['default'])(_this.registryLinters.getLinters().map(function (linter) {
        return linter.name;
      })));
      toggleView.onDidDispose(function () {
        _this.subscriptions.remove(toggleView);
      });
      toggleView.onDidDisable(function (name) {
        var linter = _this.registryLinters.getLinters().find(function (entry) {
          return entry.name === name;
        });
        if (linter) {
          _this.registryMessages.deleteByLinter(linter);
        }
      });
      toggleView.show();
      _this.subscriptions.add(toggleView);
    });
    this.registryIndie.observe(function (indieLinter) {
      indieLinter.onDidDestroy(function () {
        _this.registryMessages.deleteByLinter(indieLinter);
      });
    });
    this.registryEditors.observe(function (editorLinter) {
      editorLinter.onShouldLint(function (onChange) {
        _this.registryLinters.lint({ onChange: onChange, editor: editorLinter.getEditor() });
      });
      editorLinter.onDidDestroy(function () {
        _this.registryMessages.deleteByBuffer(editorLinter.getEditor().getBuffer());
      });
    });
    this.registryIndie.onDidUpdate(function (_ref) {
      var linter = _ref.linter;
      var messages = _ref.messages;

      _this.registryMessages.set({ linter: linter, messages: messages, buffer: null });
    });
    this.registryLinters.onDidUpdateMessages(function (_ref2) {
      var linter = _ref2.linter;
      var messages = _ref2.messages;
      var buffer = _ref2.buffer;

      _this.registryMessages.set({ linter: linter, messages: messages, buffer: buffer });
    });
    this.registryLinters.onDidBeginLinting(function (_ref3) {
      var linter = _ref3.linter;
      var filePath = _ref3.filePath;

      _this.registryUI.didBeginLinting(linter, filePath);
    });
    this.registryLinters.onDidFinishLinting(function (_ref4) {
      var linter = _ref4.linter;
      var filePath = _ref4.filePath;

      _this.registryUI.didFinishLinting(linter, filePath);
    });
    this.registryMessages.onDidUpdateMessages(function (difference) {
      _this.registryUI.render(difference);
    });

    this.registryEditors.activate();

    setTimeout(function () {
      // NOTE: Atom triggers this on boot so wait a while
      if (!_this.subscriptions.disposed) {
        _this.subscriptions.add(atom.project.onDidChangePaths(function () {
          _this.commands.lint();
        }));
      }
    }, 100);
  }

  _createClass(Linter, [{
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }

    // API methods for providing/consuming services
  }, {
    key: 'addUI',
    value: function addUI(ui) {
      this.registryUI.add(ui);
    }
  }, {
    key: 'deleteUI',
    value: function deleteUI(ui) {
      this.registryUI['delete'](ui);
    }
  }, {
    key: 'addLinter',
    value: function addLinter(linter) {
      var legacy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this.registryLinters.addLinter(linter, legacy);
    }
  }, {
    key: 'deleteLinter',
    value: function deleteLinter(linter) {
      this.registryLinters.deleteLinter(linter);
      this.registryMessages.deleteByLinter(linter);
    }
  }]);

  return Linter;
})();

module.exports = Linter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7MEJBRXdCLGFBQWE7Ozs7b0JBQ0QsTUFBTTs7MkJBRXJCLGlCQUFpQjs7Ozt3QkFDakIsWUFBWTs7OzswQkFDVixlQUFlOzs7OzBCQUNmLGVBQWU7Ozs7NkJBQ1osa0JBQWtCOzs7OzhCQUNqQixtQkFBbUI7Ozs7K0JBQ2xCLG9CQUFvQjs7Ozs4QkFDcEIsbUJBQW1COzs7O3VCQUN0QixXQUFXOztJQUF4QixPQUFPOztJQUdiLE1BQU07QUFTQyxXQVRQLE1BQU0sR0FTSTs7OzBCQVRWLE1BQU07O0FBVVIsUUFBSSxDQUFDLFFBQVEsR0FBRywyQkFBYyxDQUFBO0FBQzlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsNkJBQWdCLENBQUE7QUFDbEMsUUFBSSxDQUFDLGFBQWEsR0FBRyxnQ0FBbUIsQ0FBQTtBQUN4QyxRQUFJLENBQUMsZUFBZSxHQUFHLGlDQUFxQixDQUFBO0FBQzVDLFFBQUksQ0FBQyxlQUFlLEdBQUcsaUNBQW9CLENBQUE7QUFDM0MsUUFBSSxDQUFDLGdCQUFnQixHQUFHLGtDQUFxQixDQUFBOztBQUU3QyxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3ZDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUMxQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUM3QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxD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QUFDLENBQUE7S0FDM0I7OztXQUNRLG1CQUFDLE1BQXNCLEVBQTJCO1VBQXpCLE1BQWUseURBQUcsS0FBSzs7QUFDdkQsVUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0tBQy9DOzs7V0FDVyxzQkFBQyxNQUFzQixFQUFFO0FBQ25DLFVBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3pDLFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDN0M7OztTQWpKRyxNQUFNOzs7QUFvSlosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUEiLCJmaWxlIjoiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgYXJyYXlVbmlxdWUgZnJvbSAnbG9kYXNoLnVuaXEnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4uL3BhY2thZ2UuanNvbidcbmltcG9ydCBDb21tYW5kcyBmcm9tICcuL2NvbW1hbmRzJ1xuaW1wb3J0IFVJUmVnaXN0cnkgZnJvbSAnLi91aS1yZWdpc3RyeSdcbmltcG9ydCBUb2dnbGVWaWV3IGZyb20gJy4vdG9nZ2xlLXZpZXcnXG5pbXBvcnQgSW5kaWVSZWdpc3RyeSBmcm9tICcuL2luZGllLXJlZ2lzdHJ5J1xuaW1wb3J0IExpbnRlclJlZ2lzdHJ5IGZyb20gJy4vbGludGVyLXJlZ2lzdHJ5J1xuaW1wb3J0IE1lc3NhZ2VSZWdpc3RyeSBmcm9tICcuL21lc3NhZ2UtcmVnaXN0cnknXG5pbXBvcnQgRWRpdG9yc1JlZ2lzdHJ5IGZyb20gJy4vZWRpdG9yLXJlZ2lzdHJ5J1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IFVJLCBMaW50ZXIgYXMgTGludGVyUHJvdmlkZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG5jbGFzcyBMaW50ZXIge1xuICBjb21tYW5kczogQ29tbWFuZHM7XG4gIHJlZ2lzdHJ5VUk6IFVJUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5SW5kaWU6IEluZGllUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5RWRpdG9yczogRWRpdG9yc1JlZ2lzdHJ5O1xuICByZWdpc3RyeUxpbnRlcnM6IExpbnRlclJlZ2lzdHJ5O1xuICByZWdpc3RyeU1lc3NhZ2VzOiBNZXNzYWdlUmVnaXN0cnk7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgdGhpcy5yZWdpc3RyeVVJID0gbmV3IFVJUmVnaXN0cnkoKVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZSA9IG5ldyBJbmRpZVJlZ2lzdHJ5KClcbiAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycyA9IG5ldyBFZGl0b3JzUmVnaXN0cnkoKVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzID0gbmV3IExpbnRlclJlZ2lzdHJ5KClcbiAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMgPSBuZXcgTWVzc2FnZVJlZ2lzdHJ5KClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5jb21tYW5kcylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlVSSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlJbmRpZSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlNZXNzYWdlcylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlFZGl0b3JzKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeUxpbnRlcnMpXG5cbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkTGludCgoKSA9PiB7XG4gICAgICBjb25zdCBlZGl0b3JMaW50ZXIgPSB0aGlzLnJlZ2lzdHJ5RWRpdG9ycy5nZXQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgKGVkaXRvckxpbnRlcikge1xuICAgICAgICBlZGl0b3JMaW50ZXIubGludCgpXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmNvbW1hbmRzLm9uU2hvdWxkVG9nZ2xlQWN0aXZlRWRpdG9yKCgpID0+IHtcbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IHRoaXMucmVnaXN0cnlFZGl0b3JzLmdldCh0ZXh0RWRpdG9yKVxuICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICBlZGl0b3IuZGlzcG9zZSgpXG4gICAgICB9IGVsc2UgaWYgKHRleHRFZGl0b3IpIHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMuY3JlYXRlRnJvbVRleHRFZGl0b3IodGV4dEVkaXRvcilcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vIE5PVEU6IEVTTGludCBhcnJvdy1wYXJlbnMgcnVsZSBoYXMgYSBidWdcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYXJyb3ctcGFyZW5zXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZERlYnVnKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbnRlcnMgPSB0aGlzLnJlZ2lzdHJ5TGludGVycy5nZXRMaW50ZXJzKClcbiAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSBhd2FpdCBIZWxwZXJzLmdldENvbmZpZ0ZpbGUoKVxuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgY29uc3QgdGV4dEVkaXRvclNjb3BlcyA9IEhlbHBlcnMuZ2V0RWRpdG9yQ3Vyc29yU2NvcGVzKHRleHRFZGl0b3IpXG5cbiAgICAgIGNvbnN0IGFsbExpbnRlcnMgPSBsaW50ZXJzXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKVxuICAgICAgICAubWFwKGxpbnRlciA9PiBgICAtICR7bGludGVyLm5hbWV9YCkuam9pbignXFxuJylcbiAgICAgIGNvbnN0IG1hdGNoaW5nTGludGVycyA9IGxpbnRlcnNcbiAgICAgICAgLmZpbHRlcihsaW50ZXIgPT4gSGVscGVycy5zaG91bGRUcmlnZ2VyTGludGVyKGxpbnRlciwgZmFsc2UsIHRleHRFZGl0b3JTY29wZXMpKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSlcbiAgICAgICAgLm1hcChsaW50ZXIgPT4gYCAgLSAke2xpbnRlci5uYW1lfWApLmpvaW4oJ1xcbicpXG4gICAgICBjb25zdCBodW1hbml6ZWRTY29wZXMgPSB0ZXh0RWRpdG9yU2NvcGVzXG4gICAgICAgIC5tYXAoc2NvcGUgPT4gYCAgLSAke3Njb3BlfWApLmpvaW4oJ1xcbicpXG4gICAgICBjb25zdCBkaXNhYmxlZExpbnRlcnMgPSAoYXdhaXQgY29uZmlnRmlsZS5nZXQoJ2Rpc2FibGVkJykpXG4gICAgICAgIC5tYXAobGludGVyID0+IGAgIC0gJHtsaW50ZXJ9YCkuam9pbignXFxuJylcblxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0xpbnRlciBEZWJ1ZyBJbmZvJywge1xuICAgICAgICBkZXRhaWw6IFtcbiAgICAgICAgICBgUGxhdGZvcm06ICR7cHJvY2Vzcy5wbGF0Zm9ybX1gLFxuICAgICAgICAgIGBBdG9tIFZlcnNpb246ICR7YXRvbS5nZXRWZXJzaW9uKCl9YCxcbiAgICAgICAgICBgTGludGVyIFZlcnNpb246ICR7bWFuaWZlc3QudmVyc2lvbn1gLFxuICAgICAgICAgIGBBbGwgTGludGVyIFByb3ZpZGVyczogXFxuJHthbGxMaW50ZXJzfWAsXG4gICAgICAgICAgYE1hdGNoaW5nIExpbnRlciBQcm92aWRlcnM6IFxcbiR7bWF0Y2hpbmdMaW50ZXJzfWAsXG4gICAgICAgICAgYERpc2FibGVkIExpbnRlciBQcm92aWRlcnM7IFxcbiR7ZGlzYWJsZWRMaW50ZXJzfWAsXG4gICAgICAgICAgYEN1cnJlbnQgRmlsZSBzY29wZXM6IFxcbiR7aHVtYW5pemVkU2NvcGVzfWAsXG4gICAgICAgIF0uam9pbignXFxuJyksXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGRUb2dnbGVMaW50ZXIoKGFjdGlvbikgPT4ge1xuICAgICAgY29uc3QgdG9nZ2xlVmlldyA9IG5ldyBUb2dnbGVWaWV3KGFjdGlvbiwgYXJyYXlVbmlxdWUodGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0TGludGVycygpLm1hcChsaW50ZXIgPT4gbGludGVyLm5hbWUpKSlcbiAgICAgIHRvZ2dsZVZpZXcub25EaWREaXNwb3NlKCgpID0+IHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZSh0b2dnbGVWaWV3KVxuICAgICAgfSlcbiAgICAgIHRvZ2dsZVZpZXcub25EaWREaXNhYmxlKChuYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IHRoaXMucmVnaXN0cnlMaW50ZXJzLmdldExpbnRlcnMoKS5maW5kKGVudHJ5ID0+IGVudHJ5Lm5hbWUgPT09IG5hbWUpXG4gICAgICAgIGlmIChsaW50ZXIpIHtcbiAgICAgICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlMaW50ZXIobGludGVyKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdG9nZ2xlVmlldy5zaG93KClcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodG9nZ2xlVmlldylcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZS5vYnNlcnZlKChpbmRpZUxpbnRlcikgPT4ge1xuICAgICAgaW5kaWVMaW50ZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzLmRlbGV0ZUJ5TGludGVyKGluZGllTGludGVyKVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzLm9ic2VydmUoKGVkaXRvckxpbnRlcikgPT4ge1xuICAgICAgZWRpdG9yTGludGVyLm9uU2hvdWxkTGludCgob25DaGFuZ2UpID0+IHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMubGludCh7IG9uQ2hhbmdlLCBlZGl0b3I6IGVkaXRvckxpbnRlci5nZXRFZGl0b3IoKSB9KVxuICAgICAgfSlcbiAgICAgIGVkaXRvckxpbnRlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlCdWZmZXIoZWRpdG9yTGludGVyLmdldEVkaXRvcigpLmdldEJ1ZmZlcigpKVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZS5vbkRpZFVwZGF0ZSgoeyBsaW50ZXIsIG1lc3NhZ2VzIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5zZXQoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXI6IG51bGwgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkVXBkYXRlTWVzc2FnZXMoKHsgbGludGVyLCBtZXNzYWdlcywgYnVmZmVyIH0pID0+IHtcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5zZXQoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXIgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkQmVnaW5MaW50aW5nKCh7IGxpbnRlciwgZmlsZVBhdGggfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeVVJLmRpZEJlZ2luTGludGluZyhsaW50ZXIsIGZpbGVQYXRoKVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMub25EaWRGaW5pc2hMaW50aW5nKCh7IGxpbnRlciwgZmlsZVBhdGggfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeVVJLmRpZEZpbmlzaExpbnRpbmcobGludGVyLCBmaWxlUGF0aClcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5vbkRpZFVwZGF0ZU1lc3NhZ2VzKChkaWZmZXJlbmNlKSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUkucmVuZGVyKGRpZmZlcmVuY2UpXG4gICAgfSlcblxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzLmFjdGl2YXRlKClcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgLy8gTk9URTogQXRvbSB0cmlnZ2VycyB0aGlzIG9uIGJvb3Qgc28gd2FpdCBhIHdoaWxlXG4gICAgICBpZiAoIXRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlZCkge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmNvbW1hbmRzLmxpbnQoKVxuICAgICAgICB9KSlcbiAgICAgIH1cbiAgICB9LCAxMDApXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cblxuICAvLyBBUEkgbWV0aG9kcyBmb3IgcHJvdmlkaW5nL2NvbnN1bWluZyBzZXJ2aWNlc1xuICBhZGRVSSh1aTogVUkpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5VUkuYWRkKHVpKVxuICB9XG4gIGRlbGV0ZVVJKHVpOiBVSSkge1xuICAgIHRoaXMucmVnaXN0cnlVSS5kZWxldGUodWkpXG4gIH1cbiAgYWRkTGludGVyKGxpbnRlcjogTGludGVyUHJvdmlkZXIsIGxlZ2FjeTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMuYWRkTGludGVyKGxpbnRlciwgbGVnYWN5KVxuICB9XG4gIGRlbGV0ZUxpbnRlcihsaW50ZXI6IExpbnRlclByb3ZpZGVyKSB7XG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMuZGVsZXRlTGludGVyKGxpbnRlcilcbiAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlMaW50ZXIobGludGVyKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGludGVyXG4iXX0=