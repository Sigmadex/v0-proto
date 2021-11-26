FROM node:14-alpine as base

COPY . /hardhat
WORKDIR /hardhat

RUN yarn install --non-interactive --frozen-lockfile

EXPOSE 8545
