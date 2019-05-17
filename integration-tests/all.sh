#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
set -o errexit
set -o xtrace

tsc
rm alwaysai.app.json

alwaysai app init --yes
alwaysai app models add alwaysai/agenet

${DIR}/setup.sh
${DIR}/docker.sh
${DIR}/local.sh
${DIR}/ssh.sh
