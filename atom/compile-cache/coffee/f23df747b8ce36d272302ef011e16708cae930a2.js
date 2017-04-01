(function() {
  var SearchHistoryManager, _;

  _ = require('underscore-plus');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.globalState = this.vimState.globalState;
      this.idx = -1;
    }

    SearchHistoryManager.prototype.get = function(direction) {
      var ref;
      switch (direction) {
        case 'prev':
          if ((this.idx + 1) !== this.getSize()) {
            this.idx += 1;
          }
          break;
        case 'next':
          if (!(this.idx === -1)) {
            this.idx -= 1;
          }
      }
      return (ref = this.globalState.get('searchHistory')[this.idx]) != null ? ref : '';
    };

    SearchHistoryManager.prototype.save = function(entry) {
      var entries;
      if (_.isEmpty(entry)) {
        return;
      }
      entries = this.globalState.get('searchHistory').slice();
      entries.unshift(entry);
      entries = _.uniq(entries);
      if (this.getSize() > this.vimState.getConfig('historySize')) {
        entries.splice(this.vimState.getConfig('historySize'));
      }
      return this.globalState.set('searchHistory', entries);
    };

    SearchHistoryManager.prototype.reset = function() {
      return this.idx = -1;
    };

    SearchHistoryManager.prototype.clear = function() {
      return this.globalState.reset('searchHistory');
    };

    SearchHistoryManager.prototype.getSize = function() {
      return this.globalState.get('searchHistory').length;
    };

    SearchHistoryManager.prototype.destroy = function() {
      return this.idx = null;
    };

    return SearchHistoryManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUNNO21DQUNKLEdBQUEsR0FBSzs7SUFFUSw4QkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWCxJQUFDLENBQUEsY0FBZSxJQUFDLENBQUEsU0FBaEI7TUFDRixJQUFDLENBQUEsR0FBRCxHQUFPLENBQUM7SUFGRzs7bUNBSWIsR0FBQSxHQUFLLFNBQUMsU0FBRDtBQUNILFVBQUE7QUFBQSxjQUFPLFNBQVA7QUFBQSxhQUNPLE1BRFA7VUFDbUIsSUFBaUIsQ0FBQyxJQUFDLENBQUEsR0FBRCxHQUFPLENBQVIsQ0FBQSxLQUFjLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBL0I7WUFBQSxJQUFDLENBQUEsR0FBRCxJQUFRLEVBQVI7O0FBQVo7QUFEUCxhQUVPLE1BRlA7VUFFbUIsSUFBQSxDQUFpQixDQUFDLElBQUMsQ0FBQSxHQUFELEtBQVEsQ0FBQyxDQUFWLENBQWpCO1lBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUSxFQUFSOztBQUZuQjtxRkFHMEM7SUFKdkM7O21DQU1MLElBQUEsR0FBTSxTQUFDLEtBQUQ7QUFDSixVQUFBO01BQUEsSUFBVSxDQUFDLENBQUMsT0FBRixDQUFVLEtBQVYsQ0FBVjtBQUFBLGVBQUE7O01BRUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixlQUFqQixDQUFpQyxDQUFDLEtBQWxDLENBQUE7TUFDVixPQUFPLENBQUMsT0FBUixDQUFnQixLQUFoQjtNQUNBLE9BQUEsR0FBVSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQVA7TUFDVixJQUFHLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxHQUFhLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixhQUFwQixDQUFoQjtRQUNFLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGFBQXBCLENBQWYsRUFERjs7YUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsZUFBakIsRUFBa0MsT0FBbEM7SUFSSTs7bUNBVU4sS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUM7SUFESDs7bUNBR1AsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBbUIsZUFBbkI7SUFESzs7bUNBR1AsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsZUFBakIsQ0FBaUMsQ0FBQztJQUQzQjs7bUNBR1QsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0lBREE7Ozs7O0FBbkNYIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VhcmNoSGlzdG9yeU1hbmFnZXJcbiAgaWR4OiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BnbG9iYWxTdGF0ZX0gPSBAdmltU3RhdGVcbiAgICBAaWR4ID0gLTFcblxuICBnZXQ6IChkaXJlY3Rpb24pIC0+XG4gICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldicgdGhlbiBAaWR4ICs9IDEgdW5sZXNzIChAaWR4ICsgMSkgaXMgQGdldFNpemUoKVxuICAgICAgd2hlbiAnbmV4dCcgdGhlbiBAaWR4IC09IDEgdW5sZXNzIChAaWR4IGlzIC0xKVxuICAgIEBnbG9iYWxTdGF0ZS5nZXQoJ3NlYXJjaEhpc3RvcnknKVtAaWR4XSA/ICcnXG5cbiAgc2F2ZTogKGVudHJ5KSAtPlxuICAgIHJldHVybiBpZiBfLmlzRW1wdHkoZW50cnkpXG5cbiAgICBlbnRyaWVzID0gQGdsb2JhbFN0YXRlLmdldCgnc2VhcmNoSGlzdG9yeScpLnNsaWNlKClcbiAgICBlbnRyaWVzLnVuc2hpZnQoZW50cnkpXG4gICAgZW50cmllcyA9IF8udW5pcShlbnRyaWVzKVxuICAgIGlmIEBnZXRTaXplKCkgPiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaXN0b3J5U2l6ZScpXG4gICAgICBlbnRyaWVzLnNwbGljZShAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaXN0b3J5U2l6ZScpKVxuICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ3NlYXJjaEhpc3RvcnknLCBlbnRyaWVzKVxuXG4gIHJlc2V0OiAtPlxuICAgIEBpZHggPSAtMVxuXG4gIGNsZWFyOiAtPlxuICAgIEBnbG9iYWxTdGF0ZS5yZXNldCgnc2VhcmNoSGlzdG9yeScpXG5cbiAgZ2V0U2l6ZTogLT5cbiAgICBAZ2xvYmFsU3RhdGUuZ2V0KCdzZWFyY2hIaXN0b3J5JykubGVuZ3RoXG5cbiAgZGVzdHJveTogLT5cbiAgICBAaWR4ID0gbnVsbFxuIl19
