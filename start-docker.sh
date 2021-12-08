#!/bin/bash
export UID

IS_DOCKER=$(grep IS_DOCKER ./hardhat/.env | cut -d '=' -f 2-)

if [ $IS_DOCKER == "false" ]
then
  echo "Please set the IS_DOCKER env variable in ./hardhat to true"
  exit 1
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

docker-compose up


