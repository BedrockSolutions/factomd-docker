FROM bedrocksolutions/confz:latest as confz

FROM factominc/factomd:v6.2.0-alpine AS factomd

FROM node:10-alpine AS node_modules

WORKDIR /home/node

COPY ./package.json .

RUN npm install --production

FROM alpine:latest

WORKDIR /app

RUN set -xe && \
  apk add --no-cache bash ca-certificates curl git libstdc++ && \
  mkdir /.factom ./bin ./config ./database ./tls && \
  ln -s /app/database /.factom/m2

COPY --from=factomd /go/bin/factomd ./bin
COPY --from=node_modules /home/node/node_modules ./node_modules/
COPY --from=confz /app/confz-alpine ./bin/confz

COPY ./confz.d ./confz.d/
COPY ./entrypoint.sh .

RUN chown -R nobody:nobody /app /.factom

USER nobody:nobody

ENTRYPOINT ["./entrypoint.sh"]

CMD ["start"]

VOLUME /app/config

VOLUME /app/database

EXPOSE 8088 8090 8108 8109 8110
