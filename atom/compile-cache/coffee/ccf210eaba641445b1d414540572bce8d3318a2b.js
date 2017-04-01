(function() {
  var Settings, inferType;

  inferType = function(value) {
    switch (false) {
      case !Number.isInteger(value):
        return 'integer';
      case typeof value !== 'boolean':
        return 'boolean';
      case typeof value !== 'string':
        return 'string';
      case !Array.isArray(value):
        return 'array';
    }
  };

  Settings = (function() {
    function Settings(scope, config) {
      var i, j, k, key, len, len1, name, ref, ref1, value;
      this.scope = scope;
      this.config = config;
      ref = Object.keys(this.config);
      for (j = 0, len = ref.length; j < len; j++) {
        key = ref[j];
        if (typeof this.config[key] === 'boolean') {
          this.config[key] = {
            "default": this.config[key]
          };
        }
        if ((value = this.config[key]).type == null) {
          value.type = inferType(value["default"]);
        }
      }
      ref1 = Object.keys(this.config);
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        name = ref1[i];
        this.config[name].order = i;
      }
    }

    Settings.prototype.get = function(param) {
      if (param === 'defaultRegister') {
        if (this.get('useClipboardAsDefaultRegister')) {
          return '*';
        } else {
          return '"';
        }
      } else {
        return atom.config.get(this.scope + "." + param);
      }
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set(this.scope + "." + param, value);
    };

    Settings.prototype.toggle = function(param) {
      return this.set(param, !this.get(param));
    };

    Settings.prototype.observe = function(param, fn) {
      return atom.config.observe(this.scope + "." + param, fn);
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    setCursorToStartOfChangeOnUndoRedo: true,
    setCursorToStartOfChangeOnUndoRedoStrategy: {
      "default": 'smart',
      "enum": ['smart', 'simple'],
      description: "When you think undo/redo cursor position has BUG, set this to `simple`.<br>\n`smart`: Good accuracy but have cursor-not-updated-on-different-editor limitation<br>\n`simple`: Always work, but accuracy is not as good as `smart`.<br>"
    },
    groupChangesWhenLeavingInsertMode: true,
    useClipboardAsDefaultRegister: false,
    startInInsertMode: false,
    startInInsertModeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Start in insert-mode when editorElement matches scope'
    },
    clearMultipleCursorsOnEscapeInsertMode: false,
    autoSelectPersistentSelectionOnOperate: true,
    automaticallyEscapeInsertModeOnActivePaneItemChange: {
      "default": false,
      description: 'Escape insert-mode on tab switch, pane switch'
    },
    wrapLeftRightMotion: false,
    numberRegex: {
      "default": '-?[0-9]+',
      description: "Used to find number in ctrl-a/ctrl-x.<br>\nTo ignore \"-\"(minus) char in string like \"identifier-1\" use `(?:\\B-)?[0-9]+`"
    },
    clearHighlightSearchOnResetNormalMode: {
      "default": false,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearPersistentSelectionOnResetNormalMode: {
      "default": false,
      description: 'Clear persistentSelection on `escape` in normal-mode'
    },
    charactersToAddSpaceOnSurround: {
      "default": [],
      items: {
        type: 'string'
      },
      description: "Comma separated list of character, which add space around surrounded text.<br>\nFor vim-surround compatible behavior, set `(, {, [, <`."
    },
    showCursorInVisualMode: true,
    ignoreCaseForSearch: {
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: false,
    highlightSearchExcludeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Suppress highlightSearch when any of these classes are present in the editor'
    },
    incrementalSearch: false,
    incrementalSearchVisitDirection: {
      "default": 'absolute',
      "enum": ['absolute', 'relative'],
      description: "When `relative`, `tab`, and `shift-tab` respect search direction('/' or '?')"
    },
    stayOnTransformString: {
      "default": false,
      description: "Don't move cursor after TransformString e.g upper-case, surround"
    },
    stayOnYank: {
      "default": false,
      description: "Don't move cursor after yank"
    },
    stayOnDelete: {
      "default": false,
      description: "Don't move cursor after delete"
    },
    stayOnOccurrence: {
      "default": true,
      description: "Don't move cursor when operator works on occurrences( when `true`, override operator specific `stayOn` options )"
    },
    keepColumnOnSelectTextObject: {
      "default": false,
      description: "Keep column on select TextObject(Paragraph, Indentation, Fold, Function, Edge)"
    },
    moveToFirstCharacterOnVerticalMotion: {
      "default": true,
      description: "Almost equivalent to `startofline` pure-Vim option. When true, move cursor to first char.<br>\nAffects to `ctrl-f, b, d, u`, `G`, `H`, `M`, `L`, `gg`<br>\nUnlike pure-Vim, `d`, `<<`, `>>` are not affected by this option, use independent `stayOn` options."
    },
    flashOnUndoRedo: true,
    flashOnMoveToOccurrence: {
      "default": false,
      description: "Affects normal-mode's `tab`, `shift-tab`."
    },
    flashOnOperate: true,
    flashOnOperateBlacklist: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Comma separated list of operator class name to disable flash e.g. "yank, auto-indent"'
    },
    flashOnSearch: true,
    flashScreenOnSearchHasNoMatch: true,
    showHoverSearchCounter: false,
    showHoverSearchCounterDuration: {
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    hideTabBarOnMaximizePane: {
      "default": true,
      description: "If set to `false`, tab still visible after maximize-pane( `cmd-enter` )"
    },
    hideStatusBarOnMaximizePane: {
      "default": true
    },
    smoothScrollOnFullScrollMotion: {
      "default": false,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnFullScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnHalfScrollMotion: {
      "default": false,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    smoothScrollOnHalfScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-d` and `ctrl-u`"
    },
    statusBarModeStringStyle: {
      "default": 'short',
      "enum": ['short', 'long']
    },
    devThrowErrorOnNonEmptySelectionInNormalMode: {
      "default": false,
      description: "[Dev use] Throw error when non-empty selection was remained in normal-mode at the timing of operation finished"
    },
    debug: {
      "default": false
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFNBQUEsR0FBWSxTQUFDLEtBQUQ7QUFDVixZQUFBLEtBQUE7QUFBQSxZQUNPLE1BQU0sQ0FBQyxTQUFQLENBQWlCLEtBQWpCLENBRFA7ZUFDb0M7QUFEcEMsV0FFTyxPQUFPLEtBQVAsS0FBaUIsU0FGeEI7ZUFFdUM7QUFGdkMsV0FHTyxPQUFPLEtBQVAsS0FBaUIsUUFIeEI7ZUFHc0M7QUFIdEMsWUFJTyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FKUDtlQUlpQztBQUpqQztFQURVOztFQU9OO0lBQ1Msa0JBQUMsS0FBRCxFQUFTLE1BQVQ7QUFJWCxVQUFBO01BSlksSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsU0FBRDtBQUlwQjtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBRyxPQUFPLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFmLEtBQXdCLFNBQTNCO1VBQ0UsSUFBQyxDQUFBLE1BQU8sQ0FBQSxHQUFBLENBQVIsR0FBZTtZQUFDLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBQyxDQUFBLE1BQU8sQ0FBQSxHQUFBLENBQWxCO1lBRGpCOztRQUVBLElBQU8sdUNBQVA7VUFDRSxLQUFLLENBQUMsSUFBTixHQUFhLFNBQUEsQ0FBVSxLQUFLLEVBQUMsT0FBRCxFQUFmLEVBRGY7O0FBSEY7QUFPQTtBQUFBLFdBQUEsZ0RBQUE7O1FBQ0UsSUFBQyxDQUFBLE1BQU8sQ0FBQSxJQUFBLENBQUssQ0FBQyxLQUFkLEdBQXNCO0FBRHhCO0lBWFc7O3VCQWNiLEdBQUEsR0FBSyxTQUFDLEtBQUQ7TUFDSCxJQUFHLEtBQUEsS0FBUyxpQkFBWjtRQUNFLElBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBSywrQkFB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QSxzQkFBQSxFQUF3QixLQWpHeEI7SUFrR0EsOEJBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FBVDtNQUNBLFdBQUEsRUFBYSx5Q0FEYjtLQW5HRjtJQXFHQSx3QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUFUO01BQ0EsV0FBQSxFQUFhLHlFQURiO0tBdEdGO0lBd0dBLDJCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQVQ7S0F6R0Y7SUEwR0EsOEJBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSwyQkFEYjtLQTNHRjtJQTZHQSxzQ0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxHQUFUO01BQ0EsV0FBQSxFQUFhLGtFQURiO0tBOUdGO0lBZ0hBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsMkJBRGI7S0FqSEY7SUFtSEEsc0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FBVDtNQUNBLFdBQUEsRUFBYSxrRUFEYjtLQXBIRjtJQXNIQSx3QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUFUO01BQ0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBRE47S0F2SEY7SUF5SEEsNENBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FBVDtNQUNBLFdBQUEsRUFBYSxnSEFEYjtLQTFIRjtJQTRIQSxLQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7S0E3SEY7R0FEbUI7QUFyQ3JCIiwic291cmNlc0NvbnRlbnQiOlsiaW5mZXJUeXBlID0gKHZhbHVlKSAtPlxuICBzd2l0Y2hcbiAgICB3aGVuIE51bWJlci5pc0ludGVnZXIodmFsdWUpIHRoZW4gJ2ludGVnZXInXG4gICAgd2hlbiB0eXBlb2YodmFsdWUpIGlzICdib29sZWFuJyB0aGVuICdib29sZWFuJ1xuICAgIHdoZW4gdHlwZW9mKHZhbHVlKSBpcyAnc3RyaW5nJyB0aGVuICdzdHJpbmcnXG4gICAgd2hlbiBBcnJheS5pc0FycmF5KHZhbHVlKSB0aGVuICdhcnJheSdcblxuY2xhc3MgU2V0dGluZ3NcbiAgY29uc3RydWN0b3I6IChAc2NvcGUsIEBjb25maWcpIC0+XG4gICAgIyBBdXRvbWF0aWNhbGx5IGluZmVyIGFuZCBpbmplY3QgYHR5cGVgIG9mIGVhY2ggY29uZmlnIHBhcmFtZXRlci5cbiAgICAjIHNraXAgaWYgdmFsdWUgd2hpY2ggYWxlYWR5IGhhdmUgYHR5cGVgIGZpZWxkLlxuICAgICMgQWxzbyB0cmFuc2xhdGUgYmFyZSBgYm9vbGVhbmAgdmFsdWUgdG8ge2RlZmF1bHQ6IGBib29sZWFuYH0gb2JqZWN0XG4gICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgaWYgdHlwZW9mKEBjb25maWdba2V5XSkgaXMgJ2Jvb2xlYW4nXG4gICAgICAgIEBjb25maWdba2V5XSA9IHtkZWZhdWx0OiBAY29uZmlnW2tleV19XG4gICAgICB1bmxlc3MgKHZhbHVlID0gQGNvbmZpZ1trZXldKS50eXBlP1xuICAgICAgICB2YWx1ZS50eXBlID0gaW5mZXJUeXBlKHZhbHVlLmRlZmF1bHQpXG5cbiAgICAjIFtDQVVUSU9OXSBpbmplY3Rpbmcgb3JkZXIgcHJvcGV0eSB0byBzZXQgb3JkZXIgc2hvd24gYXQgc2V0dGluZy12aWV3IE1VU1QtQ09NRS1MQVNULlxuICAgIGZvciBuYW1lLCBpIGluIE9iamVjdC5rZXlzKEBjb25maWcpXG4gICAgICBAY29uZmlnW25hbWVdLm9yZGVyID0gaVxuXG4gIGdldDogKHBhcmFtKSAtPlxuICAgIGlmIHBhcmFtIGlzICdkZWZhdWx0UmVnaXN0ZXInXG4gICAgICBpZiBAZ2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicpIHRoZW4gJyonIGVsc2UgJ1wiJ1xuICAgIGVsc2VcbiAgICAgIGF0b20uY29uZmlnLmdldCBcIiN7QHNjb3BlfS4je3BhcmFtfVwiXG5cbiAgc2V0OiAocGFyYW0sIHZhbHVlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldCBcIiN7QHNjb3BlfS4je3BhcmFtfVwiLCB2YWx1ZVxuXG4gIHRvZ2dsZTogKHBhcmFtKSAtPlxuICAgIEBzZXQocGFyYW0sIG5vdCBAZ2V0KHBhcmFtKSlcblxuICBvYnNlcnZlOiAocGFyYW0sIGZuKSAtPlxuICAgIGF0b20uY29uZmlnLm9ic2VydmUgXCIje0BzY29wZX0uI3twYXJhbX1cIiwgZm5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2V0dGluZ3MgJ3ZpbS1tb2RlLXBsdXMnLFxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvOiB0cnVlXG4gIHNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneTpcbiAgICBkZWZhdWx0OiAnc21hcnQnXG4gICAgZW51bTogWydzbWFydCcsICdzaW1wbGUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBXaGVuIHlvdSB0aGluayB1bmRvL3JlZG8gY3Vyc29yIHBvc2l0aW9uIGhhcyBCVUcsIHNldCB0aGlzIHRvIGBzaW1wbGVgLjxicj5cbiAgICBgc21hcnRgOiBHb29kIGFjY3VyYWN5IGJ1dCBoYXZlIGN1cnNvci1ub3QtdXBkYXRlZC1vbi1kaWZmZXJlbnQtZWRpdG9yIGxpbWl0YXRpb248YnI+XG4gICAgYHNpbXBsZWA6IEFsd2F5cyB3b3JrLCBidXQgYWNjdXJhY3kgaXMgbm90IGFzIGdvb2QgYXMgYHNtYXJ0YC48YnI+XG4gICAgXCJcIlwiXG4gIGdyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZTogdHJ1ZVxuICB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcjogZmFsc2VcbiAgc3RhcnRJbkluc2VydE1vZGU6IGZhbHNlXG4gIHN0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBpbiBpbnNlcnQtbW9kZSB3aGVuIGVkaXRvckVsZW1lbnQgbWF0Y2hlcyBzY29wZSdcbiAgY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGU6IGZhbHNlXG4gIGF1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlOiB0cnVlXG4gIGF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRXNjYXBlIGluc2VydC1tb2RlIG9uIHRhYiBzd2l0Y2gsIHBhbmUgc3dpdGNoJ1xuICB3cmFwTGVmdFJpZ2h0TW90aW9uOiBmYWxzZVxuICBudW1iZXJSZWdleDpcbiAgICBkZWZhdWx0OiAnLT9bMC05XSsnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgVXNlZCB0byBmaW5kIG51bWJlciBpbiBjdHJsLWEvY3RybC14Ljxicj5cbiAgICAgIFRvIGlnbm9yZSBcIi1cIihtaW51cykgY2hhciBpbiBzdHJpbmcgbGlrZSBcImlkZW50aWZpZXItMVwiIHVzZSBgKD86XFxcXEItKT9bMC05XStgXG4gICAgICBcIlwiXCJcbiAgY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgaGlnaGxpZ2h0U2VhcmNoIG9uIGBlc2NhcGVgIGluIG5vcm1hbC1tb2RlJ1xuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbiBvbiBgZXNjYXBlYCBpbiBub3JtYWwtbW9kZSdcbiAgY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgY2hhcmFjdGVyLCB3aGljaCBhZGQgc3BhY2UgYXJvdW5kIHN1cnJvdW5kZWQgdGV4dC48YnI+XG4gICAgICBGb3IgdmltLXN1cnJvdW5kIGNvbXBhdGlibGUgYmVoYXZpb3IsIHNldCBgKCwgeywgWywgPGAuXG4gICAgICBcIlwiXCJcbiAgc2hvd0N1cnNvckluVmlzdWFsTW9kZTogdHJ1ZVxuICBpZ25vcmVDYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AnXG4gIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAvYCBhbmQgYD9gLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaGAnXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLidcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQ6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgKmAgYW5kIGAjYC4gT3ZlcnJpZGUgYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAnXG4gIGhpZ2hsaWdodFNlYXJjaDogZmFsc2VcbiAgaGlnaGxpZ2h0U2VhcmNoRXhjbHVkZVNjb3BlczpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3VwcHJlc3MgaGlnaGxpZ2h0U2VhcmNoIHdoZW4gYW55IG9mIHRoZXNlIGNsYXNzZXMgYXJlIHByZXNlbnQgaW4gdGhlIGVkaXRvcidcbiAgaW5jcmVtZW50YWxTZWFyY2g6IGZhbHNlXG4gIGluY3JlbWVudGFsU2VhcmNoVmlzaXREaXJlY3Rpb246XG4gICAgZGVmYXVsdDogJ2Fic29sdXRlJ1xuICAgIGVudW06IFsnYWJzb2x1dGUnLCAncmVsYXRpdmUnXVxuICAgIGRlc2NyaXB0aW9uOiBcIldoZW4gYHJlbGF0aXZlYCwgYHRhYmAsIGFuZCBgc2hpZnQtdGFiYCByZXNwZWN0IHNlYXJjaCBkaXJlY3Rpb24oJy8nIG9yICc/JylcIlxuICBzdGF5T25UcmFuc2Zvcm1TdHJpbmc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciBUcmFuc2Zvcm1TdHJpbmcgZS5nIHVwcGVyLWNhc2UsIHN1cnJvdW5kXCJcbiAgc3RheU9uWWFuazpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmtcIlxuICBzdGF5T25EZWxldGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciBkZWxldGVcIlxuICBzdGF5T25PY2N1cnJlbmNlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciB3aGVuIG9wZXJhdG9yIHdvcmtzIG9uIG9jY3VycmVuY2VzKCB3aGVuIGB0cnVlYCwgb3ZlcnJpZGUgb3BlcmF0b3Igc3BlY2lmaWMgYHN0YXlPbmAgb3B0aW9ucyApXCJcbiAga2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIktlZXAgY29sdW1uIG9uIHNlbGVjdCBUZXh0T2JqZWN0KFBhcmFncmFwaCwgSW5kZW50YXRpb24sIEZvbGQsIEZ1bmN0aW9uLCBFZGdlKVwiXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbjpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgQWxtb3N0IGVxdWl2YWxlbnQgdG8gYHN0YXJ0b2ZsaW5lYCBwdXJlLVZpbSBvcHRpb24uIFdoZW4gdHJ1ZSwgbW92ZSBjdXJzb3IgdG8gZmlyc3QgY2hhci48YnI+XG4gICAgICBBZmZlY3RzIHRvIGBjdHJsLWYsIGIsIGQsIHVgLCBgR2AsIGBIYCwgYE1gLCBgTGAsIGBnZ2A8YnI+XG4gICAgICBVbmxpa2UgcHVyZS1WaW0sIGBkYCwgYDw8YCwgYD4+YCBhcmUgbm90IGFmZmVjdGVkIGJ5IHRoaXMgb3B0aW9uLCB1c2UgaW5kZXBlbmRlbnQgYHN0YXlPbmAgb3B0aW9ucy5cbiAgICAgIFwiXCJcIlxuICBmbGFzaE9uVW5kb1JlZG86IHRydWVcbiAgZmxhc2hPbk1vdmVUb09jY3VycmVuY2U6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJBZmZlY3RzIG5vcm1hbC1tb2RlJ3MgYHRhYmAsIGBzaGlmdC10YWJgLlwiXG4gIGZsYXNoT25PcGVyYXRlOiB0cnVlXG4gIGZsYXNoT25PcGVyYXRlQmxhY2tsaXN0OlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBvcGVyYXRvciBjbGFzcyBuYW1lIHRvIGRpc2FibGUgZmxhc2ggZS5nLiBcInlhbmssIGF1dG8taW5kZW50XCInXG4gIGZsYXNoT25TZWFyY2g6IHRydWVcbiAgZmxhc2hTY3JlZW5PblNlYXJjaEhhc05vTWF0Y2g6IHRydWVcbiAgc2hvd0hvdmVyU2VhcmNoQ291bnRlcjogZmFsc2VcbiAgc2hvd0hvdmVyU2VhcmNoQ291bnRlckR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDcwMFxuICAgIGRlc2NyaXB0aW9uOiBcIkR1cmF0aW9uKG1zZWMpIGZvciBob3ZlciBzZWFyY2ggY291bnRlclwiXG4gIGhpZGVUYWJCYXJPbk1heGltaXplUGFuZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiSWYgc2V0IHRvIGBmYWxzZWAsIHRhYiBzdGlsbCB2aXNpYmxlIGFmdGVyIG1heGltaXplLXBhbmUoIGBjbWQtZW50ZXJgIClcIlxuICBoaWRlU3RhdHVzQmFyT25NYXhpbWl6ZVBhbmU6XG4gICAgZGVmYXVsdDogdHJ1ZVxuICBzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb246XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJGb3IgYGN0cmwtZmAgYW5kIGBjdHJsLWJgXCJcbiAgc21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb246XG4gICAgZGVmYXVsdDogNTAwXG4gICAgZGVzY3JpcHRpb246IFwiU21vb3RoIHNjcm9sbCBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgZm9yIGBjdHJsLWZgIGFuZCBgY3RybC1iYFwiXG4gIHNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkZvciBgY3RybC1kYCBhbmQgYGN0cmwtdWBcIlxuICBzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25EdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA1MDBcbiAgICBkZXNjcmlwdGlvbjogXCJTbW9vdGggc2Nyb2xsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3IgYGN0cmwtZGAgYW5kIGBjdHJsLXVgXCJcbiAgc3RhdHVzQmFyTW9kZVN0cmluZ1N0eWxlOlxuICAgIGRlZmF1bHQ6ICdzaG9ydCdcbiAgICBlbnVtOiBbJ3Nob3J0JywgJ2xvbmcnXVxuICBkZXZUaHJvd0Vycm9yT25Ob25FbXB0eVNlbGVjdGlvbkluTm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIltEZXYgdXNlXSBUaHJvdyBlcnJvciB3aGVuIG5vbi1lbXB0eSBzZWxlY3Rpb24gd2FzIHJlbWFpbmVkIGluIG5vcm1hbC1tb2RlIGF0IHRoZSB0aW1pbmcgb2Ygb3BlcmF0aW9uIGZpbmlzaGVkXCJcbiAgZGVidWc6XG4gICAgZGVmYXVsdDogZmFsc2VcbiJdfQ==
