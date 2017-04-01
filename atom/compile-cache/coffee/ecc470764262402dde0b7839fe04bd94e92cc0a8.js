(function() {
  "use strict";
  var Beautifier, VueBeautifier, prettydiff, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  prettydiff = require("prettydiff");

  _ = require('lodash');

  module.exports = VueBeautifier = (function(_super) {
    __extends(VueBeautifier, _super);

    function VueBeautifier() {
      return VueBeautifier.__super__.constructor.apply(this, arguments);
    }

    VueBeautifier.prototype.name = "Vue Beautifier";

    VueBeautifier.prototype.options = {
      Vue: true
    };

    VueBeautifier.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var regexp;
        regexp = /(<(template|script|style)[^>]*>)((\s|\S)*?)<\/\2>/gi;
        return resolve(text.replace(regexp, function(match, begin, type, text) {
          var lang, _ref;
          lang = (_ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? _ref[1] : void 0;
          switch (type) {
            case "template":
              switch (lang) {
                case "pug":
                case "jade":
                  return match.replace(text, "\n" + require("pug-beautify")(text, options) + "\n");
                case void 0:
                  return match.replace(text, "\n" + require("js-beautify").html(text, options) + "\n");
                default:
                  return match;
              }
              break;
            case "script":
              return match.replace(text, "\n" + require("js-beautify")(text, options) + "\n");
            case "style":
              switch (lang) {
                case "sass":
                case "scss":
                  options = _.merge(options, {
                    source: text,
                    lang: "scss",
                    mode: "beautify"
                  });
                  return match.replace(text, prettydiff.api(options)[0]);
                case "less":
                  options = _.merge(options, {
                    source: text,
                    lang: "less",
                    mode: "beautify"
                  });
                  return match.replace(text, prettydiff.api(options)[0]);
                case void 0:
                  return match.replace(text, "\n" + require("js-beautify").css(text, options) + "\n");
                default:
                  return match;
              }
          }
        }));
      });
    };

    return VueBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy92dWUtYmVhdXRpZmllci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDRCQUFBLElBQUEsR0FBTSxnQkFBTixDQUFBOztBQUFBLDRCQUVBLE9BQUEsR0FDRTtBQUFBLE1BQUEsR0FBQSxFQUFLLElBQUw7S0FIRixDQUFBOztBQUFBLDRCQUtBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEdBQUE7QUFDUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDbEIsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMscURBQVQsQ0FBQTtlQUVBLE9BQUEsQ0FBUSxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQWIsRUFBcUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLElBQWYsRUFBcUIsSUFBckIsR0FBQTtBQUMzQixjQUFBLFVBQUE7QUFBQSxVQUFBLElBQUEsaUVBQStDLENBQUEsQ0FBQSxVQUEvQyxDQUFBO0FBRUEsa0JBQU8sSUFBUDtBQUFBLGlCQUNPLFVBRFA7QUFFSSxzQkFBTyxJQUFQO0FBQUEscUJBQ08sS0FEUDtBQUFBLHFCQUNjLE1BRGQ7eUJBRUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQUEsR0FBTyxPQUFBLENBQVEsY0FBUixDQUFBLENBQXdCLElBQXhCLEVBQThCLE9BQTlCLENBQVAsR0FBZ0QsSUFBcEUsRUFGSjtBQUFBLHFCQUdPLE1BSFA7eUJBSUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCLEVBQWtDLE9BQWxDLENBQVAsR0FBb0QsSUFBeEUsRUFKSjtBQUFBO3lCQU1JLE1BTko7QUFBQSxlQUZKO0FBQ087QUFEUCxpQkFTTyxRQVRQO3FCQVVJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFvQixJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBQSxDQUF1QixJQUF2QixFQUE2QixPQUE3QixDQUFQLEdBQStDLElBQW5FLEVBVko7QUFBQSxpQkFXTyxPQVhQO0FBWUksc0JBQU8sSUFBUDtBQUFBLHFCQUNPLE1BRFA7QUFBQSxxQkFDZSxNQURmO0FBRUksa0JBQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUNSO0FBQUEsb0JBQUEsTUFBQSxFQUFRLElBQVI7QUFBQSxvQkFDQSxJQUFBLEVBQU0sTUFETjtBQUFBLG9CQUVBLElBQUEsRUFBTSxVQUZOO21CQURRLENBQVYsQ0FBQTt5QkFJQSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBb0IsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmLENBQXdCLENBQUEsQ0FBQSxDQUE1QyxFQU5KO0FBQUEscUJBT08sTUFQUDtBQVFJLGtCQUFBLE9BQUEsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVIsRUFDVjtBQUFBLG9CQUFBLE1BQUEsRUFBUSxJQUFSO0FBQUEsb0JBQ0EsSUFBQSxFQUFNLE1BRE47QUFBQSxvQkFFQSxJQUFBLEVBQU0sVUFGTjttQkFEVSxDQUFWLENBQUE7eUJBSUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLFVBQVUsQ0FBQyxHQUFYLENBQWUsT0FBZixDQUF3QixDQUFBLENBQUEsQ0FBNUMsRUFaSjtBQUFBLHFCQWFPLE1BYlA7eUJBY0ksS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLElBQUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDLEdBQXZCLENBQTJCLElBQTNCLEVBQWlDLE9BQWpDLENBQVAsR0FBbUQsSUFBdkUsRUFkSjtBQUFBO3lCQWdCSSxNQWhCSjtBQUFBLGVBWko7QUFBQSxXQUgyQjtRQUFBLENBQXJCLENBQVIsRUFIa0I7TUFBQSxDQUFULENBQVgsQ0FEUTtJQUFBLENBTFYsQ0FBQTs7eUJBQUE7O0tBRDJDLFdBTDdDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/vue-beautifier.coffee
