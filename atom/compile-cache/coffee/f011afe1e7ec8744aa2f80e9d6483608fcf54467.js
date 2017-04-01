
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  This file contains basic, simple utilities used by coffeescript files.
 */

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof global === "undefined" || global === null) {
    throw "apt-utils: No global node.js namespace present.";
  }

  global.include = function(name) {
    var e, e2, r;
    if (window.cliUtilsIncludeLog == null) {
      window.cliUtilsIncludeLog = [];
    }
    if (name == null) {
      setTimeout((function(_this) {
        return function() {
          return atom.notifications.addError("atom-terminal-panel: Dependency error. Module with null-value name cannot be required.");
        };
      })(this), 500);
      return;
    }
    if ((name.indexOf('atp-')) === 0) {
      name = './' + name;
    }
    r = null;
    try {
      r = require(name);
    } catch (_error) {
      e = _error;
      if (__indexOf.call(window.cliUtilsIncludeLog, name) >= 0) {
        return r;
      } else {
        window.cliUtilsIncludeLog.push(name);
      }
      try {
        setTimeout((function(_this) {
          return function() {
            return atom.notifications.addError("atom-terminal-panel: Dependency error. Module [" + name + "] cannot be required.");
          };
        })(this), 500);
      } catch (_error) {
        e2 = _error;
      }
      throw e;
      throw "Dependency error. Module [" + name + "] cannot be required.";
    }
    return r;
  };

  global.generateRandomID = function() {
    var chars, i, length, result, _i;
    length = 32;
    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    result = '';
    for (i = _i = length; _i > 1; i = _i += -1) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAtdXRpbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxxSkFBQTs7QUFRQSxFQUFBLElBQU8sZ0RBQVA7QUFDRSxVQUFNLGlEQUFOLENBREY7R0FSQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQ2YsUUFBQSxRQUFBO0FBQUEsSUFBQSxJQUFPLGlDQUFQO0FBQ0UsTUFBQSxNQUFNLENBQUMsa0JBQVAsR0FBNEIsRUFBNUIsQ0FERjtLQUFBO0FBRUEsSUFBQSxJQUFPLFlBQVA7QUFDRSxNQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNULElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsd0ZBQTVCLEVBRFM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRUUsR0FGRixDQUFBLENBQUE7QUFHQSxZQUFBLENBSkY7S0FGQTtBQU9BLElBQUEsSUFBRyxDQUFDLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixDQUFELENBQUEsS0FBeUIsQ0FBNUI7QUFDRSxNQUFBLElBQUEsR0FBTyxJQUFBLEdBQUssSUFBWixDQURGO0tBUEE7QUFBQSxJQVVBLENBQUEsR0FBSSxJQVZKLENBQUE7QUFXQTtBQUNFLE1BQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxJQUFSLENBQUosQ0FERjtLQUFBLGNBQUE7QUFHRSxNQURJLFVBQ0osQ0FBQTtBQUFBLE1BQUEsSUFBRyxlQUFRLE1BQU0sQ0FBQyxrQkFBZixFQUFBLElBQUEsTUFBSDtBQUNFLGVBQU8sQ0FBUCxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQTFCLENBQStCLElBQS9CLENBQUEsQ0FIRjtPQUFBO0FBSUE7QUFDRSxRQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDVCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLGlEQUFBLEdBQWtELElBQWxELEdBQXVELHVCQUFuRixFQURTO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQUVFLEdBRkYsQ0FBQSxDQURGO09BQUEsY0FBQTtBQUlPLFFBQUQsV0FBQyxDQUpQO09BSkE7QUFTQSxZQUFNLENBQU4sQ0FUQTtBQVVBLFlBQU0sNEJBQUEsR0FBNkIsSUFBN0IsR0FBa0MsdUJBQXhDLENBYkY7S0FYQTtBQXlCQSxXQUFPLENBQVAsQ0ExQmU7RUFBQSxDQVhqQixDQUFBOztBQUFBLEVBd0NBLE1BQU0sQ0FBQyxnQkFBUCxHQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSw0QkFBQTtBQUFBLElBQUEsTUFBQSxHQUFTLEVBQVQsQ0FBQTtBQUFBLElBQ0EsS0FBQSxHQUFRLGdFQURSLENBQUE7QUFBQSxJQUVBLE1BQUEsR0FBUyxFQUZULENBQUE7QUFHQSxTQUFTLHFDQUFULEdBQUE7QUFDRSxNQUFBLE1BQUEsSUFBVSxLQUFNLENBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWhCLENBQTNCLENBQUEsQ0FBaEIsQ0FERjtBQUFBLEtBSEE7QUFLQSxXQUFPLE1BQVAsQ0FOd0I7RUFBQSxDQXhDMUIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp-utils.coffee
