mainModule = require '../lib/main'
{hasCommand} = require './spec-helper'

describe "OpenHtmlInBrowser", ->
  [editor, editorElement, otherEditor, otherEditorElement, activationPromise] = []

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('open-html-in-browser')
    spyOn(mainModule, 'open')

    waitsForPromise ->
      atom.packages.activatePackage('language-html')

    waitsForPromise ->
      atom.workspace.open('test.coffee').then((_editor) ->
        otherEditor = _editor
        otherEditorElement = atom.views.getView(otherEditor)
      )

    waitsForPromise ->
      atom.workspace.open('test.html').then((_editor) ->
        editor = _editor
        editorElement = atom.views.getView(editor)
      )

  describe "when the open-html-in-browser:open event is triggered", ->
    it "open browser", ->
      atom.commands.dispatch editorElement, 'open-html-in-browser:open'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(mainModule.open).toHaveBeenCalled()
        expect(mainModule.open).toHaveBeenCalledWith(editor.getPath())

    it 'creates the commands', ->
      expect(hasCommand(editorElement, 'open-html-in-browser:open')).toBeTruthy()
      expect(hasCommand(otherEditorElement, 'open-html-in-browser:open')).toBeFalsy()

      atom.commands.dispatch editorElement, 'open-html-in-browser:open'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(hasCommand(editorElement, 'open-html-in-browser:open')).toBeTruthy()
        expect(hasCommand(otherEditorElement, 'open-html-in-browser:open')).toBeFalsy()
