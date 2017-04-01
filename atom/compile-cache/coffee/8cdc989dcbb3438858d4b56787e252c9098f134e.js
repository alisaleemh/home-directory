
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  Class containing all builtin commands.
 */

(function() {
  var core;

  core = include('atp-core');

  module.exports = {
    "encode": {
      "params": "[encoding standard]",
      "deprecated": true,
      "description": "Change encoding.",
      "command": function(state, args) {
        var encoding;
        encoding = args[0];
        state.streamsEncoding = encoding;
        state.message('Changed encoding to ' + encoding);
        return null;
      }
    },
    "ls": {
      "description": "Lists files in the current directory.",
      "command": function(state, args) {
        state.commandLineNotCounted();
        if (!state.ls(args)) {
          return 'The directory is inaccessible.';
          return null;
        }
      }
    },
    "clear": {
      "description": "Clears the console output.",
      "command": function(state, args) {
        state.commandLineNotCounted();
        state.clear();
        return null;
      }
    },
    "echo": {
      "params": "[text]...",
      "description": "Prints the message to the output.",
      "command": function(state, args) {
        if (args != null) {
          state.message(args.join(' ') + '\n');
          return null;
        } else {
          state.message('\n');
          return null;
        }
      }
    },
    "print": {
      "params": "[text]...",
      "description": "Stringifies given parameters.",
      "command": function(state, args) {
        return JSON.stringify(args);
      }
    },
    "cd": {
      "params": "[directory]",
      "description": "Moves to the specified directory.",
      "command": function(state, args) {
        return state.cd(args);
      }
    },
    "new": {
      "description": "Creates a new file and opens it in the editor view.",
      "command": function(state, args) {
        var file_name, file_path;
        if (args === null || args === void 0) {
          atom.workspaceView.trigger('application:new-file');
          return null;
        }
        file_name = state.util.replaceAll('\"', '', args[0]);
        if (file_name === null || file_name === void 0) {
          atom.workspaceView.trigger('application:new-file');
          return null;
        } else {
          file_path = state.resolvePath(file_name);
          fs.closeSync(fs.openSync(file_path, 'w'));
          state.delay(function() {
            return atom.workspaceView.open(file_path);
          });
          return state.consoleLink(file_path);
        }
      }
    },
    "rm": {
      "params": "[file]",
      "description": "Removes the given file.",
      "command": function(state, args) {
        var filepath;
        filepath = state.resolvePath(args[0]);
        fs.unlink(filepath, function(e) {});
        return state.consoleLink(filepath);
      }
    },
    "memdump": {
      "description": "Displays a list of all available internally stored commands.",
      "command": function(state, args) {
        return state.getLocalCommandsMemdump();
      }
    },
    "?": {
      "description": "Displays a list of all available internally stored commands.",
      "command": function(state, args) {
        return state.exec('memdump', null, state);
      }
    },
    "exit": {
      "description": "Destroys the terminal session.",
      "command": function(state, args) {
        return state.destroy();
      }
    },
    "update": {
      "description": "Reloads the terminal configuration from terminal-commands.json",
      "command": function(state, args) {
        core.reload();
        return (state.consoleLabel('info', 'info')) + (state.consoleText('info', 'The console settings were reloaded'));
      }
    },
    "reload": {
      "description": "Reloads the atom window.",
      "command": function(state, args) {
        return atom.reload();
      }
    },
    "edit": {
      "params": "[file]",
      "description": "Opens the specified file in the editor view.",
      "command": function(state, args) {
        var file_name;
        file_name = state.resolvePath(args[0]);
        state.delay(function() {
          return atom.workspaceView.open(file_name);
        });
        return state.consoleLink(file_name);
      }
    },
    "link": {
      "params": "[file/directory]",
      "description": "Displays interactive link to the given file/directory.",
      "command": function(state, args) {
        var file_name;
        file_name = state.resolvePath(args[0]);
        return state.consoleLink(file_name);
      }
    },
    "l": {
      "params": "[file/directory]",
      "description": "Displays interactive link to the given file/directory.",
      "command": function(state, args) {
        return state.exec('link ' + args[0], null, state);
      }
    },
    "info": {
      "description": "Prints the welcome message to the screen.",
      "command": function(state, args) {
        state.clear();
        state.showInitMessage(true);
        return null;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAtYnVpbHRpbnMtY29tbWFuZHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxJQUFBOztBQUFBLEVBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSLENBUlAsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUFVLHFCQUFWO0FBQUEsTUFDQSxZQUFBLEVBQWMsSUFEZDtBQUFBLE1BRUEsYUFBQSxFQUFlLGtCQUZmO0FBQUEsTUFHQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1QsWUFBQSxRQUFBO0FBQUEsUUFBQSxRQUFBLEdBQVcsSUFBSyxDQUFBLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLFFBQ0EsS0FBSyxDQUFDLGVBQU4sR0FBd0IsUUFEeEIsQ0FBQTtBQUFBLFFBRUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxzQkFBQSxHQUF1QixRQUFyQyxDQUZBLENBQUE7QUFHQSxlQUFPLElBQVAsQ0FKUztNQUFBLENBSFg7S0FERjtBQUFBLElBU0EsSUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsdUNBQWY7QUFBQSxNQUNBLFNBQUEsRUFBVyxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDVCxRQUFBLEtBQUssQ0FBQyxxQkFBTixDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBRyxDQUFBLEtBQVMsQ0FBQyxFQUFOLENBQVMsSUFBVCxDQUFQO0FBQ0UsaUJBQU8sZ0NBQVAsQ0FBQTtBQUNBLGlCQUFPLElBQVAsQ0FGRjtTQUZTO01BQUEsQ0FEWDtLQVZGO0FB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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp-builtins-commands.coffee
