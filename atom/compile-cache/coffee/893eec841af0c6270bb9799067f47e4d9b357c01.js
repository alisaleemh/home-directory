(function() {
  "use strict";
  var Beautifier, Remark,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Remark = (function(_super) {
    __extends(Remark, _super);

    function Remark() {
      return Remark.__super__.constructor.apply(this, arguments);
    }

    Remark.prototype.name = "Remark";

    Remark.prototype.link = "https://github.com/wooorm/remark";

    Remark.prototype.options = {
      _: {
        gfm: true,
        yaml: true,
        commonmark: true,
        footnotes: true,
        pedantic: true,
        breaks: true,
        entities: true,
        setext: true,
        closeAtx: true,
        looseTable: true,
        spacedTable: true,
        fence: true,
        fences: true,
        bullet: true,
        listItemIndent: true,
        incrementListMarker: true,
        rule: true,
        ruleRepetition: true,
        ruleSpaces: true,
        strong: true,
        emphasis: true,
        position: true
      },
      Markdown: true
    };

    Remark.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var cleanMarkdown, err, remark;
        try {
          remark = require('remark');
          cleanMarkdown = remark.process(text, options);
          return resolve(cleanMarkdown);
        } catch (_error) {
          err = _error;
          this.error("Remark error: " + err);
          return reject(err);
        }
      });
    };

    return Remark;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9yZW1hcmsuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsa0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQURiLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEscUJBQUEsSUFBQSxHQUFNLFFBQU4sQ0FBQTs7QUFBQSxxQkFDQSxJQUFBLEdBQU0sa0NBRE4sQ0FBQTs7QUFBQSxxQkFFQSxPQUFBLEdBQVM7QUFBQSxNQUNQLENBQUEsRUFBRztBQUFBLFFBQ0QsR0FBQSxFQUFLLElBREo7QUFBQSxRQUVELElBQUEsRUFBTSxJQUZMO0FBQUEsUUFHRCxVQUFBLEVBQVksSUFIWDtBQUFBLFFBSUQsU0FBQSxFQUFXLElBSlY7QUFBQSxRQUtELFFBQUEsRUFBVSxJQUxUO0FBQUEsUUFNRCxNQUFBLEVBQVEsSUFOUDtBQUFBLFFBT0QsUUFBQSxFQUFVLElBUFQ7QUFBQSxRQVFELE1BQUEsRUFBUSxJQVJQO0FBQUEsUUFTRCxRQUFBLEVBQVUsSUFUVDtBQUFBLFFBVUQsVUFBQSxFQUFZLElBVlg7QUFBQSxRQVdELFdBQUEsRUFBYSxJQVhaO0FBQUEsUUFZRCxLQUFBLEVBQU8sSUFaTjtBQUFBLFFBYUQsTUFBQSxFQUFRLElBYlA7QUFBQSxRQWNELE1BQUEsRUFBUSxJQWRQO0FBQUEsUUFlRCxjQUFBLEVBQWdCLElBZmY7QUFBQSxRQWdCRCxtQkFBQSxFQUFxQixJQWhCcEI7QUFBQSxRQWlCRCxJQUFBLEVBQU0sSUFqQkw7QUFBQSxRQWtCRCxjQUFBLEVBQWdCLElBbEJmO0FBQUEsUUFtQkQsVUFBQSxFQUFZLElBbkJYO0FBQUEsUUFvQkQsTUFBQSxFQUFRLElBcEJQO0FBQUEsUUFxQkQsUUFBQSxFQUFVLElBckJUO0FBQUEsUUFzQkQsUUFBQSxFQUFVLElBdEJUO09BREk7QUFBQSxNQXlCUCxRQUFBLEVBQVUsSUF6Qkg7S0FGVCxDQUFBOztBQUFBLHFCQThCQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBQ1IsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFlBQUEsMEJBQUE7QUFBQTtBQUNFLFVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQVQsQ0FBQTtBQUFBLFVBQ0EsYUFBQSxHQUFnQixNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsRUFBcUIsT0FBckIsQ0FEaEIsQ0FBQTtpQkFFQSxPQUFBLENBQVEsYUFBUixFQUhGO1NBQUEsY0FBQTtBQUtFLFVBREksWUFDSixDQUFBO0FBQUEsVUFBQSxJQUFDLENBQUEsS0FBRCxDQUFRLGdCQUFBLEdBQWdCLEdBQXhCLENBQUEsQ0FBQTtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQU5GO1NBRGtCO01BQUEsQ0FBVCxDQUFYLENBRFE7SUFBQSxDQTlCVixDQUFBOztrQkFBQTs7S0FEb0MsV0FIdEMsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/remark.coffee
