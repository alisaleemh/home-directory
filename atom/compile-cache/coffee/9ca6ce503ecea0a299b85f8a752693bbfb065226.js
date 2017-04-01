(function() {
  var BrowserPlus, BrowserPlusModel, CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  BrowserPlusModel = require('./browser-plus-model');

  require('JSON2');

  require('jstorage');

  module.exports = BrowserPlus = {
    browserPlusView: null,
    subscriptions: null,
    config: {
      fav: {
        title: 'No of Favorites',
        type: 'number',
        "default": 10
      },
      homepage: {
        title: 'HomePage',
        type: 'string',
        "default": 'browser-plus://blank'
      },
      live: {
        title: 'Live Refresh in ',
        type: 'number',
        "default": 500
      },
      currentFile: {
        title: 'Show Current File',
        type: 'boolean',
        "default": true
      },
      openInSameWindow: {
        title: 'Open URLs in Same Window',
        type: 'array',
        "default": ['www.google.com', 'www.stackoverflow.com', 'google.com', 'stackoverflow.com']
      }
    },
    activate: function(state) {
      if (!state.noReset) {
        state.favIcon = {};
        state.title = {};
        state.fav = [];
      }
      this.resources = "" + (atom.packages.getPackageDirPaths()[0]) + "/browser-plus/resources/";
      if (!window.$.jStorage.get('bp.fav')) {
        window.$.jStorage.set('bp.fav', []);
      }
      if (!window.$.jStorage.get('bp.history')) {
        window.$.jStorage.set('bp.history', []);
      }
      if (!window.$.jStorage.get('bp.favIcon')) {
        window.$.jStorage.set('bp.favIcon', {});
      }
      if (!window.$.jStorage.get('bp.title')) {
        window.$.jStorage.set('bp.title', {});
      }
      atom.workspace.addOpener((function(_this) {
        return function(url, opt) {
          var editor, localhostPattern, pane, path;
          if (opt == null) {
            opt = {};
          }
          path = require('path');
          if (url.indexOf('http:') === 0 || url.indexOf('https:') === 0 || url.indexOf('localhost') === 0 || url.indexOf('file:') === 0 || url.indexOf('browser-plus:') === 0 || url.indexOf('browser-plus~') === 0) {
            localhostPattern = /^(http:\/\/)?localhost/i;
            if (!BrowserPlusModel.checkUrl(url)) {
              return false;
            }
            if (url !== 'browser-plus://blank') {
              editor = BrowserPlusModel.getEditorForURI(url, opt.openInSameWindow);
              if (editor) {
                editor.setText(opt.src);
                if (!opt.src) {
                  editor.refresh(url);
                }
                pane = atom.workspace.paneForItem(editor);
                pane.activateItem(editor);
                return editor;
              }
            }
            url = url.replace(localhostPattern, 'http://127.0.0.1');
            return new BrowserPlusModel({
              browserPlus: _this,
              url: url,
              opt: opt
            });
          }
        };
      })(this));
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:open': (function(_this) {
          return function() {
            return _this.open();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:openCurrent': (function(_this) {
          return function() {
            return _this.open(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:history': (function(_this) {
          return function() {
            return _this.history(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:deleteHistory': (function(_this) {
          return function() {
            return _this["delete"](true);
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:fav': (function(_this) {
          return function() {
            return _this.favr();
          };
        })(this)
      }));
    },
    favr: function() {
      var favList;
      favList = require('./fav-view');
      return new favList(window.$.jStorage.get('bp.fav'));
    },
    "delete": function() {
      return $.jStorage.set('bp.history', []);
    },
    history: function() {
      return atom.workspace.open("browser-plus://history", {
        split: 'left',
        searchAllPanes: true
      });
    },
    open: function(url, opt) {
      var editor, _ref;
      if (opt == null) {
        opt = {};
      }
      if (url === true || atom.config.get('browser-plus.currentFile')) {
        editor = atom.workspace.getActiveTextEditor();
        if (url = editor != null ? (_ref = editor.buffer) != null ? _ref.getUri() : void 0 : void 0) {
          url = "file:///" + url;
        }
      }
      if (!url) {
        url = atom.config.get('browser-plus.homepage');
      }
      if (!opt.split) {
        opt.split = this.getPosition();
      }
      return atom.workspace.open(url, opt);
    },
    getPosition: function() {
      var activePane, orientation, paneAxis, paneIndex, _ref;
      activePane = atom.workspace.paneForItem(atom.workspace.getActiveTextEditor());
      if (!activePane) {
        return;
      }
      paneAxis = activePane.getParent();
      if (!paneAxis) {
        return;
      }
      paneIndex = paneAxis.getPanes().indexOf(activePane);
      orientation = (_ref = paneAxis.orientation) != null ? _ref : 'horizontal';
      if (orientation === 'horizontal') {
        if (paneIndex === 0) {
          return 'right';
        } else {
          return 'left';
        }
      } else {
        if (paneIndex === 0) {
          return 'down';
        } else {
          return 'up';
        }
      }
    },
    deactivate: function() {
      var _base;
      if (typeof (_base = this.browserPlusView).destroy === "function") {
        _base.destroy();
      }
      return this.subscriptions.dispose();
    },
    serialize: function() {
      return {
        noReset: true
      };
    },
    registerEvt: function(cb) {
      debugger;
    },
    getBrowserPlusUrl: function(url) {
      if (url.startsWith('browser-plus://history')) {
        return url = "" + this.resources + "history.html";
      } else {
        return url = '';
      }
    },
    provideService: function() {
      BrowserPlusModel = require('./browser-plus-model');
      return {
        model: BrowserPlusModel,
        open: this.open.bind(this),
        evt: this.registerEvt.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMvbGliL2Jyb3dzZXItcGx1cy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsa0RBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUixDQURuQixDQUFBOztBQUFBLEVBRUEsT0FBQSxDQUFRLE9BQVIsQ0FGQSxDQUFBOztBQUFBLEVBR0EsT0FBQSxDQUFRLFVBQVIsQ0FIQSxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBQSxHQUNmO0FBQUEsSUFBQSxlQUFBLEVBQWlCLElBQWpCO0FBQUEsSUFDQSxhQUFBLEVBQWUsSUFEZjtBQUFBLElBRUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxHQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxpQkFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxFQUZUO09BREY7QUFBQSxNQUlBLFFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLFVBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsc0JBRlQ7T0FMRjtBQUFBLE1BUUEsSUFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sa0JBQVA7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsR0FGVDtPQVRGO0FBQUEsTUFZQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxtQkFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUZUO09BYkY7QUFBQSxNQWdCQSxn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

//# sourceURL=/home/alisaleemh/.atom/packages/browser-plus/lib/browser-plus.coffee
