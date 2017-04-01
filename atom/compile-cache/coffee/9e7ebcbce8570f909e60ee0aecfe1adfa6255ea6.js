
/*
Requires https://github.com/avh4/elm-format
 */

(function() {
  "use strict";
  var Beautifier, ElmFormat,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = ElmFormat = (function(_super) {
    __extends(ElmFormat, _super);

    function ElmFormat() {
      return ElmFormat.__super__.constructor.apply(this, arguments);
    }

    ElmFormat.prototype.name = "elm-format";

    ElmFormat.prototype.link = "https://github.com/avh4/elm-format";

    ElmFormat.prototype.options = {
      Elm: true
    };

    ElmFormat.prototype.beautify = function(text, language, options) {
      var tempfile;
      return tempfile = this.tempFile("input", text, ".elm").then((function(_this) {
        return function(name) {
          return _this.run("elm-format", ['--yes', name], {
            help: {
              link: 'https://github.com/avh4/elm-format#installation-'
            }
          }).then(function() {
            return _this.readFile(name);
          });
        };
      })(this));
    };

    return ElmFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9lbG0tZm9ybWF0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FKYixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHdCQUFBLElBQUEsR0FBTSxZQUFOLENBQUE7O0FBQUEsd0JBQ0EsSUFBQSxHQUFNLG9DQUROLENBQUE7O0FBQUEsd0JBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxHQUFBLEVBQUssSUFERTtLQUhULENBQUE7O0FBQUEsd0JBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsUUFBQTthQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsRUFBeUIsTUFBekIsQ0FDWCxDQUFDLElBRFUsQ0FDTCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7aUJBQ0osS0FBQyxDQUFBLEdBQUQsQ0FBSyxZQUFMLEVBQW1CLENBQ2pCLE9BRGlCLEVBRWpCLElBRmlCLENBQW5CLEVBSUU7QUFBQSxZQUFFLElBQUEsRUFBTTtBQUFBLGNBQUUsSUFBQSxFQUFNLGtEQUFSO2FBQVI7V0FKRixDQU1BLENBQUMsSUFORCxDQU1NLFNBQUEsR0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLElBQVYsRUFESTtVQUFBLENBTk4sRUFESTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBREssRUFESDtJQUFBLENBUFYsQ0FBQTs7cUJBQUE7O0tBRHVDLFdBTnpDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/elm-format.coffee
