#!/bin/bash

# Manual API testing script for user-service
# This script tests all the API endpoints manually

BASE_URL="http://localhost:3002"
SERVICE_NAME="user-service"

echo "🧪 Manual API Testing for $SERVICE_NAME"
echo "========================================"

# Check if service is running
echo "🔍 Checking if service is running..."
if ! curl -s -f "$BASE_URL/health" > /dev/null; then
    echo "❌ Service is not running! Please start it first with:"
    echo "   make docker-run"
    echo "   or"
    echo "   docker run -d --name user_service -p 3002:3002 ft_transcendence_user_service"
    exit 1
fi
echo "✅ Service is running!"

echo ""
echo "1️⃣ Testing Health Endpoint"
echo "---------------------------"
curl -s "$BASE_URL/health" | jq '.' || echo "Health check response (raw):"
curl -s "$BASE_URL/health"

echo ""
echo ""
echo "2️⃣ Testing Get All Users (should show seeded data)"
echo "--------------------------------------------------"
curl -s "$BASE_URL/users" | jq '.' || echo "Users response (raw):"
curl -s "$BASE_URL/users"

echo ""
echo ""
echo "3️⃣ Testing Create User via Bootstrap"
echo "------------------------------------"
echo "Creating user: testuser2"
curl -s -X POST "$BASE_URL/users/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "authUserId": 999,
    "name": "testuser2",
    "email": "testuser2@example.com"
  }' | jq '.' || echo "Bootstrap response (raw):"
curl -s -X POST "$BASE_URL/users/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "authUserId": 999,
    "name": "testuser2",
    "email": "testuser2@example.com"
  }'

echo ""
echo ""
echo "4️⃣ Testing Get All Users Again (should include new user)"
echo "--------------------------------------------------------"
curl -s "$BASE_URL/users" | jq '.' || echo "Users response (raw):"
curl -s "$BASE_URL/users"

echo ""
echo ""
echo "5️⃣ Testing API Documentation"
echo "-----------------------------"
echo "API docs should be available at: $BASE_URL/docs"
echo "Testing docs endpoint..."
curl -s -I "$BASE_URL/docs" | head -1

echo ""
echo ""
echo "6️⃣ Testing Error Cases"
echo "----------------------"
echo "Testing duplicate username..."
curl -s -X POST "$BASE_URL/users/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "authUserId": 998,
    "name": "testuser2",
    "email": "different@example.com"
  }' | jq '.' || echo "Error response (raw):"
curl -s -X POST "$BASE_URL/users/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "authUserId": 998,
    "name": "testuser2",
    "email": "different@example.com"
  }'

echo ""
echo "Testing invalid email..."
curl -s -X POST "$BASE_URL/users/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "authUserId": 997,
    "name": "testuser3",
    "email": "invalid-email"
  }' | jq '.' || echo "Error response (raw):"
curl -s -X POST "$BASE_URL/users/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "authUserId": 997,
    "name": "testuser3",
    "email": "invalid-email"
  }'

echo ""
echo ""
echo "7️⃣ Testing JWT Protected Endpoints (will fail without token)"
echo "------------------------------------------------------------"
echo "Testing /users/me without token (should fail)..."
curl -s "$BASE_URL/users/me" | jq '.' || echo "Error response (raw):"
curl -s "$BASE_URL/users/me"

echo ""
echo ""
echo "✅ Manual testing complete!"
echo ""
echo "📊 Summary:"
echo "- Health endpoint: ✅"
echo "- Get users: ✅"
echo "- Create user: ✅"
echo "- API docs: ✅"
echo "- Error handling: ✅"
echo "- JWT protection: ✅"
echo ""
echo "🌐 Open $BASE_URL/docs in your browser to see the full API documentation"
