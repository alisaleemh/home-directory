
/*
Requires https://github.com/jaspervdj/stylish-haskell
 */

(function() {
  "use strict";
  var Beautifier, Crystal,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Crystal = (function(_super) {
    __extends(Crystal, _super);

    function Crystal() {
      return Crystal.__super__.constructor.apply(this, arguments);
    }

    Crystal.prototype.name = "Crystal";

    Crystal.prototype.link = "http://crystal-lang.org";

    Crystal.prototype.options = {
      Crystal: true
    };

    Crystal.prototype.beautify = function(text, language, options) {
      var tempFile;
      if (this.isWindows) {
        return this.Promise.reject(this.commandNotFoundError('crystal', {
          link: "http://crystal-lang.org",
          program: "crystal"
        }));
      } else {
        return this.run("crystal", ['tool', 'format', tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return Crystal;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jcnlzdGFsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLG1CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHNCQUFBLElBQUEsR0FBTSxTQUFOLENBQUE7O0FBQUEsc0JBQ0EsSUFBQSxHQUFNLHlCQUROLENBQUE7O0FBQUEsc0JBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxPQUFBLEVBQVMsSUFERjtLQUhULENBQUE7O0FBQUEsc0JBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUVSLFVBQUEsUUFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsU0FBSjtlQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsb0JBQUQsQ0FDZCxTQURjLEVBRWQ7QUFBQSxVQUNBLElBQUEsRUFBTSx5QkFETjtBQUFBLFVBRUEsT0FBQSxFQUFTLFNBRlQ7U0FGYyxDQUFoQixFQURGO09BQUEsTUFBQTtlQVNFLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixDQUNkLE1BRGMsRUFFZCxRQUZjLEVBR2QsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUhHLENBQWhCLEVBSUs7QUFBQSxVQUFDLGdCQUFBLEVBQWtCLElBQW5CO1NBSkwsQ0FLRSxDQUFDLElBTEgsQ0FLUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFESTtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFIsRUFURjtPQUZRO0lBQUEsQ0FQVixDQUFBOzttQkFBQTs7S0FEcUMsV0FQdkMsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/crystal.coffee
