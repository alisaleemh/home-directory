(function() {
  var os, vm;

  vm = require('vm');

  os = require('os');


  /*
    == ATOM-TERMINAL-PANEL  UTILS PLUGIN ==
  
    Atom-terminal-panel builtin plugin v1.0.0
    -isis97
  
    Contains commands for easier console usage.
  
    MIT License
    Feel free to do anything with this file.
   */

  module.exports = {
    "tmpdir": {
      "description": "Describes current machine.",
      "variable": function(state) {
        return os.tmpdir();
      }
    },
    "whoami": {
      "description": "Describes the current machine.",
      "variable": function(state) {
        return os.hostname() + ' [' + os.platform() + ' ; ' + os.type() + ' ' + os.release() + ' (' + os.arch() + ' x' + os.cpus().length + ')' + '] ' + (process.env.USERNAME || process.env.LOGNAME || process.env.USER);
      }
    },
    "os.hostname": {
      "description": "Returns the hostname of the operating system.",
      "variable": function(state) {
        return os.hostname();
      }
    },
    "os.type": {
      "description": "Returns the operating system name.",
      "variable": function(state) {
        return os.type();
      }
    },
    "os.platform": {
      "description": "Returns the operating system platform.",
      "variable": function(state) {
        return os.platform();
      }
    },
    "os.arch": {
      "description": 'Returns the operating system CPU architecture. Possible values are "x64", "arm" and "ia32".',
      "variable": function(state) {
        return os.arch();
      }
    },
    "os.release": {
      "description": "Returns the operating system release.",
      "variable": function(state) {
        return os.release();
      }
    },
    "os.uptime": {
      "description": "Returns the system uptime in seconds.",
      "variable": function(state) {
        return os.uptime();
      }
    },
    "os.totalmem": {
      "description": "Returns the total amount of system memory in bytes.",
      "variable": function(state) {
        return os.totalmem();
      }
    },
    "os.freemem": {
      "description": "Returns the amount of free system memory in bytes.",
      "variable": function(state) {
        return os.freemem();
      }
    },
    "os.cpus": {
      "description": "Returns the node.js JSON-format information about CPUs characteristics.",
      "variable": function(state) {
        return JSON.stringify(os.cpus());
      }
    },
    "terminal": {
      "description": "Shows the native terminal in the current location.",
      "command": function(state, args) {
        var o;
        o = state.util.os();
        if (o.windows) {
          return state.exec('start cmd.exe', args, state);
        } else {
          return state.message('%(label:error:Error) The "terminal" command is currently not supported on platforms other than windows.');
        }
      }
    },
    "settings": {
      "description": "Shows the ATOM settings.",
      "command": function(state, args) {
        return state.exec('application:show-settings', args, state);
      }
    },
    "eval": {
      "description": "Evaluates any javascript code.",
      "params": "[CODE]",
      "command": function(state, args) {
        vm.runInThisContext(args[0]);
        return null;
      }
    },
    "web": {
      "description": "Shows any web page.",
      "params": "[ADDRESS]",
      "command": function(state, args) {
        var address;
        address = args.join(' ');
        state.message("<iframe style='height:3000%;width:90%;' src='http://www." + address + "'></iframe>");
        return null;
      }
    },
    "web-atom": {
      "description": "Shows any web page.",
      "params": "[ADDRESS]",
      "command": function(state, args) {
        var query;
        query = args.join(' ');
        state.message("<iframe style='height:3000%;width:90%;' src='https://atom.io/packages/search?q=" + query + "'></iframe>");
        return null;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2NvbW1hbmRzL3V0aWxzL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxNQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBR0E7QUFBQTs7Ozs7Ozs7OztLQUhBOztBQUFBLEVBY0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsNEJBQWY7QUFBQSxNQUNBLFVBQUEsRUFBWSxTQUFDLEtBQUQsR0FBQTtlQUFXLEVBQUUsQ0FBQyxNQUFILENBQUEsRUFBWDtNQUFBLENBRFo7S0FERjtBQUFBLElBR0EsUUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsZ0NBQWY7QUFBQSxNQUNBLFVBQUEsRUFBWSxTQUFDLEtBQUQsR0FBQTtlQUFXLEVBQUUsQ0FBQyxRQUFILENBQUEsQ0FBQSxHQUFnQixJQUFoQixHQUF1QixFQUFFLENBQUMsUUFBSCxDQUFBLENBQXZCLEdBQXVDLEtBQXZDLEdBQStDLEVBQUUsQ0FBQyxJQUFILENBQUEsQ0FBL0MsR0FBMkQsR0FBM0QsR0FBaUUsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFqRSxHQUFnRixJQUFoRixHQUF1RixFQUFFLENBQUMsSUFBSCxDQUFBLENBQXZGLEdBQW1HLElBQW5HLEdBQTBHLEVBQUUsQ0FBQyxJQUFILENBQUEsQ0FBUyxDQUFDLE1BQXBILEdBQTZILEdBQTdILEdBQW1JLElBQW5JLEdBQTBJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFaLElBQXdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBcEMsSUFBK0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUE1RCxFQUFySjtNQUFBLENBRFo7S0FKRjtBQUFBLElBTUEsYUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsK0NBQWY7QUFBQSxNQUNBLFVBQUEsRUFBWSxTQUFDLEtBQUQsR0FBQTtlQUFXLEVBQUUsQ0FBQyxRQUFILENBQUEsRUFBWDtNQUFBLENBRFo7S0FQRjtBQUFBLElBU0EsU0FBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsb0NBQWY7QUFBQSxNQUNBLFVBQUEsRUFBWSxTQUFDLEtBQUQsR0FBQTtlQUFXLEVBQUUsQ0FBQyxJQUFILENBQUEsRUFBWDtNQUFBLENBRFo7S0FWRjtBQUFBLElBWUEsYUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsd0NBQWY7QUFBQSxNQUNBLFVBQUEsRUFBWSxTQUFDLEtBQUQsR0FBQTtlQUFXLEVBQUUsQ0FBQyxRQUFILENBQUEsRUFBWDtNQUFBLENBRFo7S0FiRjtBQUFBLElBZUEsU0FBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUsNkZBQWY7QUFBQSxNQUNBLFVBQUEsRUFBWSxTQUFDLEtBQUQsR0FBQTtlQUFXLEVBQUUsQ0FBQyxJQUFILENBQUEsRUFBWDtNQUFBLENBRFo7S0FoQkY7QUFBQSxJQWtCQSxZQUFBLEVBQ0U7QUFBQSxNQUFBLGFBQUEsRUFBZSx1Q0FBZjtBQUFBLE1BQ0EsVUFBQSxFQUFZLFNBQUMsS0FBRCxHQUFBO2VBQVcsRUFBRSxDQUFDLE9BQUgsQ0FBQSxFQUFYO01BQUEsQ0FEWjtLQW5CRjtBQUFBLElBcUJBLFdBQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFlLHVDQUFmO0FBQUEsTUFDQSxVQUFBLEVBQVksU0FBQyxLQUFELEdBQUE7ZUFBVyxFQUFFLENBQUMsTUFBSCxDQUFBLEVBQVg7TUFBQSxDQURaO0tBdEJGO0FBQUEsSUF3QkEsYUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUscURBQWY7QUFBQSxNQUNBLFVBQUEsRUFBWSxTQUFDLEtBQUQsR0FBQTtlQUFXLEVBQUUsQ0FBQyxRQUFILENBQUEsRUFBWDtNQUFBLENBRFo7S0F6QkY7QUFBQSxJQTJCQSxZQUFBLEVBQ0U7QUFBQSxNQUFBLGFBQUEsRUFBZSxvREFBZjtBQUFBLE1BQ0EsVUFBQSxFQUFZLFNBQUMsS0FBRCxHQUFBO2VBQVcsRUFBRSxDQUFDLE9BQUgsQ0FBQSxFQUFYO01BQUEsQ0FEWjtLQTVCRjtBQUFBLElBOEJBLFNBQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFlLHlFQUFmO0FBQUEsTUFDQSxVQUFBLEVBQVksU0FBQyxLQUFELEdBQUE7ZUFBVyxJQUFJLENBQUMsU0FBTCxDQUFlLEVBQUUsQ0FBQyxJQUFILENBQUEsQ0FBZixFQUFYO01BQUEsQ0FEWjtLQS9CRjtBQUFBLElBaUNBLFVBQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFnQixvREFBaEI7QUFBQSxNQUNBLFNBQUEsRUFBVyxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDVCxZQUFBLENBQUE7QUFBQSxRQUFBLENBQUEsR0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQVgsQ0FBQSxDQUFKLENBQUE7QUFDQSxRQUFBLElBQUcsQ0FBQyxDQUFDLE9BQUw7aUJBQ0UsS0FBSyxDQUFDLElBQU4sQ0FBVyxlQUFYLEVBQTRCLElBQTVCLEVBQWtDLEtBQWxDLEVBREY7U0FBQSxNQUFBO2lCQUdFLEtBQUssQ0FBQyxPQUFOLENBQWMseUdBQWQsRUFIRjtTQUZTO01BQUEsQ0FEWDtLQWxDRjtBQUFBLElBMENBLFVBQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFlLDBCQUFmO0FBQUEsTUFDQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO2VBQ1QsS0FBSyxDQUFDLElBQU4sQ0FBVywyQkFBWCxFQUF3QyxJQUF4QyxFQUE4QyxLQUE5QyxFQURTO01BQUEsQ0FEWDtLQTNDRjtBQUFBLElBOENBLE1BQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFlLGdDQUFmO0FBQUEsTUFDQSxRQUFBLEVBQVUsUUFEVjtBQUFBLE1BRUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFFBQUMsRUFBRSxDQUFDLGdCQUFILENBQW9CLElBQUssQ0FBQSxDQUFBLENBQXpCLENBQUQsQ0FBQTtBQUNBLGVBQU8sSUFBUCxDQUZTO01BQUEsQ0FGWDtLQS9DRjtBQUFBLElBb0RBLEtBQUEsRUFDRTtBQUFBLE1BQUEsYUFBQSxFQUFlLHFCQUFmO0FBQUEsTUFDQSxRQUFBLEVBQVUsV0FEVjtBQUFBLE1BRUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULFlBQUEsT0FBQTtBQUFBLFFBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixDQUFWLENBQUE7QUFBQSxRQUNBLEtBQUssQ0FBQyxPQUFOLENBQWUsMERBQUEsR0FBMEQsT0FBMUQsR0FBa0UsYUFBakYsQ0FEQSxDQUFBO0FBRUEsZUFBTyxJQUFQLENBSFM7TUFBQSxDQUZYO0tBckRGO0FBQUEsSUEyREEsVUFBQSxFQUNFO0FBQUEsTUFBQSxhQUFBLEVBQWUscUJBQWY7QUFBQSxNQUNBLFFBQUEsRUFBVSxXQURWO0FBQUEsTUFFQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1QsWUFBQSxLQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLENBQVIsQ0FBQTtBQUFBLFFBQ0EsS0FBSyxDQUFDLE9BQU4sQ0FBZSxpRkFBQSxHQUFpRixLQUFqRixHQUF1RixhQUF0RyxDQURBLENBQUE7QUFFQSxlQUFPLElBQVAsQ0FIUztNQUFBLENBRlg7S0E1REY7R0FmRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/commands/utils/index.coffee
