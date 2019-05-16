#!/usr/bin/env bash

set -xe

case ${1} in
  start)
    ./bin/confz --noreload --onetime
    ./bin/confz --skipinitial&
    exec ./start.sh
    ;;

  shell)
    exec /bin/bash
    ;;

  *)
    exec "$@"
    ;;
esac
