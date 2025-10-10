#!/bin/bash

# Test script for user-service Docker container
echo "🐳 Testing user-service Docker setup..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t ft_transcendence_user_service .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully!"

# Run the container
echo "🚀 Starting container..."
docker run -d \
  --name test_user_service \
  -p 3002:3002 \
  -e USER_SERVICE_PORT=3002 \
  -e USER_SERVICE_URL=http://localhost:3002 \
  -e USER_DATABASE_URL=file:./data/user.db \
  -e JWT_SECRET=super-secret-pass \
  -e NODE_ENV=production \
  ft_transcendence_user_service

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

echo "✅ Container started successfully!"

# Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost:3002/health

if [ $? -eq 0 ]; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker logs test_user_service
    docker stop test_user_service
    docker rm test_user_service
    exit 1
fi

# Test API documentation
echo "📚 Testing API documentation..."
curl -f http://localhost:3002/docs

if [ $? -eq 0 ]; then
    echo "✅ API documentation accessible!"
else
    echo "❌ API documentation not accessible!"
fi

# Show container logs
echo "📋 Container logs:"
docker logs test_user_service

# Clean up
echo "🧹 Cleaning up..."
docker stop test_user_service
docker rm test_user_service

echo "✅ Test completed successfully!"
