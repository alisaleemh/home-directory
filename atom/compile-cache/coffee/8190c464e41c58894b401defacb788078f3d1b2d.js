
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  The panel, which manages all the terminal instances.
 */

(function() {
  var $, ATPOutputView, ATPPanel, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = include('atom-space-pen-views'), $ = _ref.$, View = _ref.View;

  ATPOutputView = include('atp-view');

  module.exports = ATPPanel = (function(_super) {
    __extends(ATPPanel, _super);

    function ATPPanel() {
      return ATPPanel.__super__.constructor.apply(this, arguments);
    }

    ATPPanel.content = function() {
      return this.div({
        "class": 'atp-panel inline-block'
      }, (function(_this) {
        return function() {
          _this.span({
            outlet: 'termStatusContainer'
          }, function() {
            return _this.span({
              click: 'newTermClick',
              "class": "atp-panel icon icon-plus"
            });
          });
          return _this.span({
            outlet: 'termStatusInfo',
            style: 'position:absolute;right:10%;'
          });
        };
      })(this));
    };

    ATPPanel.prototype.commandViews = [];

    ATPPanel.prototype.activeIndex = 0;

    ATPPanel.prototype.initialize = function(serializeState) {
      var getSelectedText;
      getSelectedText = function() {
        var text;
        text = '';
        if (window.getSelection) {
          text = window.getSelection().toString();
        } else if (document.selection && document.selection.type !== "Control") {
          text = document.selection.createRange().text;
        }
        return text;
      };
      atom.commands.add('atom-workspace', {
        'atom-terminal-panel:context-copy-and-execute-output-selection': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              var t;
              t = getSelectedText();
              atom.clipboard.write(t);
              return i.onCommand(t);
            });
          };
        })(this),
        'atom-terminal-panel:context-copy-output-selection': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return atom.clipboard.write(getSelectedText());
            });
          };
        })(this),
        'atom-terminal-panel:context-copy-raw-output': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return atom.clipboard.write(i.getRawOutput());
            });
          };
        })(this),
        'atom-terminal-panel:context-copy-html-output': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return atom.clipboard.write(i.getHtmlOutput());
            });
          };
        })(this),
        'atom-terminal-panel:new': (function(_this) {
          return function() {
            return _this.newTermClick();
          };
        })(this),
        'atom-terminal-panel:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'atom-terminal-panel:next': (function(_this) {
          return function() {
            return _this.activeNextCommandView();
          };
        })(this),
        'atom-terminal-panel:prev': (function(_this) {
          return function() {
            return _this.activePrevCommandView();
          };
        })(this),
        'atom-terminal-panel:hide': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.close();
            });
          };
        })(this),
        'atom-terminal-panel:destroy': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.destroy();
            });
          };
        })(this),
        'atom-terminal-panel:compile': (function(_this) {
          return function() {
            return _this.getForcedActiveCommandView().compile();
          };
        })(this),
        'atom-terminal-panel:toggle-autocompletion': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.toggleAutoCompletion();
            });
          };
        })(this),
        'atom-terminal-panel:reload-config': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              i.clear();
              i.reloadSettings();
              return i.clear();
            });
          };
        })(this),
        'atom-terminal-panel:show-command-finder': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.getLocalCommandsMemdump();
            });
          };
        })(this),
        'atom-terminal-panel:open-config': (function(_this) {
          return function() {
            return _this.runInCurrentView(function(i) {
              return i.showSettings();
            });
          };
        })(this)
      });
      this.createCommandView();
      return this.attach();
    };

    ATPPanel.prototype.updateStatusBarTask = function(instance, delay) {
      if (delay == null) {
        delay = 1000;
      }
      return setTimeout((function(_this) {
        return function() {
          if (instance != null) {
            _this.updateStatusBar(instance);
          } else {
            _this.updateStatusBar(_this.commandViews[0]);
          }
          return _this.updateStatusBarTask(instance, delay);
        };
      })(this), delay);
    };

    ATPPanel.prototype.updateStatusBar = function(instance) {
      if (instance == null) {
        return;
      }
      this.termStatusInfo.children().remove();
      return this.termStatusInfo.append(instance.parseTemplate(atom.config.get('atom-terminal-panel.statusBarText'), [], true));
    };

    ATPPanel.prototype.createCommandView = function() {
      var commandOutputView, termStatus;
      termStatus = $('<span class="atp-panel icon icon-terminal"></span>');
      commandOutputView = new ATPOutputView;
      commandOutputView.statusIcon = termStatus;
      commandOutputView.statusView = this;
      this.commandViews.push(commandOutputView);
      termStatus.click((function(_this) {
        return function() {
          return commandOutputView.toggle();
        };
      })(this));
      this.termStatusContainer.append(termStatus);
      commandOutputView.init();
      this.updateStatusBar(commandOutputView);
      return commandOutputView;
    };

    ATPPanel.prototype.activeNextCommandView = function() {
      return this.activeCommandView(this.activeIndex + 1);
    };

    ATPPanel.prototype.activePrevCommandView = function() {
      return this.activeCommandView(this.activeIndex - 1);
    };

    ATPPanel.prototype.activeCommandView = function(index) {
      if (index >= this.commandViews.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.commandViews.length - 1;
      }
      this.updateStatusBar(this.commandViews[index]);
      return this.commandViews[index] && this.commandViews[index].open();
    };

    ATPPanel.prototype.getActiveCommandView = function() {
      return this.commandViews[this.activeIndex];
    };

    ATPPanel.prototype.runInCurrentView = function(call) {
      var v;
      v = this.getForcedActiveCommandView();
      if (v != null) {
        return call(v);
      }
      return null;
    };

    ATPPanel.prototype.getForcedActiveCommandView = function() {
      var ret;
      if (this.getActiveCommandView() !== null && this.getActiveCommandView() !== void 0) {
        return this.getActiveCommandView();
      }
      ret = this.activeCommandView(0);
      this.toggle();
      return ret;
    };

    ATPPanel.prototype.setActiveCommandView = function(commandView) {
      this.activeIndex = this.commandViews.indexOf(commandView);
      return this.updateStatusBar(this.commandViews[this.activeIndex]);
    };

    ATPPanel.prototype.removeCommandView = function(commandView) {
      var index;
      index = this.commandViews.indexOf(commandView);
      return index >= 0 && this.commandViews.splice(index, 1);
    };

    ATPPanel.prototype.newTermClick = function() {
      return this.createCommandView().toggle();
    };

    ATPPanel.prototype.attach = function() {
      return atom.workspace.addBottomPanel({
        item: this,
        priority: 100
      });
    };

    ATPPanel.prototype.destroyActiveTerm = function() {
      var _ref1;
      return (_ref1 = this.commandViews[this.activeIndex]) != null ? _ref1.destroy() : void 0;
    };

    ATPPanel.prototype.closeAll = function() {
      var index, o, _i, _ref1, _results;
      _results = [];
      for (index = _i = _ref1 = this.commandViews.length; _ref1 <= 0 ? _i <= 0 : _i >= 0; index = _ref1 <= 0 ? ++_i : --_i) {
        o = this.commandViews[index];
        if (o != null) {
          _results.push(o.close());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ATPPanel.prototype.destroy = function() {
      var index, _i, _ref1;
      for (index = _i = _ref1 = this.commandViews.length; _ref1 <= 0 ? _i <= 0 : _i >= 0; index = _ref1 <= 0 ? ++_i : --_i) {
        this.removeCommandView(this.commandViews[index]);
      }
      return this.detach();
    };

    ATPPanel.prototype.toggle = function() {
      if (this.commandViews[this.activeIndex] == null) {
        this.createCommandView();
      }
      this.updateStatusBar(this.commandViews[this.activeIndex]);
      return this.commandViews[this.activeIndex].toggle();
    };

    return ATPPanel;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL2xpYi9hdHAtcGFuZWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7Ozs7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxzQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBUUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFSSixDQUFBOztBQUFBLEVBU0EsYUFBQSxHQUFnQixPQUFBLENBQVEsVUFBUixDQVRoQixDQUFBOztBQUFBLEVBV0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHdCQUFQO09BQUwsRUFBc0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwQyxVQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE1BQUEsRUFBUSxxQkFBUjtXQUFOLEVBQXFDLFNBQUEsR0FBQTttQkFDbkMsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsS0FBQSxFQUFPLGNBQVA7QUFBQSxjQUF1QixPQUFBLEVBQU8sMEJBQTlCO2FBQU4sRUFEbUM7VUFBQSxDQUFyQyxDQUFBLENBQUE7aUJBRUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLFlBQUEsTUFBQSxFQUFRLGdCQUFSO0FBQUEsWUFBMEIsS0FBQSxFQUFPLDhCQUFqQztXQUFOLEVBSG9DO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSx1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

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/lib/atp-panel.coffee
