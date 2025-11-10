#!/bin/sh
set -e

ES_URL="http://elasticsearch:9200"
KIBANA_URL="http://kibana:5601/kibana"
ELASTIC_PASSWORD="${ELASTIC_PASSWORD:-changeme}"

echo "⏳ Waiting for Elasticsearch and Kibana to be ready..."

# Wait for Elasticsearch
sleep 30
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ES_URL}" >/dev/null; do
  echo "  ... waiting for Elasticsearch"
  sleep 5
done

# Wait for Kibana
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${KIBANA_URL}/api/status" | grep -q '"state":"green"'; do
  echo "  ... waiting for Kibana"
  sleep 5
done

echo "✅ Services are ready!"

# Create or update index pattern
echo "🧭 Creating/updating index pattern logs-*..."
RESPONSE=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
  -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/logs-star?overwrite=true" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{"attributes":{"title":"logs-*","timeFieldName":"@timestamp"}}')

PATTERN_ID=""
if echo "${RESPONSE}" | grep -q '"id"'; then
  PATTERN_ID=$(echo "${RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "✅ Index pattern created/updated successfully! (ID: ${PATTERN_ID})"
else
  # Try to check if it already exists
  CHECK=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
    -X GET "${KIBANA_URL}/api/saved_objects/index-pattern/logs-star" \
    -H "kbn-xsrf: true" 2>/dev/null)
  if echo "${CHECK}" | grep -q '"id"'; then
    PATTERN_ID=$(echo "${CHECK}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Index pattern already exists! (ID: ${PATTERN_ID})"
  else
    echo "⚠️ Failed to create index pattern. Response: ${RESPONSE}"
    exit 1
  fi
fi

# Set as default index pattern
if [ -n "$PATTERN_ID" ]; then
  echo "🔧 Setting logs-* as default index pattern..."
  DEFAULT_RESPONSE=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
    -X POST "${KIBANA_URL}/api/kibana/settings/defaultIndex" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "{\"value\":\"$PATTERN_ID\"}")
  
  if echo "$DEFAULT_RESPONSE" | grep -q '"defaultIndex"'; then
    echo "✅ Default index pattern set successfully!"
  else
    echo "⚠️ Failed to set default index pattern, but pattern exists"
    echo "   Response: $DEFAULT_RESPONSE"
  fi
fi

echo "🎉 Kibana setup completed!"

