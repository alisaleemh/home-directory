
/*
Requires clang-format (https://clang.llvm.org)
 */

(function() {
  "use strict";
  var Beautifier, ClangFormat, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require('fs');

  module.exports = ClangFormat = (function(_super) {
    __extends(ClangFormat, _super);

    function ClangFormat() {
      return ClangFormat.__super__.constructor.apply(this, arguments);
    }

    ClangFormat.prototype.name = "clang-format";

    ClangFormat.prototype.link = "https://clang.llvm.org/docs/ClangFormat.html";

    ClangFormat.prototype.options = {
      "C++": false,
      "C": false,
      "Objective-C": false
    };


    /*
      Dump contents to a given file
     */

    ClangFormat.prototype.dumpToFile = function(name, contents) {
      if (name == null) {
        name = "atom-beautify-dump";
      }
      if (contents == null) {
        contents = "";
      }
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          return fs.open(name, "w", function(err, fd) {
            _this.debug('dumpToFile', name, err, fd);
            if (err) {
              return reject(err);
            }
            return fs.write(fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(name);
              });
            });
          });
        };
      })(this));
    };

    ClangFormat.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var currDir, currFile, dumpFile, editor, fullPath, _ref;
        editor = typeof atom !== "undefined" && atom !== null ? (_ref = atom.workspace) != null ? _ref.getActiveTextEditor() : void 0 : void 0;
        if (editor != null) {
          fullPath = editor.getPath();
          currDir = path.dirname(fullPath);
          currFile = path.basename(fullPath);
          dumpFile = path.join(currDir, ".atom-beautify." + currFile);
          return resolve(dumpFile);
        } else {
          return reject(new Error("No active editor found!"));
        }
      }).then((function(_this) {
        return function(dumpFile) {
          return _this.run("clang-format", [_this.dumpToFile(dumpFile, text), ["--style=file"]], {
            help: {
              link: "https://clang.llvm.org/docs/ClangFormat.html"
            }
          })["finally"](function() {
            return fs.unlink(dumpFile);
          });
        };
      })(this));
    };

    return ClangFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jbGFuZy1mb3JtYXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUlBLFlBSkEsQ0FBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQUxiLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FOUCxDQUFBOztBQUFBLEVBT0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBUEwsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBRXJCLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwwQkFBQSxJQUFBLEdBQU0sY0FBTixDQUFBOztBQUFBLDBCQUNBLElBQUEsR0FBTSw4Q0FETixDQUFBOztBQUFBLDBCQUdBLE9BQUEsR0FBUztBQUFBLE1BQ1AsS0FBQSxFQUFPLEtBREE7QUFBQSxNQUVQLEdBQUEsRUFBSyxLQUZFO0FBQUEsTUFHUCxhQUFBLEVBQWUsS0FIUjtLQUhULENBQUE7O0FBU0E7QUFBQTs7T0FUQTs7QUFBQSwwQkFZQSxVQUFBLEdBQVksU0FBQyxJQUFELEVBQThCLFFBQTlCLEdBQUE7O1FBQUMsT0FBTztPQUNsQjs7UUFEd0MsV0FBVztPQUNuRDtBQUFBLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7aUJBQ2xCLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUixFQUFjLEdBQWQsRUFBbUIsU0FBQyxHQUFELEVBQU0sRUFBTixHQUFBO0FBQ2pCLFlBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQLEVBQXFCLElBQXJCLEVBQTJCLEdBQTNCLEVBQWdDLEVBQWhDLENBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBc0IsR0FBdEI7QUFBQSxxQkFBTyxNQUFBLENBQU8sR0FBUCxDQUFQLENBQUE7YUFEQTttQkFFQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxRQUFiLEVBQXVCLFNBQUMsR0FBRCxHQUFBO0FBQ3JCLGNBQUEsSUFBc0IsR0FBdEI7QUFBQSx1QkFBTyxNQUFBLENBQU8sR0FBUCxDQUFQLENBQUE7ZUFBQTtxQkFDQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxTQUFDLEdBQUQsR0FBQTtBQUNYLGdCQUFBLElBQXNCLEdBQXRCO0FBQUEseUJBQU8sTUFBQSxDQUFPLEdBQVAsQ0FBUCxDQUFBO2lCQUFBO3VCQUNBLE9BQUEsQ0FBUSxJQUFSLEVBRlc7Y0FBQSxDQUFiLEVBRnFCO1lBQUEsQ0FBdkIsRUFIaUI7VUFBQSxDQUFuQixFQURrQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQsQ0FBWCxDQURVO0lBQUEsQ0FaWixDQUFBOztBQUFBLDBCQTJCQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBYVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2xCLFlBQUEsbURBQUE7QUFBQSxRQUFBLE1BQUEsd0ZBQXdCLENBQUUsbUJBQWpCLENBQUEsbUJBQVQsQ0FBQTtBQUNBLFFBQUEsSUFBRyxjQUFIO0FBQ0UsVUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFYLENBQUE7QUFBQSxVQUNBLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FEVixDQUFBO0FBQUEsVUFFQSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxRQUFkLENBRlgsQ0FBQTtBQUFBLFVBR0EsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFvQixpQkFBQSxHQUFpQixRQUFyQyxDQUhYLENBQUE7aUJBSUEsT0FBQSxDQUFRLFFBQVIsRUFMRjtTQUFBLE1BQUE7aUJBT0UsTUFBQSxDQUFXLElBQUEsS0FBQSxDQUFNLHlCQUFOLENBQVgsRUFQRjtTQUZrQjtNQUFBLENBQVQsQ0FXWCxDQUFDLElBWFUsQ0FXTCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7QUFFSixpQkFBTyxLQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsQ0FDMUIsS0FBQyxDQUFBLFVBQUQsQ0FBWSxRQUFaLEVBQXNCLElBQXRCLENBRDBCLEVBRTFCLENBQUMsY0FBRCxDQUYwQixDQUFyQixFQUdGO0FBQUEsWUFBQSxJQUFBLEVBQU07QUFBQSxjQUNQLElBQUEsRUFBTSw4Q0FEQzthQUFOO1dBSEUsQ0FLSCxDQUFDLFNBQUQsQ0FMRyxDQUtPLFNBQUEsR0FBQTttQkFDVixFQUFFLENBQUMsTUFBSCxDQUFVLFFBQVYsRUFEVTtVQUFBLENBTFAsQ0FBUCxDQUZJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FYSyxDQUFYLENBYlE7SUFBQSxDQTNCVixDQUFBOzt1QkFBQTs7S0FGeUMsV0FUM0MsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/clang-format.coffee
