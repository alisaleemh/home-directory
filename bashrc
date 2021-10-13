PS1="\n\[\033[1;36m\]\$(parse_file_count) files \[\033[1;33m\]\$(parse_pwd_size)b\[\033[0m\] \[\033[35m\]\d\[\033[1;36m\]\$(parse_git_branch)\n\[\033[32m\]\[\033[1;31m\]\u@\h:\[\033[1;34m\]\w\n$ \[\033[0m\]"

#BASH PROMPT FUNCTIONS

parse_git_branch() {
  git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

parse_file_count() {
  ls -1 | wc -l | sed 's: ::g'
}

parse_pwd_size() {
  ls -lah | grep -m 1 total | sed 's/total //'
}
