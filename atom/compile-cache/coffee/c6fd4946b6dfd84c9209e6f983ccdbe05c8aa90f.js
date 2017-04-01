
/*
  == ATOM-TERMINAL-PANEL  HELPERS PLUGIN ==

  Atom-terminal-panel builtin plugin v1.0.0
  -isis97

  Contains helper commands (mainly for C/C++ compilation/testing).
  These commands are defined just for testing purposes.
  You can remove this file safely.

  MIT License
  Feel free to do anything with this file.
 */

(function() {
  module.exports = {
    "compile": {
      "description": "Compiles the currently opened C/C++ file using g++.",
      "command": function(state, args) {
        var ADDITIONAL_FLAGS, COMPILER_FLAGS, COMPILER_NAME, SOURCE_FILE, TARGET_FILE;
        SOURCE_FILE = state.getCurrentFilePath();
        COMPILER_NAME = 'g++';
        COMPILER_FLAGS = ' -lm -std=c++0x -O2 -m32 -Wl,--oformat,pei-i386 -Wall' + ' -W -Wextra -Wdouble-promotion -pedantic -Wmissing-include-dirs' + ' -Wunused -Wuninitialized -Wextra -Wstrict-overflow=3 -Wtrampolines' + ' -Wfloat-equal -Wconversion -Wmissing-field-initializers -Wno-multichar' + ' -Wpacked -Winline -Wshadow';
        TARGET_FILE = "" + SOURCE_FILE + ".exe";
        TARGET_FILE = state.replaceAll('.cpp', '', TARGET_FILE);
        TARGET_FILE = state.replaceAll('.c', '', TARGET_FILE);
        ADDITIONAL_FLAGS = "";
        state.exec("" + COMPILER_NAME + " " + COMPILER_FLAGS + " \"" + SOURCE_FILE + "\" -o \"" + TARGET_FILE + "\" " + ADDITIONAL_FLAGS, args, state);
        return "";
      }
    },
    "run": {
      "params": "[name]",
      "description": "! Only for testing purposes. (meaningless). Runs the [name].exe file.",
      "command": function(state, args) {
        var SOURCE_FILE, TARGET_FILE;
        SOURCE_FILE = state.getCurrentFilePath();
        TARGET_FILE = "" + SOURCE_FILE + ".exe";
        return state.exec("\"" + TARGET_FILE + "\"", args, state);
      }
    },
    "test": {
      "params": "[name]",
      "description": "Tests the specified file with the input file. (executes [name].exe < [name])",
      "command": function(state, args) {
        var app_file, app_name_match, app_name_matcher, test_file;
        test_file = args[0];
        app_name_matcher = /([^0-9])*/ig;
        app_name_match = app_name_matcher.exec(test_file);
        app_file = app_name_match[0] + '.exe';
        state.execDelayedCommand('250', "" + app_file + " < " + test_file);
        return 'Probing application input ' + state.consoleLink(app_file) + ' < ' + state.consoleLink(test_file);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2NvbW1hbmRzL2hlbHBlcnMvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxTQUFBLEVBQ0U7QUFBQSxNQUFBLGFBQUEsRUFBZSxxREFBZjtBQUFBLE1BQ0EsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEseUVBQUE7QUFBQSxRQUFBLFdBQUEsR0FBYyxLQUFLLENBQUMsa0JBQU4sQ0FBQSxDQUFkLENBQUE7QUFBQSxRQUNBLGFBQUEsR0FBZ0IsS0FEaEIsQ0FBQTtBQUFBLFFBRUEsY0FBQSxHQUFpQix1REFBQSxHQUNoQixpRUFEZ0IsR0FFaEIscUVBRmdCLEdBR2hCLHlFQUhnQixHQUloQiw2QkFORCxDQUFBO0FBQUEsUUFPQSxXQUFBLEdBQWMsRUFBQSxHQUFHLFdBQUgsR0FBZSxNQVA3QixDQUFBO0FBQUEsUUFRQSxXQUFBLEdBQWMsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsTUFBakIsRUFBeUIsRUFBekIsRUFBNkIsV0FBN0IsQ0FSZCxDQUFBO0FBQUEsUUFTQSxXQUFBLEdBQWMsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsSUFBakIsRUFBdUIsRUFBdkIsRUFBMkIsV0FBM0IsQ0FUZCxDQUFBO0FBQUEsUUFVQSxnQkFBQSxHQUFtQixFQVZuQixDQUFBO0FBQUEsUUFXQSxLQUFLLENBQUMsSUFBTixDQUFXLEVBQUEsR0FBRyxhQUFILEdBQWlCLEdBQWpCLEdBQW9CLGNBQXBCLEdBQW1DLEtBQW5DLEdBQXdDLFdBQXhDLEdBQW9ELFVBQXBELEdBQThELFdBQTlELEdBQTBFLEtBQTFFLEdBQStFLGdCQUExRixFQUE4RyxJQUE5RyxFQUFvSCxLQUFwSCxDQVhBLENBQUE7QUFZQSxlQUFPLEVBQVAsQ0FiUztNQUFBLENBRFg7S0FERjtBQUFBLElBaUJBLEtBQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUFVLFFBQVY7QUFBQSxNQUNBLGFBQUEsRUFBZSx1RUFEZjtBQUFBLE1BRUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEsd0JBQUE7QUFBQSxRQUFBLFdBQUEsR0FBYyxLQUFLLENBQUMsa0JBQU4sQ0FBQSxDQUFkLENBQUE7QUFBQSxRQUNBLFdBQUEsR0FBYyxFQUFBLEdBQUcsV0FBSCxHQUFlLE1BRDdCLENBQUE7QUFFQSxlQUFPLEtBQUssQ0FBQyxJQUFOLENBQVksSUFBQSxHQUFJLFdBQUosR0FBZ0IsSUFBNUIsRUFBaUMsSUFBakMsRUFBdUMsS0FBdkMsQ0FBUCxDQUhTO01BQUEsQ0FGWDtLQWxCRjtBQUFBLElBeUJBLE1BQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUFVLFFBQVY7QUFBQSxNQUNBLGFBQUEsRUFBZSw4RUFEZjtBQUFBLE1BRUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEscURBQUE7QUFBQSxRQUFBLFNBQUEsR0FBWSxJQUFLLENBQUEsQ0FBQSxDQUFqQixDQUFBO0FBQUEsUUFDQSxnQkFBQSxHQUFtQixhQURuQixDQUFBO0FBQUEsUUFFQSxjQUFBLEdBQWlCLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFNBQXRCLENBRmpCLENBQUE7QUFBQSxRQUdBLFFBQUEsR0FBVyxjQUFlLENBQUEsQ0FBQSxDQUFmLEdBQW9CLE1BSC9CLENBQUE7QUFBQSxRQUlBLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxFQUFBLEdBQUcsUUFBSCxHQUFZLEtBQVosR0FBaUIsU0FBakQsQ0FKQSxDQUFBO0FBS0EsZUFBTyw0QkFBQSxHQUErQixLQUFLLENBQUMsV0FBTixDQUFrQixRQUFsQixDQUEvQixHQUE2RCxLQUE3RCxHQUFxRSxLQUFLLENBQUMsV0FBTixDQUFrQixTQUFsQixDQUE1RSxDQU5TO01BQUEsQ0FGWDtLQTFCRjtHQWRGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/commands/helpers/index.coffee
