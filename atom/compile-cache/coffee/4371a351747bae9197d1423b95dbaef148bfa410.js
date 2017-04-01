
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  Terminal utility for doing simple stuff (like filesystem manip).
  The Util API can be accessed by the terminal plugins
  by calling state.util, e.g.
    "command": (state, args) ->
      state.util.rmdir './temp'
 */

(function() {
  var Util, dirname, extname, fs, resolve, sep, _ref;

  fs = include('fs');

  _ref = include('path'), resolve = _ref.resolve, dirname = _ref.dirname, extname = _ref.extname, sep = _ref.sep;

  Util = (function() {
    function Util() {}

    Util.prototype.os = function() {
      var isLinux, isMac, isWindows, osname;
      isWindows = false;
      isMac = false;
      isLinux = false;
      osname = process.platform || process.env.OS;
      if (/^win/igm.test(osname)) {
        isWindows = true;
      } else if (/^darwin/igm.test(osname)) {
        isMac = true;
      } else if (/^linux/igm.test(osname)) {
        isLinux = true;
      }
      return {
        windows: isWindows,
        mac: isMac,
        linux: isLinux
      };
    };

    Util.prototype.escapeRegExp = function(string) {
      if (string === null) {
        return null;
      }
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    Util.prototype.replaceAll = function(find, replace, str) {
      if (str == null) {
        return null;
      }
      if (str.replace == null) {
        return str;
      }
      return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    };

    Util.prototype.dir = function(paths, cwd) {
      var path, rcwd, ret, _i, _len;
      if (paths instanceof Array) {
        ret = [];
        for (_i = 0, _len = paths.length; _i < _len; _i++) {
          path = paths[_i];
          ret.push(this.dir(path, cwd));
        }
        return ret;
      } else {

        /*
        if (paths.indexOf('./') == 0) or (paths.indexOf('.\\') == 0)
          return @replaceAll '\\', '/', (cwd + '/' + paths)
        else if (paths.indexOf('../') == 0) or (paths.indexOf('..\\') == 0)
          return @replaceAll '\\', '/', (cwd + '/../' + paths)
        else
          return paths
         */
        rcwd = resolve('.');
        if ((paths.indexOf('/') !== 0) && (paths.indexOf('\\') !== 0) && (paths.indexOf('./') !== 0) && (paths.indexOf('.\\') !== 0) && (paths.indexOf('../') !== 0) && (paths.indexOf('..\\') !== 0)) {
          return paths;
        } else {
          return this.replaceAll('\\', '/', this.replaceAll(rcwd + sep, '', this.replaceAll(rcwd + sep, '', resolve(cwd, paths))));
        }
      }
    };

    Util.prototype.getFileName = function(fullpath) {
      var matcher;
      if (fullpath != null) {
        matcher = /(.*:)((.*)(\\|\/))*/ig;
        return fullpath.replace(matcher, "");
      }
      return null;
    };

    Util.prototype.getFilePath = function(fullpath) {
      if (typeof fillpath === "undefined" || fillpath === null) {
        return null;
      }
      return this.replaceAll(this.getFileName(fullpath), "", fullpath);
    };

    Util.prototype.copyFile = function(sources, targets) {
      var source, _i, _len;
      if (targets instanceof Array) {
        if (targets[0] != null) {
          return this.copyFile(sources, targets[0]);
        }
        return 0;
      } else {
        if (sources instanceof Array) {
          for (_i = 0, _len = sources.length; _i < _len; _i++) {
            source = sources[_i];
            fs.createReadStream(resolve(source)).pipe(fs.createWriteStream(resolve(targets)));
          }
          return sources.length;
        } else {
          return this.copyFile([sources], targets);
        }
      }
    };

    Util.prototype.cp = function(sources, targets) {
      var e, isDir, ret, source, stat, target, _i, _j, _len, _len1;
      if (targets instanceof Array) {
        ret = 0;
        for (_i = 0, _len = targets.length; _i < _len; _i++) {
          target = targets[_i];
          ret += this.cp(sources, target);
        }
        return ret;
      } else {
        if (sources instanceof Array) {
          for (_j = 0, _len1 = sources.length; _j < _len1; _j++) {
            source = sources[_j];
            isDir = false;
            try {
              stat = fs.statSync(targets, function(e) {});
              isDir = stat.isDirectory();
            } catch (_error) {
              e = _error;
              isDir = false;
            }
            if (!isDir) {
              this.copyFile(source, targets);
            } else {
              this.copyFile(source, targets + '/' + (this.getFileName(source)));
            }
          }
          return sources.length;
        } else {
          return this.cp([sources], targets);
        }
      }
    };

    Util.prototype.mkdir = function(paths) {
      var path, ret, _i, _len;
      if (paths instanceof Array) {
        ret = '';
        for (_i = 0, _len = paths.length; _i < _len; _i++) {
          path = paths[_i];
          fs.mkdirSync(path, function(e) {});
          ret += 'Directory created \"' + path + '\"\n';
        }
        return ret;
      } else {
        return this.mkdir([paths]);
      }
    };

    Util.prototype.rmdir = function(paths) {
      var path, ret, _i, _len;
      if (paths instanceof Array) {
        ret = '';
        for (_i = 0, _len = paths.length; _i < _len; _i++) {
          path = paths[_i];
          fs.rmdirSync(path, function(e) {});
          ret += 'Directory removed \"' + path + '\"\n';
        }
        return ret;
      } else {
        return this.rmdir([paths]);
      }
    };

    Util.prototype.rename = function(oldpath, newpath) {
      fs.renameSync(oldpath, newpath, function(e) {});
      return 'File/directory renamed: ' + oldpath + '\n';
    };

    return Util;

  })();

  module.exports = new Util();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAtdGVybWluYWwtdXRpbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOzs7Ozs7Ozs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSw4Q0FBQTs7QUFBQSxFQWFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQWJMLENBQUE7O0FBQUEsRUFjQSxPQUFtQyxPQUFBLENBQVEsTUFBUixDQUFuQyxFQUFDLGVBQUEsT0FBRCxFQUFVLGVBQUEsT0FBVixFQUFtQixlQUFBLE9BQW5CLEVBQTRCLFdBQUEsR0FkNUIsQ0FBQTs7QUFBQSxFQWdCTTtzQkFTSjs7QUFBQSxtQkFBQSxFQUFBLEdBQUksU0FBQSxHQUFBO0FBQ0YsVUFBQSxpQ0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLEtBQVosQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLEtBRFIsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFVLEtBRlYsQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFTLE9BQU8sQ0FBQyxRQUFSLElBQW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFIekMsQ0FBQTtBQUlBLE1BQUEsSUFBRyxTQUFTLENBQUMsSUFBVixDQUFlLE1BQWYsQ0FBSDtBQUNFLFFBQUEsU0FBQSxHQUFZLElBQVosQ0FERjtPQUFBLE1BRUssSUFBRyxZQUFZLENBQUMsSUFBYixDQUFrQixNQUFsQixDQUFIO0FBQ0gsUUFBQSxLQUFBLEdBQVEsSUFBUixDQURHO09BQUEsTUFFQSxJQUFHLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQWpCLENBQUg7QUFDSCxRQUFBLE9BQUEsR0FBVSxJQUFWLENBREc7T0FSTDtBQVVBLGFBQU87QUFBQSxRQUNMLE9BQUEsRUFBUyxTQURKO0FBQUEsUUFFTCxHQUFBLEVBQUssS0FGQTtBQUFBLFFBR0wsS0FBQSxFQUFPLE9BSEY7T0FBUCxDQVhFO0lBQUEsQ0FBSixDQUFBOztBQUFBLG1CQW9CQSxZQUFBLEdBQWMsU0FBQyxNQUFELEdBQUE7QUFDWixNQUFBLElBQUcsTUFBQSxLQUFVLElBQWI7QUFDRSxlQUFPLElBQVAsQ0FERjtPQUFBO0FBRUEsYUFBTyxNQUFNLENBQUMsT0FBUCxDQUFlLDZCQUFmLEVBQThDLE1BQTlDLENBQVAsQ0FIWTtJQUFBLENBcEJkLENBQUE7O0FBQUEsbUJBNkJBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLEdBQWhCLEdBQUE7QUFDVixNQUFBLElBQU8sV0FBUDtBQUNFLGVBQU8sSUFBUCxDQURGO09BQUE7QUFFQSxNQUFBLElBQU8sbUJBQVA7QUFDRSxlQUFPLEdBQVAsQ0FERjtPQUZBO0FBSUEsYUFBTyxHQUFHLENBQUMsT0FBSixDQUFnQixJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQsQ0FBUCxFQUE0QixHQUE1QixDQUFoQixFQUFrRCxPQUFsRCxDQUFQLENBTFU7SUFBQSxDQTdCWixDQUFBOztBQUFBLG1CQWtEQSxHQUFBLEdBQUssU0FBQyxLQUFELEVBQVEsR0FBUixHQUFBO0FBQ0gsVUFBQSx5QkFBQTtBQUFBLE1BQUEsSUFBRyxLQUFBLFlBQWlCLEtBQXBCO0FBQ0UsUUFBQSxHQUFBLEdBQU0sRUFBTixDQUFBO0FBQ0EsYUFBQSw0Q0FBQTsyQkFBQTtBQUNFLFVBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxHQUFYLENBQVQsQ0FBQSxDQURGO0FBQUEsU0FEQTtBQUdBLGVBQU8sR0FBUCxDQUpGO09BQUEsTUFBQTtBQU9FO0FBQUE7Ozs7Ozs7V0FBQTtBQUFBLFFBU0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxHQUFSLENBVFAsQ0FBQTtBQVVBLFFBQUEsSUFBRyxDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFBLEtBQXNCLENBQXZCLENBQUEsSUFBOEIsQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsQ0FBQSxLQUF1QixDQUF4QixDQUE5QixJQUE2RCxDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxDQUFBLEtBQXVCLENBQXhCLENBQTdELElBQTRGLENBQUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFkLENBQUEsS0FBd0IsQ0FBekIsQ0FBNUYsSUFBNEgsQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FBQSxLQUF3QixDQUF6QixDQUE1SCxJQUE0SixDQUFDLEtBQUssQ0FBQyxPQUFOLENBQWMsTUFBZCxDQUFBLEtBQXlCLENBQTFCLENBQS9KO0FBQ0UsaUJBQU8sS0FBUCxDQURGO1NBQUEsTUFBQTtBQUdFLGlCQUFPLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixHQUFsQixFQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLElBQUEsR0FBSyxHQUFqQixFQUFzQixFQUF0QixFQUEyQixJQUFDLENBQUEsVUFBRCxDQUFZLElBQUEsR0FBSyxHQUFqQixFQUFzQixFQUF0QixFQUEyQixPQUFBLENBQVEsR0FBUixFQUFhLEtBQWIsQ0FBM0IsQ0FBM0IsQ0FBeEIsQ0FBUCxDQUhGO1NBakJGO09BREc7SUFBQSxDQWxETCxDQUFBOztBQUFBLG1CQTBFQSxXQUFBLEdBQWEsU0FBQyxRQUFELEdBQUE7QUFDWCxVQUFBLE9BQUE7QUFBQSxNQUFBLElBQUcsZ0JBQUg7QUFDRSxRQUFBLE9BQUEsR0FBVSx1QkFBVixDQUFBO0FBQ0EsZUFBTyxRQUFRLENBQUMsT0FBVCxDQUFpQixPQUFqQixFQUEwQixFQUExQixDQUFQLENBRkY7T0FBQTtBQUdBLGFBQU8sSUFBUCxDQUpXO0lBQUEsQ0ExRWIsQ0FBQTs7QUFBQSxtQkFpRkEsV0FBQSxHQUFhLFNBQUMsUUFBRCxHQUFBO0FBQ1gsTUFBQSxJQUFPLG9EQUFQO0FBQ0UsZUFBTyxJQUFQLENBREY7T0FBQTtBQUVBLGFBQVEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsV0FBRCxDQUFhLFFBQWIsQ0FBWixFQUFvQyxFQUFwQyxFQUF3QyxRQUF4QyxDQUFSLENBSFc7SUFBQSxDQWpGYixDQUFBOztBQUFBLG1CQTBGQSxRQUFBLEdBQVUsU0FBQyxPQUFELEVBQVUsT0FBVixHQUFBO0FBQ1IsVUFBQSxnQkFBQTtBQUFBLE1BQUEsSUFBRyxPQUFBLFlBQW1CLEtBQXRCO0FBQ0UsUUFBQSxJQUFHLGtCQUFIO0FBQ0UsaUJBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLE9BQVEsQ0FBQSxDQUFBLENBQTNCLENBQVAsQ0FERjtTQUFBO0FBRUEsZUFBTyxDQUFQLENBSEY7T0FBQSxNQUFBO0FBS0UsUUFBQSxJQUFHLE9BQUEsWUFBbUIsS0FBdEI7QUFDRSxlQUFBLDhDQUFBO2lDQUFBO0FBQ0UsWUFBQSxFQUFFLENBQUMsZ0JBQUgsQ0FBcUIsT0FBQSxDQUFRLE1BQVIsQ0FBckIsQ0FDRSxDQUFDLElBREgsQ0FDUSxFQUFFLENBQUMsaUJBQUgsQ0FBc0IsT0FBQSxDQUFRLE9BQVIsQ0FBdEIsQ0FEUixDQUFBLENBREY7QUFBQSxXQUFBO0FBR0EsaUJBQU8sT0FBTyxDQUFDLE1BQWYsQ0FKRjtTQUFBLE1BQUE7QUFNRSxpQkFBTyxJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsT0FBRCxDQUFWLEVBQXFCLE9BQXJCLENBQVAsQ0FORjtTQUxGO09BRFE7SUFBQSxDQTFGVixDQUFBOztBQUFBLG1CQTBHQSxFQUFBLEdBQUksU0FBQyxPQUFELEVBQVUsT0FBVixHQUFBO0FBQ0YsVUFBQSx3REFBQTtBQUFBLE1BQUEsSUFBRyxPQUFBLFlBQW1CLEtBQXRCO0FBQ0UsUUFBQSxHQUFBLEdBQU0sQ0FBTixDQUFBO0FBQ0EsYUFBQSw4Q0FBQTsrQkFBQTtBQUNFLFVBQUEsR0FBQSxJQUFPLElBQUMsQ0FBQSxFQUFELENBQUksT0FBSixFQUFhLE1BQWIsQ0FBUCxDQURGO0FBQUEsU0FEQTtBQUdBLGVBQU8sR0FBUCxDQUpGO09BQUEsTUFBQTtBQU1FLFFBQUEsSUFBRyxPQUFBLFlBQW1CLEtBQXRCO0FBQ0UsZUFBQSxnREFBQTtpQ0FBQTtBQUNFLFlBQUEsS0FBQSxHQUFRLEtBQVIsQ0FBQTtBQUNBO0FBQ0UsY0FBQSxJQUFBLEdBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBWSxPQUFaLEVBQXFCLFNBQUMsQ0FBRCxHQUFBLENBQXJCLENBQVAsQ0FBQTtBQUFBLGNBQ0EsS0FBQSxHQUFRLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FEUixDQURGO2FBQUEsY0FBQTtBQUlFLGNBREksVUFDSixDQUFBO0FBQUEsY0FBQSxLQUFBLEdBQVEsS0FBUixDQUpGO2FBREE7QUFNQSxZQUFBLElBQUcsQ0FBQSxLQUFIO0FBQ0UsY0FBQSxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsT0FBbEIsQ0FBQSxDQURGO2FBQUEsTUFBQTtBQUdFLGNBQUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLE9BQUEsR0FBVSxHQUFWLEdBQWdCLENBQUMsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLENBQUQsQ0FBbEMsQ0FBQSxDQUhGO2FBUEY7QUFBQSxXQUFBO0FBV0EsaUJBQU8sT0FBTyxDQUFDLE1BQWYsQ0FaRjtTQUFBLE1BQUE7QUFjRSxpQkFBTyxJQUFDLENBQUEsRUFBRCxDQUFJLENBQUMsT0FBRCxDQUFKLEVBQWUsT0FBZixDQUFQLENBZEY7U0FORjtPQURFO0lBQUEsQ0ExR0osQ0FBQTs7QUFBQSxtQkFrSUEsS0FBQSxHQUFPLFNBQUMsS0FBRCxHQUFBO0FBQ0wsVUFBQSxtQkFBQTtBQUFBLE1BQUEsSUFBRyxLQUFBLFlBQWlCLEtBQXBCO0FBQ0UsUUFBQSxHQUFBLEdBQU0sRUFBTixDQUFBO0FBQ0EsYUFBQSw0Q0FBQTsyQkFBQTtBQUNFLFVBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFiLEVBQW1CLFNBQUMsQ0FBRCxHQUFBLENBQW5CLENBQUEsQ0FBQTtBQUFBLFVBQ0EsR0FBQSxJQUFPLHNCQUFBLEdBQXVCLElBQXZCLEdBQTRCLE1BRG5DLENBREY7QUFBQSxTQURBO0FBSUEsZUFBTyxHQUFQLENBTEY7T0FBQSxNQUFBO0FBT0UsZUFBTyxJQUFDLENBQUEsS0FBRCxDQUFPLENBQUMsS0FBRCxDQUFQLENBQVAsQ0FQRjtPQURLO0lBQUEsQ0FsSVAsQ0FBQTs7QUFBQSxtQkE2SUEsS0FBQSxHQUFPLFNBQUMsS0FBRCxHQUFBO0FBQ0wsVUFBQSxtQkFBQTtBQUFBLE1BQUEsSUFBRyxLQUFBLFlBQWlCLEtBQXBCO0FBQ0UsUUFBQSxHQUFBLEdBQU0sRUFBTixDQUFBO0FBQ0EsYUFBQSw0Q0FBQTsyQkFBQTtBQUNFLFVBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFiLEVBQW1CLFNBQUMsQ0FBRCxHQUFBLENBQW5CLENBQUEsQ0FBQTtBQUFBLFVBQ0EsR0FBQSxJQUFPLHNCQUFBLEdBQXVCLElBQXZCLEdBQTRCLE1BRG5DLENBREY7QUFBQSxTQURBO0FBSUEsZUFBTyxHQUFQLENBTEY7T0FBQSxNQUFBO0FBT0UsZUFBTyxJQUFDLENBQUEsS0FBRCxDQUFPLENBQUMsS0FBRCxDQUFQLENBQVAsQ0FQRjtPQURLO0lBQUEsQ0E3SVAsQ0FBQTs7QUFBQSxtQkF3SkEsTUFBQSxHQUFRLFNBQUMsT0FBRCxFQUFVLE9BQVYsR0FBQTtBQUNOLE1BQUEsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLEVBQXVCLE9BQXZCLEVBQWdDLFNBQUMsQ0FBRCxHQUFBLENBQWhDLENBQUEsQ0FBQTtBQUNBLGFBQU8sMEJBQUEsR0FBMkIsT0FBM0IsR0FBbUMsSUFBMUMsQ0FGTTtJQUFBLENBeEpSLENBQUE7O2dCQUFBOztNQXpCRixDQUFBOztBQUFBLEVBcUxBLE1BQU0sQ0FBQyxPQUFQLEdBQ00sSUFBQSxJQUFBLENBQUEsQ0F0TE4sQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp-terminal-util.coffee
