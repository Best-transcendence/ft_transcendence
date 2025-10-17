#!/usr/bin/env bash
set -e

ES_URL="http://elasticsearch:9200"
KIBANA_URL="http://localhost:5601"
DASHBOARD_FILE="/usr/share/kibana/elk-setup/dashboard-import.ndjson"
ILM_POLICY_FILE="/usr/share/kibana/elk-setup/ilm-policy.json"

echo "⏳ Waiting for Elasticsearch to be available..."

# Wait until Elasticsearch is ready
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ES_URL}" >/dev/null; do
  echo "  ... still waiting for Elasticsearch"
  sleep 5
done

echo "✅ Elasticsearch is up!"

# Check cluster health (optional)
curl -u "elastic:${ELASTIC_PASSWORD}" "${ES_URL}/_cluster/health?pretty"

# Optional: apply ILM policy if exists
if [ -f "$ILM_POLICY_FILE" ]; then
  echo "📦 Applying ILM policy..."
  curl -u "elastic:${ELASTIC_PASSWORD}" -X PUT "${ES_URL}/_ilm/policy/filebeat-policy" \
    -H 'Content-Type: application/json' \
    -d @"$ILM_POLICY_FILE"
fi

# Wait for Kibana to be ready
echo "⏳ Waiting for Kibana to be available..."
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${KIBANA_URL}/api/status" | grep -q '"state":"green"'; do
  echo "  ... still waiting for Kibana"
  sleep 5
done

echo "✅ Kibana is up!"

# Import dashboard if file exists
if [ -f "$DASHBOARD_FILE" ]; then
  echo "📊 Importing Kibana dashboard..."
  curl -u "elastic:${ELASTIC_PASSWORD}" \
    -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
    -H "kbn-xsrf: true" \
    --form file=@"$DASHBOARD_FILE"
else
  echo "⚠️ No dashboard file found at $DASHBOARD_FILE — skipping import"
fi

echo "🎉 ELK setup completed successfully!"
tail -f /dev/null
