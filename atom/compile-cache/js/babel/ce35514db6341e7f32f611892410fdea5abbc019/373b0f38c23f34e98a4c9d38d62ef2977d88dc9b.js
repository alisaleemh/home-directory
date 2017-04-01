'use babel';

describe('Atom Clock', function () {

  var AtomClock = undefined;

  beforeEach(function () {
    var workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    var statusBar = undefined;
    waitsForPromise(function () {
      return atom.packages.activatePackage('status-bar').then(function (pack) {
        statusBar = workspaceElement.querySelector('status-bar');
      });
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('atom-clock').then(function (clk) {
        AtomClock = clk.mainModule;
        AtomClock.consumeStatusBar(statusBar);
      });
    });

    waitsForPromise(function () {
      return atom.workspace.open();
    });
  });

  it('should properly load the package', function () {
    expect(AtomClock.atomClockView.element).toBeDefined();

    expect(AtomClock.config.dateFormat['default']).toBe('H:mm');
    expect(AtomClock.config.locale['default']).toBe('en');
    expect(AtomClock.config.refreshInterval['default']).toBe(60);
    expect(AtomClock.config.showClockIcon['default']).toBe(false);
  });

  it('should refresh the ticker when the date format is changed', function () {
    spyOn(AtomClock.atomClockView, 'refreshTicker');

    atom.config.set('atom-clock.dateFormat', 'H');
    expect(AtomClock.atomClockView.refreshTicker).toHaveBeenCalled();
  });

  it('should refresh the ticker when the interval is changed', function () {
    spyOn(AtomClock.atomClockView, 'refreshTicker');

    atom.config.set('atom-clock.refreshInterval', '20');
    expect(AtomClock.atomClockView.refreshTicker).toHaveBeenCalled();
  });

  it('should set the configuration values when clock icon is requested', function () {
    spyOn(AtomClock.atomClockView, 'setConfigValues');

    atom.config.set('atom-clock.showClockIcon', true);
    expect(AtomClock.atomClockView.setConfigValues).toHaveBeenCalled();
  });

  it('should clear the ticker and restart it when refresh is called', function () {
    spyOn(AtomClock.atomClockView, 'clearTicker');
    spyOn(AtomClock.atomClockView, 'startTicker');

    atom.config.set('atom-clock.refreshInterval', '20');
    expect(AtomClock.atomClockView.clearTicker).toHaveBeenCalled();
    expect(AtomClock.atomClockView.startTicker).toHaveBeenCalled();
  });

  it('should hide the clock when toggled', function () {
    atom.commands.dispatch(document.querySelector('atom-workspace'), 'atom-clock:toggle');
    expect(AtomClock.atomClockView.element.style.display).toBe('none');

    atom.commands.dispatch(document.querySelector('atom-workspace'), 'atom-clock:toggle');
    expect(AtomClock.atomClockView.element.style.display).toBe('');
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9zcGVjL2F0b20tY2xvY2stc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7O0FBRVosUUFBUSxDQUFDLFlBQVksRUFBRSxZQUFNOztBQUUzQixNQUFJLFNBQVMsWUFBQSxDQUFBOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDekQsV0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVyQyxRQUFJLFNBQVMsWUFBQSxDQUFBO0FBQ2IsbUJBQWUsQ0FBQzthQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUksRUFBSztBQUMvRSxpQkFBUyxHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQTtPQUN6RCxDQUFDO0tBQUEsQ0FBQyxDQUFBOztBQUVILG1CQUFlLENBQUM7YUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDOUUsaUJBQVMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFBO0FBQzFCLGlCQUFTLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUE7T0FDdEMsQ0FBQztLQUFBLENBQUMsQ0FBQTs7QUFFSCxtQkFBZSxDQUFDO2FBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUU7S0FBQSxDQUFDLENBQUE7R0FDN0MsQ0FBQyxDQUFBOztBQUVGLElBQUUsQ0FBQyxrQ0FBa0MsRUFBRSxZQUFNO0FBQzNDLFVBQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBOztBQUVyRCxVQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLFdBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN4RCxVQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLFdBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNsRCxVQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxlQUFlLFdBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUN6RCxVQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLFdBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUMzRCxDQUFDLENBQUE7O0FBRUYsSUFBRSxDQUFDLDJEQUEyRCxFQUFFLFlBQU07QUFDcEUsU0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUE7O0FBRS9DLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQzdDLFVBQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUE7R0FDakUsQ0FBQyxDQUFBOztBQUVGLElBQUUsQ0FBQyx3REFBd0QsRUFBRSxZQUFNO0FBQ2pFLFNBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFBOztBQUUvQyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNuRCxVQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0dBQ2pFLENBQUMsQ0FBQTs7QUFFRixJQUFFLENBQUMsa0VBQWtFLEVBQUUsWUFBTTtBQUMzRSxTQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBOztBQUVqRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNqRCxVQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0dBQ25FLENBQUMsQ0FBQTs7QUFFRixJQUFFLENBQUMsK0RBQStELEVBQUUsWUFBTTtBQUN4RSxTQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQTtBQUM3QyxTQUFLLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQTs7QUFFN0MsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDbkQsVUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtBQUM5RCxVQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0dBQy9ELENBQUMsQ0FBQTs7QUFFRixJQUFFLENBQUMsb0NBQW9DLEVBQUUsWUFBTTtBQUM3QyxRQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtBQUNyRixVQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFbEUsUUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLENBQUE7QUFDckYsVUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7R0FDL0QsQ0FBQyxDQUFBO0NBRUgsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL2FsaXNhbGVlbWgvLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9zcGVjL2F0b20tY2xvY2stc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5kZXNjcmliZSgnQXRvbSBDbG9jaycsICgpID0+IHtcblxuICBsZXQgQXRvbUNsb2NrXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgbGV0IHN0YXR1c0JhclxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnc3RhdHVzLWJhcicpLnRoZW4oKHBhY2spID0+IHtcbiAgICAgIHN0YXR1c0JhciA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3Rvcignc3RhdHVzLWJhcicpXG4gICAgfSkpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20tY2xvY2snKS50aGVuKChjbGspID0+IHtcbiAgICAgIEF0b21DbG9jayA9IGNsay5tYWluTW9kdWxlXG4gICAgICBBdG9tQ2xvY2suY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpXG4gICAgfSkpXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gYXRvbS53b3Jrc3BhY2Uub3BlbigpKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgcHJvcGVybHkgbG9hZCB0aGUgcGFja2FnZScsICgpID0+IHtcbiAgICBleHBlY3QoQXRvbUNsb2NrLmF0b21DbG9ja1ZpZXcuZWxlbWVudCkudG9CZURlZmluZWQoKVxuXG4gICAgZXhwZWN0KEF0b21DbG9jay5jb25maWcuZGF0ZUZvcm1hdC5kZWZhdWx0KS50b0JlKCdIOm1tJylcbiAgICBleHBlY3QoQXRvbUNsb2NrLmNvbmZpZy5sb2NhbGUuZGVmYXVsdCkudG9CZSgnZW4nKVxuICAgIGV4cGVjdChBdG9tQ2xvY2suY29uZmlnLnJlZnJlc2hJbnRlcnZhbC5kZWZhdWx0KS50b0JlKDYwKVxuICAgIGV4cGVjdChBdG9tQ2xvY2suY29uZmlnLnNob3dDbG9ja0ljb24uZGVmYXVsdCkudG9CZShmYWxzZSlcbiAgfSlcblxuICBpdCgnc2hvdWxkIHJlZnJlc2ggdGhlIHRpY2tlciB3aGVuIHRoZSBkYXRlIGZvcm1hdCBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgIHNweU9uKEF0b21DbG9jay5hdG9tQ2xvY2tWaWV3LCAncmVmcmVzaFRpY2tlcicpXG5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tY2xvY2suZGF0ZUZvcm1hdCcsICdIJylcbiAgICBleHBlY3QoQXRvbUNsb2NrLmF0b21DbG9ja1ZpZXcucmVmcmVzaFRpY2tlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCByZWZyZXNoIHRoZSB0aWNrZXIgd2hlbiB0aGUgaW50ZXJ2YWwgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICBzcHlPbihBdG9tQ2xvY2suYXRvbUNsb2NrVmlldywgJ3JlZnJlc2hUaWNrZXInKVxuXG4gICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLWNsb2NrLnJlZnJlc2hJbnRlcnZhbCcsICcyMCcpXG4gICAgZXhwZWN0KEF0b21DbG9jay5hdG9tQ2xvY2tWaWV3LnJlZnJlc2hUaWNrZXIpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgc2V0IHRoZSBjb25maWd1cmF0aW9uIHZhbHVlcyB3aGVuIGNsb2NrIGljb24gaXMgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgIHNweU9uKEF0b21DbG9jay5hdG9tQ2xvY2tWaWV3LCAnc2V0Q29uZmlnVmFsdWVzJylcblxuICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1jbG9jay5zaG93Q2xvY2tJY29uJywgdHJ1ZSlcbiAgICBleHBlY3QoQXRvbUNsb2NrLmF0b21DbG9ja1ZpZXcuc2V0Q29uZmlnVmFsdWVzKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGNsZWFyIHRoZSB0aWNrZXIgYW5kIHJlc3RhcnQgaXQgd2hlbiByZWZyZXNoIGlzIGNhbGxlZCcsICgpID0+IHtcbiAgICBzcHlPbihBdG9tQ2xvY2suYXRvbUNsb2NrVmlldywgJ2NsZWFyVGlja2VyJylcbiAgICBzcHlPbihBdG9tQ2xvY2suYXRvbUNsb2NrVmlldywgJ3N0YXJ0VGlja2VyJylcblxuICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1jbG9jay5yZWZyZXNoSW50ZXJ2YWwnLCAnMjAnKVxuICAgIGV4cGVjdChBdG9tQ2xvY2suYXRvbUNsb2NrVmlldy5jbGVhclRpY2tlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgZXhwZWN0KEF0b21DbG9jay5hdG9tQ2xvY2tWaWV3LnN0YXJ0VGlja2VyKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGhpZGUgdGhlIGNsb2NrIHdoZW4gdG9nZ2xlZCcsICgpID0+IHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20td29ya3NwYWNlJyksICdhdG9tLWNsb2NrOnRvZ2dsZScpXG4gICAgZXhwZWN0KEF0b21DbG9jay5hdG9tQ2xvY2tWaWV3LmVsZW1lbnQuc3R5bGUuZGlzcGxheSkudG9CZSgnbm9uZScpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20td29ya3NwYWNlJyksICdhdG9tLWNsb2NrOnRvZ2dsZScpXG4gICAgZXhwZWN0KEF0b21DbG9jay5hdG9tQ2xvY2tWaWV3LmVsZW1lbnQuc3R5bGUuZGlzcGxheSkudG9CZSgnJylcbiAgfSlcblxufSlcbiJdfQ==
//# sourceURL=/home/alisaleemh/.atom/packages/atom-clock/spec/atom-clock-spec.js