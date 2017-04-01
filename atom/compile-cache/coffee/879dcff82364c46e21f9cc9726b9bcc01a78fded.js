
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  "use strict";
  var Beautifier, Sqlformat,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Sqlformat = (function(_super) {
    __extends(Sqlformat, _super);

    function Sqlformat() {
      return Sqlformat.__super__.constructor.apply(this, arguments);
    }

    Sqlformat.prototype.name = "sqlformat";

    Sqlformat.prototype.link = "https://github.com/andialbrecht/sqlparse";

    Sqlformat.prototype.options = {
      SQL: true
    };

    Sqlformat.prototype.beautify = function(text, language, options) {
      return this.run("sqlformat", [this.tempFile("input", text), "--reindent", options.indent_size != null ? "--indent_width=" + options.indent_size : void 0, (options.keywords != null) && options.keywords !== 'unchanged' ? "--keywords=" + options.keywords : void 0, (options.identifiers != null) && options.identifiers !== 'unchanged' ? "--identifiers=" + options.identifiers : void 0], {
        help: {
          link: "https://github.com/andialbrecht/sqlparse"
        }
      });
    };

    return Sqlformat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9zcWxmb3JtYXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUlBLFlBSkEsQ0FBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQUxiLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsd0JBQUEsSUFBQSxHQUFNLFdBQU4sQ0FBQTs7QUFBQSx3QkFDQSxJQUFBLEdBQU0sMENBRE4sQ0FBQTs7QUFBQSx3QkFHQSxPQUFBLEdBQVM7QUFBQSxNQUNQLEdBQUEsRUFBSyxJQURFO0tBSFQsQ0FBQTs7QUFBQSx3QkFPQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQWtCLENBQ2hCLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURnQixFQUVoQixZQUZnQixFQUcyQiwyQkFBM0MsR0FBQyxpQkFBQSxHQUFpQixPQUFPLENBQUMsV0FBMUIsR0FBQSxNQUhnQixFQUlxQiwwQkFBQSxJQUFxQixPQUFPLENBQUMsUUFBUixLQUFvQixXQUE5RSxHQUFDLGFBQUEsR0FBYSxPQUFPLENBQUMsUUFBdEIsR0FBQSxNQUpnQixFQUsyQiw2QkFBQSxJQUF3QixPQUFPLENBQUMsV0FBUixLQUF1QixXQUExRixHQUFDLGdCQUFBLEdBQWdCLE9BQU8sQ0FBQyxXQUF6QixHQUFBLE1BTGdCLENBQWxCLEVBTUs7QUFBQSxRQUFBLElBQUEsRUFBTTtBQUFBLFVBQ1AsSUFBQSxFQUFNLDBDQURDO1NBQU47T0FOTCxFQURRO0lBQUEsQ0FQVixDQUFBOztxQkFBQTs7S0FEdUMsV0FQekMsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/sqlformat.coffee
