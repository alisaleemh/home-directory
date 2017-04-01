(function() {
  describe("atom-terminal-panel Testing utils functionality", function() {
    it("tests the \"utils\" module", function() {
      return require('../lib/atp-utils');
    });
    it("tests \"include\" function", function() {
      return expect(function() {
        return include('../lib/atp-core');
      }).not.toThrow();
    });
    return it("tests the utils functionality", function() {
      expect(window.generateRandomID).toBeDefined();
      expect(window.generateRandomID).not.toThrow();
      expect(window.generateRandomID()).not.toBeNull();
      return expect(window.generateRandomID()).toBeDefined();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL3NwZWMvYmFzaWMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFHQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGlEQUFULEVBQTRELFNBQUEsR0FBQTtBQUUxRCxJQUFBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBLEdBQUE7YUFDL0IsT0FBQSxDQUFRLGtCQUFSLEVBRCtCO0lBQUEsQ0FBakMsQ0FBQSxDQUFBO0FBQUEsSUFHQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO2FBQy9CLE1BQUEsQ0FBTyxTQUFBLEdBQUE7ZUFBSSxPQUFBLENBQVEsaUJBQVIsRUFBSjtNQUFBLENBQVAsQ0FBcUMsQ0FBQyxHQUFHLENBQUMsT0FBMUMsQ0FBQSxFQUQrQjtJQUFBLENBQWpDLENBSEEsQ0FBQTtXQU1BLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBLEdBQUE7QUFDbEMsTUFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLGdCQUFkLENBQStCLENBQUMsV0FBaEMsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsZ0JBQWQsQ0FBK0IsQ0FBQyxHQUFHLENBQUMsT0FBcEMsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUFQLENBQWlDLENBQUMsR0FBRyxDQUFDLFFBQXRDLENBQUEsQ0FGQSxDQUFBO2FBR0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQVAsQ0FBaUMsQ0FBQyxXQUFsQyxDQUFBLEVBSmtDO0lBQUEsQ0FBcEMsRUFSMEQ7RUFBQSxDQUE1RCxDQUFBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/spec/basic-spec.coffee
