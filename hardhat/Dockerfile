FROM node:14-alpine as base

COPY . /hardhat
WORKDIR /hardhat
RUN npm config set unsafe-perm true
RUN npm install
RUN mkdir /hardhat/cache
#RUN chown -R node /hardhat/cache

EXPOSE 8545
