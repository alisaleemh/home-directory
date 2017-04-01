(function() {
  module.exports = {
    general: {
      title: 'General',
      type: 'object',
      collapsed: true,
      order: -1,
      description: 'General options for Atom Beautify',
      properties: {
        analytics: {
          title: 'Anonymous Analytics',
          type: 'boolean',
          "default": true,
          description: "[Google Analytics](http://www.google.com/analytics/) is used to track what languages are being used the most and causing the most errors, as well as other stats such as performance. Everything is anonymized and no personal information, such as source code, is sent. See https://github.com/Glavin001/atom-beautify/issues/47 for more details."
        },
        _analyticsUserId: {
          title: 'Analytics User Id',
          type: 'string',
          "default": "",
          description: "Unique identifier for this user for tracking usage analytics"
        },
        loggerLevel: {
          title: "Logger Level",
          type: 'string',
          "default": 'warn',
          description: 'Set the level for the logger',
          "enum": ['verbose', 'debug', 'info', 'warn', 'error']
        },
        beautifyEntireFileOnSave: {
          title: "Beautify Entire File On Save",
          type: 'boolean',
          "default": true,
          description: "When beautifying on save, use the entire file, even if there is selected text in the editor. Important: The `beautify on save` option for the specific language must be enabled for this to be applicable. This option is not `beautify on save`."
        },
        muteUnsupportedLanguageErrors: {
          title: "Mute Unsupported Language Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show \"Unsupported Language\" errors when they occur"
        },
        muteAllErrors: {
          title: "Mute All Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show any/all errors when they occur"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9jb25maWcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixPQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxTQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLE1BRUEsU0FBQSxFQUFXLElBRlg7QUFBQSxNQUdBLEtBQUEsRUFBTyxDQUFBLENBSFA7QUFBQSxNQUlBLFdBQUEsRUFBYSxtQ0FKYjtBQUFBLE1BS0EsVUFBQSxFQUNFO0FBQUEsUUFBQSxTQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFVBQ0EsSUFBQSxFQUFPLFNBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVSxJQUZWO0FBQUEsVUFHQSxXQUFBLEVBQWMsc1ZBSGQ7U0FERjtBQUFBLFFBVUEsZ0JBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsVUFDQSxJQUFBLEVBQU8sUUFEUDtBQUFBLFVBRUEsU0FBQSxFQUFVLEVBRlY7QUFBQSxVQUdBLFdBQUEsRUFBYyw4REFIZDtTQVhGO0FBQUEsUUFlQSxXQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxjQUFQO0FBQUEsVUFDQSxJQUFBLEVBQU8sUUFEUDtBQUFBLFVBRUEsU0FBQSxFQUFVLE1BRlY7QUFBQSxVQUdBLFdBQUEsRUFBYyw4QkFIZDtBQUFBLFVBSUEsTUFBQSxFQUFPLENBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsTUFBckIsRUFBNkIsTUFBN0IsRUFBcUMsT0FBckMsQ0FKUDtTQWhCRjtBQUFBLFFBcUJBLHdCQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyw4QkFBUDtBQUFBLFVBQ0EsSUFBQSxFQUFPLFNBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVSxJQUZWO0FBQUEsVUFHQSxXQUFBLEVBQWMsbVBBSGQ7U0F0QkY7QUFBQSxRQTBCQSw2QkFBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sa0NBQVA7QUFBQSxVQUNBLElBQUEsRUFBTyxTQURQO0FBQUEsVUFFQSxTQUFBLEVBQVUsS0FGVjtBQUFBLFVBR0EsV0FBQSxFQUFjLDZEQUhkO1NBM0JGO0FBQUEsUUErQkEsYUFBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8saUJBQVA7QUFBQSxVQUNBLElBQUEsRUFBTyxTQURQO0FBQUEsVUFFQSxTQUFBLEVBQVUsS0FGVjtBQUFBLFVBR0EsV0FBQSxFQUFjLDRDQUhkO1NBaENGO09BTkY7S0FGYTtHQUFqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-beautify/src/config.coffee
