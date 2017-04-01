(function() {
  "use strict";
  var $, Beautifiers, CompositeDisposable, LoadingView, Promise, async, beautifier, beautify, beautifyDirectory, beautifyFile, beautifyFilePath, debug, defaultLanguageOptions, dir, fs, getCursors, getScrollTop, getUnsupportedOptions, handleSaveEvent, loadingView, logger, path, pkg, plugin, setCursors, setScrollTop, showError, strip, yaml, _;

  pkg = require('../package.json');

  plugin = module.exports;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ = require("lodash");

  Beautifiers = require("./beautifiers");

  beautifier = new Beautifiers();

  defaultLanguageOptions = beautifier.options;

  logger = require('./logger')(__filename);

  Promise = require('bluebird');

  fs = null;

  path = require("path");

  strip = null;

  yaml = null;

  async = null;

  dir = null;

  LoadingView = null;

  loadingView = null;

  $ = null;

  getScrollTop = function(editor) {
    var view;
    view = atom.views.getView(editor);
    return view != null ? view.getScrollTop() : void 0;
  };

  setScrollTop = function(editor, value) {
    var view;
    view = atom.views.getView(editor);
    return view != null ? view.setScrollTop(value) : void 0;
  };

  getCursors = function(editor) {
    var bufferPosition, cursor, cursors, posArray, _i, _len;
    cursors = editor.getCursors();
    posArray = [];
    for (_i = 0, _len = cursors.length; _i < _len; _i++) {
      cursor = cursors[_i];
      bufferPosition = cursor.getBufferPosition();
      posArray.push([bufferPosition.row, bufferPosition.column]);
    }
    return posArray;
  };

  setCursors = function(editor, posArray) {
    var bufferPosition, i, _i, _len;
    for (i = _i = 0, _len = posArray.length; _i < _len; i = ++_i) {
      bufferPosition = posArray[i];
      if (i === 0) {
        editor.setCursorBufferPosition(bufferPosition);
        continue;
      }
      editor.addCursorAtBufferPosition(bufferPosition);
    }
  };

  beautifier.on('beautify::start', function() {
    if (LoadingView == null) {
      LoadingView = require("./views/loading-view");
    }
    if (loadingView == null) {
      loadingView = new LoadingView();
    }
    return loadingView.show();
  });

  beautifier.on('beautify::end', function() {
    return loadingView != null ? loadingView.hide() : void 0;
  });

  showError = function(error) {
    var detail, stack, _ref;
    if (!atom.config.get("atom-beautify.general.muteAllErrors")) {
      stack = error.stack;
      detail = error.description || error.message;
      return (_ref = atom.notifications) != null ? _ref.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0;
    }
  };

  beautify = function(_arg) {
    var editor, onSave;
    editor = _arg.editor, onSave = _arg.onSave;
    return new Promise(function(resolve, reject) {
      var allOptions, beautifyCompleted, e, editedFilePath, forceEntireFile, grammarName, isSelection, oldText, text;
      plugin.checkUnsupportedOptions();
      if (path == null) {
        path = require("path");
      }
      forceEntireFile = onSave && atom.config.get("atom-beautify.general.beautifyEntireFileOnSave");
      beautifyCompleted = function(text) {
        var error, origScrollTop, posArray, selectedBufferRange;
        if (text == null) {

        } else if (text instanceof Error) {
          showError(text);
          return reject(text);
        } else if (typeof text === "string") {
          if (oldText !== text) {
            posArray = getCursors(editor);
            origScrollTop = getScrollTop(editor);
            if (!forceEntireFile && isSelection) {
              selectedBufferRange = editor.getSelectedBufferRange();
              editor.setTextInBufferRange(selectedBufferRange, text);
            } else {
              editor.setText(text);
            }
            setCursors(editor, posArray);
            setTimeout((function() {
              setScrollTop(editor, origScrollTop);
              return resolve(text);
            }), 0);
          }
        } else {
          error = new Error("Unsupported beautification result '" + text + "'.");
          showError(error);
          return reject(error);
        }
      };
      editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return showError(new Error("Active Editor not found. ", "Please select a Text Editor first to beautify."));
      }
      isSelection = !!editor.getSelectedText();
      editedFilePath = editor.getPath();
      allOptions = beautifier.getOptionsForPath(editedFilePath, editor);
      text = void 0;
      if (!forceEntireFile && isSelection) {
        text = editor.getSelectedText();
      } else {
        text = editor.getText();
      }
      oldText = text;
      grammarName = editor.getGrammar().name;
      try {
        beautifier.beautify(text, allOptions, grammarName, editedFilePath, {
          onSave: onSave
        }).then(beautifyCompleted)["catch"](beautifyCompleted);
      } catch (_error) {
        e = _error;
        showError(e);
      }
    });
  };

  beautifyFilePath = function(filePath, callback) {
    var $el, cb;
    logger.verbose('beautifyFilePath', filePath);
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
    $el.addClass('beautifying');
    cb = function(err, result) {
      logger.verbose('Cleanup beautifyFilePath', err, result);
      $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
      $el.removeClass('beautifying');
      return callback(err, result);
    };
    if (fs == null) {
      fs = require("fs");
    }
    logger.verbose('readFile', filePath);
    return fs.readFile(filePath, function(err, data) {
      var allOptions, completionFun, e, grammar, grammarName, input;
      logger.verbose('readFile completed', err, filePath);
      if (err) {
        return cb(err);
      }
      input = data != null ? data.toString() : void 0;
      grammar = atom.grammars.selectGrammar(filePath, input);
      grammarName = grammar.name;
      allOptions = beautifier.getOptionsForPath(filePath);
      logger.verbose('beautifyFilePath allOptions', allOptions);
      completionFun = function(output) {
        logger.verbose('beautifyFilePath completionFun', output);
        if (output instanceof Error) {
          return cb(output, null);
        } else if (typeof output === "string") {
          if (output.trim() === '') {
            logger.verbose('beautifyFilePath, output was empty string!');
            return cb(null, output);
          }
          return fs.writeFile(filePath, output, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, output);
          });
        } else {
          return cb(new Error("Unknown beautification result " + output + "."), output);
        }
      };
      try {
        logger.verbose('beautify', input, allOptions, grammarName, filePath);
        return beautifier.beautify(input, allOptions, grammarName, filePath).then(completionFun)["catch"](completionFun);
      } catch (_error) {
        e = _error;
        return cb(e);
      }
    });
  };

  beautifyFile = function(_arg) {
    var filePath, target;
    target = _arg.target;
    filePath = target.dataset.path;
    if (!filePath) {
      return;
    }
    beautifyFilePath(filePath, function(err, result) {
      if (err) {
        return showError(err);
      }
    });
  };

  beautifyDirectory = function(_arg) {
    var $el, dirPath, target;
    target = _arg.target;
    dirPath = target.dataset.path;
    if (!dirPath) {
      return;
    }
    if ((typeof atom !== "undefined" && atom !== null ? atom.confirm({
      message: "This will beautify all of the files found recursively in this directory, '" + dirPath + "'. Do you want to continue?",
      buttons: ['Yes, continue!', 'No, cancel!']
    }) : void 0) !== 0) {
      return;
    }
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
    $el.addClass('beautifying');
    if (dir == null) {
      dir = require("node-dir");
    }
    if (async == null) {
      async = require("async");
    }
    dir.files(dirPath, function(err, files) {
      if (err) {
        return showError(err);
      }
      return async.each(files, function(filePath, callback) {
        return beautifyFilePath(filePath, function() {
          return callback();
        });
      }, function(err) {
        $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
        return $el.removeClass('beautifying');
      });
    });
  };

  debug = function() {
    var GitHubApi, addHeader, addInfo, allOptions, beautifiers, codeBlockSyntax, debugInfo, detail, editor, error, filePath, github, grammarName, headers, language, linkifyTitle, open, selectedBeautifier, stack, text, tocEl, _ref, _ref1;
    try {
      open = require("open");
      if (fs == null) {
        fs = require("fs");
      }
      GitHubApi = require("github");
      github = new GitHubApi();
      plugin.checkUnsupportedOptions();
      editor = atom.workspace.getActiveTextEditor();
      linkifyTitle = function(title) {
        var p, sep;
        title = title.toLowerCase();
        p = title.split(/[\s,+#;,\/?:@&=+$]+/);
        sep = "-";
        return p.join(sep);
      };
      if (editor == null) {
        return confirm("Active Editor not found.\n" + "Please select a Text Editor first to beautify.");
      }
      if (!confirm('Are you ready to debug Atom Beautify?\n\n' + 'Warning: This will create an anonymous Gist on GitHub (publically accessible and cannot be easily deleted) ' + 'containing the contents of your active Text Editor.\n' + 'Be sure to delete any private text from your active Text Editor before continuing ' + 'to ensure you are not sharing undesirable private information.')) {
        return;
      }
      debugInfo = "";
      headers = [];
      tocEl = "<TABLEOFCONTENTS/>";
      addInfo = function(key, val) {
        if (key != null) {
          return debugInfo += "**" + key + "**: " + val + "\n\n";
        } else {
          return debugInfo += "" + val + "\n\n";
        }
      };
      addHeader = function(level, title) {
        debugInfo += "" + (Array(level + 1).join('#')) + " " + title + "\n\n";
        return headers.push({
          level: level,
          title: title
        });
      };
      addHeader(1, "Atom Beautify - Debugging information");
      debugInfo += "The following debugging information was " + ("generated by `Atom Beautify` on `" + (new Date()) + "`.") + "\n\n---\n\n" + tocEl + "\n\n---\n\n";
      addInfo('Platform', process.platform);
      addHeader(2, "Versions");
      addInfo('Atom Version', atom.appVersion);
      addInfo('Atom Beautify Version', pkg.version);
      addHeader(2, "Original file to be beautified");
      filePath = editor.getPath();
      addInfo('Original File Path', "`" + filePath + "`");
      grammarName = editor.getGrammar().name;
      addInfo('Original File Grammar', grammarName);
      language = beautifier.getLanguage(grammarName, filePath);
      addInfo('Original File Language', language != null ? language.name : void 0);
      addInfo('Language namespace', language != null ? language.namespace : void 0);
      beautifiers = beautifier.getBeautifiers(language.name);
      addInfo('Supported Beautifiers', _.map(beautifiers, 'name').join(', '));
      selectedBeautifier = beautifier.getBeautifierForLanguage(language);
      addInfo('Selected Beautifier', selectedBeautifier.name);
      text = editor.getText() || "";
      codeBlockSyntax = ((_ref = language != null ? language.name : void 0) != null ? _ref : grammarName).toLowerCase().split(' ')[0];
      addHeader(3, 'Original File Contents');
      addInfo(null, "\n```" + codeBlockSyntax + "\n" + text + "\n```");
      addHeader(3, 'Package Settings');
      addInfo(null, "The raw package settings options\n" + ("```json\n" + (JSON.stringify(atom.config.get('atom-beautify'), void 0, 4)) + "\n```"));
      addHeader(2, "Beautification options");
      allOptions = beautifier.getOptionsForPath(filePath, editor);
      return Promise.all(allOptions).then(function(allOptions) {
        var cb, configOptions, e, editorConfigOptions, editorOptions, finalOptions, homeOptions, logFilePathRegex, logs, preTransformedOptions, projectOptions, subscription;
        editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
        projectOptions = allOptions.slice(4);
        preTransformedOptions = beautifier.getOptionsForLanguage(allOptions, language);
        if (selectedBeautifier) {
          finalOptions = beautifier.transformOptions(selectedBeautifier, language.name, preTransformedOptions);
        }
        addInfo('Editor Options', "\n" + "Options from Atom Editor settings\n" + ("```json\n" + (JSON.stringify(editorOptions, void 0, 4)) + "\n```"));
        addInfo('Config Options', "\n" + "Options from Atom Beautify package settings\n" + ("```json\n" + (JSON.stringify(configOptions, void 0, 4)) + "\n```"));
        addInfo('Home Options', "\n" + ("Options from `" + (path.resolve(beautifier.getUserHome(), '.jsbeautifyrc')) + "`\n") + ("```json\n" + (JSON.stringify(homeOptions, void 0, 4)) + "\n```"));
        addInfo('EditorConfig Options', "\n" + "Options from [EditorConfig](http://editorconfig.org/) file\n" + ("```json\n" + (JSON.stringify(editorConfigOptions, void 0, 4)) + "\n```"));
        addInfo('Project Options', "\n" + ("Options from `.jsbeautifyrc` files starting from directory `" + (path.dirname(filePath)) + "` and going up to root\n") + ("```json\n" + (JSON.stringify(projectOptions, void 0, 4)) + "\n```"));
        addInfo('Pre-Transformed Options', "\n" + "Combined options before transforming them given a beautifier's specifications\n" + ("```json\n" + (JSON.stringify(preTransformedOptions, void 0, 4)) + "\n```"));
        if (selectedBeautifier) {
          addHeader(3, 'Final Options');
          addInfo(null, "Final combined and transformed options that are used\n" + ("```json\n" + (JSON.stringify(finalOptions, void 0, 4)) + "\n```"));
        }
        logs = "";
        logFilePathRegex = new RegExp('\\: \\[(.*)\\]');
        subscription = logger.onLogging(function(msg) {
          var sep;
          sep = path.sep;
          return logs += msg.replace(logFilePathRegex, function(a, b) {
            var i, p, s;
            s = b.split(sep);
            i = s.indexOf('atom-beautify');
            p = s.slice(i + 2).join(sep);
            return ': [' + p + ']';
          });
        });
        cb = function(result) {
          var JsDiff, bullet, diff, header, indent, indentNum, toc, _i, _len;
          subscription.dispose();
          addHeader(2, "Results");
          addInfo('Beautified File Contents', "\n```" + codeBlockSyntax + "\n" + result + "\n```");
          JsDiff = require('diff');
          if (typeof result === "string") {
            diff = JsDiff.createPatch(filePath || "", text || "", result || "", "original", "beautified");
            addInfo('Original vs. Beautified Diff', "\n```" + codeBlockSyntax + "\n" + diff + "\n```");
          }
          addHeader(3, "Logs");
          addInfo(null, "```\n" + logs + "\n```");
          toc = "## Table Of Contents\n";
          for (_i = 0, _len = headers.length; _i < _len; _i++) {
            header = headers[_i];

            /*
            - Heading 1
              - Heading 1.1
             */
            indent = "  ";
            bullet = "-";
            indentNum = header.level - 2;
            if (indentNum >= 0) {
              toc += "" + (Array(indentNum + 1).join(indent)) + bullet + " [" + header.title + "](\#" + (linkifyTitle(header.title)) + ")\n";
            }
          }
          debugInfo = debugInfo.replace(tocEl, toc);
          return github.gists.create({
            files: {
              "debug.md": {
                "content": debugInfo
              }
            },
            "public": true,
            description: "Atom-Beautify debugging information"
          }, function(err, res) {
            var body, gistUrl, issueTemplate;
            if (err) {
              return confirm("An error occurred when creating the Gist: " + err);
            } else {
              gistUrl = res.html_url;
              open(gistUrl);
              confirm(("Your Atom Beautify debugging information can be found in the public Gist:\n" + res.html_url + "\n\n") + 'Warning: Be sure to look over the debug info before you send it ' + 'to ensure you are not sharing undesirable private information.\n\n' + 'If you want to delete this anonymous Gist read\n' + 'https://help.github.com/articles/deleting-an-anonymous-gist/');
              if (!confirm("Would you like to create a new Issue on GitHub now?")) {
                return;
              }
              issueTemplate = fs.readFileSync(path.resolve(__dirname, "../ISSUE_TEMPLATE.md")).toString();
              body = issueTemplate.replace("<INSERT GIST HERE>", gistUrl);
              return open("https://github.com/Glavin001/atom-beautify/issues/new?body=" + (encodeURIComponent(body)));
            }
          });
        };
        try {
          return beautifier.beautify(text, allOptions, grammarName, filePath).then(cb)["catch"](cb);
        } catch (_error) {
          e = _error;
          return cb(e);
        }
      })["catch"](function(error) {
        var detail, stack, _ref1;
        stack = error.stack;
        detail = error.description || error.message;
        return typeof atom !== "undefined" && atom !== null ? (_ref1 = atom.notifications) != null ? _ref1.addError(error.message, {
          stack: stack,
          detail: detail,
          dismissable: true
        }) : void 0 : void 0;
      });
    } catch (_error) {
      error = _error;
      stack = error.stack;
      detail = error.description || error.message;
      return typeof atom !== "undefined" && atom !== null ? (_ref1 = atom.notifications) != null ? _ref1.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0 : void 0;
    }
  };

  handleSaveEvent = function() {
    return atom.workspace.observeTextEditors(function(editor) {
      var beautifyOnSaveHandler, disposable, pendingPaths;
      pendingPaths = {};
      beautifyOnSaveHandler = function(_arg) {
        var beautifyOnSave, buffer, fileExtension, filePath, grammar, key, language, languages;
        filePath = _arg.path;
        logger.verbose('Should beautify on this save?');
        if (pendingPaths[filePath]) {
          logger.verbose("Editor with file path " + filePath + " already beautified!");
          return;
        }
        buffer = editor.getBuffer();
        if (path == null) {
          path = require('path');
        }
        grammar = editor.getGrammar().name;
        fileExtension = path.extname(filePath);
        fileExtension = fileExtension.substr(1);
        languages = beautifier.languages.getLanguages({
          grammar: grammar,
          extension: fileExtension
        });
        if (languages.length < 1) {
          return;
        }
        language = languages[0];
        key = "atom-beautify." + language.namespace + ".beautify_on_save";
        beautifyOnSave = atom.config.get(key);
        logger.verbose('save editor positions', key, beautifyOnSave);
        if (beautifyOnSave) {
          logger.verbose('Beautifying file', filePath);
          return beautify({
            editor: editor,
            onSave: true
          }).then(function() {
            logger.verbose('Done beautifying file', filePath);
            if (editor.isAlive() === true) {
              logger.verbose('Saving TextEditor...');
              pendingPaths[filePath] = true;
              editor.save();
              delete pendingPaths[filePath];
              return logger.verbose('Saved TextEditor.');
            }
          })["catch"](function(error) {
            return showError(error);
          });
        }
      };
      disposable = editor.onDidSave(function(_arg) {
        var filePath;
        filePath = _arg.path;
        return beautifyOnSaveHandler({
          path: filePath
        });
      });
      return plugin.subscriptions.add(disposable);
    });
  };

  getUnsupportedOptions = function() {
    var schema, settings, unsupportedOptions;
    settings = atom.config.get('atom-beautify');
    schema = atom.config.getSchema('atom-beautify');
    unsupportedOptions = _.filter(_.keys(settings), function(key) {
      return schema.properties[key] === void 0;
    });
    return unsupportedOptions;
  };

  plugin.checkUnsupportedOptions = function() {
    var unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    if (unsupportedOptions.length !== 0) {
      return atom.notifications.addWarning("Please run Atom command 'Atom-Beautify: Migrate Settings'.", {
        detail: "You can open the Atom command palette with `cmd-shift-p` (OSX) or `ctrl-shift-p` (Linux/Windows) in Atom. You have unsupported options: " + (unsupportedOptions.join(', ')),
        dismissable: true
      });
    }
  };

  plugin.migrateSettings = function() {
    var namespaces, rename, rex, unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    namespaces = beautifier.languages.namespaces;
    if (unsupportedOptions.length === 0) {
      return atom.notifications.addSuccess("No options to migrate.");
    } else {
      rex = new RegExp("(" + (namespaces.join('|')) + ")_(.*)");
      rename = _.toPairs(_.zipObject(unsupportedOptions, _.map(unsupportedOptions, function(key) {
        var m;
        m = key.match(rex);
        if (m === null) {
          return "general." + key;
        } else {
          return "" + m[1] + "." + m[2];
        }
      })));
      _.each(rename, function(_arg) {
        var key, newKey, val;
        key = _arg[0], newKey = _arg[1];
        val = atom.config.get("atom-beautify." + key);
        atom.config.set("atom-beautify." + newKey, val);
        return atom.config.set("atom-beautify." + key, void 0);
      });
      return atom.notifications.addSuccess("Successfully migrated options: " + (unsupportedOptions.join(', ')));
    }
  };

  plugin.config = _.merge(require('./config.coffee'), defaultLanguageOptions);

  plugin.activate = function() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(handleSaveEvent());
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:beautify-editor", beautify));
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:help-debug-editor", debug));
    this.subscriptions.add(atom.commands.add(".tree-view .file .name", "atom-beautify:beautify-file", beautifyFile));
    this.subscriptions.add(atom.commands.add(".tree-view .directory .name", "atom-beautify:beautify-directory", beautifyDirectory));
    return this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:migrate-settings", plugin.migrateSettings));
  };

  plugin.deactivate = function() {
    return this.subscriptions.dispose();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSxnVkFBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsaUJBQVIsQ0FETixDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUpoQixDQUFBOztBQUFBLEVBS0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUxELENBQUE7O0FBQUEsRUFNQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FOSixDQUFBOztBQUFBLEVBT0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxlQUFSLENBUGQsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUEsQ0FSakIsQ0FBQTs7QUFBQSxFQVNBLHNCQUFBLEdBQXlCLFVBQVUsQ0FBQyxPQVRwQyxDQUFBOztBQUFBLEVBVUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQUEsQ0FBb0IsVUFBcEIsQ0FWVCxDQUFBOztBQUFBLEVBV0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBWFYsQ0FBQTs7QUFBQSxFQWNBLEVBQUEsR0FBSyxJQWRMLENBQUE7O0FBQUEsRUFlQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FmUCxDQUFBOztBQUFBLEVBZ0JBLEtBQUEsR0FBUSxJQWhCUixDQUFBOztBQUFBLEVBaUJBLElBQUEsR0FBTyxJQWpCUCxDQUFBOztBQUFBLEVBa0JBLEtBQUEsR0FBUSxJQWxCUixDQUFBOztBQUFBLEVBbUJBLEdBQUEsR0FBTSxJQW5CTixDQUFBOztBQUFBLEVBb0JBLFdBQUEsR0FBYyxJQXBCZCxDQUFBOztBQUFBLEVBcUJB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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautify.coffee
