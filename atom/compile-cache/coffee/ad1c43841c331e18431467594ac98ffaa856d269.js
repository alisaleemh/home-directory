
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  The main plugin class.
 */

(function() {
  var ATPOutputView, ATPPanel, core, path;

  require('./atp-utils');

  path = include('path');

  ATPPanel = include('atp-panel');

  ATPOutputView = include('atp-view');

  core = include('atp-core');

  module.exports = {
    cliStatusView: null,
    callbacks: {
      onDidActivateInitialPackages: []
    },
    getPanel: function() {
      return this.cliStatusView;
    },
    activate: function(state) {
      this.cliStatusView = new ATPPanel(state.cliStatusViewState);
      return setTimeout(function() {
        return core.init();
      }, 0);
    },
    deactivate: function() {
      if (this.cliStatusView != null) {
        return this.cliStatusView.destroy();
      }
    },
    config: {
      'WindowHeight': {
        type: 'integer',
        description: 'Maximum height of a console window.',
        "default": 300
      },
      'enableWindowAnimations': {
        title: 'Enable window animations',
        description: 'Enable window animations.',
        type: 'boolean',
        "default": true
      },
      'useAtomIcons': {
        title: 'Use Atom icons',
        description: 'Uses only the icons used by the Atom. Otherwise the default terminal icons will be used.',
        type: 'boolean',
        "default": true
      },
      'clearCommandInput': {
        title: 'Clear command input',
        description: 'Always clear command input when opening terminal panel.',
        type: 'boolean',
        "default": true
      },
      'logConsole': {
        title: 'Log console',
        description: 'Log console output.',
        type: 'boolean',
        "default": false
      },
      'overrideLs': {
        title: 'Override ls',
        description: 'Override ls command (if this option is disabled the native version of ls is used)',
        type: 'boolean',
        "default": true
      },
      'enableExtendedCommands': {
        title: 'Enable extended built-in commands',
        description: 'Enable extended built-in commands (like ls override, cd or echo).',
        type: 'boolean',
        "default": true
      },
      'enableUserCommands': {
        title: 'Enable user commands',
        description: 'Enable user defined commands from terminal-commands.json file',
        type: 'boolean',
        "default": true
      },
      'enableConsoleInteractiveLinks': {
        title: 'Enable console interactive links',
        description: 'If this option is disabled or terminal links are not clickable (the file extensions will be coloured only)',
        type: 'boolean',
        "default": true
      },
      'enableConsoleInteractiveHints': {
        title: 'Enable console interactive hints',
        description: 'Enable terminal tooltips.',
        type: 'boolean',
        "default": true
      },
      'enableConsoleLabels': {
        title: 'Enable console labels (like %(label:info...), error, warning)',
        description: 'If this option is disabled all labels are removed.',
        type: 'boolean',
        "default": true
      },
      'enableConsoleStartupInfo': {
        title: 'Enable the console welcome message.',
        description: 'Always display welcome message when the terminal window is opened.',
        type: 'boolean',
        "default": true
      },
      'enableConsoleSuggestionsDropdown': {
        title: 'Enable the console suggestions list.',
        description: 'Makes the console display the suggested commands list in a dropdown list.',
        type: 'boolean',
        "default": true
      },
      'disabledExtendedCommands': {
        title: 'Disabled commands:',
        description: 'You can disable any command (it will be used as native).',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        }
      },
      'moveToCurrentDirOnOpen': {
        title: 'Always move to current directory',
        description: 'Always move to currently selected file\'s directory when the console is opened.',
        type: 'boolean',
        "default": true
      },
      'moveToCurrentDirOnOpenLS': {
        title: 'Always run \"ls\" in active console.',
        description: 'Always run \"ls\" command when the console is opened (slows down terminal a little).',
        type: 'boolean',
        "default": false
      },
      'parseSpecialTemplateTokens': {
        title: 'Enable the special tokens (like: %(path), %(day) etc.)',
        description: 'If this option is disabled all special tokens are removed.',
        type: 'boolean',
        "default": true
      },
      'commandPrompt': {
        title: 'The command prompt message.',
        description: 'Set the command prompt message.',
        type: 'string',
        "default": '%(dynamic) %(label:badge:text:%(line)) %(^#FF851B)%(hours):%(minutes):%(seconds)%(^) %(^#01FF70)%(hostname)%(^):%(^#DDDDDD)%(^#39CCCC)../%(path:-2)/%(path:-1)%(^)>%(^)'
      },
      'textReplacementCurrentPath': {
        title: 'Current working directory replacement',
        description: 'Replacement for the current working directory path at the console output.',
        type: 'string',
        "default": '[CWD]'
      },
      'textReplacementCurrentFile': {
        title: 'Currently edited file replacement',
        description: 'Replacement for the currently edited file at the console output.',
        type: 'string',
        "default": '%(link)%(file)%(endlink)'
      },
      'textReplacementFileAdress': {
        title: 'File adress replacement',
        description: 'Replacement for any file adress at the console output.',
        type: 'string',
        "default": '%(link)%(file)%(endlink)'
      },
      'statusBarText': {
        title: 'Status bar text',
        description: 'Text displayed on the terminal status bar.',
        type: 'string',
        "default": '%(dynamic) %(hostname) %(username) %(hours):%(minutes):%(seconds) %(ampm)'
      },
      'XExperimentEnableForceLinking': {
        title: 'EXPERIMENTAL: Enable auto links',
        description: 'Warning: This function is experimental, so it can be broken.',
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxtQ0FBQTs7QUFBQSxFQVFBLE9BQUEsQ0FBUSxhQUFSLENBUkEsQ0FBQTs7QUFBQSxFQVVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQVZQLENBQUE7O0FBQUEsRUFXQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVIsQ0FYWCxDQUFBOztBQUFBLEVBWUEsYUFBQSxHQUFnQixPQUFBLENBQVEsVUFBUixDQVpoQixDQUFBOztBQUFBLEVBYUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxVQUFSLENBYlAsQ0FBQTs7QUFBQSxFQWNBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFDQSxTQUFBLEVBQ0U7QUFBQSxNQUFBLDRCQUFBLEVBQThCLEVBQTlCO0tBRkY7QUFBQSxJQUlBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDUixhQUFPLElBQUMsQ0FBQSxhQUFSLENBRFE7SUFBQSxDQUpWO0FBQUEsSUFPQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsUUFBQSxDQUFTLEtBQUssQ0FBQyxrQkFBZixDQUFyQixDQUFBO2FBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULElBQUksQ0FBQyxJQUFMLENBQUEsRUFEUztNQUFBLENBQVgsRUFFQyxDQUZELEVBRlE7SUFBQSxDQVBWO0FBQUEsSUFhQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFHLDBCQUFIO2VBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFm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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp.coffee
