(function() {
  "use strict";
  var Beautifier, SassConvert,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = SassConvert = (function(_super) {
    __extends(SassConvert, _super);

    function SassConvert() {
      return SassConvert.__super__.constructor.apply(this, arguments);
    }

    SassConvert.prototype.name = "SassConvert";

    SassConvert.prototype.link = "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax";

    SassConvert.prototype.options = {
      CSS: false,
      Sass: false,
      SCSS: false
    };

    SassConvert.prototype.beautify = function(text, language, options, context) {
      var lang;
      lang = language.toLowerCase();
      return this.run("sass-convert", [this.tempFile("input", text), "--from", lang, "--to", lang]);
    };

    return SassConvert;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9zYXNzLWNvbnZlcnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQURiLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMEJBQUEsSUFBQSxHQUFNLGFBQU4sQ0FBQTs7QUFBQSwwQkFDQSxJQUFBLEdBQU0sb0VBRE4sQ0FBQTs7QUFBQSwwQkFHQSxPQUFBLEdBRUU7QUFBQSxNQUFBLEdBQUEsRUFBSyxLQUFMO0FBQUEsTUFDQSxJQUFBLEVBQU0sS0FETjtBQUFBLE1BRUEsSUFBQSxFQUFNLEtBRk47S0FMRixDQUFBOztBQUFBLDBCQVNBLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCLEdBQUE7QUFDUixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsV0FBVCxDQUFBLENBQVAsQ0FBQTthQUVBLElBQUMsQ0FBQSxHQUFELENBQUssY0FBTCxFQUFxQixDQUNuQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEbUIsRUFFbkIsUUFGbUIsRUFFVCxJQUZTLEVBRUgsTUFGRyxFQUVLLElBRkwsQ0FBckIsRUFIUTtJQUFBLENBVFYsQ0FBQTs7dUJBQUE7O0tBRHlDLFdBSDNDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/sass-convert.coffee
