(function() {
  "use strict";
  var Beautifier, LatexBeautify, fs, path, temp,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require("fs");

  temp = require("temp").track();

  module.exports = LatexBeautify = (function(_super) {
    __extends(LatexBeautify, _super);

    function LatexBeautify() {
      return LatexBeautify.__super__.constructor.apply(this, arguments);
    }

    LatexBeautify.prototype.name = "Latex Beautify";

    LatexBeautify.prototype.link = "https://github.com/cmhughes/latexindent.pl";

    LatexBeautify.prototype.options = {
      LaTeX: true
    };

    LatexBeautify.prototype.buildConfigFile = function(options) {
      var config, delim, indentChar, _i, _len, _ref;
      indentChar = options.indent_char;
      if (options.indent_with_tabs) {
        indentChar = "\\t";
      }
      config = "defaultIndent: \"" + indentChar + "\"\nalwaysLookforSplitBraces: " + (+options.always_look_for_split_braces) + "\nalwaysLookforSplitBrackets: " + (+options.always_look_for_split_brackets) + "\nindentPreamble: " + (+options.indent_preamble) + "\nremoveTrailingWhitespace: " + (+options.remove_trailing_whitespace) + "\nlookForAlignDelims:\n";
      _ref = options.align_columns_in_environments;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        delim = _ref[_i];
        config += "\t" + delim + ": 1\n";
      }
      return config;
    };

    LatexBeautify.prototype.setUpDir = function(dirPath, text, config) {
      this.texFile = path.join(dirPath, "latex.tex");
      fs.writeFile(this.texFile, text, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.configFile = path.join(dirPath, "localSettings.yaml");
      fs.writeFile(this.configFile, config, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.logFile = path.join(dirPath, "indent.log");
      return fs.writeFile(this.logFile, "", function(err) {
        if (err) {
          return reject(err);
        }
      });
    };

    LatexBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        return temp.mkdir("latex", function(err, dirPath) {
          if (err) {
            return reject(err);
          }
          return resolve(dirPath);
        });
      }).then((function(_this) {
        return function(dirPath) {
          var run;
          _this.setUpDir(dirPath, text, _this.buildConfigFile(options));
          return run = _this.run("latexindent", ["-o", "-s", "-l", "-c=" + dirPath, _this.texFile, _this.texFile], {
            help: {
              link: "https://github.com/cmhughes/latexindent.pl"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(_this.texFile);
        };
      })(this));
    };

    return LatexBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9sYXRleC1iZWF1dGlmeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSx5Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FITCxDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxLQUFoQixDQUFBLENBSlAsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw0QkFBQSxJQUFBLEdBQU0sZ0JBQU4sQ0FBQTs7QUFBQSw0QkFDQSxJQUFBLEdBQU0sNENBRE4sQ0FBQTs7QUFBQSw0QkFHQSxPQUFBLEdBQVM7QUFBQSxNQUNQLEtBQUEsRUFBTyxJQURBO0tBSFQsQ0FBQTs7QUFBQSw0QkFTQSxlQUFBLEdBQWlCLFNBQUMsT0FBRCxHQUFBO0FBQ2YsVUFBQSx5Q0FBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLE9BQU8sQ0FBQyxXQUFyQixDQUFBO0FBQ0EsTUFBQSxJQUFHLE9BQU8sQ0FBQyxnQkFBWDtBQUNFLFFBQUEsVUFBQSxHQUFhLEtBQWIsQ0FERjtPQURBO0FBQUEsTUFJQSxNQUFBLEdBQ0osbUJBQUEsR0FBbUIsVUFBbkIsR0FBOEIsZ0NBQTlCLEdBQ2MsQ0FBQyxDQUFBLE9BQVEsQ0FBQyw0QkFBVixDQURkLEdBQ3FELGdDQURyRCxHQUVHLENBQUMs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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/latex-beautify.coffee
