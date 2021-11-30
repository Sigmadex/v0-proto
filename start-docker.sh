#!/bin/bash

IS_DOCKER=$(grep IS_DOCKER ./hardhat/.env | cut -d '=' -f 2-)

if [ $IS_DOCKER == "false" ]
then
  echo "Please set the IS_DOCKER env variable in ./hardhat to true"
  exit 1
fi

export UID

SUBGRAPH_ENV=/subgraph/.env

if [ -f $SUBGRAPH_ENV ]
then
  rm -f $SUBGRAPH_ENV
fi

docker-compose -f docker-compose.dev.yml up


