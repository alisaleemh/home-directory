Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomLinter = require('atom-linter');

var helpers = _interopRequireWildcard(_atomLinter);

// Local variables
'use babel';var parseRegex = /(\d+):(\d+):\s(([A-Z])\d{2,3})\s+(.*)/g;

var applySubstitutions = function applySubstitutions(givenExecPath, projDir) {
  var execPath = givenExecPath;
  var projectName = _path2['default'].basename(projDir);
  execPath = execPath.replace(/\$PROJECT_NAME/ig, projectName);
  execPath = execPath.replace(/\$PROJECT/ig, projDir);
  var paths = execPath.split(';');
  for (var i = 0; i < paths.length; i += 1) {
    if (_fsPlus2['default'].existsSync(paths[i])) {
      return paths[i];
    }
  }
  return execPath;
};

var getVersionString = _asyncToGenerator(function* (versionPath) {
  if (!Object.hasOwnProperty.call(getVersionString, 'cache')) {
    getVersionString.cache = new Map();
  }
  if (!getVersionString.cache.has(versionPath)) {
    getVersionString.cache.set(versionPath, (yield helpers.exec(versionPath, ['--version'])));
  }
  return getVersionString.cache.get(versionPath);
});

var generateInvalidPointTrace = _asyncToGenerator(function* (execPath, match, filePath, textEditor, point) {
  var flake8Version = yield getVersionString(execPath);
  var issueURL = 'https://github.com/AtomLinter/linter-flake8/issues/new';
  var title = encodeURIComponent('Flake8 rule \'' + match[3] + '\' reported an invalid point');
  var body = encodeURIComponent(['Flake8 reported an invalid point for the rule `' + match[3] + '`, ' + ('with the messge `' + match[5] + '`.'), '', '', '<!-- If at all possible, please include code that shows this issue! -->', '', '', 'Debug information:', 'Atom version: ' + atom.getVersion(), 'Flake8 version: `' + flake8Version + '`'].join('\n'));
  var newIssueURL = issueURL + '?title=' + title + '&body=' + body;
  return {
    type: 'Error',
    severity: 'error',
    html: 'ERROR: Flake8 provided an invalid point! See the trace for details. ' + ('<a href="' + newIssueURL + '">Report this!</a>'),
    filePath: filePath,
    range: helpers.rangeFromLineNumber(textEditor, 0),
    trace: [{
      type: 'Trace',
      text: 'Original message: ' + match[3] + ' — ' + match[5],
      filePath: filePath,
      severity: 'info'
    }, {
      type: 'Trace',
      text: 'Requested point: ' + (point.line + 1) + ':' + (point.col + 1),
      filePath: filePath,
      severity: 'info'
    }]
  };
});

