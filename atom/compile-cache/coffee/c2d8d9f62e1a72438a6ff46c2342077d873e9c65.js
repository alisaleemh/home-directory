(function() {
  var CompositeDisposable, HighlightedAreaView;

  CompositeDisposable = require("atom").CompositeDisposable;

  HighlightedAreaView = require('./highlighted-area-view');

  module.exports = {
    config: {
      onlyHighlightWholeWords: {
        type: 'boolean',
        "default": true
      },
      hideHighlightOnSelectedWord: {
        type: 'boolean',
        "default": false
      },
      ignoreCase: {
        type: 'boolean',
        "default": false
      },
      lightTheme: {
        type: 'boolean',
        "default": false
      },
      highlightBackground: {
        type: 'boolean',
        "default": false
      },
      minimumLength: {
        type: 'integer',
        "default": 0
      },
      timeout: {
        type: 'integer',
        "default": 20,
        description: 'Defers searching for matching strings for X ms'
      },
      showInStatusBar: {
        type: 'boolean',
        "default": true,
        description: 'Show how many matches there are'
      },
      highlightInPanes: {
        type: 'boolean',
        "default": true,
        description: 'Highlight selection in another panes'
      }
    },
    areaView: null,
    activate: function(state) {
      this.areaView = new HighlightedAreaView();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add("atom-workspace", {
        'highlight-selected:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.areaView) != null) {
        ref.destroy();
      }
      this.areaView = null;
      if ((ref1 = this.subscriptions) != null) {
        ref1.dispose();
      }
      return this.subscriptions = null;
    },
    provideHighlightSelectedV1: function() {
      return this.areaView;
    },
    consumeStatusBar: function(statusBar) {
      return this.areaView.setStatusBar(statusBar);
    },
    toggle: function() {
      if (this.areaView.disabled) {
        return this.areaView.enable();
      } else {
        return this.areaView.disable();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9oaWdobGlnaHQtc2VsZWN0ZWQvbGliL2hpZ2hsaWdodC1zZWxlY3RlZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSOztFQUV0QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsdUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BREY7TUFHQSwyQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FKRjtNQU1BLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BUEY7TUFTQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQVZGO01BWUEsbUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BYkY7TUFlQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FEVDtPQWhCRjtNQWtCQSxPQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSxnREFGYjtPQW5CRjtNQXNCQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxpQ0FGYjtPQXZCRjtNQTBCQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsc0NBRmI7T0EzQkY7S0FERjtJQWdDQSxRQUFBLEVBQVUsSUFoQ1Y7SUFrQ0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsbUJBQUEsQ0FBQTtNQUNoQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO2FBRXJCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2Y7UUFBQSwyQkFBQSxFQUE2QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0I7T0FEZSxDQUFuQjtJQUpRLENBbENWO0lBeUNBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7V0FBUyxDQUFFLE9BQVgsQ0FBQTs7TUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZOztZQUNFLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUpQLENBekNaO0lBK0NBLDBCQUFBLEVBQTRCLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSixDQS9DNUI7SUFpREEsZ0JBQUEsRUFBa0IsU0FBQyxTQUFEO2FBQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixTQUF2QjtJQURnQixDQWpEbEI7SUFvREEsTUFBQSxFQUFRLFNBQUE7TUFDTixJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBYjtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQUEsRUFIRjs7SUFETSxDQXBEUjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgXCJhdG9tXCJcbkhpZ2hsaWdodGVkQXJlYVZpZXcgPSByZXF1aXJlICcuL2hpZ2hsaWdodGVkLWFyZWEtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgb25seUhpZ2hsaWdodFdob2xlV29yZHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBoaWRlSGlnaGxpZ2h0T25TZWxlY3RlZFdvcmQ6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgaWdub3JlQ2FzZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBsaWdodFRoZW1lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGhpZ2hsaWdodEJhY2tncm91bmQ6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgbWluaW11bUxlbmd0aDpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMFxuICAgIHRpbWVvdXQ6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDIwXG4gICAgICBkZXNjcmlwdGlvbjogJ0RlZmVycyBzZWFyY2hpbmcgZm9yIG1hdGNoaW5nIHN0cmluZ3MgZm9yIFggbXMnXG4gICAgc2hvd0luU3RhdHVzQmFyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgaG93IG1hbnkgbWF0Y2hlcyB0aGVyZSBhcmUnXG4gICAgaGlnaGxpZ2h0SW5QYW5lczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdIaWdobGlnaHQgc2VsZWN0aW9uIGluIGFub3RoZXIgcGFuZXMnXG5cbiAgYXJlYVZpZXc6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBhcmVhVmlldyA9IG5ldyBIaWdobGlnaHRlZEFyZWFWaWV3KClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLFxuICAgICAgICAnaGlnaGxpZ2h0LXNlbGVjdGVkOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGFyZWFWaWV3Py5kZXN0cm95KClcbiAgICBAYXJlYVZpZXcgPSBudWxsXG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG4gIHByb3ZpZGVIaWdobGlnaHRTZWxlY3RlZFYxOiAtPiBAYXJlYVZpZXdcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyKSAtPlxuICAgIEBhcmVhVmlldy5zZXRTdGF0dXNCYXIgc3RhdHVzQmFyXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBhcmVhVmlldy5kaXNhYmxlZFxuICAgICAgQGFyZWFWaWV3LmVuYWJsZSgpXG4gICAgZWxzZVxuICAgICAgQGFyZWFWaWV3LmRpc2FibGUoKVxuIl19
