#!/bin/bash

set -o errexit
set -o xtrace

rm alwaysai.app.json

cat >app.py <<EOF
import datetime
import time

def main():
    while True:
        print('foo')
        time.sleep(1)
if __name__ == "__main__":
    main()
EOF

alwaysai app init --yes
alwaysai app models search
alwaysai app models add alwaysai/agenet
