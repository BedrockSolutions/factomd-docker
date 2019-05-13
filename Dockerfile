FROM bedrocksolutions/confz:latest as confz

FROM factominc/factomd:v6.2.2-alpine AS factomd

FROM node:10-alpine AS node_modules

WORKDIR /home/node

COPY ./package.json .

RUN npm install --production

FROM alpine:latest

WORKDIR /home/app

COPY --from=confz /home/app/confz-alpine ./bin/confz
COPY --from=factomd /go/bin/factomd ./bin
COPY --from=node_modules /home/node/node_modules ./node_modules/

COPY ./confz.d ./confz.d/
COPY ./entrypoint.sh .

RUN set -xe && \
  apk add --no-cache libstdc++ shadow && \
  groupadd -g 1000 app && \
  useradd -r -m -u 1000 -g app app && \
  mkdir ./.factom ./database ./tls ./values && \
  ln -s ../database ./.factom/m2 && \
  chown -R app:app .

VOLUME /home/app/.fa

USER app

ENTRYPOINT ["./entrypoint.sh"]

CMD ["./factomd.sh"]
