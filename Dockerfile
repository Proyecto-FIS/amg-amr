FROM node:15-alpine

WORKDIR /coffaine-sales
COPY package.json .
COPY package-lock.json .
RUN npm install

WORKDIR /coffaine-sales
COPY env env
COPY source source

EXPOSE 8080

CMD npm run start:prod
