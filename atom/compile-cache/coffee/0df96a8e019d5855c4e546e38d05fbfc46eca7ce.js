(function() {
  var log;

  log = require('./log');

  module.exports = {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 2,
    suggestionPriority: atom.config.get('autocomplete-python.suggestionPriority'),
    excludeLowerPriority: false,
    cacheSize: 10,
    _addEventListener: function(editor, eventName, handler) {
      var disposable, editorView;
      editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      disposable = new this.Disposable(function() {
        log.debug('Unsubscribing from event listener ', eventName, handler);
        return editorView.removeEventListener(eventName, handler);
      });
      return disposable;
    },
    _noExecutableError: function(error) {
      if (this.providerNoExecutable) {
        return;
      }
      log.warning('No python executable found', error);
      atom.notifications.addWarning('autocomplete-python unable to find python binary.', {
        detail: "Please set path to python executable manually in package\nsettings and restart your editor. Be sure to migrate on new settings\nif everything worked on previous version.\nDetailed error message: " + error + "\n\nCurrent config: " + (atom.config.get('autocomplete-python.pythonPaths')),
        dismissable: true
      });
      return this.providerNoExecutable = true;
    },
    _spawnDaemon: function() {
      var interpreter, ref;
      interpreter = this.InterpreterLookup.getInterpreter();
      log.debug('Using interpreter', interpreter);
      this.provider = new this.BufferedProcess({
        command: interpreter || 'python',
        args: [__dirname + '/completion.py'],
        stdout: (function(_this) {
          return function(data) {
            return _this._deserialize(data);
          };
        })(this),
        stderr: (function(_this) {
          return function(data) {
            var ref, requestId, resolve, results1;
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
            log.debug("Forcing to resolve " + (Object.keys(_this.requests).length) + " promises");
            ref = _this.requests;
            results1 = [];
            for (requestId in ref) {
              resolve = ref[requestId];
              if (typeof resolve === 'function') {
                resolve([]);
              }
              results1.push(delete _this.requests[requestId]);
            }
            return results1;
          };
        })(this),
        exit: (function(_this) {
          return function(code) {
            return log.warning('Process exit with', code, _this.provider);
          };
        })(this)
      });
      this.provider.onWillThrowError((function(_this) {
        return function(arg) {
          var error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            _this._noExecutableError(error);
            _this.dispose();
            return handle();
          } else {
            throw error;
          }
        };
      })(this));
      if ((ref = this.provider.process) != null) {
        ref.stdin.on('error', function(err) {
          return log.debug('stdin', err);
        });
      }
      return setTimeout((function(_this) {
        return function() {
          log.debug('Killing python process after timeout...');
          if (_this.provider && _this.provider.process) {
            return _this.provider.kill();
          }
        };
      })(this), 60 * 10 * 1000);
    },
    load: function() {
      if (!this.constructed) {
        this.constructor();
      }
      return this;
    },
    constructor: function() {
      var err, ref, selector;
      ref = require('atom'), this.Disposable = ref.Disposable, this.CompositeDisposable = ref.CompositeDisposable, this.BufferedProcess = ref.BufferedProcess;
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.DefinitionsView = require('./definitions-view');
      this.UsagesView = require('./usages-view');
      this.OverrideView = require('./override-view');
      this.RenameView = require('./rename-view');
      this.InterpreterLookup = require('./interpreters-lookup');
      this._ = require('underscore');
      this.filter = require('fuzzaldrin-plus').filter;
      this.requests = {};
      this.responses = {};
      this.provider = null;
      this.disposables = new this.CompositeDisposable;
      this.subscriptions = {};
      this.definitionsView = null;
      this.usagesView = null;
      this.renameView = null;
      this.constructed = true;
      this.snippetsManager = null;
      log.debug("Init autocomplete-python with priority " + this.suggestionPriority);
      try {
        this.triggerCompletionRegex = RegExp(atom.config.get('autocomplete-python.triggerCompletionRegex'));
      } catch (error1) {
        err = error1;
        atom.notifications.addWarning('autocomplete-python invalid regexp to trigger autocompletions.\nFalling back to default value.', {
          detail: "Original exception: " + err,
          dismissable: true
        });
        atom.config.set('autocomplete-python.triggerCompletionRegex', '([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)');
        this.triggerCompletionRegex = /([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      }
      selector = 'atom-text-editor[data-grammar~=python]';
      atom.commands.add(selector, 'autocomplete-python:go-to-definition', (function(_this) {
        return function() {
          return _this.goToDefinition();
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:complete-arguments', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this._completeArguments(editor, editor.getCursorBufferPosition(), true);
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:show-usages', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.usagesView) {
            _this.usagesView.destroy();
          }
          _this.usagesView = new _this.UsagesView();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            return _this.usagesView.setItems(usages);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:override-method', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.overrideView) {
            _this.overrideView.destroy();
          }
          _this.overrideView = new _this.OverrideView();
          return _this.getMethods(editor, bufferPosition).then(function(arg) {
            var bufferPosition, indent, methods;
            methods = arg.methods, indent = arg.indent, bufferPosition = arg.bufferPosition;
            _this.overrideView.indent = indent;
            _this.overrideView.bufferPosition = bufferPosition;
            return _this.overrideView.setItems(methods);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:rename', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            if (_this.renameView) {
              _this.renameView.destroy();
            }
            if (usages.length > 0) {
              _this.renameView = new _this.RenameView(usages);
              return _this.renameView.onInput(function(newName) {
                var _relative, fileName, project, ref1, ref2, results1;
                ref1 = _this._.groupBy(usages, 'fileName');
                results1 = [];
                for (fileName in ref1) {
                  usages = ref1[fileName];
                  ref2 = atom.project.relativizePath(fileName), project = ref2[0], _relative = ref2[1];
                  if (project) {
                    results1.push(_this._updateUsagesInFile(fileName, usages, newName));
                  } else {
                    results1.push(log.debug('Ignoring file outside of project', fileName));
                  }
                }
                return results1;
              });
            } else {
              if (_this.usagesView) {
                _this.usagesView.destroy();
              }
              _this.usagesView = new _this.UsagesView();
              return _this.usagesView.setItems(usages);
            }
          });
        };
      })(this));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
          });
        };
      })(this));
      return atom.config.onDidChange('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function() {
          return atom.workspace.observeTextEditors(function(editor) {
            return _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          });
        };
      })(this));
    },
    _updateUsagesInFile: function(fileName, usages, newName) {
      var columnOffset;
      columnOffset = {};
      return atom.workspace.open(fileName, {
        activateItem: false
      }).then(function(editor) {
        var buffer, column, i, len, line, name, usage;
        buffer = editor.getBuffer();
        for (i = 0, len = usages.length; i < len; i++) {
          usage = usages[i];
          name = usage.name, line = usage.line, column = usage.column;
          if (columnOffset[line] == null) {
            columnOffset[line] = 0;
          }
          log.debug('Replacing', usage, 'with', newName, 'in', editor.id);
          log.debug('Offset for line', line, 'is', columnOffset[line]);
          buffer.setTextInRange([[line - 1, column + columnOffset[line]], [line - 1, column + name.length + columnOffset[line]]], newName);
          columnOffset[line] += newName.length - name.length;
        }
        return buffer.save();
      });
    },
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, i, len, marker, ref, scopeChain, scopeDescriptor, wordBufferRange;
      if (this.markers) {
        ref = this.markers;
        for (i = 0, len = ref.length; i < len; i++) {
          marker = ref[i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = this.Selector.create(disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        persistent: false,
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, ref1, text, type, view;
          if (results.length > 0) {
            ref1 = results[0], text = ref1.text, fileName = ref1.fileName, line = ref1.line, column = ref1.column, type = ref1.type, description = ref1.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            return log.debug('decorated marker', marker);
          }
        };
      })(this));
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = editor.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event);
            };
          })(this));
        }
        if (!atom.config.get('autocomplete-plus.enableAutoActivation')) {
          log.debug('Ignoring keyup events due to autocomplete-plus settings.');
          return;
        }
        disposable = this._addEventListener(editor, eventName, (function(_this) {
          return function(e) {
            if (atom.keymaps.keystrokeForKeyboardEvent(e) === '^(') {
              log.debug('Trying to complete arguments on keyup event', e);
              return _this._completeArguments(editor, editor.getCursorBufferPosition());
            }
          };
        })(this));
        this.disposables.add(disposable);
        this.subscriptions[eventId] = disposable;
        return log.debug('Subscribed on event', eventId);
      } else {
        if (eventId in this.subscriptions) {
          this.subscriptions[eventId].dispose();
          return log.debug('Unsubscribed from event', eventId);
        }
      }
    },
    _serialize: function(request) {
      log.debug('Serializing request to be sent to Jedi', request);
      return JSON.stringify(request);
    },
    _sendRequest: function(data, respawned) {
      var process;
      log.debug('Pending requests:', Object.keys(this.requests).length, this.requests);
      if (Object.keys(this.requests).length > 10) {
        log.debug('Cleaning up request queue to avoid overflow, ignoring request');
        this.requests = {};
        if (this.provider && this.provider.process) {
          log.debug('Killing python process');
          this.provider.kill();
          return;
        }
      }
      if (this.provider && this.provider.process) {
        process = this.provider.process;
        if (process.exitCode === null && process.signalCode === null) {
          if (this.provider.process.pid) {
            return this.provider.process.stdin.write(data + '\n');
          } else {
            return log.debug('Attempt to communicate with terminated process', this.provider);
          }
        } else if (respawned) {
          atom.notifications.addWarning(["Failed to spawn daemon for autocomplete-python.", "Completions will not work anymore", "unless you restart your editor."].join(' '), {
            detail: ["exitCode: " + process.exitCode, "signalCode: " + process.signalCode].join('\n'),
            dismissable: true
          });
          return this.dispose();
        } else {
          this._spawnDaemon();
          this._sendRequest(data, {
            respawned: true
          });
          return log.debug('Re-spawning python process...');
        }
      } else {
        log.debug('Spawning python process...');
        this._spawnDaemon();
        return this._sendRequest(data);
      }
    },
    _deserialize: function(response) {
      var bufferPosition, cacheSizeDelta, e, editor, i, id, ids, j, len, len1, ref, ref1, ref2, resolve, responseSource, results1;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      ref = response.trim().split('\n');
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        responseSource = ref[i];
        try {
          response = JSON.parse(responseSource);
        } catch (error1) {
          e = error1;
          throw new Error("Failed to parse JSON from \"" + responseSource + "\".\nOriginal exception: " + e);
        }
        if (response['arguments']) {
          editor = this.requests[response['id']];
          if (typeof editor === 'object') {
            bufferPosition = editor.getCursorBufferPosition();
            if (response['id'] === this._generateRequestId('arguments', editor, bufferPosition)) {
              if ((ref1 = this.snippetsManager) != null) {
                ref1.insertSnippet(response['arguments'], editor);
              }
            }
          }
        } else {
          resolve = this.requests[response['id']];
          if (typeof resolve === 'function') {
            resolve(response['results']);
          }
        }
        cacheSizeDelta = Object.keys(this.responses).length > this.cacheSize;
        if (cacheSizeDelta > 0) {
          ids = Object.keys(this.responses).sort((function(_this) {
            return function(a, b) {
              return _this.responses[a]['timestamp'] - _this.responses[b]['timestamp'];
            };
          })(this));
          ref2 = ids.slice(0, cacheSizeDelta);
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            id = ref2[j];
            log.debug('Removing old item from cache with ID', id);
            delete this.responses[id];
          }
        }
        this.responses[response['id']] = {
          source: responseSource,
          timestamp: Date.now()
        };
        log.debug('Cached request with ID', response['id']);
        results1.push(delete this.requests[response['id']]);
      }
      return results1;
    },
    _generateRequestId: function(type, editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column, type].join()).digest('hex');
    },
    _generateRequestConfig: function() {
      var args, extraPaths;
      extraPaths = this.InterpreterLookup.applySubstitutions(atom.config.get('autocomplete-python.extraPaths').split(';'));
      args = {
        'extraPaths': extraPaths,
        'useSnippets': atom.config.get('autocomplete-python.useSnippets'),
        'caseInsensitiveCompletion': atom.config.get('autocomplete-python.caseInsensitiveCompletion'),
        'showDescriptions': atom.config.get('autocomplete-python.showDescriptions'),
        'fuzzyMatcher': atom.config.get('autocomplete-python.fuzzyMatcher')
      };
      return args;
    },
    setSnippetsManager: function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    },
    _completeArguments: function(editor, bufferPosition, force) {
      var disableForSelector, line, lines, payload, prefix, scopeChain, scopeDescriptor, suffix, useSnippets;
      useSnippets = atom.config.get('autocomplete-python.useSnippets');
      if (!force && useSnippets === 'none') {
        atom.commands.dispatch(document.querySelector('atom-text-editor'), 'autocomplete-plus:activate');
        return;
      }
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.Selector.create(this.disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('Ignoring argument completion inside of', scopeChain);
        return;
      }
      lines = editor.getBuffer().getLines();
      line = lines[bufferPosition.row];
      prefix = line.slice(bufferPosition.column - 1, bufferPosition.column);
      if (prefix !== '(') {
        log.debug('Ignoring argument completion with prefix', prefix);
        return;
      }
      suffix = line.slice(bufferPosition.column, line.length);
      if (!/^(\)(?:$|\s)|\s|$)/.test(suffix)) {
        log.debug('Ignoring argument completion with suffix', suffix);
        return;
      }
      payload = {
        id: this._generateRequestId('arguments', editor, bufferPosition),
        lookup: 'arguments',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function() {
          return _this.requests[payload.id] = editor;
        };
      })(this));
    },
    _fuzzyFilter: function(candidates, query) {
      if (candidates.length !== 0 && (query !== ' ' && query !== '.' && query !== '(')) {
        candidates = this.filter(candidates, query, {
          key: 'text'
        });
      }
      return candidates;
    },
    getSuggestions: function(arg) {
      var bufferPosition, editor, lastIdentifier, line, lines, matches, payload, prefix, requestId, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.load();
      if (!this.triggerCompletionRegex.test(prefix)) {
        return this.lastSuggestions = [];
      }
      bufferPosition = {
        row: bufferPosition.row,
        column: bufferPosition.column
      };
      lines = editor.getBuffer().getLines();
      if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
        line = lines[bufferPosition.row];
        lastIdentifier = /\.?[a-zA-Z_][a-zA-Z0-9_]*$/.exec(line.slice(0, bufferPosition.column));
        if (lastIdentifier) {
          bufferPosition.column = lastIdentifier.index + 1;
          lines[bufferPosition.row] = line.slice(0, bufferPosition.column);
        }
      }
      requestId = this._generateRequestId('completions', editor, bufferPosition, lines.join('\n'));
      if (requestId in this.responses) {
        log.debug('Using cached response with ID', requestId);
        matches = JSON.parse(this.responses[requestId]['source'])['results'];
        if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
          return this.lastSuggestions = this._fuzzyFilter(matches, prefix);
        } else {
          return this.lastSuggestions = matches;
        }
      }
      payload = {
        id: requestId,
        prefix: prefix,
        lookup: 'completions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
            return _this.requests[payload.id] = function(matches) {
              return resolve(_this.lastSuggestions = _this._fuzzyFilter(matches, prefix));
            };
          } else {
            return _this.requests[payload.id] = function(suggestions) {
              return resolve(_this.lastSuggestions = suggestions);
            };
          }
        };
      })(this));
    },
    getDefinitions: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('definitions', editor, bufferPosition),
        lookup: 'definitions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getUsages: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('usages', editor, bufferPosition),
        lookup: 'usages',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getMethods: function(editor, bufferPosition) {
      var indent, lines, payload;
      indent = bufferPosition.column;
      lines = editor.getBuffer().getLines();
      lines.splice(bufferPosition.row + 1, 0, "  def __autocomplete_python(s):");
      lines.splice(bufferPosition.row + 2, 0, "    s.");
      payload = {
        id: this._generateRequestId('methods', editor, bufferPosition),
        lookup: 'methods',
        path: editor.getPath(),
        source: lines.join('\n'),
        line: bufferPosition.row + 2,
        column: 6,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = function(methods) {
            return resolve({
              methods: methods,
              indent: indent,
              bufferPosition: bufferPosition
            });
          };
        };
      })(this));
    },
    goToDefinition: function(editor, bufferPosition) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!bufferPosition) {
        bufferPosition = editor.getCursorBufferPosition();
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new this.DefinitionsView();
      return this.getDefinitions(editor, bufferPosition).then((function(_this) {
        return function(results) {
          _this.definitionsView.setItems(results);
          if (results.length === 1) {
            return _this.definitionsView.confirmed(results[0]);
          }
        };
      })(this));
    },
    dispose: function() {
      if (this.disposables) {
        this.disposables.dispose();
      }
      if (this.provider) {
        return this.provider.kill();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLGdCQUFWO0lBQ0Esa0JBQUEsRUFBb0IsaURBRHBCO0lBRUEsaUJBQUEsRUFBbUIsQ0FGbkI7SUFHQSxrQkFBQSxFQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBSHBCO0lBSUEsb0JBQUEsRUFBc0IsS0FKdEI7SUFLQSxTQUFBLEVBQVcsRUFMWDtJQU9BLGlCQUFBLEVBQW1CLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsT0FBcEI7QUFDakIsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkI7TUFDYixVQUFVLENBQUMsZ0JBQVgsQ0FBNEIsU0FBNUIsRUFBdUMsT0FBdkM7TUFDQSxVQUFBLEdBQWlCLElBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFBO1FBQzNCLEdBQUcsQ0FBQyxLQUFKLENBQVUsb0NBQVYsRUFBZ0QsU0FBaEQsRUFBMkQsT0FBM0Q7ZUFDQSxVQUFVLENBQUMsbUJBQVgsQ0FBK0IsU0FBL0IsRUFBMEMsT0FBMUM7TUFGMkIsQ0FBWjtBQUdqQixhQUFPO0lBTlUsQ0FQbkI7SUFlQSxrQkFBQSxFQUFvQixTQUFDLEtBQUQ7TUFDbEIsSUFBRyxJQUFDLENBQUEsb0JBQUo7QUFDRSxlQURGOztNQUVBLEdBQUcsQ0FBQyxPQUFKLENBQVksNEJBQVosRUFBMEMsS0FBMUM7TUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQ0UsbURBREYsRUFDdUQ7UUFDckQsTUFBQSxFQUFR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QyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUFBLEVBREY7O01BRUEsSUFBQyxDQUFBLGVBQUQsR0FBdUIsSUFBQSxJQUFDLENBQUEsZUFBRCxDQUFBO2FBQ3ZCLElBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLEVBQXdCLGNBQXhCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7VUFDM0MsS0FBQyxDQUFBLGVBQWUsQ0FBQyxRQUFqQixDQUEwQixPQUExQjtVQUNBLElBQUcsT0FBTyxDQUFDLE1BQVIsS0FBa0IsQ0FBckI7bUJBQ0UsS0FBQyxDQUFBLGVBQWUsQ0FBQyxTQUFqQixDQUEyQixPQUFRLENBQUEsQ0FBQSxDQUFuQyxFQURGOztRQUYyQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0M7SUFSYyxDQTlmaEI7SUEyZ0JBLE9BQUEsRUFBUyxTQUFBO01BQ1AsSUFBRyxJQUFDLENBQUEsV0FBSjtRQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBLEVBREY7O01BRUEsSUFBRyxJQUFDLENBQUEsUUFBSjtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBLEVBREY7O0lBSE8sQ0EzZ0JUOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsibG9nID0gcmVxdWlyZSAnLi9sb2cnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2VsZWN0b3I6ICcuc291cmNlLnB5dGhvbidcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24gLmNvbW1lbnQsIC5zb3VyY2UucHl0aG9uIC5zdHJpbmcnXG4gIGluY2x1c2lvblByaW9yaXR5OiAyXG4gIHN1Z2dlc3Rpb25Qcmlvcml0eTogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnN1Z2dlc3Rpb25Qcmlvcml0eScpXG4gIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiBmYWxzZVxuICBjYWNoZVNpemU6IDEwXG5cbiAgX2FkZEV2ZW50TGlzdGVuZXI6IChlZGl0b3IsIGV2ZW50TmFtZSwgaGFuZGxlcikgLT5cbiAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IGVkaXRvclxuICAgIGVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lciBldmVudE5hbWUsIGhhbmRsZXJcbiAgICBkaXNwb3NhYmxlID0gbmV3IEBEaXNwb3NhYmxlIC0+XG4gICAgICBsb2cuZGVidWcgJ1Vuc3Vic2NyaWJpbmcgZnJvbSBldmVudCBsaXN0ZW5lciAnLCBldmVudE5hbWUsIGhhbmRsZXJcbiAgICAgIGVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lciBldmVudE5hbWUsIGhhbmRsZXJcbiAgICByZXR1cm4gZGlzcG9zYWJsZVxuXG4gIF9ub0V4ZWN1dGFibGVFcnJvcjogKGVycm9yKSAtPlxuICAgIGlmIEBwcm92aWRlck5vRXhlY3V0YWJsZVxuICAgICAgcmV0dXJuXG4gICAgbG9nLndhcm5pbmcgJ05vIHB5dGhvbiBleGVjdXRhYmxlIGZvdW5kJywgZXJyb3JcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uIHVuYWJsZSB0byBmaW5kIHB5dGhvbiBiaW5hcnkuJywge1xuICAgICAgZGV0YWlsOiBcIlwiXCJQbGVhc2Ugc2V0IHBhdGggdG8gcHl0aG9uIGV4ZWN1dGFibGUgbWFudWFsbHkgaW4gcGFja2FnZVxuICAgICAgc2V0dGluZ3MgYW5kIHJlc3RhcnQgeW91ciBlZGl0b3IuIEJlIHN1cmUgdG8gbWlncmF0ZSBvbiBuZXcgc2V0dGluZ3NcbiAgICAgIGlmIGV2ZXJ5dGhpbmcgd29ya2VkIG9uIHByZXZpb3VzIHZlcnNpb24uXG4gICAgICBEZXRhaWxlZCBlcnJvciBtZXNzYWdlOiAje2Vycm9yfVxuXG4gICAgICBDdXJyZW50IGNvbmZpZzogI3thdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ucHl0aG9uUGF0aHMnKX1cIlwiXCJcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcbiAgICBAcHJvdmlkZXJOb0V4ZWN1dGFibGUgPSB0cnVlXG5cbiAgX3NwYXduRGFlbW9uOiAtPlxuICAgIGludGVycHJldGVyID0gQEludGVycHJldGVyTG9va3VwLmdldEludGVycHJldGVyKClcbiAgICBsb2cuZGVidWcgJ1VzaW5nIGludGVycHJldGVyJywgaW50ZXJwcmV0ZXJcbiAgICBAcHJvdmlkZXIgPSBuZXcgQEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgY29tbWFuZDogaW50ZXJwcmV0ZXIgb3IgJ3B5dGhvbidcbiAgICAgIGFyZ3M6IFtfX2Rpcm5hbWUgKyAnL2NvbXBsZXRpb24ucHknXVxuICAgICAgc3Rkb3V0OiAoZGF0YSkgPT5cbiAgICAgICAgQF9kZXNlcmlhbGl6ZShkYXRhKVxuICAgICAgc3RkZXJyOiAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YS5pbmRleE9mKCdpcyBub3QgcmVjb2duaXplZCBhcyBhbiBpbnRlcm5hbCBvciBleHRlcm5hbCcpID4gLTFcbiAgICAgICAgICByZXR1cm4gQF9ub0V4ZWN1dGFibGVFcnJvcihkYXRhKVxuICAgICAgICBsb2cuZGVidWcgXCJhdXRvY29tcGxldGUtcHl0aG9uIHRyYWNlYmFjayBvdXRwdXQ6ICN7ZGF0YX1cIlxuICAgICAgICBpZiBkYXRhLmluZGV4T2YoJ2plZGknKSA+IC0xXG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dFByb3ZpZGVyRXJyb3JzJylcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgICAnJydMb29rcyBsaWtlIHRoaXMgZXJyb3Igb3JpZ2luYXRlZCBmcm9tIEplZGkuIFBsZWFzZSBkbyBub3RcbiAgICAgICAgICAgICAgcmVwb3J0IHN1Y2ggaXNzdWVzIGluIGF1dG9jb21wbGV0ZS1weXRob24gaXNzdWUgdHJhY2tlci4gUmVwb3J0XG4gICAgICAgICAgICAgIHRoZW0gZGlyZWN0bHkgdG8gSmVkaS4gVHVybiBvZmYgYG91dHB1dFByb3ZpZGVyRXJyb3JzYCBzZXR0aW5nXG4gICAgICAgICAgICAgIHRvIGhpZGUgc3VjaCBlcnJvcnMgaW4gZnV0dXJlLiBUcmFjZWJhY2sgb3V0cHV0OicnJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IFwiI3tkYXRhfVwiLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbiB0cmFjZWJhY2sgb3V0cHV0OicsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZGF0YX1cIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuXG4gICAgICAgIGxvZy5kZWJ1ZyBcIkZvcmNpbmcgdG8gcmVzb2x2ZSAje09iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RofSBwcm9taXNlc1wiXG4gICAgICAgIGZvciByZXF1ZXN0SWQsIHJlc29sdmUgb2YgQHJlcXVlc3RzXG4gICAgICAgICAgaWYgdHlwZW9mIHJlc29sdmUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgcmVzb2x2ZShbXSlcbiAgICAgICAgICBkZWxldGUgQHJlcXVlc3RzW3JlcXVlc3RJZF1cblxuICAgICAgZXhpdDogKGNvZGUpID0+XG4gICAgICAgIGxvZy53YXJuaW5nICdQcm9jZXNzIGV4aXQgd2l0aCcsIGNvZGUsIEBwcm92aWRlclxuICAgIEBwcm92aWRlci5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pID0+XG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxuICAgICAgICBAX25vRXhlY3V0YWJsZUVycm9yKGVycm9yKVxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IGVycm9yXG5cbiAgICBAcHJvdmlkZXIucHJvY2Vzcz8uc3RkaW4ub24gJ2Vycm9yJywgKGVycikgLT5cbiAgICAgIGxvZy5kZWJ1ZyAnc3RkaW4nLCBlcnJcblxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgIGxvZy5kZWJ1ZyAnS2lsbGluZyBweXRob24gcHJvY2VzcyBhZnRlciB0aW1lb3V0Li4uJ1xuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgICBAcHJvdmlkZXIua2lsbCgpXG4gICAgLCA2MCAqIDEwICogMTAwMFxuXG4gIGxvYWQ6IC0+XG4gICAgaWYgbm90IEBjb25zdHJ1Y3RlZFxuICAgICAgQGNvbnN0cnVjdG9yKClcbiAgICByZXR1cm4gdGhpc1xuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIHtARGlzcG9zYWJsZSwgQENvbXBvc2l0ZURpc3Bvc2FibGUsIEBCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbiAgICB7QHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbn0gPSByZXF1aXJlICcuL3Njb3BlLWhlbHBlcnMnXG4gICAge0BTZWxlY3Rvcn0gPSByZXF1aXJlICdzZWxlY3Rvci1raXQnXG4gICAgQERlZmluaXRpb25zVmlldyA9IHJlcXVpcmUgJy4vZGVmaW5pdGlvbnMtdmlldydcbiAgICBAVXNhZ2VzVmlldyA9IHJlcXVpcmUgJy4vdXNhZ2VzLXZpZXcnXG4gICAgQE92ZXJyaWRlVmlldyA9IHJlcXVpcmUgJy4vb3ZlcnJpZGUtdmlldydcbiAgICBAUmVuYW1lVmlldyA9IHJlcXVpcmUgJy4vcmVuYW1lLXZpZXcnXG4gICAgQEludGVycHJldGVyTG9va3VwID0gcmVxdWlyZSAnLi9pbnRlcnByZXRlcnMtbG9va3VwJ1xuICAgIEBfID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbiAgICBAZmlsdGVyID0gcmVxdWlyZSgnZnV6emFsZHJpbi1wbHVzJykuZmlsdGVyXG5cbiAgICBAcmVxdWVzdHMgPSB7fVxuICAgIEByZXNwb25zZXMgPSB7fVxuICAgIEBwcm92aWRlciA9IG51bGxcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgQGRlZmluaXRpb25zVmlldyA9IG51bGxcbiAgICBAdXNhZ2VzVmlldyA9IG51bGxcbiAgICBAcmVuYW1lVmlldyA9IG51bGxcbiAgICBAY29uc3RydWN0ZWQgPSB0cnVlXG4gICAgQHNuaXBwZXRzTWFuYWdlciA9IG51bGxcblxuICAgIGxvZy5kZWJ1ZyBcIkluaXQgYXV0b2NvbXBsZXRlLXB5dGhvbiB3aXRoIHByaW9yaXR5ICN7QHN1Z2dlc3Rpb25Qcmlvcml0eX1cIlxuXG4gICAgdHJ5XG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IFJlZ0V4cCBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLnRyaWdnZXJDb21wbGV0aW9uUmVnZXgnKVxuICAgIGNhdGNoIGVyclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICcnJ2F1dG9jb21wbGV0ZS1weXRob24gaW52YWxpZCByZWdleHAgdG8gdHJpZ2dlciBhdXRvY29tcGxldGlvbnMuXG4gICAgICAgIEZhbGxpbmcgYmFjayB0byBkZWZhdWx0IHZhbHVlLicnJywge1xuICAgICAgICBkZXRhaWw6IFwiT3JpZ2luYWwgZXhjZXB0aW9uOiAje2Vycn1cIlxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udHJpZ2dlckNvbXBsZXRpb25SZWdleCcsXG4gICAgICAgICAgICAgICAgICAgICAgJyhbXFwuXFwgXXxbYS16QS1aX11bYS16QS1aMC05X10qKScpXG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IC8oW1xcLlxcIF18W2EtekEtWl9dW2EtekEtWjAtOV9dKikvXG5cbiAgICBzZWxlY3RvciA9ICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49cHl0aG9uXSdcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246Z28tdG8tZGVmaW5pdGlvbicsID0+XG4gICAgICBAZ29Ub0RlZmluaXRpb24oKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCksIHRydWUpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246c2hvdy11c2FnZXMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiBAdXNhZ2VzVmlld1xuICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcbiAgICAgIEB1c2FnZXNWaWV3ID0gbmV3IEBVc2FnZXNWaWV3KClcbiAgICAgIEBnZXRVc2FnZXMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikudGhlbiAodXNhZ2VzKSA9PlxuICAgICAgICBAdXNhZ2VzVmlldy5zZXRJdGVtcyh1c2FnZXMpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246b3ZlcnJpZGUtbWV0aG9kJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgQG92ZXJyaWRlVmlld1xuICAgICAgICBAb3ZlcnJpZGVWaWV3LmRlc3Ryb3koKVxuICAgICAgQG92ZXJyaWRlVmlldyA9IG5ldyBAT3ZlcnJpZGVWaWV3KClcbiAgICAgIEBnZXRNZXRob2RzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHttZXRob2RzLCBpbmRlbnQsIGJ1ZmZlclBvc2l0aW9ufSkgPT5cbiAgICAgICAgQG92ZXJyaWRlVmlldy5pbmRlbnQgPSBpbmRlbnRcbiAgICAgICAgQG92ZXJyaWRlVmlldy5idWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uXG4gICAgICAgIEBvdmVycmlkZVZpZXcuc2V0SXRlbXMobWV0aG9kcylcblxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpyZW5hbWUnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAZ2V0VXNhZ2VzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHVzYWdlcykgPT5cbiAgICAgICAgaWYgQHJlbmFtZVZpZXdcbiAgICAgICAgICBAcmVuYW1lVmlldy5kZXN0cm95KClcbiAgICAgICAgaWYgdXNhZ2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAcmVuYW1lVmlldyA9IG5ldyBAUmVuYW1lVmlldyh1c2FnZXMpXG4gICAgICAgICAgQHJlbmFtZVZpZXcub25JbnB1dCAobmV3TmFtZSkgPT5cbiAgICAgICAgICAgIGZvciBmaWxlTmFtZSwgdXNhZ2VzIG9mIEBfLmdyb3VwQnkodXNhZ2VzLCAnZmlsZU5hbWUnKVxuICAgICAgICAgICAgICBbcHJvamVjdCwgX3JlbGF0aXZlXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlTmFtZSlcbiAgICAgICAgICAgICAgaWYgcHJvamVjdFxuICAgICAgICAgICAgICAgIEBfdXBkYXRlVXNhZ2VzSW5GaWxlKGZpbGVOYW1lLCB1c2FnZXMsIG5ld05hbWUpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGZpbGUgb3V0c2lkZSBvZiBwcm9qZWN0JywgZmlsZU5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEB1c2FnZXNWaWV3XG4gICAgICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcbiAgICAgICAgICBAdXNhZ2VzVmlldyA9IG5ldyBAVXNhZ2VzVmlldygpXG4gICAgICAgICAgQHVzYWdlc1ZpZXcuc2V0SXRlbXModXNhZ2VzKVxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgICBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGdyYW1tYXIpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlQXV0b0FjdGl2YXRpb24nLCA9PlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGVkaXRvciwgZWRpdG9yLmdldEdyYW1tYXIoKSlcblxuICBfdXBkYXRlVXNhZ2VzSW5GaWxlOiAoZmlsZU5hbWUsIHVzYWdlcywgbmV3TmFtZSkgLT5cbiAgICBjb2x1bW5PZmZzZXQgPSB7fVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZU5hbWUsIGFjdGl2YXRlSXRlbTogZmFsc2UpLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgZm9yIHVzYWdlIGluIHVzYWdlc1xuICAgICAgICB7bmFtZSwgbGluZSwgY29sdW1ufSA9IHVzYWdlXG4gICAgICAgIGNvbHVtbk9mZnNldFtsaW5lXSA/PSAwXG4gICAgICAgIGxvZy5kZWJ1ZyAnUmVwbGFjaW5nJywgdXNhZ2UsICd3aXRoJywgbmV3TmFtZSwgJ2luJywgZWRpdG9yLmlkXG4gICAgICAgIGxvZy5kZWJ1ZyAnT2Zmc2V0IGZvciBsaW5lJywgbGluZSwgJ2lzJywgY29sdW1uT2Zmc2V0W2xpbmVdXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShbXG4gICAgICAgICAgW2xpbmUgLSAxLCBjb2x1bW4gKyBjb2x1bW5PZmZzZXRbbGluZV1dLFxuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgbmFtZS5sZW5ndGggKyBjb2x1bW5PZmZzZXRbbGluZV1dLFxuICAgICAgICAgIF0sIG5ld05hbWUpXG4gICAgICAgIGNvbHVtbk9mZnNldFtsaW5lXSArPSBuZXdOYW1lLmxlbmd0aCAtIG5hbWUubGVuZ3RoXG4gICAgICBidWZmZXIuc2F2ZSgpXG5cblxuICBfc2hvd1NpZ25hdHVyZU92ZXJsYXk6IChldmVudCkgLT5cbiAgICBpZiBAbWFya2Vyc1xuICAgICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc1xuICAgICAgICBsb2cuZGVidWcgJ2Rlc3Ryb3lpbmcgb2xkIG1hcmtlcicsIG1hcmtlclxuICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgQG1hcmtlcnMgPSBbXVxuXG4gICAgY3Vyc29yID0gZXZlbnQuY3Vyc29yXG4gICAgZWRpdG9yID0gZXZlbnQuY3Vyc29yLmVkaXRvclxuICAgIHdvcmRCdWZmZXJSYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oXG4gICAgICBldmVudC5uZXdCdWZmZXJQb3NpdGlvbilcbiAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yID0gXCIje0BkaXNhYmxlRm9yU2VsZWN0b3J9LCAuc291cmNlLnB5dGhvbiAubnVtZXJpYywgLnNvdXJjZS5weXRob24gLmludGVnZXIsIC5zb3VyY2UucHl0aG9uIC5kZWNpbWFsLCAuc291cmNlLnB5dGhvbiAucHVuY3R1YXRpb24sIC5zb3VyY2UucHl0aG9uIC5rZXl3b3JkLCAuc291cmNlLnB5dGhvbiAuc3RvcmFnZSwgLnNvdXJjZS5weXRob24gLnZhcmlhYmxlLnBhcmFtZXRlciwgLnNvdXJjZS5weXRob24gLmVudGl0eS5uYW1lXCJcbiAgICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBAU2VsZWN0b3IuY3JlYXRlKGRpc2FibGVGb3JTZWxlY3RvcilcblxuICAgIGlmIEBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgbG9nLmRlYnVnICdkbyBub3RoaW5nIGZvciB0aGlzIHNlbGVjdG9yJ1xuICAgICAgcmV0dXJuXG5cbiAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFxuICAgICAgd29yZEJ1ZmZlclJhbmdlLFxuICAgICAge3BlcnNpc3RlbnQ6IGZhbHNlLCBpbnZhbGlkYXRlOiAnbmV2ZXInfSlcblxuICAgIEBtYXJrZXJzLnB1c2gobWFya2VyKVxuXG4gICAgZ2V0VG9vbHRpcCA9IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSA9PlxuICAgICAgcGF5bG9hZCA9XG4gICAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCd0b29sdGlwJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgbG9va3VwOiAndG9vbHRpcCdcbiAgICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuICAgICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gICAgZ2V0VG9vbHRpcChlZGl0b3IsIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgaWYgcmVzdWx0cy5sZW5ndGggPiAwXG4gICAgICAgIHt0ZXh0LCBmaWxlTmFtZSwgbGluZSwgY29sdW1uLCB0eXBlLCBkZXNjcmlwdGlvbn0gPSByZXN1bHRzWzBdXG5cbiAgICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi50cmltKClcbiAgICAgICAgaWYgbm90IGRlc2NyaXB0aW9uXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdXRvY29tcGxldGUtcHl0aG9uLXN1Z2dlc3Rpb24nKVxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRlc2NyaXB0aW9uKSlcbiAgICAgICAgZGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgICAgIGl0ZW06IHZpZXcsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2hlYWQnXG4gICAgICAgIH0pXG4gICAgICAgIGxvZy5kZWJ1ZygnZGVjb3JhdGVkIG1hcmtlcicsIG1hcmtlcilcblxuICBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50OiAoZWRpdG9yLCBncmFtbWFyKSAtPlxuICAgIGV2ZW50TmFtZSA9ICdrZXl1cCdcbiAgICBldmVudElkID0gXCIje2VkaXRvci5pZH0uI3tldmVudE5hbWV9XCJcbiAgICBpZiBncmFtbWFyLnNjb3BlTmFtZSA9PSAnc291cmNlLnB5dGhvbidcblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnNob3dUb29sdGlwcycpIGlzIHRydWVcbiAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PlxuICAgICAgICAgIEBfc2hvd1NpZ25hdHVyZU92ZXJsYXkoZXZlbnQpXG5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJylcbiAgICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBrZXl1cCBldmVudHMgZHVlIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHNldHRpbmdzLidcbiAgICAgICAgcmV0dXJuXG4gICAgICBkaXNwb3NhYmxlID0gQF9hZGRFdmVudExpc3RlbmVyIGVkaXRvciwgZXZlbnROYW1lLCAoZSkgPT5cbiAgICAgICAgaWYgYXRvbS5rZXltYXBzLmtleXN0cm9rZUZvcktleWJvYXJkRXZlbnQoZSkgPT0gJ14oJ1xuICAgICAgICAgIGxvZy5kZWJ1ZyAnVHJ5aW5nIHRvIGNvbXBsZXRlIGFyZ3VtZW50cyBvbiBrZXl1cCBldmVudCcsIGVcbiAgICAgICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVcbiAgICAgIEBzdWJzY3JpcHRpb25zW2V2ZW50SWRdID0gZGlzcG9zYWJsZVxuICAgICAgbG9nLmRlYnVnICdTdWJzY3JpYmVkIG9uIGV2ZW50JywgZXZlbnRJZFxuICAgIGVsc2VcbiAgICAgIGlmIGV2ZW50SWQgb2YgQHN1YnNjcmlwdGlvbnNcbiAgICAgICAgQHN1YnNjcmlwdGlvbnNbZXZlbnRJZF0uZGlzcG9zZSgpXG4gICAgICAgIGxvZy5kZWJ1ZyAnVW5zdWJzY3JpYmVkIGZyb20gZXZlbnQnLCBldmVudElkXG5cbiAgX3NlcmlhbGl6ZTogKHJlcXVlc3QpIC0+XG4gICAgbG9nLmRlYnVnICdTZXJpYWxpemluZyByZXF1ZXN0IHRvIGJlIHNlbnQgdG8gSmVkaScsIHJlcXVlc3RcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmVxdWVzdClcblxuICBfc2VuZFJlcXVlc3Q6IChkYXRhLCByZXNwYXduZWQpIC0+XG4gICAgbG9nLmRlYnVnICdQZW5kaW5nIHJlcXVlc3RzOicsIE9iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RoLCBAcmVxdWVzdHNcbiAgICBpZiBPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aCA+IDEwXG4gICAgICBsb2cuZGVidWcgJ0NsZWFuaW5nIHVwIHJlcXVlc3QgcXVldWUgdG8gYXZvaWQgb3ZlcmZsb3csIGlnbm9yaW5nIHJlcXVlc3QnXG4gICAgICBAcmVxdWVzdHMgPSB7fVxuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgICBsb2cuZGVidWcgJ0tpbGxpbmcgcHl0aG9uIHByb2Nlc3MnXG4gICAgICAgIEBwcm92aWRlci5raWxsKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBpZiBAcHJvdmlkZXIgYW5kIEBwcm92aWRlci5wcm9jZXNzXG4gICAgICBwcm9jZXNzID0gQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgIGlmIHByb2Nlc3MuZXhpdENvZGUgPT0gbnVsbCBhbmQgcHJvY2Vzcy5zaWduYWxDb2RlID09IG51bGxcbiAgICAgICAgaWYgQHByb3ZpZGVyLnByb2Nlc3MucGlkXG4gICAgICAgICAgcmV0dXJuIEBwcm92aWRlci5wcm9jZXNzLnN0ZGluLndyaXRlKGRhdGEgKyAnXFxuJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxvZy5kZWJ1ZyAnQXR0ZW1wdCB0byBjb21tdW5pY2F0ZSB3aXRoIHRlcm1pbmF0ZWQgcHJvY2VzcycsIEBwcm92aWRlclxuICAgICAgZWxzZSBpZiByZXNwYXduZWRcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgW1wiRmFpbGVkIHRvIHNwYXduIGRhZW1vbiBmb3IgYXV0b2NvbXBsZXRlLXB5dGhvbi5cIlxuICAgICAgICAgICBcIkNvbXBsZXRpb25zIHdpbGwgbm90IHdvcmsgYW55bW9yZVwiXG4gICAgICAgICAgIFwidW5sZXNzIHlvdSByZXN0YXJ0IHlvdXIgZWRpdG9yLlwiXS5qb2luKCcgJyksIHtcbiAgICAgICAgICBkZXRhaWw6IFtcImV4aXRDb2RlOiAje3Byb2Nlc3MuZXhpdENvZGV9XCJcbiAgICAgICAgICAgICAgICAgICBcInNpZ25hbENvZGU6ICN7cHJvY2Vzcy5zaWduYWxDb2RlfVwiXS5qb2luKCdcXG4nKSxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIEBkaXNwb3NlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQF9zcGF3bkRhZW1vbigpXG4gICAgICAgIEBfc2VuZFJlcXVlc3QoZGF0YSwgcmVzcGF3bmVkOiB0cnVlKVxuICAgICAgICBsb2cuZGVidWcgJ1JlLXNwYXduaW5nIHB5dGhvbiBwcm9jZXNzLi4uJ1xuICAgIGVsc2VcbiAgICAgIGxvZy5kZWJ1ZyAnU3Bhd25pbmcgcHl0aG9uIHByb2Nlc3MuLi4nXG4gICAgICBAX3NwYXduRGFlbW9uKClcbiAgICAgIEBfc2VuZFJlcXVlc3QoZGF0YSlcblxuICBfZGVzZXJpYWxpemU6IChyZXNwb25zZSkgLT5cbiAgICBsb2cuZGVidWcgJ0Rlc2VyZWFsaXppbmcgcmVzcG9uc2UgZnJvbSBKZWRpJywgcmVzcG9uc2VcbiAgICBsb2cuZGVidWcgXCJHb3QgI3tyZXNwb25zZS50cmltKCkuc3BsaXQoJ1xcbicpLmxlbmd0aH0gbGluZXNcIlxuICAgIGZvciByZXNwb25zZVNvdXJjZSBpbiByZXNwb25zZS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgICB0cnlcbiAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlU291cmNlKVxuICAgICAgY2F0Y2ggZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJcIlwiRmFpbGVkIHRvIHBhcnNlIEpTT04gZnJvbSBcXFwiI3tyZXNwb25zZVNvdXJjZX1cXFwiLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgT3JpZ2luYWwgZXhjZXB0aW9uOiAje2V9XCJcIlwiKVxuXG4gICAgICBpZiByZXNwb25zZVsnYXJndW1lbnRzJ11cbiAgICAgICAgZWRpdG9yID0gQHJlcXVlc3RzW3Jlc3BvbnNlWydpZCddXVxuICAgICAgICBpZiB0eXBlb2YgZWRpdG9yID09ICdvYmplY3QnXG4gICAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgICMgQ29tcGFyZSByZXNwb25zZSBJRCB3aXRoIGN1cnJlbnQgc3RhdGUgdG8gYXZvaWQgc3RhbGUgY29tcGxldGlvbnNcbiAgICAgICAgICBpZiByZXNwb25zZVsnaWQnXSA9PSBAX2dlbmVyYXRlUmVxdWVzdElkKCdhcmd1bWVudHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICAgICAgQHNuaXBwZXRzTWFuYWdlcj8uaW5zZXJ0U25pcHBldChyZXNwb25zZVsnYXJndW1lbnRzJ10sIGVkaXRvcilcbiAgICAgIGVsc2VcbiAgICAgICAgcmVzb2x2ZSA9IEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cbiAgICAgICAgaWYgdHlwZW9mIHJlc29sdmUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2VbJ3Jlc3VsdHMnXSlcbiAgICAgIGNhY2hlU2l6ZURlbHRhID0gT2JqZWN0LmtleXMoQHJlc3BvbnNlcykubGVuZ3RoID4gQGNhY2hlU2l6ZVxuICAgICAgaWYgY2FjaGVTaXplRGVsdGEgPiAwXG4gICAgICAgIGlkcyA9IE9iamVjdC5rZXlzKEByZXNwb25zZXMpLnNvcnQgKGEsIGIpID0+XG4gICAgICAgICAgcmV0dXJuIEByZXNwb25zZXNbYV1bJ3RpbWVzdGFtcCddIC0gQHJlc3BvbnNlc1tiXVsndGltZXN0YW1wJ11cbiAgICAgICAgZm9yIGlkIGluIGlkcy5zbGljZSgwLCBjYWNoZVNpemVEZWx0YSlcbiAgICAgICAgICBsb2cuZGVidWcgJ1JlbW92aW5nIG9sZCBpdGVtIGZyb20gY2FjaGUgd2l0aCBJRCcsIGlkXG4gICAgICAgICAgZGVsZXRlIEByZXNwb25zZXNbaWRdXG4gICAgICBAcmVzcG9uc2VzW3Jlc3BvbnNlWydpZCddXSA9XG4gICAgICAgIHNvdXJjZTogcmVzcG9uc2VTb3VyY2VcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICBsb2cuZGVidWcgJ0NhY2hlZCByZXF1ZXN0IHdpdGggSUQnLCByZXNwb25zZVsnaWQnXVxuICAgICAgZGVsZXRlIEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cblxuICBfZ2VuZXJhdGVSZXF1ZXN0SWQ6ICh0eXBlLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCB0ZXh0KSAtPlxuICAgIGlmIG5vdCB0ZXh0XG4gICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgIHJldHVybiByZXF1aXJlKCdjcnlwdG8nKS5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoW1xuICAgICAgZWRpdG9yLmdldFBhdGgoKSwgdGV4dCwgYnVmZmVyUG9zaXRpb24ucm93LFxuICAgICAgYnVmZmVyUG9zaXRpb24uY29sdW1uLCB0eXBlXS5qb2luKCkpLmRpZ2VzdCgnaGV4JylcblxuICBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnOiAtPlxuICAgIGV4dHJhUGF0aHMgPSBASW50ZXJwcmV0ZXJMb29rdXAuYXBwbHlTdWJzdGl0dXRpb25zKFxuICAgICAgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmV4dHJhUGF0aHMnKS5zcGxpdCgnOycpKVxuICAgIGFyZ3MgPVxuICAgICAgJ2V4dHJhUGF0aHMnOiBleHRyYVBhdGhzXG4gICAgICAndXNlU25pcHBldHMnOiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udXNlU25pcHBldHMnKVxuICAgICAgJ2Nhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb24nOiBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLmNhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb24nKVxuICAgICAgJ3Nob3dEZXNjcmlwdGlvbnMnOiBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLnNob3dEZXNjcmlwdGlvbnMnKVxuICAgICAgJ2Z1enp5TWF0Y2hlcic6IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgIHJldHVybiBhcmdzXG5cbiAgc2V0U25pcHBldHNNYW5hZ2VyOiAoQHNuaXBwZXRzTWFuYWdlcikgLT5cblxuICBfY29tcGxldGVBcmd1bWVudHM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBmb3JjZSkgLT5cbiAgICB1c2VTbmlwcGV0cyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VTbmlwcGV0cycpXG4gICAgaWYgbm90IGZvcmNlIGFuZCB1c2VTbmlwcGV0cyA9PSAnbm9uZSdcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnKVxuICAgICAgcmV0dXJuXG4gICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yID0gQFNlbGVjdG9yLmNyZWF0ZShAZGlzYWJsZUZvclNlbGVjdG9yKVxuICAgIGlmIEBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIGluc2lkZSBvZicsIHNjb3BlQ2hhaW5cbiAgICAgIHJldHVyblxuXG4gICAgIyB3ZSBkb24ndCB3YW50IHRvIGNvbXBsZXRlIGFyZ3VtZW50cyBpbnNpZGUgb2YgZXhpc3RpbmcgY29kZVxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcbiAgICBsaW5lID0gbGluZXNbYnVmZmVyUG9zaXRpb24ucm93XVxuICAgIHByZWZpeCA9IGxpbmUuc2xpY2UoYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gMSwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxuICAgIGlmIHByZWZpeCBpc250ICcoJ1xuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIHdpdGggcHJlZml4JywgcHJlZml4XG4gICAgICByZXR1cm5cbiAgICBzdWZmaXggPSBsaW5lLnNsaWNlIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiwgbGluZS5sZW5ndGhcbiAgICBpZiBub3QgL14oXFwpKD86JHxcXHMpfFxcc3wkKS8udGVzdChzdWZmaXgpXG4gICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGFyZ3VtZW50IGNvbXBsZXRpb24gd2l0aCBzdWZmaXgnLCBzdWZmaXhcbiAgICAgIHJldHVyblxuXG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgnYXJndW1lbnRzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ2FyZ3VtZW50cydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gZWRpdG9yXG5cbiAgX2Z1enp5RmlsdGVyOiAoY2FuZGlkYXRlcywgcXVlcnkpIC0+XG4gICAgaWYgY2FuZGlkYXRlcy5sZW5ndGggaXNudCAwIGFuZCBxdWVyeSBub3QgaW4gWycgJywgJy4nLCAnKCddXG4gICAgICBjYW5kaWRhdGVzID0gQGZpbHRlcihjYW5kaWRhdGVzLCBxdWVyeSwga2V5OiAndGV4dCcpXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXNcblxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XG4gICAgQGxvYWQoKVxuICAgIGlmIG5vdCBAdHJpZ2dlckNvbXBsZXRpb25SZWdleC50ZXN0KHByZWZpeClcbiAgICAgIHJldHVybiBAbGFzdFN1Z2dlc3Rpb25zID0gW11cbiAgICBidWZmZXJQb3NpdGlvbiA9XG4gICAgICByb3c6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmZ1enp5TWF0Y2hlcicpXG4gICAgICAjIHdlIHdhbnQgdG8gZG8gb3VyIG93biBmaWx0ZXJpbmcsIGhpZGUgYW55IGV4aXN0aW5nIHN1ZmZpeCBmcm9tIEplZGlcbiAgICAgIGxpbmUgPSBsaW5lc1tidWZmZXJQb3NpdGlvbi5yb3ddXG4gICAgICBsYXN0SWRlbnRpZmllciA9IC9cXC4/W2EtekEtWl9dW2EtekEtWjAtOV9dKiQvLmV4ZWMoXG4gICAgICAgIGxpbmUuc2xpY2UgMCwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxuICAgICAgaWYgbGFzdElkZW50aWZpZXJcbiAgICAgICAgYnVmZmVyUG9zaXRpb24uY29sdW1uID0gbGFzdElkZW50aWZpZXIuaW5kZXggKyAxXG4gICAgICAgIGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd10gPSBsaW5lLnNsaWNlKDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbilcbiAgICByZXF1ZXN0SWQgPSBAX2dlbmVyYXRlUmVxdWVzdElkKFxuICAgICAgJ2NvbXBsZXRpb25zJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgbGluZXMuam9pbignXFxuJykpXG4gICAgaWYgcmVxdWVzdElkIG9mIEByZXNwb25zZXNcbiAgICAgIGxvZy5kZWJ1ZyAnVXNpbmcgY2FjaGVkIHJlc3BvbnNlIHdpdGggSUQnLCByZXF1ZXN0SWRcbiAgICAgICMgV2UgaGF2ZSB0byBwYXJzZSBKU09OIG9uIGVhY2ggcmVxdWVzdCBoZXJlIHRvIHBhc3Mgb25seSBhIGNvcHlcbiAgICAgIG1hdGNoZXMgPSBKU09OLnBhcnNlKEByZXNwb25zZXNbcmVxdWVzdElkXVsnc291cmNlJ10pWydyZXN1bHRzJ11cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgICByZXR1cm4gQGxhc3RTdWdnZXN0aW9ucyA9IEBfZnV6enlGaWx0ZXIobWF0Y2hlcywgcHJlZml4KVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gQGxhc3RTdWdnZXN0aW9ucyA9IG1hdGNoZXNcbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiByZXF1ZXN0SWRcbiAgICAgIHByZWZpeDogcHJlZml4XG4gICAgICBsb29rdXA6ICdjb21wbGV0aW9ucydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAobWF0Y2hlcykgPT5cbiAgICAgICAgICByZXNvbHZlKEBsYXN0U3VnZ2VzdGlvbnMgPSBAX2Z1enp5RmlsdGVyKG1hdGNoZXMsIHByZWZpeCkpXG4gICAgICBlbHNlXG4gICAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IChzdWdnZXN0aW9ucykgPT5cbiAgICAgICAgICByZXNvbHZlKEBsYXN0U3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucylcblxuICBnZXREZWZpbml0aW9uczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgnZGVmaW5pdGlvbnMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAnZGVmaW5pdGlvbnMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSByZXNvbHZlXG5cbiAgZ2V0VXNhZ2VzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCd1c2FnZXMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAndXNhZ2VzJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcblxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gIGdldE1ldGhvZHM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGluZGVudCA9IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcbiAgICBsaW5lcy5zcGxpY2UoYnVmZmVyUG9zaXRpb24ucm93ICsgMSwgMCwgXCIgIGRlZiBfX2F1dG9jb21wbGV0ZV9weXRob24ocyk6XCIpXG4gICAgbGluZXMuc3BsaWNlKGJ1ZmZlclBvc2l0aW9uLnJvdyArIDIsIDAsIFwiICAgIHMuXCIpXG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgnbWV0aG9kcycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICdtZXRob2RzJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBsaW5lcy5qb2luKCdcXG4nKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93ICsgMlxuICAgICAgY29sdW1uOiA2XG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcblxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gKG1ldGhvZHMpIC0+XG4gICAgICAgIHJlc29sdmUoe21ldGhvZHMsIGluZGVudCwgYnVmZmVyUG9zaXRpb259KVxuXG4gIGdvVG9EZWZpbml0aW9uOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBpZiBub3QgZWRpdG9yXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBub3QgYnVmZmVyUG9zaXRpb25cbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAZGVmaW5pdGlvbnNWaWV3XG4gICAgICBAZGVmaW5pdGlvbnNWaWV3LmRlc3Ryb3koKVxuICAgIEBkZWZpbml0aW9uc1ZpZXcgPSBuZXcgQERlZmluaXRpb25zVmlldygpXG4gICAgQGdldERlZmluaXRpb25zKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICBAZGVmaW5pdGlvbnNWaWV3LnNldEl0ZW1zKHJlc3VsdHMpXG4gICAgICBpZiByZXN1bHRzLmxlbmd0aCA9PSAxXG4gICAgICAgIEBkZWZpbml0aW9uc1ZpZXcuY29uZmlybWVkKHJlc3VsdHNbMF0pXG5cbiAgZGlzcG9zZTogLT5cbiAgICBpZiBAZGlzcG9zYWJsZXNcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBpZiBAcHJvdmlkZXJcbiAgICAgIEBwcm92aWRlci5raWxsKClcbiJdfQ==
