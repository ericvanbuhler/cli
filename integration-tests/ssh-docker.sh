#!/bin/bash

set -o errexit
set -o xtrace

alwaysai app target init --yes --protocol ssh+docker: --hostname localhost --path /tmp/foo321
alwaysai app target exec rm -rf models venv app.py
alwaysai app target install
alwaysai app target start
alwaysai app target shell
