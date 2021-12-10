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
SUBGRAPH=/subgraph/subgraph.yaml
while [ ! -f $SUBGRAPH ]
do
  echo "waiting for parser to generate subgraph.yaml"
  sleep 1
done
rm -rf /subgraph/.env
npm run codegen 

# Sometimes the graph-node container is not ready 
# so we wrapped the deployment command in the following block to automatically 
# retry on connection failure.
RETRIES=0
until [ "$RETRIES" -ge 5 ]
do
  npm run create-local:docker && npm run deploy-local:docker && break
  RETRIES=$((RETRIES+1))
  sleep 5
done
