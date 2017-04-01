(function() {
  var $, $$, SelectListView, View, _, fuzzaldrin, highlightMatches, humanize, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom-space-pen-views'), SelectListView = ref.SelectListView, $ = ref.$, $$ = ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  ref1 = require('./utils'), humanize = ref1.humanize, highlightMatches = ref1.highlightMatches;

  module.exports = View = (function(superClass) {
    extend(View, superClass);

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View.prototype.initialInput = null;

    View.prototype.itemsCache = null;

    View.prototype.schedulePopulateList = function() {
      if (this.initialInput) {
        if (this.isOnDom()) {
          this.populateList();
        }
        return this.initialInput = false;
      } else {
        return View.__super__.schedulePopulateList.apply(this, arguments);
      }
    };

    View.prototype.initialize = function() {
      this.commands = require('./commands');
      this.addClass('vim-mode-plus-ex-mode');
      return View.__super__.initialize.apply(this, arguments);
    };

    View.prototype.getFilterKey = function() {
      return 'displayName';
    };

    View.prototype.cancelled = function() {
      return this.hide();
    };

    View.prototype.toggle = function(vimState, commandKind) {
      var ref2, ref3;
      this.vimState = vimState;
      if ((ref2 = this.panel) != null ? ref2.isVisible() : void 0) {
        return this.cancel();
      } else {
        ref3 = this.vimState, this.editorElement = ref3.editorElement, this.editor = ref3.editor;
        return this.show(commandKind);
      }
    };

    View.prototype.show = function(commandKind) {
      this.initialInput = true;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(this.getItemsForKind(commandKind));
      return this.focusFilterEditor();
    };

    View.prototype.getItemsForKind = function(kind) {
      var commands, items;
      if (this.itemsCache == null) {
        this.itemsCache = {};
      }
      if (kind in this.itemsCache) {
        return this.itemsCache[kind];
      } else {
        commands = _.keys(this.commands[kind]);
        items = commands.map((function(_this) {
          return function(name) {
            return _this.getItem(kind, name);
          };
        })(this));
        this.itemsCache[kind] = items;
        return items;
      }
    };

    View.prototype.getItem = function(kind, name) {
      var displayName;
      if (kind === 'toggleCommands' || kind === 'numberCommands') {
        displayName = humanize(name);
      } else {
        displayName = name;
      }
      return {
        name: name,
        kind: kind,
        displayName: displayName
      };
    };

    View.prototype.hide = function() {
      var ref2;
      return (ref2 = this.panel) != null ? ref2.hide() : void 0;
    };

    View.prototype.getFallBackItemsForQuery = function(query) {
      var filterQuery, item, items;
      items = [];
      if (/^!/.test(query)) {
        filterQuery = query.slice(1);
        items = this.getItemsForKind('toggleCommands');
        items = fuzzaldrin.filter(items, filterQuery, {
          key: this.getFilterKey()
        });
      } else if (/^[+-\d]/.test(query)) {
        if (item = this.getNumberCommandItem(query)) {
          items.push(item);
        }
      }
      return items;
    };

    View.prototype.getNumberCommandItem = function(query) {
      var item, match, name, options;
      if (match = query.match(/^(\d+)+$/)) {
        name = 'moveToLine';
        options = {
          row: Number(match[1])
        };
      } else if (match = query.match(/^(\d+)%$/)) {
        name = 'moveToLineByPercent';
        options = {
          percent: Number(match[1])
        };
      } else if (match = query.match(/^(\d+):(\d+)$/)) {
        name = 'moveToLineAndColumn';
        options = {
          row: Number(match[1]),
          column: Number(match[2])
        };
      } else if (match = query.match(/^([+-]\d+)$/)) {
        name = 'moveToRelativeLine';
        options = {
          offset: Number(match[1])
        };
      }
      if (name != null) {
        item = this.getItem('numberCommands', name);
        item.options = options;
        return item;
      }
    };

    View.prototype.getEmptyMessage = function(itemCount, filteredItemCount) {
      this.setError(null);
      this.setFallbackItems(this.getFallBackItemsForQuery(this.getFilterQuery()));
      return this.selectItemView(this.list.find('li:first'));
    };

    View.prototype.setFallbackItems = function(items) {
      var i, item, itemView, len, results;
      results = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        itemView = $(this.viewForItem(item));
        itemView.data('select-list-item', item);
        results.push(this.list.append(itemView));
      }
      return results;
    };

    View.prototype.viewForItem = function(arg) {
      var displayName, filterQuery, matches;
      displayName = arg.displayName;
      filterQuery = this.getFilterQuery();
      if (filterQuery.startsWith('!')) {
        filterQuery = filterQuery.slice(1);
      }
      matches = fuzzaldrin.match(displayName, filterQuery);
      return $$(function() {
        return this.li({
          "class": 'event',
          'data-event-name': name
        }, (function(_this) {
          return function() {
            return _this.span({
              title: displayName
            }, function() {
              return highlightMatches(_this, displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    View.prototype.confirmed = function(arg) {
      var kind, name, options;
      kind = arg.kind, name = arg.name, options = arg.options;
      this.cancel();
      return this.commands[kind][name](this.vimState, options);
    };

    return View;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzLWV4LW1vZGUvbGliL3ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpRkFBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTBCLE9BQUEsQ0FBUSxzQkFBUixDQUExQixFQUFDLG1DQUFELEVBQWlCLFNBQWpCLEVBQW9COztFQUNwQixVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBQ2IsT0FBK0IsT0FBQSxDQUFRLFNBQVIsQ0FBL0IsRUFBQyx3QkFBRCxFQUFXOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7bUJBQ0osWUFBQSxHQUFjOzttQkFDZCxVQUFBLEdBQVk7O21CQUdaLG9CQUFBLEdBQXNCLFNBQUE7TUFDcEIsSUFBRyxJQUFDLENBQUEsWUFBSjtRQUNFLElBQW1CLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBbkI7VUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBLEVBQUE7O2VBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsTUFGbEI7T0FBQSxNQUFBO2VBSUUsZ0RBQUEsU0FBQSxFQUpGOztJQURvQjs7bUJBT3RCLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFBLENBQVEsWUFBUjtNQUNaLElBQUMsQ0FBQSxRQUFELENBQVUsdUJBQVY7YUFDQSxzQ0FBQSxTQUFBO0lBSFU7O21CQUtaLFlBQUEsR0FBYyxTQUFBO2FBQ1o7SUFEWTs7bUJBR2QsU0FBQSxHQUFXLFNBQUE7YUFDVCxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRFM7O21CQUdYLE1BQUEsR0FBUSxTQUFDLFFBQUQsRUFBWSxXQUFaO0FBQ04sVUFBQTtNQURPLElBQUMsQ0FBQSxXQUFEO01BQ1Asc0NBQVMsQ0FBRSxTQUFSLENBQUEsVUFBSDtl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SUFBSSxDQUFDLE1BQU4sQ0FBYSxRQUFiO0FBSEY7O0lBRGdCOzttQkFNbEIsV0FBQSxHQUFhLFNBQUMsR0FBRDtBQUVYLFVBQUE7TUFGYSxjQUFEO01BRVosV0FBQSxHQUFjLElBQUMsQ0FBQSxjQUFELENBQUE7TUFDZCxJQUFrQyxXQUFXLENBQUMsVUFBWixDQUF1QixHQUF2QixDQUFsQztRQUFBLFdBQUEsR0FBYyxXQUFZLFVBQTFCOztNQUVBLE9BQUEsR0FBVSxVQUFVLENBQUMsS0FBWCxDQUFpQixXQUFqQixFQUE4QixXQUE5QjthQUNWLEVBQUEsQ0FBRyxTQUFBO2VBQ0QsSUFBQyxDQUFBLEVBQUQsQ0FBSTtVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtVQUFnQixpQkFBQSxFQUFtQixJQUFuQztTQUFKLEVBQTZDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQzNDLEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQSxLQUFBLEVBQU8sV0FBUDthQUFOLEVBQTBCLFNBQUE7cUJBQ3hCLGdCQUFBLENBQWlCLEtBQWpCLEVBQXVCLFdBQXZCLEVBQW9DLE9BQXBDLEVBQTZDLENBQTdDO1lBRHdCLENBQTFCO1VBRDJDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QztNQURDLENBQUg7SUFOVzs7bUJBV2IsU0FBQSxHQUFXLFNBQUMsR0FBRDtBQUNULFVBQUE7TUFEVyxpQkFBTSxpQkFBTTtNQUN2QixJQUFDLENBQUEsTUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxJQUFBLENBQWhCLENBQXNCLElBQUMsQ0FBQSxRQUF2QixFQUFpQyxPQUFqQztJQUZTOzs7O0tBcEhNO0FBTm5CIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntTZWxlY3RMaXN0VmlldywgJCwgJCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5mdXp6YWxkcmluID0gcmVxdWlyZSAnZnV6emFsZHJpbidcbntodW1hbml6ZSwgaGlnaGxpZ2h0TWF0Y2hlc30gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbElucHV0OiBudWxsXG4gIGl0ZW1zQ2FjaGU6IG51bGxcblxuICAjIERpc2FibGUgdGhyb3R0bGluZyBwb3B1bGF0ZUxpc3QgZm9yIGluaXRpYWxJbnB1dFxuICBzY2hlZHVsZVBvcHVsYXRlTGlzdDogLT5cbiAgICBpZiBAaW5pdGlhbElucHV0XG4gICAgICBAcG9wdWxhdGVMaXN0KCkgaWYgQGlzT25Eb20oKVxuICAgICAgQGluaXRpYWxJbnB1dCA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBjb21tYW5kcyA9IHJlcXVpcmUgJy4vY29tbWFuZHMnXG4gICAgQGFkZENsYXNzKCd2aW0tbW9kZS1wbHVzLWV4LW1vZGUnKVxuICAgIHN1cGVyXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPlxuICAgICdkaXNwbGF5TmFtZSdcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQGhpZGUoKVxuXG4gIHRvZ2dsZTogKEB2aW1TdGF0ZSwgY29tbWFuZEtpbmQpIC0+XG4gICAgaWYgQHBhbmVsPy5pc1Zpc2libGUoKVxuICAgICAgQGNhbmNlbCgpXG4gICAgZWxzZVxuICAgICAge0BlZGl0b3JFbGVtZW50LCBAZWRpdG9yfSA9IEB2aW1TdGF0ZVxuICAgICAgQHNob3coY29tbWFuZEtpbmQpXG5cbiAgc2hvdzogKGNvbW1hbmRLaW5kKSAtPlxuICAgIEBpbml0aWFsSW5wdXQgPSB0cnVlXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtpdGVtOiB0aGlzfSlcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHNldEl0ZW1zKEBnZXRJdGVtc0ZvcktpbmQoY29tbWFuZEtpbmQpKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0SXRlbXNGb3JLaW5kOiAoa2luZCkgLT5cbiAgICBAaXRlbXNDYWNoZSA/PSB7fVxuICAgIGlmIGtpbmQgb2YgQGl0ZW1zQ2FjaGVcbiAgICAgIEBpdGVtc0NhY2hlW2tpbmRdXG4gICAgZWxzZVxuICAgICAgY29tbWFuZHMgPSBfLmtleXMoQGNvbW1hbmRzW2tpbmRdKVxuICAgICAgaXRlbXMgPSBjb21tYW5kcy5tYXAgKG5hbWUpID0+IEBnZXRJdGVtKGtpbmQsIG5hbWUpXG4gICAgICBAaXRlbXNDYWNoZVtraW5kXSA9IGl0ZW1zXG4gICAgICBpdGVtc1xuXG4gIGdldEl0ZW06IChraW5kLCBuYW1lKSAtPlxuICAgIGlmIGtpbmQgaW4gWyd0b2dnbGVDb21tYW5kcycsICdudW1iZXJDb21tYW5kcyddXG4gICAgICBkaXNwbGF5TmFtZSA9IGh1bWFuaXplKG5hbWUpXG4gICAgZWxzZVxuICAgICAgZGlzcGxheU5hbWUgPSBuYW1lXG4gICAge25hbWUsIGtpbmQsIGRpc3BsYXlOYW1lfVxuXG4gIGhpZGU6IC0+XG4gICAgQHBhbmVsPy5oaWRlKClcblxuICBnZXRGYWxsQmFja0l0ZW1zRm9yUXVlcnk6IChxdWVyeSkgLT5cbiAgICBpdGVtcyA9IFtdXG5cbiAgICBpZiAvXiEvLnRlc3QocXVlcnkpXG4gICAgICBmaWx0ZXJRdWVyeSA9IHF1ZXJ5WzEuLi5dICMgdG8gdHJpbSBmaXJzdCAnISdcbiAgICAgIGl0ZW1zID0gQGdldEl0ZW1zRm9yS2luZCgndG9nZ2xlQ29tbWFuZHMnKVxuICAgICAgaXRlbXMgPSBmdXp6YWxkcmluLmZpbHRlcihpdGVtcywgZmlsdGVyUXVlcnksIGtleTogQGdldEZpbHRlcktleSgpKVxuXG4gICAgZWxzZSBpZiAvXlsrLVxcZF0vLnRlc3QocXVlcnkpXG4gICAgICBpdGVtcy5wdXNoKGl0ZW0pIGlmIGl0ZW0gPSBAZ2V0TnVtYmVyQ29tbWFuZEl0ZW0ocXVlcnkpXG5cbiAgICBpdGVtc1xuXG4gIGdldE51bWJlckNvbW1hbmRJdGVtOiAocXVlcnkpIC0+XG4gICAgaWYgbWF0Y2ggPSBxdWVyeS5tYXRjaCgvXihcXGQrKSskLylcbiAgICAgIG5hbWUgPSAnbW92ZVRvTGluZSdcbiAgICAgIG9wdGlvbnMgPSB7cm93OiBOdW1iZXIobWF0Y2hbMV0pfVxuXG4gICAgZWxzZSBpZiBtYXRjaCA9IHF1ZXJ5Lm1hdGNoKC9eKFxcZCspJSQvKVxuICAgICAgbmFtZSA9ICdtb3ZlVG9MaW5lQnlQZXJjZW50J1xuICAgICAgb3B0aW9ucyA9IHtwZXJjZW50OiBOdW1iZXIobWF0Y2hbMV0pfVxuXG4gICAgZWxzZSBpZiBtYXRjaCA9IHF1ZXJ5Lm1hdGNoKC9eKFxcZCspOihcXGQrKSQvKVxuICAgICAgbmFtZSA9ICdtb3ZlVG9MaW5lQW5kQ29sdW1uJ1xuICAgICAgb3B0aW9ucyA9IHtyb3c6IE51bWJlcihtYXRjaFsxXSksIGNvbHVtbjogTnVtYmVyKG1hdGNoWzJdKX1cblxuICAgIGVsc2UgaWYgbWF0Y2ggPSBxdWVyeS5tYXRjaCgvXihbKy1dXFxkKykkLylcbiAgICAgIG5hbWUgPSAnbW92ZVRvUmVsYXRpdmVMaW5lJ1xuICAgICAgb3B0aW9ucyA9IHtvZmZzZXQ6IE51bWJlcihtYXRjaFsxXSl9XG5cbiAgICBpZiBuYW1lP1xuICAgICAgaXRlbSA9IEBnZXRJdGVtKCdudW1iZXJDb21tYW5kcycsIG5hbWUpXG4gICAgICBpdGVtLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgICBpdGVtXG5cbiAgIyBVc2UgYXMgY29tbWFuZCBtaXNzaW5nIGhvb2suXG4gIGdldEVtcHR5TWVzc2FnZTogKGl0ZW1Db3VudCwgZmlsdGVyZWRJdGVtQ291bnQpIC0+XG4gICAgQHNldEVycm9yKG51bGwpXG4gICAgQHNldEZhbGxiYWNrSXRlbXMoQGdldEZhbGxCYWNrSXRlbXNGb3JRdWVyeShAZ2V0RmlsdGVyUXVlcnkoKSkpXG4gICAgQHNlbGVjdEl0ZW1WaWV3KEBsaXN0LmZpbmQoJ2xpOmZpcnN0JykpXG5cbiAgc2V0RmFsbGJhY2tJdGVtczogKGl0ZW1zKSAtPlxuICAgIGZvciBpdGVtIGluIGl0ZW1zXG4gICAgICBpdGVtVmlldyA9ICQoQHZpZXdGb3JJdGVtKGl0ZW0pKVxuICAgICAgaXRlbVZpZXcuZGF0YSgnc2VsZWN0LWxpc3QtaXRlbScsIGl0ZW0pXG4gICAgICBAbGlzdC5hcHBlbmQoaXRlbVZpZXcpXG5cbiAgdmlld0Zvckl0ZW06ICh7ZGlzcGxheU5hbWV9KSAtPlxuICAgICMgU3R5bGUgbWF0Y2hlZCBjaGFyYWN0ZXJzIGluIHNlYXJjaCByZXN1bHRzXG4gICAgZmlsdGVyUXVlcnkgPSBAZ2V0RmlsdGVyUXVlcnkoKVxuICAgIGZpbHRlclF1ZXJ5ID0gZmlsdGVyUXVlcnlbMS4uXSBpZiBmaWx0ZXJRdWVyeS5zdGFydHNXaXRoKCchJylcblxuICAgIG1hdGNoZXMgPSBmdXp6YWxkcmluLm1hdGNoKGRpc3BsYXlOYW1lLCBmaWx0ZXJRdWVyeSlcbiAgICAkJCAtPlxuICAgICAgQGxpIGNsYXNzOiAnZXZlbnQnLCAnZGF0YS1ldmVudC1uYW1lJzogbmFtZSwgPT5cbiAgICAgICAgQHNwYW4gdGl0bGU6IGRpc3BsYXlOYW1lLCA9PlxuICAgICAgICAgIGhpZ2hsaWdodE1hdGNoZXModGhpcywgZGlzcGxheU5hbWUsIG1hdGNoZXMsIDApXG5cbiAgY29uZmlybWVkOiAoe2tpbmQsIG5hbWUsIG9wdGlvbnN9KSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIEBjb21tYW5kc1traW5kXVtuYW1lXShAdmltU3RhdGUsIG9wdGlvbnMpXG4iXX0=
