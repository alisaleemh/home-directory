(function() {
  "use strict";
  var Beautifier, TypeScriptFormatter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = TypeScriptFormatter = (function(_super) {
    __extends(TypeScriptFormatter, _super);

    function TypeScriptFormatter() {
      return TypeScriptFormatter.__super__.constructor.apply(this, arguments);
    }

    TypeScriptFormatter.prototype.name = "TypeScript Formatter";

    TypeScriptFormatter.prototype.link = "https://github.com/vvakame/typescript-formatter";

    TypeScriptFormatter.prototype.options = {
      TypeScript: true
    };

    TypeScriptFormatter.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var e, format, formatterUtils, opts, result;
          try {
            format = require("typescript-formatter/lib/formatter")["default"];
            formatterUtils = require("typescript-formatter/lib/utils");
            opts = formatterUtils.createDefaultFormatCodeOptions();
            if (options.indent_with_tabs) {
              opts.ConvertTabsToSpaces = false;
            } else {
              opts.TabSize = options.tab_width || options.indent_size;
              opts.IndentSize = options.indent_size;
              opts.IndentStyle = 'space';
            }
            _this.verbose('typescript', text, opts);
            result = format('', text, opts);
            _this.verbose(result);
            return resolve(result);
          } catch (_error) {
            e = _error;
            return reject(e);
          }
        };
      })(this));
    };

    return TypeScriptFormatter;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy90eXBlc2NyaXB0LWZvcm1hdHRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSwrQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxrQ0FBQSxJQUFBLEdBQU0sc0JBQU4sQ0FBQTs7QUFBQSxrQ0FDQSxJQUFBLEdBQU0saURBRE4sQ0FBQTs7QUFBQSxrQ0FFQSxPQUFBLEdBQVM7QUFBQSxNQUNQLFVBQUEsRUFBWSxJQURMO0tBRlQsQ0FBQTs7QUFBQSxrQ0FNQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUVsQixjQUFBLHVDQUFBO0FBQUE7QUFDRSxZQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsb0NBQVIsQ0FBNkMsQ0FBQyxTQUFELENBQXRELENBQUE7QUFBQSxZQUNBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGdDQUFSLENBRGpCLENBQUE7QUFBQSxZQUlBLElBQUEsR0FBTyxjQUFjLENBQUMsOEJBQWYsQ0FBQSxDQUpQLENBQUE7QUFNQSxZQUFBLElBQUcsT0FBTyxDQUFDLGdCQUFYO0FBQ0UsY0FBQSxJQUFJLENBQUMsbUJBQUwsR0FBMkIsS0FBM0IsQ0FERjthQUFBLE1BQUE7QUFHRSxjQUFBLElBQUksQ0FBQyxPQUFMLEdBQWUsT0FBTyxDQUFDLFNBQVIsSUFBcUIsT0FBTyxDQUFDLFdBQTVDLENBQUE7QUFBQSxjQUNBLElBQUksQ0FBQyxVQUFMLEdBQWtCLE9BQU8sQ0FBQyxXQUQxQixDQUFBO0FBQUEsY0FFQSxJQUFJLENBQUMsV0FBTCxHQUFtQixPQUZuQixDQUhGO2FBTkE7QUFBQSxZQWFBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixJQUF2QixFQUE2QixJQUE3QixDQWJBLENBQUE7QUFBQSxZQWNBLE1BQUEsR0FBUyxNQUFBLENBQU8sRUFBUCxFQUFXLElBQVgsRUFBaUIsSUFBakIsQ0FkVCxDQUFBO0FBQUEsWUFlQSxLQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQsQ0FmQSxDQUFBO21CQWdCQSxPQUFBLENBQVEsTUFBUixFQWpCRjtXQUFBLGNBQUE7QUFtQkUsWUFESSxVQUNKLENBQUE7QUFBQSxtQkFBTyxNQUFBLENBQU8sQ0FBUCxDQUFQLENBbkJGO1dBRmtCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVCxDQUFYLENBRFE7SUFBQSxDQU5WLENBQUE7OytCQUFBOztLQURpRCxXQUhuRCxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/typescript-formatter.coffee
