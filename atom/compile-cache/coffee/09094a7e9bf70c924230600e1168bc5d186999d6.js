
/*
Requires [dfmt](https://github.com/Hackerpilot/dfmt)
 */

(function() {
  "use strict";
  var Beautifier, Dfmt,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Dfmt = (function(_super) {
    __extends(Dfmt, _super);

    function Dfmt() {
      return Dfmt.__super__.constructor.apply(this, arguments);
    }

    Dfmt.prototype.name = "dfmt";

    Dfmt.prototype.link = "https://github.com/Hackerpilot/dfmt";

    Dfmt.prototype.options = {
      D: false
    };

    Dfmt.prototype.beautify = function(text, language, options) {
      return this.run("dfmt", [this.tempFile("input", text)]);
    };

    return Dfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9kZm10LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FKYixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsMkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLG1CQUFBLElBQUEsR0FBTSxNQUFOLENBQUE7O0FBQUEsbUJBQ0EsSUFBQSxHQUFNLHFDQUROLENBQUE7O0FBQUEsbUJBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxDQUFBLEVBQUcsS0FESTtLQUhULENBQUE7O0FBQUEsbUJBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQUFhLENBQ1gsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRFcsQ0FBYixFQURRO0lBQUEsQ0FQVixDQUFBOztnQkFBQTs7S0FEa0MsV0FOcEMsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/dfmt.coffee
