FROM node:15-alpine

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.9/community' >> /etc/apk/repositories
RUN apk update && apk add mongodb yaml-cpp=0.6.2-r2 && mkdir -p /data/db

WORKDIR /coffaine-sales/frontend
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm install

WORKDIR /coffaine-sales/backend
COPY backend/package.json .
COPY backend/package-lock.json .
RUN npm install

WORKDIR /coffaine-sales/frontend
COPY frontend/public public
COPY frontend/src src
RUN npm run build

WORKDIR /coffaine-sales/backend
COPY backend/env env
COPY backend/source source

EXPOSE 8080

CMD mongod & npm run start:prod
