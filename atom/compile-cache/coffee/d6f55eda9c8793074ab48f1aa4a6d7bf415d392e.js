(function() {
  module.exports = {
    name: "Markdown",
    namespace: "markdown",

    /*
    Supported Grammars
     */
    grammars: ["GitHub Markdown"],

    /*
    Supported extensions
     */
    extensions: ["markdown", "md"],
    defaultBeautifier: "Tidy Markdown",
    options: {
      gfm: {
        type: 'boolean',
        "default": true,
        description: 'GitHub Flavoured Markdown'
      },
      yaml: {
        type: 'boolean',
        "default": true,
        description: 'Enables raw YAML front matter to be detected (thus ignoring markdown-like syntax).'
      },
      commonmark: {
        type: 'boolean',
        "default": false,
        description: 'Allows and disallows several constructs.'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbWFya2Rvd24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFFZixJQUFBLEVBQU0sVUFGUztBQUFBLElBR2YsU0FBQSxFQUFXLFVBSEk7QUFLZjtBQUFBOztPQUxlO0FBQUEsSUFRZixRQUFBLEVBQVUsQ0FDUixpQkFEUSxDQVJLO0FBWWY7QUFBQTs7T0FaZTtBQUFBLElBZWYsVUFBQSxFQUFZLENBQ1YsVUFEVSxFQUVWLElBRlUsQ0FmRztBQUFBLElBb0JmLGlCQUFBLEVBQW1CLGVBcEJKO0FBQUEsSUFzQmYsT0FBQSxFQUNFO0FBQUEsTUFBQSxHQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDJCQUZiO09BREY7QUFBQSxNQUlBLElBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsb0ZBRmI7T0FMRjtBQUFBLE1BUUEsVUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSwwQ0FGYjtPQVRGO0tBdkJhO0dBQWpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/languages/markdown.coffee
