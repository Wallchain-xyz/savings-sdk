#!/bin/sh

set -e
# Next lines updates config to enable debug endpoints to be able to reset state in tests
sed -i ':a;N;$!ba;s/\n}/,\n    "enable-debug-endpoints": true\n}/g' alto-config.json
sed -i 's/fatal/info/g' alto-config.json
pnpm run start
