#!/usr/bin/env bash

set -e

case ${1} in
  start)
    ./bin/confz run
    ./bin/confz watch &
    exec ./start.sh
    ;;

  config)
    exec ./bin/confz display values
    ;;

  files)
    exec ./bin/confz display output
    ;;

  help)
    echo "
  Usage: docker run [options] bedrocksolutions/factomd:<tag> [command]

  Available commands:

    start: Process config files and start factomd. This is the default.
    config: Display the merged YAML configuration.
    files: Display the generated start script, factomd.conf, etc.
    help: Display this message.
    schema: Display the JSON schema that validates the YAML config files.
    shell: Get a bash shell into the container.
"
      ;;

  schema)
    exec ./bin/confz display schema
    ;;

  shell)
    exec /bin/bash
    ;;

  *)
    ./bin/confz run
    exec "$@"
    ;;
esac
