(function() {
  describe("atom-terminal-panel Testing terminal functionality", function() {
    var activationPromise, atp, executeCommand, initTerm, t, tests, workspaceElement, _ref;
    atp = null;
    _ref = [], activationPromise = _ref[0], workspaceElement = _ref[1];
    tests = {
      parseTemplateLabels: {
        'echo test %(label:badge:text:error)': 'echo test <span class="badge">error</span>',
        'echo test %(label:default:text:error)': 'echo test <span class="inline-block highlight">error</span>',
        'echo test %(label:primary:text:error)': 'echo test <span class="label label-primary">error</span>',
        'echo test %(label:success:text:error)': 'echo test <span class="inline-block highlight-success">error</span>',
        'echo test %(label:warning:text:error)': 'echo test <span class="inline-block highlight-warning">error</span>',
        'echo test %(label:danger:text:error)': 'echo test <span class="inline-block highlight-error">error</span>',
        'echo test %(label:error:text:error)': 'echo test <span class="inline-block highlight-error">error</span>'
      },
      parseTemplateUnusedVariables: {
        '%(-9999999999)%(-100)%(-5)%(-4)%(-3)%(-2)%(-1)%(0)%(1)%(2)%(3)%(99999999)': '',
        '%(foo)%(bar)%(crap)%(0.009)%(nope)': ''
      },
      util: {
        dir: [[["./a.txt", "b.txt"], "path", ["path/a.txt", "b.txt"]], [["./a.txt", "/non/relative/path/b.txt", "non/relative/path/c.txt"], "path", ["path/a.txt", "C:/non/relative/path/b.txt", "non/relative/path/c.txt"]], ["./sample.sample.smpl", "E:/user/test/example/falsy/path", "E:/user/test/example/falsy/path/sample.sample.smpl"]],
        getFileName: {
          'Z:/not/existing/strange/path/LOL/.././anything/test.lol.rar': 'test.lol.rar',
          'Z:/not/existing/path/to_the_file?/filename.b.c.d.extension': 'filename.b.c.d.extension',
          'C:/A/B/C/../../../D/EXAMPLE/PaTh/.file.txt': '.file.txt'
        },
        getFilePath: {
          'Z:/not/existing/strange/path/LOL/.././anything/test.lol.rar': 'Z:/not/existing/strange/path/LOL/.././anything/',
          'Z:/not/existing/path/to_the_file?/filename.b.c.d.extension': 'Z:/not/existing/path/to_the_file?/',
          'C:/A/B/C/../../../D/EXAMPLE/PaTh/.file.txt': 'C:/A/B/C/../../../D/EXAMPLE/PaTh/'
        },
        mkdir: [['__heeello', '__heeello/destiny'], '__test', '__anything', '__.op'],
        rename: [['__.op', '__.ops'], ['./__.ops', '__.op']],
        rmdir: ['__anything', '__test', '__.op', ['__heeello/destiny', '__heeello']]
      }
    };
    t = null;
    initTerm = (function(_this) {
      return function() {
        workspaceElement = atom.views.getView(atom.workspace);
        activationPromise = atom.packages.activatePackage('atom-terminal-panel');
        atp = atom.packages.getLoadedPackage('atom-terminal-panel').mainModule;
        return t = atp.getPanel().createCommandView();
      };
    })(this);
    executeCommand = function(name, callback) {
      atom.commands.dispatch(workspaceElement, 'atom-terminal-panel:' + name);
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(callback);
    };
    beforeEach(function() {
      return initTerm();
    });
    it("tests basic modules presence", function() {
      return initTerm();
    });
    it("tests the console initialization (in the specs mode)", function() {
      return expect(initTerm).not.toThrow();
    });
    it("tests the terminal events dispatching", function() {
      executeCommand('toggle', function() {});
      executeCommand('new', function() {});
      executeCommand('next', function() {});
      executeCommand('prev', function() {});
      executeCommand('toggle-autocompletion', function() {});
      executeCommand('destroy', function() {});
      return executeCommand('new', function() {});
    });
    it("tests the console label parsing", function() {
      var k, v, _i, _len, _ref1, _results;
      _ref1 = tests.parseTemplateLabels;
      _results = [];
      for (v = _i = 0, _len = _ref1.length; _i < _len; v = ++_i) {
        k = _ref1[v];
        _results.push(expect(t.parseTemplate(k)).toBe(v));
      }
      return _results;
    });
    it("tests the console ability to remove unused variables", function() {
      var k, v, _i, _len, _ref1, _results;
      _ref1 = tests.parseTemplateUnusedVariables;
      _results = [];
      for (v = _i = 0, _len = _ref1.length; _i < _len; v = ++_i) {
        k = _ref1[v];
        _results.push(expect(t.parseTemplate(k)).toBe(v));
      }
      return _results;
    });
    it("test the \"echo test\" command", function() {
      return expect(function() {
        return t.exec("echo test");
      }).not.toThrow();
    });
    it("test the terminal.util.dir calls", function() {
      var k, v, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _results;
      t.cd('/');
      expect(t.util.os).not.toThrow();
      _ref1 = tests.util.dir;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        v = _ref1[_i];
        expect(t.util.dir(v[0], v[1])).toEqual(v[2]);
      }
      _ref2 = tests.util.getFileName;
      for (v = _j = 0, _len1 = _ref2.length; _j < _len1; v = ++_j) {
        k = _ref2[v];
        expect(t.util.getFileName(k)).toEqual(v);
      }
      _ref3 = tests.util.getFilePath;
      _results = [];
      for (v = _k = 0, _len2 = _ref3.length; _k < _len2; v = ++_k) {
        k = _ref3[v];
        _results.push(expect(t.util.getFilePath(k)).toEqual(v));
      }
      return _results;
    });
    it("test the terminal.util filesystem operations", function() {
      var e, k, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _ref3, _ref4, _results;
      t.cd('/');
      _ref1 = tests.util.rmdir;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        k = _ref1[_i];
        try {
          t.util.rmdir(k);
        } catch (_error) {
          e = _error;
        }
      }
      _ref2 = tests.util.mkdir;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        k = _ref2[_j];
        expect(function() {
          return t.util.mkdir(k);
        }).not.toThrow();
      }
      _ref3 = tests.util.rename;
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        k = _ref3[_k];
        expect(function() {
          return t.util.rename(k[0], k[1]);
        }).not.toThrow();
      }
      _ref4 = tests.util.rmdir;
      _results = [];
      for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
        k = _ref4[_l];
        _results.push(expect(function() {
          return t.util.rmdir(k);
        }).not.toThrow());
      }
      return _results;
    });
    it("tests the terminal choosen commands", function() {
      expect(function() {
        return t.onCommand('ls');
      }).not.toThrow();
      expect(function() {
        return t.onCommand('info');
      }).not.toThrow();
      return expect(function() {
        return t.onCommand('memdump');
      }).not.toThrow();
    });
    it("tests the terminal cwd (cp)", function() {
      var cwd, e;
      expect(function() {
        return t.cd('/');
      }).not.toThrow();
      cwd = t.getCwd();
      expect(cwd).toEqual(t.util.dir('/', ''));
      try {
        t.util.rmdir('/example_dir');
      } catch (_error) {
        e = _error;
      }
      expect(function() {
        return t.util.mkdir('/example_dir');
      }).not.toThrow();
      expect(function() {
        return t.cd(['/example_dir']);
      }).not.toThrow();
      return expect(t.getCwd()).toEqual(t.util.dir('./example_dir', cwd));
    });
    return it("tests terminal.removeQuotes()", function() {
      return expect(t.removeQuotes('\"Some examples3\'2\"1\'->?@#($)*@)#)\"\"\'asdsad\'')).toEqual('Some examples321->?@#($)*@)#)asdsad');
    });
  });


  /*
    t = core.init().createSpecsTerminal()
    tests =
      units:
        'tests the console label parsing':
          expect: [
            ['call', t.parseTemplate, 'toBe', 'echo test <span class="badge">error</span>']
          ]
  
  
    runTest = (tests) ->
      console.log 'called.runTest'
      if tests.init?
        tests.init.apply(v, [])
      for k, v of tests.units
        it k, ->
          console.log 'called.it'
          if v.init?
            v.init.apply(v, [])
          if v.beforeEach?
            beforeEach v.beforeEach
          if v.afterEach?
            afterEach v.afterEach
          for unit in v.expect
            expectation = unit
            value = null
            expectationStepsLength = expectation.length
            for i in [0..expectationStepsLength-1] by 1
              step = expectation[i]
              if step == 'call'
                if expectation[i+1] instanceof Array
                  functname = expectation[i+1][0]
                  expectation[i+1].shift()
                  value = expect(functname.apply(null, expectation[i+1]))
                else
                  value = expect((expectation[i+1])())
                ++i
                continue
              else if step == 'value'
                value = expect(expectation[i+1])
                ++i
                continue
              else if step == 'and'
                value = value.and
              else if step == 'throwError'
                value = value.throwError(expectation[i+1])
                ++i
                continue
              else if step == 'callThrough'
                value = value.callThrough()
              else if step == 'stub'
                value = value.stub()
              else if step == 'not'
                value = value.not
              else if step == 'toThrow'
                value = value.toThrow()
              else if step == 'toBe'
                value = value.toBe(expectation[i+1])
                ++i
                continue
              else if step == 'toBeNull'
                value = value.toBeNull()
              else if step == 'toEqual'
                value = value.toEqual(expectation[i+1])
                ++i
                continue
              else if step == 'toMatch'
                value = value.toMatch(expectation[i+1])
                ++i
                continue
              else if step == 'toThrowError'
                value = value.toThrowError(expectation[i+1])
                ++i
                continue
              else if step == 'toHaveBeenCalled'
                value = value.toHaveBeenCalled()
              else if step == 'toHaveBeenCalledWith'
                value = value.toHaveBeenCalledWith.apply(this, expectation[i+1])
                ++i
                continue
              else if step == 'toBeDefined'
                value = value.toBeDefined()
              else if step == 'toBeUndefined'
                value = value.toBeUndefined()
  
    runTest tests
   */

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm1pbmFsLXBhbmVsL3NwZWMvdGVybWluYWwtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLEVBQUEsUUFBQSxDQUFTLG9EQUFULEVBQStELFNBQUEsR0FBQTtBQUU3RCxRQUFBLGtGQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBTixDQUFBO0FBQUEsSUFDQSxPQUF3QyxFQUF4QyxFQUFDLDJCQUFELEVBQW9CLDBCQURwQixDQUFBO0FBQUEsSUFHQSxLQUFBLEdBQ0U7QUFBQSxNQUFBLG1CQUFBLEVBQ0U7QUFBQSxRQUFBLHFDQUFBLEVBQXVDLDRDQUF2QztBQUFBLFFBQ0EsdUNBQUEsRUFBeUMsNkRBRHpDO0FBQUEsUUFFQSx1Q0FBQSxFQUF5QywwREFGekM7QUFBQSxRQUdBLHVDQUFBLEVBQXlDLHFFQUh6QztBQUFBLFFBSUEsdUNBQUEsRUFBeUMscUVBSnpDO0FBQUEsUUFLQSxzQ0FBQSxFQUF3QyxtRUFMeEM7QUFBQSxRQU1BLHFDQUFBLEVBQXVDLG1FQU52QztPQURGO0FBQUEsTUFRQSw0QkFBQSxFQUNFO0FBQUEsUUFBQSwyRUFBQSxFQUE2RSxFQUE3RTtBQUFBLFFBQ0Esb0NBQUEsRUFBc0MsRUFEdEM7T0FURjtBQUFBLE1BV0EsSUFBQSxFQUNFO0FBQUEsUUFBQSxHQUFBLEVBQUssQ0FDSCxDQUNFLENBQUMsU0FBRCxFQUFZLE9BQVosQ0FERixFQUVFLE1BRkYsRUFHRSxDQUFFLFlBQUYsRUFBZ0IsT0FBaEIsQ0FIRixDQURHLEVBTUgsQ0FDRSxDQUFDLFNBQUQsRUFBWSwwQkFBWixFQUF3Qyx5QkFBeEMsQ0FERixFQUVFLE1BRkYsRUFHRSxDQUFFLFlBQUYsRUFBZ0IsNEJBQWhCLEVBQThDLHlCQUE5QyxDQUhGLENBTkcsRUFXSCxDQUNFLHNCQURGLEVBRUUsaUNBRkYsRUFHRSxvREFIRixDQVhHLENBQUw7QUFBQSxRQWlCQSxXQUFBLEVBQ0U7QUFBQSxVQUFBLDZEQUFBLEVBQStELGNBQS9EO0FBQUEsVUFDQSw0REFBQSxFQUE4RCwwQkFEOUQ7QUFBQSxVQUVBLDRDQUFBLEVBQThDLFdBRjlDO1NBbEJGO0FBQUEsUUFxQkEsV0FBQSxFQUNFO0FBQUEsVUFBQSw2REFBQSxFQUErRCxpREFBL0Q7QUFBQSxVQUNBLDREQUFBLEVBQThELG9DQUQ5RDtBQUFBLFVBRUEsNENBQUEsRUFBOEMsbUNBRjlDO1NBdEJGO0FBQUEsUUF5QkEsS0FBQSxFQUFPLENBQ0wsQ0FBQyxXQUFELEVBQWMsbUJBQWQsQ0FESyxFQUVMLFFBRkssRUFHTCxZQUhLLEVBSUwsT0FKSyxDQXpCUDtBQUFBLFFBK0JBLE1BQUEsRUFBUSxDQUNOLENBQUMsT0FBRCxFQUFVLFFBQVYsQ0FETSxFQUVOLENBQUMsVUFBRCxFQUFhLE9BQWIsQ0FGTSxDQS9CUjtBQUFBLFFBbUNBLEtBQUEsRUFBTyxDQUNMLFlBREssRUFFTCxRQUZLLEVBR0wsT0FISyxFQUlMLENBQUMsbUJBQUQsRUFBc0IsV0FBdEIsQ0FKSyxDQW5DUDtPQVpGO0tBSkYsQ0FBQTtBQUFBLElBMERBLENBQUEsR0FBSSxJQTFESixDQUFBO0FBQUEsSUEyREEsUUFBQSxHQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDVCxRQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBbkIsQ0FBQTtBQUFBLFFBQ0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHFCQUE5QixDQURwQixDQUFBO0FBQUEsUUFFQSxHQUFBLEdBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixxQkFBL0IsQ0FBcUQsQ0FBQyxVQUY1RCxDQUFBO2VBR0EsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxRQUFKLENBQUEsQ0FBYyxDQUFDLGlCQUFmLENBQUEsRUFKSztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBM0RYLENBQUE7QUFBQSxJQWlFQSxjQUFBLEdBQWlCLFNBQUMsSUFBRCxFQUFPLFFBQVAsR0FBQTtBQUNmLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5QyxzQkFBQSxHQUF1QixJQUFoRSxDQUFBLENBQUE7QUFBQSxNQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsa0JBQUg7TUFBQSxDQUFoQixDQURBLENBQUE7YUFFQSxJQUFBLENBQUssUUFBTCxFQUhlO0lBQUEsQ0FqRWpCLENBQUE7QUFBQSxJQXNFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsUUFBQSxDQUFBLEVBRFM7SUFBQSxDQUFYLENBdEVBLENBQUE7QUFBQSxJQXlFQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO2FBQ2pDLFFBQUEsQ0FBQSxFQURpQztJQUFBLENBQW5DLENBekVBLENBQUE7QUFBQSxJQTRFQSxFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQSxHQUFBO2FBQ3pELE1BQUEsQ0FBTyxRQUFQLENBQWdCLENBQUMsR0FBRyxDQUFDLE9BQXJCLENBQUEsRUFEeUQ7SUFBQSxDQUEzRCxDQTVFQSxDQUFBO0FBQUEsSUErRUEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxNQUFBLGNBQUEsQ0FBZSxRQUFmLEVBQXlCLFNBQUEsR0FBQSxDQUF6QixDQUFBLENBQUE7QUFBQSxNQUNBLGNBQUEsQ0FBZSxLQUFmLEVBQXNCLFNBQUEsR0FBQSxDQUF0QixDQURBLENBQUE7QUFBQSxNQUVBLGNBQUEsQ0FBZSxNQUFmLEVBQXVCLFNBQUEsR0FBQSxDQUF2QixDQUZBLENBQUE7QUFBQSxNQUdBLGNBQUEsQ0FBZSxNQUFmLEVBQXVCLFNBQUEsR0FBQSxDQUF2QixDQUhBLENBQUE7QUFBQSxNQUlBLGNBQUEsQ0FBZSx1QkFBZixFQUF3QyxTQUFBLEdBQUEsQ0FBeEMsQ0FKQSxDQUFBO0FBQUEsTUFLQSxjQUFBLENBQWUsU0FBZixFQUEwQixTQUFBLEdBQUEsQ0FBMUIsQ0FMQSxDQUFBO2FBTUEsY0FBQSxDQUFlLEtBQWYsRUFBc0IsU0FBQSxHQUFBLENBQXRCLEVBUDBDO0lBQUEsQ0FBNUMsQ0EvRUEsQ0FBQTtBQUFBLElBd0ZBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBLEdBQUE7QUFDcEMsVUFBQSwrQkFBQTtBQUFBO0FBQUE7V0FBQSxvREFBQTtxQkFBQTtBQUNFLHNCQUFBLE1BQUEsQ0FBTyxDQUFDLENBQUMsYUFBRixDQUFnQixDQUFoQixDQUFQLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsQ0FBL0IsRUFBQSxDQURGO0FBQUE7c0JBRG9DO0lBQUEsQ0FBdEMsQ0F4RkEsQ0FBQTtBQUFBLElBNEZBLEVBQUEsQ0FBRyxzREFBSCxFQUEyRCxTQUFBLEdBQUE7QUFDekQsVUFBQSwrQkFBQTtBQUFBO0FBQUE7V0FBQSxvREFBQTtxQkFBQTtBQUNFLHNCQUFBLE1BQUEsQ0FBTyxDQUFDLENBQUMsYUFBRixDQUFnQixDQUFoQixDQUFQLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsQ0FBL0IsRUFBQSxDQURGO0FBQUE7c0JBRHlEO0lBQUEsQ0FBM0QsQ0E1RkEsQ0FBQTtBQUFBLElBZ0dBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7YUFDbkMsTUFBQSxDQUFPLFNBQUEsR0FBQTtlQUFJLENBQUMsQ0FBQyxJQUFGLENBQU8sV0FBUCxFQUFKO01BQUEsQ0FBUCxDQUE4QixDQUFDLEdBQUcsQ0FBQyxPQUFuQyxDQUFBLEVBRG1DO0lBQUEsQ0FBckMsQ0FoR0EsQ0FBQTtBQUFBLElBbUdBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsVUFBQSxtRUFBQTtBQUFBLE1BQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBSyxHQUFMLENBQUEsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBZCxDQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUF0QixDQUFBLENBREEsQ0FBQTtBQUVBO0FBQUEsV0FBQSw0Q0FBQTtzQkFBQTtBQUNFLFFBQUEsTUFBQSxDQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBUCxDQUFXLENBQUUsQ0FBQSxDQUFBLENBQWIsRUFBaUIsQ0FBRSxDQUFBLENBQUEsQ0FBbkIsQ0FBUCxDQUE4QixDQUFDLE9BQS9CLENBQXVDLENBQUUsQ0FBQSxDQUFBLENBQXpDLENBQUEsQ0FERjtBQUFBLE9BRkE7QUFJQTtBQUFBLFdBQUEsc0RBQUE7cUJBQUE7QUFDRSxRQUFBLE1BQUEsQ0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVAsQ0FBbUIsQ0FBbkIsQ0FBUCxDQUE2QixDQUFDLE9BQTlCLENBQXNDLENBQXRDLENBQUEsQ0FERjtBQUFBLE9BSkE7QUFNQTtBQUFBO1dBQUEsc0RBQUE7cUJBQUE7QUFDRSxzQkFBQSxNQUFBLENBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFQLENBQW1CLENBQW5CLENBQVAsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQyxDQUF0QyxFQUFBLENBREY7QUFBQTtzQkFQcUM7SUFBQSxDQUF2QyxDQW5HQSxDQUFBO0FBQUEsSUE4R0EsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUEsR0FBQTtBQUNqRCxVQUFBLHFGQUFBO0FBQUEsTUFBQSxDQUFDLENBQUMsRUFBRixDQUFLLEdBQUwsQ0FBQSxDQUFBO0FBQ0E7QUFBQSxXQUFBLDRDQUFBO3NCQUFBO0FBQ0U7QUFDRSxVQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBUCxDQUFhLENBQWIsQ0FBQSxDQURGO1NBQUEsY0FBQTtBQUVNLFVBQUEsVUFBQSxDQUZOO1NBREY7QUFBQSxPQURBO0FBTUE7QUFBQSxXQUFBLDhDQUFBO3NCQUFBO0FBQ0UsUUFBQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBUCxDQUFhLENBQWIsRUFBSjtRQUFBLENBQVAsQ0FBMkIsQ0FBQyxHQUFHLENBQUMsT0FBaEMsQ0FBQSxDQUFBLENBREY7QUFBQSxPQU5BO0FBUUE7QUFBQSxXQUFBLDhDQUFBO3NCQUFBO0FBQ0UsUUFBQSxNQUFBLENBQU8sU0FBQSxHQUFBO2lCQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBUCxDQUFjLENBQUUsQ0FBQSxDQUFBLENBQWhCLEVBQW9CLENBQUUsQ0FBQSxDQUFBLENBQXRCLEVBQUo7UUFBQSxDQUFQLENBQXFDLENBQUMsR0FBRyxDQUFDLE9BQTFDLENBQUEsQ0FBQSxDQURGO0FBQUEsT0FSQTtBQVVBO0FBQUE7V0FBQSw4Q0FBQTtzQkFBQTtBQUNFLHNCQUFBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7aUJBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFQLENBQWEsQ0FBYixFQUFKO1FBQUEsQ0FBUCxDQUEyQixDQUFDLEdBQUcsQ0FBQyxPQUFoQyxDQUFBLEVBQUEsQ0FERjtBQUFBO3NCQVhpRDtJQUFBLENBQW5ELENBOUdBLENBQUE7QUFBQSxJQTRIQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLE1BQUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtlQUFJLENBQUMsQ0FBQyxTQUFGLENBQVksSUFBWixFQUFKO01BQUEsQ0FBUCxDQUE0QixDQUFDLEdBQUcsQ0FBQyxPQUFqQyxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxDQUFPLFNBQUEsR0FBQTtlQUFJLENBQUMsQ0FBQyxTQUFGLENBQVksTUFBWixFQUFKO01BQUEsQ0FBUCxDQUE4QixDQUFDLEdBQUcsQ0FBQyxPQUFuQyxDQUFBLENBREEsQ0FBQTthQUVBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7ZUFBSSxDQUFDLENBQUMsU0FBRixDQUFZLFNBQVosRUFBSjtNQUFBLENBQVAsQ0FBaUMsQ0FBQyxHQUFHLENBQUMsT0FBdEMsQ0FBQSxFQUh3QztJQUFBLENBQTFDLENBNUhBLENBQUE7QUFBQSxJQWlJQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtlQUFJLENBQUMsQ0FBQyxFQUFGLENBQUssR0FBTCxFQUFKO01BQUEsQ0FBUCxDQUFvQixDQUFDLEdBQUcsQ0FBQyxPQUF6QixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFGLENBQUEsQ0FETixDQUFBO0FBQUEsTUFFQSxNQUFBLENBQU8sR0FBUCxDQUFXLENBQUMsT0FBWixDQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEVBQWhCLENBQXBCLENBRkEsQ0FBQTtBQUdBO0FBQUksUUFBQSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQVAsQ0FBYSxjQUFiLENBQUEsQ0FBSjtPQUFBLGNBQUE7QUFBdUMsUUFBQSxVQUFBLENBQXZDO09BSEE7QUFBQSxNQUlBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7ZUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQVAsQ0FBYSxjQUFiLEVBQUo7TUFBQSxDQUFQLENBQXdDLENBQUMsR0FBRyxDQUFDLE9BQTdDLENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFLQSxNQUFBLENBQU8sU0FBQSxHQUFBO2VBQUksQ0FBQyxDQUFDLEVBQUYsQ0FBSyxDQUFDLGNBQUQsQ0FBTCxFQUFKO01BQUEsQ0FBUCxDQUFpQyxDQUFDLEdBQUcsQ0FBQyxPQUF0QyxDQUFBLENBTEEsQ0FBQTthQU1BLE1BQUEsQ0FBTyxDQUFDLENBQUMsTUFBRixDQUFBLENBQVAsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQVAsQ0FBVyxlQUFYLEVBQTRCLEdBQTVCLENBQTNCLEVBUGdDO0lBQUEsQ0FBbEMsQ0FqSUEsQ0FBQTtXQTBJQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQSxHQUFBO2FBQ2xDLE1BQUEsQ0FBTyxDQUFDLENBQUMsWUFBRixDQUFlLHFEQUFmLENBQVAsQ0FBNkUsQ0FBQyxPQUE5RSxDQUFzRixxQ0FBdEYsRUFEa0M7SUFBQSxDQUFwQyxFQTVJNkQ7RUFBQSxDQUEvRCxDQUFBLENBQUE7O0FBZ0pBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBaEpBO0FBQUEiCn0=

//# sourceURL=/home/alisaleemh/.atom/packages/atom-terminal-panel/spec/terminal-spec.coffee
