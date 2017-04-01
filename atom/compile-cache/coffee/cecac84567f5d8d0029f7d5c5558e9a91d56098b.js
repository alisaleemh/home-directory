
/*
 */

(function() {
  var Beautifier, Lua, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = Lua = (function(_super) {
    __extends(Lua, _super);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "Lua beautifier";

    Lua.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/lua-beautifier/beautifier.pl";

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      var lua_beautifier;
      lua_beautifier = path.resolve(__dirname, "beautifier.pl");
      return this.run("perl", [lua_beautifier, '<', this.tempFile("input", text)]);
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9sdWEtYmVhdXRpZmllci9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBO0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLFlBSkEsQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQUxiLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQiwwQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsa0JBQUEsSUFBQSxHQUFNLGdCQUFOLENBQUE7O0FBQUEsa0JBQ0EsSUFBQSxHQUFNLHFHQUROLENBQUE7O0FBQUEsa0JBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxHQUFBLEVBQUssSUFERTtLQUhULENBQUE7O0FBQUEsa0JBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsY0FBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsZUFBeEIsQ0FBakIsQ0FBQTthQUNBLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQUFhLENBQ1gsY0FEVyxFQUVYLEdBRlcsRUFHWCxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FIVyxDQUFiLEVBRlE7SUFBQSxDQVBWLENBQUE7O2VBQUE7O0tBRGlDLFdBUG5DLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/lua-beautifier/index.coffee
