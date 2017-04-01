(function() {
  var Beautifier, Promise, fs, path, readFile, spawn, temp, which, _;

  Promise = require('bluebird');

  _ = require('lodash');

  fs = require('fs');

  temp = require('temp').track();

  readFile = Promise.promisify(fs.readFile);

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  module.exports = Beautifier = (function() {

    /*
    Promise
     */
    Beautifier.prototype.Promise = Promise;


    /*
    Name of Beautifier
     */

    Beautifier.prototype.name = 'Beautifier';


    /*
    Supported Options
    
    Enable options for supported languages.
    - <string:language>:<boolean:all_options_enabled>
    - <string:language>:<string:option_key>:<boolean:enabled>
    - <string:language>:<string:option_key>:<string:rename>
    - <string:language>:<string:option_key>:<function:transform>
    - <string:language>:<string:option_key>:<array:mapper>
     */

    Beautifier.prototype.options = {};


    /*
    Supported languages by this Beautifier
    
    Extracted from the keys of the `options` field.
     */

    Beautifier.prototype.languages = null;


    /*
    Beautify text
    
    Override this method in subclasses
     */

    Beautifier.prototype.beautify = null;


    /*
    Show deprecation warning to user.
     */

    Beautifier.prototype.deprecate = function(warning) {
      var _ref;
      return (_ref = atom.notifications) != null ? _ref.addWarning(warning) : void 0;
    };


    /*
    Create temporary file
     */

    Beautifier.prototype.tempFile = function(name, contents, ext) {
      if (name == null) {
        name = "atom-beautify-temp";
      }
      if (contents == null) {
        contents = "";
      }
      if (ext == null) {
        ext = "";
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return temp.open({
            prefix: name,
            suffix: ext
          }, function(err, info) {
            _this.debug('tempFile', name, err, info);
            if (err) {
              return reject(err);
            }
            return fs.write(info.fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(info.fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(info.path);
              });
            });
          });
        };
      })(this));
    };


    /*
    Read file
     */

    Beautifier.prototype.readFile = function(filePath) {
      return Promise.resolve(filePath).then(function(filePath) {
        return readFile(filePath, "utf8");
      });
    };


    /*
    Find file
     */

    Beautifier.prototype.findFile = function(startDir, fileNames) {
      var currentDir, fileName, filePath, _i, _len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (_i = 0, _len = fileNames.length; _i < _len; _i++) {
          fileName = fileNames[_i];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (_error) {}
        }
        startDir.pop();
      }
      return null;
    };


    /*
    If platform is Windows
     */

    Beautifier.prototype.isWindows = (function() {
      return new RegExp('^win').test(process.platform);
    })();


    /*
    Get Shell Environment variables
    
    Special thank you to @ioquatix
    See https://github.com/ioquatix/script-runner/blob/v1.5.0/lib/script-runner.coffee#L45-L63
     */

    Beautifier.prototype._envCache = null;

    Beautifier.prototype._envCacheDate = null;

    Beautifier.prototype._envCacheExpiry = 10000;

    Beautifier.prototype.getShellEnvironment = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var buffer, child;
          if ((_this._envCache != null) && (_this._envCacheDate != null)) {
            if ((new Date() - _this._envCacheDate) < _this._envCacheExpiry) {
              return resolve(_this._envCache);
            }
          }
          if (_this.isWindows) {
            return resolve(process.env);
          } else {
            child = spawn(process.env.SHELL, ['-ilc', 'env'], {
              detached: true,
              stdio: ['ignore', 'pipe', process.stderr]
            });
            buffer = '';
            child.stdout.on('data', function(data) {
              return buffer += data;
            });
            return child.on('close', function(code, signal) {
              var definition, environment, key, value, _i, _len, _ref, _ref1;
              if (code !== 0) {
                return reject(new Error("Could not get Shell Environment. Exit code: " + code + ", Signal: " + signal));
              }
              environment = {};
              _ref = buffer.split('\n');
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                definition = _ref[_i];
                _ref1 = definition.split('=', 2), key = _ref1[0], value = _ref1[1];
                if (key !== '') {
                  environment[key] = value;
                }
              }
              _this._envCache = environment;
              _this._envCacheDate = new Date();
              return resolve(environment);
            });
          }
        };
      })(this));
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Beautifier.prototype.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      return this.getShellEnvironment().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, _ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows) {
              if (!options.path) {
                for (i in env) {
                  if (i.toLowerCase() === "path") {
                    options.path = env[i];
                    break;
                  }
                }
              }
              if (options.pathExt == null) {
                options.pathExt = "" + ((_ref = process.env.PATHEXT) != null ? _ref : '.EXE') + ";";
              }
            }
            return which(exe, options, function(err, path) {
              if (err) {
                resolve(exe);
              }
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Beautifier.prototype.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, issueSearchLink, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          helpStr = "See " + help.link + " for program installation instructions.\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          if (help.additional) {
            helpStr += help.additional;
          }
          issueSearchLink = "https://github.com/Glavin001/atom-beautify/search?q=" + exe + "&type=Issues";
          docsLink = "https://github.com/Glavin001/atom-beautify/tree/master/docs";
          helpStr += "Your program is properly installed if running '" + (this.isWindows ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable. If this does not work then you have not installed the program correctly and so Atom Beautify will not find the program. Atom Beautify requires that the program be found in your PATH environment variable. \nNote that this is not an Atom Beautify issue if beautification does not work and the above command also does not work: this is expected behaviour, since you have not properly installed your program. Please properly setup the program and search through existing Atom Beautify issues before creating a new issue. See " + issueSearchLink + " for related Issues and " + docsLink + " for documentation. If you are still unable to resolve this issue on your own then please create a new issue and ask for help.\n";
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };


    /*
    Run command-line interface command
     */

    Beautifier.prototype.run = function(executable, args, _arg) {
      var cwd, help, ignoreReturnCode, onStdin, _ref;
      _ref = _arg != null ? _arg : {}, cwd = _ref.cwd, ignoreReturnCode = _ref.ignoreReturnCode, help = _ref.help, onStdin = _ref.onStdin;
      args = _.flatten(args);
      return Promise.all([executable, Promise.all(args)]).then((function(_this) {
        return function(_arg1) {
          var args, exeName;
          exeName = _arg1[0], args = _arg1[1];
          _this.debug('exeName, args:', exeName, args);
          return Promise.all([exeName, args, _this.getShellEnvironment(), _this.which(exeName)]);
        };
      })(this)).then((function(_this) {
        return function(_arg1) {
          var args, env, exe, exeName, exePath, options;
          exeName = _arg1[0], args = _arg1[1], env = _arg1[2], exePath = _arg1[3];
          _this.debug('exePath, env:', exePath, env);
          _this.debug('args', args);
          exe = exePath != null ? exePath : exeName;
          options = {
            cwd: cwd,
            env: env
          };
          return _this.spawn(exe, args, options, onStdin).then(function(_arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = _arg2.returnCode, stdout = _arg2.stdout, stderr = _arg2.stderr;
            _this.verbose('spawn result', returnCode, stdout, stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr);
              }
            } else {
              return stdout;
            }
          })["catch"](function(err) {
            _this.debug('error', err);
            if (err.code === 'ENOENT' || err.errno === 'ENOENT') {
              throw _this.commandNotFoundError(exeName, help);
            } else {
              throw err;
            }
          });
        };
      })(this));
    };


    /*
    Spawn
     */

    Beautifier.prototype.spawn = function(exe, args, options, onStdin) {
      args = _.without(args, void 0);
      args = _.without(args, null);
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var cmd, stderr, stdout;
          _this.debug('spawn', exe, args);
          cmd = spawn(exe, args, options);
          stdout = "";
          stderr = "";
          cmd.stdout.on('data', function(data) {
            return stdout += data;
          });
          cmd.stderr.on('data', function(data) {
            return stderr += data;
          });
          cmd.on('close', function(returnCode) {
            _this.debug('spawn done', returnCode, stderr, stdout);
            return resolve({
              returnCode: returnCode,
              stdout: stdout,
              stderr: stderr
            });
          });
          cmd.on('error', function(err) {
            _this.debug('error', err);
            return reject(err);
          });
          if (onStdin) {
            return onStdin(cmd.stdin);
          }
        };
      })(this));
    };


    /*
    Logger instance
     */

    Beautifier.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Beautifier.prototype.setupLogger = function() {
      var key, method, _ref;
      this.logger = require('../logger')(__filename);
      _ref = this.logger;
      for (key in _ref) {
        method = _ref[key];
        this[key] = method;
      }
      return this.verbose("" + this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, _ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          _ref = this.options;
          for (lang in _ref) {
            options = _ref[lang];
            if (typeof options === "boolean") {
              if (options === true) {
                this.options[lang] = globalOptions;
              }
            } else if (typeof options === "object") {
              this.options[lang] = _.merge(globalOptions, options);
            } else {
              this.warn(("Unsupported options type " + (typeof options) + " for language " + lang + ": ") + options);
            }
          }
        }
      }
      this.verbose("Options for " + this.name + ":", this.options);
      this.languages = _.keys(this.options);
    }

    return Beautifier;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9iZWF1dGlmaWVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4REFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQUFWLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FESixDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsS0FBaEIsQ0FBQSxDQUhQLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsRUFBRSxDQUFDLFFBQXJCLENBSlgsQ0FBQTs7QUFBQSxFQUtBLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUixDQUxSLENBQUE7O0FBQUEsRUFNQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQyxLQU5qQyxDQUFBOztBQUFBLEVBT0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBUFAsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBRXJCO0FBQUE7O09BQUE7QUFBQSx5QkFHQSxPQUFBLEdBQVMsT0FIVCxDQUFBOztBQUtBO0FBQUE7O09BTEE7O0FBQUEseUJBUUEsSUFBQSxHQUFNLFlBUk4sQ0FBQTs7QUFVQTtBQUFBOzs7Ozs7Ozs7T0FWQTs7QUFBQSx5QkFvQkEsT0FBQSxHQUFTLEVBcEJULENBQUE7O0FBc0JBO0FBQUE7Ozs7T0F0QkE7O0FBQUEseUJBMkJBLFNBQUEsR0FBVyxJQTNCWCxDQUFBOztBQTZCQTtBQUFBOzs7O09BN0JBOztBQUFB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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/beautifier.coffee
