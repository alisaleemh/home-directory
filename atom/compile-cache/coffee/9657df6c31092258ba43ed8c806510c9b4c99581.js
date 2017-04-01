
/*
Requires [formatR](https://github.com/yihui/formatR)
 */

(function() {
  var Beautifier, R, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = R = (function(_super) {
    __extends(R, _super);

    function R() {
      return R.__super__.constructor.apply(this, arguments);
    }

    R.prototype.name = "formatR";

    R.prototype.link = "https://github.com/yihui/formatR";

    R.prototype.options = {
      R: true
    };

    R.prototype.beautify = function(text, language, options) {
      var r_beautifier;
      r_beautifier = path.resolve(__dirname, "formatR.r");
      return this.run("Rscript", [r_beautifier, options.indent_size, this.tempFile("input", text), '>', this.tempFile("input", text)]);
    };

    return R;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9mb3JtYXRSL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxtQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSFAsQ0FBQTs7QUFBQSxFQUtBLFlBTEEsQ0FBQTs7QUFBQSxFQU1BLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUixDQU5iLENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQix3QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsZ0JBQUEsSUFBQSxHQUFNLFNBQU4sQ0FBQTs7QUFBQSxnQkFDQSxJQUFBLEdBQU0sa0NBRE4sQ0FBQTs7QUFBQSxnQkFHQSxPQUFBLEdBQVM7QUFBQSxNQUNQLENBQUEsRUFBRyxJQURJO0tBSFQsQ0FBQTs7QUFBQSxnQkFPQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBQ1IsVUFBQSxZQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLFdBQXhCLENBQWYsQ0FBQTthQUNBLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixDQUNkLFlBRGMsRUFFZCxPQUFPLENBQUMsV0FGTSxFQUdkLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUhjLEVBSWQsR0FKYyxFQUtkLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUxjLENBQWhCLEVBRlE7SUFBQSxDQVBWLENBQUE7O2FBQUE7O0tBRCtCLFdBUmpDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/formatR/index.coffee
