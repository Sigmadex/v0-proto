#!/bin/bash

docker-compose -f docker-compose.dev.yml down
echo "need sudo to clean /data/postgres and /data/ipfs"
sudo rm -rf ./data
rm -rf ./web/src/config/artifacts
rm -rf ./web/src/config/Static.json
sudo rm -rf ./subgraph/subgraph.yaml
rm -f subgraph/.env

