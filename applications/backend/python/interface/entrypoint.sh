#!/bin/sh
set -eux

export GRANIAN_PORT=$PYTHON_INTERFACE_PORT

exec "$@"
