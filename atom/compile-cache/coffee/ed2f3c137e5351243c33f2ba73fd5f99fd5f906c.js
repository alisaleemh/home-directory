
/*
Requires https://github.com/nrc/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt, path, versionCheckState,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  path = require('path');

  versionCheckState = false;

  module.exports = Rustfmt = (function(_super) {
    __extends(Rustfmt, _super);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.link = "https://github.com/nrc/rustfmt";

    Rustfmt.prototype.options = {
      Rust: true
    };

    Rustfmt.prototype.beautify = function(text, language, options, context) {
      var cwd, help, p, program;
      cwd = context.filePath && path.dirname(context.filePath);
      program = options.rustfmt_path || "rustfmt";
      help = {
        link: "https://github.com/nrc/rustfmt",
        program: "rustfmt",
        pathOption: "Rust - Rustfmt Path"
      };
      p = versionCheckState === program ? this.Promise.resolve() : this.run(program, ["--version"], {
        help: help
      }).then(function(stdout) {
        if (/^0\.(?:[0-4]\.[0-9])/.test(stdout.trim())) {
          versionCheckState = false;
          throw new Error("rustfmt version 0.5.0 or newer required");
        } else {
          versionCheckState = program;
          return void 0;
        }
      });
      return p.then((function(_this) {
        return function() {
          return _this.run(program, [], {
            cwd: cwd,
            help: help,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          });
        };
      })(this));
    };

    return Rustfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9ydXN0Zm10LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLDRDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQVFBLGlCQUFBLEdBQW9CLEtBUnBCLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsc0JBQUEsSUFBQSxHQUFNLFNBQU4sQ0FBQTs7QUFBQSxzQkFDQSxJQUFBLEdBQU0sZ0NBRE4sQ0FBQTs7QUFBQSxzQkFHQSxPQUFBLEdBQVM7QUFBQSxNQUNQLElBQUEsRUFBTSxJQURDO0tBSFQsQ0FBQTs7QUFBQSxzQkFPQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQixHQUFBO0FBQ1IsVUFBQSxxQkFBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLE9BQU8sQ0FBQyxRQUFSLElBQXFCLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCLENBQTNCLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxPQUFPLENBQUMsWUFBUixJQUF3QixTQURsQyxDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU87QUFBQSxRQUNMLElBQUEsRUFBTSxnQ0FERDtBQUFBLFFBRUwsT0FBQSxFQUFTLFNBRko7QUFBQSxRQUdMLFVBQUEsRUFBWSxxQkFIUDtPQUZQLENBQUE7QUFBQSxNQVdBLENBQUEsR0FBTyxpQkFBQSxLQUFxQixPQUF4QixHQUNGLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFBLENBREUsR0FHRixJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxDQUFDLFdBQUQsQ0FBZCxFQUE2QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQU47T0FBN0IsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFDLE1BQUQsR0FBQTtBQUNKLFFBQUEsSUFBRyxzQkFBc0IsQ0FBQyxJQUF2QixDQUE0QixNQUFNLENBQUMsSUFBUCxDQUFBLENBQTVCLENBQUg7QUFDRSxVQUFBLGlCQUFBLEdBQW9CLEtBQXBCLENBQUE7QUFDQSxnQkFBVSxJQUFBLEtBQUEsQ0FBTSx5Q0FBTixDQUFWLENBRkY7U0FBQSxNQUFBO0FBSUUsVUFBQSxpQkFBQSxHQUFvQixPQUFwQixDQUFBO2lCQUNBLE9BTEY7U0FESTtNQUFBLENBRFIsQ0FkRixDQUFBO2FBd0JBLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDTCxLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxFQUFkLEVBQWtCO0FBQUEsWUFDaEIsR0FBQSxFQUFLLEdBRFc7QUFBQSxZQUVoQixJQUFBLEVBQU0sSUFGVTtBQUFBLFlBR2hCLE9BQUEsRUFBUyxTQUFDLEtBQUQsR0FBQTtxQkFDUCxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFETztZQUFBLENBSE87V0FBbEIsRUFESztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVAsRUF6QlE7SUFBQSxDQVBWLENBQUE7O21CQUFBOztLQURxQyxXQVZ2QyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/rustfmt.coffee
