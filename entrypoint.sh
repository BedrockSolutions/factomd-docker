#!/usr/bin/env bash

set -xe

case ${1} in
  start)
    ./bin/confz run
    ./bin/confz watch &
    exec ./start.sh
    ;;

  schema)
    exec ./bin/confz schema --print-stack
    ;;

  shell)
    exec /bin/bash
    ;;

  validate)
    exec ./bin/confz run
    ;;

  *)
    exec "$@"
    ;;
esac
