
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  Class containing all builtin variables.
 */

(function() {
  var $, BuiltinVariables, dirname, extname, os, resolve, _ref;

  $ = include('atom-space-pen-views').$;

  _ref = include('path'), resolve = _ref.resolve, dirname = _ref.dirname, extname = _ref.extname;

  os = include('os');

  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        return o.handler();
      }
    }
  };

  BuiltinVariables = (function() {
    function BuiltinVariables() {}

    BuiltinVariables.prototype.list = {
      "%(project.root)": "first currently opened project directory",
      "%(project:INDEX)": "n-th currently opened project directory",
      "%(project.count)": "number of currently opened projects",
      "%(atom)": "atom directory.",
      "%(path)": "current working directory",
      "%(file)": "currenly opened file in the editor",
      "%(editor.path)": "path of the file currently opened in the editor",
      "%(editor.file)": "full path of the file currently opened in the editor",
      "%(editor.name)": "name of the file currently opened in the editor",
      "%(cwd)": "current working directory",
      "%(hostname)": "computer name",
      "%(computer-name)": "computer name",
      "%(username)": "currently logged in user",
      "%(user)": "currently logged in user",
      "%(home)": "home directory of the user",
      "%(osname)": "name of the operating system",
      "%(os)": "name of the operating system",
      "%(env.*)": "list of all available native environment variables",
      "%(.day)": "current date: day number (without leading zeros)",
      "%(.month)": "current date: month number (without leading zeros)",
      "%(.year)": "current date: year (without leading zeros)",
      "%(.hours)": "current date: hour 24-format (without leading zeros)",
      "%(.hours12)": "current date: hour 12-format (without leading zeros)",
      "%(.minutes)": "current date: minutes (without leading zeros)",
      "%(.seconds)": "current date: seconds (without leading zeros)",
      "%(.milis)": "current date: miliseconds (without leading zeros)",
      "%(day)": "current date: day number",
      "%(month)": "current date: month number",
      "%(year)": "current date: year",
      "%(hours)": "current date: hour 24-format",
      "%(hours12)": "current date: hour 12-format",
      "%(minutes)": "current date: minutes",
      "%(seconds)": "current date: seconds",
      "%(milis)": "current date: miliseconds",
      "%(ampm)": "displays am/pm (12-hour format)",
      "%(AMPM)": "displays AM/PM (12-hour format)",
      "%(line)": "input line number",
      "%(disc)": "current working directory disc name",
      "%(label:TYPE:TEXT": "(styling-annotation) creates a label of the specified type",
      "%(tooltip:TEXT:content:CONTENT)": "(styling-annotation) creates a tooltip message",
      "%(link)": "(styling-annotation) starts the file link - see %(endlink)",
      "%(endlink)": "(styling-annotation) ends the file link - see %(link)",
      "%(^)": "(styling-annotation) ends text formatting",
      "%(^COLOR)": "(styling-annotation) creates coloured text",
      "%(^b)": "(styling-annotation) creates bolded text",
      "%(^bold)": "(styling-annotation) creates bolded text",
      "%(^i)": "(styling-annotation) creates italics text",
      "%(^italics)": "(styling-annotation) creates italics text",
      "%(^u)": "(styling-annotation) creates underline text",
      "%(^underline)": "(styling-annotation) creates underline text",
      "%(^l)": "(styling-annotation) creates a line through the text",
      "%(^line-trough)": "(styling-annotation) creates a line through the text",
      "%(path:INDEX)": "refers to the %(path) components",
      "%(*)": "(only user-defined commands) refers to the all passed parameters",
      "%(*^)": "(only user-defined commands) refers to the full command string",
      "%(INDEX)": "(only user-defined commands) refers to the passed parameters",
      "%(raw)": "Makes the entire expression evaluated only when printing to output (delayed-evaluation)",
      "%(dynamic)": "Indicates that the expression should be dynamically updated."
    };

    BuiltinVariables.prototype.customVariables = [];

    BuiltinVariables.prototype.putVariable = function(entry) {
      this.customVariables.push(entry);
      return this.list['%(' + entry.name + ')'] = entry.description || "";
    };

    BuiltinVariables.prototype.removeAnnotation = function(consoleInstance, prompt) {
      return prompt.replace(/%\((?!cwd-original\))(?!file-original\))([^\(\)]*)\)/img, (function(_this) {
        return function(match, text, urlId) {
          return '';
        };
      })(this));
    };

    BuiltinVariables.prototype.parseHtml = function(consoleInstance, prompt, values, startRefreshTask) {
      var o;
      if (startRefreshTask == null) {
        startRefreshTask = true;
      }
      o = this.parseFull(consoleInstance, prompt, values, startRefreshTask);
      if (o.modif != null) {
        o.modif((function(_this) {
          return function(i) {
            i = consoleInstance.util.replaceAll('%(file-original)', consoleInstance.getCurrentFilePath(), i);
            i = consoleInstance.util.replaceAll('%(cwd-original)', consoleInstance.getCwd(), i);
            i = consoleInstance.util.replaceAll('&fs;', '/', i);
            i = consoleInstance.util.replaceAll('&bs;', '\\', i);
            return i;
          };
        })(this));
      }
      if (o.getHtml != null) {
        return o.getHtml();
      }
      return o;
    };

    BuiltinVariables.prototype.parse = function(consoleInstance, prompt, values) {
      var o;
      o = this.parseFull(consoleInstance, prompt, values);
      if (o.getText != null) {
        return o.getText();
      }
      return o;
    };

    BuiltinVariables.prototype.parseFull = function(consoleInstance, prompt, values, startRefreshTask) {
      var ampm, ampmC, atomPath, breadcrumbIdFwd, breadcrumbIdRwd, cmd, day, disc, dynamicExpressionUpdateDelay, entry, file, homelocation, hours, hours12, i, isDynamicExpression, key, m, milis, minutes, month, o, orig, osname, panelPath, pathBreadcrumbs, pathBreadcrumbsSize, preservedPathsString, projectPaths, projectPathsCount, repl, seconds, text, today, username, value, year, _i, _j, _k, _len, _ref1;
      if (startRefreshTask == null) {
        startRefreshTask = true;
      }
      orig = prompt;
      text = '';
      isDynamicExpression = false;
      dynamicExpressionUpdateDelay = 100;
      if (consoleInstance == null) {
        return '';
      }
      if (prompt == null) {
        return '';
      }
      cmd = null;
      file = consoleInstance.getCurrentFilePath();
      if (values != null) {
        if (values.cmd != null) {
          cmd = values.cmd;
        }
        if (values.file != null) {
          file = values.file;
        }
      }
      if ((!atom.config.get('atom-terminal-panel.parseSpecialTemplateTokens')) && (!consoleInstance.specsMode)) {
        consoleInstance.preserveOriginalPaths(prompt.replace(/%\([^ ]*\)/ig, ''));
      }
      if (prompt.indexOf('%') === -1) {
        consoleInstance.preserveOriginalPaths(prompt);
      }
      prompt.replace(/%\(dynamic:?([0-9]+)?\)/ig, (function(_this) {
        return function(match, p1) {
          if (p1 != null) {
            dynamicExpressionUpdateDelay = parseInt(p1);
          }
          isDynamicExpression = true;
          return '';
        };
      })(this));
      for (key in values) {
        value = values[key];
        if (key !== 'cmd' && key !== 'file') {
          prompt = consoleInstance.util.replaceAll("%(" + key + ")", value, prompt);
        }
      }
      if (prompt.indexOf('%(raw)') === -1) {
        panelPath = atom.packages.resolvePackagePath('atom-terminal-panel');
        atomPath = resolve(panelPath + '/../..');
        prompt = consoleInstance.util.replaceAll('%(atom)', atomPath, prompt);
        prompt = consoleInstance.util.replaceAll('%(path)', consoleInstance.getCwd(), prompt);
        prompt = consoleInstance.util.replaceAll('%(file)', file, prompt);
        prompt = consoleInstance.util.replaceAll('%(editor.path)', consoleInstance.getCurrentFileLocation(), prompt);
        prompt = consoleInstance.util.replaceAll('%(editor.file)', consoleInstance.getCurrentFilePath(), prompt);
        prompt = consoleInstance.util.replaceAll('%(editor.name)', consoleInstance.getCurrentFileName(), prompt);
        prompt = consoleInstance.util.replaceAll('%(cwd)', consoleInstance.getCwd(), prompt);
        prompt = consoleInstance.util.replaceAll('%(hostname)', os.hostname(), prompt);
        prompt = consoleInstance.util.replaceAll('%(computer-name)', os.hostname(), prompt);
        username = process.env.USERNAME || process.env.LOGNAME || process.env.USER;
        prompt = consoleInstance.util.replaceAll('%(username)', username, prompt);
        prompt = consoleInstance.util.replaceAll('%(user)', username, prompt);
        homelocation = process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR;
        prompt = consoleInstance.util.replaceAll('%(home)', homelocation, prompt);
        osname = process.platform || process.env.OS;
        prompt = consoleInstance.util.replaceAll('%(osname)', osname, prompt);
        prompt = consoleInstance.util.replaceAll('%(os)', osname, prompt);
        prompt = prompt.replace(/%\(env\.[A-Za-z_\*]*\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var nativeVarName, ret, _ref1;
            nativeVarName = match;
            nativeVarName = consoleInstance.util.replaceAll('%(env.', '', nativeVarName);
            nativeVarName = nativeVarName.substring(0, nativeVarName.length - 1);
            if (nativeVarName === '*') {
              ret = 'process.env {\n';
              _ref1 = process.env;
              for (key in _ref1) {
                value = _ref1[key];
                ret += '\t' + key + '\n';
              }
              ret += '}';
              return ret;
            }
            return process.env[nativeVarName];
          };
        })(this));
        if (cmd != null) {
          prompt = consoleInstance.util.replaceAll('%(command)', cmd, prompt);
        }
        today = new Date();
        day = today.getDate();
        month = today.getMonth() + 1;
        year = today.getFullYear();
        minutes = today.getMinutes();
        hours = today.getHours();
        hours12 = today.getHours() % 12;
        milis = today.getMilliseconds();
        seconds = today.getSeconds();
        ampm = 'am';
        ampmC = 'AM';
        if (hours >= 12) {
          ampm = 'pm';
          ampmC = 'PM';
        }
        prompt = consoleInstance.util.replaceAll('%(.day)', day, prompt);
        prompt = consoleInstance.util.replaceAll('%(.month)', month, prompt);
        prompt = consoleInstance.util.replaceAll('%(.year)', year, prompt);
        prompt = consoleInstance.util.replaceAll('%(.hours)', hours, prompt);
        prompt = consoleInstance.util.replaceAll('%(.hours12)', hours12, prompt);
        prompt = consoleInstance.util.replaceAll('%(.minutes)', minutes, prompt);
        prompt = consoleInstance.util.replaceAll('%(.seconds)', seconds, prompt);
        prompt = consoleInstance.util.replaceAll('%(.milis)', milis, prompt);
        if (seconds < 10) {
          seconds = '0' + seconds;
        }
        if (day < 10) {
          day = '0' + day;
        }
        if (month < 10) {
          month = '0' + month;
        }
        if (milis < 10) {
          milis = '000' + milis;
        } else if (milis < 100) {
          milis = '00' + milis;
        } else if (milis < 1000) {
          milis = '0' + milis;
        }
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        if (hours >= 12) {
          ampm = 'pm';
        }
        if (hours < 10) {
          hours = '0' + hours;
        }
        if (hours12 < 10) {
          hours12 = '0' + hours12;
        }
        prompt = consoleInstance.util.replaceAll('%(day)', day, prompt);
        prompt = consoleInstance.util.replaceAll('%(month)', month, prompt);
        prompt = consoleInstance.util.replaceAll('%(year)', year, prompt);
        prompt = consoleInstance.util.replaceAll('%(hours)', hours, prompt);
        prompt = consoleInstance.util.replaceAll('%(hours12)', hours12, prompt);
        prompt = consoleInstance.util.replaceAll('%(ampm)', ampm, prompt);
        prompt = consoleInstance.util.replaceAll('%(AMPM)', ampmC, prompt);
        prompt = consoleInstance.util.replaceAll('%(minutes)', minutes, prompt);
        prompt = consoleInstance.util.replaceAll('%(seconds)', seconds, prompt);
        prompt = consoleInstance.util.replaceAll('%(milis)', milis, prompt);
        prompt = consoleInstance.util.replaceAll('%(line)', consoleInstance.inputLine + 1, prompt);
        projectPaths = atom.project.getPaths();
        projectPathsCount = projectPaths.length - 1;
        prompt = consoleInstance.util.replaceAll('%(project.root)', projectPaths[0], prompt);
        prompt = consoleInstance.util.replaceAll('%(project.count)', projectPaths.length, prompt);
        for (i = _i = 0; _i <= projectPathsCount; i = _i += 1) {
          breadcrumbIdFwd = i - projectPathsCount - 1;
          breadcrumbIdRwd = i;
          prompt = consoleInstance.util.replaceAll("%(project:" + breadcrumbIdFwd + ")", projectPaths[i], prompt);
          prompt = consoleInstance.util.replaceAll("%(project:" + breadcrumbIdRwd + ")", projectPaths[i], prompt);
        }
        pathBreadcrumbs = consoleInstance.getCwd().split(/\\|\//ig);
        pathBreadcrumbs[0] = pathBreadcrumbs[0].charAt(0).toUpperCase() + pathBreadcrumbs[0].slice(1);
        disc = consoleInstance.util.replaceAll(':', '', pathBreadcrumbs[0]);
        prompt = consoleInstance.util.replaceAll('%(disc)', disc, prompt);
        pathBreadcrumbsSize = pathBreadcrumbs.length - 1;
        for (i = _j = 0; _j <= pathBreadcrumbsSize; i = _j += 1) {
          breadcrumbIdFwd = i - pathBreadcrumbsSize - 1;
          breadcrumbIdRwd = i;
          prompt = consoleInstance.util.replaceAll("%(path:" + breadcrumbIdFwd + ")", pathBreadcrumbs[i], prompt);
          prompt = consoleInstance.util.replaceAll("%(path:" + breadcrumbIdRwd + ")", pathBreadcrumbs[i], prompt);
        }
        prompt = prompt.replace(/%\(tooltip:[^\n\t\[\]{}%\)\(]*\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var content, target, target_tokens;
            target = consoleInstance.util.replaceAll('%(tooltip:', '', match);
            target = target.substring(0, target.length - 1);
            target_tokens = target.split(':content:');
            target = target_tokens[0];
            content = target_tokens[1];
            return "<font data-toggle=\"tooltip\" data-placement=\"top\" title=\"" + target + "\">" + content + "</font>";
          };
        })(this));
        if (prompt.indexOf('%(link:') !== -1) {
          throw 'Error:\nUsage of %(link:) is deprecated.\nUse %(link)target%(endlink) notation\ninstead of %(link:target)!\nAt: [' + prompt + ']';
        }
        prompt = prompt.replace(/%\(link\)[^%]*%\(endlink\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var ret, target;
            target = match;
            target = consoleInstance.util.replaceAll('%(link)', '', target);
            target = consoleInstance.util.replaceAll('%(endlink)', '', target);
            ret = consoleInstance.consoleLink(target, true);
            return ret;
          };
        })(this));
        prompt = prompt.replace(/%\(\^[^\s\(\)]*\)/ig, (function(_this) {
          return function(match, text, urlId) {
            var target;
            target = consoleInstance.util.replaceAll('%(^', '', match);
            target = target.substring(0, target.length - 1);
            if (target === '') {
              return '</font>';
            } else if (target.charAt(0) === '#') {
              return "<font style=\"color:" + target + ";\">";
            } else if (target === 'b' || target === 'bold') {
              return "<font style=\"font-weight:bold;\">";
            } else if (target === 'u' || target === 'underline') {
              return "<font style=\"text-decoration:underline;\">";
            } else if (target === 'i' || target === 'italic') {
              return "<font style=\"font-style:italic;\">";
            } else if (target === 'l' || target === 'line-through') {
              return "<font style=\"text-decoration:line-through;\">";
            }
            return '';
          };
        })(this));
        if ((atom.config.get('atom-terminal-panel.enableConsoleLabels')) || consoleInstance.specsMode) {
          prompt = prompt.replace(/%\(label:[^\n\t\[\]{}%\)\(]*\)/ig, (function(_this) {
            return function(match, text, urlId) {
              var content, target, target_tokens;
              target = consoleInstance.util.replaceAll('%(label:', '', match);
              target = target.substring(0, target.length - 1);
              target_tokens = target.split(':text:');
              target = target_tokens[0];
              content = target_tokens[1];
              return consoleInstance.consoleLabel(target, content);
            };
          })(this));
        } else {
          prompt = prompt.replace(/%\(label:[^\n\t\[\]{}%\)\(]*\)/ig, (function(_this) {
            return function(match, text, urlId) {
              var content, target, target_tokens;
              target = consoleInstance.util.replaceAll('%(label:', '', match);
              target = target.substring(0, target.length - 1);
              target_tokens = target.split(':text:');
              target = target_tokens[0];
              content = target_tokens[1];
              return content;
            };
          })(this));
        }
        _ref1 = this.customVariables;
        for (_k = 0, _len = _ref1.length; _k < _len; _k++) {
          entry = _ref1[_k];
          if (prompt.indexOf('%(' + entry.name + ')') > -1) {
            repl = entry.variable(consoleInstance);
            if (repl != null) {
              prompt = consoleInstance.util.replaceAll('%(' + entry.name + ')', repl, prompt);
            }
          }
        }
        preservedPathsString = consoleInstance.preserveOriginalPaths(prompt);
        text = this.removeAnnotation(consoleInstance, preservedPathsString);
      } else {
        text = prompt;
      }
      o = {
        enclosedVarInstance: null,
        text: text,
        isDynamicExpression: isDynamicExpression,
        dynamicExpressionUpdateDelay: dynamicExpressionUpdateDelay,
        orig: orig,
        textModifiers: [],
        modif: function(modifier) {
          this.textModifiers.push(modifier);
          return this;
        },
        runTextModifiers: function(input) {
          var _l, _ref2;
          for (i = _l = 0, _ref2 = this.textModifiers.length - 1; _l <= _ref2; i = _l += 1) {
            input = this.textModifiers[i](input) || input;
          }
          return input;
        },
        getText: function() {
          return this.runTextModifiers(this.text);
        },
        getHtml: function() {
          var htmlObj, refresh, refreshTask, taskRunning;
          htmlObj = $('<span>' + this.runTextModifiers(this.text) + '</span>');
          taskRunning = false;
          if (window.taskWorkingThreadsNumber == null) {
            window.taskWorkingThreadsNumber = 0;
          }
          refresh = (function(_this) {
            return function() {
              var t;
              t = _this.enclosedVarInstance.parseHtml(consoleInstance, _this.orig, values, false);
              htmlObj.html('');
              return htmlObj.append(t);
            };
          })(this);
          refreshTask = (function(_this) {
            return function() {
              if (_this.dynamicExpressionUpdateDelay <= 0 || !taskRunning) {
                --window.taskWorkingThreadsNumber;
                return;
              }
              return setTimeout(function() {
                refresh();
                return refreshTask();
              }, _this.dynamicExpressionUpdateDelay);
            };
          })(this);
          if (startRefreshTask && this.isDynamicExpression) {
            taskRunning = true;
            htmlObj.bind('destroyed', function() {
              return taskRunning = false;
            });
            ++window.taskWorkingThreadsNumber;
            refreshTask();
          }
          return htmlObj;
        }
      };
      m = function(i) {
        i = consoleInstance.util.replaceAll('%(file-original)', consoleInstance.getCurrentFilePath(), i);
        i = consoleInstance.util.replaceAll('%(cwd-original)', consoleInstance.getCwd(), i);
        i = consoleInstance.util.replaceAll('&fs;', '/', i);
        i = consoleInstance.util.replaceAll('&bs;', '\\', i);
        return i;
      };
      o.modif(m);
      o.enclosedVarInstance = this;
      return o;
    };

    return BuiltinVariables;

  })();

  module.exports = new BuiltinVariables();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAtYnVpbHRpbnMtdmFyaWFibGVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7Ozs7OztHQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEsd0RBQUE7O0FBQUEsRUFRQyxJQUFLLE9BQUEsQ0FBUSxzQkFBUixFQUFMLENBUkQsQ0FBQTs7QUFBQSxFQVNBLE9BQThCLE9BQUEsQ0FBUSxNQUFSLENBQTlCLEVBQUMsZUFBQSxPQUFELEVBQVUsZUFBQSxPQUFWLEVBQW1CLGVBQUEsT0FUbkIsQ0FBQTs7QUFBQSxFQVVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQVZMLENBQUE7O0FBQUEsRUFZQSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFoQixHQUE0QjtBQUFBLElBQzFCLE1BQUEsRUFBUSxTQUFDLENBQUQsR0FBQTtBQUNOLE1BQUEsSUFBRyxDQUFDLENBQUMsT0FBTDtlQUNFLENBQUMsQ0FBQyxPQUFGLENBQUEsRUFERjtPQURNO0lBQUEsQ0FEa0I7R0FaNUIsQ0FBQTs7QUFBQSxFQWtCTTtrQ0FDSjs7QUFBQSwrQkFBQSxJQUFBLEdBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQW9CLDBDQUFwQjtBQUFBLE1BQ0Esa0JBQUEsRUFBcUIseUNBRHJCO0FBQUEsTUFFQSxrQkFBQSxFQUFxQixxQ0FGckI7QUFBQSxNQUdBLFNBQUEsRUFBWSxpQkFIWjtBQUFBLE1BSUEsU0FBQSxFQUFZLDJCQUpaO0FBQUEsTUFLQSxTQUFBLEVBQVksb0NBTFo7QUFBQSxNQU1BLGdCQUFBLEVBQW1CLGlEQU5uQjtBQUFBLE1BT0EsZ0JBQUEsRUFBbUIsc0RBUG5CO0FBQUEsTUFRQSxnQkFBQSxFQUFtQixpREFSbkI7QUFBQSxNQVNBLFFBQUEsRUFBVywyQkFUWDtBQUFBLE1BVUEsYUFBQSxFQUFnQixlQVZoQjtBQUFBLE1BV0Esa0JBQUEsRUFBcUIsZUFYckI7QUFBQSxNQVlBLGFBQUEsRUFBZ0IsMEJBWmhCO0FBQUEsTUFhQSxTQUFBLEVBQVksMEJBYlo7QUFBQSxNQWNBLFNBQUEsRUFBWSw0QkFkWjtBQUFBLE1BZUEsV0FBQSxFQUFjLDhCQWZkO0FBQUEsTUFnQkEsT0FBQSxFQUFVLDhCQWhCVjtBQUFBLE1BaUJBLFVBQUEsRUFBYSxvREFqQmI7QUFBQSxNQWtCQSxTQUFBLEVBQVksa0RBbEJaO0FBQUEsTUFtQkEsV0FBQSxFQUFjLG9EQW5CZDtBQUFBLE1Bb0JBLFVBQUEsRUFBYSw0Q0FwQmI7QUFBQSxNQXFCQSxXQUFBLEVBQWMsc0RBckJkO0FBQUEsTUFzQkEsYUFBQSxFQUFnQixzREF0QmhCO0FBQUEsTUF1QkEsYUFBQSxFQUFnQiwrQ0F2QmhCO0FBQUEsTUF3QkEsYUFBQSxFQUFnQiwrQ0F4QmhCO0FBQUEsTUF5QkEsV0FBQSxFQUFjLG1EQXpCZDtBQUFBLE1BMEJBLFFBQUEsRUFBVywwQkExQlg7QUFBQSxNQTJCQSxVQUFBLEVBQWEsNEJBM0JiO0FBQUEsTUE0QkEsU0FBQSxFQUFZLG9CQTVCWjtBQUFBLE1BNkJBLFVBQUEsRUFBYSw4QkE3QmI7QUFBQSxNQThCQSxZQUFBLEVBQWUsOEJBOUJmO0FBQUEsTUErQkEsWUFBQSxFQUFlLHVCQS9CZjtBQUFBLE1BZ0NBLFlBQUEsRUFBZSx1QkFoQ2Y7QUFBQSxNQWlDQSxVQUFBLEVBQWEsMkJBakNiO0FBQUEsTUFrQ0EsU0FBQSxFQUFZLGlDQWxDWjtBQUFBLE1BbUNBLFNBQUEsRUFBWSxpQ0FuQ1o7QUFBQSxNQW9DQSxTQUFBLEVBQVksbUJBcENaO0FBQUEsTUFxQ0EsU0FBQSxFQUFZLHFDQXJDWjtBQUFBLE1Bc0NBLG1CQUFBLEVBQXFCLDREQXRDckI7QUFBQSxNQXVDQSxpQ0FBQSxFQUFtQyxnREF2Q25DO0FBQUEsTUF3Q0EsU0FBQSxFQUFXLDREQXhDWDtBQUFBLE1BeUNBLFlBQUEsRUFBYyx1REF6Q2Q7QUFBQSxNQTBDQSxNQUFBLEVBQVEsMkNBMUNSO0FBQUEsTUEyQ0EsV0FBQSxFQUFhLDRDQTNDYjtBQUFBLE1BNENBLE9BQUEsRUFBUywwQ0E1Q1Q7QUFBQSxNQTZDQSxVQUFBLEVBQVksMENBN0NaO0FBQUEsTUE4Q0EsT0FBQSxFQUFTLDJDQTlDVDtBQUFBLE1BK0NBLGFBQUEsRUFBZSwyQ0EvQ2Y7QUFBQSxNQWdEQSxPQUFBLEVBQVMsNkNBaERUO0FBQUEsTUFpREEsZUFBQSxFQUFpQiw2Q0FqRGpCO0FBQUEsTUFrREEsT0FBQSxFQUFTLHNEQWxEVDtBQUFBLE1BbURBLGlCQUFBLEVBQW1CLHNEQW5EbkI7QUFBQSxNQW9EQSxlQUFBLEVBQWlCLGtDQXBEakI7QUFBQSxNQXFEQSxNQUFBLEVBQVEsa0VBckRSO0FBQUEsTUFzREEsT0FBQSxFQUFTLGdFQXREVDtBQUFBLE1BdURBLFVBQUEsRUFBWSw4REF2RFo7QUFBQSxNQXdEQSxRQUFBLEVBQVUseUZBeERWO0FBQUEsTUF5REEsWUFBQSxFQUFjLDhEQXpEZDtLQURGLENBQUE7O0FBQUEsK0JBMkRBLGVBQUEsR0FBaUIsRUEzRGpCLENBQUE7O0FBQUEsK0JBNkRBLFdBQUEsR0FBYSxTQUFDLEtBQUQsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixLQUF0QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsSUFBSyxDQUFBLElBQUEsR0FBSyxLQUFLLENBQUMsSUFBWCxHQUFnQixHQUFoQixDQUFOLEdBQTZCLEtBQUssQ0FBQyxXQUFOLElBQXFCLEdBRnZDO0lBQUEsQ0E3RGIsQ0FBQTs7QUFBQSwrQkFpRUEsZ0JBQUEsR0FBa0IsU0FBQyxlQUFELEVBQWtCLE1BQWxCLEdBQUE7QUFDaEIsYUFBTyxNQUFNLENBQUMsT0FBUCxDQUFlLHlEQUFmLEVBQTBFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsS0FBZCxHQUFBO0FBQy9FLGlCQUFPLEVBQVAsQ0FEK0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExRSxDQUFQLENBRGdCO0lBQUEsQ0FqRWxCLENBQUE7O0FBQUEsK0JBcUVBLFNBQUEsR0FBVyxTQUFDLGVBQUQsRUFBa0IsTUFBbEIsRUFBMEIsTUFBMUIsRUFBa0MsZ0JBQWxDLEdBQUE7QUFDVCxVQUFBLENBQUE7O1FBRDJDLG1CQUFpQjtPQUM1RDtBQUFBLE1BQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxTQUFELENBQVcsZUFBWCxFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxFQUE0QyxnQkFBNUMsQ0FBSixDQUFBO0FBQ0EsTUFBQSxJQUFHLGVBQUg7QUFDRSxRQUFBLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFDLENBQUQsR0FBQTtBQUNOLFlBQUEsQ0FBQSxHQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0Msa0JBQWhDLEVBQW9ELGVBQWUsQ0FBQyxrQkFBaEIsQ0FBQSxDQUFwRCxFQUEwRixDQUExRixDQUFKLENBQUE7QUFBQSxZQUNBLENBQUEsR0FBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLGlCQUFoQyxFQUFtRCxlQUFlLENBQUMsTUFBaEIsQ0FBQSxDQUFuRCxFQUE2RSxDQUE3RSxDQURKLENBQUE7QUFBQSxZQUVBLENBQUEsR0FBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLE1BQWhDLEVBQXdDLEdBQXhDLEVBQTZDLENBQTdDLENBRkosQ0FBQTtBQUFBLFlBR0EsQ0FBQSxHQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsTUFBaEMsRUFBd0MsSUFBeEMsRUFBOEMsQ0FBOUMsQ0FISixDQUFBO0FBSUEsbUJBQU8sQ0FBUCxDQUxNO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixDQUFBLENBREY7T0FEQTtBQVFBLE1BQUEsSUFBRyxpQkFBSDtBQUNFLGVBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBQSxDQUFQLENBREY7T0FSQTtBQVVBLGFBQU8sQ0FBUCxDQVhTO0lBQUEsQ0FyRVgsQ0FBQTs7QUFBQSwrQkFrRkEsS0FBQSxHQUFPLFNBQUMsZUFBRCxFQUFrQixNQUFsQixFQUEwQixNQUExQixHQUFBO0FBQ0wsVUFBQSxDQUFBO0FBQUEsTUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxlQUFYLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLENBQUosQ0FBQTtBQUNBLE1BQUEsSUFBRyxpQkFBSDtBQUNFLGVBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBQSxDQUFQLENBREY7T0FEQTtBQUdBLGFBQU8sQ0FBUCxDQUpLO0lBQUEsQ0FsRlAsQ0FBQTs7QUFBQSwrQkF3RkEsU0FBQSxHQUFXLFNBQUMsZUFBRCxFQUFrQixNQUFsQixFQUEwQixNQUExQixFQUFrQyxnQkFBbEMsR0FBQTtBQUVULFVBQUEsNFlBQUE7O1FBRjJDLG1CQUFpQjtPQUU1RDtBQUFBLE1BQUEsSUFBQSxHQUFPLE1BQVAsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLEVBRFAsQ0FBQTtBQUFBLE1BRUEsbUJBQUEsR0FBc0IsS0FGdEIsQ0FBQTtBQUFBLE1BR0EsNEJBQUEsR0FBK0IsR0FIL0IsQ0FBQTtBQUtBLE1BQUEsSUFBTyx1QkFBUDtBQUNFLGVBQU8sRUFBUCxDQURGO09BTEE7QUFPQSxNQUFBLElBQU8sY0FBUDtBQUNFLGVBQU8sRUFBUCxDQURGO09BUEE7QUFBQSxNQVVBLEdBQUEsR0FBTSxJQVZOLENBQUE7QUFBQSxNQVdBLElBQUEsR0FBTyxlQUFlLENBQUMsa0JBQWhCLENBQUEsQ0FYUCxDQUFBO0FBWUEsTUFBQSxJQUFHLGNBQUg7QUFDRSxRQUFBLElBQUcsa0JBQUg7QUFDRSxVQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsR0FBYixDQURGO1NBQUE7QUFFQSxRQUFBLElBQUcsbUJBQUg7QUFDRSxVQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsSUFBZCxDQURGO1NBSEY7T0FaQTtBQWtCQSxNQUFBLElBQUcsQ0FBQyxDQUFBLElBQVEsQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnREFBaEIsQ0FBTCxDQUFBLElBQTRFLENBQUMsQ0FBQSxlQUFtQixDQUFDLFNBQXJCLENBQS9FO0FBQ0UsUUFBQSxlQUFlLENBQUMscUJBQWhCLENBQXVDLE1BQU0sQ0FBQyxPQUFQLENBQWUsY0FBZixFQUErQixFQUEvQixDQUF2QyxDQUFBLENBREY7T0FsQkE7QUFxQkEsTUFBQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsR0FBZixDQUFBLEtBQXVCLENBQUEsQ0FBMUI7QUFDRSxRQUFBLGVBQWUsQ0FBQyxxQkFBaEIsQ0FBc0MsTUFBdEMsQ0FBQSxDQURGO09BckJBO0FBQUEsTUF3QkEsTUFBTSxDQUFDLE9BQVAsQ0FBZSwyQkFBZixFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEVBQVEsRUFBUixHQUFBO0FBQzFDLFVBQUEsSUFBRyxVQUFIO0FBQ0UsWUFBQSw0QkFBQSxHQUErQixRQUFBLENBQVMsRUFBVCxDQUEvQixDQURGO1dBQUE7QUFBQSxVQUVBLG1CQUFBLEdBQXNCLElBRnRCLENBQUE7QUFHQSxpQkFBTyxFQUFQLENBSjBDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUMsQ0F4QkEsQ0FBQTtBQThCQSxXQUFBLGFBQUE7NEJBQUE7QUFDRSxRQUFBLElBQUcsR0FBQSxLQUFPLEtBQVAsSUFBaUIsR0FBQSxLQUFPLE1BQTNCO0FBQ0UsVUFBQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFpQyxJQUFBLEdBQUksR0FBSixHQUFRLEdBQXpDLEVBQTZDLEtBQTdDLEVBQW9ELE1BQXBELENBQVQsQ0FERjtTQURGO0FBQUEsT0E5QkE7QUFrQ0EsTUFBQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixDQUFBLEtBQTRCLENBQUEsQ0FBL0I7QUFDRSxRQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFkLENBQWlDLHFCQUFqQyxDQUFaLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsU0FBQSxHQUFVLFFBQWxCLENBRFgsQ0FBQTtBQUFBLFFBR0EsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsU0FBaEMsRUFBMkMsUUFBM0MsRUFBcUQsTUFBckQsQ0FIVCxDQUFBO0FBQUEsUUFJQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxTQUFoQyxFQUEyQyxlQUFlLENBQUMsTUFBaEIsQ0FBQSxDQUEzQyxFQUFxRSxNQUFyRSxDQUpULENBQUE7QUFBQSxRQUtBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFNBQWhDLEVBQTJDLElBQTNDLEVBQWlELE1BQWpELENBTFQsQ0FBQTtBQUFBLFFBTUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsZ0JBQWhDLEVBQWtELGVBQWUsQ0FBQyxzQkFBaEIsQ0FBQSxDQUFsRCxFQUE0RixNQUE1RixDQU5ULENBQUE7QUFBQSxRQU9BLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLGdCQUFoQyxFQUFrRCxlQUFlLENBQUMsa0JBQWhCLENBQUEsQ0FBbEQsRUFBd0YsTUFBeEYsQ0FQVCxDQUFBO0FBQUEsUUFRQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxnQkFBaEMsRUFBa0QsZUFBZSxDQUFDLGtCQUFoQixDQUFBLENBQWxELEVBQXdGLE1BQXhGLENBUlQsQ0FBQTtBQUFBLFFBU0EsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsUUFBaEMsRUFBMEMsZUFBZSxDQUFDLE1BQWhCLENBQUEsQ0FBMUMsRUFBb0UsTUFBcEUsQ0FUVCxDQUFBO0FBQUEsUUFVQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxhQUFoQyxFQUErQyxFQUFFLENBQUMsUUFBSCxDQUFBLENBQS9DLEVBQThELE1BQTlELENBVlQsQ0FBQTtBQUFBLFFBV0EsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0Msa0JBQWhDLEVBQW9ELEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBcEQsRUFBbUUsTUFBbkUsQ0FYVCxDQUFBO0FBQUEsUUFhQSxRQUFBLEdBQVcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFaLElBQXdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBcEMsSUFBK0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQWJ0RSxDQUFBO0FBQUEsUUFjQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxhQUFoQyxFQUErQyxRQUEvQyxFQUF5RCxNQUF6RCxDQWRULENBQUE7QUFBQSxRQWVBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFNBQWhDLEVBQTJDLFFBQTNDLEVBQXFELE1BQXJELENBZlQsQ0FBQTtBQUFBLFFBaUJBLFlBQUEsR0FBZSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQVosSUFBb0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFoQyxJQUE0QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BakJ2RSxDQUFBO0FBQUEsUUFrQkEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsU0FBaEMsRUFBMkMsWUFBM0MsRUFBeUQsTUFBekQsQ0FsQlQsQ0FBQTtBQUFBLFFBb0JBLE1BQUEsR0FBUyxPQUFPLENBQUMsUUFBUixJQUFvQixPQUFPLENBQUMsR0FBRyxDQUFDLEVBcEJ6QyxDQUFBO0FBQUEsUUFxQkEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsV0FBaEMsRUFBNkMsTUFBN0MsRUFBcUQsTUFBckQsQ0FyQlQsQ0FBQTtBQUFBLFFBc0JBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLE9BQWhDLEVBQXlDLE1BQXpDLEVBQWlELE1BQWpELENBdEJULENBQUE7QUFBQSxRQXdCQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSwwQkFBZixFQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxLQUFkLEdBQUE7QUFDbEQsZ0JBQUEseUJBQUE7QUFBQSxZQUFBLGFBQUEsR0FBZ0IsS0FBaEIsQ0FBQTtBQUFBLFlBQ0EsYUFBQSxHQUFnQixlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFFBQWhDLEVBQTBDLEVBQTFDLEVBQThDLGFBQTlDLENBRGhCLENBQUE7QUFBQSxZQUVBLGFBQUEsR0FBZ0IsYUFBYSxDQUFDLFNBQWQsQ0FBd0IsQ0FBeEIsRUFBMkIsYUFBYSxDQUFDLE1BQWQsR0FBcUIsQ0FBaEQsQ0FGaEIsQ0FBQTtBQUdBLFlBQUEsSUFBRyxhQUFBLEtBQWlCLEdBQXBCO0FBQ0UsY0FBQSxHQUFBLEdBQU0saUJBQU4sQ0FBQTtBQUNBO0FBQUEsbUJBQUEsWUFBQTttQ0FBQTtBQUNFLGdCQUFBLEdBQUEsSUFBTyxJQUFBLEdBQU8sR0FBUCxHQUFhLElBQXBCLENBREY7QUFBQSxlQURBO0FBQUEsY0FHQSxHQUFBLElBQU8sR0FIUCxDQUFBO0FBSUEscUJBQU8sR0FBUCxDQUxGO2FBSEE7QUFVQSxtQkFBTyxPQUFPLENBQUMsR0FBSSxDQUFBLGFBQUEsQ0FBbkIsQ0FYa0Q7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQXhCVCxDQUFBO0FBc0NBLFFBQUEsSUFBRyxXQUFIO0FBQ0UsVUFBQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxZQUFoQyxFQUE4QyxHQUE5QyxFQUFtRCxNQUFuRCxDQUFULENBREY7U0F0Q0E7QUFBQSxRQXdDQSxLQUFBLEdBQVksSUFBQSxJQUFBLENBQUEsQ0F4Q1osQ0FBQTtBQUFBLFFBeUNBLEdBQUEsR0FBTSxLQUFLLENBQUMsT0FBTixDQUFBLENBekNOLENBQUE7QUFBQSxRQTBDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFBLEdBQWlCLENBMUN6QixDQUFBO0FBQUEsUUEyQ0EsSUFBQSxHQUFPLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0EzQ1AsQ0FBQTtBQUFBLFFBNENBLE9BQUEsR0FBVSxLQUFLLENBQUMsVUFBTixDQUFBLENBNUNWLENBQUE7QUFBQSxRQTZDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQTdDUixDQUFBO0FBQUEsUUE4Q0EsT0FBQSxHQUFVLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBQSxHQUFtQixFQTlDN0IsQ0FBQTtBQUFBLFFBK0NBLEtBQUEsR0FBUSxLQUFLLENBQUMsZUFBTixDQUFBLENBL0NSLENBQUE7QUFBQSxRQWdEQSxPQUFBLEdBQVUsS0FBSyxDQUFDLFVBQU4sQ0FBQSxDQWhEVixDQUFBO0FBQUEsUUFpREEsSUFBQSxHQUFPLElBakRQLENBQUE7QUFBQSxRQWtEQSxLQUFBLEdBQVEsSUFsRFIsQ0FBQTtBQW9EQSxRQUFBLElBQUcsS0FBQSxJQUFTLEVBQVo7QUFDRSxVQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxVQUNBLEtBQUEsR0FBUSxJQURSLENBREY7U0FwREE7QUFBQSxRQXdEQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxTQUFoQyxFQUEyQyxHQUEzQyxFQUFnRCxNQUFoRCxDQXhEVCxDQUFBO0FBQUEsUUF5REEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsV0FBaEMsRUFBNkMsS0FBN0MsRUFBb0QsTUFBcEQsQ0F6RFQsQ0FBQTtBQUFBLFFBMERBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFVBQWhDLEVBQTRDLElBQTVDLEVBQWtELE1BQWxELENBMURULENBQUE7QUFBQSxRQTJEQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxXQUFoQyxFQUE2QyxLQUE3QyxFQUFvRCxNQUFwRCxDQTNEVCxDQUFBO0FBQUEsUUE0REEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsYUFBaEMsRUFBK0MsT0FBL0MsRUFBd0QsTUFBeEQsQ0E1RFQsQ0FBQTtBQUFBLFFBNkRBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLGFBQWhDLEVBQStDLE9BQS9DLEVBQXdELE1BQXhELENBN0RULENBQUE7QUFBQSxRQThEQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxhQUFoQyxFQUErQyxPQUEvQyxFQUF3RCxNQUF4RCxDQTlEVCxDQUFBO0FBQUEsUUErREEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsV0FBaEMsRUFBNkMsS0FBN0MsRUFBb0QsTUFBcEQsQ0EvRFQsQ0FBQTtBQWlFQSxRQUFBLElBQUcsT0FBQSxHQUFVLEVBQWI7QUFDRSxVQUFBLE9BQUEsR0FBVSxHQUFBLEdBQU0sT0FBaEIsQ0FERjtTQWpFQTtBQW1FQSxRQUFBLElBQUcsR0FBQSxHQUFNLEVBQVQ7QUFDRSxVQUFBLEdBQUEsR0FBTSxHQUFBLEdBQU0sR0FBWixDQURGO1NBbkVBO0FBcUVBLFFBQUEsSUFBRyxLQUFBLEdBQVEsRUFBWDtBQUNFLFVBQUEsS0FBQSxHQUFRLEdBQUEsR0FBTSxLQUFkLENBREY7U0FyRUE7QUF1RUEsUUFBQSxJQUFHLEtBQUEsR0FBUSxFQUFYO0FBQ0UsVUFBQSxLQUFBLEdBQVEsS0FBQSxHQUFRLEtBQWhCLENBREY7U0FBQSxNQUVLLElBQUcsS0FBQSxHQUFRLEdBQVg7QUFDSCxVQUFBLEtBQUEsR0FBUSxJQUFBLEdBQU8sS0FBZixDQURHO1NBQUEsTUFFQSxJQUFHLEtBQUEsR0FBUSxJQUFYO0FBQ0gsVUFBQSxLQUFBLEdBQVEsR0FBQSxHQUFNLEtBQWQsQ0FERztTQTNFTDtBQTZFQSxRQUFBLElBQUcsT0FBQSxHQUFVLEVBQWI7QUFDRSxVQUFBLE9BQUEsR0FBVSxHQUFBLEdBQU0sT0FBaEIsQ0FERjtTQTdFQTtBQStFQSxRQUFBLElBQUcsS0FBQSxJQUFTLEVBQVo7QUFDRSxVQUFBLElBQUEsR0FBTyxJQUFQLENBREY7U0EvRUE7QUFpRkEsUUFBQSxJQUFHLEtBQUEsR0FBUSxFQUFYO0FBQ0UsVUFBQSxLQUFBLEdBQVEsR0FBQSxHQUFNLEtBQWQsQ0FERjtTQWpGQTtBQW1GQSxRQUFBLElBQUcsT0FBQSxHQUFVLEVBQWI7QUFDRSxVQUFBLE9BQUEsR0FBVSxHQUFBLEdBQU0sT0FBaEIsQ0FERjtTQW5GQTtBQUFBLFFBc0ZBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFFBQWhDLEVBQTBDLEdBQTFDLEVBQStDLE1BQS9DLENBdEZULENBQUE7QUFBQSxRQXVGQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxVQUFoQyxFQUE0QyxLQUE1QyxFQUFtRCxNQUFuRCxDQXZGVCxDQUFBO0FBQUEsUUF3RkEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsU0FBaEMsRUFBMkMsSUFBM0MsRUFBaUQsTUFBakQsQ0F4RlQsQ0FBQTtBQUFBLFFBeUZBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFVBQWhDLEVBQTRDLEtBQTVDLEVBQW1ELE1BQW5ELENBekZULENBQUE7QUFBQSxRQTBGQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxZQUFoQyxFQUE4QyxPQUE5QyxFQUF1RCxNQUF2RCxDQTFGVCxDQUFBO0FBQUEsUUEyRkEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsU0FBaEMsRUFBMkMsSUFBM0MsRUFBaUQsTUFBakQsQ0EzRlQsQ0FBQTtBQUFBLFFBNEZBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFNBQWhDLEVBQTJDLEtBQTNDLEVBQWtELE1BQWxELENBNUZULENBQUE7QUFBQSxRQTZGQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxZQUFoQyxFQUE4QyxPQUE5QyxFQUF1RCxNQUF2RCxDQTdGVCxDQUFBO0FBQUEsUUE4RkEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsWUFBaEMsRUFBOEMsT0FBOUMsRUFBdUQsTUFBdkQsQ0E5RlQsQ0FBQTtBQUFBLFFBK0ZBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFVBQWhDLEVBQTRDLEtBQTVDLEVBQW1ELE1BQW5ELENBL0ZULENBQUE7QUFBQSxRQWdHQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxTQUFoQyxFQUEyQyxlQUFlLENBQUMsU0FBaEIsR0FBMEIsQ0FBckUsRUFBd0UsTUFBeEUsQ0FoR1QsQ0FBQTtBQUFBLFFBa0dBLFlBQUEsR0FBZSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQWxHZixDQUFBO0FBQUEsUUFtR0EsaUJBQUEsR0FBb0IsWUFBWSxDQUFDLE1BQWIsR0FBc0IsQ0FuRzFDLENBQUE7QUFBQSxRQW9HQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxpQkFBaEMsRUFBbUQsWUFBYSxDQUFBLENBQUEsQ0FBaEUsRUFBb0UsTUFBcEUsQ0FwR1QsQ0FBQTtBQUFBLFFBcUdBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLGtCQUFoQyxFQUFvRCxZQUFZLENBQUMsTUFBakUsRUFBeUUsTUFBekUsQ0FyR1QsQ0FBQTtBQXNHQSxhQUFTLGdEQUFULEdBQUE7QUFDRSxVQUFBLGVBQUEsR0FBa0IsQ0FBQSxHQUFFLGlCQUFGLEdBQW9CLENBQXRDLENBQUE7QUFBQSxVQUNBLGVBQUEsR0FBa0IsQ0FEbEIsQ0FBQTtBQUFBLFVBRUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBaUMsWUFBQSxHQUFZLGVBQVosR0FBNEIsR0FBN0QsRUFBaUUsWUFBYSxDQUFBLENBQUEsQ0FBOUUsRUFBa0YsTUFBbEYsQ0FGVCxDQUFBO0FBQUEsVUFHQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFpQyxZQUFBLEdBQVksZUFBWixHQUE0QixHQUE3RCxFQUFpRSxZQUFhLENBQUEsQ0FBQSxDQUE5RSxFQUFrRixNQUFsRixDQUhULENBREY7QUFBQSxTQXRHQTtBQUFBLFFBNEdBLGVBQUEsR0FBa0IsZUFBZSxDQUFDLE1BQWhCLENBQUEsQ0FBd0IsQ0FBQyxLQUF6QixDQUErQixTQUEvQixDQTVHbEIsQ0FBQTtBQUFBLFFBNkdBLGVBQWdCLENBQUEsQ0FBQSxDQUFoQixHQUFxQixlQUFnQixDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQW5CLENBQTBCLENBQTFCLENBQTRCLENBQUMsV0FBN0IsQ0FBQSxDQUFBLEdBQTZDLGVBQWdCLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBbkIsQ0FBeUIsQ0FBekIsQ0E3R2xFLENBQUE7QUFBQSxRQThHQSxJQUFBLEdBQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxHQUFoQyxFQUFxQyxFQUFyQyxFQUF5QyxlQUFnQixDQUFBLENBQUEsQ0FBekQsQ0E5R1AsQ0FBQTtBQUFBLFFBK0dBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWdDLFNBQWhDLEVBQTJDLElBQTNDLEVBQWlELE1BQWpELENBL0dULENBQUE7QUFBQSxRQWlIQSxtQkFBQSxHQUFzQixlQUFlLENBQUMsTUFBaEIsR0FBeUIsQ0FqSC9DLENBQUE7QUFrSEEsYUFBUyxrREFBVCxHQUFBO0FBQ0UsVUFBQSxlQUFBLEdBQWtCLENBQUEsR0FBRSxtQkFBRixHQUFzQixDQUF4QyxDQUFBO0FBQUEsVUFDQSxlQUFBLEdBQWtCLENBRGxCLENBQUE7QUFBQSxVQUVBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWlDLFNBQUEsR0FBUyxlQUFULEdBQXlCLEdBQTFELEVBQThELGVBQWdCLENBQUEsQ0FBQSxDQUE5RSxFQUFrRixNQUFsRixDQUZULENBQUE7QUFBQSxVQUdBLE1BQUEsR0FBUyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQXJCLENBQWlDLFNBQUEsR0FBUyxlQUFULEdBQXlCLEdBQTFELEVBQThELGVBQWdCLENBQUEsQ0FBQSxDQUE5RSxFQUFrRixNQUFsRixDQUhULENBREY7QUFBQSxTQWxIQTtBQUFBLFFBd0hBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFlLG9DQUFmLEVBQXFELENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLEtBQWQsR0FBQTtBQUM1RCxnQkFBQSw4QkFBQTtBQUFBLFlBQUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsWUFBaEMsRUFBOEMsRUFBOUMsRUFBa0QsS0FBbEQsQ0FBVCxDQUFBO0FBQUEsWUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakIsRUFBb0IsTUFBTSxDQUFDLE1BQVAsR0FBYyxDQUFsQyxDQURULENBQUE7QUFBQSxZQUVBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLEtBQVAsQ0FBYSxXQUFiLENBRmhCLENBQUE7QUFBQSxZQUdBLE1BQUEsR0FBUyxhQUFjLENBQUEsQ0FBQSxDQUh2QixDQUFBO0FBQUEsWUFJQSxPQUFBLEdBQVUsYUFBYyxDQUFBLENBQUEsQ0FKeEIsQ0FBQTtBQUtBLG1CQUFRLCtEQUFBLEdBQStELE1BQS9ELEdBQXNFLEtBQXRFLEdBQTJFLE9BQTNFLEdBQW1GLFNBQTNGLENBTjREO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckQsQ0F4SFQsQ0FBQTtBQWtJQSxRQUFBLElBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxTQUFmLENBQUEsS0FBNkIsQ0FBQSxDQUFoQztBQUNFLGdCQUFNLG1IQUFBLEdBQW9ILE1BQXBILEdBQTJILEdBQWpJLENBREY7U0FsSUE7QUFBQSxRQXFJQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSw4QkFBZixFQUErQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxLQUFkLEdBQUE7QUFDdEQsZ0JBQUEsV0FBQTtBQUFBLFlBQUEsTUFBQSxHQUFTLEtBQVQsQ0FBQTtBQUFBLFlBQ0EsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsU0FBaEMsRUFBMkMsRUFBM0MsRUFBK0MsTUFBL0MsQ0FEVCxDQUFBO0FBQUEsWUFFQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxZQUFoQyxFQUE4QyxFQUE5QyxFQUFrRCxNQUFsRCxDQUZULENBQUE7QUFBQSxZQUlBLEdBQUEsR0FBTSxlQUFlLENBQUMsV0FBaEIsQ0FBNEIsTUFBNUIsRUFBb0MsSUFBcEMsQ0FKTixDQUFBO0FBS0EsbUJBQU8sR0FBUCxDQU5zRDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9DLENBcklULENBQUE7QUFBQSxRQTZJQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxxQkFBZixFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsS0FBRCxFQUFRLElBQVIsRUFBYyxLQUFkLEdBQUE7QUFDN0MsZ0JBQUEsTUFBQTtBQUFBLFlBQUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsS0FBaEMsRUFBdUMsRUFBdkMsRUFBMkMsS0FBM0MsQ0FBVCxDQUFBO0FBQUEsWUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakIsRUFBb0IsTUFBTSxDQUFDLE1BQVAsR0FBYyxDQUFsQyxDQURULENBQUE7QUFHQSxZQUFBLElBQUcsTUFBQSxLQUFVLEVBQWI7QUFDRSxxQkFBTyxTQUFQLENBREY7YUFBQSxNQUVLLElBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFkLENBQUEsS0FBb0IsR0FBdkI7QUFDSCxxQkFBUSxzQkFBQSxHQUFzQixNQUF0QixHQUE2QixNQUFyQyxDQURHO2FBQUEsTUFFQSxJQUFHLE1BQUEsS0FBVSxHQUFWLElBQWlCLE1BQUEsS0FBVSxNQUE5QjtBQUNILHFCQUFPLG9DQUFQLENBREc7YUFBQSxNQUVBLElBQUcsTUFBQSxLQUFVLEdBQVYsSUFBaUIsTUFBQSxLQUFVLFdBQTlCO0FBQ0gscUJBQU8sNkNBQVAsQ0FERzthQUFBLE1BRUEsSUFBRyxNQUFBLEtBQVUsR0FBVixJQUFpQixNQUFBLEtBQVUsUUFBOUI7QUFDSCxxQkFBTyxxQ0FBUCxDQURHO2FBQUEsTUFFQSxJQUFHLE1BQUEsS0FBVSxHQUFWLElBQWlCLE1BQUEsS0FBVSxjQUE5QjtBQUNILHFCQUFPLGdEQUFQLENBREc7YUFiTDtBQWVBLG1CQUFPLEVBQVAsQ0FoQjZDO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsQ0E3SVQsQ0FBQTtBQStKQSxRQUFBLElBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUNBQWhCLENBQUQsQ0FBQSxJQUErRCxlQUFlLENBQUMsU0FBbEY7QUFDRSxVQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsT0FBUCxDQUFlLGtDQUFmLEVBQW1ELENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLEtBQWQsR0FBQTtBQUMxRCxrQkFBQSw4QkFBQTtBQUFBLGNBQUEsTUFBQSxHQUFTLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsVUFBaEMsRUFBNEMsRUFBNUMsRUFBZ0QsS0FBaEQsQ0FBVCxDQUFBO0FBQUEsY0FDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakIsRUFBb0IsTUFBTSxDQUFDLE1BQVAsR0FBYyxDQUFsQyxDQURULENBQUE7QUFBQSxjQUVBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLEtBQVAsQ0FBYSxRQUFiLENBRmhCLENBQUE7QUFBQSxjQUdBLE1BQUEsR0FBUyxhQUFjLENBQUEsQ0FBQSxDQUh2QixDQUFBO0FBQUEsY0FJQSxPQUFBLEdBQVUsYUFBYyxDQUFBLENBQUEsQ0FKeEIsQ0FBQTtBQUtBLHFCQUFPLGVBQWUsQ0FBQyxZQUFoQixDQUE2QixNQUE3QixFQUFxQyxPQUFyQyxDQUFQLENBTjBEO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkQsQ0FBVCxDQURGO1NBQUEsTUFBQTtBQVNFLFVBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsa0NBQWYsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTttQkFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsS0FBZCxHQUFBO0FBQzFELGtCQUFBLDhCQUFBO0FBQUEsY0FBQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxVQUFoQyxFQUE0QyxFQUE1QyxFQUFnRCxLQUFoRCxDQUFULENBQUE7QUFBQSxjQUNBLE1BQUEsR0FBUyxNQUFNLENBQUMsU0FBUCxDQUFpQixDQUFqQixFQUFvQixNQUFNLENBQUMsTUFBUCxHQUFjLENBQWxDLENBRFQsQ0FBQTtBQUFBLGNBRUEsYUFBQSxHQUFnQixNQUFNLENBQUMsS0FBUCxDQUFhLFFBQWIsQ0FGaEIsQ0FBQTtBQUFBLGNBR0EsTUFBQSxHQUFTLGFBQWMsQ0FBQSxDQUFBLENBSHZCLENBQUE7QUFBQSxjQUlBLE9BQUEsR0FBVSxhQUFjLENBQUEsQ0FBQSxDQUp4QixDQUFBO0FBS0EscUJBQU8sT0FBUCxDQU4wRDtZQUFBLEVBQUE7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELENBQVQsQ0FURjtTQS9KQTtBQWdMQTtBQUFBLGFBQUEsNENBQUE7NEJBQUE7QUFDRSxVQUFBLElBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxJQUFBLEdBQUssS0FBSyxDQUFDLElBQVgsR0FBZ0IsR0FBL0IsQ0FBQSxHQUFzQyxDQUFBLENBQXpDO0FBQ0UsWUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBZSxlQUFmLENBQVAsQ0FBQTtBQUNBLFlBQUEsSUFBRyxZQUFIO0FBQ0UsY0FBQSxNQUFBLEdBQVMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxJQUFBLEdBQUssS0FBSyxDQUFDLElBQVgsR0FBZ0IsR0FBaEQsRUFBcUQsSUFBckQsRUFBMkQsTUFBM0QsQ0FBVCxDQURGO2FBRkY7V0FERjtBQUFBLFNBaExBO0FBQUEsUUFzTEEsb0JBQUEsR0FBdUIsZUFBZSxDQUFDLHFCQUFoQixDQUFzQyxNQUF0QyxDQXRMdkIsQ0FBQTtBQUFBLFFBdUxBLElBQUEsR0FBTyxJQUFDLENBQUEsZ0JBQUQsQ0FBbUIsZUFBbkIsRUFBb0Msb0JBQXBDLENBdkxQLENBREY7T0FBQSxNQUFBO0FBMExFLFFBQUEsSUFBQSxHQUFPLE1BQVAsQ0ExTEY7T0FsQ0E7QUFBQSxNQStOQSxDQUFBLEdBQUk7QUFBQSxRQUNGLG1CQUFBLEVBQXFCLElBRG5CO0FBQUEsUUFFRixJQUFBLEVBQU0sSUFGSjtBQUFBLFFBR0YsbUJBQUEsRUFBcUIsbUJBSG5CO0FBQUEsUUFJRiw0QkFBQSxFQUE4Qiw0QkFKNUI7QUFBQSxRQUtGLElBQUEsRUFBTSxJQUxKO0FBQUEsUUFNRixhQUFBLEVBQWUsRUFOYjtBQUFBLFFBT0YsS0FBQSxFQUFPLFNBQUMsUUFBRCxHQUFBO0FBQ0wsVUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsQ0FBQSxDQUFBO0FBQ0EsaUJBQU8sSUFBUCxDQUZLO1FBQUEsQ0FQTDtBQUFBLFFBVUYsZ0JBQUEsRUFBa0IsU0FBQyxLQUFELEdBQUE7QUFDaEIsY0FBQSxTQUFBO0FBQUEsZUFBUywyRUFBVCxHQUFBO0FBQ0UsWUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLGFBQWMsQ0FBQSxDQUFBLENBQWYsQ0FBa0IsS0FBbEIsQ0FBQSxJQUE0QixLQUFwQyxDQURGO0FBQUEsV0FBQTtBQUVBLGlCQUFPLEtBQVAsQ0FIZ0I7UUFBQSxDQVZoQjtBQUFBLFFBY0YsT0FBQSxFQUFTLFNBQUEsR0FBQTtBQUNQLGlCQUFPLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsSUFBbkIsQ0FBUCxDQURPO1FBQUEsQ0FkUDtBQUFBLFFBZ0JGLE9BQUEsRUFBUyxTQUFBLEdBQUE7QUFDUCxjQUFBLDBDQUFBO0FBQUEsVUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLFFBQUEsR0FBUyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBQyxDQUFBLElBQW5CLENBQVQsR0FBa0MsU0FBcEMsQ0FBVixDQUFBO0FBQUEsVUFDQSxXQUFBLEdBQWMsS0FEZCxDQUFBO0FBRUEsVUFBQSxJQUFPLHVDQUFQO0FBQ0UsWUFBQSxNQUFNLENBQUMsd0JBQVAsR0FBa0MsQ0FBbEMsQ0FERjtXQUZBO0FBQUEsVUFLQSxPQUFBLEdBQVUsQ0FBQSxTQUFBLEtBQUEsR0FBQTttQkFBQSxTQUFBLEdBQUE7QUFDUixrQkFBQSxDQUFBO0FBQUEsY0FBQSxDQUFBLEdBQUksS0FBQyxDQUFBLG1CQUFtQixDQUFDLFNBQXJCLENBQStCLGVBQS9CLEVBQWdELEtBQUMsQ0FBQSxJQUFqRCxFQUF1RCxNQUF2RCxFQUErRCxLQUEvRCxDQUFKLENBQUE7QUFBQSxjQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBYixDQURBLENBQUE7cUJBRUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxDQUFmLEVBSFE7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxWLENBQUE7QUFBQSxVQVNBLFdBQUEsR0FBYyxDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUEsR0FBQTtBQUNaLGNBQUEsSUFBRyxLQUFDLENBQUEsNEJBQUQsSUFBK0IsQ0FBL0IsSUFBb0MsQ0FBQSxXQUF2QztBQUNFLGdCQUFBLEVBQUEsTUFBUSxDQUFDLHdCQUFULENBQUE7QUFFQSxzQkFBQSxDQUhGO2VBQUE7cUJBSUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULGdCQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7dUJBQ0EsV0FBQSxDQUFBLEVBRlM7Y0FBQSxDQUFYLEVBR0MsS0FBQyxDQUFBLDRCQUhGLEVBTFk7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVRkLENBQUE7QUFrQkEsVUFBQSxJQUFHLGdCQUFBLElBQXFCLElBQUMsQ0FBQSxtQkFBekI7QUFDRSxZQUFBLFdBQUEsR0FBYyxJQUFkLENBQUE7QUFBQSxZQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWEsV0FBYixFQUEwQixTQUFBLEdBQUE7cUJBQ3hCLFdBQUEsR0FBYyxNQURVO1lBQUEsQ0FBMUIsQ0FEQSxDQUFBO0FBQUEsWUFHQSxFQUFBLE1BQVEsQ0FBQyx3QkFIVCxDQUFBO0FBQUEsWUFLQSxXQUFBLENBQUEsQ0FMQSxDQURGO1dBbEJBO0FBeUJBLGlCQUFPLE9BQVAsQ0ExQk87UUFBQSxDQWhCUDtPQS9OSixDQUFBO0FBQUEsTUEyUUEsQ0FBQSxHQUFJLFNBQUMsQ0FBRCxHQUFBO0FBQ0YsUUFBQSxDQUFBLEdBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxrQkFBaEMsRUFBb0QsZUFBZSxDQUFDLGtCQUFoQixDQUFBLENBQXBELEVBQTBGLENBQTFGLENBQUosQ0FBQTtBQUFBLFFBQ0EsQ0FBQSxHQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsaUJBQWhDLEVBQW1ELGVBQWUsQ0FBQyxNQUFoQixDQUFBLENBQW5ELEVBQTZFLENBQTdFLENBREosQ0FBQTtBQUFBLFFBRUEsQ0FBQSxHQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBckIsQ0FBZ0MsTUFBaEMsRUFBd0MsR0FBeEMsRUFBNkMsQ0FBN0MsQ0FGSixDQUFBO0FBQUEsUUFHQSxDQUFBLEdBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFyQixDQUFnQyxNQUFoQyxFQUF3QyxJQUF4QyxFQUE4QyxDQUE5QyxDQUhKLENBQUE7QUFJQSxlQUFPLENBQVAsQ0FMRTtNQUFBLENBM1FKLENBQUE7QUFBQSxNQWlSQSxDQUFDLENBQUMsS0FBRixDQUFRLENBQVIsQ0FqUkEsQ0FBQTtBQUFBLE1Ba1JBLENBQUMsQ0FBQyxtQkFBRixHQUF3QixJQWxSeEIsQ0FBQTtBQW1SQSxhQUFPLENBQVAsQ0FyUlM7SUFBQSxDQXhGWCxDQUFBOzs0QkFBQTs7TUFuQkYsQ0FBQTs7QUFBQSxFQWtZQSxNQUFNLENBQUMsT0FBUCxHQUNNLElBQUEsZ0JBQUEsQ0FBQSxDQW5ZTixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp-builtins-variables.coffee
