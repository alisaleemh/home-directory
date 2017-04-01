(function() {
  module.exports = {
    hasCommand: function(element, name) {
      var command, commands, found, _i, _len;
      commands = atom.commands.findCommands({
        target: element
      });
      for (_i = 0, _len = commands.length; _i < _len; _i++) {
        command = commands[_i];
        if (command.name === name) {
          found = true;
        }
      }
      return found;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9vcGVuLWh0bWwtaW4tYnJvd3Nlci9zcGVjL3NwZWMtaGVscGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQU9FO0FBQUEsSUFBQSxVQUFBLEVBQVksU0FBQyxPQUFELEVBQVUsSUFBVixHQUFBO0FBQ1YsVUFBQSxrQ0FBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBZCxDQUEyQjtBQUFBLFFBQUEsTUFBQSxFQUFRLE9BQVI7T0FBM0IsQ0FBWCxDQUFBO0FBQ0EsV0FBQSwrQ0FBQTsrQkFBQTtZQUEwQyxPQUFPLENBQUMsSUFBUixLQUFnQjtBQUExRCxVQUFBLEtBQUEsR0FBUSxJQUFSO1NBQUE7QUFBQSxPQURBO2FBR0EsTUFKVTtJQUFBLENBQVo7R0FQRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/open-html-in-browser/spec/spec-helper.coffee
