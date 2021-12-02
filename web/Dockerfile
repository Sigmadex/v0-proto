FROM node:16

WORKDIR /web
RUN mkdir -p /app/node_modules
RUN chown node:node /app/node_modules

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
