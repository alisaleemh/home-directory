export PATH="/opt/homebrew/bin:$PATH"

eval "$(starship init zsh)"
# Eternal bash history.
# ---------------------
# Undocumented feature which sets the size to "unlimited".
# http://stackoverflow.com/questions/9457233/unlimited-bash-history
export HISTFILESIZE=
export HISTSIZE=
export HISTTIMEFORMAT="[%F %T] "
# Change the file location because certain bash sessions truncate .bash_history file upon close.
# http://superuser.com/questions/575479/bash-history-truncated-to-500-lines-on-each-login
export HISTFILE=~/.bash_eternal_history
PROMPT_COMMAND="history -a; $PROMPT_COMMAND"
export PATH=$HOME/go/bin:$PATH



eval $(/opt/homebrew/bin/brew shellenv)

PATH="$PATH:/usr/local/go/bin"




HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt appendhistory
bindkey -e

# eternal history

# big big history
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=1000000

_eternal_history_histfile=~/.zsh_eternal_history

# timestamp format
export HISTTIMEFORMAT="%Y-%m-%d %T  "
setopt append_history # append rather then overwrite
setopt extended_history # save timestamp
setopt inc_append_history # add history immediately after typing a command
setopt hist_reduce_blanks # remove superfluous blanks

_eternal_history_mark_for_save() {
  __eternal_history_command_entered=true
}

_eternal_history_save() {
  if $__eternal_history_command_entered; then
    echo $$ $USER "$(fc -liD -1)" >> $_eternal_history_histfile
  fi
  __eternal_history_command_entered=false
}

autoload -U add-zsh-hook
add-zsh-hook preexec _eternal_history_mark_for_save
add-zsh-hook precmd _eternal_history_save

export HISTFILESIZE=
export HISTSIZE=999999999
export HISTFILE=~/.zsh_history

setopt HIST_FIND_NO_DUPS
# following should be turned off, if sharing history via setopt SHARE_HISTORY
setopt INC_APPEND_HISTORY

