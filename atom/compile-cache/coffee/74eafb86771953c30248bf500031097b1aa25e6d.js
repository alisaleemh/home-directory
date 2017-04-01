(function() {
  var CompositeDisposable, extractRange, fs, path, tokenizedLineForRow,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  tokenizedLineForRow = function(textEditor, lineNumber) {
    var tokenBuffer;
    if (textEditor.hasOwnProperty('displayBuffer')) {
      tokenBuffer = textEditor.displayBuffer.tokenizedBuffer;
    } else {
      tokenBuffer = textEditor.tokenizedBuffer;
    }
    return tokenBuffer.tokenizedLineForRow(lineNumber);
  };

  fs = require('fs');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  extractRange = function(_arg) {
    var code, colNumber, foundDecorator, foundImport, lineNumber, message, offset, prefix, screenLine, symbol, textEditor, token, tokenizedLine, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    code = _arg.code, message = _arg.message, lineNumber = _arg.lineNumber, colNumber = _arg.colNumber, textEditor = _arg.textEditor;
    switch (code) {
      case 'C901':
        symbol = /'(?:[^.]+\.)?([^']+)'/.exec(message)[1];
        while (true) {
          offset = 0;
          tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
          if (tokenizedLine === void 0) {
            break;
          }
          foundDecorator = false;
          _ref = tokenizedLine.tokens;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            token = _ref[_i];
            if (__indexOf.call(token.scopes, 'meta.function.python') >= 0) {
              if (token.value === symbol) {
                return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
              }
            }
            if (__indexOf.call(token.scopes, 'meta.function.decorator.python') >= 0) {
              foundDecorator = true;
            }
            offset += token.value.length;
          }
          if (!foundDecorator) {
            break;
          }
          lineNumber += 1;
        }
        break;
      case 'E125':
      case 'E127':
      case 'E128':
      case 'E131':
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref1 = tokenizedLine.tokens;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          token = _ref1[_j];
          if (!token.firstNonWhitespaceIndex) {
            return [[lineNumber, 0], [lineNumber, offset]];
          }
          if (token.firstNonWhitespaceIndex !== token.value.length) {
            return [[lineNumber, 0], [lineNumber, offset + token.firstNonWhitespaceIndex]];
          }
          offset += token.value.length;
        }
        break;
      case 'E262':
      case 'E265':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 1]];
      case 'F401':
        symbol = /'([^']+)'/.exec(message)[1];
        _ref2 = symbol.split('.'), prefix = 2 <= _ref2.length ? __slice.call(_ref2, 0, _k = _ref2.length - 1) : (_k = 0, []), symbol = _ref2[_k++];
        foundImport = false;
        while (true) {
          offset = 0;
          tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
          if (tokenizedLine === void 0) {
            break;
          }
          _ref3 = tokenizedLine.tokens;
          for (_l = 0, _len2 = _ref3.length; _l < _len2; _l++) {
            token = _ref3[_l];
            if (foundImport && token.value === symbol) {
              return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
            }
            if (token.value === 'import' && __indexOf.call(token.scopes, 'keyword.control.import.python') >= 0) {
              foundImport = true;
            }
            offset += token.value.length;
          }
          lineNumber += 1;
        }
        break;
      case 'F821':
      case 'F841':
        symbol = /'([^']+)'/.exec(message)[1];
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref4 = tokenizedLine.tokens;
        for (_m = 0, _len3 = _ref4.length; _m < _len3; _m++) {
          token = _ref4[_m];
          if (token.value === symbol && offset >= colNumber - 1) {
            return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
          }
          offset += token.value.length;
        }
        break;
      case 'H101':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 3]];
      case 'H201':
        return [[lineNumber, colNumber - 7], [lineNumber, colNumber]];
      case 'H231':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 5]];
      case 'H233':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 4]];
      case 'H236':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 12]];
      case 'H238':
        return [[lineNumber, colNumber - 1], [lineNumber, colNumber + 4]];
      case 'H501':
        tokenizedLine = tokenizedLineForRow(textEditor, lineNumber);
        if (tokenizedLine === void 0) {
          break;
        }
        offset = 0;
        _ref5 = tokenizedLine.tokens;
        for (_n = 0, _len4 = _ref5.length; _n < _len4; _n++) {
          token = _ref5[_n];
          if (__indexOf.call(token.scopes, 'meta.function-call.python') >= 0) {
            if (token.value === 'locals') {
              return [[lineNumber, offset], [lineNumber, offset + token.value.length]];
            }
          }
          offset += token.value.length;
        }
        break;
      case 'W291':
        screenLine = tokenizedLineForRow(textEditor, lineNumber);
        if (screenLine === void 0) {
          break;
        }
        return [[lineNumber, colNumber - 1], [lineNumber, screenLine.length]];
    }
    return [[lineNumber, colNumber - 1], [lineNumber, colNumber]];
  };

  module.exports = {
    config: {
      executablePath: {
        type: 'string',
        "default": 'flake8',
        description: 'Semicolon separated list of paths to a binary (e.g. /usr/local/bin/flake8). ' + 'Use `$PROJECT` or `$PROJECT_NAME` substitutions for project specific paths ' + 'e.g. `$PROJECT/.venv/bin/flake8;/usr/bin/flake8`'
      },
      disableTimeout: {
        type: 'boolean',
        "default": false,
        description: 'Disable the 10 second execution timeout'
      },
      projectConfigFile: {
        type: 'string',
        "default": '',
        description: 'flake config file relative path from project (e.g. tox.ini or .flake8rc)'
      },
      maxLineLength: {
        type: 'integer',
        "default": 0
      },
      ignoreErrorCodes: {
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      maxComplexity: {
        description: 'McCabe complexity threshold (`-1` to disable)',
        type: 'integer',
        "default": -1
      },
      hangClosing: {
        type: 'boolean',
        "default": false
      },
      selectErrors: {
        description: 'input "E, W" to include all errors/warnings',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      pep8ErrorsToWarnings: {
        description: 'Convert pycodestyle "E" messages to linter warnings',
        type: 'boolean',
        "default": false
      },
      flakeErrors: {
        description: 'Convert Flake "F" messages to linter errors',
        type: 'boolean',
        "default": false
      }
    },
    activate: function() {
      require('atom-package-deps').install();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('linter-flake8.disableTimeout', (function(_this) {
        return function(disableTimeout) {
          return _this.disableTimeout = disableTimeout;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    getProjDir: function(file) {
      return atom.project.relativizePath(file)[0];
    },
    getProjName: function(projDir) {
      return path.basename(projDir);
    },
    applySubstitutions: function(execPath, projDir) {
      var p, projectName, _i, _len, _ref;
      projectName = this.getProjName(projDir);
      execPath = execPath.replace(/\$PROJECT_NAME/i, projectName);
      execPath = execPath.replace(/\$PROJECT/i, projDir);
      _ref = execPath.split(';');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (fs.existsSync(p)) {
          return p;
        }
      }
      return execPath;
    },
    provideLinter: function() {
      var helpers, provider;
      helpers = require('atom-linter');
      return provider = {
        name: 'Flake8',
        grammarScopes: ['source.python', 'source.python.django'],
        scope: 'file',
        lintOnFly: true,
        lint: (function(_this) {
          return function(textEditor) {
            var configFilePath, cwd, execPath, filePath, fileText, flakeerr, ignoreErrorCodes, maxComplexity, maxLineLength, options, parameters, projDir, projectConfigFile, projectPath, pycodestyleWarn, selectErrors;
            filePath = textEditor.getPath();
            fileText = textEditor.getText();
            parameters = ['--format=default'];
            if ((projectConfigFile = atom.config.get('linter-flake8.projectConfigFile')) && (projectPath = atom.project.relativizePath(filePath)[0]) && (configFilePath = helpers.findCached(projectPath, projectConfigFile.split(/[ ,]+/)))) {
              parameters.push('--config', configFilePath);
            } else {
              if (maxLineLength = atom.config.get('linter-flake8.maxLineLength')) {
                parameters.push('--max-line-length', maxLineLength);
              }
              if ((ignoreErrorCodes = atom.config.get('linter-flake8.ignoreErrorCodes')).length) {
                parameters.push('--ignore', ignoreErrorCodes.join(','));
              }
              if (maxComplexity = atom.config.get('linter-flake8.maxComplexity')) {
                parameters.push('--max-complexity', maxComplexity);
              }
              if (atom.config.get('linter-flake8.hangClosing')) {
                parameters.push('--hang-closing');
              }
              if ((selectErrors = atom.config.get('linter-flake8.selectErrors')).length) {
                parameters.push('--select', selectErrors.join(','));
              }
            }
            parameters.push('-');
            fs = require('fs-plus');
            pycodestyleWarn = atom.config.get('linter-flake8.pep8ErrorsToWarnings');
            flakeerr = atom.config.get('linter-flake8.flakeErrors');
            projDir = _this.getProjDir(filePath) || path.dirname(filePath);
            execPath = fs.normalize(_this.applySubstitutions(atom.config.get('linter-flake8.executablePath'), projDir));
            cwd = path.dirname(textEditor.getPath());
            options = {
              stdin: fileText,
              cwd: cwd,
              stream: 'both'
            };
            if (_this.disableTimeout) {
              options.timeout = Infinity;
            }
            return helpers.exec(execPath, parameters, options).then(function(result) {
              var col, isErr, line, match, regex, toReturn;
              if (result.stderr && result.stderr.length && atom.inDevMode()) {
                console.log('flake8 stderr: ' + result.stderr);
              }
              toReturn = [];
              regex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;
              while ((match = regex.exec(result.stdout)) !== null) {
                line = parseInt(match[1]) || 0;
                col = parseInt(match[2]) || 0;
                isErr = match[4] === 'E' && !pycodestyleWarn || match[4] === 'F' && flakeerr;
                toReturn.push({
                  type: isErr ? 'Error' : 'Warning',
                  text: match[3] + ' — ' + match[5],
                  filePath: filePath,
                  range: extractRange({
                    code: match[3],
                    message: match[5],
                    lineNumber: line - 1,
                    colNumber: col,
                    textEditor: textEditor
                  })
                });
              }
              return toReturn;
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZmxha2U4L2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnRUFBQTtJQUFBO3NCQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsU0FBQyxVQUFELEVBQWEsVUFBYixHQUFBO0FBRXBCLFFBQUEsV0FBQTtBQUFBLElBQUEsSUFBSSxVQUFVLENBQUMsY0FBWCxDQUEwQixlQUExQixDQUFKO0FBR0UsTUFBQSxXQUFBLEdBQWMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxlQUF2QyxDQUhGO0tBQUEsTUFBQTtBQUtFLE1BQUEsV0FBQSxHQUFjLFVBQVUsQ0FBQyxlQUF6QixDQUxGO0tBQUE7V0FNQSxXQUFXLENBQUMsbUJBQVosQ0FBZ0MsVUFBaEMsRUFSb0I7RUFBQSxDQUF0QixDQUFBOztBQUFBLEVBU0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBVEwsQ0FBQTs7QUFBQSxFQVVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQVZQLENBQUE7O0FBQUEsRUFXQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBWEQsQ0FBQTs7QUFBQSxFQWFBLFlBQUEsR0FBZSxTQUFDLElBQUQsR0FBQTtBQUNiLFFBQUEsME9BQUE7QUFBQSxJQURlLFlBQUEsTUFBTSxlQUFBLFNBQVMsa0JBQUEsWUFBWSxpQkFBQSxXQUFXLGtCQUFBLFVBQ3JELENBQUE7QUFBQSxZQUFPLElBQVA7QUFBQSxXQUNPLE1BRFA7QUFJSSxRQUFBLE1BQUEsR0FBUyx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixPQUE3QixDQUFzQyxDQUFBLENBQUEsQ0FBL0MsQ0FBQTtBQUNBLGVBQU0sSUFBTixHQUFBO0FBQ0UsVUFBQSxNQUFBLEdBQVMsQ0FBVCxDQUFBO0FBQUEs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

//# sourceURL=/home/alisaleemh/.atom/packages/linter-flake8/lib/main.coffee
