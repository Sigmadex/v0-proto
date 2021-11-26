#!/bin/bash
set -e

FILE=/subgraph/.env
while [ ! -f $FILE ]
do
  echo "waiting for deploy script to finish"
  sleep 5
done
echo $FILE
python3 parse.py
rm -rf /subgraph/.env
npm run codegen
npm run create-local:docker
npm run deploy-local:docker
