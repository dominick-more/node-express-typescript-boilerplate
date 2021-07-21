FROM node:alpine

USER node

RUN cd ~ && mkdir -p ./node-app

WORKDIR /home/node/node-app

RUN chown -R node:node .

COPY package.json yarn.lock ./

COPY package.json ./

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
