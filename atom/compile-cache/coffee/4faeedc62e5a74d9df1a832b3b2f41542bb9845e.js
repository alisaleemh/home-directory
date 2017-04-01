(function() {
  var CompositeDisposable, Emitter, Logger, Metrics, os, path, ref, ref1,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  os = require('os');

  path = require('path');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = [], Metrics = ref1[0], Logger = ref1[1];

  window.DEBUG = false;

  module.exports = {
    config: {
      useKite: {
        type: 'boolean',
        "default": true,
        order: 0,
        title: 'Use Kite-powered Completions (macOS only)',
        description: 'Kite is a cloud powered autocomplete engine. It provides\nsignificantly more autocomplete suggestions than the local Jedi engine.'
      },
      showDescriptions: {
        type: 'boolean',
        "default": true,
        order: 1,
        title: 'Show Descriptions',
        description: 'Show doc strings from functions, classes, etc.'
      },
      useSnippets: {
        type: 'string',
        "default": 'none',
        order: 2,
        "enum": ['none', 'all', 'required'],
        title: 'Autocomplete Function Parameters',
        description: 'Automatically complete function arguments after typing\nleft parenthesis character. Use completion key to jump between\narguments. See `autocomplete-python:complete-arguments` command if you\nwant to trigger argument completions manually. See README if it does not\nwork for you.'
      },
      pythonPaths: {
        type: 'string',
        "default": '',
        order: 3,
        title: 'Python Executable Paths',
        description: 'Optional semicolon separated list of paths to python\nexecutables (including executable names), where the first one will take\nhigher priority over the last one. By default autocomplete-python will\nautomatically look for virtual environments inside of your project and\ntry to use them as well as try to find global python executable. If you\nuse this config, automatic lookup will have lowest priority.\nUse `$PROJECT` or `$PROJECT_NAME` substitution for project-specific\npaths to point on executables in virtual environments.\nFor example:\n`/Users/name/.virtualenvs/$PROJECT_NAME/bin/python;$PROJECT/venv/bin/python3;/usr/bin/python`.\nSuch config will fall back on `/usr/bin/python` for projects not presented\nwith same name in `.virtualenvs` and without `venv` folder inside of one\nof project folders.\nIf you are using python3 executable while coding for python2 you will get\npython2 completions for some built-ins.'
      },
      extraPaths: {
        type: 'string',
        "default": '',
        order: 4,
        title: 'Extra Paths For Packages',
        description: 'Semicolon separated list of modules to additionally\ninclude for autocomplete. You can use same substitutions as in\n`Python Executable Paths`.\nNote that it still should be valid python package.\nFor example:\n`$PROJECT/env/lib/python2.7/site-packages`\nor\n`/User/name/.virtualenvs/$PROJECT_NAME/lib/python2.7/site-packages`.\nYou don\'t need to specify extra paths for libraries installed with python\nexecutable you use.'
      },
      caseInsensitiveCompletion: {
        type: 'boolean',
        "default": true,
        order: 5,
        title: 'Case Insensitive Completion',
        description: 'The completion is by default case insensitive.'
      },
      triggerCompletionRegex: {
        type: 'string',
        "default": '([\.\ (]|[a-zA-Z_][a-zA-Z0-9_]*)',
        order: 6,
        title: 'Regex To Trigger Autocompletions',
        description: 'By default completions triggered after words, dots, spaces\nand left parenthesis. You will need to restart your editor after changing\nthis.'
      },
      fuzzyMatcher: {
        type: 'boolean',
        "default": true,
        order: 7,
        title: 'Use Fuzzy Matcher For Completions.',
        description: 'Typing `stdr` will match `stderr`.\nFirst character should always match. Uses additional caching thus\ncompletions should be faster. Note that this setting does not affect\nbuilt-in autocomplete-plus provider.'
      },
      outputProviderErrors: {
        type: 'boolean',
        "default": false,
        order: 8,
        title: 'Output Provider Errors',
        description: 'Select if you would like to see the provider errors when\nthey happen. By default they are hidden. Note that critical errors are\nalways shown.'
      },
      outputDebug: {
        type: 'boolean',
        "default": false,
        order: 9,
        title: 'Output Debug Logs',
        description: 'Select if you would like to see debug information in\ndeveloper tools logs. May slow down your editor.'
      },
      showTooltips: {
        type: 'boolean',
        "default": false,
        order: 10,
        title: 'Show Tooltips with information about the object under the cursor',
        description: 'EXPERIMENTAL FEATURE WHICH IS NOT FINISHED YET.\nFeedback and ideas are welcome on github.'
      },
      suggestionPriority: {
        type: 'integer',
        "default": 3,
        minimum: 0,
        maximum: 99,
        order: 11,
        title: 'Suggestion Priority',
        description: 'You can use this to set the priority for autocomplete-python\nsuggestions. For example, you can use lower value to give higher priority\nfor snippets completions which has priority of 2.'
      }
    },
    installation: null,
    _handleGrammarChangeEvent: function(grammar) {
      var ref2;
      if ((ref2 = grammar.packageName) === 'language-python' || ref2 === 'MagicPython' || ref2 === 'atom-django') {
        this.provider.load();
        this.emitter.emit('did-load-provider');
        return this.disposables.dispose();
      }
    },
    _loadKite: function() {
      var AccountManager, AtomHelper, DecisionMaker, Installation, Installer, StateController, checkKiteInstallation, dm, editorCfg, event, firstInstall, longRunning, pluginCfg, ref2;
      firstInstall = localStorage.getItem('autocomplete-python.installed') === null;
      localStorage.setItem('autocomplete-python.installed', true);
      longRunning = require('process').uptime() > 10;
      if (firstInstall && longRunning) {
        event = "installed";
      } else if (firstInstall) {
        event = "upgraded";
      } else {
        event = "restarted";
      }
      ref2 = require('kite-installer'), AccountManager = ref2.AccountManager, AtomHelper = ref2.AtomHelper, DecisionMaker = ref2.DecisionMaker, Installation = ref2.Installation, Installer = ref2.Installer, Metrics = ref2.Metrics, Logger = ref2.Logger, StateController = ref2.StateController;
      if (atom.config.get('kite.loggingLevel')) {
        Logger.LEVEL = Logger.LEVELS[atom.config.get('kite.loggingLevel').toUpperCase()];
      }
      AccountManager.initClient('alpha.kite.com', -1, true);
      atom.views.addViewProvider(Installation, function(m) {
        return m.element;
      });
      editorCfg = {
        UUID: localStorage.getItem('metrics.userId'),
        name: 'atom'
      };
      pluginCfg = {
        name: 'autocomplete-python'
      };
      dm = new DecisionMaker(editorCfg, pluginCfg);
      Metrics.Tracker.name = "atom acp";
      atom.packages.onDidActivatePackage((function(_this) {
        return function(pkg) {
          if (pkg.name === 'kite') {
            _this.patchKiteCompletions(pkg);
            return Metrics.Tracker.name = "atom kite+acp";
          }
        };
      })(this));
      checkKiteInstallation = (function(_this) {
        return function() {
          var canInstall, throttle;
          if (!atom.config.get('autocomplete-python.useKite')) {
            return;
          }
          canInstall = StateController.canInstallKite();
          throttle = dm.shouldOfferKite(event);
          if (atom.config.get('autocomplete-python.useKite')) {
            return Promise.all([throttle, canInstall]).then(function(values) {
              var installer, pane, projectPath, root, title, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = values[0];
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              title = "Choose a autocomplete-python engine";
              _this.installation = new Installation(variant, title);
              _this.installation.accountCreated(function() {
                _this.track("account created");
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                _this.track("flow aborted");
                return atom.config.set('autocomplete-python.useKite', false);
              });
              projectPath = atom.project.getPaths()[0];
              root = (projectPath != null) && path.relative(os.homedir(), projectPath).indexOf('..') === 0 ? path.parse(projectPath).root : os.homedir();
              installer = new Installer([root]);
              installer.init(_this.installation.flow, function() {
                Logger.verbose('in onFinish');
                return atom.packages.activatePackage('kite');
              });
              pane = atom.workspace.getActivePane();
              _this.installation.flow.onSkipInstall(function() {
                atom.config.set('autocomplete-python.useKite', false);
                _this.track("skipped kite");
                return pane.destroyActiveItem();
              });
              pane.addItem(_this.installation, {
                index: 0
              });
              return pane.activateItemAtIndex(0);
            }, function(err) {
              if (err.type === 'denied') {
                return atom.config.set('autocomplete-python.useKite', false);
              }
            });
          }
        };
      })(this);
      checkKiteInstallation();
      return atom.config.onDidChange('autocomplete-python.useKite', function(arg) {
        var newValue, oldValue;
        newValue = arg.newValue, oldValue = arg.oldValue;
        if (newValue) {
          checkKiteInstallation();
          return AtomHelper.enablePackage();
        } else {
          return AtomHelper.disablePackage();
        }
      });
    },
    load: function() {
      var disposable;
      this.disposables = new CompositeDisposable;
      disposable = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor.getGrammar());
          disposable = editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(grammar);
          });
          return _this.disposables.add(disposable);
        };
      })(this));
      this.disposables.add(disposable);
      this._loadKite();
      return this.trackCompletions();
    },
    activate: function(state) {
      var disposable;
      this.emitter = new Emitter;
      this.provider = require('./provider');
      if (typeof atom.packages.hasActivatedInitialPackages === 'function' && atom.packages.hasActivatedInitialPackages()) {
        return this.load();
      } else {
        return disposable = atom.packages.onDidActivateInitialPackages((function(_this) {
          return function() {
            _this.load();
            return disposable.dispose();
          };
        })(this));
      }
    },
    deactivate: function() {
      if (this.provider) {
        this.provider.dispose();
      }
      if (this.installation) {
        return this.installation.destroy();
      }
    },
    getProvider: function() {
      return this.provider;
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      var disposable;
      return disposable = this.emitter.on('did-load-provider', (function(_this) {
        return function() {
          _this.provider.setSnippetsManager(snippetsManager);
          return disposable.dispose();
        };
      })(this));
    },
    trackCompletions: function() {
      var promises;
      promises = [atom.packages.activatePackage('autocomplete-plus')];
      if (atom.packages.getLoadedPackage('kite') != null) {
        this.disposables.add(atom.config.observe('kite.loggingLevel', function(level) {
          return Logger.LEVEL = Logger.LEVELS[(level != null ? level : 'info').toUpperCase()];
        }));
        promises.push(atom.packages.activatePackage('kite'));
        Metrics.Tracker.name = "atom kite+acp";
      }
      return Promise.all(promises).then((function(_this) {
        return function(arg) {
          var autocompleteManager, autocompletePlus, kite, safeConfirm, safeDisplaySuggestions;
          autocompletePlus = arg[0], kite = arg[1];
          if (kite != null) {
            _this.patchKiteCompletions(kite);
          }
          autocompleteManager = autocompletePlus.mainModule.getAutocompleteManager();
          if (!((autocompleteManager != null) && (autocompleteManager.confirm != null) && (autocompleteManager.displaySuggestions != null))) {
            return;
          }
          safeConfirm = autocompleteManager.confirm;
          safeDisplaySuggestions = autocompleteManager.displaySuggestions;
          autocompleteManager.displaySuggestions = function(suggestions, options) {
            _this.trackSuggestions(suggestions, autocompleteManager.editor);
            return safeDisplaySuggestions.call(autocompleteManager, suggestions, options);
          };
          return autocompleteManager.confirm = function(suggestion) {
            _this.trackUsedSuggestion(suggestion, autocompleteManager.editor);
            return safeConfirm.call(autocompleteManager, suggestion);
          };
        };
      })(this));
    },
    trackSuggestions: function(suggestions, editor) {
      var hasJediSuggestions, hasKiteSuggestions;
      if (/\.py$/.test(editor.getPath()) && (this.kiteProvider != null)) {
        hasKiteSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.kiteProvider;
          };
        })(this));
        hasJediSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.provider;
          };
        })(this));
        if (hasKiteSuggestions && hasJediSuggestions) {
          return this.track('Atom shows both Kite and Jedi completions');
        } else if (hasKiteSuggestions) {
          return this.track('Atom shows Kite but not Jedi completions');
        } else if (hasJediSuggestions) {
          return this.track('Atom shows Jedi but not Kite completions');
        } else {
          return this.track('Atom shows neither Kite nor Jedi completions');
        }
      }
    },
    patchKiteCompletions: function(kite) {
      var getSuggestions;
      if (this.kitePackage != null) {
        return;
      }
      this.kitePackage = kite.mainModule;
      this.kiteProvider = this.kitePackage.completions();
      getSuggestions = this.kiteProvider.getSuggestions;
      return this.kiteProvider.getSuggestions = (function(_this) {
        return function() {
          var args, ref2, ref3;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return getSuggestions != null ? (ref2 = getSuggestions.apply(_this.kiteProvider, args)) != null ? (ref3 = ref2.then(function(suggestions) {
            _this.lastKiteSuggestions = suggestions;
            _this.kiteSuggested = suggestions != null;
            return suggestions;
          })) != null ? ref3["catch"](function(err) {
            _this.lastKiteSuggestions = [];
            _this.kiteSuggested = false;
            throw err;
          }) : void 0 : void 0 : void 0;
        };
      })(this);
    },
    trackUsedSuggestion: function(suggestion, editor) {
      var altSuggestion;
      if (/\.py$/.test(editor.getPath())) {
        if (this.kiteProvider != null) {
          if (this.lastKiteSuggestions != null) {
            if (indexOf.call(this.lastKiteSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.provider.lastSuggestions || []);
              if (altSuggestion != null) {
                return this.track('used completion returned by Kite but also returned by Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion),
                  jediHasDocumentation: this.hasDocumentation(altSuggestion)
                });
              } else {
                return this.track('used completion returned by Kite but not Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.lastKiteSuggestions);
              if (altSuggestion != null) {
                return this.track('used completion returned by Jedi but also returned by Kite', {
                  kiteHasDocumentation: this.hasDocumentation(altSuggestion),
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                if (this.kitePackage.isEditorWhitelisted != null) {
                  if (this.kitePackage.isEditorWhitelisted(editor)) {
                    return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  } else {
                    return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  }
                } else {
                  return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                    jediHasDocumentation: this.hasDocumentation(suggestion)
                  });
                }
              }
            } else {
              return this.track('used completion from neither Kite nor Jedi');
            }
          } else {
            if (this.kitePackage.isEditorWhitelisted != null) {
              if (this.kitePackage.isEditorWhitelisted(editor)) {
                return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else {
              return this.track('used completion returned by Jedi but not Kite (not-whitelisted filepath)', {
                jediHasDocumentation: this.hasDocumentation(suggestion)
              });
            }
          }
        } else {
          if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
            return this.track('used completion returned by Jedi', {
              jediHasDocumentation: this.hasDocumentation(suggestion)
            });
          } else {
            return this.track('used completion not returned by Jedi');
          }
        }
      }
    },
    hasSameSuggestion: function(suggestion, suggestions) {
      return suggestions.filter(function(s) {
        return s.text === suggestion.text;
      })[0];
    },
    hasDocumentation: function(suggestion) {
      return ((suggestion.description != null) && suggestion.description !== '') || ((suggestion.descriptionMarkdown != null) && suggestion.descriptionMarkdown !== '');
    },
    track: function(msg, data) {
      var e;
      try {
        return Metrics.Tracker.trackEvent(msg, data);
      } catch (error) {
        e = error;
        if (e instanceof TypeError) {
          return console.error(e);
        } else {
          throw e;
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0VBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDZDQUFELEVBQXNCOztFQUV0QixPQUFvQixFQUFwQixFQUFDLGlCQUFELEVBQVU7O0VBRVYsTUFBTSxDQUFDLEtBQVAsR0FBZTs7RUFDZixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsT0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTywyQ0FIUDtRQUlBLFdBQUEsRUFBYSxtSUFKYjtPQURGO01BT0EsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxLQUFBLEVBQU8sbUJBSFA7UUFJQSxXQUFBLEVBQWEsZ0RBSmI7T0FSRjtNQWFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsVUFBaEIsQ0FITjtRQUlBLEtBQUEsRUFBTyxrQ0FKUDtRQUtBLFdBQUEsRUFBYSx5UkFMYjtPQWRGO01Bd0JBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEs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M0IsRUFBZ0MsSUFBaEMsRUFERjtPQUFBLGFBQUE7UUFFTTtRQUVKLElBQUcsQ0FBQSxZQUFhLFNBQWhCO2lCQUNFLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxFQURGO1NBQUEsTUFBQTtBQUdFLGdCQUFNLEVBSFI7U0FKRjs7SUFESyxDQTlYUDs7QUFSRiIsInNvdXJjZXNDb250ZW50IjpbIm9zID0gcmVxdWlyZSAnb3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbltNZXRyaWNzLCBMb2dnZXJdID0gW11cblxud2luZG93LkRFQlVHID0gZmFsc2Vcbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIHVzZUtpdGU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAwXG4gICAgICB0aXRsZTogJ1VzZSBLaXRlLXBvd2VyZWQgQ29tcGxldGlvbnMgKG1hY09TIG9ubHkpJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0tpdGUgaXMgYSBjbG91ZCBwb3dlcmVkIGF1dG9jb21wbGV0ZSBlbmdpbmUuIEl0IHByb3ZpZGVzXG4gICAgICBzaWduaWZpY2FudGx5IG1vcmUgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zIHRoYW4gdGhlIGxvY2FsIEplZGkgZW5naW5lLicnJ1xuICAgIHNob3dEZXNjcmlwdGlvbnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAxXG4gICAgICB0aXRsZTogJ1Nob3cgRGVzY3JpcHRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGRvYyBzdHJpbmdzIGZyb20gZnVuY3Rpb25zLCBjbGFzc2VzLCBldGMuJ1xuICAgIHVzZVNuaXBwZXRzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdub25lJ1xuICAgICAgb3JkZXI6IDJcbiAgICAgIGVudW06IFsnbm9uZScsICdhbGwnLCAncmVxdWlyZWQnXVxuICAgICAgdGl0bGU6ICdBdXRvY29tcGxldGUgRnVuY3Rpb24gUGFyYW1ldGVycydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydBdXRvbWF0aWNhbGx5IGNvbXBsZXRlIGZ1bmN0aW9uIGFyZ3VtZW50cyBhZnRlciB0eXBpbmdcbiAgICAgIGxlZnQgcGFyZW50aGVzaXMgY2hhcmFjdGVyLiBVc2UgY29tcGxldGlvbiBrZXkgdG8ganVtcCBiZXR3ZWVuXG4gICAgICBhcmd1bWVudHMuIFNlZSBgYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHNgIGNvbW1hbmQgaWYgeW91XG4gICAgICB3YW50IHRvIHRyaWdnZXIgYXJndW1lbnQgY29tcGxldGlvbnMgbWFudWFsbHkuIFNlZSBSRUFETUUgaWYgaXQgZG9lcyBub3RcbiAgICAgIHdvcmsgZm9yIHlvdS4nJydcbiAgICBweXRob25QYXRoczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgb3JkZXI6IDNcbiAgICAgIHRpdGxlOiAnUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnT3B0aW9uYWwgc2VtaWNvbG9uIHNlcGFyYXRlZCBsaXN0IG9mIHBhdGhzIHRvIHB5dGhvblxuICAgICAgZXhlY3V0YWJsZXMgKGluY2x1ZGluZyBleGVjdXRhYmxlIG5hbWVzKSwgd2hlcmUgdGhlIGZpcnN0IG9uZSB3aWxsIHRha2VcbiAgICAgIGhpZ2hlciBwcmlvcml0eSBvdmVyIHRoZSBsYXN0IG9uZS4gQnkgZGVmYXVsdCBhdXRvY29tcGxldGUtcHl0aG9uIHdpbGxcbiAgICAgIGF1dG9tYXRpY2FsbHkgbG9vayBmb3IgdmlydHVhbCBlbnZpcm9ubWVudHMgaW5zaWRlIG9mIHlvdXIgcHJvamVjdCBhbmRcbiAgICAgIHRyeSB0byB1c2UgdGhlbSBhcyB3ZWxsIGFzIHRyeSB0byBmaW5kIGdsb2JhbCBweXRob24gZXhlY3V0YWJsZS4gSWYgeW91XG4gICAgICB1c2UgdGhpcyBjb25maWcsIGF1dG9tYXRpYyBsb29rdXAgd2lsbCBoYXZlIGxvd2VzdCBwcmlvcml0eS5cbiAgICAgIFVzZSBgJFBST0pFQ1RgIG9yIGAkUFJPSkVDVF9OQU1FYCBzdWJzdGl0dXRpb24gZm9yIHByb2plY3Qtc3BlY2lmaWNcbiAgICAgIHBhdGhzIHRvIHBvaW50IG9uIGV4ZWN1dGFibGVzIGluIHZpcnR1YWwgZW52aXJvbm1lbnRzLlxuICAgICAgRm9yIGV4YW1wbGU6XG4gICAgICBgL1VzZXJzL25hbWUvLnZpcnR1YWxlbnZzLyRQUk9KRUNUX05BTUUvYmluL3B5dGhvbjskUFJPSkVDVC92ZW52L2Jpbi9weXRob24zOy91c3IvYmluL3B5dGhvbmAuXG4gICAgICBTdWNoIGNvbmZpZyB3aWxsIGZhbGwgYmFjayBvbiBgL3Vzci9iaW4vcHl0aG9uYCBmb3IgcHJvamVjdHMgbm90IHByZXNlbnRlZFxuICAgICAgd2l0aCBzYW1lIG5hbWUgaW4gYC52aXJ0dWFsZW52c2AgYW5kIHdpdGhvdXQgYHZlbnZgIGZvbGRlciBpbnNpZGUgb2Ygb25lXG4gICAgICBvZiBwcm9qZWN0IGZvbGRlcnMuXG4gICAgICBJZiB5b3UgYXJlIHVzaW5nIHB5dGhvbjMgZXhlY3V0YWJsZSB3aGlsZSBjb2RpbmcgZm9yIHB5dGhvbjIgeW91IHdpbGwgZ2V0XG4gICAgICBweXRob24yIGNvbXBsZXRpb25zIGZvciBzb21lIGJ1aWx0LWlucy4nJydcbiAgICBleHRyYVBhdGhzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBvcmRlcjogNFxuICAgICAgdGl0bGU6ICdFeHRyYSBQYXRocyBGb3IgUGFja2FnZXMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VtaWNvbG9uIHNlcGFyYXRlZCBsaXN0IG9mIG1vZHVsZXMgdG8gYWRkaXRpb25hbGx5XG4gICAgICBpbmNsdWRlIGZvciBhdXRvY29tcGxldGUuIFlvdSBjYW4gdXNlIHNhbWUgc3Vic3RpdHV0aW9ucyBhcyBpblxuICAgICAgYFB5dGhvbiBFeGVjdXRhYmxlIFBhdGhzYC5cbiAgICAgIE5vdGUgdGhhdCBpdCBzdGlsbCBzaG91bGQgYmUgdmFsaWQgcHl0aG9uIHBhY2thZ2UuXG4gICAgICBGb3IgZXhhbXBsZTpcbiAgICAgIGAkUFJPSkVDVC9lbnYvbGliL3B5dGhvbjIuNy9zaXRlLXBhY2thZ2VzYFxuICAgICAgb3JcbiAgICAgIGAvVXNlci9uYW1lLy52aXJ0dWFsZW52cy8kUFJPSkVDVF9OQU1FL2xpYi9weXRob24yLjcvc2l0ZS1wYWNrYWdlc2AuXG4gICAgICBZb3UgZG9uJ3QgbmVlZCB0byBzcGVjaWZ5IGV4dHJhIHBhdGhzIGZvciBsaWJyYXJpZXMgaW5zdGFsbGVkIHdpdGggcHl0aG9uXG4gICAgICBleGVjdXRhYmxlIHlvdSB1c2UuJycnXG4gICAgY2FzZUluc2Vuc2l0aXZlQ29tcGxldGlvbjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDVcbiAgICAgIHRpdGxlOiAnQ2FzZSBJbnNlbnNpdGl2ZSBDb21wbGV0aW9uJ1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgY29tcGxldGlvbiBpcyBieSBkZWZhdWx0IGNhc2UgaW5zZW5zaXRpdmUuJ1xuICAgIHRyaWdnZXJDb21wbGV0aW9uUmVnZXg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJyhbXFwuXFwgKF18W2EtekEtWl9dW2EtekEtWjAtOV9dKiknXG4gICAgICBvcmRlcjogNlxuICAgICAgdGl0bGU6ICdSZWdleCBUbyBUcmlnZ2VyIEF1dG9jb21wbGV0aW9ucydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydCeSBkZWZhdWx0IGNvbXBsZXRpb25zIHRyaWdnZXJlZCBhZnRlciB3b3JkcywgZG90cywgc3BhY2VzXG4gICAgICBhbmQgbGVmdCBwYXJlbnRoZXNpcy4gWW91IHdpbGwgbmVlZCB0byByZXN0YXJ0IHlvdXIgZWRpdG9yIGFmdGVyIGNoYW5naW5nXG4gICAgICB0aGlzLicnJ1xuICAgIGZ1enp5TWF0Y2hlcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDdcbiAgICAgIHRpdGxlOiAnVXNlIEZ1enp5IE1hdGNoZXIgRm9yIENvbXBsZXRpb25zLidcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydUeXBpbmcgYHN0ZHJgIHdpbGwgbWF0Y2ggYHN0ZGVycmAuXG4gICAgICBGaXJzdCBjaGFyYWN0ZXIgc2hvdWxkIGFsd2F5cyBtYXRjaC4gVXNlcyBhZGRpdGlvbmFsIGNhY2hpbmcgdGh1c1xuICAgICAgY29tcGxldGlvbnMgc2hvdWxkIGJlIGZhc3Rlci4gTm90ZSB0aGF0IHRoaXMgc2V0dGluZyBkb2VzIG5vdCBhZmZlY3RcbiAgICAgIGJ1aWx0LWluIGF1dG9jb21wbGV0ZS1wbHVzIHByb3ZpZGVyLicnJ1xuICAgIG91dHB1dFByb3ZpZGVyRXJyb3JzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDhcbiAgICAgIHRpdGxlOiAnT3V0cHV0IFByb3ZpZGVyIEVycm9ycydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZWxlY3QgaWYgeW91IHdvdWxkIGxpa2UgdG8gc2VlIHRoZSBwcm92aWRlciBlcnJvcnMgd2hlblxuICAgICAgdGhleSBoYXBwZW4uIEJ5IGRlZmF1bHQgdGhleSBhcmUgaGlkZGVuLiBOb3RlIHRoYXQgY3JpdGljYWwgZXJyb3JzIGFyZVxuICAgICAgYWx3YXlzIHNob3duLicnJ1xuICAgIG91dHB1dERlYnVnOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDlcbiAgICAgIHRpdGxlOiAnT3V0cHV0IERlYnVnIExvZ3MnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VsZWN0IGlmIHlvdSB3b3VsZCBsaWtlIHRvIHNlZSBkZWJ1ZyBpbmZvcm1hdGlvbiBpblxuICAgICAgZGV2ZWxvcGVyIHRvb2xzIGxvZ3MuIE1heSBzbG93IGRvd24geW91ciBlZGl0b3IuJycnXG4gICAgc2hvd1Rvb2x0aXBzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDEwXG4gICAgICB0aXRsZTogJ1Nob3cgVG9vbHRpcHMgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgb2JqZWN0IHVuZGVyIHRoZSBjdXJzb3InXG4gICAgICBkZXNjcmlwdGlvbjogJycnRVhQRVJJTUVOVEFMIEZFQVRVUkUgV0hJQ0ggSVMgTk9UIEZJTklTSEVEIFlFVC5cbiAgICAgIEZlZWRiYWNrIGFuZCBpZGVhcyBhcmUgd2VsY29tZSBvbiBnaXRodWIuJycnXG4gICAgc3VnZ2VzdGlvblByaW9yaXR5OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAzXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBtYXhpbXVtOiA5OVxuICAgICAgb3JkZXI6IDExXG4gICAgICB0aXRsZTogJ1N1Z2dlc3Rpb24gUHJpb3JpdHknXG4gICAgICBkZXNjcmlwdGlvbjogJycnWW91IGNhbiB1c2UgdGhpcyB0byBzZXQgdGhlIHByaW9yaXR5IGZvciBhdXRvY29tcGxldGUtcHl0aG9uXG4gICAgICBzdWdnZXN0aW9ucy4gRm9yIGV4YW1wbGUsIHlvdSBjYW4gdXNlIGxvd2VyIHZhbHVlIHRvIGdpdmUgaGlnaGVyIHByaW9yaXR5XG4gICAgICBmb3Igc25pcHBldHMgY29tcGxldGlvbnMgd2hpY2ggaGFzIHByaW9yaXR5IG9mIDIuJycnXG5cbiAgaW5zdGFsbGF0aW9uOiBudWxsXG5cbiAgX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudDogKGdyYW1tYXIpIC0+XG4gICAgIyB0aGlzIHNob3VsZCBiZSBzYW1lIHdpdGggYWN0aXZhdGlvbkhvb2tzIG5hbWVzXG4gICAgaWYgZ3JhbW1hci5wYWNrYWdlTmFtZSBpbiBbJ2xhbmd1YWdlLXB5dGhvbicsICdNYWdpY1B5dGhvbicsICdhdG9tLWRqYW5nbyddXG4gICAgICBAcHJvdmlkZXIubG9hZCgpXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtbG9hZC1wcm92aWRlcidcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBfbG9hZEtpdGU6IC0+XG4gICAgZmlyc3RJbnN0YWxsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2F1dG9jb21wbGV0ZS1weXRob24uaW5zdGFsbGVkJykgPT0gbnVsbFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRvY29tcGxldGUtcHl0aG9uLmluc3RhbGxlZCcsIHRydWUpXG4gICAgbG9uZ1J1bm5pbmcgPSByZXF1aXJlKCdwcm9jZXNzJykudXB0aW1lKCkgPiAxMFxuICAgIGlmIGZpcnN0SW5zdGFsbCBhbmQgbG9uZ1J1bm5pbmdcbiAgICAgIGV2ZW50ID0gXCJpbnN0YWxsZWRcIlxuICAgIGVsc2UgaWYgZmlyc3RJbnN0YWxsXG4gICAgICBldmVudCA9IFwidXBncmFkZWRcIlxuICAgIGVsc2VcbiAgICAgIGV2ZW50ID0gXCJyZXN0YXJ0ZWRcIlxuXG4gICAge1xuICAgICAgQWNjb3VudE1hbmFnZXIsXG4gICAgICBBdG9tSGVscGVyLFxuICAgICAgRGVjaXNpb25NYWtlcixcbiAgICAgIEluc3RhbGxhdGlvbixcbiAgICAgIEluc3RhbGxlcixcbiAgICAgIE1ldHJpY3MsXG4gICAgICBMb2dnZXIsXG4gICAgICBTdGF0ZUNvbnRyb2xsZXJcbiAgICB9ID0gcmVxdWlyZSAna2l0ZS1pbnN0YWxsZXInXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2tpdGUubG9nZ2luZ0xldmVsJylcbiAgICAgIExvZ2dlci5MRVZFTCA9IExvZ2dlci5MRVZFTFNbYXRvbS5jb25maWcuZ2V0KCdraXRlLmxvZ2dpbmdMZXZlbCcpLnRvVXBwZXJDYXNlKCldXG5cbiAgICBBY2NvdW50TWFuYWdlci5pbml0Q2xpZW50ICdhbHBoYS5raXRlLmNvbScsIC0xLCB0cnVlXG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIgSW5zdGFsbGF0aW9uLCAobSkgLT4gbS5lbGVtZW50XG4gICAgZWRpdG9yQ2ZnID1cbiAgICAgIFVVSUQ6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtZXRyaWNzLnVzZXJJZCcpXG4gICAgICBuYW1lOiAnYXRvbSdcbiAgICBwbHVnaW5DZmcgPVxuICAgICAgbmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXG4gICAgZG0gPSBuZXcgRGVjaXNpb25NYWtlciBlZGl0b3JDZmcsIHBsdWdpbkNmZ1xuXG4gICAgTWV0cmljcy5UcmFja2VyLm5hbWUgPSBcImF0b20gYWNwXCJcblxuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBrZykgPT5cbiAgICAgIGlmIHBrZy5uYW1lIGlzICdraXRlJ1xuICAgICAgICBAcGF0Y2hLaXRlQ29tcGxldGlvbnMocGtnKVxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIubmFtZSA9IFwiYXRvbSBraXRlK2FjcFwiXG5cbiAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24gPSAoKSA9PlxuICAgICAgaWYgbm90IGF0b20uY29uZmlnLmdldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJ1xuICAgICAgICByZXR1cm5cbiAgICAgIGNhbkluc3RhbGwgPSBTdGF0ZUNvbnRyb2xsZXIuY2FuSW5zdGFsbEtpdGUoKVxuICAgICAgdGhyb3R0bGUgPSBkbS5zaG91bGRPZmZlcktpdGUoZXZlbnQpXG4gICAgICBQcm9taXNlLmFsbChbdGhyb3R0bGUsIGNhbkluc3RhbGxdKS50aGVuKCh2YWx1ZXMpID0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgdHJ1ZVxuICAgICAgICB2YXJpYW50ID0gdmFsdWVzWzBdXG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcyA9IHZhcmlhbnRcbiAgICAgICAgTWV0cmljcy5UcmFja2VyLnByb3BzLmxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIHRpdGxlID0gXCJDaG9vc2UgYSBhdXRvY29tcGxldGUtcHl0aG9uIGVuZ2luZVwiXG4gICAgICAgIEBpbnN0YWxsYXRpb24gPSBuZXcgSW5zdGFsbGF0aW9uIHZhcmlhbnQsIHRpdGxlXG4gICAgICAgIEBpbnN0YWxsYXRpb24uYWNjb3VudENyZWF0ZWQoKCkgPT5cbiAgICAgICAgICBAdHJhY2sgXCJhY2NvdW50IGNyZWF0ZWRcIlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgdHJ1ZVxuICAgICAgICApXG4gICAgICAgIEBpbnN0YWxsYXRpb24uZmxvd1NraXBwZWQoKCkgPT5cbiAgICAgICAgICBAdHJhY2sgXCJmbG93IGFib3J0ZWRcIlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICAgKVxuICAgICAgICBbcHJvamVjdFBhdGhdID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgcm9vdCA9IGlmIHByb2plY3RQYXRoPyBhbmQgcGF0aC5yZWxhdGl2ZShvcy5ob21lZGlyKCksIHByb2plY3RQYXRoKS5pbmRleE9mKCcuLicpIGlzIDBcbiAgICAgICAgICBwYXRoLnBhcnNlKHByb2plY3RQYXRoKS5yb290XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcy5ob21lZGlyKClcblxuICAgICAgICBpbnN0YWxsZXIgPSBuZXcgSW5zdGFsbGVyKFtyb290XSlcbiAgICAgICAgaW5zdGFsbGVyLmluaXQgQGluc3RhbGxhdGlvbi5mbG93LCAtPlxuICAgICAgICAgIExvZ2dlci52ZXJib3NlKCdpbiBvbkZpbmlzaCcpXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2tpdGUnKVxuXG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgQGluc3RhbGxhdGlvbi5mbG93Lm9uU2tpcEluc3RhbGwgKCkgPT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIGZhbHNlXG4gICAgICAgICAgQHRyYWNrIFwic2tpcHBlZCBraXRlXCJcbiAgICAgICAgICBwYW5lLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgICAgICAgcGFuZS5hZGRJdGVtIEBpbnN0YWxsYXRpb24sIGluZGV4OiAwXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCAwXG4gICAgICAsIChlcnIpID0+XG4gICAgICAgIGlmIGVyci50eXBlID09ICdkZW5pZWQnXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgKSBpZiBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcblxuICAgIGNoZWNrS2l0ZUluc3RhbGxhdGlvbigpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgKHsgbmV3VmFsdWUsIG9sZFZhbHVlIH0pIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuICAgICAgICBBdG9tSGVscGVyLmVuYWJsZVBhY2thZ2UoKVxuICAgICAgZWxzZVxuICAgICAgICBBdG9tSGVscGVyLmRpc2FibGVQYWNrYWdlKClcblxuICBsb2FkOiAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgZGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLmdldEdyYW1tYXIoKSlcbiAgICAgIGRpc3Bvc2FibGUgPSBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChncmFtbWFyKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQF9sb2FkS2l0ZSgpXG4gICAgQHRyYWNrQ29tcGxldGlvbnMoKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwcm92aWRlciA9IHJlcXVpcmUoJy4vcHJvdmlkZXInKVxuICAgIGlmIHR5cGVvZiBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcyA9PSAnZnVuY3Rpb24nIGFuZFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcygpXG4gICAgICBAbG9hZCgpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyA9PlxuICAgICAgICBAbG9hZCgpXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAcHJvdmlkZXIuZGlzcG9zZSgpIGlmIEBwcm92aWRlclxuICAgIEBpbnN0YWxsYXRpb24uZGVzdHJveSgpIGlmIEBpbnN0YWxsYXRpb25cblxuICBnZXRQcm92aWRlcjogLT5cbiAgICByZXR1cm4gQHByb3ZpZGVyXG5cbiAgZ2V0SHlwZXJjbGlja1Byb3ZpZGVyOiAtPlxuICAgIHJldHVybiByZXF1aXJlKCcuL2h5cGVyY2xpY2stcHJvdmlkZXInKVxuXG4gIGNvbnN1bWVTbmlwcGV0czogKHNuaXBwZXRzTWFuYWdlcikgLT5cbiAgICBkaXNwb3NhYmxlID0gQGVtaXR0ZXIub24gJ2RpZC1sb2FkLXByb3ZpZGVyJywgPT5cbiAgICAgIEBwcm92aWRlci5zZXRTbmlwcGV0c01hbmFnZXIgc25pcHBldHNNYW5hZ2VyXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gIHRyYWNrQ29tcGxldGlvbnM6IC0+XG4gICAgcHJvbWlzZXMgPSBbYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1wbHVzJyldXG5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2tpdGUnKT9cblxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdraXRlLmxvZ2dpbmdMZXZlbCcsIChsZXZlbCkgLT5cbiAgICAgICAgTG9nZ2VyLkxFVkVMID0gTG9nZ2VyLkxFVkVMU1sobGV2ZWwgPyAnaW5mbycpLnRvVXBwZXJDYXNlKCldXG5cbiAgICAgIHByb21pc2VzLnB1c2goYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2tpdGUnKSlcbiAgICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGtpdGUrYWNwXCJcblxuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuIChbYXV0b2NvbXBsZXRlUGx1cywga2l0ZV0pID0+XG4gICAgICBpZiBraXRlP1xuICAgICAgICBAcGF0Y2hLaXRlQ29tcGxldGlvbnMoa2l0ZSlcblxuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IGF1dG9jb21wbGV0ZVBsdXMubWFpbk1vZHVsZS5nZXRBdXRvY29tcGxldGVNYW5hZ2VyKClcblxuICAgICAgcmV0dXJuIHVubGVzcyBhdXRvY29tcGxldGVNYW5hZ2VyPyBhbmQgYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtPyBhbmQgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnM/XG5cbiAgICAgIHNhZmVDb25maXJtID0gYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtXG4gICAgICBzYWZlRGlzcGxheVN1Z2dlc3Rpb25zID0gYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnNcbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zID0gKHN1Z2dlc3Rpb25zLCBvcHRpb25zKSA9PlxuICAgICAgICBAdHJhY2tTdWdnZXN0aW9ucyhzdWdnZXN0aW9ucywgYXV0b2NvbXBsZXRlTWFuYWdlci5lZGl0b3IpXG4gICAgICAgIHNhZmVEaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbChhdXRvY29tcGxldGVNYW5hZ2VyLCBzdWdnZXN0aW9ucywgb3B0aW9ucylcblxuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5jb25maXJtID0gKHN1Z2dlc3Rpb24pID0+XG4gICAgICAgIEB0cmFja1VzZWRTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIGF1dG9jb21wbGV0ZU1hbmFnZXIuZWRpdG9yKVxuICAgICAgICBzYWZlQ29uZmlybS5jYWxsKGF1dG9jb21wbGV0ZU1hbmFnZXIsIHN1Z2dlc3Rpb24pXG5cbiAgdHJhY2tTdWdnZXN0aW9uczogKHN1Z2dlc3Rpb25zLCBlZGl0b3IpIC0+XG4gICAgaWYgL1xcLnB5JC8udGVzdChlZGl0b3IuZ2V0UGF0aCgpKSBhbmQgQGtpdGVQcm92aWRlcj9cbiAgICAgIGhhc0tpdGVTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLnNvbWUgKHMpID0+IHMucHJvdmlkZXIgaXMgQGtpdGVQcm92aWRlclxuICAgICAgaGFzSmVkaVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMuc29tZSAocykgPT4gcy5wcm92aWRlciBpcyBAcHJvdmlkZXJcblxuICAgICAgaWYgaGFzS2l0ZVN1Z2dlc3Rpb25zIGFuZCBoYXNKZWRpU3VnZ2VzdGlvbnNcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIGJvdGggS2l0ZSBhbmQgSmVkaSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2UgaWYgaGFzS2l0ZVN1Z2dlc3Rpb25zXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBLaXRlIGJ1dCBub3QgSmVkaSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2UgaWYgaGFzSmVkaVN1Z2dlc3Rpb25zXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBKZWRpIGJ1dCBub3QgS2l0ZSBjb21wbGV0aW9ucydcbiAgICAgIGVsc2VcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIG5laXRoZXIgS2l0ZSBub3IgSmVkaSBjb21wbGV0aW9ucydcblxuICBwYXRjaEtpdGVDb21wbGV0aW9uczogKGtpdGUpIC0+XG4gICAgcmV0dXJuIGlmIEBraXRlUGFja2FnZT9cblxuICAgIEBraXRlUGFja2FnZSA9IGtpdGUubWFpbk1vZHVsZVxuICAgIEBraXRlUHJvdmlkZXIgPSBAa2l0ZVBhY2thZ2UuY29tcGxldGlvbnMoKVxuICAgIGdldFN1Z2dlc3Rpb25zID0gQGtpdGVQcm92aWRlci5nZXRTdWdnZXN0aW9uc1xuICAgIEBraXRlUHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMgPSAoYXJncy4uLikgPT5cbiAgICAgIGdldFN1Z2dlc3Rpb25zPy5hcHBseShAa2l0ZVByb3ZpZGVyLCBhcmdzKVxuICAgICAgPy50aGVuIChzdWdnZXN0aW9ucykgPT5cbiAgICAgICAgQGxhc3RLaXRlU3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9uc1xuICAgICAgICBAa2l0ZVN1Z2dlc3RlZCA9IHN1Z2dlc3Rpb25zP1xuICAgICAgICBzdWdnZXN0aW9uc1xuICAgICAgPy5jYXRjaCAoZXJyKSA9PlxuICAgICAgICBAbGFzdEtpdGVTdWdnZXN0aW9ucyA9IFtdXG4gICAgICAgIEBraXRlU3VnZ2VzdGVkID0gZmFsc2VcbiAgICAgICAgdGhyb3cgZXJyXG5cbiAgdHJhY2tVc2VkU3VnZ2VzdGlvbjogKHN1Z2dlc3Rpb24sIGVkaXRvcikgLT5cbiAgICBpZiAvXFwucHkkLy50ZXN0KGVkaXRvci5nZXRQYXRoKCkpXG4gICAgICBpZiBAa2l0ZVByb3ZpZGVyP1xuICAgICAgICBpZiBAbGFzdEtpdGVTdWdnZXN0aW9ucz9cbiAgICAgICAgICBpZiBzdWdnZXN0aW9uIGluIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zXG4gICAgICAgICAgICBhbHRTdWdnZXN0aW9uID0gQGhhc1NhbWVTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMgb3IgW10pXG4gICAgICAgICAgICBpZiBhbHRTdWdnZXN0aW9uP1xuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBLaXRlIGJ1dCBhbHNvIHJldHVybmVkIGJ5IEplZGknLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKGFsdFN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgS2l0ZSBidXQgbm90IEplZGknLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMgYW5kICBzdWdnZXN0aW9uIGluIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnNcbiAgICAgICAgICAgIGFsdFN1Z2dlc3Rpb24gPSBAaGFzU2FtZVN1Z2dlc3Rpb24oc3VnZ2VzdGlvbiwgQGxhc3RLaXRlU3VnZ2VzdGlvbnMpXG4gICAgICAgICAgICBpZiBhbHRTdWdnZXN0aW9uP1xuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBhbHNvIHJldHVybmVkIGJ5IEtpdGUnLCB7XG4gICAgICAgICAgICAgICAga2l0ZUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKGFsdFN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQ/XG4gICAgICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQoZWRpdG9yKVxuICAgICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKHdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKG5vbi13aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKHdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiBmcm9tIG5laXRoZXIgS2l0ZSBub3IgSmVkaSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEBraXRlUGFja2FnZS5pc0VkaXRvcldoaXRlbGlzdGVkP1xuICAgICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQoZWRpdG9yKVxuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAod2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlIChub24td2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKG5vdC13aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zIGFuZCBzdWdnZXN0aW9uIGluIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnNcbiAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpJywge1xuICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gbm90IHJldHVybmVkIGJ5IEplZGknXG5cbiAgaGFzU2FtZVN1Z2dlc3Rpb246IChzdWdnZXN0aW9uLCBzdWdnZXN0aW9ucykgLT5cbiAgICBzdWdnZXN0aW9ucy5maWx0ZXIoKHMpIC0+IHMudGV4dCBpcyBzdWdnZXN0aW9uLnRleHQpWzBdXG5cbiAgaGFzRG9jdW1lbnRhdGlvbjogKHN1Z2dlc3Rpb24pIC0+XG4gICAgKHN1Z2dlc3Rpb24uZGVzY3JpcHRpb24/IGFuZCBzdWdnZXN0aW9uLmRlc2NyaXB0aW9uIGlzbnQgJycpIG9yXG4gICAgKHN1Z2dlc3Rpb24uZGVzY3JpcHRpb25NYXJrZG93bj8gYW5kIHN1Z2dlc3Rpb24uZGVzY3JpcHRpb25NYXJrZG93biBpc250ICcnKVxuXG4gIHRyYWNrOiAobXNnLCBkYXRhKSAtPlxuICAgIHRyeVxuICAgICAgTWV0cmljcy5UcmFja2VyLnRyYWNrRXZlbnQgbXNnLCBkYXRhXG4gICAgY2F0Y2ggZVxuICAgICAgIyBUT0RPOiB0aGlzIHNob3VsZCBiZSByZW1vdmVkIGFmdGVyIGtpdGUtaW5zdGFsbGVyIGlzIGZpeGVkXG4gICAgICBpZiBlIGluc3RhbmNlb2YgVHlwZUVycm9yXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgZVxuIl19
