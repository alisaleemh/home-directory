(function() {
  var Beautifiers, Handlebars, beautifier, beautifierName, beautifierOptions, beautifiers, beautifiersMap, bs, context, exampleConfig, fs, keywords, languageOptions, languagesMap, linkifyTitle, lo, ls, optionDef, optionGroup, optionGroupTemplate, optionGroupTemplatePath, optionName, optionTemplate, optionTemplatePath, optionsPath, optionsTemplate, optionsTemplatePath, packageOptions, path, pkg, readmePath, readmeResult, readmeTemplate, readmeTemplatePath, result, sortKeysBy, sortSettings, template, _, _i, _len, _ref, _ref1;

  Handlebars = require('handlebars');

  Beautifiers = require("../src/beautifiers");

  fs = require('fs');

  _ = require('lodash');

  path = require('path');

  pkg = require('../package.json');

  console.log('Generating options...');

  beautifier = new Beautifiers();

  languageOptions = beautifier.options;

  packageOptions = require('../src/config.coffee');

  beautifiersMap = _.keyBy(beautifier.beautifiers, 'name');

  languagesMap = _.keyBy(beautifier.languages.languages, 'name');

  beautifierOptions = {};

  for (lo in languageOptions) {
    optionGroup = languageOptions[lo];
    _ref = optionGroup.properties;
    for (optionName in _ref) {
      optionDef = _ref[optionName];
      beautifiers = (_ref1 = optionDef.beautifiers) != null ? _ref1 : [];
      for (_i = 0, _len = beautifiers.length; _i < _len; _i++) {
        beautifierName = beautifiers[_i];
        if (beautifierOptions[beautifierName] == null) {
          beautifierOptions[beautifierName] = {};
        }
        beautifierOptions[beautifierName][optionName] = optionDef;
      }
    }
  }

  console.log('Loading options template...');

  readmeTemplatePath = path.resolve(__dirname, '../README-template.md');

  readmePath = path.resolve(__dirname, '../README.md');

  optionsTemplatePath = __dirname + '/options-template.md';

  optionTemplatePath = __dirname + '/option-template.md';

  optionGroupTemplatePath = __dirname + '/option-group-template.md';

  optionsPath = __dirname + '/options.md';

  optionsTemplate = fs.readFileSync(optionsTemplatePath).toString();

  optionGroupTemplate = fs.readFileSync(optionGroupTemplatePath).toString();

  optionTemplate = fs.readFileSync(optionTemplatePath).toString();

  readmeTemplate = fs.readFileSync(readmeTemplatePath).toString();

  console.log('Building documentation from template and options...');

  Handlebars.registerPartial('option', optionTemplate);

  Handlebars.registerPartial('option-group', optionGroupTemplate);

  template = Handlebars.compile(optionsTemplate);

  readmeTemplate = Handlebars.compile(readmeTemplate);

  linkifyTitle = function(title) {
    var p, sep;
    title = title.toLowerCase();
    p = title.split(/[\s,+#;,\/?:@&=+$]+/);
    sep = "-";
    return p.join(sep);
  };

  Handlebars.registerHelper('linkify', function(title, options) {
    return new Handlebars.SafeString("[" + (options.fn(this)) + "](\#" + (linkifyTitle(title)) + ")");
  });

  exampleConfig = function(option) {
    var c, d, json, k, namespace, t;
    t = option.type;
    d = (function() {
      switch (false) {
        case option["default"] == null:
          return option["default"];
        case t !== "string":
          return "";
        case t !== "integer":
          return 0;
        case t !== "boolean":
          return false;
        default:
          return null;
      }
    })();
    json = {};
    namespace = option.language.namespace;
    k = option.key;
    c = {};
    c[k] = d;
    json[namespace] = c;
    return "```json\n" + (JSON.stringify(json, void 0, 4)) + "\n```";
  };

  Handlebars.registerHelper('example-config', function(key, option, options) {
    var results;
    results = exampleConfig(key, option);
    return new Handlebars.SafeString(results);
  });

  Handlebars.registerHelper('language-beautifiers-support', function(languageOptions, options) {

    /*
    | Language | Supported Beautifiers |
    | --- | ---- |
    | JavaScript | Js-Beautify, Pretty Diff |
     */
    var results, rows;
    rows = _.map(languageOptions, function(val, k) {
      var defaultBeautifier, extensions, grammars, name;
      name = val.title;
      defaultBeautifier = _.get(val, "properties.default_beautifier.default");
      beautifiers = _.map(val.beautifiers, function(b) {
        var isDefault, r;
        beautifier = beautifiersMap[b];
        isDefault = b === defaultBeautifier;
        if (beautifier.link) {
          r = "[`" + b + "`](" + beautifier.link + ")";
        } else {
          r = "`" + b + "`";
        }
        if (isDefault) {
          r += " (Default)";
        }
        return r;
      });
      grammars = _.map(val.grammars, function(b) {
        return "`" + b + "`";
      });
      extensions = _.map(val.extensions, function(b) {
        return "`." + b + "`";
      });
      return "| " + name + " | " + (grammars.join(', ')) + " |" + (extensions.join(', ')) + " | " + (beautifiers.join(', ')) + " |";
    });
    results = "| Language | Grammars | File Extensions | Supported Beautifiers |\n| --- | --- | --- | ---- |\n" + (rows.join('\n'));
    return new Handlebars.SafeString(results);
  });

  Handlebars.registerHelper('language-options-support', function(languageOptions, options) {

    /*
    | Option | PrettyDiff | JS-Beautify |
    | --- | --- | --- |
    | `brace_style` | ? | ? |
    | `break_chained_methods` | ? | ? |
    | `end_with_comma` | ? | ? |
    | `end_with_newline` | ? | ? |
    | `eval_code` | ? | ? |
    | `indent_size` | :white_check_mark: | :white_check_mark: |
    | `indent_char` | :white_check_mark: | :white_check_mark: |
     */
    var headers, results, rows;
    rows = [];
    beautifiers = languageOptions.beautifiers.sort();
    headers = ['Option'].concat(beautifiers);
    rows.push(headers);
    rows.push(_.map(headers, function() {
      return '---';
    }));
    _.each(Object.keys(languageOptions.properties), function(op) {
      var field, support;
      field = languageOptions.properties[op];
      support = _.map(beautifiers, function(b) {
        if (_.includes(field.beautifiers, b) || _.includes(["disabled", "default_beautifier", "beautify_on_save"], op)) {
          return ':white_check_mark:';
        } else {
          return ':x:';
        }
      });
      return rows.push(["`" + op + "`"].concat(support));
    });
    results = _.map(rows, function(r) {
      return "| " + (r.join(' | ')) + " |";
    }).join('\n');
    return new Handlebars.SafeString(results);
  });

  sortKeysBy = function(obj, comparator) {
    var keys;
    keys = _.sortBy(_.keys(obj), function(key) {
      if (comparator) {
        return comparator(obj[key], key);
      } else {
        return key;
      }
    });
    return _.zipObject(keys, _.map(keys, function(key) {
      return obj[key];
    }));
  };

  sortSettings = function(settings) {
    var r;
    r = _.mapValues(settings, function(op) {
      if (op.type === "object" && op.properties) {
        op.properties = sortSettings(op.properties);
      }
      return op;
    });
    r = sortKeysBy(sortKeysBy(r), function(op) {
      return op.order;
    });
    return r;
  };

  context = {
    "package": pkg,
    packageOptions: sortSettings(packageOptions),
    languageOptions: sortSettings(languageOptions),
    beautifierOptions: sortSettings(beautifierOptions)
  };

  result = template(context);

  readmeResult = readmeTemplate(context);

  console.log('Writing documentation to file...');

  fs.writeFileSync(optionsPath, result);

  fs.writeFileSync(readmePath, readmeResult);

  console.log('Updating package.json');

  ls = _.map(Object.keys(languagesMap), function(a) {
    return a.toLowerCase();
  });

  bs = _.map(Object.keys(beautifiersMap), function(a) {
    return a.toLowerCase();
  });

  keywords = _.union(pkg.keywords, ls, bs);

  pkg.keywords = keywords;

  fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(pkg, void 0, 2));

  console.log('Done.');

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L2RvY3MvaW5kZXguY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxNQUFBLDBnQkFBQTs7QUFBQSxFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQUFiLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLG9CQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FISixDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSlAsQ0FBQTs7QUFBQSxFQUtBLEdBQUEsR0FBTSxPQUFBLENBQVEsaUJBQVIsQ0FMTixDQUFBOztBQUFBLEVBT0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSx1QkFBWixDQVBBLENBQUE7O0FBQUEsRUFRQSxVQUFBLEdBQWlCLElBQUEsV0FBQSxDQUFBLENBUmpCLENBQUE7O0FBQUEsRUFTQSxlQUFBLEdBQWtCLFVBQVUsQ0FBQyxPQVQ3QixDQUFBOztBQUFBLEVBVUEsY0FBQSxHQUFpQixPQUFBLENBQVEsc0JBQVIsQ0FWakIsQ0FBQTs7QUFBQSxFQVlBLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxVQUFVLENBQUMsV0FBbkIsRUFBZ0MsTUFBaEMsQ0FaakIsQ0FBQTs7QUFBQSxFQWFBLFlBQUEsR0FBZSxDQUFDLENBQUMsS0FBRixDQUFRLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBN0IsRUFBd0MsTUFBeEMsQ0FiZixDQUFBOztBQUFBLEVBY0EsaUJBQUEsR0FBb0IsRUFkcEIsQ0FBQTs7QUFlQSxPQUFBLHFCQUFBO3NDQUFBO0FBQ0U7QUFBQSxTQUFB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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/docs/index.coffee
