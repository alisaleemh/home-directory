
/*
Requires https://github.com/OCamlPro/ocp-indent
 */

(function() {
  "use strict";
  var Beautifier, OCPIndent,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = OCPIndent = (function(_super) {
    __extends(OCPIndent, _super);

    function OCPIndent() {
      return OCPIndent.__super__.constructor.apply(this, arguments);
    }

    OCPIndent.prototype.name = "ocp-indent";

    OCPIndent.prototype.link = "https://www.typerex.org/ocp-indent.html";

    OCPIndent.prototype.options = {
      OCaml: true
    };

    OCPIndent.prototype.beautify = function(text, language, options) {
      return this.run("ocp-indent", [this.tempFile("input", text)], {
        help: {
          link: "https://www.typerex.org/ocp-indent.html"
        }
      });
    };

    return OCPIndent;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9vY3AtaW5kZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHdCQUFBLElBQUEsR0FBTSxZQUFOLENBQUE7O0FBQUEsd0JBQ0EsSUFBQSxHQUFNLHlDQUROLENBQUE7O0FBQUEsd0JBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxLQUFBLEVBQU8sSUFEQTtLQUhULENBQUE7O0FBQUEsd0JBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssWUFBTCxFQUFtQixDQUNqQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEaUIsQ0FBbkIsRUFFSztBQUFBLFFBQ0QsSUFBQSxFQUFNO0FBQUEsVUFDSixJQUFBLEVBQU0seUNBREY7U0FETDtPQUZMLEVBRFE7SUFBQSxDQVBWLENBQUE7O3FCQUFBOztLQUR1QyxXQVB6QyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/ocp-indent.coffee
