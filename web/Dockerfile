FROM node:16

WORKDIR /web
RUN mkdir -p /web/node_modules
RUN chown node:node /web/node_modules

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
