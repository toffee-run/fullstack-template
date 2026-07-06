#!/bin/sh
set -eux

envsubst < template.yml > traefik.yml

exec "$@"
