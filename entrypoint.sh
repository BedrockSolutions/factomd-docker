#!/usr/bin/env sh

set -xe

./bin/confz --noreload --onetime

./bin/confz&

exec "$@"
