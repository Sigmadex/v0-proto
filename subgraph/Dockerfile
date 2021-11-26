FROM node:16
RUN apt-get update || : && apt-get install python3 -y
RUN apt-get install -y python3-pip

RUN pip3 install python-dotenv pyyaml

WORKDIR /subgraph

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8545
