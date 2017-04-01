(function() {
  var BrowserPlus, BrowserPlusModel, CompositeDisposable, uuid;

  CompositeDisposable = require('atom').CompositeDisposable;

  BrowserPlusModel = require('./browser-plus-model');

  require('JSON2');

  require('jstorage');

  uuid = require('node-uuid');

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
      this.resources = (atom.packages.getPackageDirPaths()[0]) + "/browser-plus/resources/";
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
            if (!(url === 'browser-plus://blank' || url.startsWith('file:///') || !opt.openInSameWindow)) {
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
      var editor, ref;
      if (opt == null) {
        opt = {};
      }
      if (url === true || atom.config.get('browser-plus.currentFile')) {
        editor = atom.workspace.getActiveTextEditor();
        if (url = editor != null ? (ref = editor.buffer) != null ? ref.getUri() : void 0 : void 0) {
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
      var activePane, orientation, paneAxis, paneIndex, ref;
      activePane = atom.workspace.paneForItem(atom.workspace.getActiveTextEditor());
      if (!activePane) {
        return;
      }
      paneAxis = activePane.getParent();
      if (!paneAxis) {
        return;
      }
      paneIndex = paneAxis.getPanes().indexOf(activePane);
      orientation = (ref = paneAxis.orientation) != null ? ref : 'horizontal';
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
      var ref;
      if ((ref = this.browserPlusView) != null) {
        if (typeof ref.destroy === "function") {
          ref.destroy();
        }
      }
      return this.subscriptions.dispose();
    },
    serialize: function() {
      return {
        noReset: true
      };
    },
    getBrowserPlusUrl: function(url) {
      if (url.startsWith('browser-plus://history')) {
        return url = this.resources + "history.html";
      } else {
        return url = '';
      }
    },
    addPlugin: function(requires) {
      var error, key, menu, pkg, pkgPath, pkgs, results, script, val;
      if (this.plugins == null) {
        this.plugins = {};
      }
      results = [];
      for (key in requires) {
        val = requires[key];
        try {
          switch (key) {
            case 'onInit' || 'onExit':
              results.push(this.plugins[key] = (this.plugins[key] || []).concat("(" + (val.toString()) + ")()"));
              break;
            case 'js' || 'css':
              if (!pkgPath) {
                pkgs = Object.keys(atom.packages.activatingPackages).sort();
                pkg = pkgs[pkgs.length - 1];
                pkgPath = atom.packages.activatingPackages[pkg].path + "/";
              }
              if (Array.isArray(val)) {
                results.push((function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = val.length; i < len; i++) {
                    script = val[i];
                    if (!script.startsWith('http')) {
                      results1.push(this.plugins[key + "s"] = (this.plugins[key] || []).concat('file:///' + atom.packages.activatingPackages[pkg].path.replace(/\\/g, "/") + "/" + script));
                    } else {
                      results1.push(void 0);
                    }
                  }
                  return results1;
                }).call(this));
              } else {
                if (!val.startsWith('http')) {
                  results.push(this.plugins[key + "s"] = (this.plugins[key] || []).concat('file:///' + atom.packages.activatingPackages[pkg].path.replace(/\\/g, "/") + "/" + val));
                } else {
                  results.push(void 0);
                }
              }
              break;
            case 'menus':
              if (Array.isArray(val)) {
                results.push((function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = val.length; i < len; i++) {
                    menu = val[i];
                    menu._id = uuid.v1();
                    results1.push(this.plugins[key] = (this.plugins[key] || []).concat(menu));
                  }
                  return results1;
                }).call(this));
              } else {
                val._id = uuid.v1();
                results.push(this.plugins[key] = (this.plugins[key] || []).concat(val));
              }
              break;
            default:
              results.push(void 0);
          }
        } catch (error1) {
          error = error1;
        }
      }
      return results;
    },
    provideService: function() {
      return {
        model: require('./browser-plus-model'),
        addPlugin: this.addPlugin.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMvbGliL2Jyb3dzZXItcGx1cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixPQUFBLENBQVEsT0FBUjs7RUFDQSxPQUFBLENBQVEsVUFBUjs7RUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVI7O0VBQ1AsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBQSxHQUNmO0lBQUEsZUFBQSxFQUFpQixJQUFqQjtJQUNBLGFBQUEsRUFBZSxJQURmO0lBRUEsTUFBQSxFQUNFO01BQUEsR0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGlCQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7T0FERjtNQUlBLFFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxVQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLHNCQUZUO09BTEY7TUFRQSxJQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sa0JBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FGVDtPQVRGO01BWUEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG1CQUFQO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7T0FiRjtNQWdCQSxnQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLDBCQUFQO1FBQ0EsSUFBQSxFQUFNLE9BRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMsZ0JBQUQsRUFBa0IsdUJBQWxCLEVBQTBDLFlBQTFDLEVBQXVELG1CQUF2RCxDQUZUO09BakJGO0tB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Q0FBNkIsR0FBN0IsR0FObEI7O0FBREc7QUFoQlA7O0FBQUEsV0FERjtTQUFBLGNBQUE7VUEwQk0sZUExQk47O0FBREY7O0lBRlMsQ0FySFg7SUFzSkEsY0FBQSxFQUFnQixTQUFBO2FBQ2Q7UUFBQSxLQUFBLEVBQU0sT0FBQSxDQUFRLHNCQUFSLENBQU47UUFDQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBRFg7O0lBRGMsQ0F0SmhCOztBQU5GIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdG9tLnByb2plY3QucmVzb2x2ZVBhdGhcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5Ccm93c2VyUGx1c01vZGVsID0gcmVxdWlyZSAnLi9icm93c2VyLXBsdXMtbW9kZWwnXG5yZXF1aXJlICdKU09OMidcbnJlcXVpcmUgJ2pzdG9yYWdlJ1xudXVpZCA9IHJlcXVpcmUgJ25vZGUtdXVpZCdcbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlclBsdXMgPVxuICBicm93c2VyUGx1c1ZpZXc6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBjb25maWc6XG4gICAgZmF2OlxuICAgICAgdGl0bGU6ICdObyBvZiBGYXZvcml0ZXMnXG4gICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgZGVmYXVsdDogMTBcbiAgICBob21lcGFnZTpcbiAgICAgIHRpdGxlOiAnSG9tZVBhZ2UnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2Jyb3dzZXItcGx1czovL2JsYW5rJ1xuICAgIGxpdmU6XG4gICAgICB0aXRsZTogJ0xpdmUgUmVmcmVzaCBpbiAnXG4gICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgZGVmYXVsdDogNTAwXG4gICAgY3VycmVudEZpbGU6XG4gICAgICB0aXRsZTogJ1Nob3cgQ3VycmVudCBGaWxlJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgb3BlbkluU2FtZVdpbmRvdzpcbiAgICAgIHRpdGxlOiAnT3BlbiBVUkxzIGluIFNhbWUgV2luZG93J1xuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogWyd3d3cuZ29vZ2xlLmNvbScsJ3d3dy5zdGFja292ZXJmbG93LmNvbScsJ2dvb2dsZS5jb20nLCdzdGFja292ZXJmbG93LmNvbSddXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICB1bmxlc3Mgc3RhdGUubm9SZXNldFxuICAgICAgc3RhdGUuZmF2SWNvbiA9IHt9XG4gICAgICBzdGF0ZS50aXRsZSA9IHt9XG4gICAgICBzdGF0ZS5mYXYgPSBbXVxuICAgIEByZXNvdXJjZXMgPSBcIiN7YXRvbS5wYWNrYWdlcy5nZXRQYWNrYWdlRGlyUGF0aHMoKVswXX0vYnJvd3Nlci1wbHVzL3Jlc291cmNlcy9cIlxuICAgIHdpbmRvdy4kLmpTdG9yYWdlLnNldCgnYnAuZmF2JyxbXSkgdW5sZXNzIHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuZmF2JylcbiAgICB3aW5kb3cuJC5qU3RvcmFnZS5zZXQoJ2JwLmhpc3RvcnknLFtdKSAgdW5sZXNzIHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAuaGlzdG9yeScpXG4gICAgd2luZG93LiQualN0b3JhZ2Uuc2V0KCdicC5mYXZJY29uJyx7fSkgIHVubGVzcyB3aW5kb3cuJC5qU3RvcmFnZS5nZXQoJ2JwLmZhdkljb24nKVxuICAgIHdpbmRvdy4kLmpTdG9yYWdlLnNldCgnYnAudGl0bGUnLHt9KSAgdW5sZXNzIHdpbmRvdy4kLmpTdG9yYWdlLmdldCgnYnAudGl0bGUnKVxuXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyICh1cmwsb3B0PXt9KT0+XG4gICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgIGlmICggdXJsLmluZGV4T2YoJ2h0dHA6JykgaXMgMCBvciB1cmwuaW5kZXhPZignaHR0cHM6JykgaXMgMCBvclxuICAgICAgICAgIHVybC5pbmRleE9mKCdsb2NhbGhvc3QnKSBpcyAwIG9yIHVybC5pbmRleE9mKCdmaWxlOicpIGlzIDAgb3JcbiAgICAgICAgICB1cmwuaW5kZXhPZignYnJvd3Nlci1wbHVzOicpIGlzIDAgICBvciAjb3Igb3B0LnNyY1xuICAgICAgICAgIHVybC5pbmRleE9mKCdicm93c2VyLXBsdXN+JykgaXMgMCApXG4gICAgICAgICBsb2NhbGhvc3RQYXR0ZXJuID0gLy8vXlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGh0dHA6Ly8pP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxob3N0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9pXG4gICAgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIEJyb3dzZXJQbHVzTW9kZWwuY2hlY2tVcmwodXJsKVxuICAgICAgICAgIyAgY2hlY2sgaWYgaXQgbmVlZCB0byBiZSBvcGVuIGluIHNhbWUgd2luZG93XG4gICAgICAgICB1bmxlc3MgdXJsIGlzICdicm93c2VyLXBsdXM6Ly9ibGFuaycgb3IgdXJsLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8vJykgb3Igbm90IG9wdC5vcGVuSW5TYW1lV2luZG93XG4gICAgICAgICAgIGVkaXRvciA9IEJyb3dzZXJQbHVzTW9kZWwuZ2V0RWRpdG9yRm9yVVJJKHVybCxvcHQub3BlbkluU2FtZVdpbmRvdylcbiAgICAgICAgICAgaWYgZWRpdG9yXG4gICAgICAgICAgICAgZWRpdG9yLnNldFRleHQob3B0LnNyYylcbiAgICAgICAgICAgICBlZGl0b3IucmVmcmVzaCh1cmwpIHVubGVzcyBvcHQuc3JjXG4gICAgICAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcilcbiAgICAgICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpXG4gICAgICAgICAgICAgcmV0dXJuIGVkaXRvclxuXG4gICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShsb2NhbGhvc3RQYXR0ZXJuLCdodHRwOi8vMTI3LjAuMC4xJylcbiAgICAgICAgIG5ldyBCcm93c2VyUGx1c01vZGVsIHticm93c2VyUGx1czpALHVybDp1cmwsb3B0Om9wdH1cblxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYnJvd3Nlci1wbHVzOm9wZW4nOiA9PiBAb3BlbigpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdicm93c2VyLXBsdXM6b3BlbkN1cnJlbnQnOiA9PiBAb3Blbih0cnVlKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYnJvd3Nlci1wbHVzOmhpc3RvcnknOiA9PiBAaGlzdG9yeSh0cnVlKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYnJvd3Nlci1wbHVzOmRlbGV0ZUhpc3RvcnknOiA9PiBAZGVsZXRlKHRydWUpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdicm93c2VyLXBsdXM6ZmF2JzogPT4gQGZhdnIoKVxuXG4gIGZhdnI6IC0+XG4gICAgZmF2TGlzdCA9IHJlcXVpcmUgJy4vZmF2LXZpZXcnXG4gICAgbmV3IGZhdkxpc3Qgd2luZG93LiQualN0b3JhZ2UuZ2V0KCdicC5mYXYnKVxuXG4gIGRlbGV0ZTogLT5cbiAgICAkLmpTdG9yYWdlLnNldCgnYnAuaGlzdG9yeScsW10pXG5cbiAgaGlzdG9yeTogLT5cbiAgICAjIGZpbGU6Ly8vI3tAcmVzb3VyY2VzfWhpc3RvcnkuaHRtbFxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4gXCJicm93c2VyLXBsdXM6Ly9oaXN0b3J5XCIgLCB7c3BsaXQ6ICdsZWZ0JyxzZWFyY2hBbGxQYW5lczp0cnVlfVxuXG4gIG9wZW46ICh1cmwsb3B0ID0ge30pLT5cbiAgICBpZiB1cmwgaXMgdHJ1ZSBvciBhdG9tLmNvbmZpZy5nZXQoJ2Jyb3dzZXItcGx1cy5jdXJyZW50RmlsZScpXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGlmIHVybCA9IGVkaXRvcj8uYnVmZmVyPy5nZXRVcmkoKVxuICAgICAgICB1cmwgPSBcImZpbGU6Ly8vXCIrdXJsXG4gICAgdW5sZXNzIHVybFxuICAgICAgdXJsID0gYXRvbS5jb25maWcuZ2V0KCdicm93c2VyLXBsdXMuaG9tZXBhZ2UnKVxuXG4gICAgb3B0LnNwbGl0ID0gQGdldFBvc2l0aW9uKCkgdW5sZXNzIG9wdC5zcGxpdFxuICAgICMgdXJsID0gXCJicm93c2VyLXBsdXM6Ly9wcmV2aWV3fiN7dXJsfVwiIGlmIHNyY1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4gdXJsLCBvcHRcblxuICBnZXRQb3NpdGlvbjogLT5cbiAgICBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBhY3RpdmVQYW5lXG4gICAgcGFuZUF4aXMgPSBhY3RpdmVQYW5lLmdldFBhcmVudCgpXG4gICAgcmV0dXJuIHVubGVzcyBwYW5lQXhpc1xuICAgIHBhbmVJbmRleCA9IHBhbmVBeGlzLmdldFBhbmVzKCkuaW5kZXhPZihhY3RpdmVQYW5lKVxuICAgIG9yaWVudGF0aW9uID0gcGFuZUF4aXMub3JpZW50YXRpb24gPyAnaG9yaXpvbnRhbCdcbiAgICBpZiBvcmllbnRhdGlvbiBpcyAnaG9yaXpvbnRhbCdcbiAgICAgIGlmICBwYW5lSW5kZXggaXMgMCB0aGVuICdyaWdodCcgZWxzZSAnbGVmdCdcbiAgICBlbHNlXG4gICAgICBpZiAgcGFuZUluZGV4IGlzIDAgdGhlbiAnZG93bicgZWxzZSAndXAnXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAYnJvd3NlclBsdXNWaWV3Py5kZXN0cm95PygpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIG5vUmVzZXQ6IHRydWVcblxuICBnZXRCcm93c2VyUGx1c1VybDogKHVybCktPlxuICAgIGlmIHVybC5zdGFydHNXaXRoKCdicm93c2VyLXBsdXM6Ly9oaXN0b3J5JylcbiAgICAgIHVybCA9IFwiI3tAcmVzb3VyY2VzfWhpc3RvcnkuaHRtbFwiXG4gICAgZWxzZVxuICAgICAgdXJsID0gJydcblxuICBhZGRQbHVnaW46IChyZXF1aXJlcyktPlxuICAgIEBwbHVnaW5zID89IHt9XG4gICAgZm9yIGtleSx2YWwgb2YgcmVxdWlyZXNcbiAgICAgIHRyeVxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgd2hlbiAnb25Jbml0JyBvciAnb25FeGl0J1xuICAgICAgICAgICAgQHBsdWdpbnNba2V5XSA9IChAcGx1Z2luc1trZXldIG9yIFtdKS5jb25jYXQgXCIoI3t2YWwudG9TdHJpbmcoKX0pKClcIlxuICAgICAgICAgIHdoZW4gJ2pzJyBvciAnY3NzJ1xuICAgICAgICAgICAgdW5sZXNzICBwa2dQYXRoXG4gICAgICAgICAgICAgIHBrZ3MgPSBPYmplY3Qua2V5cyhhdG9tLnBhY2thZ2VzLmFjdGl2YXRpbmdQYWNrYWdlcykuc29ydCgpXG4gICAgICAgICAgICAgIHBrZyA9IHBrZ3NbcGtncy5sZW5ndGggLSAxXVxuICAgICAgICAgICAgICBwa2dQYXRoID0gYXRvbS5wYWNrYWdlcy5hY3RpdmF0aW5nUGFja2FnZXNbcGtnXS5wYXRoICsgXCIvXCJcbiAgICAgICAgICAgIGlmIEFycmF5LmlzQXJyYXkodmFsKVxuICAgICAgICAgICAgICBmb3Igc2NyaXB0IGluIHZhbFxuICAgICAgICAgICAgICAgIHVubGVzcyBzY3JpcHQuc3RhcnRzV2l0aCgnaHR0cCcpXG4gICAgICAgICAgICAgICAgICBAcGx1Z2luc1trZXkrXCJzXCJdID0gKEBwbHVnaW5zW2tleV0gb3IgW10pLmNvbmNhdCAnZmlsZTovLy8nK2F0b20ucGFja2FnZXMuYWN0aXZhdGluZ1BhY2thZ2VzW3BrZ10ucGF0aC5yZXBsYWNlKC9cXFxcL2csXCIvXCIpICsgXCIvXCIgKyBzY3JpcHRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgdW5sZXNzIHZhbC5zdGFydHNXaXRoKCdodHRwJylcbiAgICAgICAgICAgICAgICBAcGx1Z2luc1trZXkrXCJzXCJdID0gKEBwbHVnaW5zW2tleV0gb3IgW10pLmNvbmNhdCAnZmlsZTovLy8nKyBhdG9tLnBhY2thZ2VzLmFjdGl2YXRpbmdQYWNrYWdlc1twa2ddLnBhdGgucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSArIFwiL1wiICsgdmFsXG5cbiAgICAgICAgICB3aGVuICdtZW51cydcbiAgICAgICAgICAgIGlmIEFycmF5LmlzQXJyYXkodmFsKVxuICAgICAgICAgICAgICBmb3IgbWVudSBpbiB2YWxcbiAgICAgICAgICAgICAgICBtZW51Ll9pZCA9IHV1aWQudjEoKVxuICAgICAgICAgICAgICAgIEBwbHVnaW5zW2tleV0gPSAoQHBsdWdpbnNba2V5XSBvciBbXSkuY29uY2F0IG1lbnVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgdmFsLl9pZCA9IHV1aWQudjEoKVxuICAgICAgICAgICAgICBAcGx1Z2luc1trZXldID0gKEBwbHVnaW5zW2tleV0gb3IgW10pLmNvbmNhdCB2YWxcblxuICAgICAgY2F0Y2ggZXJyb3JcblxuXG5cbiAgcHJvdmlkZVNlcnZpY2U6IC0+XG4gICAgbW9kZWw6cmVxdWlyZSAnLi9icm93c2VyLXBsdXMtbW9kZWwnXG4gICAgYWRkUGx1Z2luOiBAYWRkUGx1Z2luLmJpbmQoQClcbiJdfQ==
