#!/bin/sh
set -e

# Fetch secrets from Vault
SERVER_CRT=$(vault kv get -field=server.crt secret/waf_certs)
SERVER_KEY=$(vault kv get -field=server.key secret/waf_certs)

# Write to certs directory
mkdir -p /etc/nginx/certs
echo "$SERVER_CRT" > /etc/nginx/certs/server.crt
echo "$SERVER_KEY" > /etc/nginx/certs/server.key

# Start nginx
exec nginx -g "daemon off;"
