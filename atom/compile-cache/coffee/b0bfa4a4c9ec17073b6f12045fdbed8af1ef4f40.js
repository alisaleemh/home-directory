(function() {
  "use strict";
  var Beautifier, MarkoBeautifier,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = MarkoBeautifier = (function(_super) {
    __extends(MarkoBeautifier, _super);

    function MarkoBeautifier() {
      return MarkoBeautifier.__super__.constructor.apply(this, arguments);
    }

    MarkoBeautifier.prototype.name = 'Marko Beautifier';

    MarkoBeautifier.prototype.link = "https://github.com/marko-js/marko-prettyprint";

    MarkoBeautifier.prototype.options = {
      Marko: true
    };

    MarkoBeautifier.prototype.beautify = function(text, language, options, context) {
      return new this.Promise(function(resolve, reject) {
        var error, i, indent, indent_char, indent_size, markoPrettyprint, prettyprintOptions, _i, _ref;
        markoPrettyprint = require('marko-prettyprint');
        indent_char = options.indent_char || ' ';
        indent_size = options.indent_size || 4;
        indent = '';
        for (i = _i = 0, _ref = indent_size - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          indent += indent_char;
        }
        prettyprintOptions = {
          syntax: options.syntax,
          filename: (context != null) && (context.filePath != null) ? context.filePath : require.resolve('marko-prettyprint'),
          indent: indent
        };
        try {
          return resolve(markoPrettyprint(text, prettyprintOptions));
        } catch (_error) {
          error = _error;
          return reject(error);
        }
      });
    };

    return MarkoBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9tYXJrby1iZWF1dGlmaWVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxZQUFBLENBQUE7QUFBQSxNQUFBLDJCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFFckIsc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDhCQUFBLElBQUEsR0FBTSxrQkFBTixDQUFBOztBQUFBLDhCQUNBLElBQUEsR0FBTSwrQ0FETixDQUFBOztBQUFBLDhCQUdBLE9BQUEsR0FDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLElBQVA7S0FKRixDQUFBOztBQUFBLDhCQU1BLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCLEdBQUE7QUFFUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDbEIsWUFBQSwwRkFBQTtBQUFBLFFBQUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLG1CQUFSLENBQW5CLENBQUE7QUFBQSxRQUVBLFdBQUEsR0FBYyxPQUFPLENBQUMsV0FBUixJQUF1QixHQUZyQyxDQUFBO0FBQUEsUUFHQSxXQUFBLEdBQWMsT0FBTyxDQUFDLFdBQVIsSUFBdUIsQ0FIckMsQ0FBQTtBQUFBLFFBS0EsTUFBQSxHQUFTLEVBTFQsQ0FBQTtBQU9BLGFBQVMsb0dBQVQsR0FBQTtBQUNFLFVBQUEsTUFBQSxJQUFVLFdBQVYsQ0FERjtBQUFBLFNBUEE7QUFBQSxRQVVBLGtCQUFBLEdBQ0U7QUFBQSxVQUFBLE1BQUEsRUFBUyxPQUFPLENBQUMsTUFBakI7QUFBQSxVQUNBLFFBQUEsRUFBYSxpQkFBQSxJQUFhLDBCQUFoQixHQUF1QyxPQUFPLENBQUMsUUFBL0MsR0FBNkQsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsbUJBQWhCLENBRHZFO0FBQUEsVUFFQSxNQUFBLEVBQVEsTUFGUjtTQVhGLENBQUE7QUFlQTtpQkFDRSxPQUFBLENBQVEsZ0JBQUEsQ0FBaUIsSUFBakIsRUFBdUIsa0JBQXZCLENBQVIsRUFERjtTQUFBLGNBQUE7QUFJRSxVQUZJLGNBRUosQ0FBQTtpQkFBQSxNQUFBLENBQU8sS0FBUCxFQUpGO1NBaEJrQjtNQUFBLENBQVQsQ0FBWCxDQUZRO0lBQUEsQ0FOVixDQUFBOzsyQkFBQTs7S0FGNkMsV0FIL0MsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/marko-beautifier.coffee
