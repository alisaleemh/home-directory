(function() {
  var Languages, jsonStringify, langs, languages, _;

  jsonStringify = require('json-stable-stringify');

  Languages = require('../src/languages');

  languages = new Languages().languages;

  _ = require('lodash');

  langs = _.chain(languages).map(function(lang) {
    return {
      name: lang.name,
      namespace: lang.namespace,
      extensions: lang.extensions || [],
      atomGrammars: lang.grammars || [],
      sublimeSyntaxes: []
    };
  }).value();

  console.log(jsonStringify(langs, {
    space: 2
  }));

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NjcmlwdC9saXN0LW9wdGlvbnMtYW5kLWxhbmd1YWdlcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkNBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSx1QkFBUixDQUFoQixDQUFBOztBQUFBLEVBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxrQkFBUixDQURaLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksR0FBQSxDQUFBLFNBQUksQ0FBQSxDQUFXLENBQUMsU0FGNUIsQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUpKLENBQUE7O0FBQUEsRUFpQkEsS0FBQSxHQUFRLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixDQUNFLENBQUMsR0FESCxDQUNPLFNBQUMsSUFBRCxHQUFBO0FBQ0gsV0FBTztBQUFBLE1BQ0wsSUFBQSxFQUFNLElBQUksQ0FBQyxJQUROO0FBQUEsTUFFTCxTQUFBLEVBQVcsSUFBSSxDQUFDLFNBRlg7QUFBQSxNQUdMLFVBQUEsRUFBWSxJQUFJLENBQUMsVUFBTCxJQUFtQixFQUgxQjtBQUFBLE1BSUwsWUFBQSxFQUFjLElBQUksQ0FBQyxRQUFMLElBQWlCLEVBSjFCO0FBQUEsTUFLTCxlQUFBLEVBQWlCLEVBTFo7S0FBUCxDQURHO0VBQUEsQ0FEUCxDQVVFLENBQUMsS0FWSCxDQUFBLENBakJSLENBQUE7O0FBQUEsRUE0QkEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxhQUFBLENBQWMsS0FBZCxFQUFxQjtBQUFBLElBQy9CLEtBQUEsRUFBTyxDQUR3QjtHQUFyQixDQUFaLENBNUJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/script/list-options-and-languages.coffee
