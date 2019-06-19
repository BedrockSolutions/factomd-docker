#!/usr/bin/env bash

TAGS=("v6.3.1-rc1" "v6.3.1-rc2" "v6.3.1" "v6.3.1-rc1-anchors" "v6.3.2-rc3" "v6.3.2" )

for tag in "${TAGS[@]}"
do
   docker build --build-arg FACTOMD_TAG=${tag} -t bedrocksolutions/factomd:${tag} .
   docker push bedrocksolutions/factomd:${tag}
done
