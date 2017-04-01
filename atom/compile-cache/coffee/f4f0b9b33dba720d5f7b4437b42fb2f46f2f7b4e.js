(function() {
  var _, highlightMatches, humanize, toggleConfig;

  _ = require('underscore-plus');

  toggleConfig = function(param) {
    var value;
    value = atom.config.get(param);
    return atom.config.set(param, !value);
  };

  humanize = function(name) {
    return _.humanizeEventName(_.dasherize(name));
  };

  highlightMatches = function(context, name, matches, offsetIndex) {
    var i, lastIndex, len, matchIndex, matchedChars, unmatched;
    if (offsetIndex == null) {
      offsetIndex = 0;
    }
    lastIndex = 0;
    matchedChars = [];
    for (i = 0, len = matches.length; i < len; i++) {
      matchIndex = matches[i];
      matchIndex -= offsetIndex;
      if (matchIndex < 0) {
        continue;
      }
      unmatched = name.substring(lastIndex, matchIndex);
      if (unmatched) {
        if (matchedChars.length) {
          context.span(matchedChars.join(''), {
            "class": 'character-match'
          });
        }
        matchedChars = [];
        context.text(unmatched);
      }
      matchedChars.push(name[matchIndex]);
      lastIndex = matchIndex + 1;
    }
    if (matchedChars.length) {
      context.span(matchedChars.join(''), {
        "class": 'character-match'
      });
    }
    return context.text(name.substring(lastIndex));
  };

  module.exports = {
    toggleConfig: toggleConfig,
    humanize: humanize,
    highlightMatches: highlightMatches
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzLWV4LW1vZGUvbGliL3V0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixZQUFBLEdBQWUsU0FBQyxLQUFEO0FBQ2IsUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsS0FBaEI7V0FDUixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsS0FBaEIsRUFBdUIsQ0FBSSxLQUEzQjtFQUZhOztFQUlmLFFBQUEsR0FBVyxTQUFDLElBQUQ7V0FDVCxDQUFDLENBQUMsaUJBQUYsQ0FBb0IsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQXBCO0VBRFM7O0VBSVgsZ0JBQUEsR0FBbUIsU0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixPQUFoQixFQUF5QixXQUF6QjtBQUNqQixRQUFBOztNQUQwQyxjQUFZOztJQUN0RCxTQUFBLEdBQVk7SUFDWixZQUFBLEdBQWU7QUFFZixTQUFBLHlDQUFBOztNQUNFLFVBQUEsSUFBYztNQUNkLElBQVksVUFBQSxHQUFhLENBQXpCO0FBQUEsaUJBQUE7O01BQ0EsU0FBQSxHQUFZLElBQUksQ0FBQyxTQUFMLENBQWUsU0FBZixFQUEwQixVQUExQjtNQUNaLElBQUcsU0FBSDtRQUNFLElBQWdFLFlBQVksQ0FBQyxNQUE3RTtVQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsRUFBbEIsQ0FBYixFQUFvQztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7V0FBcEMsRUFBQTs7UUFDQSxZQUFBLEdBQWU7UUFDZixPQUFPLENBQUMsSUFBUixDQUFhLFNBQWIsRUFIRjs7TUFJQSxZQUFZLENBQUMsSUFBYixDQUFrQixJQUFLLENBQUEsVUFBQSxDQUF2QjtNQUNBLFNBQUEsR0FBWSxVQUFBLEdBQWE7QUFUM0I7SUFXQSxJQUFnRSxZQUFZLENBQUMsTUFBN0U7TUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLFlBQVksQ0FBQyxJQUFiLENBQWtCLEVBQWxCLENBQWIsRUFBb0M7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGlCQUFQO09BQXBDLEVBQUE7O1dBQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFJLENBQUMsU0FBTCxDQUFlLFNBQWYsQ0FBYjtFQWhCaUI7O0VBa0JuQixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLGNBQUEsWUFBRDtJQUFlLFVBQUEsUUFBZjtJQUF5QixrQkFBQSxnQkFBekI7O0FBNUJqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbnRvZ2dsZUNvbmZpZyA9IChwYXJhbSkgLT5cbiAgdmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQocGFyYW0pXG4gIGF0b20uY29uZmlnLnNldChwYXJhbSwgbm90IHZhbHVlKVxuXG5odW1hbml6ZSA9IChuYW1lKSAtPlxuICBfLmh1bWFuaXplRXZlbnROYW1lKF8uZGFzaGVyaXplKG5hbWUpKVxuXG4jIENvcGllZCAmIG1vZGlmaWVkIGZyb20gZnV6enktZmluZGVyJ3MgY29kZS5cbmhpZ2hsaWdodE1hdGNoZXMgPSAoY29udGV4dCwgbmFtZSwgbWF0Y2hlcywgb2Zmc2V0SW5kZXg9MCkgLT5cbiAgbGFzdEluZGV4ID0gMFxuICBtYXRjaGVkQ2hhcnMgPSBbXSAjIEJ1aWxkIHVwIGEgc2V0IG9mIG1hdGNoZWQgY2hhcnMgdG8gYmUgbW9yZSBzZW1hbnRpY1xuXG4gIGZvciBtYXRjaEluZGV4IGluIG1hdGNoZXNcbiAgICBtYXRjaEluZGV4IC09IG9mZnNldEluZGV4XG4gICAgY29udGludWUgaWYgbWF0Y2hJbmRleCA8IDAgIyBJZiBtYXJraW5nIHVwIHRoZSBiYXNlbmFtZSwgb21pdCBuYW1lIG1hdGNoZXNcbiAgICB1bm1hdGNoZWQgPSBuYW1lLnN1YnN0cmluZyhsYXN0SW5kZXgsIG1hdGNoSW5kZXgpXG4gICAgaWYgdW5tYXRjaGVkXG4gICAgICBjb250ZXh0LnNwYW4gbWF0Y2hlZENoYXJzLmpvaW4oJycpLCBjbGFzczogJ2NoYXJhY3Rlci1tYXRjaCcgaWYgbWF0Y2hlZENoYXJzLmxlbmd0aFxuICAgICAgbWF0Y2hlZENoYXJzID0gW11cbiAgICAgIGNvbnRleHQudGV4dCB1bm1hdGNoZWRcbiAgICBtYXRjaGVkQ2hhcnMucHVzaChuYW1lW21hdGNoSW5kZXhdKVxuICAgIGxhc3RJbmRleCA9IG1hdGNoSW5kZXggKyAxXG5cbiAgY29udGV4dC5zcGFuIG1hdGNoZWRDaGFycy5qb2luKCcnKSwgY2xhc3M6ICdjaGFyYWN0ZXItbWF0Y2gnIGlmIG1hdGNoZWRDaGFycy5sZW5ndGhcbiAgY29udGV4dC50ZXh0IG5hbWUuc3Vic3RyaW5nKGxhc3RJbmRleCkgIyBSZW1haW5pbmcgY2hhcmFjdGVycyBhcmUgcGxhaW4gdGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IHt0b2dnbGVDb25maWcsIGh1bWFuaXplLCBoaWdobGlnaHRNYXRjaGVzfVxuIl19
