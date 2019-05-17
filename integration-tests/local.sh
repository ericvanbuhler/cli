#!/bin/bash

set -o errexit
set -o xtrace

rm -rf models venv
alwaysai app install
alwaysai app start
