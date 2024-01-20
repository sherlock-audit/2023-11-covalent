#!/bin/sh
# Change to the correct directory
# cd /usr/src/app;
# Run hardhat
echo $ERIGON_NODE
npx hardhat node --fork ${ERIGON_NODE} --fork-block-number 13182263;
# Keep node alive
set -e
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi
exec "$@"