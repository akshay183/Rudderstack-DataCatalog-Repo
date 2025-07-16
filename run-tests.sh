#!/bin/bash
echo "Starting MongoDB and running tests..."
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
echo "Cleaning up..."
docker-compose -f docker-compose.test.yml down
MONGOSH_INIT_STATUS=$?

if [ $MONGOSH_INIT_STATUS -ne 0 ]; then
    echo "Mongosh initialization failed, trying with mongo command..."
    # Try with legacy mongo command
    docker-compose -f docker-compose.test.yml exec -T mongo mongo --eval "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})"
    MONGO_INIT_STATUS=$?
    
    if [ $MONGO_INIT_STATUS -ne 0 ]; then
        echo "WARNING: MongoDB initialization failed. Tests requiring transactions may fail."
        echo "Trying one more approach - running the initialization script..."
        
        # Try running the script
        docker-compose -f docker-compose.test.yml exec -T mongo bash -c "chmod +x /scripts/mongo-init.sh && /scripts/mongo-init.sh"
        SCRIPT_INIT_STATUS=$?
        
        if [ $SCRIPT_INIT_STATUS -ne 0 ]; then
            echo "All initialization methods failed. Continuing anyway, as MongoDB might work for basic operations."
        else
            echo "MongoDB replica set initialized successfully via script."
        fi
    else
        echo "MongoDB replica set initialized successfully using mongo command."
    fi
else
    echo "MongoDB replica set initialized successfully using mongosh."
fi

# Wait a moment for the replica set to stabilize
echo "Waiting for replica set to stabilize..."
sleep 5

echo ""
echo "=============================================="
echo "Running tests in Docker container with verbose output..."
echo "=============================================="
docker-compose -f docker-compose.test.yml run --rm app npm test -- --verbose --detectOpenHandles
TEST_STATUS=$?

if [ $TEST_STATUS -ne 0 ]; then
    echo "ERROR: Tests failed with status $TEST_STATUS"
    echo "See above for error details."
else
    echo "Tests completed successfully!"
fi

echo ""
echo "=============================================="
echo "Cleaning up Docker containers..."
echo "=============================================="
docker-compose -f docker-compose.test.yml down

exit $TEST_STATUS