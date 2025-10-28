FROM owasp/modsecurity:nginx

# Copy volumes
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint executable and ensure log dirs
RUN chmod +x /entrypoint.sh && mkdir -p /var/log/modsec /var/log/nginx

# Install Vault CLI
RUN apt-get update && apt-get install -y vault && rm -rf /var/lib/apt/lists/*

EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]
