(function() {
  var ExCommandModeInputElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ExCommandModeInputElement = (function(superClass) {
    extend(ExCommandModeInputElement, superClass);

    function ExCommandModeInputElement() {
      return ExCommandModeInputElement.__super__.constructor.apply(this, arguments);
    }

    ExCommandModeInputElement.prototype.createdCallback = function() {
      this.className = "command-mode-input";
      this.editorContainer = document.createElement("div");
      this.editorContainer.className = "editor-container";
      return this.appendChild(this.editorContainer);
    };

    ExCommandModeInputElement.prototype.initialize = function(viewModel, opts) {
      var ref;
      this.viewModel = viewModel;
      if (opts == null) {
        opts = {};
      }
      if (opts["class"] != null) {
        this.editorContainer.classList.add(opts["class"]);
      }
      if (opts.hidden) {
        this.editorContainer.style.height = "0px";
      }
      this.editorElement = document.createElement("atom-text-editor");
      this.editorElement.classList.add('editor');
      this.editorElement.getModel().setMini(true);
      this.editorElement.setAttribute('mini', '');
      this.editorContainer.appendChild(this.editorElement);
      this.singleChar = opts.singleChar;
      this.defaultText = (ref = opts.defaultText) != null ? ref : '';
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        priority: 100
      });
      this.focus();
      this.handleEvents();
      return this;
    };

    ExCommandModeInputElement.prototype.handleEvents = function() {
      if (this.singleChar != null) {
        this.editorElement.getModel().getBuffer().onDidChange((function(_this) {
          return function(e) {
            if (e.newText) {
              return _this.confirm();
            }
          };
        })(this));
      } else {
        atom.commands.add(this.editorElement, 'editor:newline', this.confirm.bind(this));
        atom.commands.add(this.editorElement, 'core:backspace', this.backspace.bind(this));
      }
      atom.commands.add(this.editorElement, 'core:confirm', this.confirm.bind(this));
      atom.commands.add(this.editorElement, 'core:cancel', this.cancel.bind(this));
      return atom.commands.add(this.editorElement, 'blur', this.cancel.bind(this));
    };

    ExCommandModeInputElement.prototype.backspace = function() {
      if (!this.editorElement.getModel().getText().length) {
        return this.cancel();
      }
    };

    ExCommandModeInputElement.prototype.confirm = function() {
      this.value = this.editorElement.getModel().getText() || this.defaultText;
      this.viewModel.confirm(this);
      return this.removePanel();
    };

    ExCommandModeInputElement.prototype.focus = function() {
      return this.editorElement.focus();
    };

    ExCommandModeInputElement.prototype.cancel = function(e) {
      this.viewModel.cancel(this);
      return this.removePanel();
    };

    ExCommandModeInputElement.prototype.removePanel = function() {
      atom.workspace.getActivePane().activate();
      return this.panel.destroy();
    };

    return ExCommandModeInputElement;

  })(HTMLDivElement);

  module.exports = document.registerElement("ex-command-mode-input", {
    "extends": "div",
    prototype: ExCommandModeInputElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC1ub3JtYWwtbW9kZS1pbnB1dC1lbGVtZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUJBQUE7SUFBQTs7O0VBQU07Ozs7Ozs7d0NBQ0osZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUViLElBQUMsQ0FBQSxlQUFELEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ25CLElBQUMsQ0FBQSxlQUFlLENBQUMsU0FBakIsR0FBNkI7YUFFN0IsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsZUFBZDtJQU5lOzt3Q0FRakIsVUFBQSxHQUFZLFNBQUMsU0FBRCxFQUFhLElBQWI7QUFDVixVQUFBO01BRFcsSUFBQyxDQUFBLFlBQUQ7O1FBQVksT0FBTzs7TUFDOUIsSUFBRyxxQkFBSDtRQUNFLElBQUMsQ0FBQSxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQTNCLENBQStCLElBQUksRUFBQyxLQUFELEVBQW5DLEVBREY7O01BR0EsSUFBRyxJQUFJLENBQUMsTUFBUjtRQUNFLElBQUMsQ0FBQSxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQXZCLEdBQWdDLE1BRGxDOztNQUdBLElBQUMsQ0FBQSxhQUFELEdBQWlCLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QjtNQUNqQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixRQUE3QjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsUUFBZixDQUFBLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsSUFBbEM7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLFlBQWYsQ0FBNEIsTUFBNUIsRUFBb0MsRUFBcEM7TUFDQSxJQUFDLENBQUEsZUFBZSxDQUFDLFdBQWpCLENBQTZCLElBQUMsQ0FB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QkFBeUIsQ0FBQyxTQURyQztHQURGO0FBakVBIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRXhDb21tYW5kTW9kZUlucHV0RWxlbWVudCBleHRlbmRzIEhUTUxEaXZFbGVtZW50XG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICBAY2xhc3NOYW1lID0gXCJjb21tYW5kLW1vZGUtaW5wdXRcIlxuXG4gICAgQGVkaXRvckNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICBAZWRpdG9yQ29udGFpbmVyLmNsYXNzTmFtZSA9IFwiZWRpdG9yLWNvbnRhaW5lclwiXG5cbiAgICBAYXBwZW5kQ2hpbGQoQGVkaXRvckNvbnRhaW5lcilcblxuICBpbml0aWFsaXplOiAoQHZpZXdNb2RlbCwgb3B0cyA9IHt9KSAtPlxuICAgIGlmIG9wdHMuY2xhc3M/XG4gICAgICBAZWRpdG9yQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQob3B0cy5jbGFzcylcblxuICAgIGlmIG9wdHMuaGlkZGVuXG4gICAgICBAZWRpdG9yQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IFwiMHB4XCJcblxuICAgIEBlZGl0b3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImF0b20tdGV4dC1lZGl0b3JcIlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2VkaXRvcicpXG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5zZXRNaW5pKHRydWUpXG4gICAgQGVkaXRvckVsZW1lbnQuc2V0QXR0cmlidXRlKCdtaW5pJywgJycpXG4gICAgQGVkaXRvckNvbnRhaW5lci5hcHBlbmRDaGlsZChAZWRpdG9yRWxlbWVudClcblxuICAgIEBzaW5nbGVDaGFyID0gb3B0cy5zaW5nbGVDaGFyXG4gICAgQGRlZmF1bHRUZXh0ID0gb3B0cy5kZWZhdWx0VGV4dCA/ICcnXG5cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCBwcmlvcml0eTogMTAwKVxuXG4gICAgQGZvY3VzKClcbiAgICBAaGFuZGxlRXZlbnRzKClcblxuICAgIHRoaXNcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgaWYgQHNpbmdsZUNoYXI/XG4gICAgICBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlIChlKSA9PlxuICAgICAgICBAY29uZmlybSgpIGlmIGUubmV3VGV4dFxuICAgIGVsc2VcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCAnZWRpdG9yOm5ld2xpbmUnLCBAY29uZmlybS5iaW5kKHRoaXMpKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoQGVkaXRvckVsZW1lbnQsICdjb3JlOmJhY2tzcGFjZScsIEBiYWNrc3BhY2UuYmluZCh0aGlzKSlcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCAnY29yZTpjb25maXJtJywgQGNvbmZpcm0uYmluZCh0aGlzKSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2NvcmU6Y2FuY2VsJywgQGNhbmNlbC5iaW5kKHRoaXMpKVxuICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCAnYmx1cicsIEBjYW5jZWwuYmluZCh0aGlzKSlcblxuICBiYWNrc3BhY2U6IC0+XG4gICAgIyBwcmVzc2luZyBiYWNrc3BhY2Ugb3ZlciBlbXB0eSBgOmAgc2hvdWxkIGNhbmNlbCBleC1tb2RlXG4gICAgQGNhbmNlbCgpIHVubGVzcyBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmdldFRleHQoKS5sZW5ndGhcblxuICBjb25maXJtOiAtPlxuICAgIEB2YWx1ZSA9IEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuZ2V0VGV4dCgpIG9yIEBkZWZhdWx0VGV4dFxuICAgIEB2aWV3TW9kZWwuY29uZmlybSh0aGlzKVxuICAgIEByZW1vdmVQYW5lbCgpXG5cbiAgZm9jdXM6IC0+XG4gICAgQGVkaXRvckVsZW1lbnQuZm9jdXMoKVxuXG4gIGNhbmNlbDogKGUpIC0+XG4gICAgQHZpZXdNb2RlbC5jYW5jZWwodGhpcylcbiAgICBAcmVtb3ZlUGFuZWwoKVxuXG4gIHJlbW92ZVBhbmVsOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpXG4gICAgQHBhbmVsLmRlc3Ryb3koKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5kb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoXCJleC1jb21tYW5kLW1vZGUtaW5wdXRcIlxuICBleHRlbmRzOiBcImRpdlwiLFxuICBwcm90b3R5cGU6IEV4Q29tbWFuZE1vZGVJbnB1dEVsZW1lbnQucHJvdG90eXBlXG4pXG4iXX0=
