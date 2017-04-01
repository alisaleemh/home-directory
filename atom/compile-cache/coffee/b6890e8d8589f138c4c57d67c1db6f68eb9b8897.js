(function() {
  (function() {
    var vm, __slice_;
    vm = void 0;
    __slice_ = [].slice;
    vm = require("vm");
    exports.allowUnsafeEval = function(fn) {
      var previousEval;
      previousEval = void 0;
      previousEval = global["eval"];
      try {
        global["eval"] = function(source) {
          return vm.runInThisContext(source);
        };
        return fn();
      } finally {
        global["eval"] = previousEval;
      }
    };
    exports.allowUnsafeNewFunction = function(fn) {
      var previousFunction;
      previousFunction = void 0;
      previousFunction = global.Function;
      try {
        global.Function = exports.Function;
        return fn();
      } finally {
        global.Function = previousFunction;
      }
    };
    exports.allowUnsafe = function(fn) {
      var previousEval, previousFunction;
      previousEval = void 0;
      previousFunction = void 0;
      previousFunction = global.Function;
      previousEval = global["eval"];
      try {
        global.Function = exports.Function;
        global["eval"] = function(source) {
          return vm.runInThisContext(source);
        };
        return fn();
      } finally {
        global["eval"] = previousEval;
        global.Function = previousFunction;
      }
    };
    exports.Function = function() {
      var body, paramList, paramLists, params, _i, _j, _len;
      body = void 0;
      paramList = void 0;
      paramLists = void 0;
      params = void 0;
      _i = void 0;
      _j = void 0;
      _len = void 0;
      paramLists = (2 <= arguments.length ? __slice_.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []));
      body = arguments[_i++];
      params = [];
      _j = 0;
      _len = paramLists.length;
      while (_j < _len) {
        paramList = paramLists[_j];
        if (typeof paramList === "string") {
          paramList = paramList.split(/\s*,\s*/);
        }
        params.push.apply(params, paramList);
        _j++;
      }
      return vm.runInThisContext("(function(" + (params.join(", ")) + ") {\n  " + body + "\n})");
    };
  }).call(this);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9icm93c2VyLXBsdXMvbGliL2V2YWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLENBQUMsU0FBQSxHQUFBO0FBQ0EsUUFBQSxZQUFBO0FBQUEsSUFBQSxFQUFBLEdBQUssTUFBTCxDQUFBO0FBQUEsSUFDQSxRQUFBLEdBQVcsRUFBRSxDQUFDLEtBRGQsQ0FBQTtBQUFBLElBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTtBQUFBLElBR0EsT0FBTyxDQUFDLGVBQVIsR0FBMEIsU0FBQyxFQUFELEdBQUE7QUFDekIsVUFBQSxZQUFBO0FBQUEsTUFBQSxZQUFBLEdBQWUsTUFBZixDQUFBO0FBQUEsTUFDQSxZQUFBLEdBQWUsTUFBTyxDQUFBLE1BQUEsQ0FEdEIsQ0FBQTtBQUVBO0FBQ0MsUUFBQSxNQUFPLENBQUEsTUFBQSxDQUFQLEdBQWlCLFNBQUMsTUFBRCxHQUFBO2lCQUNoQixFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsTUFBcEIsRUFEZ0I7UUFBQSxDQUFqQixDQUFBO0FBR0EsZUFBTyxFQUFBLENBQUEsQ0FBUCxDQUpEO09BQUE7QUFNQyxRQUFBLE1BQU8sQ0FBQSxNQUFBLENBQVAsR0FBaUIsWUFBakIsQ0FORDtPQUh5QjtJQUFBLENBSDFCLENBQUE7QUFBQSxJQWVBLE9BQU8sQ0FBQyxzQkFBUixHQUFpQyxTQUFDLEVBQUQsR0FBQTtBQUNoQyxVQUFBLGdCQUFBO0FBQUEsTUFBQSxnQkFBQSxHQUFtQixNQUFuQixDQUFBO0FBQUEsTUFDQSxnQkFBQSxHQUFtQixNQUFNLENBQUMsUUFEMUIsQ0FBQTtBQUVBO0FBQ0MsUUFBQSxNQUFNLENBQUMsUUFBUCxHQUFrQixPQUFPLENBQUMsUUFBMUIsQ0FBQTtBQUNBLGVBQU8sRUFBQSxDQUFB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

//# sourceURL=/home/alisaleemh/.atom/packages/browser-plus/lib/eval.coffee
