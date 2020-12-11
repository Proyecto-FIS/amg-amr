FROM node:15-alpine

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

CMD npm run start:prod
