FROM bedrocksolutions/confz:latest as confz

FROM factominc/factomd:v6.2.2-alpine AS factomd

FROM node:10-alpine AS node_modules

WORKDIR /home/node

COPY ./package.json .

RUN npm install --production

FROM alpine:latest

WORKDIR /app

RUN set -xe && \
  apk add --no-cache bash libstdc++ && \
  addgroup -g 65530 -S app && \
  adduser -u 65530 -h /app -G app -S app && \
  mkdir ./.factom ./bin ./database ./tls ./values && \
  ln -s ../database ./.factom/m2

COPY --from=factomd /go/bin/factomd ./bin
COPY --from=node_modules /home/node/node_modules ./node_modules/
COPY --from=confz /app/confz-alpine ./bin/confz

COPY ./confz.d ./confz.d/
COPY ./entrypoint.sh .

RUN chown -R app:app .

VOLUME /app/database

VOLUME /app/values

USER app:app

ENTRYPOINT ["./entrypoint.sh"]

CMD ["start"]
