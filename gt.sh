#!/usr/bin/bash
# Start a gnome-termianl with a named history file
# pass the terminal name as arg to this script

HISTDIR="$HOME/.histories"

if [[ ! -d $HISTDIR ]]; then
	echo ".. creating histdir $HISTDIR"
	mkdir -p $HISTDIR
fi

GT_NAME=""

if [ -z "$1" ]; then
  GT_NAME="default"
  ls $HISTDIR
  exit
else
  GT_NAME="$1"
fi

PROFILE_NAME=""
if [ -z "$2" ]; then
  PROFILE_NAME="tango-dark"
else
  PROFILE_NAME="$2"
fi

[[ -d "$HISTDIR" ]] || mkdir --mode=700 "$HISTDIR"
[[ -d "$HISTDIR" ]] && chmod 700 "$HISTDIR"

export HISTFILE="$HISTDIR/$GT_NAME"
export HISTCONTROL=erasedups:ignoreboth
export HISTSIZE=2000
export HISTFILESIZE=3000
export HISTIGNORE="ls:ll:lla:lal:h:cl:clear:cd:pwd:gt.sh:*AWS_*:*AIDER_*"

# https://unix.stackexchange.com/a/18443
shopt -s histappend
#export PROMPT_COMMAND="history -n; history -w; history -c; history -r; $PROMPT_COMMAND"
export PROMPT_COMMAND="history -a; $PROMPT_COMMAND"

RAND_X=$((100 + $RANDOM % 100))
RAND_Y=$((750 + $RANDOM % 100))

echo $RANDOM
echo "$RAND_X+$RAND_Y"

echo "Starting gnome-terminal $GT_NAME"
echo "Appending history to $HISTFILE"
echo "HISTCONTROL=$HISTCONTROL"
gnome-terminal -p --title=$GT_NAME --profile=$PROFILE_NAME --geometry="140x24+${RAND_X}+${RAND_Y}"
