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

# Create index pattern
echo "🧭 Creating index pattern logs-*..."
RESPONSE=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
  -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/logs-star" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{"attributes":{"title":"logs-*","timeFieldName":"@timestamp"}}')

if echo "${RESPONSE}" | grep -q '"id"'; then
  echo "✅ Index pattern created successfully!"
else
  echo "⚠️ Index pattern may already exist or creation failed"
fi

echo "🎉 Kibana setup completed!"

