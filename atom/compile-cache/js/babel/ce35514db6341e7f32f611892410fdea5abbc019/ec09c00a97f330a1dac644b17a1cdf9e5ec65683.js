function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _path = require('path');

var path = _interopRequireWildcard(_path);

'use babel';

var goodPath = path.join(__dirname, 'files', 'good.py');
var badPath = path.join(__dirname, 'files', 'bad.py');
var emptyPath = path.join(__dirname, 'files', 'empty.py');
var lint = require('../lib/main.js').provideLinter().lint;

describe('The pylint provider for Linter', function () {
  beforeEach(function () {
    waitsForPromise(function () {
      return Promise.all([atom.packages.activatePackage('linter-pylint'), atom.packages.activatePackage('language-python').then(function () {
        return atom.workspace.open(goodPath);
      })]);
    });
  });

  it('should be in the packages list', function () {
    return expect(atom.packages.isPackageLoaded('linter-pylint')).toBe(true);
  });

  it('should be an active package', function () {
    return expect(atom.packages.isPackageActive('linter-pylint')).toBe(true);
  });

  describe('checks bad.py and', function () {
    var editor = null;
    beforeEach(function () {
      waitsForPromise(function () {
        return atom.workspace.open(badPath).then(function (openEditor) {
          editor = openEditor;
        });
      });
    });

    it('finds at least one message', function () {
      return waitsForPromise(function () {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toBeGreaterThan(0);
        });
      });
    });

    it('verifies that message', function () {
      return waitsForPromise(function () {
        return lint(editor).then(function (messages) {
          expect(messages[0].type).toBe('convention');
          expect(messages[0].html).not.toBeDefined();
          expect(messages[0].text).toBe('C0111 Missing module docstring');
          expect(messages[0].filePath).toBe(badPath);
          expect(messages[0].range).toEqual([[0, 0], [0, 4]]);
        });
      });
    });
  });

  it('finds nothing wrong with an empty file', function () {
    waitsForPromise(function () {
      return atom.workspace.open(emptyPath).then(function (editor) {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toBe(0);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', function () {
    waitsForPromise(function () {
      return atom.workspace.open(goodPath).then(function (editor) {
        return lint(editor).then(function (messages) {
          return expect(messages.length).toBe(0);
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvbGludGVyLXB5bGludC9zcGVjL2xpbnRlci1weWxpbnQtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFc0IsTUFBTTs7SUFBaEIsSUFBSTs7QUFGaEIsV0FBVyxDQUFDOztBQUlaLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMxRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQzVELElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQzs7QUFFNUQsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLFlBQU07QUFDL0MsWUFBVSxDQUFDLFlBQU07QUFDZixtQkFBZSxDQUFDO2FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxFQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQztlQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7T0FBQSxDQUM5QixDQUNGLENBQUM7S0FBQSxDQUNILENBQUM7R0FDSCxDQUFDLENBQUM7O0FBRUgsSUFBRSxDQUFDLGdDQUFnQyxFQUFFO1dBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7R0FBQSxDQUNsRSxDQUFDOztB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Y2thZ2VzL2xpbnRlci1weWxpbnQvc3BlYy9saW50ZXItcHlsaW50LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgZ29vZFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZmlsZXMnLCAnZ29vZC5weScpO1xuY29uc3QgYmFkUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaWxlcycsICdiYWQucHknKTtcbmNvbnN0IGVtcHR5UGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaWxlcycsICdlbXB0eS5weScpO1xuY29uc3QgbGludCA9IHJlcXVpcmUoJy4uL2xpYi9tYWluLmpzJykucHJvdmlkZUxpbnRlcigpLmxpbnQ7XG5cbmRlc2NyaWJlKCdUaGUgcHlsaW50IHByb3ZpZGVyIGZvciBMaW50ZXInLCAoKSA9PiB7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGludGVyLXB5bGludCcpLFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtcHl0aG9uJykudGhlbigoKSA9PlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZ29vZFBhdGgpXG4gICAgICAgICksXG4gICAgICBdKVxuICAgICk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgYmUgaW4gdGhlIHBhY2thZ2VzIGxpc3QnLCAoKSA9PlxuICAgIGV4cGVjdChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCgnbGludGVyLXB5bGludCcpKS50b0JlKHRydWUpXG4gICk7XG5cbiAgaXQoJ3Nob3VsZCBiZSBhbiBhY3RpdmUgcGFja2FnZScsICgpID0+XG4gICAgZXhwZWN0KGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCdsaW50ZXItcHlsaW50JykpLnRvQmUodHJ1ZSlcbiAgKTtcblxuICBkZXNjcmliZSgnY2hlY2tzIGJhZC5weSBhbmQnLCAoKSA9PiB7XG4gICAgbGV0IGVkaXRvciA9IG51bGw7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihiYWRQYXRoKS50aGVuKChvcGVuRWRpdG9yKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gb3BlbkVkaXRvcjtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICBpdCgnZmluZHMgYXQgbGVhc3Qgb25lIG1lc3NhZ2UnLCAoKSA9PlxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICAgIGxpbnQoZWRpdG9yKS50aGVuKG1lc3NhZ2VzID0+IGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKSlcbiAgICAgIClcbiAgICApO1xuXG4gICAgaXQoJ3ZlcmlmaWVzIHRoYXQgbWVzc2FnZScsICgpID0+XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT5cbiAgICAgICAgbGludChlZGl0b3IpLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnR5cGUpLnRvQmUoJ2NvbnZlbnRpb24nKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0uaHRtbCkubm90LnRvQmVEZWZpbmVkKCk7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdLnRleHQpLnRvQmUoJ0MwMTExIE1pc3NpbmcgbW9kdWxlIGRvY3N0cmluZycpO1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXS5maWxlUGF0aCkudG9CZShiYWRQYXRoKTtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0ucmFuZ2UpLnRvRXF1YWwoW1swLCAwXSwgWzAsIDRdXSk7XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfSk7XG5cbiAgaXQoJ2ZpbmRzIG5vdGhpbmcgd3Jvbmcgd2l0aCBhbiBlbXB0eSBmaWxlJywgKCkgPT4ge1xuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihlbXB0eVBhdGgpLnRoZW4oZWRpdG9yID0+XG4gICAgICAgIGxpbnQoZWRpdG9yKS50aGVuKG1lc3NhZ2VzID0+IGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMCkpXG4gICAgICApXG4gICAgKTtcbiAgfSk7XG5cbiAgaXQoJ2ZpbmRzIG5vdGhpbmcgd3Jvbmcgd2l0aCBhIHZhbGlkIGZpbGUnLCAoKSA9PiB7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGdvb2RQYXRoKS50aGVuKGVkaXRvciA9PlxuICAgICAgICBsaW50KGVkaXRvcikudGhlbihtZXNzYWdlcyA9PiBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApKVxuICAgICAgKVxuICAgICk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/alisaleemh/.atom/packages/linter-pylint/spec/linter-pylint-spec.js
