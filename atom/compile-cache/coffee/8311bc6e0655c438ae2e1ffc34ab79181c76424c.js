(function() {
  var CompositeDisposable, Emitter, getEditorState, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  getEditorState = null;

  module.exports = {
    activate: function() {
      var self;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      self = this;
      return this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
        'vim-mode-plus-ex-mode:open': function() {
          return self.toggle(this.getModel(), 'normalCommands');
        },
        'vim-mode-plus-ex-mode:toggle-setting': function() {
          return self.toggle(this.getModel(), 'toggleCommands');
        }
      }));
    },
    toggle: function(editor, commandKind) {
      return this.getEditorState(editor).then((function(_this) {
        return function(vimState) {
          return _this.getView().toggle(vimState, commandKind);
        };
      })(this));
    },
    getEditorState: function(editor) {
      if (getEditorState != null) {
        return Promise.resolve(getEditorState(editor));
      } else {
        return new Promise((function(_this) {
          return function(resolve) {
            return _this.onDidConsumeVim(function() {
              return resolve(getEditorState(editor));
            });
          };
        })(this));
      }
    },
    deactivate: function() {
      var ref1, ref2;
      this.subscriptions.dispose();
      if ((ref1 = this.view) != null) {
        if (typeof ref1.destroy === "function") {
          ref1.destroy();
        }
      }
      return ref2 = {}, this.subscriptions = ref2.subscriptions, this.view = ref2.view, ref2;
    },
    getView: function() {
      return this.view != null ? this.view : this.view = new (require('./view'));
    },
    onDidConsumeVim: function(fn) {
      return this.emitter.on('did-consume-vim', fn);
    },
    consumeVim: function(service) {
      var Base, Motion, MoveToLineAndColumn;
      getEditorState = service.getEditorState, Base = service.Base;
      Motion = MoveToLineAndColumn = (function(superClass) {
        extend(MoveToLineAndColumn, superClass);

        function MoveToLineAndColumn() {
          return MoveToLineAndColumn.__super__.constructor.apply(this, arguments);
        }

        MoveToLineAndColumn.extend();

        MoveToLineAndColumn.commandPrefix = 'vim-mode-plus-user';

        MoveToLineAndColumn.prototype.wise = 'characterwise';

        MoveToLineAndColumn.prototype.column = null;

        MoveToLineAndColumn.prototype.moveCursor = function(cursor) {
          var point;
          MoveToLineAndColumn.__super__.moveCursor.apply(this, arguments);
          point = [cursor.getBufferRow(), this.column - 1];
          return cursor.setBufferPosition(point);
        };

        return MoveToLineAndColumn;

      })(Base.getClass('MoveToFirstLine'));
      return this.emitter.emit('did-consume-vim');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzLWV4LW1vZGUvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpREFBQTtJQUFBOzs7RUFBQSxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBQ1YsY0FBQSxHQUFpQjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQSxHQUFPO2FBQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw4QkFBbEIsRUFDakI7UUFBQSw0QkFBQSxFQUE4QixTQUFBO2lCQUM1QixJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBWixFQUF5QixnQkFBekI7UUFENEIsQ0FBOUI7UUFFQSxzQ0FBQSxFQUF3QyxTQUFBO2lCQUN0QyxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBWixFQUF5QixnQkFBekI7UUFEc0MsQ0FGeEM7T0FEaUIsQ0FBbkI7SUFKUSxDQUFWO0lBVUEsTUFBQSxFQUFRLFNBQUMsTUFBRCxFQUFTLFdBQVQ7YUFDTixJQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQixDQUF1QixDQUFDLElBQXhCLENBQTZCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFEO2lCQUMzQixLQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxNQUFYLENBQWtCLFFBQWxCLEVBQTRCLFdBQTVCO1FBRDJCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtJQURNLENBVlI7SUFjQSxjQUFBLEVBQWdCLFNBQUMsTUFBRDtNQUNkLElBQUcsc0JBQUg7ZUFDRSxPQUFPLENBQUMsT0FBUixDQUFnQixjQUFBLENBQWUsTUFBZixDQUFoQixFQURGO09BQUEsTUFBQTtlQUdNLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsT0FBRDttQkFDVixLQUFDLENBQUEsZUFBRCxDQUFpQixTQUFBO3FCQUNmLE9BQUEsQ0FBUSxjQUFBLENBQWUsTUFBZixDQUFSO1lBRGUsQ0FBakI7VUFEVTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixFQUhOOztJQURjLENBZGhCO0lBc0JBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBOzs7Y0FDSyxDQUFFOzs7YUFDUCxPQUEwQixFQUExQixFQUFDLElBQUMsQ0FBQSxxQkFBQSxhQUFGLEVBQWlCLElBQUMsQ0FBQSxZQUFBLElBQWxCLEVBQUE7SUFIVSxDQXRCWjtJQTJCQSxPQUFBLEVBQVMsU0FBQTtpQ0FDUCxJQUFDLENBQUEsT0FBRCxJQUFDLENBQUEsT0FBUSxJQUFJLENBQUMsT0FBQSxDQUFRLFFBQVIsQ0FBRDtJQUROLENBM0JUO0lBOEJBLGVBQUEsRUFBaUIsU0FBQyxFQUFEO2FBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksaUJBQVosRUFBK0IsRUFBL0I7SUFEZSxDQTlCakI7SUFpQ0EsVUFBQSxFQUFZLFNBQUMsT0FBRDtBQUNWLFVBQUE7TUFBQyx1Q0FBRCxFQUFpQjtNQUNqQixNQUFBLEdBR007Ozs7Ozs7UUFDSixtQkFBQyxDQUFBLE1BQUQsQ0FBQTs7UUFDQSxtQkFBQyxDQUFBLGFBQUQsR0FBZ0I7O3NDQUNoQixJQUFBLEdBQU07O3NDQUNOLE1BQUEsR0FBUTs7c0NBRVIsVUFBQSxHQUFZLFNBQUMsTUFBRDtBQUNWLGNBQUE7VUFBQSxxREFBQSxTQUFBO1VBQ0EsS0FBQSxHQUFRLENBQUMsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFELEVBQXdCLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBbEM7aUJBQ1IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQXpCO1FBSFU7Ozs7U0FOb0IsSUFBSSxDQUFDLFFBQUwsQ0FBYyxpQkFBZDthQVdsQyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxpQkFBZDtJQWhCVSxDQWpDWjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5nZXRFZGl0b3JTdGF0ZSA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHNlbGYgPSB0aGlzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJyxcbiAgICAgICd2aW0tbW9kZS1wbHVzLWV4LW1vZGU6b3Blbic6IC0+XG4gICAgICAgIHNlbGYudG9nZ2xlKEBnZXRNb2RlbCgpLCAnbm9ybWFsQ29tbWFuZHMnKVxuICAgICAgJ3ZpbS1tb2RlLXBsdXMtZXgtbW9kZTp0b2dnbGUtc2V0dGluZyc6IC0+XG4gICAgICAgIHNlbGYudG9nZ2xlKEBnZXRNb2RlbCgpLCAndG9nZ2xlQ29tbWFuZHMnKVxuXG4gIHRvZ2dsZTogKGVkaXRvciwgY29tbWFuZEtpbmQpIC0+XG4gICAgQGdldEVkaXRvclN0YXRlKGVkaXRvcikudGhlbiAodmltU3RhdGUpID0+XG4gICAgICBAZ2V0VmlldygpLnRvZ2dsZSh2aW1TdGF0ZSwgY29tbWFuZEtpbmQpXG5cbiAgZ2V0RWRpdG9yU3RhdGU6IChlZGl0b3IpIC0+XG4gICAgaWYgZ2V0RWRpdG9yU3RhdGU/XG4gICAgICBQcm9taXNlLnJlc29sdmUoZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKSlcbiAgICBlbHNlXG4gICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgICAgQG9uRGlkQ29uc3VtZVZpbSAtPlxuICAgICAgICAgIHJlc29sdmUoZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEB2aWV3Py5kZXN0cm95PygpXG4gICAge0BzdWJzY3JpcHRpb25zLCBAdmlld30gPSB7fVxuXG4gIGdldFZpZXc6IC0+XG4gICAgQHZpZXcgPz0gbmV3IChyZXF1aXJlKCcuL3ZpZXcnKSlcblxuICBvbkRpZENvbnN1bWVWaW06IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNvbnN1bWUtdmltJywgZm4pXG5cbiAgY29uc3VtZVZpbTogKHNlcnZpY2UpIC0+XG4gICAge2dldEVkaXRvclN0YXRlLCBCYXNlfSA9IHNlcnZpY2VcbiAgICBNb3Rpb24gPVxuXG4gICAgIyBrZXltYXA6IGcgZ1xuICAgIGNsYXNzIE1vdmVUb0xpbmVBbmRDb2x1bW4gZXh0ZW5kcyBCYXNlLmdldENsYXNzKCdNb3ZlVG9GaXJzdExpbmUnKVxuICAgICAgQGV4dGVuZCgpXG4gICAgICBAY29tbWFuZFByZWZpeDogJ3ZpbS1tb2RlLXBsdXMtdXNlcidcbiAgICAgIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgY29sdW1uOiBudWxsXG5cbiAgICAgIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgICAgIHN1cGVyXG4gICAgICAgIHBvaW50ID0gW2N1cnNvci5nZXRCdWZmZXJSb3coKSwgQGNvbHVtbiAtIDFdXG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jb25zdW1lLXZpbScpXG4iXX0=
