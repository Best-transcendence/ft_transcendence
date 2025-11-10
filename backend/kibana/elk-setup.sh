#!/usr/bin/env bash
set -e

ES_URL="http://elasticsearch:9200"
KIBANA_URL="http://kibana:5601/kibana"
DASHBOARD_FILE="/elk-setup/dashboard-import.ndjson"
ILM_POLICY_FILE="/elk-setup/ilm-policy.json"
DATA_VIEW_ID="logs-star"
DATA_VIEW_TITLE="logs-*"

echo "⏳ Waiting for Elasticsearch to be available..."

# Wait until Elasticsearch is ready
echo "  ... waiting for Elasticsearch to be ready..."
sleep 30

until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ES_URL}" >/dev/null; do
  echo "  ... still waiting for Elasticsearch"
  sleep 10
done

echo "✅ Elasticsearch is up!"
echo "  ... checking cluster health..."
curl -u "elastic:${ELASTIC_PASSWORD}" "${ES_URL}/_cluster/health?pretty"

# Apply ILM policy if exists
if [ -f "$ILM_POLICY_FILE" ]; then
  echo "📦 Applying ILM policy 'logs-policy'..."
  curl -u "elastic:${ELASTIC_PASSWORD}" -X PUT "${ES_URL}/_ilm/policy/logs-policy" \
    -H 'Content-Type: application/json' \
    -d @"$ILM_POLICY_FILE"
  echo ""
  echo "✅ ILM policy applied successfully!"
else
  echo "⚠️ ILM policy file not found at $ILM_POLICY_FILE"
fi

# Wait for Kibana to be ready
echo "⏳ Waiting for Kibana to be available..."
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${KIBANA_URL}/api/status" | grep -q '"state":"green"'; do
  echo "  ... still waiting for Kibana"
  sleep 5
done

echo "✅ Kibana is up!"

# Create index pattern (using saved_objects API for better compatibility)
echo "🧭 Creating index pattern '${DATA_VIEW_TITLE}'..."
RESPONSE=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
  -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/${DATA_VIEW_ID}?overwrite=true" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d "{\"attributes\":{\"title\":\"${DATA_VIEW_TITLE}\",\"timeFieldName\":\"@timestamp\"}}")

PATTERN_ID=""
if echo "${RESPONSE}" | grep -q '"id"'; then
  PATTERN_ID=$(echo "${RESPONSE}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "✅ Index pattern created/updated successfully! (ID: ${PATTERN_ID})"
else
  # Try to check if it already exists
  CHECK=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
    -X GET "${KIBANA_URL}/api/saved_objects/index-pattern/${DATA_VIEW_ID}" \
    -H "kbn-xsrf: true" 2>/dev/null)
  if echo "${CHECK}" | grep -q '"id"'; then
    PATTERN_ID=$(echo "${CHECK}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Index pattern already exists! (ID: ${PATTERN_ID})"
  else
    echo "⚠️ Failed to create index pattern. Response: ${RESPONSE}"
  fi
fi

# Set as default index pattern
if [ -n "$PATTERN_ID" ]; then
  echo "🔧 Setting ${DATA_VIEW_TITLE} as default index pattern..."
  DEFAULT_RESPONSE=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
    -X POST "${KIBANA_URL}/api/kibana/settings/defaultIndex" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d "{\"value\":\"$PATTERN_ID\"}")
  
  if echo "$DEFAULT_RESPONSE" | grep -q '"defaultIndex"'; then
    echo "✅ Default index pattern set successfully!"
  else
    echo "⚠️ Failed to set default index pattern, but pattern exists"
  fi
fi

# Import dashboard if file exists
if [ -f "$DASHBOARD_FILE" ]; then
  echo "📊 Importing Kibana dashboard..."
  IMPORT_RESPONSE=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
    -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
    -H "kbn-xsrf: true" \
    --form file=@"$DASHBOARD_FILE")
  
  if echo "$IMPORT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Dashboard imported successfully!"
  else
    echo "⚠️ Dashboard import may have issues: $IMPORT_RESPONSE"
  fi
else
  echo "⚠️ No dashboard file found at $DASHBOARD_FILE — skipping import"
fi

echo ""
echo "🎉 ELK setup completed successfully!"
echo "   - ILM policy applied: logs-policy"
echo "   - Index pattern created: ${DATA_VIEW_TITLE}"
echo "   - Dashboard imported (if available)"
echo ""
echo "Access Kibana at: https://192.168.1.150/kibana/"
echo "Login with: elastic / changeme"
