
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  The main terminal view class, which does the most of all the work.
 */

(function() {
  var $, ATPCommandFinderView, ATPCommandsBuiltins, ATPCore, ATPOutputView, ATPVariablesBuiltins, TextEditorView, View, ansihtml, dirname, exec, execSync, extname, fs, iconv, lastOpenedView, os, resolve, sep, spawn, stream, _ref, _ref1, _ref2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  lastOpenedView = null;

  fs = include('fs');

  os = include('os');

  _ref = include('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  _ref1 = include('child_process'), spawn = _ref1.spawn, exec = _ref1.exec, execSync = _ref1.execSync;

  _ref2 = include('path'), resolve = _ref2.resolve, dirname = _ref2.dirname, extname = _ref2.extname, sep = _ref2.sep;

  ansihtml = include('ansi-html-stream');

  stream = include('stream');

  iconv = include('iconv-lite');

  ATPCommandFinderView = include('atp-command-finder');

  ATPCore = include('atp-core');

  ATPCommandsBuiltins = include('atp-builtins-commands');

  ATPVariablesBuiltins = include('atp-builtins-variables');

  window.$ = window.jQuery = $;

  include('jquery-autocomplete-js');

  module.exports = ATPOutputView = (function(_super) {
    __extends(ATPOutputView, _super);

    function ATPOutputView() {
      this.spawn = __bind(this.spawn, this);
      this.flashIconClass = __bind(this.flashIconClass, this);
      this.parseSpecialStringTemplate = __bind(this.parseSpecialStringTemplate, this);
      return ATPOutputView.__super__.constructor.apply(this, arguments);
    }

    ATPOutputView.prototype.cwd = null;

    ATPOutputView.prototype.streamsEncoding = 'iso-8859-3';

    ATPOutputView.prototype._cmdintdel = 50;

    ATPOutputView.prototype.echoOn = true;

    ATPOutputView.prototype.redirectOutput = '';

    ATPOutputView.prototype.specsMode = false;

    ATPOutputView.prototype.inputLine = 0;

    ATPOutputView.prototype.helloMessageShown = false;

    ATPOutputView.prototype.minHeight = 250;

    ATPOutputView.prototype.util = include('atp-terminal-util');

    ATPOutputView.prototype.currentInputBox = null;

    ATPOutputView.prototype.currentInputBox = null;

    ATPOutputView.prototype.currentInputBoxTmr = null;

    ATPOutputView.prototype.volatileSuggestions = [];

    ATPOutputView.prototype.disposables = {
      dispose: function(field) {
        var a, i, _i, _ref3, _results;
        if (ATPOutputView[field] == null) {
          ATPOutputView[field] = [];
        }
        a = ATPOutputView[field];
        _results = [];
        for (i = _i = 0, _ref3 = a.length - 1; _i <= _ref3; i = _i += 1) {
          _results.push(a[i].dispose());
        }
        return _results;
      },
      add: function(field, value) {
        if (ATPOutputView[field] == null) {
          ATPOutputView[field] = [];
        }
        return ATPOutputView[field].push(value);
      }
    };

    ATPOutputView.prototype.keyCodes = {
      enter: 13,
      arrowUp: 38,
      arrowDown: 40,
      arrowLeft: 37,
      arrowRight: 39
    };

    ATPOutputView.prototype.localCommandAtomBindings = [];

    ATPOutputView.prototype.localCommands = ATPCommandsBuiltins;

    ATPOutputView.content = function() {
      return this.div({
        tabIndex: -1,
        "class": 'panel atp-panel panel-bottom',
        outlet: 'atpView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'terminal panel-divider',
            style: 'cursor:n-resize;width:100%;height:8px;',
            outlet: 'panelDivider'
          });
          _this.button({
            outlet: 'maximizeIconBtn',
            "class": 'atp-maximize-btn',
            click: 'maximize'
          });
          _this.button({
            outlet: 'closeIconBtn',
            "class": 'atp-close-btn',
            click: 'close'
          });
          _this.button({
            outlet: 'destroyIconBtn',
            "class": 'atp-destroy-btn',
            click: 'destroy'
          });
          _this.div({
            "class": 'panel-heading btn-toolbar',
            outlet: 'consoleToolbarHeading'
          }, function() {
            _this.div({
              "class": 'btn-group',
              outlet: 'consoleToolbar'
            }, function() {
              _this.button({
                outlet: 'killBtn',
                click: 'kill',
                "class": 'btn hide'
              }, function() {
                return _this.span('kill');
              });
              _this.button({
                outlet: 'exitBtn',
                click: 'destroy',
                "class": 'btn'
              }, function() {
                return _this.span('exit');
              });
              return _this.button({
                outlet: 'closeBtn',
                click: 'close',
                "class": 'btn'
              }, function() {
                _this.span({
                  "class": "icon icon-x"
                });
                return _this.span('close');
              });
            });
            _this.button({
              outlet: 'openConfigBtn',
              "class": 'btn icon icon-gear inline-block-tight button-settings',
              click: 'showSettings'
            }, function() {
              return _this.span('Open config');
            });
            return _this.button({
              outlet: 'reloadConfigBtn',
              "class": 'btn icon icon-gear inline-block-tight button-settings',
              click: 'reloadSettings'
            }, function() {
              return _this.span('Reload config');
            });
          });
          return _this.div({
            "class": 'atp-panel-body'
          }, function() {
            return _this.pre({
              "class": "terminal",
              outlet: "cliOutput"
            });
          });
        };
      })(this));
    };

    ATPOutputView.prototype.toggleAutoCompletion = function() {
      if (this.currentInputBoxCmp != null) {
        this.currentInputBoxCmp.enable();
        this.currentInputBoxCmp.repaint();
        this.currentInputBoxCmp.showDropDown();
        return this.currentInputBox.find('.terminal-input').height('100px');
      }
    };

    ATPOutputView.prototype.fsSpy = function() {
      this.volatileSuggestions = [];
      if (this.cwd != null) {
        return fs.readdir(this.cwd, (function(_this) {
          return function(err, files) {
            var file, _i, _len, _results;
            if (files != null) {
              _results = [];
              for (_i = 0, _len = files.length; _i < _len; _i++) {
                file = files[_i];
                _results.push(_this.volatileSuggestions.push(file));
              }
              return _results;
            }
          };
        })(this));
      }
    };

    ATPOutputView.prototype.turnSpecsMode = function(state) {
      return this.specsMode = state;
    };

    ATPOutputView.prototype.getRawOutput = function() {
      var t;
      t = this.getHtmlOutput().replace(/<[^>]*>/igm, "");
      t = this.util.replaceAll("&gt;", ">", t);
      t = this.util.replaceAll("&lt;", "<", t);
      t = this.util.replaceAll("&quot;", "\"", t);
      return t;
    };

    ATPOutputView.prototype.getHtmlOutput = function() {
      return this.cliOutput.html();
    };

    ATPOutputView.prototype.resolvePath = function(path) {
      var filepath;
      path = this.util.replaceAll('\"', '', path);
      filepath = '';
      if (path.match(/([A-Za-z]):/ig) !== null) {
        filepath = path;
      } else {
        filepath = this.getCwd() + '/' + path;
      }
      filepath = this.util.replaceAll('\\', '/', filepath);
      return this.util.replaceAll('\\', '/', resolve(filepath));
    };

    ATPOutputView.prototype.reloadSettings = function() {
      return this.onCommand('update');
    };

    ATPOutputView.prototype.showSettings = function() {
      ATPCore.reload();
      return setTimeout((function(_this) {
        return function() {
          var atomPath, configPath, panelPath;
          panelPath = atom.packages.resolvePackagePath('atom-terminal-panel');
          atomPath = resolve(panelPath + '/../..');
          configPath = atomPath + '/terminal-commands.json';
          return atom.workspace.open(configPath);
        };
      })(this), 50);
    };

    ATPOutputView.prototype.focusInputBox = function() {
      if (this.currentInputBoxCmp != null) {
        return this.currentInputBoxCmp.input.focus();
      }
    };

    ATPOutputView.prototype.updateInputCursor = function(textarea) {
      var val;
      this.rawMessage('test\n');
      val = textarea.val();
      return textarea.blur().focus().val("").val(val);
    };

    ATPOutputView.prototype.removeInputBox = function() {
      return this.cliOutput.find('.atp-dynamic-input-box').remove();
    };

    ATPOutputView.prototype.putInputBox = function() {
      var endsWith, history, inputComp, prompt;
      if (this.currentInputBoxTmr != null) {
        clearInterval(this.currentInputBoxTmr);
        this.currentInputBoxTmr = null;
      }
      this.cliOutput.find('.atp-dynamic-input-box').remove();
      prompt = this.getCommandPrompt('');
      this.currentInputBox = $('<div style="width: 100%; white-space:nowrap; overflow:hidden; display:inline-block;" class="atp-dynamic-input-box">' + '<div style="position:relative; top:5px; max-height:500px; width: 100%; bottom: -10px; height: 20px; white-space:nowrap; overflow:hidden; display:inline-block;" class="terminal-input native-key-bindings"></div>' + '</div>');
      this.currentInputBox.prepend('&nbsp;&nbsp;');
      this.currentInputBox.prepend(prompt);
      history = [];
      if (this.currentInputBoxCmp != null) {
        history = this.currentInputBoxCmp.getInputHistory();
      }
      inputComp = this.currentInputBox.find('.terminal-input');
      this.currentInputBoxCmp = inputComp.autocomplete({
        animation: [['opacity', 0, 0.8]],
        isDisabled: true,
        inputHistory: history,
        inputWidth: '80%',
        dropDownWidth: '30%',
        dropDownDescriptionBoxWidth: '30%',
        dropDownPosition: 'top',
        showDropDown: atom.config.get('atom-terminal-panel.enableConsoleSuggestionsDropdown')
      });
      this.currentInputBoxCmp.confirmed((function(_this) {
        return function() {
          _this.currentInputBoxCmp.disable().repaint();
          return _this.onCommand();
        };
      })(this)).changed((function(_this) {
        return function(inst, text) {
          if (inst.getText().length <= 0) {
            _this.currentInputBoxCmp.disable().repaint();
            return _this.currentInputBox.find('.terminal-input').height('20px');
          }
        };
      })(this));
      this.currentInputBoxCmp.input.keydown((function(_this) {
        return function(e) {
          if ((e.keyCode === 17) && (_this.currentInputBoxCmp.getText().length > 0)) {

            /*
            @currentInputBoxCmp.enable().repaint()
            @currentInputBoxCmp.showDropDown()
            @currentInputBox.find('.terminal-input').height('100px');
             */
          } else if ((e.keyCode === 32) || (e.keyCode === 8)) {
            _this.currentInputBoxCmp.disable().repaint();
            return _this.currentInputBox.find('.terminal-input').height('20px');
          }
        };
      })(this));
      endsWith = function(text, suffix) {
        return text.indexOf(suffix, text.length - suffix.length) !== -1;
      };
      this.currentInputBoxCmp.options = (function(_this) {
        return function(instance, text, lastToken) {
          var e, fsStat, i, o, ret, token, _i, _ref3;
          token = lastToken;
          if (token == null) {
            token = '';
          }
          if (!(endsWith(token, '/') || endsWith(token, '\\'))) {
            token = _this.util.replaceAll('\\', sep, token);
            token = token.split(sep);
            token.pop();
            token = token.join(sep);
            if (!endsWith(token, sep)) {
              token = token + sep;
            }
          }
          o = _this.getCommandsNames().concat(_this.volatileSuggestions);
          fsStat = [];
          if (token != null) {
            try {
              fsStat = fs.readdirSync(token);
              for (i = _i = 0, _ref3 = fsStat.length - 1; _i <= _ref3; i = _i += 1) {
                fsStat[i] = token + fsStat[i];
              }
            } catch (_error) {
              e = _error;
            }
          }
          ret = o.concat(fsStat);
          return ret;
        };
      })(this);
      this.currentInputBoxCmp.hideDropDown();
      setTimeout((function(_this) {
        return function() {
          return _this.currentInputBoxCmp.input.focus();
        };
      })(this), 0);
      this.currentInputBox.appendTo(this.cliOutput);
      return this.focusInputBox();
    };

    ATPOutputView.prototype.readInputBox = function() {
      var ret;
      ret = '';
      if (this.currentInputBoxCmp != null) {
        ret = this.currentInputBoxCmp.getText();
      }
      return ret;
    };

    ATPOutputView.prototype.requireCSS = function(location) {
      if (location == null) {
        return;
      }
      location = resolve(location);
      if (atom.config.get('atom-terminal-panel.logConsole') || this.specsMode) {
        console.log("Require atom-terminal-panel plugin CSS file: " + location + "\n");
      }
      return $('head').append("<link rel='stylesheet' type='text/css' href='" + location + "'/>");
    };

    ATPOutputView.prototype.resolvePluginDependencies = function(path, plugin) {
      var config, css_dependencies, css_dependency, _i, _len;
      config = plugin.dependencies;
      if (config == null) {
        return;
      }
      css_dependencies = config.css;
      if (css_dependencies == null) {
        css_dependencies = [];
      }
      for (_i = 0, _len = css_dependencies.length; _i < _len; _i++) {
        css_dependency = css_dependencies[_i];
        this.requireCSS(path + "/" + css_dependency);
      }
      return delete plugin['dependencies'];
    };

    ATPOutputView.prototype.init = function() {

      /*
      TODO: test-autocomplete Remove this!
      el = $('<div style="z-index: 9999; position: absolute; left: 200px; top: 200px;" id="glotest"></div>')
      el.autocomplete({
        inputWidth: '80%'
      })
      $('body').append(el)
       */
      var action, actions, atomCommands, bt, caller, com, comName, command, eleqr, lastY, mouseDown, normalizedPath, obj, panelDraggingActive, toolbar, _i, _j, _k, _len, _len1, _len2, _ref3;
      lastY = -1;
      mouseDown = false;
      panelDraggingActive = false;
      this.panelDivider.mousedown((function(_this) {
        return function() {
          return panelDraggingActive = true;
        };
      })(this)).mouseup((function(_this) {
        return function() {
          return panelDraggingActive = false;
        };
      })(this));
      $(document).mousedown((function(_this) {
        return function() {
          return mouseDown = true;
        };
      })(this)).mouseup((function(_this) {
        return function() {
          return mouseDown = false;
        };
      })(this)).mousemove((function(_this) {
        return function(e) {
          var delta;
          if (mouseDown && panelDraggingActive) {
            if (lastY !== -1) {
              delta = e.pageY - lastY;
              _this.cliOutput.height(_this.cliOutput.height() - delta);
            }
            return lastY = e.pageY;
          } else {
            return lastY = -1;
          }
        };
      })(this));
      normalizedPath = require("path").join(__dirname, "../commands");
      if (atom.config.get('atom-terminal-panel.logConsole') || this.specsMode) {
        console.log("Loading atom-terminal-panel plugins from the directory: " + normalizedPath + "\n");
      }
      fs.readdirSync(normalizedPath).forEach((function(_this) {
        return function(folder) {
          var fullpath, key, obj, value, _results;
          fullpath = resolve("../commands/" + folder);
          if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
            console.log("Require atom-terminal-panel plugin: " + folder + "\n");
          }
          obj = require("../commands/" + folder + "/index.coffee");
          if (atom.config.get('atom-terminal-panel.logConsole')) {
            console.log("Plugin loaded.");
          }
          _this.resolvePluginDependencies(fullpath, obj);
          _results = [];
          for (key in obj) {
            value = obj[key];
            if (value.command != null) {
              _this.localCommands[key] = value;
              _this.localCommands[key].source = 'external-functional';
              _results.push(_this.localCommands[key].sourcefile = folder);
            } else if (value.variable != null) {
              value.name = key;
              _results.push(ATPVariablesBuiltins.putVariable(value));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
      if (atom.config.get('atom-terminal-panel.logConsole')) {
        console.log("All plugins were loaded.");
      }
      if (ATPCore.getConfig() != null) {
        actions = ATPCore.getConfig().actions;
        if (actions != null) {
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            action = actions[_i];
            if (action.length > 1) {
              obj = {};
              obj['atom-terminal-panel:' + action[0]] = (function(_this) {
                return function() {
                  _this.open();
                  return _this.onCommand(action[1]);
                };
              })(this);
              atom.commands.add('atom-workspace', obj);
            }
          }
        }
      }
      if (atom.workspace != null) {
        eleqr = (_ref3 = atom.workspace.getActivePaneItem()) != null ? _ref3 : atom.workspace;
        eleqr = atom.views.getView(eleqr);
        atomCommands = atom.commands.findCommands({
          target: eleqr
        });
        for (_j = 0, _len1 = atomCommands.length; _j < _len1; _j++) {
          command = atomCommands[_j];
          comName = command.name;
          com = {};
          com.description = command.displayName;
          com.command = (function(comNameP) {
            return function(state, args) {
              var ele, _ref4;
              ele = (_ref4 = atom.workspace.getActivePaneItem()) != null ? _ref4 : atom.workspace;
              ele = atom.views.getView(ele);
              atom.commands.dispatch(ele, comNameP);
              return (state.consoleLabel('info', "info")) + (state.consoleText('info', 'Atom command executed: ' + comNameP));
            };
          })(comName);
          com.source = "internal-atom";
          this.localCommands[comName] = com;
        }
      }
      toolbar = ATPCore.getConfig().toolbar;
      if (toolbar != null) {
        toolbar.reverse();
        for (_k = 0, _len2 = toolbar.length; _k < _len2; _k++) {
          com = toolbar[_k];
          bt = $("<div class=\"btn\" data-action=\"" + com[1] + "\" ><span>" + com[0] + "</span></div>");
          if (com[2] != null) {
            atom.tooltips.add(bt, {
              title: com[2]
            });
          }
          this.consoleToolbar.prepend(bt);
          caller = this;
          bt.click(function() {
            return caller.onCommand($(this).data('action'));
          });
        }
      }
      return this;
    };

    ATPOutputView.prototype.commandLineNotCounted = function() {
      return this.inputLine--;
    };

    ATPOutputView.prototype.parseSpecialStringTemplate = function(prompt, values, isDOM) {
      if (isDOM == null) {
        isDOM = false;
      }
      if (isDOM) {
        return ATPVariablesBuiltins.parseHtml(this, prompt, values);
      } else {
        return ATPVariablesBuiltins.parse(this, prompt, values);
      }
    };

    ATPOutputView.prototype.getCommandPrompt = function(cmd) {
      return this.parseTemplate(atom.config.get('atom-terminal-panel.commandPrompt'), {
        cmd: cmd
      }, true);
    };

    ATPOutputView.prototype.delay = function(callback, delay) {
      if (delay == null) {
        delay = 100;
      }
      return setTimeout(callback, delay);
    };

    ATPOutputView.prototype.execDelayedCommand = function(delay, cmd, args, state) {
      var callback, caller;
      caller = this;
      callback = function() {
        return caller.exec(cmd, args, state);
      };
      return setTimeout(callback, delay);
    };

    ATPOutputView.prototype.moveToCurrentDirectory = function() {
      var CURRENT_LOCATION;
      CURRENT_LOCATION = this.getCurrentFileLocation();
      if (CURRENT_LOCATION != null) {
        return this.cd([CURRENT_LOCATION]);
      }
    };

    ATPOutputView.prototype.getCurrentFileName = function() {
      var current_file, matcher;
      current_file = this.getCurrentFilePath();
      if (current_file !== null) {
        matcher = /(.*:)((.*)\\)*/ig;
        return current_file.replace(matcher, "");
      }
      return null;
    };

    ATPOutputView.prototype.getCurrentFileLocation = function() {
      if (this.getCurrentFilePath() === null) {
        return null;
      }
      return this.util.replaceAll(this.getCurrentFileName(), "", this.getCurrentFilePath());
    };

    ATPOutputView.prototype.getCurrentFilePath = function() {
      var te;
      if (atom.workspace == null) {
        return null;
      }
      te = atom.workspace.getActiveTextEditor();
      if (te != null) {
        if (te.getPath() != null) {
          return te.getPath();
        }
      }
      return null;
    };

    ATPOutputView.prototype.parseTemplate = function(text, vars, isDOM) {
      var ret;
      if (isDOM == null) {
        isDOM = false;
      }
      if (vars == null) {
        vars = {};
      }
      ret = '';
      if (isDOM) {
        ret = ATPVariablesBuiltins.parseHtml(this, text, vars);
      } else {
        ret = this.parseSpecialStringTemplate(text, vars);
        ret = this.util.replaceAll('%(file-original)', this.getCurrentFilePath(), ret);
        ret = this.util.replaceAll('%(cwd-original)', this.getCwd(), ret);
        ret = this.util.replaceAll('&fs;', '/', ret);
        ret = this.util.replaceAll('&bs;', '\\', ret);
      }
      return ret;
    };

    ATPOutputView.prototype.parseExecToken__ = function(cmd, args, strArgs) {
      var argsNum, i, v, _i;
      if (strArgs != null) {
        cmd = this.util.replaceAll("%(*)", strArgs, cmd);
      }
      cmd = this.util.replaceAll("%(*^)", this.util.replaceAll("%(*^)", "", cmd), cmd);
      if (args != null) {
        argsNum = args.length;
        for (i = _i = 0; _i <= argsNum; i = _i += 1) {
          if (args[i] != null) {
            v = args[i].replace(/\n/ig, '');
            cmd = this.util.replaceAll("%(" + i + ")", args[i], cmd);
          }
        }
      }
      cmd = this.parseTemplate(cmd, {
        file: this.getCurrentFilePath()
      });
      return cmd;
    };

    ATPOutputView.prototype.execStackCounter = 0;

    ATPOutputView.prototype.exec = function(cmdStr, ref_args, state, callback) {
      var cmdStrC;
      if (state == null) {
        state = this;
      }
      if (ref_args == null) {
        ref_args = {};
      }
      if (cmdStr.split != null) {
        cmdStrC = cmdStr.split(';;');
        if (cmdStrC.length > 1) {
          cmdStr = cmdStrC;
        }
      }
      this.execStackCounter = 0;
      return this.exec_(cmdStr, ref_args, state, callback);
    };

    ATPOutputView.prototype.exec_ = function(cmdStr, ref_args, state, callback) {
      var args, cmd, com, command, e, ref_args_str, ret, val, _i, _len;
      if (callback == null) {
        callback = function() {
          return null;
        };
      }
      ++this.execStackCounter;
      if (cmdStr instanceof Array) {
        ret = '';
        for (_i = 0, _len = cmdStr.length; _i < _len; _i++) {
          com = cmdStr[_i];
          val = this.exec(com, ref_args, state);
          if (val != null) {
            ret += val;
          }
        }
        --this.execStackCounter;
        if (this.execStackCounter === 0) {
          callback();
        }
        if (ret == null) {
          return null;
        }
        return ret;
      } else {
        cmdStr = this.util.replaceAll("\\\"", '&hquot;', cmdStr);
        cmdStr = this.util.replaceAll("&bs;\"", '&hquot;', cmdStr);
        cmdStr = this.util.replaceAll("\\\'", '&lquot;', cmdStr);
        cmdStr = this.util.replaceAll("&bs;\'", '&lquot;', cmdStr);
        ref_args_str = null;
        if (ref_args != null) {
          if (ref_args.join != null) {
            ref_args_str = ref_args.join(' ');
          }
        }
        cmdStr = this.parseExecToken__(cmdStr, ref_args, ref_args_str);
        args = [];
        cmd = cmdStr;
        cmd.replace(/("[^"]*"|'[^']*'|[^\s'"]+)/g, (function(_this) {
          return function(s) {
            if (s[0] !== '"' && s[0] !== "'") {
              s = s.replace(/~/g, _this.userHome);
            }
            s = _this.util.replaceAll('&hquot;', '"', s);
            s = _this.util.replaceAll('&lquot;', '\'', s);
            return args.push(s);
          };
        })(this));
        args = this.util.dir(args, this.getCwd());
        cmd = args.shift();
        command = null;
        if (this.isCommandEnabled(cmd)) {
          command = ATPCore.findUserCommand(cmd);
        }
        if (command != null) {
          if (state == null) {
            ret = null;
            throw 'The console functional (not native) command cannot be executed without caller information: \'' + cmd + '\'.';
          }
          if (command != null) {
            try {
              ret = command(state, args);
            } catch (_error) {
              e = _error;
              throw new Error("Error at executing terminal command: '" + cmd + "' ('" + cmdStr + "'): " + e.message);
            }
          }
          --this.execStackCounter;
          if (this.execStackCounter === 0) {
            callback();
          }
          if (ret == null) {
            return null;
          }
          return ret;
        } else {
          if (atom.config.get('atom-terminal-panel.enableExtendedCommands') || this.specsMode) {
            if (this.isCommandEnabled(cmd)) {
              command = this.getLocalCommand(cmd);
            }
          }
          if (command != null) {
            ret = command(state, args);
            --this.execStackCounter;
            if (this.execStackCounter === 0) {
              callback();
            }
            if (ret == null) {
              return null;
            }
            return ret;
          } else {
            cmdStr = this.util.replaceAll('&hquot;', '"', cmdStr);
            cmd = this.util.replaceAll('&hquot;', '"', cmd);
            cmdStr = this.util.replaceAll('&lquot;', '\'', cmdStr);
            cmd = this.util.replaceAll('&lquot;', '\'', cmd);
            this.spawn(cmdStr, cmd, args);
            --this.execStackCounter;
            if (this.execStackCounter === 0) {
              callback();
            }
            if (cmd == null) {
              return null;
            }
            return null;
          }
        }
      }
    };

    ATPOutputView.prototype.isCommandEnabled = function(name) {
      var disabledCommands;
      disabledCommands = atom.config.get('atom-terminal-panel.disabledExtendedCommands') || this.specsMode;
      if (disabledCommands == null) {
        return true;
      }
      if (__indexOf.call(disabledCommands, name) >= 0) {
        return false;
      }
      return true;
    };

    ATPOutputView.prototype.getLocalCommand = function(name) {
      var cmd_body, cmd_name, _ref3;
      _ref3 = this.localCommands;
      for (cmd_name in _ref3) {
        cmd_body = _ref3[cmd_name];
        if (cmd_name === name) {
          if (cmd_body.command != null) {
            return cmd_body.command;
          } else {
            return cmd_body;
          }
        }
      }
      return null;
    };

    ATPOutputView.prototype.getCommandsRegistry = function() {
      var cmd, cmd_, cmd_body, cmd_forbd, cmd_item, cmd_len, cmd_name, descr, global_vars, key, value, var_name, _i, _len, _ref3, _ref4, _ref5, _ref6;
      global_vars = ATPVariablesBuiltins.list;
      _ref3 = process.env;
      for (key in _ref3) {
        value = _ref3[key];
        global_vars['%(env.' + key + ')'] = "access native environment variable: " + key;
      }
      cmd = [];
      _ref4 = this.localCommands;
      for (cmd_name in _ref4) {
        cmd_body = _ref4[cmd_name];
        cmd.push({
          name: cmd_name,
          description: cmd_body.description,
          example: cmd_body.example,
          params: cmd_body.params,
          deprecated: cmd_body.deprecated,
          sourcefile: cmd_body.sourcefile,
          source: cmd_body.source || 'internal'
        });
      }
      _ref5 = ATPCore.getUserCommands();
      for (cmd_name in _ref5) {
        cmd_body = _ref5[cmd_name];
        cmd.push({
          name: cmd_name,
          description: cmd_body.description,
          example: cmd_body.example,
          params: cmd_body.params,
          deprecated: cmd_body.deprecated,
          sourcefile: cmd_body.sourcefile,
          source: 'external'
        });
      }
      for (var_name in global_vars) {
        descr = global_vars[var_name];
        cmd.push({
          name: var_name,
          description: descr,
          source: 'global-variable'
        });
      }
      cmd_ = [];
      cmd_len = cmd.length;
      cmd_forbd = (atom.config.get('atom-terminal-panel.disabledExtendedCommands')) || [];
      for (_i = 0, _len = cmd.length; _i < _len; _i++) {
        cmd_item = cmd[_i];
        if (_ref6 = cmd_item.name, __indexOf.call(cmd_forbd, _ref6) >= 0) {

        } else {
          cmd_.push(cmd_item);
        }
      }
      return cmd_;
    };

    ATPOutputView.prototype.getCommandsNames = function() {
      var cmd_names, cmds, deprecated, descr, descr_prefix, example, icon_style, item, name, params, sourcefile, _i, _len;
      cmds = this.getCommandsRegistry();
      cmd_names = [];
      for (_i = 0, _len = cmds.length; _i < _len; _i++) {
        item = cmds[_i];
        descr = "";
        example = "";
        params = "";
        sourcefile = "";
        deprecated = false;
        name = item.name;
        if (item.sourcefile != null) {
          sourcefile = "<div style='float:bottom'><b style='float:right'>Plugin " + item.sourcefile + "&nbsp;&nbsp;&nbsp;<b></div>";
        }
        if (item.example != null) {
          example = "<br><b><u>Example:</u></b><br><code>" + item.example + "</code>";
        }
        if (item.params != null) {
          params = item.params;
        }
        if (item.deprecated) {
          deprecated = true;
        }
        icon_style = '';
        descr_prefix = '';
        if (item.source === 'external') {
          icon_style = 'book';
          descr_prefix = 'External: ';
        } else if (item.source === 'internal') {
          icon_style = 'repo';
          descr_prefix = 'Builtin: ';
        } else if (item.source === 'internal-atom') {
          icon_style = 'repo';
          descr_prefix = 'Atom command: ';
        } else if (item.source === 'external-functional') {
          icon_style = 'plus';
          descr_prefix = 'Functional: ';
        } else if (item.source === 'global-variable') {
          icon_style = 'briefcase';
          descr_prefix = 'Global variable: ';
        }
        if (deprecated) {
          name = "<strike style='color:gray;font-weight:normal;'>" + name + "</strike>";
        }
        descr = "<div style='float:left; padding-top:10px;' class='status status-" + icon_style + " icon icon-" + icon_style + "'></div><div style='padding-left: 10px;'><b>" + name + " " + params + "</b><br>" + item.description + " " + example + " " + sourcefile + "</div>";
        cmd_names.push({
          name: item.name,
          description: descr,
          html: true
        });
      }
      return cmd_names;
    };

    ATPOutputView.prototype.getLocalCommandsMemdump = function() {
      var cmd, commandFinder, commandFinderPanel;
      cmd = this.getCommandsRegistry();
      commandFinder = new ATPCommandFinderView(cmd);
      commandFinderPanel = atom.workspace.addModalPanel({
        item: commandFinder
      });
      commandFinder.shown(commandFinderPanel, this);
    };

    ATPOutputView.prototype.commandProgress = function(value) {
      if (value < 0) {
        this.cliProgressBar.hide();
        return this.cliProgressBar.attr('value', '0');
      } else {
        this.cliProgressBar.show();
        return this.cliProgressBar.attr('value', value / 2);
      }
    };

    ATPOutputView.prototype.showInitMessage = function(forceShow) {
      var changelog_path, hello_message, readme_path;
      if (forceShow == null) {
        forceShow = false;
      }
      if (!forceShow) {
        if (this.helloMessageShown) {
          return;
        }
      }
      if (atom.config.get('atom-terminal-panel.enableConsoleStartupInfo' || forceShow || (!this.specsMode))) {
        changelog_path = require("path").join(__dirname, "../CHANGELOG.md");
        readme_path = require("path").join(__dirname, "../README.md");
        hello_message = this.consolePanel('ATOM Terminal', 'Please enter new commands to the box below. (ctrl-to show suggestions dropdown)<br>The console supports special anotattion like: %(path), %(file), %(link)file.something%(endlink).<br>It also supports special HTML elements like: %(tooltip:A:content:B) and so on.<br>Hope you\'ll enjoy the terminal.' + ("<br><a class='changelog-link' href='" + changelog_path + "'>See changelog</a>&nbsp;&nbsp;<a class='readme-link' href='" + readme_path + "'>and the README! :)</a>"));
        this.rawMessage(hello_message);
        $('.changelog-link').css('font-weight', '300%').click((function(_this) {
          return function() {
            return atom.workspace.open(changelog_path);
          };
        })(this));
        $('.readme-link').css('font-weight', '300%').click((function(_this) {
          return function() {
            return atom.workspace.open(readme_path);
          };
        })(this));
        this.helloMessageShown = true;
      }
      return this;
    };

    ATPOutputView.prototype.onCommand = function(inputCmd) {
      var ret;
      this.fsSpy();
      if (inputCmd == null) {
        inputCmd = this.readInputBox();
      }
      this.disposables.dispose('statusIconTooltips');
      this.disposables.add('statusIconTooltips', atom.tooltips.add(this.statusIcon, {
        title: 'Task: \"' + inputCmd + '\"',
        delay: 0,
        animation: false
      }));
      this.inputLine++;
      inputCmd = this.parseSpecialStringTemplate(inputCmd);
      if (this.echoOn) {
        console.log('echo-on');
      }
      ret = this.exec(inputCmd, null, this, (function(_this) {
        return function() {
          return setTimeout(function() {
            return _this.putInputBox();
          }, 750);
        };
      })(this));
      if (ret != null) {
        this.message(ret + '\n');
      }
      this.scrollToBottom();
      this.putInputBox();
      setTimeout((function(_this) {
        return function() {
          return _this.putInputBox();
        };
      })(this), 750);
      return null;
    };

    ATPOutputView.prototype.initialize = function() {
      var cmd;
      this.userHome = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      cmd = 'test -e /etc/profile && source /etc/profile;test -e ~/.profile && source ~/.profile; node -pe "JSON.stringify(process.env)"';
      exec(cmd, function(code, stdout, stderr) {
        var e;
        try {
          return process.env = JSON.parse(stdout);
        } catch (_error) {
          e = _error;
        }
      });
      return atom.commands.add('atom-workspace', {
        "atp-status:toggle-output": (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      });
    };

    ATPOutputView.prototype.clear = function() {
      this.cliOutput.empty();
      this.message('\n');
      return this.putInputBox();
    };

    ATPOutputView.prototype.adjustWindowHeight = function() {
      var maxHeight;
      maxHeight = atom.config.get('atom-terminal-panel.WindowHeight');
      this.cliOutput.css("max-height", "" + maxHeight + "px");
      return $('.terminal-input').css("max-height", "" + maxHeight + "px");
    };

    ATPOutputView.prototype.showCmd = function() {
      this.focusInputBox();
      return this.scrollToBottom();
    };

    ATPOutputView.prototype.scrollToBottom = function() {
      return this.cliOutput.scrollTop(10000000);
    };

    ATPOutputView.prototype.flashIconClass = function(className, time) {
      var onStatusOut;
      if (time == null) {
        time = 100;
      }
      this.statusIcon.addClass(className);
      this.timer && clearTimeout(this.timer);
      onStatusOut = (function(_this) {
        return function() {
          return _this.statusIcon.removeClass(className);
        };
      })(this);
      return this.timer = setTimeout(onStatusOut, time);
    };

    ATPOutputView.prototype.destroy = function() {
      var _destroy;
      this.statusIcon.remove();
      _destroy = (function(_this) {
        return function() {
          if (_this.hasParent()) {
            _this.close();
          }
          if (_this.statusIcon && _this.statusIcon.parentNode) {
            _this.statusIcon.parentNode.removeChild(_this.statusIcon);
          }
          return _this.statusView.removeCommandView(_this);
        };
      })(this);
      if (this.program) {
        this.program.once('exit', _destroy);
        return this.program.kill();
      } else {
        return _destroy();
      }
    };

    ATPOutputView.prototype.terminateProcessTree = function() {
      var killProcess, pid, psTree;
      pid = this.program.pid;
      psTree = require('ps-tree');
      killProcess = (function(_this) {
        return function(pid, signal, callback) {
          var ex, killTree;
          signal = signal || 'SIGKILL';
          callback = callback || function() {
            return {};
          };
          killTree = true;
          if (killTree) {
            return psTree(pid, function(err, children) {
              [pid].concat(children.map(function(p) {
                return p.PID;
              })).forEach(function(tpid) {
                var ex;
                try {
                  return process.kill(tpid, signal);
                } catch (_error) {
                  ex = _error;
                }
              });
              return callback();
            });
          } else {
            try {
              process.kill(pid, signal);
            } catch (_error) {
              ex = _error;
            }
            return callback();
          }
        };
      })(this);
      return killProcess(pid, 'SIGINT');
    };

    ATPOutputView.prototype.kill = function() {
      if (this.program) {
        this.terminateProcessTree(this.program.pid);
        this.program.stdin.pause();
        this.program.kill('SIGINT');
        this.program.kill();
        return this.message((this.consoleLabel('info', 'info')) + (this.consoleText('info', 'Process has been stopped')));
      }
    };

    ATPOutputView.prototype.maximize = function() {
      return this.cliOutput.height(this.cliOutput.height() + 9999);
    };

    ATPOutputView.prototype.open = function() {
      if ((atom.config.get('atom-terminal-panel.moveToCurrentDirOnOpen')) && (!this.specsMode)) {
        this.moveToCurrentDirectory();
      }
      if ((atom.config.get('atom-terminal-panel.moveToCurrentDirOnOpenLS')) && (!this.specsMode)) {
        this.clear();
        this.execDelayedCommand(this._cmdintdel, 'ls', null, this);
      }
      if (!this.hasParent()) {
        atom.workspace.addBottomPanel({
          item: this
        });
      }
      if (lastOpenedView && lastOpenedView !== this) {
        lastOpenedView.close();
      }
      lastOpenedView = this;
      this.scrollToBottom();
      this.statusView.setActiveCommandView(this);
      this.focusInputBox();
      this.showInitMessage();
      this.putInputBox();
      atom.tooltips.add(this.killBtn, {
        title: 'Kill the long working process.'
      });
      atom.tooltips.add(this.exitBtn, {
        title: 'Destroy the terminal session.'
      });
      atom.tooltips.add(this.closeBtn, {
        title: 'Hide the terminal window.'
      });
      atom.tooltips.add(this.openConfigBtn, {
        title: 'Open the terminal config file.'
      });
      atom.tooltips.add(this.reloadConfigBtn, {
        title: 'Reload the terminal configuration.'
      });
      if (atom.config.get('atom-terminal-panel.enableWindowAnimations')) {
        this.WindowMinHeight = this.cliOutput.height() + 50;
        this.height(0);
        this.consoleToolbarHeading.css({
          opacity: 0
        });
        return this.animate({
          height: this.WindowMinHeight
        }, 250, (function(_this) {
          return function() {
            _this.attr('style', '');
            return _this.consoleToolbarHeading.animate({
              opacity: 1
            }, 250, function() {
              return _this.consoleToolbarHeading.attr('style', '');
            });
          };
        })(this));
      }
    };

    ATPOutputView.prototype.close = function() {
      if (atom.config.get('atom-terminal-panel.enableWindowAnimations')) {
        this.WindowMinHeight = this.cliOutput.height() + 50;
        this.height(this.WindowMinHeight);
        return this.animate({
          height: 0
        }, 250, (function(_this) {
          return function() {
            _this.attr('style', '');
            _this.consoleToolbar.attr('style', '');
            _this.detach();
            return lastOpenedView = null;
          };
        })(this));
      } else {
        this.detach();
        return lastOpenedView = null;
      }
    };

    ATPOutputView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.close();
      } else {
        return this.open();
      }
    };

    ATPOutputView.prototype.removeQuotes = function(text) {
      var ret, t, _i, _len;
      if (text == null) {
        return '';
      }
      if (text instanceof Array) {
        ret = [];
        for (_i = 0, _len = text.length; _i < _len; _i++) {
          t = text[_i];
          ret.push(this.removeQuotes(t));
        }
        return ret;
      }
      return text.replace(/['"]+/g, '');
    };

    ATPOutputView.prototype.cd = function(args) {
      var dir, e, stat;
      if (!args[0]) {
        args = [atom.project.path];
      }
      args = this.removeQuotes(args);
      dir = resolve(this.getCwd(), args[0]);
      try {
        stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
          return this.errorMessage("cd: not a directory: " + args[0]);
        }
        this.cwd = dir;
        this.putInputBox();
      } catch (_error) {
        e = _error;
        return this.errorMessage("cd: " + args[0] + ": No such file or directory");
      }
      return null;
    };

    ATPOutputView.prototype.ls = function(args) {
      var e, files, filesBlocks, ret;
      try {
        files = fs.readdirSync(this.getCwd());
      } catch (_error) {
        e = _error;
        return false;
      }
      if (atom.config.get('atom-terminal-panel.XExperimentEnableForceLinking')) {
        ret = '';
        files.forEach((function(_this) {
          return function(filename) {
            return ret += _this.resolvePath(filename + '\t%(break)');
          };
        })(this));
        this.message(ret);
        return true;
      }
      filesBlocks = [];
      files.forEach((function(_this) {
        return function(filename) {
          return filesBlocks.push(_this._fileInfoHtml(filename, _this.getCwd()));
        };
      })(this));
      filesBlocks = filesBlocks.sort(function(a, b) {
        var aDir, bDir;
        aDir = false;
        bDir = false;
        if (a[1] != null) {
          aDir = a[1].isDirectory();
        }
        if (b[1] != null) {
          bDir = b[1].isDirectory();
        }
        if (aDir && !bDir) {
          return -1;
        }
        if (!aDir && bDir) {
          return 1;
        }
        return a[2] > b[2] && 1 || -1;
      });
      filesBlocks.unshift(this._fileInfoHtml('..', this.getCwd()));
      filesBlocks = filesBlocks.map(function(b) {
        return b[0];
      });
      this.message(filesBlocks.join('%(break)') + '<div class="clear"/>');
      return true;
    };

    ATPOutputView.prototype.parseSpecialNodes = function() {
      var caller;
      caller = this;
      if (atom.config.get('atom-terminal-panel.enableConsoleInteractiveHints')) {
        $('.atp-tooltip[data-toggle="tooltip"]').each(function() {
          var title;
          title = $(this).attr('title');
          return atom.tooltips.add($(this), {});
        });
      }
      if (atom.config.get('atom-terminal-panel.enableConsoleInteractiveLinks')) {
        return this.find('.console-link').each((function() {
          var el, link_target, link_target_column, link_target_line, link_target_name, link_type;
          el = $(this);
          link_target = el.data('target');
          if (link_target !== null && link_target !== void 0) {
            el.data('target', null);
            link_type = el.data('targettype');
            link_target_name = el.data('targetname');
            link_target_line = el.data('line');
            link_target_column = el.data('column');
            if (link_target_line == null) {
              link_target_line = 0;
            }
            if (link_target_column == null) {
              link_target_column = 0;
            }
            return el.click(function() {
              var moveToDir;
              el.addClass('link-used');
              if (link_type === 'file') {
                atom.workspace.open(link_target, {
                  initialLine: link_target_line,
                  initialColumn: link_target_column
                });
              }
              if (link_type === 'directory') {
                moveToDir = function(directory, messageDisp) {
                  if (messageDisp == null) {
                    messageDisp = false;
                  }
                  caller.clear();
                  caller.cd([directory]);
                  return setTimeout(function() {
                    if (!caller.ls()) {
                      if (!messageDisp) {
                        caller.errorMessage('The directory is inaccesible.\n');
                        messageDisp = true;
                        return setTimeout(function() {
                          return moveToDir('..', messageDisp);
                        }, 1500);
                      }
                    }
                  }, caller._cmdintdel);
                };
                return setTimeout(function() {
                  return moveToDir(link_target_name);
                }, caller._cmdintdel);
              }
            });
          }
        }));
      }
    };

    ATPOutputView.prototype.consoleAlert = function(text) {
      return '<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Warning!</strong> ' + text + '</div>';
    };

    ATPOutputView.prototype.consolePanel = function(title, content) {
      return '<div class="panel panel-info welcome-panel"><div class="panel-heading">' + title + '</div><div class="panel-body">' + content + '</div></div><br><br>';
    };

    ATPOutputView.prototype.consoleText = function(type, text) {
      if (type === 'info') {
        return '<span class="text-info" style="margin-left:10px;">' + text + '</span>';
      }
      if (type === 'error') {
        return '<span class="text-error" style="margin-left:10px;">' + text + '</span>';
      }
      if (type === 'warning') {
        return '<span class="text-warning" style="margin-left:10px;">' + text + '</span>';
      }
      if (type === 'success') {
        return '<span class="text-success" style="margin-left:10px;">' + text + '</span>';
      }
      return text;
    };

    ATPOutputView.prototype.consoleLabel = function(type, text) {
      if ((!atom.config.get('atom-terminal-panel.enableConsoleLabels')) && (!this.specsMode)) {
        return text;
      }
      if (text == null) {
        text = type;
      }
      if (type === 'badge') {
        return '<span class="badge">' + text + '</span>';
      }
      if (type === 'default') {
        return '<span class="inline-block highlight">' + text + '</span>';
      }
      if (type === 'primary') {
        return '<span class="label label-primary">' + text + '</span>';
      }
      if (type === 'success') {
        return '<span class="inline-block highlight-success">' + text + '</span>';
      }
      if (type === 'info') {
        return '<span class="inline-block highlight-info">' + text + '</span>';
      }
      if (type === 'warning') {
        return '<span class="inline-block highlight-warning">' + text + '</span>';
      }
      if (type === 'danger') {
        return '<span class="inline-block highlight-error">' + text + '</span>';
      }
      if (type === 'error') {
        return '<span class="inline-block highlight-error">' + text + '</span>';
      }
      return '<span class="label label-default">' + text + '</span>';
    };

    ATPOutputView.prototype.consoleLink = function(name, forced) {
      if (forced == null) {
        forced = true;
      }
      if ((atom.config.get('atom-terminal-panel.XExperimentEnableForceLinking')) && (!forced)) {
        return name;
      }
      return this._fileInfoHtml(name, this.getCwd(), 'font', false)[0];
    };

    ATPOutputView.prototype._fileInfoHtml = function(filename, parent, wrapper_class, use_file_info_class) {
      var classes, dataname, e, exattrs, extension, file_exists, filecolumn, fileline, filepath, filepath_tooltip, href, matcher, name_tokens, stat, str, target_type;
      if (wrapper_class == null) {
        wrapper_class = 'span';
      }
      if (use_file_info_class == null) {
        use_file_info_class = 'true';
      }
      str = filename;
      name_tokens = filename;
      filename = filename.replace(/:[0-9]+:[0-9]/ig, '');
      name_tokens = this.util.replaceAll(filename, '', name_tokens);
      name_tokens = name_tokens.split(':');
      fileline = name_tokens[0];
      filecolumn = name_tokens[1];
      filename = this.util.replaceAll('/', '\\', filename);
      filename = this.util.replaceAll(parent, '', filename);
      filename = this.util.replaceAll(this.util.replaceAll('/', '\\', parent), '', filename);
      if (filename[0] === '\\' || filename[0] === '/') {
        filename = filename.substring(1);
      }
      if (filename === '..') {
        if (use_file_info_class) {
          return ["<font class=\"file-extension\"><" + wrapper_class + " data-targetname=\"" + filename + "\" data-targettype=\"directory\" data-target=\"" + filename + "\" class=\"console-link icon-file-directory parent-folder\">" + filename + "</" + wrapper_class + "></font>", null, filename];
        } else {
          return ["<font class=\"file-extension\"><" + wrapper_class + " data-targetname=\"" + filename + "\" data-targettype=\"directory\" data-target=\"" + filename + "\" class=\"console-link icon-file-directory file-info parent-folder\">" + filename + "</" + wrapper_class + "></font>", null, filename];
        }
      }
      file_exists = true;
      filepath = this.resolvePath(filename);
      classes = [];
      dataname = '';
      if (atom.config.get('atom-terminal-panel.useAtomIcons')) {
        classes.push('name');
        classes.push('icon');
        classes.push('icon-file-text');
        dataname = filepath;
      } else {
        classes.push('name');
      }
      if (use_file_info_class) {
        classes.push('file-info');
      }
      stat = null;
      if (file_exists) {
        try {
          stat = fs.lstatSync(filepath);
        } catch (_error) {
          e = _error;
          file_exists = false;
        }
      }
      if (file_exists) {
        if (atom.config.get('atom-terminal-panel.enableConsoleInteractiveLinks') || this.specsMode) {
          classes.push('console-link');
        }
        if (stat.isSymbolicLink()) {
          classes.push('stat-link');
          stat = fs.statSync(filepath);
          target_type = 'null';
        }
        if (stat.isFile()) {
          if (stat.mode & 73) {
            classes.push('stat-program');
          }
          matcher = /(.:)((.*)\\)*((.*\.)*)/ig;
          extension = filepath.replace(matcher, "");
          classes.push(this.util.replaceAll(' ', '', extension));
          classes.push('icon-file-text');
          target_type = 'file';
        }
        if (stat.isDirectory()) {
          classes.push('icon-file-directory');
          target_type = 'directory';
        }
        if (stat.isCharacterDevice()) {
          classes.push('stat-char-dev');
          target_type = 'device';
        }
        if (stat.isFIFO()) {
          classes.push('stat-fifo');
          target_type = 'fifo';
        }
        if (stat.isSocket()) {
          classes.push('stat-sock');
          target_type = 'sock';
        }
      } else {
        classes.push('file-not-found');
        classes.push('icon-file-text');
        target_type = 'file';
      }
      if (filename[0] === '.') {
        classes.push('status-ignored');
        target_type = 'ignored';
      }
      href = 'file:///' + this.util.replaceAll('\\', '/', filepath);
      classes.push('atp-tooltip');
      exattrs = [];
      if (fileline != null) {
        exattrs.push('data-line="' + fileline + '"');
      }
      if (filecolumn != null) {
        exattrs.push('data-column="' + filecolumn + '"');
      }
      filepath_tooltip = this.util.replaceAll('\\', '/', filepath);
      filepath = this.util.replaceAll('\\', '/', filepath);
      return ["<font class=\"file-extension\"><" + wrapper_class + " " + (exattrs.join(' ')) + " tooltip=\"\" data-targetname=\"" + filename + "\" data-targettype=\"" + target_type + "\" data-target=\"" + filepath + "\" data-name=\"" + dataname + "\" class=\"" + (classes.join(' ')) + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + filepath_tooltip + "\" >" + filename + "</" + wrapper_class + "></font>", stat, filename];
    };

    ATPOutputView.prototype.getGitStatusName = function(path, gitRoot, repo) {
      var status;
      status = (repo.getCachedPathStatus || repo.getPathStatus)(path);
      if (status) {
        if (repo.isStatusModified(status)) {
          return 'modified';
        }
        if (repo.isStatusNew(status)) {
          return 'added';
        }
      }
      if (repo.isPathIgnore(path)) {
        return 'ignored';
      }
    };

    ATPOutputView.prototype.preserveOriginalPaths = function(text) {
      text = this.util.replaceAll(this.getCurrentFilePath(), '%(file-original)', text);
      text = this.util.replaceAll(this.getCwd(), '%(cwd-original)', text);
      text = this.util.replaceAll(this.getCwd(), '%(cwd-original)', text);
      text = this.util.replaceAll('/', '&fs;', text);
      text = this.util.replaceAll('\\', '&bs;', text);
      return text;
    };

    ATPOutputView.prototype.parseMessage = function(message, matchSpec, parseCustomRules) {
      var instance, n;
      if (matchSpec == null) {
        matchSpec = true;
      }
      if (parseCustomRules == null) {
        parseCustomRules = true;
      }
      instance = this;
      message = '<div>' + (instance.parseMessage_(message, false, true, true)) + '</div>';
      n = $(message);
      n.contents().filter(function() {
        return this.nodeType === 3;
      }).each(function() {
        var out, thiz;
        thiz = $(this);
        out = thiz.text();
        out = instance.parseMessage_(out, matchSpec, parseCustomRules);
        return thiz.replaceWith('<span>' + out + '</span>');
      });
      return n.html();
    };

    ATPOutputView.prototype.parseMessage_ = function(message, matchSpec, parseCustomRules, isForcelyPreparsering) {
      var cwdE, cwdN, flags, forceParse, i, key, matchAllLine, matchExp, matchNextLines, path, regex, regex2, regexString, replExp, rules, value, _i;
      if (matchSpec == null) {
        matchSpec = true;
      }
      if (parseCustomRules == null) {
        parseCustomRules = true;
      }
      if (isForcelyPreparsering == null) {
        isForcelyPreparsering = false;
      }
      if (message === null) {
        return '';
      }
      if (matchSpec) {
        if (atom.config.get('atom-terminal-panel.XExperimentEnableForceLinking')) {
          if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') != null) {
            if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') !== '') {
              regex = /(\.(\\|\/))?(([A-Za-z]:)(\\|\/))?(([^\s#@$%&!;<>\.\^:]| )+(\\|\/))((([^\s#@$%&!;<>\.\^:]| )+(\\|\/))*([^\s<>:#@$%\^;]| )+(\.([^\s#@$%&!;<>\.0-9:\^]| )*)*)?/ig;
              regex2 = /(\.(\\|\/))((([^\s#@$%&!;<>\.\^:]| )+(\\|\/))*([^\s<>:#@$%\^;]| )+(\.([^\s#@$%&!;<>\.0-9:\^]| )*)*)?/ig;
              message = message.replace(regex, (function(_this) {
                return function(match, text, urlId) {
                  return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementFileAdress'), {
                    file: match
                  });
                };
              })(this));
              message = message.replace(regex2, (function(_this) {
                return function(match, text, urlId) {
                  return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementFileAdress'), {
                    file: match
                  });
                };
              })(this));
            }
          }
        } else {
          if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') != null) {
            if (atom.config.get('atom-terminal-panel.textReplacementFileAdress') !== '') {
              cwdN = this.getCwd();
              cwdE = this.util.replaceAll('/', '\\', this.getCwd());
              regexString = '(' + (this.util.escapeRegExp(cwdN)) + '|' + (this.util.escapeRegExp(cwdE)) + ')\\\\([^\\s:#$%^&!:]| )+\\.?([^\\s:#$@%&\\*\\^!0-9:\\.+\\-,\\\\\\/\"]| )*';
              regex = new RegExp(regexString, 'ig');
              message = message.replace(regex, (function(_this) {
                return function(match, text, urlId) {
                  return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementFileAdress'), {
                    file: match
                  });
                };
              })(this));
            }
          }
        }
        if (atom.config.get('atom-terminal-panel.textReplacementCurrentFile') != null) {
          if (atom.config.get('atom-terminal-panel.textReplacementCurrentFile') !== '') {
            path = this.getCurrentFilePath();
            regex = new RegExp(this.util.escapeRegExp(path), 'g');
            message = message.replace(regex, (function(_this) {
              return function(match, text, urlId) {
                return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementCurrentFile'), {
                  file: match
                });
              };
            })(this));
          }
        }
        message = this.preserveOriginalPaths(message);
        if (atom.config.get('atom-terminal-panel.textReplacementCurrentPath') != null) {
          if (atom.config.get('atom-terminal-panel.textReplacementCurrentPath') !== '') {
            path = this.getCwd();
            regex = new RegExp(this.util.escapeRegExp(path), 'g');
            message = message.replace(regex, (function(_this) {
              return function(match, text, urlId) {
                return _this.parseSpecialStringTemplate(atom.config.get('atom-terminal-panel.textReplacementCurrentPath'), {
                  file: match
                });
              };
            })(this));
          }
        }
      }
      message = this.util.replaceAll('%(file-original)', this.getCurrentFilePath(), message);
      message = this.util.replaceAll('%(cwd-original)', this.getCwd(), message);
      message = this.util.replaceAll('&fs;', '/', message);
      message = this.util.replaceAll('&bs;', '\\', message);
      rules = ATPCore.getConfig().rules;
      for (key in rules) {
        value = rules[key];
        matchExp = key;
        replExp = '%(content)';
        matchAllLine = false;
        matchNextLines = 0;
        flags = 'gm';
        forceParse = false;
        if (value.match != null) {
          if (value.match.flags != null) {
            flags = value.match.flags.join('');
          }
          if (value.match.replace != null) {
            replExp = value.match.replace;
          }
          if (value.match.matchLine != null) {
            matchAllLine = value.match.matchLine;
          }
          if (value.match.matchNextLines != null) {
            matchNextLines = value.match.matchNextLines;
          }
          if (value.match.forced != null) {
            forceParse = value.match.forced;
          }
        }
        if ((forceParse || parseCustomRules) && ((isForcelyPreparsering && forceParse) || (!isForcelyPreparsering))) {
          if (matchAllLine) {
            matchExp = '.*' + matchExp;
          }
          if (matchNextLines > 0) {
            for (i = _i = 0; _i <= matchNextLines; i = _i += 1) {
              matchExp = matchExp + '[\\r\\n].*';
            }
          }
          regex = new RegExp(matchExp, flags);
          message = message.replace(regex, (function(_this) {
            return function() {
              var groups, groupsNumber, match, repl, style, vars, _j;
              match = arguments[0], groups = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
              style = '';
              if (value.css != null) {
                style = ATPCore.jsonCssToInlineStyle(value.css);
              } else if (value.match == null) {
                style = ATPCore.jsonCssToInlineStyle(value);
              }
              vars = {
                content: match,
                0: match
              };
              groupsNumber = groups.length - 1;
              for (i = _j = 0; _j <= groupsNumber; i = _j += 1) {
                if (groups[i] != null) {
                  vars[i + 1] = groups[i];
                }
              }
              repl = _this.parseSpecialStringTemplate(replExp, vars);
              return "<font style=\"" + style + "\">" + repl + "</font>";
            };
          })(this));
        }
      }
      message = this.util.replaceAll('%(file-original)', this.getCurrentFilePath(), message);
      message = this.util.replaceAll('%(cwd-original)', this.getCwd(), message);
      message = this.util.replaceAll('&fs;', '/', message);
      message = this.util.replaceAll('&bs;', '\\', message);
      return message;
    };

    ATPOutputView.prototype.redirect = function(streamName) {
      return this.redirectOutput = streamName;
    };

    ATPOutputView.prototype.rawMessage = function(message) {
      if (this.redirectOutput === 'console') {
        console.log(message);
        return;
      }
      this.cliOutput.append(message);
      this.showCmd();
      this.statusIcon.removeClass('status-error');
      return this.statusIcon.addClass('status-success');
    };

    ATPOutputView.prototype.message = function(message, matchSpec) {
      var m, mes, _i, _len;
      if (matchSpec == null) {
        matchSpec = true;
      }
      if (this.redirectOutput === 'console') {
        console.log(message);
        return;
      }
      if (typeof message === 'object') {
        mes = message;
      } else {
        if (message == null) {
          return;
        }
        mes = message.split('%(break)');
        if (mes.length > 1) {
          for (_i = 0, _len = mes.length; _i < _len; _i++) {
            m = mes[_i];
            this.message(m);
          }
          return;
        } else {
          mes = mes[0];
        }
        mes = this.parseMessage(message, matchSpec, matchSpec);
        mes = this.util.replaceAll('%(raw)', '', mes);
        mes = this.parseTemplate(mes, [], true);
      }
      this.cliOutput.append(mes);
      this.showCmd();
      this.statusIcon.removeClass('status-error');
      this.statusIcon.addClass('status-success');
      this.parseSpecialNodes();
      return this.scrollToBottom();
    };

    ATPOutputView.prototype.errorMessage = function(message) {
      this.cliOutput.append(this.parseMessage(message));
      this.showCmd();
      this.statusIcon.removeClass('status-success');
      this.statusIcon.addClass('status-error');
      return this.parseSpecialNodes();
    };

    ATPOutputView.prototype.correctFilePath = function(path) {
      return this.util.replaceAll('\\', '/', path);
    };

    ATPOutputView.prototype.getCwd = function() {
      var cwd, extFile, projectDir;
      if (atom.project == null) {
        return null;
      }
      extFile = extname(atom.project.path);
      if (extFile === "") {
        if (atom.project.path) {
          projectDir = atom.project.path;
        } else {
          if (process.env.HOME) {
            projectDir = process.env.HOME;
          } else if (process.env.USERPROFILE) {
            projectDir = process.env.USERPROFILE;
          } else {
            projectDir = '/';
          }
        }
      } else {
        projectDir = dirname(atom.project.path);
      }
      cwd = this.cwd || projectDir || this.userHome;
      return this.correctFilePath(cwd);
    };

    ATPOutputView.prototype.spawn = function(inputCmd, cmd, args) {
      var dataCallback, err, htmlStream, instance;
      this.spawnProcessActive = true;
      instance = this;
      dataCallback = function(data) {
        instance.message(data);
        return instance.scrollToBottom();
      };
      htmlStream = ansihtml();
      htmlStream.on('data', (function(_this) {
        return function(data) {
          return setTimeout(function() {
            return dataCallback(data);
          }, 100);
        };
      })(this));
      try {
        this.program = exec(inputCmd, {
          stdio: 'pipe',
          env: process.env,
          cwd: this.getCwd()
        });
        this.program.stdout.pipe(htmlStream);
        this.program.stderr.pipe(htmlStream);
        this.statusIcon.removeClass('status-success');
        this.statusIcon.removeClass('status-error');
        this.statusIcon.addClass('status-running');
        this.killBtn.removeClass('hide');
        this.program.once('exit', (function(_this) {
          return function(code) {
            if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
              console.log('exit', code);
            }
            _this.killBtn.addClass('hide');
            _this.statusIcon.removeClass('status-running');
            _this.program = null;
            _this.statusIcon.addClass(code === 0 && 'status-success' || 'status-error');
            _this.showCmd();
            return _this.spawnProcessActive = false;
          };
        })(this));
        this.program.on('error', (function(_this) {
          return function(err) {
            if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
              console.log('error');
            }
            _this.message(err.message);
            _this.showCmd();
            return _this.statusIcon.addClass('status-error');
          };
        })(this));
        this.program.stdout.on('data', (function(_this) {
          return function() {
            _this.flashIconClass('status-info');
            return _this.statusIcon.removeClass('status-error');
          };
        })(this));
        return this.program.stderr.on('data', (function(_this) {
          return function() {
            if (atom.config.get('atom-terminal-panel.logConsole') || _this.specsMode) {
              console.log('stderr');
            }
            return _this.flashIconClass('status-error', 300);
          };
        })(this));
      } catch (_error) {
        err = _error;
        this.message(err.message);
        return this.showCmd();
      }
    };

    return ATPOutputView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOzs7Ozs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLDRPQUFBO0lBQUE7Ozs7c0JBQUE7O0FBQUEsRUFRQSxjQUFBLEdBQWlCLElBUmpCLENBQUE7O0FBQUEsRUFVQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FWTCxDQUFBOztBQUFBLEVBV0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBWEwsQ0FBQTs7QUFBQSxFQVlBLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUEsQ0FBRCxFQUFJLHNCQUFBLGNBQUosRUFBb0IsWUFBQSxJQVpwQixDQUFBOztBQUFBLEVBYUEsUUFBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyxjQUFBLEtBQUQsRUFBUSxhQUFBLElBQVIsRUFBYyxpQkFBQSxRQWJkLENBQUE7O0FBQUEsRUFjQSxRQUFtQyxPQUFBLENBQVEsTUFBUixDQUFuQyxFQUFDLGdCQUFBLE9BQUQsRUFBVSxnQkFBQSxPQUFWLEVBQW1CLGdCQUFBLE9BQW5CLEVBQTRCLFlBQUEsR0FkNUIsQ0FBQTs7QUFBQSxFQWdCQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGtCQUFSLENBaEJYLENBQUE7O0FBQUEsRUFpQkEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBakJULENBQUE7O0FBQUEsRUFrQkEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxZQUFSLENBbEJSLENBQUE7O0FBQUEsRUFvQkEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLG9CQUFSLENBcEJ2QixDQUFBOztBQUFBLEVBcUJBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQXJCVixDQUFB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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp-view.coffee
