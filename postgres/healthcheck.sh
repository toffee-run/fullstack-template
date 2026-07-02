#!/bin/bash
set -euxo pipefail

export PGPASSWORD=$POSTGRES_PASSWORD

args=(
	--username $POSTGRES_USER
	--dbname $POSTGRES_DB
	--quiet --no-align --tuples-only
)

if select=$(echo "SELECT 1" | psql ${args[@]}) && [ $select = "1" ]; then
	exit 0
fi

exit 1
