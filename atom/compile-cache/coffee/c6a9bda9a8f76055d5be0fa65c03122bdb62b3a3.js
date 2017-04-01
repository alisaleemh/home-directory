
/*
  == ATOM-TERMINAL-PANEL  FILE-MANIP PLUGIN ==

  Atom-terminal-panel builtin plugin v1.0.0
  -isis97

  Contains commands for file system manipulation.

  MIT License
  Feel free to do anything with this file.
 */

(function() {
  module.exports = {
    "@": {
      "description": "Access native environment variables.",
      "command": function(state, args) {
        return state.parseTemplate("%(env." + args[0] + ")");
      }
    },
    "cp": {
      "params": "[file]... [destination]",
      "description": "Copies one/or more files to the specified directory (e.g cp ./test.js ./test/)",
      "command": function(state, args) {
        var e, srcs, tgt;
        srcs = args.slice(0, -1);
        tgt = args.slice(-1);
        try {
          return (state.util.cp(srcs, tgt)) + ' files copied.';
        } catch (_error) {
          e = _error;
          return state.consoleAlert('Failed to copy the given entries ' + e);
        }
      }
    },
    "mkdir": {
      "params": "[name]...",
      "description": "Create one/or more directories.",
      "params": "[FOLDER NAME]",
      "command": function(state, args) {
        var e;
        try {
          return state.util.mkdir(args);
        } catch (_error) {
          e = _error;
          return state.consoleAlert('Failed to create directory ' + e);
        }
      }
    },
    "rmdir": {
      "params": "[directory]...",
      "description": "Remove one/or more directories.",
      "command": function(state, args) {
        var e;
        try {
          return state.util.rmdir(args);
        } catch (_error) {
          e = _error;
          return state.consoleAlert('Failed to remove directory ' + e);
        }
      }
    },
    "rename": {
      "params": "[name] [new name]",
      "description": "Rename the given file/directory.",
      "command": function(state, args) {
        var e;
        try {
          return state.util.rename(args[0], args[1]);
        } catch (_error) {
          e = _error;
          return state.consoleAlert('Failed to rename file /or directory ' + e);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2NvbW1hbmRzL2ZpbGUtbWFuaXAvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7Ozs7OztHQUFBO0FBQUE7QUFBQTtBQUFBLEVBV0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsR0FBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsc0NBQWY7QUFBQSxNQUNBLFNBQUEsRUFBVyxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDVCxlQUFPLEtBQUssQ0FBQyxhQUFOLENBQW9CLFFBQUEsR0FBUyxJQUFLLENBQUEsQ0FBQSxDQUFkLEdBQWlCLEdBQXJDLENBQVAsQ0FEUztNQUFBLENBRFg7S0FERjtBQUFBLElBS0EsSUFBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUseUJBQVY7QUFBQSxNQUNBLGFBQUEsRUFBZSxnRkFEZjtBQUFBLE1BRUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEsWUFBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLElBQUssYUFBWixDQUFBO0FBQUEsUUFDQSxHQUFBLEdBQU0sSUFBSyxVQURYLENBQUE7QUFFQTtBQUNFLGlCQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFYLENBQWMsSUFBZCxFQUFvQixHQUFwQixDQUFELENBQUEsR0FBNEIsZ0JBQW5DLENBREY7U0FBQSxjQUFBO0FBR0UsVUFESSxVQUNKLENBQUE7aUJBQUEsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsbUNBQUEsR0FBb0MsQ0FBdkQsRUFIRjtTQUhTO01BQUEsQ0FGWDtLQU5GO0FBQUEsSUFnQkEsT0FBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUsV0FBVjtBQUFBLE1BQ0EsYUFBQSxFQUFlLGlDQURmO0FBQUEsTUFFQSxRQUFBLEVBQVUsZUFGVjtBQUFBLE1BR0EsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEsQ0FBQTtBQUFBO0FBQ0UsaUJBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFYLENBQWlCLElBQWpCLENBQVAsQ0FERjtTQUFBLGNBQUE7QUFHRSxVQURJLFVBQ0osQ0FBQTtpQkFBQSxLQUFLLENBQUMsWUFBTixDQUFtQiw2QkFBQSxHQUE4QixDQUFqRCxFQUhGO1NBRFM7TUFBQSxDQUhYO0tBakJGO0FBQUEsSUEwQkEsT0FBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUsZ0JBQVY7QUFBQSxNQUNBLGFBQUEsRUFBZSxpQ0FEZjtBQUFBLE1BRUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEsQ0FBQTtBQUFBO0FBQ0UsaUJBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFYLENBQWlCLElBQWpCLENBQVAsQ0FERjtTQUFBLGNBQUE7QUFHRSxVQURJLFVBQ0osQ0FBQTtpQkFBQSxLQUFLLENBQUMsWUFBTixDQUFtQiw2QkFBQSxHQUE4QixDQUFqRCxFQUhGO1NBRFM7TUFBQSxDQUZYO0tBM0JGO0FBQUEsSUFtQ0EsUUFBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUsbUJBQVY7QUFBQSxNQUNBLGFBQUEsRUFBZSxrQ0FEZjtBQUFBLE1BRUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEsQ0FBQTtBQUFBO0FBQ0UsaUJBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFYLENBQWtCLElBQUssQ0FBQSxDQUFBLENBQXZCLEVBQTJCLElBQUssQ0FBQSxDQUFBLENBQWhDLENBQVAsQ0FERjtTQUFBLGNBQUE7QUFHRSxVQURJLFVBQ0osQ0FBQTtpQkFBQSxLQUFLLENBQUMsWUFBTixDQUFtQixzQ0FBQSxHQUF1QyxDQUExRCxFQUhGO1NBRFM7TUFBQSxDQUZYO0tBcENGO0dBWkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/commands/file-manip/index.coffee
