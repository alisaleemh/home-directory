(function() {
  var Beautifier, Beautifiers, Languages, Promise, beautifiers, fs, isWindows, path, temp, _;

  Beautifiers = require("../src/beautifiers");

  beautifiers = new Beautifiers();

  Beautifier = require("../src/beautifiers/beautifier");

  Languages = require('../src/languages/');

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  Promise = require("bluebird");

  temp = require('temp');

  temp.track();

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  describe("Atom-Beautify", function() {
    beforeEach(function() {
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        return activationPromise;
      });
    });
    afterEach(function() {
      return temp.cleanupSync();
    });
    describe("Beautifiers", function() {
      var beautifier;
      beautifier = null;
      beforeEach(function() {
        return beautifier = new Beautifier();
      });
      return describe("Beautifier::run", function() {
        it("should error when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, p;
            p = beautifier.run("program", []);
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).toBe(void 0, 'Error should not have a description.');
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with Windows-specific help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p, terminal, whichCmd;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            beautifier.isWindows = true;
            terminal = 'CMD prompt';
            whichCmd = "where.exe";
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
              expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        if (!isWindows) {
          return it("should error with Mac/Linux-specific help description when beautifier's program not found", function() {
            expect(beautifier).not.toBe(null);
            expect(beautifier instanceof Beautifier).toBe(true);
            return waitsForPromise({
              shouldReject: true
            }, function() {
              var cb, help, p, terminal, whichCmd;
              help = {
                link: "http://test.com",
                program: "test-program",
                pathOption: "Lang - Test Program Path"
              };
              beautifier.isWindows = false;
              terminal = "Terminal";
              whichCmd = "which";
              p = beautifier.run("program", [], {
                help: help
              });
              expect(p).not.toBe(null);
              expect(p instanceof beautifier.Promise).toBe(true);
              cb = function(v) {
                expect(v).not.toBe(null);
                expect(v instanceof Error).toBe(true);
                expect(v.code).toBe("CommandNotFound");
                expect(v.description).not.toBe(null);
                expect(v.description.indexOf(help.link)).not.toBe(-1);
                expect(v.description.indexOf(help.program)).not.toBe(-1);
                expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
                expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
                return v;
              };
              p.then(cb, cb);
              return p;
            });
          });
        }
      });
    });
    return describe("Options", function() {
      var beautifier, beautifyEditor, editor, workspaceElement;
      editor = null;
      beautifier = null;
      workspaceElement = atom.views.getView(atom.workspace);
      beforeEach(function() {
        beautifier = new Beautifiers();
        return waitsForPromise(function() {
          return atom.workspace.open().then(function(e) {
            editor = e;
            return expect(editor.getText()).toEqual("");
          });
        });
      });
      describe("Migrate Settings", function() {
        var migrateSettings;
        migrateSettings = function(beforeKey, afterKey, val) {
          atom.config.set("atom-beautify." + beforeKey, val);
          atom.commands.dispatch(workspaceElement, "atom-beautify:migrate-settings");
          expect(_.has(atom.config.get('atom-beautify'), beforeKey)).toBe(false);
          return expect(atom.config.get("atom-beautify." + afterKey)).toBe(val);
        };
        it("should migrate js_indent_size to js.indent_size", function() {
          migrateSettings("js_indent_size", "js.indent_size", 1);
          return migrateSettings("js_indent_size", "js.indent_size", 10);
        });
        it("should migrate analytics to general.analytics", function() {
          migrateSettings("analytics", "general.analytics", true);
          return migrateSettings("analytics", "general.analytics", false);
        });
        it("should migrate _analyticsUserId to general._analyticsUserId", function() {
          migrateSettings("_analyticsUserId", "general._analyticsUserId", "userid");
          return migrateSettings("_analyticsUserId", "general._analyticsUserId", "userid2");
        });
        it("should migrate language_js_disabled to js.disabled", function() {
          migrateSettings("language_js_disabled", "js.disabled", false);
          return migrateSettings("language_js_disabled", "js.disabled", true);
        });
        it("should migrate language_js_default_beautifier to js.default_beautifier", function() {
          migrateSettings("language_js_default_beautifier", "js.default_beautifier", "Pretty Diff");
          return migrateSettings("language_js_default_beautifier", "js.default_beautifier", "JS Beautify");
        });
        return it("should migrate language_js_beautify_on_save to js.beautify_on_save", function() {
          migrateSettings("language_js_beautify_on_save", "js.beautify_on_save", true);
          return migrateSettings("language_js_beautify_on_save", "js.beautify_on_save", false);
        });
      });
      beautifyEditor = function(callback) {
        var beforeText, delay, isComplete;
        isComplete = false;
        beforeText = null;
        delay = 500;
        runs(function() {
          beforeText = editor.getText();
          atom.commands.dispatch(workspaceElement, "atom-beautify:beautify-editor");
          return setTimeout(function() {
            return isComplete = true;
          }, delay);
        });
        waitsFor(function() {
          return isComplete;
        });
        return runs(function() {
          var afterText;
          afterText = editor.getText();
          expect(typeof beforeText).toBe('string');
          expect(typeof afterText).toBe('string');
          return callback(beforeText, afterText);
        });
      };
      return describe("JavaScript", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            var packName;
            packName = 'language-javascript';
            return atom.packages.activatePackage(packName);
          });
          return runs(function() {
            var code, grammar;
            code = "var hello='world';function(){console.log('hello '+hello)}";
            editor.setText(code);
            grammar = atom.grammars.selectGrammar('source.js');
            expect(grammar.name).toBe('JavaScript');
            editor.setGrammar(grammar);
            expect(editor.getGrammar().name).toBe('JavaScript');
            return jasmine.unspy(window, 'setTimeout');
          });
        });
        describe(".jsbeautifyrc", function() {
          return it("should look at directories above file", function() {
            var cb, isDone;
            isDone = false;
            cb = function(err) {
              isDone = true;
              return expect(err).toBe(void 0);
            };
            runs(function() {
              var err;
              try {
                return temp.mkdir('dir1', function(err, dirPath) {
                  var myData, myData1, rcPath;
                  if (err) {
                    return cb(err);
                  }
                  rcPath = path.join(dirPath, '.jsbeautifyrc');
                  myData1 = {
                    indent_size: 1,
                    indent_char: '\t'
                  };
                  myData = JSON.stringify(myData1);
                  return fs.writeFile(rcPath, myData, function(err) {
                    if (err) {
                      return cb(err);
                    }
                    dirPath = path.join(dirPath, 'dir2');
                    return fs.mkdir(dirPath, function(err) {
                      var myData2;
                      if (err) {
                        return cb(err);
                      }
                      rcPath = path.join(dirPath, '.jsbeautifyrc');
                      myData2 = {
                        indent_size: 2,
                        indent_char: ' '
                      };
                      myData = JSON.stringify(myData2);
                      return fs.writeFile(rcPath, myData, function(err) {
                        if (err) {
                          return cb(err);
                        }
                        return Promise.all(beautifier.getOptionsForPath(rcPath, null)).then(function(allOptions) {
                          var config1, config2, configOptions, editorConfigOptions, editorOptions, homeOptions, projectOptions, _ref;
                          editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
                          projectOptions = allOptions.slice(4);
                          _ref = projectOptions.slice(-2), config1 = _ref[0], config2 = _ref[1];
                          expect(_.get(config1, '_default.indent_size')).toBe(myData1.indent_size);
                          expect(_.get(config2, '_default.indent_size')).toBe(myData2.indent_size);
                          expect(_.get(config1, '_default.indent_char')).toBe(myData1.indent_char);
                          expect(_.get(config2, '_default.indent_char')).toBe(myData2.indent_char);
                          return cb();
                        });
                      });
                    });
                  });
                });
              } catch (_error) {
                err = _error;
                return cb(err);
              }
            });
            return waitsFor(function() {
              return isDone;
            });
          });
        });
        return describe("Package settings", function() {
          var getOptions;
          getOptions = function(callback) {
            var options;
            options = null;
            waitsForPromise(function() {
              var allOptions;
              allOptions = beautifier.getOptionsForPath(null, null);
              return Promise.all(allOptions).then(function(allOptions) {
                return options = allOptions;
              });
            });
            return runs(function() {
              return callback(options);
            });
          };
          it("should change indent_size to 1", function() {
            atom.config.set('atom-beautify.js.indent_size', 1);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(1);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n console.log('hello ' + hello)\n}");
              });
            });
          });
          return it("should change indent_size to 10", function() {
            atom.config.set('atom-beautify.js.indent_size', 10);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(10);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n          console.log('hello ' + hello)\n}");
              });
            });
          });
        });
      });
    });
  });

  describe("Languages", function() {
    var languages;
    languages = null;
    beforeEach(function() {
      return languages = new Languages();
    });
    return describe("Languages::namespace", function() {
      return it("should verify that multiple languages do not share the same namespace", function() {
        var namespaceGroups, namespaceOverlap, namespacePairs;
        namespaceGroups = _.groupBy(languages.languages, "namespace");
        namespacePairs = _.toPairs(namespaceGroups);
        namespaceOverlap = _.filter(namespacePairs, function(_arg) {
          var group, namespace;
          namespace = _arg[0], group = _arg[1];
          return group.length > 1;
        });
        return expect(namespaceOverlap.length).toBe(0, "Language namespaces are overlapping.\nNamespaces are unique: only one language for each namespace.\n" + _.map(namespaceOverlap, function(_arg) {
          var group, namespace;
          namespace = _arg[0], group = _arg[1];
          return "- '" + namespace + "': Check languages " + (_.map(group, 'name').join(', ')) + " for using namespace '" + namespace + "'.";
        }).join('\n'));
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NwZWMvYXRvbS1iZWF1dGlmeS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzRkFBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFrQixJQUFBLFdBQUEsQ0FBQSxDQURsQixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSLENBSFosQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUpKLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQVBWLENBQUE7O0FBQUEsRUFRQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FSUCxDQUFBOztBQUFBLEVBU0EsSUFBSSxDQUFDLEtBQUwsQ0FBQSxDQVRBLENBQUE7O0FBQUEsRUFpQkEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE9BQXBCLElBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLEtBQXNCLFFBRFosSUFFVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0IsTUFuQnhCLENBQUE7O0FBQUEsRUFxQkEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBRXhCLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUdULGVBQUEsQ0FBZ0IsU0FBQSxH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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/spec/atom-beautify-spec.coffee
