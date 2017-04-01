
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = PHPCBF = (function(_super) {
    __extends(PHPCBF, _super);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.options = {
      _: {
        standard: [
          "standard", function(standard) {
            if (standard) {
              return standard;
            } else {
              return "PEAR";
            }
          }
        ]
      },
      PHP: true
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var isWin, tempFile;
      this.debug('phpcbf', options);
      isWin = this.isWindows;
      if (isWin) {
        return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, this.which('phpcbf')]).then((function(_this) {
          return function(paths) {
            var exec, isExec, path, phpcbfPath, tempFile, _;
            _this.debug('phpcbf paths', paths);
            _ = require('lodash');
            path = require('path');
            phpcbfPath = _.find(paths, function(p) {
              return p && path.isAbsolute(p);
            });
            _this.verbose('phpcbfPath', phpcbfPath);
            _this.debug('phpcbfPath', phpcbfPath, paths);
            if (phpcbfPath != null) {
              isExec = path.extname(phpcbfPath) !== '';
              exec = isExec ? phpcbfPath : "php";
              return _this.run(exec, [!isExec ? phpcbfPath : void 0, "--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text)], {
                ignoreReturnCode: true,
                help: {
                  link: "http://php.net/manual/en/install.php"
                },
                onStdin: function(stdin) {
                  return stdin.end();
                }
              }).then(function() {
                return _this.readFile(tempFile);
              });
            } else {
              _this.verbose('phpcbf not found!');
              return _this.Promise.reject(_this.commandNotFoundError('phpcbf', {
                link: "https://github.com/squizlabs/PHP_CodeSniffer",
                program: "phpcbf.phar",
                pathOption: "PHPCBF Path"
              }));
            }
          };
        })(this));
      } else {
        return this.run("phpcbf", ["--no-patch", options.standard ? "--standard=" + options.standard : void 0, tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true,
          help: {
            link: "https://github.com/squizlabs/PHP_CodeSniffer"
          },
          onStdin: function(stdin) {
            return stdin.end();
          }
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9waHBjYmYuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUlBLFlBSkEsQ0FBQTtBQUFBLE1BQUEsa0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQUxiLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEscUJBQUEsSUFBQSxHQUFNLFFBQU4sQ0FBQTs7QUFBQSxxQkFDQSxJQUFBLEdBQU0sc0NBRE4sQ0FBQTs7QUFBQSxxQkFHQSxPQUFBLEdBQVM7QUFBQSxNQUNQLENBQUEsRUFDRTtBQUFBLFFBQUEsUUFBQSxFQUFVO1VBQUMsVUFBRCxFQUFhLFNBQUMsUUFBRCxHQUFBO0FBQ3JCLFlBQUEsSUFBSSxRQUFKO3FCQUNFLFNBREY7YUFBQSxNQUFBO3FCQUNnQixPQURoQjthQURxQjtVQUFBLENBQWI7U0FBVjtPQUZLO0FBQUEsTUFNUCxHQUFBLEVBQUssSUFORTtLQUhULENBQUE7O0FBQUEscUJBWUEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsZUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxRQUFQLEVBQWlCLE9BQWpCLENBQUEsQ0FBQTtBQUFBLE1BRUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxTQUZULENBQUE7QUFHQSxNQUFBLElBQUcsS0FBSDtlQUVFLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLENBQ29CLE9BQU8sQ0FBQyxXQUF2QyxHQUFBLElBQUMsQ0FBQSxLQUFE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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/beautifiers/phpcbf.coffee
