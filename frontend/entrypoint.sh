#!/bin/sh
set -eux

export NITRO_PORT=$FRONTEND_PORT

exec "$@"
