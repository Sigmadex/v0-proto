#!/bin/bash

docker-compose -f docker-compose.dev.yml down
echo "need sudo to clean /data/postgres and /data/ipfs"
sudo rm -rf ./data
rm -f subgraph/.env

