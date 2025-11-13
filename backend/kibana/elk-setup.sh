#!/usr/bin/env bash
# ============================================================================
# ELK STACK SETUP SCRIPT
# ============================================================================
# This script automatically configures the ELK (Elasticsearch, Logstash, Kibana) stack
# when the containers start. It sets up:
# - ILM (Index Lifecycle Management) policy for log retention
# - Kibana index pattern for searching logs
# - Pre-configured dashboards for log visualization
#
# WHAT IS ELK?
# ELK is a log management and analytics platform:
# - Elasticsearch: Stores and indexes logs (like a searchable database)
# - Logstash: Processes and transforms logs before storing them
# - Kibana: Web interface for visualizing and searching logs
# ============================================================================

set -e  # Exit immediately if any command fails

# Service URLs (these are Docker container names)
ES_URL="http://elasticsearch:9200"
KIBANA_URL="http://kibana:5601/kibana"
DASHBOARD_FILE="/elk-setup/dashboard-import.ndjson"
ILM_POLICY_FILE="/elk-setup/ilm-policy.json"
DATA_VIEW_ID="logs-star"
DATA_VIEW_TITLE="logs-*"

echo "⏳ Waiting for Elasticsearch to be available..."

# ============================================================================
# STEP 1: WAIT FOR ELASTICSEARCH
# ============================================================================
# Elasticsearch needs time to start up. We wait and check until it's ready.
# This prevents errors from trying to configure it before it's available.
echo "  ... waiting for Elasticsearch to be ready..."
sleep 30  # Initial wait for container to start

# Keep checking until Elasticsearch responds
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ES_URL}" >/dev/null; do
  echo "  ... still waiting for Elasticsearch"
  sleep 10
done

echo "✅ Elasticsearch is up!"
echo "  ... checking cluster health..."
curl -u "elastic:${ELASTIC_PASSWORD}" "${ES_URL}/_cluster/health?pretty"

# ============================================================================
# STEP 2: APPLY ILM (INDEX LIFECYCLE MANAGEMENT) POLICY
# ============================================================================
# ILM policies automatically manage log retention:
# - Hot phase: Keep recent logs (rollover when size/age limit reached)
# - Delete phase: Automatically delete old logs after 7 days
# This prevents the database from growing indefinitely.
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

# ============================================================================
# STEP 3: WAIT FOR KIBANA
# ============================================================================
# Kibana is the web interface for viewing logs. We wait until it's ready.
echo "⏳ Waiting for Kibana to be available..."
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${KIBANA_URL}/api/status" | grep -q '"state":"green"'; do
  echo "  ... still waiting for Kibana"
  sleep 5
done

echo "✅ Kibana is up!"

# ============================================================================
# STEP 4: CREATE INDEX PATTERN
# ============================================================================
# Index patterns tell Kibana which logs to search.
# "logs-*" matches all log indices (logs-2025.01.15, logs-2025.01.16, etc.)
# This allows searching across all dates in one place.
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

# ============================================================================
# STEP 5: SET AS DEFAULT INDEX PATTERN
# ============================================================================
# Make "logs-*" the default pattern so it's selected automatically when
# users open Kibana. This improves user experience.
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

# ============================================================================
# STEP 6: IMPORT PRE-CONFIGURED DASHBOARD
# ============================================================================
# Dashboards are pre-made visualizations showing:
# - Request counts by service
# - Response times
# - Error rates
# This gives administrators immediate insights without manual setup.
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
