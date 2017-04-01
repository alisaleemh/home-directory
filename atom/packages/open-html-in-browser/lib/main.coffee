{exec} = require 'child_process'
Shell = require 'shell'
{CompositeDisposable} = require 'atom'

module.exports =
  subscriptions: null

  activate: ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add(atom.commands.add('atom-text-editor[data-grammar~="html"]',
      'open-html-in-browser:open': ({target}) =>
        @open(target.getModel().getPath())
    ))
    @subscriptions.add(atom.commands.add('.tree-view',
      'open-html-in-browser:selected-entry': ({currentTarget: target}) =>
        entry =  target?.querySelector('.selected .name')
        filePath = entry?.dataset.path
        return unless filePath?.endsWith('.html')
        @open(filePath)
    ))

  deactivate: ->
    @subscriptions.dispose()

  open: (filePath) ->
    switch process.platform
      when 'darwin'
        exec("open '#{filePath}'")
      when 'linux'
        exec("xdg-open '#{filePath}'")
      when 'win32'
        Shell.openExternal("file:///#{filePath}")
