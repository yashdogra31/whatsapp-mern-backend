FROM node:14-alpine

EXPOSE 9000

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install

COPY . .

CMD ["node","server.js"]

