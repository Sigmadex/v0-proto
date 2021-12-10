#!/bin/bash

# Check if smart contract deployment has finished
FILE=./src/config/Static.json
while [ ! -f $FILE ]
do
  echo "waiting for deploy script to finish"
  sleep 5
done

# Start the development server
npm start
