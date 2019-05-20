#!/usr/bin/env bash

set -xe

case ${1} in
  start)
    ./bin/confz run
    ./bin/confz watch &
    exec ./start.sh
    ;;

  config)
    exec ./bin/confz display output
    ;;

  schema)
    exec ./bin/confz display schema
    ;;

  shell)
    exec /bin/bash
    ;;

  values)
    exec ./bin/confz display values
    ;;

  *)
    exec "$@"
    ;;
esac
