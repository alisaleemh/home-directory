Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var _helpers = require('./helpers');

var Commands = (function () {
  function Commands() {
    var _this = this;

    _classCallCheck(this, Commands);

    this.emitter = new _sbEventKit.Emitter();
    this.messages = [];
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:next': function linterUiDefaultNext() {
        return _this.move(true, true);
      },
      'linter-ui-default:previous': function linterUiDefaultPrevious() {
        return _this.move(false, true);
      },
      'linter-ui-default:next-error': function linterUiDefaultNextError() {
        return _this.move(true, true, 'error');
      },
      'linter-ui-default:previous-error': function linterUiDefaultPreviousError() {
        return _this.move(false, true, 'error');
      },
      'linter-ui-default:next-warning': function linterUiDefaultNextWarning() {
        return _this.move(true, true, 'warning');
      },
      'linter-ui-default:previous-warning': function linterUiDefaultPreviousWarning() {
        return _this.move(false, true, 'warning');
      },
      'linter-ui-default:next-info': function linterUiDefaultNextInfo() {
        return _this.move(true, true, 'info');
      },
      'linter-ui-default:previous-info': function linterUiDefaultPreviousInfo() {
        return _this.move(false, true, 'info');
      },

      'linter-ui-default:next-in-current-file': function linterUiDefaultNextInCurrentFile() {
        return _this.move(true, false);
      },
      'linter-ui-default:previous-in-current-file': function linterUiDefaultPreviousInCurrentFile() {
        return _this.move(false, false);
      },
      'linter-ui-default:next-error-in-current-file': function linterUiDefaultNextErrorInCurrentFile() {
        return _this.move(true, false, 'error');
      },
      'linter-ui-default:previous-error-in-current-file': function linterUiDefaultPreviousErrorInCurrentFile() {
        return _this.move(false, false, 'error');
      },
      'linter-ui-default:next-warning-in-current-file': function linterUiDefaultNextWarningInCurrentFile() {
        return _this.move(true, false, 'warning');
      },
      'linter-ui-default:previous-warning-in-current-file': function linterUiDefaultPreviousWarningInCurrentFile() {
        return _this.move(false, false, 'warning');
      },
      'linter-ui-default:next-info-in-current-file': function linterUiDefaultNextInfoInCurrentFile() {
        return _this.move(true, false, 'info');
      },
      'linter-ui-default:previous-info-in-current-file': function linterUiDefaultPreviousInfoInCurrentFile() {
        return _this.move(false, false, 'info');
      },

      'linter-ui-default:toggle-panel': function linterUiDefaultTogglePanel() {
        return _this.togglePanel();
      },

      // NOTE: Add no-ops here so they are recognized by commands registry
      // Real commands are registered when tooltip is shown inside tooltip's delegate
      'linter-ui-default:expand-tooltip': function linterUiDefaultExpandTooltip() {},
      'linter-ui-default:collapse-tooltip': function linterUiDefaultCollapseTooltip() {}
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'linter-ui-default:apply-all-solutions': function linterUiDefaultApplyAllSolutions() {
        return _this.applyAllSolutions();
      }
    }));
    this.subscriptions.add(atom.commands.add('#linter-panel', {
      'core:copy': function coreCopy() {
        var selection = document.getSelection();
        if (selection) {
          atom.clipboard.write(selection.toString());
        }
      }
    }));
  }

  _createClass(Commands, [{
    key: 'togglePanel',
    value: function togglePanel() {
      atom.config.set('linter-ui-default.showPanel', !atom.config.get('linter-ui-default.showPanel'));
    }

    // NOTE: Apply solutions from bottom to top, so they don't invalidate each other
  }, {
    key: 'applyAllSolutions',
    value: function applyAllSolutions() {
      var textEditor = atom.workspace.getActiveTextEditor();
      var messages = (0, _helpers.sortMessages)([{ column: 'line', type: 'desc' }], (0, _helpers.filterMessages)(this.messages, textEditor.getPath()));
      messages.forEach(function (message) {
        if (message.version === 1 && message.fix) {
          (0, _helpers.applySolution)(textEditor, 1, message.fix);
        } else if (message.version === 2 && message.solutions && message.solutions.length) {
          (0, _helpers.applySolution)(textEditor, 2, (0, _helpers.sortSolutions)(message.solutions)[0]);
        }
      });
    }
  }, {
    key: 'move',
    value: function move(forward, globally) {
      var severity = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var currentEditor = atom.workspace.getActiveTextEditor();
      var currentFile = currentEditor && currentEditor.getPath() || NaN;
      // NOTE: ^ Setting default to NaN so it won't match empty file paths in messages
      var messages = (0, _helpers.sortMessages)([{ column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }], (0, _helpers.filterMessages)(this.messages, globally ? null : currentFile, severity));
      var expectedValue = forward ? -1 : 1;

      if (!currentEditor) {
        var message = forward ? messages[0] : messages[messages.length - 1];
        if (message) {
          (0, _helpers.visitMessage)(message);
        }
        return;
      }
      var currentPosition = currentEditor.getCursorBufferPosition();

      // NOTE: Iterate bottom to top to find the previous message
      // Because if we search top to bottom when sorted, first item will always
      // be the smallest
      if (!forward) {
        messages.reverse();
      }

      var found = undefined;
      var currentFileEncountered = false;
      for (var i = 0, _length = messages.length; i < _length; i++) {
        var message = messages[i];
        var messageFile = (0, _helpers.$file)(message);
        var messageRange = (0, _helpers.$range)(message);

        if (!currentFileEncountered && messageFile === currentFile) {
          currentFileEncountered = true;
        }
        if (messageFile && messageRange) {
          if (currentFileEncountered && messageFile !== currentFile) {
            found = message;
            break;
          } else if (messageFile === currentFile && currentPosition.compare(messageRange.start) === expectedValue) {
            found = message;
            break;
          }
        }
      }

      if (!found && messages.length) {
        // Reset back to first or last depending on direction
        found = messages[0];
      }

      if (found) {
        (0, _helpers.visitMessage)(found);
      }
    }
  }, {
    key: 'update',
    value: function update(messages) {
      this.messages = messages;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return Commands;
})();

exports['default'] = Commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2NvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzBCQUU2QyxjQUFjOzt1QkFFNkMsV0FBVzs7SUFHOUYsUUFBUTtBQUtoQixXQUxRLFFBQVEsR0FLYjs7OzBCQUxLLFFBQVE7O0FBTXpCLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsOEJBQXdCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO09BQUE7QUFDckQsa0NBQTRCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO09BQUE7QUFDMUQsb0NBQThCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztPQUFBO0FBQ3BFLHdDQUFrQyxFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7T0FBQTtBQUN6RSxzQ0FBZ0MsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO09BQUE7QUFDeEUsMENBQW9DLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQztPQUFBO0FBQzdFLG1DQUE2QixFQUFFO2VBQU0sTUFBSyxJQUFJLENB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O0tBQzdCOzs7U0ExSGtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2NvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcblxuaW1wb3J0IHsgJGZpbGUsICRyYW5nZSwgdmlzaXRNZXNzYWdlLCBzb3J0TWVzc2FnZXMsIHNvcnRTb2x1dGlvbnMsIGZpbHRlck1lc3NhZ2VzLCBhcHBseVNvbHV0aW9uIH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZHMge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgdHJ1ZSksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIHRydWUpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtZXJyb3InOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgdHJ1ZSwgJ2Vycm9yJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtZXJyb3InOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIHRydWUsICdlcnJvcicpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtd2FybmluZyc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCB0cnVlLCAnd2FybmluZycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLXdhcm5pbmcnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIHRydWUsICd3YXJuaW5nJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC1pbmZvJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUsICdpbmZvJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtaW5mbyc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgdHJ1ZSwgJ2luZm8nKSxcblxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIGZhbHNlKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIGZhbHNlKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWVycm9yLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCBmYWxzZSwgJ2Vycm9yJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtZXJyb3ItaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCBmYWxzZSwgJ2Vycm9yJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC13YXJuaW5nLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCBmYWxzZSwgJ3dhcm5pbmcnKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy13YXJuaW5nLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgZmFsc2UsICd3YXJuaW5nJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC1pbmZvLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCBmYWxzZSwgJ2luZm8nKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1pbmZvLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgZmFsc2UsICdpbmZvJyksXG5cbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDp0b2dnbGUtcGFuZWwnOiAoKSA9PiB0aGlzLnRvZ2dsZVBhbmVsKCksXG5cbiAgICAgIC8vIE5PVEU6IEFkZCBuby1vcHMgaGVyZSBzbyB0aGV5IGFyZSByZWNvZ25pemVkIGJ5IGNvbW1hbmRzIHJlZ2lzdHJ5XG4gICAgICAvLyBSZWFsIGNvbW1hbmRzIGFyZSByZWdpc3RlcmVkIHdoZW4gdG9vbHRpcCBpcyBzaG93biBpbnNpZGUgdG9vbHRpcCdzIGRlbGVnYXRlXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6ZXhwYW5kLXRvb2x0aXAnOiBmdW5jdGlvbigpIHsgfSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpjb2xsYXBzZS10b29sdGlwJzogZnVuY3Rpb24oKSB7IH0sXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsIHtcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDphcHBseS1hbGwtc29sdXRpb25zJzogKCkgPT4gdGhpcy5hcHBseUFsbFNvbHV0aW9ucygpLFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJyNsaW50ZXItcGFuZWwnLCB7XG4gICAgICAnY29yZTpjb3B5JzogKCkgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKVxuICAgICAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoc2VsZWN0aW9uLnRvU3RyaW5nKCkpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSkpXG4gIH1cbiAgdG9nZ2xlUGFuZWwoKTogdm9pZCB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItdWktZGVmYXVsdC5zaG93UGFuZWwnLCAhYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItdWktZGVmYXVsdC5zaG93UGFuZWwnKSlcbiAgfVxuICAvLyBOT1RFOiBBcHBseSBzb2x1dGlvbnMgZnJvbSBib3R0b20gdG8gdG9wLCBzbyB0aGV5IGRvbid0IGludmFsaWRhdGUgZWFjaCBvdGhlclxuICBhcHBseUFsbFNvbHV0aW9ucygpOiB2b2lkIHtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3QgbWVzc2FnZXMgPSBzb3J0TWVzc2FnZXMoW3sgY29sdW1uOiAnbGluZScsIHR5cGU6ICdkZXNjJyB9XSwgZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgdGV4dEVkaXRvci5nZXRQYXRoKCkpKVxuICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMSAmJiBtZXNzYWdlLmZpeCkge1xuICAgICAgICBhcHBseVNvbHV0aW9uKHRleHRFZGl0b3IsIDEsIG1lc3NhZ2UuZml4KVxuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS5zb2x1dGlvbnMgJiYgbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGFwcGx5U29sdXRpb24odGV4dEVkaXRvciwgMiwgc29ydFNvbHV0aW9ucyhtZXNzYWdlLnNvbHV0aW9ucylbMF0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBtb3ZlKGZvcndhcmQ6IGJvb2xlYW4sIGdsb2JhbGx5OiBib29sZWFuLCBzZXZlcml0eTogP3N0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3QgY3VycmVudEZpbGU6IGFueSA9IChjdXJyZW50RWRpdG9yICYmIGN1cnJlbnRFZGl0b3IuZ2V0UGF0aCgpKSB8fCBOYU5cbiAgICAvLyBOT1RFOiBeIFNldHRpbmcgZGVmYXVsdCB0byBOYU4gc28gaXQgd29uJ3QgbWF0Y2ggZW1wdHkgZmlsZSBwYXRocyBpbiBtZXNzYWdlc1xuICAgIGNvbnN0IG1lc3NhZ2VzID0gc29ydE1lc3NhZ2VzKFt7IGNvbHVtbjogJ2ZpbGUnLCB0eXBlOiAnYXNjJyB9LCB7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnYXNjJyB9XSwgZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgZ2xvYmFsbHkgPyBudWxsIDogY3VycmVudEZpbGUsIHNldmVyaXR5KSlcbiAgICBjb25zdCBleHBlY3RlZFZhbHVlID0gZm9yd2FyZCA/IC0xIDogMVxuXG4gICAgaWYgKCFjdXJyZW50RWRpdG9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZm9yd2FyZCA/IG1lc3NhZ2VzWzBdIDogbWVzc2FnZXNbbWVzc2FnZXMubGVuZ3RoIC0gMV1cbiAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgIHZpc2l0TWVzc2FnZShtZXNzYWdlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IGN1cnJlbnRFZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgLy8gTk9URTogSXRlcmF0ZSBib3R0b20gdG8gdG9wIHRvIGZpbmQgdGhlIHByZXZpb3VzIG1lc3NhZ2VcbiAgICAvLyBCZWNhdXNlIGlmIHdlIHNlYXJjaCB0b3AgdG8gYm90dG9tIHdoZW4gc29ydGVkLCBmaXJzdCBpdGVtIHdpbGwgYWx3YXlzXG4gICAgLy8gYmUgdGhlIHNtYWxsZXN0XG4gICAgaWYgKCFmb3J3YXJkKSB7XG4gICAgICBtZXNzYWdlcy5yZXZlcnNlKClcbiAgICB9XG5cbiAgICBsZXQgZm91bmRcbiAgICBsZXQgY3VycmVudEZpbGVFbmNvdW50ZXJlZCA9IGZhbHNlXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IG1lc3NhZ2VzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXNbaV1cbiAgICAgIGNvbnN0IG1lc3NhZ2VGaWxlID0gJGZpbGUobWVzc2FnZSlcbiAgICAgIGNvbnN0IG1lc3NhZ2VSYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuXG4gICAgICBpZiAoIWN1cnJlbnRGaWxlRW5jb3VudGVyZWQgJiYgbWVzc2FnZUZpbGUgPT09IGN1cnJlbnRGaWxlKSB7XG4gICAgICAgIGN1cnJlbnRGaWxlRW5jb3VudGVyZWQgPSB0cnVlXG4gICAgICB9XG4gICAgICBpZiAobWVzc2FnZUZpbGUgJiYgbWVzc2FnZVJhbmdlKSB7XG4gICAgICAgIGlmIChjdXJyZW50RmlsZUVuY291bnRlcmVkICYmIG1lc3NhZ2VGaWxlICE9PSBjdXJyZW50RmlsZSkge1xuICAgICAgICAgIGZvdW5kID0gbWVzc2FnZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZUZpbGUgPT09IGN1cnJlbnRGaWxlICYmIGN1cnJlbnRQb3NpdGlvbi5jb21wYXJlKG1lc3NhZ2VSYW5nZS5zdGFydCkgPT09IGV4cGVjdGVkVmFsdWUpIHtcbiAgICAgICAgICBmb3VuZCA9IG1lc3NhZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmb3VuZCAmJiBtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIC8vIFJlc2V0IGJhY2sgdG8gZmlyc3Qgb3IgbGFzdCBkZXBlbmRpbmcgb24gZGlyZWN0aW9uXG4gICAgICBmb3VuZCA9IG1lc3NhZ2VzWzBdXG4gICAgfVxuXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICB2aXNpdE1lc3NhZ2UoZm91bmQpXG4gICAgfVxuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pIHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgfVxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19