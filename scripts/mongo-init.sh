#!/bin/bash
set -e

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 10

# MongoDB 6.0 uses mongosh, but fall back to mongo if needed
echo "Initializing replica set..."
if command -v mongosh &> /dev/null; then
  echo "Using mongosh..."
  mongosh --host mongo:27017 --eval "rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'mongo:27017' }]
  });"
elif command -v mongo &> /dev/null; then
  echo "Using mongo..."
  mongo --host mongo:27017 --eval "rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'mongo:27017' }]
  });"
else
  echo "Neither mongosh nor mongo command found. Cannot initialize replica set."
  exit 1
fi

echo "MongoDB replica set initialized successfully"
