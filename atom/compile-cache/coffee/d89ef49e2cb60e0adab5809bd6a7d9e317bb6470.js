(function() {
  describe('editor-linter', function() {
    var EditorLinter, editorLinter, getMessage, textEditor, wait, _ref;
    _ref = require('./common'), getMessage = _ref.getMessage, wait = _ref.wait;
    EditorLinter = require('../lib/editor-linter');
    editorLinter = null;
    textEditor = null;
    beforeEach(function() {
      global.setTimeout = require('remote').getGlobal('setTimeout');
      global.setInterval = require('remote').getGlobal('setInterval');
      return waitsForPromise(function() {
        atom.workspace.destroyActivePaneItem();
        return atom.workspace.open(__dirname + '/fixtures/file.txt').then(function() {
          if (editorLinter != null) {
            editorLinter.dispose();
          }
          textEditor = atom.workspace.getActiveTextEditor();
          return editorLinter = new EditorLinter(textEditor);
        });
      });
    });
    describe('::constructor', function() {
      return it("cries when provided argument isn't a TextEditor", function() {
        expect(function() {
          return new EditorLinter;
        }).toThrow();
        expect(function() {
          return new EditorLinter(null);
        }).toThrow();
        return expect(function() {
          return new EditorLinter(55);
        }).toThrow();
      });
    });
    describe('::{add, remove}Message', function() {
      return it('adds/removes decorations from the editor', function() {
        var countDecorations, message;
        countDecorations = textEditor.getDecorations().length;
        editorLinter.underlineIssues = true;
        message = getMessage('Hey!', __dirname + '/fixtures/file.txt', [[0, 1], [0, 2]]);
        editorLinter.addMessage(message);
        expect(textEditor.getDecorations().length).toBe(countDecorations + 1);
        editorLinter.deleteMessage(message);
        return expect(textEditor.getDecorations().length).toBe(countDecorations);
      });
    });
    describe('::getMessages', function() {
      return it('returns a set of messages', function() {
        var message, messageSet;
        message = getMessage('Hey!', __dirname + '/fixtures/file.txt', [[0, 1], [0, 2]]);
        messageSet = editorLinter.getMessages();
        editorLinter.addMessage(message);
        expect(messageSet.has(message)).toBe(true);
        editorLinter.deleteMessage(message);
        return expect(messageSet.has(message)).toBe(false);
      });
    });
    describe('::onDidMessage{Add, Change, Delete}', function() {
      return it('notifies us of the changes to messages', function() {
        var message, messageAdd, messageChange, messageRemove;
        message = getMessage('Hey!', __dirname + '/fixtures/file.txt', [[0, 1], [0, 2]]);
        messageAdd = jasmine.createSpy('messageAdd');
        messageChange = jasmine.createSpy('messageChange');
        messageRemove = jasmine.createSpy('messageRemove');
        editorLinter.onDidMessageAdd(messageAdd);
        editorLinter.onDidMessageChange(messageChange);
        editorLinter.onDidMessageDelete(messageRemove);
        editorLinter.addMessage(message);
        expect(messageAdd).toHaveBeenCalled();
        expect(messageAdd).toHaveBeenCalledWith(message);
        expect(messageChange).toHaveBeenCalled();
        expect(messageChange.mostRecentCall.args[0].type).toBe('add');
        expect(messageChange.mostRecentCall.args[0].message).toBe(message);
        editorLinter.deleteMessage(message);
        expect(messageRemove).toHaveBeenCalled();
        expect(messageRemove).toHaveBeenCalledWith(message);
        expect(messageChange.mostRecentCall.args[0].type).toBe('delete');
        return expect(messageChange.mostRecentCall.args[0].message).toBe(message);
      });
    });
    describe('::active', function() {
      return it('updates currentFile attribute on the messages', function() {
        var message;
        message = getMessage('Hey!', __dirname + '/fixtures/file.txt', [[0, 1], [0, 2]]);
        editorLinter.addMessage(message);
        expect(message.currentFile).toBe(true);
        editorLinter.active = false;
        expect(message.currentFile).toBe(false);
        editorLinter.deleteMessage(message);
        editorLinter.addMessage(message);
        return expect(message.currentFile).toBe(false);
      });
    });
    describe('::{calculateLineMessages, onDidCalculateLineMessages}', function() {
      return it('works and also ignores', function() {
        var listener, message;
        listener = jasmine.createSpy('onDidCalculateLineMessages');
        message = getMessage('Hey!', __dirname + '/fixtures/file.txt', [[0, 1], [0, 2]]);
        editorLinter.addMessage(message);
        editorLinter.onDidCalculateLineMessages(listener);
        atom.config.set('linter.showErrorTabLine', true);
        expect(editorLinter.calculateLineMessages(0)).toBe(1);
        expect(editorLinter.countLineMessages).toBe(1);
        expect(listener).toHaveBeenCalledWith(1);
        atom.config.set('linter.showErrorTabLine', false);
        expect(editorLinter.calculateLineMessages(0)).toBe(0);
        expect(editorLinter.countLineMessages).toBe(0);
        expect(listener).toHaveBeenCalledWith(0);
        atom.config.set('linter.showErrorTabLine', true);
        expect(editorLinter.calculateLineMessages(0)).toBe(1);
        expect(editorLinter.countLineMessages).toBe(1);
        return expect(listener).toHaveBeenCalledWith(1);
      });
    });
    describe('::{handle, add, remove}Gutter', function() {
      return it('handles the attachment and detachment of gutter to text editor', function() {
        editorLinter.gutterEnabled = false;
        expect(editorLinter.gutter === null).toBe(true);
        editorLinter.gutterEnabled = true;
        editorLinter.handleGutter();
        expect(editorLinter.gutter === null).toBe(false);
        editorLinter.gutterEnabled = false;
        editorLinter.handleGutter();
        expect(editorLinter.gutter === null).toBe(true);
        editorLinter.addGutter();
        expect(editorLinter.gutter === null).toBe(false);
        editorLinter.removeGutter();
        expect(editorLinter.gutter === null).toBe(true);
        editorLinter.removeGutter();
        return expect(editorLinter.gutter === null).toBe(true);
      });
    });
    describe('::onShouldLint', function() {
      it('is triggered on save', function() {
        var timesTriggered;
        timesTriggered = 0;
        editorLinter.onShouldLint(function() {
          return timesTriggered++;
        });
        textEditor.save();
        textEditor.save();
        textEditor.save();
        textEditor.save();
        textEditor.save();
        return expect(timesTriggered).toBe(5);
      });
      return it('respects lintOnFlyInterval config', function() {
        var flyStatus, timeCalled, timeDid;
        timeCalled = null;
        flyStatus = null;
        atom.config.set('linter.lintOnFlyInterval', 300);
        editorLinter.onShouldLint(function(fly) {
          flyStatus = fly;
          return timeCalled = new Date();
        });
        timeDid = new Date();
        editorLinter.editor.insertText("Hey\n");
        return waitsForPromise(function() {
          return wait(300).then(function() {
            expect(timeCalled !== null).toBe(true);
            expect(flyStatus !== null).toBe(true);
            expect(flyStatus).toBe(true);
            expect(timeCalled - timeDid).toBeLessThan(400);
            atom.config.set('linter.lintOnFlyInterval', 600);
            timeCalled = null;
            flyStatus = null;
            timeDid = new Date();
            editorLinter.editor.insertText("Hey\n");
            return wait(600);
          }).then(function() {
            expect(timeCalled !== null).toBe(true);
            expect(flyStatus !== null).toBe(true);
            expect(flyStatus).toBe(true);
            expect(timeCalled - timeDid).toBeGreaterThan(599);
            return expect(timeCalled - timeDid).toBeLessThan(700);
          });
        });
      });
    });
    return describe('::onDidDestroy', function() {
      return it('is called when TextEditor is destroyed', function() {
        var didDestroy;
        didDestroy = false;
        editorLinter.onDidDestroy(function() {
          return didDestroy = true;
        });
        textEditor.destroy();
        return expect(didDestroy).toBe(true);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYWxpc2FsZWVtaC8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9lZGl0b3ItbGludGVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLDhEQUFBO0FBQUEsSUFBQSxPQUFxQixPQUFBLENBQVEsVUFBUixDQUFyQixFQUFDLGtCQUFBLFVBQUQsRUFBYSxZQUFBLElBQWIsQ0FBQTtBQUFBLElBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxzQkFBUixDQURmLENBQUE7QUFBQSxJQUVBLFlBQUEsR0FBZSxJQUZmLENBQUE7QUFBQSxJQUdBLFVBQUEsR0FBYSxJQUhiLENBQUE7QUFBQSxJQUtBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLE9BQUEsQ0FBUSxRQUFSLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsWUFBNUIsQ0FBcEIsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLFdBQVAsR0FBcUIsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixhQUE1QixDQURyQixDQUFBO2FBRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7QUFDZCxRQUFBLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQWYsQ0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBQSxHQUFZLG9CQUFoQyxDQUFxRCxDQUFDLElBQXRELENBQTJELFNBQUEsR0FBQTs7WUFDekQsWUFBWSxDQUFFLE9BQWQsQ0FBQTtXQUFBO0FBQUEsVUFDQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBRGIsQ0FBQTtpQkFFQSxZQUFBLEdBQW1CLElBQUEs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

//# sourceURL=/home/alisaleemh/.atom/packages/linter/spec/editor-linter-spec.coffee
