
/*
Requires https://github.com/google/yapf
 */

(function() {
  "use strict";
  var Beautifier, Yapf,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Yapf = (function(_super) {
    __extends(Yapf, _super);

    function Yapf() {
      return Yapf.__super__.constructor.apply(this, arguments);
    }

    Yapf.prototype.name = "yapf";

    Yapf.prototype.link = "https://github.com/google/yapf";

    Yapf.prototype.options = {
      Python: false
    };

    Yapf.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("yapf", ["-i", tempFile = this.tempFile("input", text)], {
        help: {
          link: "https://github.com/google/yapf"
        },
        ignoreReturnCode: true
      }).then((function(_this) {
        return function() {
          if (options.sort_imports) {
            return _this.run("isort", [tempFile], {
              help: {
                link: "https://github.com/timothycrosley/isort"
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.readFile(tempFile);
          }
        };
      })(this));
    };

    return Yapf;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy95YXBmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFFckIsMkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLG1CQUFBLElBQUEsR0FBTSxNQUFOLENBQUE7O0FBQUEsbUJBQ0EsSUFBQSxHQUFNLGdDQUROLENBQUE7O0FBQUEsbUJBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxNQUFBLEVBQVEsS0FERDtLQUhULENBQUE7O0FBQUEsbUJBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsUUFBQTthQUFBLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQUFhLENBQ1gsSUFEVyxFQUVYLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FGQSxDQUFiLEVBR0s7QUFBQSxRQUFBLElBQUEsRUFBTTtBQUFBLFVBQ1AsSUFBQSxFQUFNLGdDQURDO1NBQU47QUFBQSxRQUVBLGdCQUFBLEVBQWtCLElBRmxCO09BSEwsQ0FNRSxDQUFDLElBTkgsQ0FNUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ0osVUFBQSxJQUFHLE9BQU8sQ0FBQyxZQUFYO21CQUNFLEtBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUNFLENBQUMsUUFBRCxDQURGLEVBRUU7QUFBQSxjQUFBLElBQUEsRUFBTTtBQUFBLGdCQUNKLElBQUEsRUFBTSx5Q0FERjtlQUFOO2FBRkYsQ0FLQSxDQUFDLElBTEQsQ0FLTSxTQUFBLEdBQUE7cUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBREk7WUFBQSxDQUxOLEVBREY7V0FBQSxNQUFBO21CQVVFLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixFQVZGO1dBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU5SLEVBRFE7SUFBQSxDQVBWLENBQUE7O2dCQUFBOztLQUZrQyxXQVBwQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/yapf.coffee
