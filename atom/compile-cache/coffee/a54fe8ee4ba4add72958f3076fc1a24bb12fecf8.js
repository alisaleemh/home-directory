(function() {
  var math_parser_sandbox, vm;

  vm = require('vm');

  require('./jquery.jqplot.min.js');


  /*
    == ATOM-TERMINAL-PANEL  UTILS PLUGIN ==
  
    Atom-terminal-panel builtin plugin v1.0.0
    -isis97
  
    Contains commands for math graphs plotting etc.
    Supports math function plotting (using JQPlot).
  
    MIT License
    Feel free to do anything with this file.
   */

  math_parser_sandbox = {
    sin: Math.sin,
    cos: Math.cos,
    ceil: Math.ceil,
    floor: Math.floor,
    PI: Math.PI,
    E: Math.E,
    tan: Math.tan,
    sqrt: Math.sqrt,
    pow: Math.pow,
    log: Math.log,
    round: Math.round
  };

  vm.createContext(math_parser_sandbox);

  module.exports = {
    "plot": {
      "description": "Plots math function using JQPlot.",
      "params": "<[FROM] [TO]> [CODE]",
      "example": "plot 0 10 sin(x)",
      "command": function(state, args) {
        var from, i, id, points, step, to, _i;
        points = [];
        if (args.length < 3) {
          args[2] = args[0];
          args[0] = -25;
          args[1] = 25;
        }
        from = vm.runInThisContext(args[0]);
        to = vm.runInThisContext(args[1]);
        step = (to - from) / 500.0;
        for (i = _i = from; step > 0 ? _i <= to : _i >= to; i = _i += step) {
          math_parser_sandbox.x = i;
          points.push([i, vm.runInContext(args[2], math_parser_sandbox)]);
        }
        math_parser_sandbox.x = void 0;
        id = generateRandomID();
        state.message('<div style="height:300px; width:500px;padding-left:25px;" ><div id="chart-' + id + '"></div></div>');
        $.jqplot('chart-' + id, [points], {
          series: [
            {
              showMarker: false
            }
          ],
          title: 'Plotting f(x):=' + args[2],
          axes: {
            xaxis: {
              label: 'Angle (radians)',
              labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
              labelOptions: {
                fontFamily: 'Georgia, Serif',
                fontSize: '0pt'
              }
            },
            yaxis: {
              label: '',
              labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
              labelOptions: {
                fontFamily: 'Georgia, Serif',
                fontSize: '0pt'
              }
            }
          }
        });
        return null;
      }
    },
    "parse": {
      "description": "Parses mathematical expression.",
      "params": "[EXPRESSION]",
      "command": function(state, args) {
        state.message("Result: " + (vm.runInContext(args[0], math_parser_sandbox)));
        return null;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2NvbW1hbmRzL21hdGgvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsQ0FBUSx3QkFBUixDQURBLENBQUE7O0FBSUE7QUFBQTs7Ozs7Ozs7Ozs7S0FKQTs7QUFBQSxFQWdCQSxtQkFBQSxHQUFzQjtBQUFBLElBQ3BCLEdBQUEsRUFBSyxJQUFJLENBQUMsR0FEVTtBQUFBLElBRXBCLEdBQUEsRUFBSyxJQUFJLENBQUMsR0FGVTtBQUFBLElBR3BCLElBQUEsRUFBTSxJQUFJLENBQUMsSUFIUztBQUFBLElBSXBCLEtBQUEsRUFBTyxJQUFJLENBQUMsS0FKUTtBQUFBLElBS3BCLEVBQUEsRUFBSSxJQUFJLENBQUMsRUFMVztBQUFBLElBTXBCLENBQUEsRUFBRyxJQUFJLENBQUMsQ0FOWTtBQUFBLElBT3BCLEdBQUEsRUFBSyxJQUFJLENBQUMsR0FQVTtBQUFBLElBUXBCLElBQUEsRUFBTSxJQUFJLENBQUMsSUFSUztBQUFBLElBU3BCLEdBQUEsRUFBSyxJQUFJLENBQUMsR0FUVTtBQUFBLElBVXBCLEdBQUEsRUFBSyxJQUFJLENBQUMsR0FWVTtBQUFBLElBV3BCLEtBQUEsRUFBTyxJQUFJLENBQUMsS0FYUTtHQWhCdEIsQ0FBQTs7QUFBQSxFQTZCQSxFQUFFLENBQUMsYUFBSCxDQUFpQixtQkFBakIsQ0E3QkEsQ0FBQTs7QUFBQSxFQStCQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGFBQUEsRUFBZSxtQ0FBZjtBQUFBLE1BQ0EsUUFBQSxFQUFVLHNC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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/commands/math/index.coffee
