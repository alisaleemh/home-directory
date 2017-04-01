(function() {
  var os, vm;

  vm = require('vm');

  os = require('os');


  /*
    == ATOM-TERMINAL-PANEL  UI PLUGIN ==
  
    Atom-terminal-panel builtin plugin v1.0.0
    -isis97
  
    Contains commands for creating user interface components
    (e.g. bars etc.)
  
    MIT License
    Feel free to do anything with this file.
   */

  module.exports = {
    "ui-clock": {
      "description": "Displays the dynamic clock.",
      "command": function(state) {
        return state.exec("echo %(raw) %(dynamic) %(^#FF851B) %(hours12):%(minutes):%(seconds) %(ampm) %(^)", [], state);
      }
    },
    "ui-mem": {
      "description": "Displays the dynamic memory usage information",
      "command": function(state) {
        return state.exec("echo %(raw) %(dynamic) %(^#FF851B) Free memory/available memory: %(os.freemem)B / %(os.totalmem)B %(^)", [], state);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2NvbW1hbmRzL3VpL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxNQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBR0E7QUFBQTs7Ozs7Ozs7Ozs7S0FIQTs7QUFBQSxFQWVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFlLDZCQUFmO0FBQUEsTUFDQSxTQUFBLEVBQVcsU0FBQyxLQUFELEdBQUE7ZUFDVCxLQUFLLENBQUMsSUFBTixDQUFXLGtGQUFYLEVBQStGLEVBQS9GLEVBQW1HLEtBQW5HLEVBRFM7TUFBQSxDQURYO0tBREY7QUFBQSxJQUlBLFFBQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFlLCtDQUFmO0FBQUEsTUFDQSxTQUFBLEVBQVcsU0FBQyxLQUFELEdBQUE7ZUFDVCxLQUFLLENBQUMsSUFBTixDQUFXLHdHQUFYLEVBQXFILEVBQXJILEVBQXlILEtBQXpILEVBRFM7TUFBQSxDQURYO0tBTEY7R0FoQkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/commands/ui/index.coffee
