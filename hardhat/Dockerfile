FROM node:14-alpine as base

COPY . /hardhat
WORKDIR /hardhat
COPY package*.json ./
RUN apk --no-cache --virtual build-dependencies add python3 make g++ bash
RUN npm install

EXPOSE 8545
