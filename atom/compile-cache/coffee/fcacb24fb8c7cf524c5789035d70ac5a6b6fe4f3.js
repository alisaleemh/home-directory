
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Beautifier, ErlTidy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = ErlTidy = (function(_super) {
    __extends(ErlTidy, _super);

    function ErlTidy() {
      return ErlTidy.__super__.constructor.apply(this, arguments);
    }

    ErlTidy.prototype.name = "erl_tidy";

    ErlTidy.prototype.link = "http://erlang.org/doc/man/erl_tidy.html";

    ErlTidy.prototype.options = {
      Erlang: true
    };

    ErlTidy.prototype.beautify = function(text, language, options) {
      var tempFile;
      tempFile = void 0;
      return this.tempFile("input", text).then((function(_this) {
        return function(path) {
          tempFile = path;
          return _this.run("erl", [["-eval", 'erl_tidy:file("' + tempFile + '")'], ["-noshell", "-s", "init", "stop"]], {
            help: {
              link: "http://erlang.org/doc/man/erl_tidy.html"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return ErlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9lcmxfdGlkeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLEVBSUEsWUFKQSxDQUFBO0FBQUEsTUFBQSxtQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBRXJCLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxzQkFBQSxJQUFBLEdBQU0sVUFBTixDQUFBOztBQUFBLHNCQUNBLElBQUEsR0FBTSx5Q0FETixDQUFBOztBQUFBLHNCQUdBLE9BQUEsR0FBUztBQUFBLE1BQ1AsTUFBQSxFQUFRLElBREQ7S0FIVCxDQUFBOztBQUFBLHNCQU9BLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEdBQUE7QUFDUixVQUFBLFFBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxNQUFYLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDNUIsVUFBQSxRQUFBLEdBQVcsSUFBWCxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxFQUFZLENBQ1YsQ0FBQyxPQUFELEVBQVUsaUJBQUEsR0FBb0IsUUFBcEIsR0FBK0IsSUFBekMsQ0FEVSxFQUVWLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMkIsTUFBM0IsQ0FGVSxDQUFaLEVBSUU7QUFBQSxZQUFFLElBQUEsRUFBTTtBQUFBLGNBQUUsSUFBQSxFQUFNLHlDQUFSO2FBQVI7V0FKRixFQUY0QjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLENBUUMsQ0FBQyxJQVJGLENBUU8sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDTCxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFESztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUlAsRUFGUTtJQUFBLENBUFYsQ0FBQTs7bUJBQUE7O0tBRnFDLFdBUHZDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/erl_tidy.coffee
