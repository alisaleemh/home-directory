(function() {
  var $, BrowserPlusView, CompositeDisposable, View, jQ, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$;

  $ = jQ = require('../node_modules/jquery/dist/jquery.js');

  require('jquery-ui/autocomplete');

  path = require('path');

  require('JSON2');

  require('jstorage');

  module.exports = BrowserPlusView = (function(_super) {
    __extends(BrowserPlusView, _super);

    function BrowserPlusView(model) {
      this.model = model;
      this.subscriptions = new CompositeDisposable;
      this.model.view = this;
      this.model.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptions.dispose();
          return jQ(_this.url).autocomplete('destroy');
        };
      })(this));
      atom.notifications.onDidAddNotification(function(notification) {
        if (notification.type === 'info') {
          return setTimeout(function() {
            return notification.dismiss();
          }, 1000);
        }
      });
      BrowserPlusView.__super__.constructor.apply(this, arguments);
    }

    BrowserPlusView.content = function(params) {
      var hideURLBar, url, _ref1, _ref2, _ref3, _ref4, _ref5;
      url = params.url;
      hideURLBar = '';
      if ((_ref1 = params.opt) != null ? _ref1.hideURLBar : void 0) {
        hideURLBar = 'hideURLBar';
      }
      if ((_ref2 = params.opt) != null ? _ref2.src : void 0) {
        params.src = BrowserPlusView.checkBase(params.opt.src, params.url);
        params.src = params.src.replace(/"/g, "'");
        if (!((_ref3 = params.src) != null ? _ref3.startsWith("data:text/html,") : void 0)) {
          params.src = "data:text/html," + params.src;
        }
        url = params.src;
      }
      if ((_ref4 = params.url) != null ? _ref4.startsWith("browser-plus://") : void 0) {
        url = (_ref5 = params.browserPlus) != null ? typeof _ref5.getBrowserPlusUrl === "function" ? _ref5.getBrowserPlusUrl(url) : void 0 : void 0;
      }
      return this.div({
        "class": 'browser-plus'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "url native-key-bindings " + hideURLBar,
            outlet: 'urlbar'
          }, function() {
            _this.div({
              "class": 'nav-btns-left'
            }, function() {
              _this.span({
                id: 'back',
                "class": 'mega-octicon octicon-arrow-left',
                outlet: 'back'
              });
              _this.span({
                id: 'forward',
                "class": 'mega-octicon octicon-arrow-right',
                outlet: 'forward'
              });
              _this.span({
                id: 'refresh',
                "class": 'mega-octicon octicon-sync',
                outlet: 'refresh'
              });
              _this.span({
                id: 'history',
                "class": 'mega-octicon octicon-book',
                outlet: 'history'
              });
              _this.span({
                id: 'fav',
                "class": 'mega-octicon octicon-star',
                outlet: 'fav'
              });
              _this.span({
                id: 'favList',
                "class": 'octicon octicon-arrow-down',
                outlet: 'favList'
              });
              return _this.a({
                "class": "fa fa-spinner",
                outlet: 'spinner'
              });
            });
            _this.div({
              "class": 'nav-btns'
            }, function() {
              _this.div({
                "class": 'nav-btns-right'
              }, function() {
                _this.span({
                  id: 'print',
                  "class": 'icon-browser-pluss icon-print',
                  outlet: 'print'
                });
                _this.span({
                  id: 'live',
                  "class": 'mega-octicon octicon-zap',
                  outlet: 'live'
                });
                return _this.span({
                  id: 'devtool',
                  "class": 'mega-octicon octicon-tools',
                  outlet: 'devtool'
                });
              });
              return _this.div({
                "class": 'input-url'
              }, function() {
                return _this.input({
                  "class": "native-key-bindings",
                  type: 'text',
                  id: 'url',
                  outlet: 'url',
                  value: "" + params.url
                });
              });
            });
            return _this.input({
              id: 'find',
              "class": 'find find-hide',
              outlet: 'find'
            });
          });
          return _this.tag('webview', {
            "class": "native-key-bindings",
            outlet: 'htmlv',
            preload: "file:///" + params.browserPlus.resources + "/bp-client.js",
            plugins: 'on',
            src: "" + url,
            disablewebsecurity: 'on',
            allowfileaccessfromfiles: 'on',
            allowPointerLock: 'on'
          });
        };
      })(this));
    };

    BrowserPlusView.prototype.toggleURLBar = function() {
      return this.urlbar.toggle();
    };

    BrowserPlusView.prototype.initialize = function() {
      var select, src, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      src = (function(_this) {
        return function(req, res) {
          var fav, pattern, searchUrl, urls, _;
          _ = require('lodash');
          pattern = RegExp("" + req.term, "i");
          fav = _.filter(window.$.jStorage.get('bp.fav'), function(fav) {
            return fav.url.match(pattern) || fav.title.match(pattern);
          });
          urls = _.pluck(fav, "url");
          res(urls);
          searchUrl = 'http://api.bing.com/osjson.aspx';
          return (function() {
            return jQ.ajax({
              url: searchUrl,
              dataType: 'json',
              data: {
                query: req.term,
                'web.count': 10
              },
              success: (function(_this) {
                return function(data) {
                  var dat, search, _i, _len, _ref1;
                  urls = urls.slice(0, 11);
                  search = "http://www.google.com/search?as_q=";
                  _ref1 = data[1].slice(0, 11);
                  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    dat = _ref1[_i];
                    urls.push({
                      label: dat,
                      value: search + dat
                    });
                  }
                  return res(urls);
                };
              })(this)
            });
          })();
        };
      })(this);
      select = (function(_this) {
        return function(event, ui) {
          return _this.goToUrl(ui.item.value);
        };
      })(this);
      jQ(this.url).autocomplete({
        source: src,
        minLength: 2,
        select: select
      });
      this.subscriptions.add(atom.tooltips.add(this.back, {
        title: 'Back'
      }));
      this.subscriptions.add(atom.tooltips.add(this.forward, {
        title: 'Forward'
      }));
      this.subscriptions.add(atom.tooltips.add(this.refresh, {
        title: 'Refresh'
      }));
      this.subscriptions.add(atom.tooltips.add(this.print, {
        title: 'Print'
      }));
      this.subscriptions.add(atom.tooltips.add(this.history, {
        title: 'History'
      }));
      this.subscriptions.add(atom.tooltips.add(this.favList, {
        title: 'View Favorites'
      }));
      this.subscriptions.add(atom.tooltips.add(this.fav, {
        title: 'Favoritize'
      }));
      this.subscriptions.add(atom.tooltips.add(this.live, {
        title: 'Live'
      }));
      this.subscriptions.add(atom.tooltips.add(this.devtool, {
        title: 'Dev Tools-f12'
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus webview', {
        'browser-plus-view:goBack': (function(_this) {
          return function() {
            return _this.goBack();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus webview', {
        'browser-plus-view:goForward': (function(_this) {
          return function() {
            return _this.goForward();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus', {
        'browser-plus-view:toggleURLBar': (function(_this) {
          return function() {
            return _this.toggleURLBar();
          };
        })(this)
      }));
      this.liveOn = false;
      this.element.onkeydown = (function(_this) {
        return function() {
          return _this.showDevTool(arguments);
        };
      })(this);
      if (this.model.url.indexOf('file:///') >= 0) {
        this.checkFav();
      }
      if ((_ref1 = this.htmlv[0]) != null) {
        _ref1.addEventListener("permissionrequest", function(e) {
          return e.request.allow();
        });
      }
      if ((_ref2 = this.htmlv[0]) != null) {
        _ref2.addEventListener("console-message", (function(_this) {
          return function(e) {
            var BrowserPlusModel, data, indx, title, url, _base, _ref3, _ref4, _ref5, _ref6;
            if (e.message.includes('~browser-plus-href~')) {
              data = e.message.replace('~browser-plus-href~', '');
              indx = data.indexOf(' ');
              url = data.substr(0, indx);
              title = data.substr(indx + 1);
              BrowserPlusModel = require('./browser-plus-model');
              if (!BrowserPlusModel.checkUrl(url)) {
                url = atom.config.get('browser-plus.homepage') || "http://www.google.com";
                atom.notifications.addSuccess("Redirecting to " + url);
                if ((_ref3 = _this.htmlv[0]) != null) {
                  _ref3.executeJavaScript("location.href = '" + url + "'");
                }
                return;
              }
              if (url && url !== _this.model.url && !((_ref4 = _this.url.val()) != null ? _ref4.startsWith('browser-plus://') : void 0)) {
                _this.url.val(url);
                _this.model.url = url;
              }
              if (title) {
                if (title !== _this.model.getTitle()) {
                  _this.model.setTitle(title);
                }
              } else {
                _this.model.setTitle(url);
              }
              _this.live.toggleClass('active', _this.liveOn);
              if (!_this.liveOn) {
                if ((_ref5 = _this.liveSubscription) != null) {
                  _ref5.dispose();
                }
              }
              _this.checkNav();
              _this.checkFav();
              _this.addHistory();
            }
            if (e.message.includes('~browser-plus-jquery~')) {
              if ((_base = _this.model.browserPlus).jQueryJS == null) {
                _base.jQueryJS = BrowserPlusView.getJQuery();
              }
              return (_ref6 = _this.htmlv[0]) != null ? _ref6.executeJavaScript(_this.model.browserPlus.jQueryJS) : void 0;
            }
          };
        })(this));
      }
      if ((_ref3 = this.htmlv[0]) != null) {
        _ref3.addEventListener("page-favicon-updated", (function(_this) {
          return function(e) {
            var fav, favIcon, favr, style, uri, _;
            _ = require('lodash');
            favr = window.$.jStorage.get('bp.fav');
            if (fav = _.find(favr, {
              'url': _this.model.url
            })) {
              fav.favIcon = e.favicons[0];
              window.$.jStorage.set('bp.fav', favr);
            }
            _this.model.iconName = Math.floor(Math.random() * 10000).toString();
            _this.model.favIcon = e.favicons[0];
            _this.model.updateIcon(e.favicons[0]);
            favIcon = window.$.jStorage.get('bp.favIcon');
            uri = _this.htmlv[0].getUrl();
            favIcon[uri] = e.favicons[0];
            window.$.jStorage.set('bp.favIcon', favIcon);
            _this.model.updateIcon();
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = ".title.icon.icon-" + _this.model.iconName + " {\n  background-size: 16px 16px;\n  background-repeat: no-repeat;\n  padding-left: 20px;\n  background-image: url('" + e.favicons[0] + "');\n  background-position-y: 50%;\n}";
            return document.getElementsByTagName('head')[0].appendChild(style);
          };
        })(this));
      }
      if ((_ref4 = this.htmlv[0]) != null) {
        _ref4.addEventListener("page-title-set", (function(_this) {
          return function(e) {
            var fav, favr, title, uri, _;
            _ = require('lodash');
            favr = window.$.jStorage.get('bp.fav');
            title = window.$.jStorage.get('bp.title');
            uri = _this.htmlv[0].getUrl();
            title[uri] = e.title;
            window.$.jStorage.set('bp.title', title);
            if (fav = _.find(favr, {
              'url': _this.model.url
            })) {
              fav.title = e.title;
              window.$.jStorage.set('bp.fav', favr);
            }
            return _this.model.setTitle(e.title);
          };
        })(this));
      }
      this.devtool.on('click', (function(_this) {
        return function(evt) {
          return _this.toggleDevTool();
        };
      })(this));
      this.print.on('click', (function(_this) {
        return function(evt) {
          var _ref5;
          return (_ref5 = _this.htmlv[0]) != null ? _ref5.print() : void 0;
        };
      })(this));
      this.history.on('click', (function(_this) {
        return function(evt) {
          return atom.workspace.open("browser-plus://history", {
            split: 'left',
            searchAllPanes: true
          });
        };
      })(this));
      this.live.on('click', (function(_this) {
        return function(evt) {
          _this.liveOn = !_this.liveOn;
          _this.live.toggleClass('active', _this.liveOn);
          if (_this.liveOn) {
            _this.refreshPage();
            _this.liveSubscription = new CompositeDisposable;
            _this.liveSubscription.add(atom.workspace.observeTextEditors(function(editor) {
              return _this.liveSubscription.add(editor.onDidSave(function() {
                var timeout;
                timeout = atom.config.get('browser-plus.live');
                return setTimeout(function() {
                  return _this.refreshPage();
                }, timeout);
              }));
            }));
            return _this.model.onDidDestroy(function() {
              return _this.liveSubscription.dispose();
            });
          } else {
            return _this.liveSubscription.dispose();
          }
        };
      })(this));
      this.fav.on('click', (function(_this) {
        return function(evt) {
          var data, delCount, favs;
          favs = window.$.jStorage.get('bp.fav');
          if (_this.fav.hasClass('active')) {
            _this.removeFav(_this.model);
          } else {
            if (_this.model.orgURI) {
              return;
            }
            data = {
              url: _this.model.url,
              title: _this.model.title || _this.model.url,
              favIcon: _this.model.favIcon
            };
            favs.push(data);
            delCount = favs.length - atom.config.get('browser-plus.fav');
            if (delCount > 0) {
              favs.splice(0, delCount);
            }
            window.$.jStorage.set('bp.fav', favs);
          }
          return _this.fav.toggleClass('active');
        };
      })(this));
      if ((_ref5 = this.htmlv[0]) != null) {
        _ref5.addEventListener('new-window', function(e) {
          return atom.workspace.open(e.url, {
            split: 'left',
            searchAllPanes: true
          });
        });
      }
      if ((_ref6 = this.htmlv[0]) != null) {
        _ref6.addEventListener("did-start-loading", (function(_this) {
          return function() {
            var _ref7;
            _this.spinner.removeClass('fa-custom');
            return (_ref7 = _this.htmlv[0]) != null ? _ref7.shadowRoot.firstChild.style.height = '95%' : void 0;
          };
        })(this));
      }
      if ((_ref7 = this.htmlv[0]) != null) {
        _ref7.addEventListener("did-stop-loading", (function(_this) {
          return function() {
            return _this.spinner.addClass('fa-custom');
          };
        })(this));
      }
      this.back.on('click', (function(_this) {
        return function(evt) {
          var _ref8, _ref9;
          if (((_ref8 = _this.htmlv[0]) != null ? _ref8.canGoBack() : void 0) && $( this).hasClass('active')) {
            return (_ref9 = _this.htmlv[0]) != null ? _ref9.goBack() : void 0;
          }
        };
      })(this));
      this.favList.on('click', (function(_this) {
        return function(evt) {
          var favList;
          favList = require('./fav-view');
          return new favList(window.$.jStorage.get('bp.fav'));
        };
      })(this));
      this.forward.on('click', (function(_this) {
        return function(evt) {
          var _ref8, _ref9;
          if (((_ref8 = _this.htmlv[0]) != null ? _ref8.canGoForward() : void 0) && $( this).hasClass('active')) {
            return (_ref9 = _this.htmlv[0]) != null ? _ref9.goForward() : void 0;
          }
        };
      })(this));
      this.url.on('click', (function(_this) {
        return function(evt) {
          return _this.url.select();
        };
      })(this));
      this.url.on('keypress', (function(_this) {
        return function(evt) {
          var URL, localhostPattern, url, urls, _ref8;
          URL = require('url');
          if (evt.which === 13) {
            _this.url.blur();
            urls = URL.parse( this.value);
            url =  this.value;
            if (!url.startsWith('browser-plus://')) {
              if (url.indexOf(' ') >= 0) {
                url = "http://www.google.com/search?as_q=" + url;
              } else {
                localhostPattern = /^(http:\/\/)?localhost/i;
                if (url.search(localhostPattern) < 0 && url.indexOf('.') < 0) {
                  url = "http://www.google.com/search?as_q=" + url;
                } else {
                  if ((_ref8 = urls.protocol) === 'http' || _ref8 === 'https' || _ref8 === 'file:') {
                    if (urls.protocol === 'file:') {
                      url = url.replace(/\\/g, "/");
                    } else {
                      url = URL.format(urls);
                    }
                  } else if (url.indexOf('localhost') !== -1) {
                    url = url.replace(localhostPattern, 'http://127.0.0.1');
                  } else {
                    urls.protocol = 'http';
                    url = URL.format(urls);
                  }
                }
              }
            }
            return _this.goToUrl(url);
          }
        };
      })(this));
      return this.refresh.on('click', (function(_this) {
        return function(evt) {
          return _this.refreshPage();
        };
      })(this));
    };

    BrowserPlusView.prototype.refreshPage = function(url) {
      var pp, _ref1, _ref2;
      if (this.model.orgURI && (pp = atom.packages.getActivePackage('pp'))) {
        return pp.mainModule.compilePath(this.model.orgURI, this.model._id);
      } else {
        if (url) {
          this.model.url = url;
          this.url.val(url);
        }
        if (this.model.src) {
          return (_ref1 = this.htmlv[0]) != null ? _ref1.src = this.model.src : void 0;
        } else {
          return (_ref2 = this.htmlv[0]) != null ? _ref2.executeJavaScript("location.href = '" + this.model.url + "'") : void 0;
        }
      }
    };

    BrowserPlusView.prototype.goToUrl = function(url) {
      var BrowserPlusModel, _ref1;
      BrowserPlusModel = require('./browser-plus-model');
      if (!BrowserPlusModel.checkUrl(url)) {
        return;
      }
      jQ(this.url).autocomplete("close");
      this.liveOn = false;
      this.live.toggleClass('active', this.liveOn);
      if (!this.liveOn) {
        if ((_ref1 = this.liveSubscription) != null) {
          _ref1.dispose();
        }
      }
      this.url.val(url);
      this.model.url = url;
      delete this.model.title;
      delete this.model.iconName;
      delete this.model.favIcon;
      this.model.setTitle(null);
      this.model.updateIcon(null);
      if (url.startsWith('browser-plus://')) {
        url = this.model.browserPlus.getBrowserPlusUrl(url);
      }
      return this.htmlv.attr('src', url);
    };

    BrowserPlusView.prototype.showDevTool = function(evt) {
      if (evt[0].keyIdentifier === "F12") {
        return this.toggleDevTool();
      }
    };

    BrowserPlusView.prototype.removeFav = function(favorite) {
      var favr, favrs, idx, _i, _len;
      favrs = window.$.jStorage.get('bp.fav');
      for (idx = _i = 0, _len = favrs.length; _i < _len; idx = ++_i) {
        favr = favrs[idx];
        if (favr.url === favorite.url) {
          favrs.splice(idx, 1);
          window.$.jStorage.set('bp.fav', favrs);
          return;
        }
      }
    };

    BrowserPlusView.prototype.setSrc = function(text) {
      var url, _ref1;
      url = this.model.orgURI || this.model.url;
      text = BrowserPlusView.checkBase(text, url);
      this.model.src = "data:text/html," + text;
      return (_ref1 = this.htmlv[0]) != null ? _ref1.src = this.model.src : void 0;
    };

    BrowserPlusView.checkBase = function(text, url) {
      var $html, base, basePath, cheerio;
      cheerio = require('cheerio');
      $html = cheerio.load(text);
      basePath = path.dirname(url) + "/";
      if ($html('base').length) {
        return text;
      } else {
        if ($html('head').length) {
          base = "<base href='" + basePath + "' target='_blank'>";
          $html('head').prepend(base);
        } else {
          base = "<head><base href='" + basePath + "' target='_blank'></head>";
          $html('html').prepend(base);
        }
        return $html.html();
      }
    };

    BrowserPlusView.prototype.checkFav = function() {
      var favr, favrs, _i, _len, _results;
      this.fav.removeClass('active');
      favrs = window.$.jStorage.get('bp.fav');
      _results = [];
      for (_i = 0, _len = favrs.length; _i < _len; _i++) {
        favr = favrs[_i];
        if (favr.url === this.model.url) {
          _results.push(this.fav.addClass('active'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BrowserPlusView.prototype.toggleDevTool = function() {
      var open, _ref1, _ref2, _ref3;
      open = (_ref1 = this.htmlv[0]) != null ? _ref1.isDevToolsOpened() : void 0;
      if (open) {
        if ((_ref2 = this.htmlv[0]) != null) {
          _ref2.closeDevTools();
        }
      } else {
        if ((_ref3 = this.htmlv[0]) != null) {
          _ref3.openDevTools();
        }
      }
      return $(this.devtool).toggleClass('active', !open);
    };

    BrowserPlusView.prototype.checkNav = function() {
      var _ref1, _ref2, _ref3;
      $(this.forward).toggleClass('active', (_ref1 = this.htmlv[0]) != null ? _ref1.canGoForward() : void 0);
      $(this.back).toggleClass('active', (_ref2 = this.htmlv[0]) != null ? _ref2.canGoBack() : void 0);
      if ((_ref3 = this.htmlv[0]) != null ? _ref3.canGoForward() : void 0) {
        if (this.clearForward) {
          $(this.forward).toggleClass('active', false);
          return this.clearForward = false;
        } else {
          return $(this.forward).toggleClass('active', true);
        }
      }
    };

    BrowserPlusView.prototype.goBack = function() {
      return this.back.click();
    };

    BrowserPlusView.prototype.goForward = function() {
      return this.forward.click();
    };

    BrowserPlusView.prototype.addHistory = function() {
      var histToday, history, historyURL, obj, today, todayObj, url, yyyymmdd, _ref1;
      url = (_ref1 = this.htmlv[0]) != null ? _ref1.getUrl().replace(/\\/g, "/") : void 0;
      historyURL = ("file:///" + this.model.browserPlus.resources + "history.html").replace(/\\/g, "/");
      if (url.startsWith('browser-plus://') || url.startsWith('data:text/html,') || url.startsWith(historyURL)) {
        return;
      }
      yyyymmdd = function() {
        var date, dd, mm, yyyy;
        date = new Date();
        yyyy = date.getFullYear().toString();
        mm = (date.getMonth() + 1).toString();
        dd = date.getDate().toString();
        return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0' + dd[0]);
      };
      today = yyyymmdd();
      history = window.$.jStorage.get('bp.history') || [];
      todayObj = history.find(function(ele, idx, arr) {
        if (ele[today]) {
          return true;
        }
      });
      if (!todayObj) {
        obj = {};
        histToday = [];
        obj[today] = histToday;
        history.unshift(obj);
      } else {
        histToday = todayObj[today];
      }
      histToday.unshift({
        date: new Date().toString(),
        uri: url
      });
      return window.$.jStorage.set('bp.history', history);
    };

    BrowserPlusView.prototype.getTitle = function() {
      return this.model.getTitle();
    };

    BrowserPlusView.prototype.serialize = function() {};

    BrowserPlusView.prototype.destroy = function() {
      jQ(this.url).autocomplete('destroy');
      return this.subscriptions.dispose();
    };

    BrowserPlusView.getJQuery = function() {
      var fs, resources;
      fs = require('fs');
      resources = "" + (atom.packages.getPackageDirPaths()[0]) + "/browser-plus/resources/";
      return fs.readFileSync("" + resources + "/jquery-2.1.4.min.js", 'utf-8');
    };

    return BrowserPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMvbGliL2Jyb3dzZXItcGx1cy12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2REFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsc0JBQXdCLE9BQUEsQ0FBUSxNQUFSLEVBQXhCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxPQUFXLE9BQUEsQ0FBUSxzQkFBUixDQUFYLEVBQUMsWUFBQSxJQUFELEVBQU0sU0FBQSxDQUROLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksRUFBQSxHQUFLLE9BQUEsQ0FBUSx1Q0FBUixDQUZULENBQUE7O0FBQUEsRUFHQSxPQUFBLENBQVEsd0JBQVIsQ0FIQSxDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSlAsQ0FBQTs7QUFBQSxFQUtBLE9BQUEsQ0FBUSxPQUFSLENBTEEsQ0FBQTs7QUFBQSxFQU1BLE9BQUEsQ0FBUSxVQUFSLENBTkEsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixzQ0FBQSxDQUFBOztBQUFhLElBQUEseUJBQUUsS0FBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsUUFBQSxLQUNiLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLEdBQWMsSUFEZCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVAsQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNsQixVQUFBLEtBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQUEsQ0FBQTtpQkFDQSxFQUFBLENB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

//# sourceURL=/home/alisaleemh/.atom/packages/browser-plus/lib/browser-plus-view.coffee
