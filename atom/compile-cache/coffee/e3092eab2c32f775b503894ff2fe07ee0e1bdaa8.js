(function() {
  var HoverManager, swrap;

  swrap = require('./selection-wrapper');

  module.exports = HoverManager = (function() {
    function HoverManager(vimState) {
      var ref;
      this.vimState = vimState;
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.container = document.createElement('div');
      this.decorationOptions = {
        type: 'overlay',
        item: this.container
      };
      this.reset();
    }

    HoverManager.prototype.getPoint = function() {
      var selection;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return this.vimState.getLastBlockwiseSelection().getHeadSelection().getHeadBufferPosition();
      } else {
        selection = this.editor.getLastSelection();
        return swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      }
    };

    HoverManager.prototype.set = function(text, point, options) {
      var ref, ref1;
      if (point == null) {
        point = this.getPoint();
      }
      if (options == null) {
        options = {};
      }
      if (this.marker == null) {
        this.marker = this.editor.markBufferPosition(point);
        this.editor.decorateMarker(this.marker, this.decorationOptions);
      }
      if ((ref = options.classList) != null ? ref.length : void 0) {
        (ref1 = this.container.classList).add.apply(ref1, options.classList);
      }
      return this.container.textContent = text;
    };

    HoverManager.prototype.reset = function() {
      var ref;
      this.container.className = 'vim-mode-plus-hover';
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return this.marker = null;
    };

    HoverManager.prototype.destroy = function() {
      this.vimState = {}.vimState;
      return this.reset();
    };

    return HoverManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9ob3Zlci1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1Msc0JBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLE1BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxhQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsb0JBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2IsSUFBQyxDQUFBLGlCQUFELEdBQXFCO1FBQUMsSUFBQSxFQUFNLFNBQVA7UUFBa0IsSUFBQSxFQUFNLElBQUMsQ0FBQSxTQUF6Qjs7TUFDckIsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUpXOzsyQkFNYixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixRQUFqQixFQUEyQixXQUEzQixDQUFIO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyx5QkFBVixDQUFBLENBQXFDLENBQUMsZ0JBQXRDLENBQUEsQ0FBd0QsQ0FBQyxxQkFBekQsQ0FBQSxFQURGO09BQUEsTUFBQTtRQUdFLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUE7ZUFDWixLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLG9CQUFqQixDQUFzQyxNQUF0QyxFQUE4QztVQUFBLElBQUEsRUFBTSxDQUFDLFVBQUQsRUFBYSxXQUFiLENBQU47U0FBOUMsRUFKRjs7SUFEUTs7MkJBT1YsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBMEIsT0FBMUI7QUFDSCxVQUFBOztRQURVLFFBQU0sSUFBQyxDQUFBLFFBQUQsQ0FBQTs7O1FBQWEsVUFBUTs7TUFDckMsSUFBTyxtQkFBUDtRQUNFLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixLQUEzQjtRQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixJQUFDLENBQUEsTUFBeEIsRUFBZ0MsSUFBQyxDQUFBLGlCQUFqQyxFQUZGOztNQUlBLDJDQUFvQixDQUFFLGVBQXRCO1FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsQ0FBb0IsQ0FBQyxHQUFyQixhQUF5QixPQUFPLENBQUMsU0FBakMsRUFERjs7YUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsR0FBeUI7SUFQdEI7OzJCQVNMLEtBQUEsR0FBTyxTQUFBO0FBQ0wsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1Qjs7V0FDaEIsQ0FBRSxPQUFULENBQUE7O2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUhMOzsyQkFLUCxPQUFBLEdBQVMsU0FBQTtNQUNOLElBQUMsQ0FBQSxXQUFZLEdBQVo7YUFDRixJQUFDLENBQUEsS0FBRCxDQUFBO0lBRk87Ozs7O0FBL0JYIiwic291cmNlc0NvbnRlbnQiOlsic3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBIb3Zlck1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBkZWNvcmF0aW9uT3B0aW9ucyA9IHt0eXBlOiAnb3ZlcmxheScsIGl0ZW06IEBjb250YWluZXJ9XG4gICAgQHJlc2V0KClcblxuICBnZXRQb2ludDogLT5cbiAgICBpZiBAdmltU3RhdGUuaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuZ2V0SGVhZFNlbGVjdGlvbigpLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuXG4gIHNldDogKHRleHQsIHBvaW50PUBnZXRQb2ludCgpLCBvcHRpb25zPXt9KSAtPlxuICAgIHVubGVzcyBAbWFya2VyP1xuICAgICAgQG1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihAbWFya2VyLCBAZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICBpZiBvcHRpb25zLmNsYXNzTGlzdD8ubGVuZ3RoXG4gICAgICBAY29udGFpbmVyLmNsYXNzTGlzdC5hZGQob3B0aW9ucy5jbGFzc0xpc3QuLi4pXG4gICAgQGNvbnRhaW5lci50ZXh0Q29udGVudCA9IHRleHRcblxuICByZXNldDogLT5cbiAgICBAY29udGFpbmVyLmNsYXNzTmFtZSA9ICd2aW0tbW9kZS1wbHVzLWhvdmVyJ1xuICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgIEBtYXJrZXIgPSBudWxsXG5cbiAgZGVzdHJveTogLT5cbiAgICB7QHZpbVN0YXRlfSA9IHt9XG4gICAgQHJlc2V0KClcbiJdfQ==
