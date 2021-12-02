FROM node:14-alpine as base

COPY . /hardhat
WORKDIR /hardhat
COPY package*.json ./
RUN npm install

EXPOSE 8545
