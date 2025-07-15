#!/bin/bash
set -e

echo "Building Docker container for testing..."
docker-compose -f docker-compose.test.yml build

echo "Running tests in Docker container..."
docker-compose -f docker-compose.test.yml run --rm app

echo "Tests completed."