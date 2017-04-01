(function() {
  var Disposable, Emitter, HTMLEditor, Model, fs, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Disposable = _ref.Disposable, Emitter = _ref.Emitter;

  Model = require('theorist').Model;

  path = require('path');

  fs = require('fs');

  module.exports = HTMLEditor = (function(_super) {
    __extends(HTMLEditor, _super);

    atom.deserializers.add(HTMLEditor);

    function HTMLEditor(_arg) {
      var item, menu, _i, _j, _len, _len1, _ref1, _ref2;
      this.browserPlus = _arg.browserPlus, this.url = _arg.url, this.opt = _arg.opt;
      if (!this.opt) {
        this.opt = {};
      }
      this.disposable = new Disposable();
      this.emitter = new Emitter;
      this.src = this.opt.src;
      this.orgURI = this.opt.orgURI;
      this._id = this.opt._id;
      if (!this.browserPlus.setContextMenu) {
        this.browserPlus.setContextMenu = true;
        _ref1 = atom.contextMenu.itemSets;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          menu = _ref1[_i];
          if (menu.selector === 'atom-pane') {
            _ref2 = menu.items;
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              item = _ref2[_j];
              item.shouldDisplay = function(evt) {
                if (event.target.constructor.name = 'webview') {
                  return false;
                }
                return true;
              };
            }
          }
        }
      }
    }

    HTMLEditor.prototype.getViewClass = function() {
      return require('./browser-plus-view');
    };

    HTMLEditor.prototype.setText = function(src) {
      this.src = src;
      if (this.src) {
        return this.view.setSrc(this.src);
      }
    };

    HTMLEditor.prototype.refresh = function(url) {
      return this.view.refreshPage(url);
    };

    HTMLEditor.prototype.destroyed = function() {
      return this.emitter.emit('did-destroy');
    };

    HTMLEditor.prototype.onDidDestroy = function(cb) {
      return this.emitter.on('did-destroy', cb);
    };

    HTMLEditor.prototype.getTitle = function() {
      var _ref1;
      if (((_ref1 = this.title) != null ? _ref1.length : void 0) > 20) {
        this.title = this.title.slice(0, 20) + '...';
      }
      return this.title || path.basename(this.url);
    };

    HTMLEditor.prototype.getIconName = function() {
      return this.iconName;
    };

    HTMLEditor.prototype.getURI = function() {
      if (this.url === 'browser-plus://blank') {
        return false;
      }
      return this.url;
    };

    HTMLEditor.prototype.getGrammar = function() {};

    HTMLEditor.prototype.setTitle = function(title) {
      this.title = title;
      return this.emit('title-changed');
    };

    HTMLEditor.prototype.updateIcon = function(favIcon) {
      this.favIcon = favIcon;
      return this.emit('icon-changed');
    };

    HTMLEditor.prototype.serialize = function() {
      return {
        data: {
          browserPlus: this.browserPlus,
          url: this.url,
          opt: {
            src: this.src,
            iconName: this.iconName,
            title: this.title
          }
        },
        deserializer: 'HTMLEditor'
      };
    };

    HTMLEditor.deserialize = function(_arg) {
      var data;
      data = _arg.data;
      return new HTMLEditor(data);
    };

    HTMLEditor.checkUrl = function(url) {
      if ((this.checkBlockUrl != null) && this.checkBlockUrl(url)) {
        atom.notifications.addSuccess("" + url + " Blocked~~Maintain Blocked URL in Browser-Plus Settings");
        return false;
      }
      return true;
    };

    HTMLEditor.getEditorForURI = function(url, sameWindow) {
      var a, a1, editor, panes, uri, urls, _i, _len, _ref1;
      if (url.startsWith('file:///')) {
        return;
      }
      a = document.createElement("a");
      a.href = url;
      if (!sameWindow && (urls = atom.config.get('browser-plus.openInSameWindow')).length) {
        sameWindow = (_ref1 = a.hostname, __indexOf.call(urls, _ref1) >= 0);
      }
      if (!sameWindow) {
        return;
      }
      panes = atom.workspace.getPaneItems();
      a1 = document.createElement("a");
      for (_i = 0, _len = panes.length; _i < _len; _i++) {
        editor = panes[_i];
        uri = editor.getURI();
        a1.href = uri;
        if (a1.hostname === a.hostname) {
          return editor;
        }
      }
      return false;
    };

    return HTMLEditor;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMvbGliL2Jyb3dzZXItcGx1cy1tb2RlbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsc0RBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsTUFBUixDQUF2QixFQUFDLGtCQUFBLFVBQUQsRUFBWSxlQUFBLE9BQVosQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLFVBQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7QUFDSixpQ0FBQSxDQUFBOztBQUFBLElBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixVQUF2QixDQUFBLENBQUE7O0FBQ2EsSUFBQSxvQkFBQyxJQUFELEdBQUE7QUFDWCxVQUFBLDZDQUFBO0FBQUEsTUFEYyxJQUFDLENBQUEsbUJBQUEsYUFBWSxJQUFDLENBQUEsV0FBQSxLQUFJLElBQUMsQ0FBQSxXQUFBLEdBQ2pDLENBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFrQixDQUFBLEdBQWxCO0FBQUEsUUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLEVBQVAsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FBQSxDQURsQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxHQUhaLENB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

//# sourceURL=/home/alisaleemh/.atom/packages/browser-plus/lib/browser-plus-model.coffee
