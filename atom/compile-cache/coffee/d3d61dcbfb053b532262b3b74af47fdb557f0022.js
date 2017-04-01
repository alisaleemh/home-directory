(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, scope, softTabs, tabLength, _ref, _ref1;

  scope = ['text.marko'];

  tabLength = (_ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? _ref : 4;

  softTabs = (_ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? _ref1 : true;

  defaultIndentSize = (softTabs ? tabLength : 4);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    name: "Marko",
    namespace: "marko",
    fallback: ['html'],

    /*
    Supported Grammars
     */
    grammars: ["Marko"],

    /*
    Supported extensions
     */
    extensions: ["marko"],
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
        description: "Indentation character"
      },
      syntax: {
        type: 'string',
        "default": "html",
        "enum": ["html", "concise"],
        description: "[html|concise]"
      }
    },
    defaultBeautifier: "Marko Beautifier"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbWFya28uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLG9HQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLENBQUMsWUFBRCxDQUFSLENBQUE7O0FBQUEsRUFDQSxTQUFBOztnQ0FBaUUsQ0FEakUsQ0FBQTs7QUFBQSxFQUVBLFFBQUE7O2lDQUErRCxJQUYvRCxDQUFBOztBQUFBLEVBR0EsaUJBQUEsR0FBb0IsQ0FBSSxRQUFILEdBQWlCLFNBQWpCLEdBQWdDLENBQWpDLENBSHBCLENBQUE7O0FBQUEsRUFJQSxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsR0FBakIsR0FBMEIsSUFBM0IsQ0FKcEIsQ0FBQTs7QUFBQSxFQUtBLHFCQUFBLEdBQXdCLENBQUEsUUFMeEIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFFZixJQUFBLEVBQU0sT0FGUztBQUFBLElBR2YsU0FBQSxFQUFXLE9BSEk7QUFBQSxJQUlmLFFBQUEsRUFBVSxDQUFDLE1BQUQsQ0FKSztBQU1mO0FBQUE7O09BTmU7QUFBQSxJQVNmLFFBQUEsRUFBVSxDQUNSLE9BRFEsQ0FUSztBQWFmO0FBQUE7O09BYmU7QUFBQSxJQWdCZixVQUFBLEVBQVksQ0FDVixPQURVLENBaEJHO0FBQUEsSUFvQmYsT0FBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsaUJBRFQ7QUFBQSxRQUVBLE9BQUEsRUFBUyxDQUZUO0FBQUEsUUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtBQUFBLE1BS0EsV0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLGlCQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsdUJBRmI7T0FORjtBQUFBLE1BU0EsTUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLE1BRFQ7QUFBQSxRQUVBLE1BQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxTQUFULENBRk47QUFBQSxRQUdBLFdBQUEsRUFBYSxnQkFIYjtPQVZGO0tBckJhO0FBQUEsSUFvQ2YsaUJBQUEsRUFBbUIsa0JBcENKO0dBUGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/languages/marko.coffee
