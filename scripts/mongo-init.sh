#!/bin/bash
set -e

# Wait for MongoDB to be ready
sleep 5

# Initialize replica set
mongosh --host mongo:27017 --eval "rs.initiate({
  _id: 'rs0',
  members: [{ _id: 0, host: 'mongo:27017' }]
});"

echo "MongoDB replica set initialized successfully"
