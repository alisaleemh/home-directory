(function() {
  module.exports = {
    name: "Fortran",
    namespace: "fortran",

    /*
    Supported Grammars
     */
    grammars: ["Fortran - Modern"],

    /*
    Supported extensions
     */
    extensions: ["f90", "F90"],

    /*
     */
    options: {
      emacs_path: {
        type: 'string',
        "default": "",
        description: "Path to the `emacs` executable"
      },
      emacs_script_path: {
        type: 'string',
        "default": "",
        description: "Path to the emacs script"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvZm9ydHJhbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUVmLElBQUEsRUFBTSxTQUZTO0FBQUEsSUFHZixTQUFBLEVBQVcsU0FISTtBQUtmO0FBQUE7O09BTGU7QUFBQSxJQVFmLFFBQUEsRUFBVSxDQUNSLGtCQURRLENBUks7QUFZZjtBQUFBOztPQVplO0FBQUEsSUFlZixVQUFBLEVBQVksQ0FDVixLQURVLEVBRVYsS0FGVSxDQWZHO0FBb0JmO0FBQUE7T0FwQmU7QUFBQSxJQXVCZixPQUFBLEVBRUU7QUFBQSxNQUFBLFVBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsZ0NBRmI7T0FERjtBQUFBLE1BSUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsMEJBRmI7T0FMRjtLQXpCYTtHQUFqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/languages/fortran.coffee
