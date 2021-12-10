#!/bin/bash

if [[ "$OSTYPE" != "darwin"* ]]; then 
  export UID
fi

SUBGRAPH_ENV=${pwd}/subgraph/.env

if [ -f $SUBGRAPH_ENV ]
then
  rm -f $SUBGRAPH_ENV
fi

DATA_DIR=${pwd}/data

if [ -d $DATA_DIR ]
then
  echo 'Need sudo to remove psql and ipfs dirs for subgraph not to fail'
  sudo rm -rf $DATA_DIR
fi

rm -rf web/src/config

docker-compose up


