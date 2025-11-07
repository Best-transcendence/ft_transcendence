#!/bin/sh
set -e

# Fetch secrets from Vault
SERVER_CRT=$(vault kv get -field=CRT secret/ssl)
SERVER_KEY=$(vault kv get -field=KEY secret/ssl)

# Write to certs directory
mkdir -p /etc/nginx/certs
echo "$SERVER_CRT" > /etc/nginx/certs/server.crt
echo "$SERVER_KEY" > /etc/nginx/certs/server.key

# Start nginx
#exec nginx -g "daemon off;"
exec /docker-entrypoint.sh nginx -g "daemon off;"
