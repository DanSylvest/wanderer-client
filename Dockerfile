FROM node:16-alpine

WORKDIR /usr/src/app

RUN apk update
RUN apk add bash
RUN apk add nodejs npm

COPY package.json package-lock.json ./

RUN npm install

#CMD ["sh", "-c", "/wait-for-it.sh db:5432 -- ./install.sh"]
CMD ["./deploy/run.sh"]
