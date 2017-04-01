(function() {
  "use strict";
  var Beautifier, Cljfmt, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  Beautifier = require('../beautifier');

  module.exports = Cljfmt = (function(_super) {
    __extends(Cljfmt, _super);

    function Cljfmt() {
      return Cljfmt.__super__.constructor.apply(this, arguments);
    }

    Cljfmt.prototype.name = "cljfmt";

    Cljfmt.prototype.link = "https://github.com/snoe/node-cljfmt";

    Cljfmt.prototype.options = {
      Clojure: false
    };

    Cljfmt.prototype.beautify = function(text, language, options) {
      var cljfmt, formatPath;
      formatPath = path.resolve(__dirname, "fmt.edn");
      cljfmt = path.resolve(__dirname, "..", "..", "..", "node_modules/.bin/cljfmt");
      return this.tempFile("input", text).then((function(_this) {
        return function(filePath) {
          return _this.run(cljfmt, [filePath, "--edn=" + formatPath]).then(function() {
            return _this.readFile(filePath);
          });
        };
      })(this));
    };

    return Cljfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jbGpmbXQvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsd0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FGYixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFFckIsNkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHFCQUFBLElBQUEsR0FBTSxRQUFOLENBQUE7O0FBQUEscUJBQ0EsSUFBQSxHQUFNLHFDQUROLENBQUE7O0FBQUEscUJBR0EsT0FBQSxHQUFTO0FBQUEsTUFDUCxPQUFBLEVBQVMsS0FERjtLQUhULENBQUE7O0FBQUEscUJBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsa0JBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsU0FBeEIsQ0FBYixDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DLElBQXBDLEVBQTBDLDBCQUExQyxDQURULENBQUE7YUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQzVCLEtBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQUFhLENBQ1gsUUFEVyxFQUVYLFFBQUEsR0FBVyxVQUZBLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxTQUFBLEdBQUE7bUJBQ04sS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBRE07VUFBQSxDQUhSLEVBRDRCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsRUFIUTtJQUFBLENBUFYsQ0FBQTs7a0JBQUE7O0tBRm9DLFdBSnRDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/cljfmt/index.coffee
