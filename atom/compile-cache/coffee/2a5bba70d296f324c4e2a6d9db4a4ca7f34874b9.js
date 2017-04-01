(function() {
  var CompositeDisposable, Input, REGISTERS, RegisterManager,
    slice = [].slice;

  CompositeDisposable = require('atom').CompositeDisposable;

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  RegisterManager = (function() {
    function RegisterManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement, this.globalState = ref.globalState;
      this.data = this.globalState.get('register');
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.vimState.toggleClassList('with-register', this.hasName());
    };

    RegisterManager.prototype.destroy = function() {
      var ref;
      this.subscriptionBySelection.forEach(function(disposable) {
        return disposable.dispose();
      });
      this.subscriptionBySelection.clear();
      this.clipboardBySelection.clear();
      return ref = {}, this.subscriptionBySelection = ref.subscriptionBySelection, this.clipboardBySelection = ref.clipboardBySelection, ref;
    };

    RegisterManager.prototype.isValidName = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name, selection) {
      var ref;
      return (ref = this.get(name, selection).text) != null ? ref : '';
    };

    RegisterManager.prototype.readClipboard = function(selection) {
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && this.clipboardBySelection.has(selection)) {
        return this.clipboardBySelection.get(selection);
      } else {
        return atom.clipboard.read();
      }
    };

    RegisterManager.prototype.writeClipboard = function(selection, text) {
      var disposable;
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && !this.clipboardBySelection.has(selection)) {
        disposable = selection.onDidDestroy((function(_this) {
          return function() {
            _this.subscriptionBySelection["delete"](selection);
            return _this.clipboardBySelection["delete"](selection);
          };
        })(this));
        this.subscriptionBySelection.set(selection, disposable);
      }
      if ((selection === null) || selection.isLastSelection()) {
        atom.clipboard.write(text);
      }
      if (selection != null) {
        return this.clipboardBySelection.set(selection, text);
      }
    };

    RegisterManager.prototype.get = function(name, selection) {
      var ref, ref1, text, type;
      if (name == null) {
        name = this.getName();
      }
      if (name === '"') {
        name = this.vimState.getConfig('defaultRegister');
      }
      switch (name) {
        case '*':
        case '+':
          text = this.readClipboard(selection);
          break;
        case '%':
          text = this.editor.getURI();
          break;
        case '_':
          text = '';
          break;
        default:
          ref1 = (ref = this.data[name.toLowerCase()]) != null ? ref : {}, text = ref1.text, type = ref1.type;
      }
      if (type == null) {
        type = this.getCopyType(text != null ? text : '');
      }
      return {
        text: text,
        type: type
      };
    };

    RegisterManager.prototype.set = function() {
      var args, name, ref, selection, value;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      ref = [], name = ref[0], value = ref[1];
      switch (args.length) {
        case 1:
          value = args[0];
          break;
        case 2:
          name = args[0], value = args[1];
      }
      if (name == null) {
        name = this.getName();
      }
      if (!this.isValidName(name)) {
        return;
      }
      if (name === '"') {
        name = this.vimState.getConfig('defaultRegister');
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      selection = value.selection;
      delete value.selection;
      switch (name) {
        case '*':
        case '+':
          return this.writeClipboard(selection, value.text);
        case '_':
        case '%':
          return null;
        default:
          if (/^[A-Z]$/.test(name)) {
            return this.append(name.toLowerCase(), value);
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      if (!(register = this.data[name])) {
        this.data[name] = value;
        return;
      }
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.text += '\n';
          register.type = 'linewise';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.getName = function() {
      var ref;
      return (ref = this.name) != null ? ref : this.vimState.getConfig('defaultRegister');
    };

    RegisterManager.prototype.isDefaultName = function() {
      return this.getName() === this.vimState.getConfig('defaultRegister');
    };

    RegisterManager.prototype.hasName = function() {
      return this.name != null;
    };

    RegisterManager.prototype.setName = function(name) {
      var inputUI;
      if (name == null) {
        name = null;
      }
      if (name != null) {
        if (this.isValidName(name)) {
          return this.name = name;
        }
      } else {
        this.vimState.hover.set('"');
        inputUI = new Input(this.vimState);
        inputUI.onDidConfirm((function(_this) {
          return function(name1) {
            _this.name = name1;
            _this.vimState.toggleClassList('with-register', true);
            return _this.vimState.hover.set('"' + _this.name);
          };
        })(this));
        inputUI.onDidCancel((function(_this) {
          return function() {
            return _this.vimState.hover.reset();
          };
        })(this));
        return inputUI.focus(1);
      }
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    return RegisterManager;

  })();

  module.exports = RegisterManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9yZWdpc3Rlci1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0RBQUE7SUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFFUixTQUFBLEdBQVk7O0VBaUJOO0lBQ1MseUJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE1BQTBDLElBQUMsQ0FBQSxRQUEzQyxFQUFDLElBQUMsQ0FBQSxhQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsb0JBQUEsYUFBWCxFQUEwQixJQUFDLENBQUEsa0JBQUE7TUFDM0IsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsVUFBakI7TUFDUixJQUFDLENBQUEsdUJBQUQsR0FBMkIsSUFBSTtNQUMvQixJQUFDLENBQUEsb0JBQUQsR0FBd0IsSUFBSTtJQUpqQjs7OEJBTWIsS0FBQSxHQUFPLFNBQUE7TUFDTCxJQUFDLENBQUEsSUFBRCxHQUFRO2FBQ1IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFWLENBQTBCLGVBQTFCLEVBQTJDLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBM0M7SUFGSzs7OEJBSVAsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLHVCQUF1QixDQUFDLE9BQXpCLENBQWlDLFNBQUMsVUFBRDtlQUMvQixVQUFVLENBQUMsT0FBWCxDQUFBO01BRCtCLENBQWpDO01BRUEsSUFBQyxDQUFBLHVCQUF1QixDQUFDLEtBQXpCLENBQUE7TUFDQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsS0FBdEIsQ0FBQTthQUNBLE1BQW9ELEVBQXBELEVBQUMsSUFBQyxDQUFBLDhCQUFBLHVC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S0FBUixDQUFjLENBQWQsRUFYRjs7SUFETzs7OEJBY1QsV0FBQSxHQUFhLFNBQUMsSUFBRDtNQUNYLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakIsQ0FBQSxLQUEwQixJQUFJLENBQUMsTUFBTCxHQUFjLENBQTNDO2VBQ0UsV0FERjtPQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixDQUFBLEtBQTBCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBM0M7ZUFDSCxXQURHO09BQUEsTUFBQTtlQUdILGdCQUhHOztJQUhNOzs7Ozs7RUFRZixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXRKakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuSW5wdXQgPSByZXF1aXJlICcuL2lucHV0J1xuXG5SRUdJU1RFUlMgPSAvLy8gKFxuICA/OiBbYS16QS1aKislX1wiLl1cbikgLy8vXG5cbiMgVE9ETzogVmltIHN1cHBvcnQgZm9sbG93aW5nIHJlZ2lzdGVycy5cbiMgeDogY29tcGxldGUsIC06IHBhcnRpYWxseVxuIyAgW3hdIDEuIFRoZSB1bm5hbWVkIHJlZ2lzdGVyIFwiXCJcbiMgIFsgXSAyLiAxMCBudW1iZXJlZCByZWdpc3RlcnMgXCIwIHRvIFwiOVxuIyAgWyBdIDMuIFRoZSBzbWFsbCBkZWxldGUgcmVnaXN0ZXIgXCItXG4jICBbeF0gNC4gMjYgbmFtZWQgcmVnaXN0ZXJzIFwiYSB0byBcInogb3IgXCJBIHRvIFwiWlxuIyAgWy1dIDUuIHRocmVlIHJlYWQtb25seSByZWdpc3RlcnMgXCI6LCBcIi4sIFwiJVxuIyAgWyBdIDYuIGFsdGVybmF0ZSBidWZmZXIgcmVnaXN0ZXIgXCIjXG4jICBbIF0gNy4gdGhlIGV4cHJlc3Npb24gcmVnaXN0ZXIgXCI9XG4jICBbIF0gOC4gVGhlIHNlbGVjdGlvbiBhbmQgZHJvcCByZWdpc3RlcnMgXCIqLCBcIisgYW5kIFwiflxuIyAgW3hdIDkuIFRoZSBibGFjayBob2xlIHJlZ2lzdGVyIFwiX1xuIyAgWyBdIDEwLiBMYXN0IHNlYXJjaCBwYXR0ZXJuIHJlZ2lzdGVyIFwiL1xuXG5jbGFzcyBSZWdpc3Rlck1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGRhdGEgPSBAZ2xvYmFsU3RhdGUuZ2V0KCdyZWdpc3RlcicpXG4gICAgQHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbiA9IG5ldyBNYXBcblxuICByZXNldDogLT5cbiAgICBAbmFtZSA9IG51bGxcbiAgICBAdmltU3RhdGUudG9nZ2xlQ2xhc3NMaXN0KCd3aXRoLXJlZ2lzdGVyJywgQGhhc05hbWUoKSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5mb3JFYWNoIChkaXNwb3NhYmxlKSAtPlxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5jbGVhcigpXG4gICAge0BzdWJzY3JpcHRpb25CeVNlbGVjdGlvbiwgQGNsaXBib2FyZEJ5U2VsZWN0aW9ufSA9IHt9XG5cbiAgaXNWYWxpZE5hbWU6IChuYW1lKSAtPlxuICAgIFJFR0lTVEVSUy50ZXN0KG5hbWUpXG5cbiAgZ2V0VGV4dDogKG5hbWUsIHNlbGVjdGlvbikgLT5cbiAgICBAZ2V0KG5hbWUsIHNlbGVjdGlvbikudGV4dCA/ICcnXG5cbiAgcmVhZENsaXBib2FyZDogKHNlbGVjdGlvbj1udWxsKSAtPlxuICAgIGlmIHNlbGVjdGlvbj8uZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpIGFuZCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIHdyaXRlQ2xpcGJvYXJkOiAoc2VsZWN0aW9uPW51bGwsIHRleHQpIC0+XG4gICAgaWYgc2VsZWN0aW9uPy5lZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgYW5kIG5vdCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIGRpc3Bvc2FibGUgPSBzZWxlY3Rpb24ub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5kZWxldGUoc2VsZWN0aW9uKVxuICAgICAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uZGVsZXRlKHNlbGVjdGlvbilcbiAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBkaXNwb3NhYmxlKVxuXG4gICAgaWYgKHNlbGVjdGlvbiBpcyBudWxsKSBvciBzZWxlY3Rpb24uaXNMYXN0U2VsZWN0aW9uKClcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIHRleHQpIGlmIHNlbGVjdGlvbj9cblxuICBnZXQ6IChuYW1lLCBzZWxlY3Rpb24pIC0+XG4gICAgbmFtZSA/PSBAZ2V0TmFtZSgpXG4gICAgbmFtZSA9IEB2aW1TdGF0ZS5nZXRDb25maWcoJ2RlZmF1bHRSZWdpc3RlcicpIGlmIG5hbWUgaXMgJ1wiJ1xuXG4gICAgc3dpdGNoIG5hbWVcbiAgICAgIHdoZW4gJyonLCAnKycgdGhlbiB0ZXh0ID0gQHJlYWRDbGlwYm9hcmQoc2VsZWN0aW9uKVxuICAgICAgd2hlbiAnJScgdGhlbiB0ZXh0ID0gQGVkaXRvci5nZXRVUkkoKVxuICAgICAgd2hlbiAnXycgdGhlbiB0ZXh0ID0gJycgIyBCbGFja2hvbGUgYWx3YXlzIHJldHVybnMgbm90aGluZ1xuICAgICAgZWxzZVxuICAgICAgICB7dGV4dCwgdHlwZX0gPSBAZGF0YVtuYW1lLnRvTG93ZXJDYXNlKCldID8ge31cbiAgICB0eXBlID89IEBnZXRDb3B5VHlwZSh0ZXh0ID8gJycpXG4gICAge3RleHQsIHR5cGV9XG5cbiAgIyBQcml2YXRlOiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIHJlZ2lzdGVyLlxuICAjXG4gICMgbmFtZSAgLSBUaGUgbmFtZSBvZiB0aGUgcmVnaXN0ZXIgdG8gZmV0Y2guXG4gICMgdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0IHRoZSByZWdpc3RlciB0bywgd2l0aCBmb2xsb3dpbmcgcHJvcGVydGllcy5cbiAgIyAgdGV4dDogdGV4dCB0byBzYXZlIHRvIHJlZ2lzdGVyLlxuICAjICB0eXBlOiAob3B0aW9uYWwpIGlmIG9tbWl0ZWQgYXV0b21hdGljYWxseSBzZXQgZnJvbSB0ZXh0LlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBzZXQ6IChhcmdzLi4uKSAtPlxuICAgIFtuYW1lLCB2YWx1ZV0gPSBbXVxuICAgIHN3aXRjaCBhcmdzLmxlbmd0aFxuICAgICAgd2hlbiAxIHRoZW4gW3ZhbHVlXSA9IGFyZ3NcbiAgICAgIHdoZW4gMiB0aGVuIFtuYW1lLCB2YWx1ZV0gPSBhcmdzXG5cbiAgICBuYW1lID89IEBnZXROYW1lKClcbiAgICByZXR1cm4gdW5sZXNzIEBpc1ZhbGlkTmFtZShuYW1lKVxuICAgIG5hbWUgPSBAdmltU3RhdGUuZ2V0Q29uZmlnKCdkZWZhdWx0UmVnaXN0ZXInKSBpZiBuYW1lIGlzICdcIidcbiAgICB2YWx1ZS50eXBlID89IEBnZXRDb3B5VHlwZSh2YWx1ZS50ZXh0KVxuXG4gICAgc2VsZWN0aW9uID0gdmFsdWUuc2VsZWN0aW9uXG4gICAgZGVsZXRlIHZhbHVlLnNlbGVjdGlvblxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuICcqJywgJysnIHRoZW4gQHdyaXRlQ2xpcGJvYXJkKHNlbGVjdGlvbiwgdmFsdWUudGV4dClcbiAgICAgIHdoZW4gJ18nLCAnJScgdGhlbiBudWxsXG4gICAgICBlbHNlXG4gICAgICAgIGlmIC9eW0EtWl0kLy50ZXN0KG5hbWUpXG4gICAgICAgICAgQGFwcGVuZChuYW1lLnRvTG93ZXJDYXNlKCksIHZhbHVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRhdGFbbmFtZV0gPSB2YWx1ZVxuXG4gICMgUHJpdmF0ZTogYXBwZW5kIGEgdmFsdWUgaW50byBhIGdpdmVuIHJlZ2lzdGVyXG4gICMgbGlrZSBzZXRSZWdpc3RlciwgYnV0IGFwcGVuZHMgdGhlIHZhbHVlXG4gIGFwcGVuZDogKG5hbWUsIHZhbHVlKSAtPlxuICAgIHVubGVzcyByZWdpc3RlciA9IEBkYXRhW25hbWVdXG4gICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG4gICAgICByZXR1cm5cblxuICAgIGlmICdsaW5ld2lzZScgaW4gW3JlZ2lzdGVyLnR5cGUsIHZhbHVlLnR5cGVdXG4gICAgICBpZiByZWdpc3Rlci50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICByZWdpc3Rlci50ZXh0ICs9ICdcXG4nXG4gICAgICAgIHJlZ2lzdGVyLnR5cGUgPSAnbGluZXdpc2UnXG4gICAgICBpZiB2YWx1ZS50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICB2YWx1ZS50ZXh0ICs9ICdcXG4nXG4gICAgcmVnaXN0ZXIudGV4dCArPSB2YWx1ZS50ZXh0XG5cbiAgZ2V0TmFtZTogLT5cbiAgICBAbmFtZSA/IEB2aW1TdGF0ZS5nZXRDb25maWcoJ2RlZmF1bHRSZWdpc3RlcicpXG5cbiAgaXNEZWZhdWx0TmFtZTogLT5cbiAgICBAZ2V0TmFtZSgpIGlzIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2RlZmF1bHRSZWdpc3RlcicpXG5cbiAgaGFzTmFtZTogLT5cbiAgICBAbmFtZT9cblxuICBzZXROYW1lOiAobmFtZT1udWxsKSAtPlxuICAgIGlmIG5hbWU/XG4gICAgICBAbmFtZSA9IG5hbWUgaWYgQGlzVmFsaWROYW1lKG5hbWUpXG4gICAgZWxzZVxuICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldCgnXCInKVxuXG4gICAgICBpbnB1dFVJID0gbmV3IElucHV0KEB2aW1TdGF0ZSlcbiAgICAgIGlucHV0VUkub25EaWRDb25maXJtIChAbmFtZSkgPT5cbiAgICAgICAgQHZpbVN0YXRlLnRvZ2dsZUNsYXNzTGlzdCgnd2l0aC1yZWdpc3RlcicsIHRydWUpXG4gICAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoJ1wiJyArIEBuYW1lKVxuICAgICAgaW5wdXRVSS5vbkRpZENhbmNlbCA9PlxuICAgICAgICBAdmltU3RhdGUuaG92ZXIucmVzZXQoKVxuICAgICAgaW5wdXRVSS5mb2N1cygxKVxuXG4gIGdldENvcHlUeXBlOiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0Lmxhc3RJbmRleE9mKFwiXFxuXCIpIGlzIHRleHQubGVuZ3RoIC0gMVxuICAgICAgJ2xpbmV3aXNlJ1xuICAgIGVsc2UgaWYgdGV4dC5sYXN0SW5kZXhPZihcIlxcclwiKSBpcyB0ZXh0Lmxlbmd0aCAtIDFcbiAgICAgICdsaW5ld2lzZSdcbiAgICBlbHNlXG4gICAgICAnY2hhcmFjdGVyd2lzZSdcblxubW9kdWxlLmV4cG9ydHMgPSBSZWdpc3Rlck1hbmFnZXJcbiJdfQ==
