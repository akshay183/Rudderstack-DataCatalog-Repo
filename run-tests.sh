#!/bin/bash
# Don't set -e so we can see errors
set +e

echo "========================================"
echo "Building Docker container for testing..."
echo "========================================"
docker-compose -f docker-compose.test.yml build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
    echo "ERROR: Docker build failed with status $BUILD_STATUS"
    exit $BUILD_STATUS
fi

echo ""
echo "========================================"
echo "Starting MongoDB service..."
echo "========================================"
docker-compose -f docker-compose.test.yml up -d mongo
sleep 2

echo ""
echo "========================================"
echo "Initializing MongoDB replica set..."
echo "========================================"
docker-compose -f docker-compose.test.yml run --rm app bash -c "cd /app && ./scripts/mongo-init.sh"
MONGO_INIT_STATUS=$?

if [ $MONGO_INIT_STATUS -ne 0 ]; then
    echo "ERROR: MongoDB initialization failed with status $MONGO_INIT_STATUS"
    echo "Continuing anyway, as it might be already initialized..."
fi

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