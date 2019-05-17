#!/bin/bash

set -o errexit
set -o xtrace

alwaysai app target init --yes --protocol docker:
alwaysai app target exec rm -rf models venv
alwaysai app target install
alwaysai app target start
alwaysai app target shell
