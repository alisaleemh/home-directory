(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, scope, softTabs, tabLength, _ref, _ref1;

  scope = ['text.html'];

  tabLength = (_ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? _ref : 4;

  softTabs = (_ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? _ref1 : true;

  defaultIndentSize = (softTabs ? tabLength : 1);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    name: "Coldfusion",
    description: "Coldfusion Markup; cfscript is also handled via the prettydiff javascript parser",
    namespace: "cfml",

    /*
    Supported Grammars
     */
    grammars: ["html"],

    /*
    Supported extensions
     */
    extensions: ["cfm", "cfml", "cfc"],
    options: {
      indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      indent_char: {
        type: 'string',
        "default": defaultIndentChar,
        minimum: 0,
        description: "Indentation character"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvY29sZGZ1c2lvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0dBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsQ0FBQyxXQUFELENBQVIsQ0FBQTs7QUFBQSxFQUNBLFNBQUE7O2dDQUFpRSxDQURqRSxDQUFBOztBQUFBLEVBRUEsUUFBQTs7aUNBQStELElBRi9ELENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsU0FBakIsR0FBZ0MsQ0FBakMsQ0FIcEIsQ0FBQTs7QUFBQSxFQUlBLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixHQUFqQixHQUEwQixJQUEzQixDQUpwQixDQUFBOztBQUFBLEVBS0EscUJBQUEsR0FBd0IsQ0FBQSxRQUx4QixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUVmLElBQUEsRUFBTSxZQUZTO0FBQUEsSUFHZixXQUFBLEVBQWEsa0ZBSEU7QUFBQSxJQUlmLFNBQUEsRUFBVyxNQUpJO0FBTWY7QUFBQTs7T0FOZTtBQUFBLElBU2YsUUFBQSxFQUFVLENBQ1IsTUFEUSxDQVRLO0FBYWY7QUFBQTs7T0FiZTtBQUFBLElBZ0JmLFVBQUEsRUFBWSxDQUNWLEtBRFUsRUFFVixNQUZVLEVBR1YsS0FIVSxDQWhCRztBQUFBLElBc0JmLE9BQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLGlCQURUO0FBQUEsUUFFQSxPQUFBLEVBQVMsQ0FGVDtBQUFBLFFBR0EsV0FBQSxFQUFhLHlCQUhiO09BREY7QUFBQSxNQUtBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxpQkFEVDtBQUFBLFFBRUEsT0FBQSxFQUFTLENBRlQ7QUFBQSxRQUdBLFdBQUEsRUFBYSx1QkFIYjtPQU5GO0FBQUEsTUFVQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEdBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwwQ0FGYjtPQVhGO0FBQUEsTUFjQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSxzQkFGYjtPQWZGO0tBdkJhO0dBUGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/languages/coldfusion.coffee
