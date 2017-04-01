(function() {
  module.exports = {
    name: "PHP",
    namespace: "php",

    /*
    Supported Grammars
     */
    grammars: ["PHP"],

    /*
    Supported extensions
     */
    extensions: ["php", "module", "inc"],
    options: {
      cs_fixer_path: {
        title: "PHP-CS-Fixer Path",
        type: 'string',
        "default": "",
        description: "Path to the `php-cs-fixer` CLI executable"
      },
      fixers: {
        type: 'string',
        "default": "",
        description: "Add fixer(s). i.e. linefeed,-short_tag,indentation"
      },
      level: {
        type: 'string',
        "default": "",
        description: "By default, all PSR-2 fixers and some additional ones are run."
      },
      phpcbf_path: {
        title: "PHPCBF Path",
        type: 'string',
        "default": "",
        description: "Path to the `phpcbf` CLI executable"
      },
      standard: {
        title: "PHPCBF Standard",
        type: 'string',
        "default": "",
        description: "Standard name Squiz, PSR2, PSR1, PHPCS, PEAR, Zend, MySource... or path to CS rules"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvcGhwLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBRWYsSUFBQSxFQUFNLEtBRlM7QUFBQSxJQUdmLFNBQUEsRUFBVyxLQUhJO0FBS2Y7QUFBQTs7T0FMZTtBQUFBLElBUWYsUUFBQSxFQUFVLENBQ1IsS0FEUSxDQVJLO0FBWWY7QUFBQTs7T0FaZTtBQUFBLElBZWYsVUFBQSxFQUFZLENBQ1YsS0FEVSxFQUVWLFFBRlUsRUFHVixLQUhVLENBZkc7QUFBQSxJQXFCZixPQUFBLEVBQ0U7QUFBQSxNQUFBLGFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEVBRlQ7QUFBQSxRQUdBLFdBQUEsRUFBYSwyQ0FIYjtPQURGO0FBQUEsTUFLQSxNQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLG9EQUZiO09BTkY7QUFBQSxNQVNBLEtBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsZ0VBRmI7T0FWRjtBQUFBLE1BYUEsV0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sYUFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxFQUZUO0FBQUEsUUFHQSxXQUFBLEVBQWEscUNBSGI7T0FkRjtBQUFBLE1Ba0JBLFFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGlCQUFQO0FBQUEsUUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEVBRlQ7QUFBQSxRQUdBLFdBQUEsRUFBYSxxRkFIYjtPQW5CRjtLQXRCYTtHQUFqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/languages/php.coffee