exports['default'] = {
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install('linter-flake8');

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-flake8.disableTimeout', function (value) {
      _this.disableTimeout = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.projectConfigFile', function (value) {
      _this.projectConfigFile = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.maxLineLength', function (value) {
      _this.maxLineLength = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.ignoreErrorCodes', function (value) {
      _this.ignoreErrorCodes = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.maxComplexity', function (value) {
      _this.maxComplexity = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.selectErrors', function (value) {
      _this.selectErrors = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.hangClosing', function (value) {
      _this.hangClosing = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.executablePath', function (value) {
      _this.executablePath = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.pycodestyleErrorsToWarnings', function (value) {
      _this.pycodestyleErrorsToWarnings = value;
    }));
    this.subscriptions.add(atom.config.observe('linter-flake8.flakeErrors', function (value) {
      _this.flakeErrors = value;
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'Flake8',
      grammarScopes: ['source.python', 'source.python.django'],
      scope: 'file',
      lintOnFly: true,
      lint: _asyncToGenerator(function* (textEditor) {
        var filePath = textEditor.getPath();
        var fileText = textEditor.getText();

        var parameters = ['--format=default'];

        var projectPath = atom.project.relativizePath(filePath)[0];
        var baseDir = projectPath !== null ? projectPath : _path2['default'].dirname(filePath);
        var configFilePath = yield helpers.findCachedAsync(baseDir, _this2.projectConfigFile);

        if (_this2.projectConfigFile && baseDir !== null && configFilePath !== null) {
          parameters.push('--config', configFilePath);
        } else {
          if (_this2.maxLineLength) {
            parameters.push('--max-line-length', _this2.maxLineLength);
          }
          if (_this2.ignoreErrorCodes.length) {
            parameters.push('--ignore', _this2.ignoreErrorCodes.join(','));
          }
          if (_this2.maxComplexity) {
            parameters.push('--max-complexity', _this2.maxComplexity);
          }
          if (_this2.hangClosing) {
            parameters.push('--hang-closing');
          }
          if (_this2.selectErrors.length) {
            parameters.push('--select', _this2.selectErrors.join(','));
          }
        }

        parameters.push('-');

        var execPath = _fsPlus2['default'].normalize(applySubstitutions(_this2.executablePath, baseDir));
        var options = {
          stdin: fileText,
          cwd: _path2['default'].dirname(textEditor.getPath()),
          stream: 'both'
        };
        if (_this2.disableTimeout) {
          options.timeout = Infinity;
        }

        var result = yield helpers.exec(execPath, parameters, options);

        if (textEditor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }

        if (result.stderr && result.stderr.length && atom.inDevMode()) {
          // eslint-disable-next-line no-console
          console.log('flake8 stderr: ' + result.stderr);
        }
        var messages = [];

        var match = parseRegex.exec(result.stdout);
        while (match !== null) {
          // Note that these positions are being converted to 0-indexed
          var line = Number.parseInt(match[1], 10) - 1 || 0;
          var col = Number.parseInt(match[2], 10) - 1 || undefined;

          var isErr = match[4] === 'E' && !_this2.pycodestyleErrorsToWarnings || match[4] === 'F' && _this2.flakeErrors;

          try {
            messages.push({
              type: isErr ? 'Error' : 'Warning',
              text: match[3] + ' — ' + match[5],
              filePath: filePath,
              range: helpers.rangeFromLineNumber(textEditor, line, col)
            });
          } catch (point) {
            // rangeFromLineNumber encountered an invalid point
            messages.push(generateInvalidPointTrace(execPath, match, filePath, textEditor, point));
          }

          match = parseRegex.exec(result.stdout);
        }
        // Ensure that any invalid point messages have finished resolving
        return Promise.all(messages);
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLWZsYWtlOC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBR29DLE1BQU07O3NCQUMzQixTQUFTOzs7O29CQUNQLE1BQU07Ozs7MEJBQ0UsYUFBYTs7SUFBMUIsT0FBTzs7O0FBTm5CLFdBQVcsQ0FBQyxBQVNaLElBQU0sVUFBVSxHQUFHLHdDQUF3QyxDQUFDOztBQUU1RCxJQUFNLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFJLGFBQWEsRUFBRSxPQUFPLEVBQUs7QUFDckQsTUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDO0FBQzdCLE1BQU0sV0FBVyxHQUFHLGtCQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQyxVQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUM3RCxVQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDcEQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3hDLFFBQUksb0JBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzNCLGFBQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0dBQ0Y7QUFDRCxTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztBQUVGLElBQU0sZ0JBQWdCLHFCQUFHLFdBQU8sV0FBVyxFQUFLO0FBQzlDLE1BQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUMxRCxv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Q0FBQyxDQUFDLFdBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxBQUFFO0FBQ2pDLHNCQUFRLEVBQVIsUUFBUTtBQUNSLG1CQUFLLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO2FBQzFELENBQUMsQ0FBQztXQUNKLENBQUMsT0FBTyxLQUFLLEVBQUU7O0FBRWQsb0JBQVEsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQ3JDLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1dBQ2xEOztBQUVELGVBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN4Qzs7QUFFRCxlQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDOUIsQ0FBQTtLQUNGLENBQUM7R0FDSDtDQUNGIiwiZmlsZSI6Ii9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLWZsYWtlOC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L2V4dGVuc2lvbnMsIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJ2F0b20tbGludGVyJztcblxuLy8gTG9jYWwgdmFyaWFibGVzXG5jb25zdCBwYXJzZVJlZ2V4ID0gLyhcXGQrKTooXFxkKyk6XFxzKChbQS1aXSlcXGR7MiwzfSlcXHMrKC4qKS9nO1xuXG5jb25zdCBhcHBseVN1YnN0aXR1dGlvbnMgPSAoZ2l2ZW5FeGVjUGF0aCwgcHJvakRpcikgPT4ge1xuICBsZXQgZXhlY1BhdGggPSBnaXZlbkV4ZWNQYXRoO1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHBhdGguYmFzZW5hbWUocHJvakRpcik7XG4gIGV4ZWNQYXRoID0gZXhlY1BhdGgucmVwbGFjZSgvXFwkUFJPSkVDVF9OQU1FL2lnLCBwcm9qZWN0TmFtZSk7XG4gIGV4ZWNQYXRoID0gZXhlY1BhdGgucmVwbGFjZSgvXFwkUFJPSkVDVC9pZywgcHJvakRpcik7XG4gIGNvbnN0IHBhdGhzID0gZXhlY1BhdGguc3BsaXQoJzsnKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGhzW2ldKSkge1xuICAgICAgcmV0dXJuIHBhdGhzW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZXhlY1BhdGg7XG59O1xuXG5jb25zdCBnZXRWZXJzaW9uU3RyaW5nID0gYXN5bmMgKHZlcnNpb25QYXRoKSA9PiB7XG4gIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoZ2V0VmVyc2lvblN0cmluZywgJ2NhY2hlJykpIHtcbiAgICBnZXRWZXJzaW9uU3RyaW5nLmNhY2hlID0gbmV3IE1hcCgpO1xuICB9XG4gIGlmICghZ2V0VmVyc2lvblN0cmluZy5jYWNoZS5oYXModmVyc2lvblBhdGgpKSB7XG4gICAgZ2V0VmVyc2lvblN0cmluZy5jYWNoZS5zZXQodmVyc2lvblBhdGgsXG4gICAgICBhd2FpdCBoZWxwZXJzLmV4ZWModmVyc2lvblBhdGgsIFsnLS12ZXJzaW9uJ10pKTtcbiAgfVxuICByZXR1cm4gZ2V0VmVyc2lvblN0cmluZy5jYWNoZS5nZXQodmVyc2lvblBhdGgpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVJbnZhbGlkUG9pbnRUcmFjZSA9IGFzeW5jIChleGVjUGF0aCwgbWF0Y2gsIGZpbGVQYXRoLCB0ZXh0RWRpdG9yLCBwb2ludCkgPT4ge1xuICBjb25zdCBmbGFrZThWZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvblN0cmluZyhleGVjUGF0aCk7XG4gIGNvbnN0IGlzc3VlVVJMID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9BdG9tTGludGVyL2xpbnRlci1mbGFrZTgvaXNzdWVzL25ldyc7XG4gIGNvbnN0IHRpdGxlID0gZW5jb2RlVVJJQ29tcG9uZW50KGBGbGFrZTggcnVsZSAnJHttYXRjaFszXX0nIHJlcG9ydGVkIGFuIGludmFsaWQgcG9pbnRgKTtcbiAgY29uc3QgYm9keSA9IGVuY29kZVVSSUNvbXBvbmVudChbXG4gICAgYEZsYWtlOCByZXBvcnRlZCBhbiBpbnZhbGlkIHBvaW50IGZvciB0aGUgcnVsZSBcXGAke21hdGNoWzNdfVxcYCwgYCArXG4gICAgYHdpdGggdGhlIG1lc3NnZSBcXGAke21hdGNoWzVdfVxcYC5gLFxuICAgICcnLCAnJyxcbiAgICAnPCEtLSBJZiBhdCBhbGwgcG9zc2libGUsIHBsZWFzZSBpbmNsdWRlIGNvZGUgdGhhdCBzaG93cyB0aGlzIGlzc3VlISAtLT4nLFxuICAgICcnLCAnJyxcbiAgICAnRGVidWcgaW5mb3JtYXRpb246JyxcbiAgICBgQXRvbSB2ZXJzaW9uOiAke2F0b20uZ2V0VmVyc2lvbigpfWAsXG4gICAgYEZsYWtlOCB2ZXJzaW9uOiBcXGAke2ZsYWtlOFZlcnNpb259XFxgYCxcbiAgXS5qb2luKCdcXG4nKSk7XG4gIGNvbnN0IG5ld0lzc3VlVVJMID0gYCR7aXNzdWVVUkx9P3RpdGxlPSR7dGl0bGV9JmJvZHk9JHtib2R5fWA7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0Vycm9yJyxcbiAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICBodG1sOiAnRVJST1I6IEZsYWtlOCBwcm92aWRlZCBhbiBpbnZhbGlkIHBvaW50ISBTZWUgdGhlIHRyYWNlIGZvciBkZXRhaWxzLiAnICtcbiAgICAgIGA8YSBocmVmPVwiJHtuZXdJc3N1ZVVSTH1cIj5SZXBvcnQgdGhpcyE8L2E+YCxcbiAgICBmaWxlUGF0aCxcbiAgICByYW5nZTogaGVscGVycy5yYW5nZUZyb21MaW5lTnVtYmVyKHRleHRFZGl0b3IsIDApLFxuICAgIHRyYWNlOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdUcmFjZScsXG4gICAgICAgIHRleHQ6IGBPcmlnaW5hbCBtZXNzYWdlOiAke21hdGNoWzNdfSDigJQgJHttYXRjaFs1XX1gLFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdUcmFjZScsXG4gICAgICAgIHRleHQ6IGBSZXF1ZXN0ZWQgcG9pbnQ6ICR7cG9pbnQubGluZSArIDF9OiR7cG9pbnQuY29sICsgMX1gLFxuICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdsaW50ZXItZmxha2U4Jyk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LmRpc2FibGVUaW1lb3V0JywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzYWJsZVRpbWVvdXQgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTgucHJvamVjdENvbmZpZ0ZpbGUnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9qZWN0Q29uZmlnRmlsZSA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5tYXhMaW5lTGVuZ3RoJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMubWF4TGluZUxlbmd0aCA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5pZ25vcmVFcnJvckNvZGVzJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuaWdub3JlRXJyb3JDb2RlcyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5tYXhDb21wbGV4aXR5JywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMubWF4Q29tcGxleGl0eSA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5zZWxlY3RFcnJvcnMnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RFcnJvcnMgPSB2YWx1ZTtcbiAgICAgIH0pLFxuICAgICk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1mbGFrZTguaGFuZ0Nsb3NpbmcnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5oYW5nQ2xvc2luZyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5leGVjdXRhYmxlUGF0aCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmV4ZWN1dGFibGVQYXRoID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItZmxha2U4LnB5Y29kZXN0eWxlRXJyb3JzVG9XYXJuaW5ncycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnB5Y29kZXN0eWxlRXJyb3JzVG9XYXJuaW5ncyA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWZsYWtlOC5mbGFrZUVycm9ycycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmZsYWtlRXJyb3JzID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICApO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnRmxha2U4JyxcbiAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLnB5dGhvbicsICdzb3VyY2UucHl0aG9uLmRqYW5nbyddLFxuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgIGxpbnQ6IGFzeW5jICh0ZXh0RWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG5cbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IFsnLS1mb3JtYXQ9ZGVmYXVsdCddO1xuXG4gICAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXTtcbiAgICAgICAgY29uc3QgYmFzZURpciA9IHByb2plY3RQYXRoICE9PSBudWxsID8gcHJvamVjdFBhdGggOiBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBjb25maWdGaWxlUGF0aCA9IGF3YWl0IGhlbHBlcnMuZmluZENhY2hlZEFzeW5jKGJhc2VEaXIsIHRoaXMucHJvamVjdENvbmZpZ0ZpbGUpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb2plY3RDb25maWdGaWxlICYmIGJhc2VEaXIgIT09IG51bGwgJiYgY29uZmlnRmlsZVBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tY29uZmlnJywgY29uZmlnRmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLm1heExpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMucHVzaCgnLS1tYXgtbGluZS1sZW5ndGgnLCB0aGlzLm1heExpbmVMZW5ndGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5pZ25vcmVFcnJvckNvZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWlnbm9yZScsIHRoaXMuaWdub3JlRXJyb3JDb2Rlcy5qb2luKCcsJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5tYXhDb21wbGV4aXR5KSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tbWF4LWNvbXBsZXhpdHknLCB0aGlzLm1heENvbXBsZXhpdHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5oYW5nQ2xvc2luZykge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5wdXNoKCctLWhhbmctY2xvc2luZycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5zZWxlY3RFcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0tc2VsZWN0JywgdGhpcy5zZWxlY3RFcnJvcnMuam9pbignLCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbWV0ZXJzLnB1c2goJy0nKTtcblxuICAgICAgICBjb25zdCBleGVjUGF0aCA9IGZzLm5vcm1hbGl6ZShhcHBseVN1YnN0aXR1dGlvbnModGhpcy5leGVjdXRhYmxlUGF0aCwgYmFzZURpcikpO1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIHN0ZGluOiBmaWxlVGV4dCxcbiAgICAgICAgICBjd2Q6IHBhdGguZGlybmFtZSh0ZXh0RWRpdG9yLmdldFBhdGgoKSksXG4gICAgICAgICAgc3RyZWFtOiAnYm90aCcsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVUaW1lb3V0KSB7XG4gICAgICAgICAgb3B0aW9ucy50aW1lb3V0ID0gSW5maW5pdHk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBoZWxwZXJzLmV4ZWMoZXhlY1BhdGgsIHBhcmFtZXRlcnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0ZXh0RWRpdG9yLmdldFRleHQoKSAhPT0gZmlsZVRleHQpIHtcbiAgICAgICAgICAvLyBFZGl0b3IgY29udGVudHMgaGF2ZSBjaGFuZ2VkLCB0ZWxsIExpbnRlciBub3QgdG8gdXBkYXRlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LnN0ZGVyciAmJiByZXN1bHQuc3RkZXJyLmxlbmd0aCAmJiBhdG9tLmluRGV2TW9kZSgpKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZmxha2U4IHN0ZGVycjogJHtyZXN1bHQuc3RkZXJyfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgbGV0IG1hdGNoID0gcGFyc2VSZWdleC5leGVjKHJlc3VsdC5zdGRvdXQpO1xuICAgICAgICB3aGlsZSAobWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhlc2UgcG9zaXRpb25zIGFyZSBiZWluZyBjb252ZXJ0ZWQgdG8gMC1pbmRleGVkXG4gICAgICAgICAgY29uc3QgbGluZSA9IE51bWJlci5wYXJzZUludChtYXRjaFsxXSwgMTApIC0gMSB8fCAwO1xuICAgICAgICAgIGNvbnN0IGNvbCA9IE51bWJlci5wYXJzZUludChtYXRjaFsyXSwgMTApIC0gMSB8fCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICBjb25zdCBpc0VyciA9IChtYXRjaFs0XSA9PT0gJ0UnICYmICF0aGlzLnB5Y29kZXN0eWxlRXJyb3JzVG9XYXJuaW5ncylcbiAgICAgICAgICAgIHx8IChtYXRjaFs0XSA9PT0gJ0YnICYmIHRoaXMuZmxha2VFcnJvcnMpO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgICB0eXBlOiBpc0VyciA/ICdFcnJvcicgOiAnV2FybmluZycsXG4gICAgICAgICAgICAgIHRleHQ6IGAke21hdGNoWzNdfSDigJQgJHttYXRjaFs1XX1gLFxuICAgICAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgcmFuZ2U6IGhlbHBlcnMucmFuZ2VGcm9tTGluZU51bWJlcih0ZXh0RWRpdG9yLCBsaW5lLCBjb2wpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaCAocG9pbnQpIHtcbiAgICAgICAgICAgIC8vIHJhbmdlRnJvbUxpbmVOdW1iZXIgZW5jb3VudGVyZWQgYW4gaW52YWxpZCBwb2ludFxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChnZW5lcmF0ZUludmFsaWRQb2ludFRyYWNlKFxuICAgICAgICAgICAgICBleGVjUGF0aCwgbWF0Y2gsIGZpbGVQYXRoLCB0ZXh0RWRpdG9yLCBwb2ludCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1hdGNoID0gcGFyc2VSZWdleC5leGVjKHJlc3VsdC5zdGRvdXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IGFueSBpbnZhbGlkIHBvaW50IG1lc3NhZ2VzIGhhdmUgZmluaXNoZWQgcmVzb2x2aW5nXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChtZXNzYWdlcyk7XG4gICAgICB9LFxuICAgIH07XG4gIH0sXG59O1xuIl19