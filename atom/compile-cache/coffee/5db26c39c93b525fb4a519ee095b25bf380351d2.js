(function() {
  "use strict";
  var Beautifier, PugBeautify,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = PugBeautify = (function(_super) {
    __extends(PugBeautify, _super);

    function PugBeautify() {
      return PugBeautify.__super__.constructor.apply(this, arguments);
    }

    PugBeautify.prototype.name = "Pug Beautify";

    PugBeautify.prototype.link = "https://github.com/vingorius/pug-beautify";

    PugBeautify.prototype.options = {
      Jade: {
        fill_tab: [
          'indent_char', function(indent_char) {
            return indent_char === "\t";
          }
        ],
        omit_div: true,
        tab_size: "indent_size"
      }
    };

    PugBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var error, pugBeautify;
        pugBeautify = require("pug-beautify");
        try {
          return resolve(pugBeautify(text, options));
        } catch (_error) {
          error = _error;
          return reject(error);
        }
      });
    };

    return PugBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9wdWctYmVhdXRpZnkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQURiLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMEJBQUEsSUFBQSxHQUFNLGNBQU4sQ0FBQTs7QUFBQSwwQkFDQSxJQUFBLEdBQU0sMkNBRE4sQ0FBQTs7QUFBQSwwQkFFQSxPQUFBLEdBQVM7QUFBQSxNQUVQLElBQUEsRUFDRTtBQUFBLFFBQUEsUUFBQSxFQUFVO1VBQUMsYUFBRCxFQUFnQixTQUFDLFdBQUQsR0FBQTtBQUV4QixtQkFBUSxXQUFBLEtBQWUsSUFBdkIsQ0FGd0I7VUFBQSxDQUFoQjtTQUFWO0FBQUEsUUFJQSxRQUFBLEVBQVUsSUFKVjtBQUFBLFFBS0EsUUFBQSxFQUFVLGFBTFY7T0FISztLQUZULENBQUE7O0FBQUEsMEJBYUEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUVSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNsQixZQUFBLGtCQUFBO0FBQUEsUUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGNBQVIsQ0FBZCxDQUFBO0FBQ0E7aUJBQ0UsT0FBQSxDQUFRLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLE9BQWxCLENBQVIsRUFERjtTQUFBLGNBQUE7QUFJRSxVQUZJLGNBRUosQ0FBQTtpQkFBQSxNQUFBLENBQU8sS0FBUCxFQUpGO1NBRmtCO01BQUEsQ0FBVCxDQUFYLENBRlE7SUFBQSxDQWJWLENBQUE7O3VCQUFBOztLQUR5QyxXQUgzQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/pug-beautify.coffee
