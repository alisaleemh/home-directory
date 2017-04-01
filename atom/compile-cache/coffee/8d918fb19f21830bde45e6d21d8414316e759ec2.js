
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var Beautifier, Uncrustify, cfg, expandHomeDir, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('../beautifier');

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  _ = require('lodash');

  module.exports = Uncrustify = (function(_super) {
    __extends(Uncrustify, _super);

    function Uncrustify() {
      return Uncrustify.__super__.constructor.apply(this, arguments);
    }

    Uncrustify.prototype.name = "Uncrustify";

    Uncrustify.prototype.link = "https://github.com/uncrustify/uncrustify";

    Uncrustify.prototype.options = {
      Apex: true,
      C: true,
      "C++": true,
      "C#": true,
      "Objective-C": true,
      D: true,
      Pawn: true,
      Vala: true,
      Java: true,
      Arduino: true
    };

    Uncrustify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var basePath, configPath, editor, expandedConfigPath, projectPath;
        configPath = options.configPath;
        if (!configPath) {
          return cfg(options, function(error, cPath) {
            if (error) {
              throw error;
            }
            return resolve(cPath);
          });
        } else {
          editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            basePath = path.dirname(editor.getPath());
            projectPath = atom.workspace.project.getPaths()[0];
            expandedConfigPath = expandHomeDir(configPath);
            configPath = path.resolve(projectPath, expandedConfigPath);
            return resolve(configPath);
          } else {
            return reject(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
          }
        }
      }).then((function(_this) {
        return function(configPath) {
          var lang, outputFile;
          lang = "C";
          switch (language) {
            case "Apex":
              lang = "Apex";
              break;
            case "C":
              lang = "C";
              break;
            case "C++":
              lang = "CPP";
              break;
            case "C#":
              lang = "CS";
              break;
            case "Objective-C":
            case "Objective-C++":
              lang = "OC+";
              break;
            case "D":
              lang = "D";
              break;
            case "Pawn":
              lang = "PAWN";
              break;
            case "Vala":
              lang = "VALA";
              break;
            case "Java":
              lang = "JAVA";
              break;
            case "Arduino":
              lang = "CPP";
          }
          return _this.run("uncrustify", ["-c", configPath, "-f", _this.tempFile("input", text), "-o", outputFile = _this.tempFile("output", text), "-l", lang], {
            help: {
              link: "http://sourceforge.net/projects/uncrustify/"
            }
          }).then(function() {
            return _this.readFile(outputFile);
          });
        };
      })(this));
    };

    return Uncrustify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy91bmNydXN0aWZ5L2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU1BLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQU5QLENBQUE7O0FBQUEsRUFPQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxpQkFBUixDQVBoQixDQUFBOztBQUFBLEVBUUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBUkosQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxJQUFBLEdBQU0sWUFBTixDQUFBOztBQUFBLHlCQUNBLElBQUEsR0FBTSwwQ0FETixDQUFBOztBQUFBLHlCQUVBLE9BQUEsR0FBUztBQUFBLE1BQ1AsSUFBQSxFQUFNLElBREM7QUFBQSxNQUVQLENBQUEsRUFBRyxJQUZJO0FBQUEsTUFHUCxLQUFBLEVBQU8sSUFIQTtBQUFBLE1BSVAsSUFBQSxFQUFNLElBSkM7QUFBQSxNQUtQLGFBQUEsRUFBZSxJQUxSO0FBQUEsTUFNUCxDQUFBLEVBQUcsSUFOSTtBQUFBLE1BT1AsSUFBQSxFQUFNLElBUEM7QUFBQSxNQVFQLElBQUEsRUFBTSxJQVJDO0FBQUEsTUFTUCxJQUFBLEVBQU0sSUFUQztBQUFBLE1BVVAsT0FBQSxFQUFTLElBVkY7S0FGVCxD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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/uncrustify/index.coffee
