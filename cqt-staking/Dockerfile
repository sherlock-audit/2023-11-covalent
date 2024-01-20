FROM node:16.16.0-alpine

COPY contracts /usr/src/app/contracts
COPY ./docker /usr/src/app
COPY ./docker/entrypoint.sh /usr/local/bin

RUN apk update && apk add --no-cache bash

SHELL ["/bin/bash", "-c"]
EXPOSE 8545
WORKDIR /usr/src/app
RUN apk add --no-cache python3 g++ make
RUN npm install
RUN chmod +x entrypoint.sh

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]
