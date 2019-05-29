#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
set -o errexit
set -o xtrace

rm -f alwaysai.app.json

alwaysai app init --yes
alwaysai app models add alwaysai/agenet

${DIR}/setup.sh
${DIR}/docker.sh
${DIR}/ssh.sh
${DIR}/ssh-docker.sh
${DIR}/local.sh
