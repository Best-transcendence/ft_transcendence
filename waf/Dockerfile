FROM owasp/modsecurity:nginx

# Copy volumes
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint executable and ensure log dirs
RUN chmod +x /entrypoint.sh && mkdir -p /var/log/modsec /var/log/nginx

# Install Vault CLI
# Install Vault CLI
# Install tools and Vault binary (download official release)
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget unzip ca-certificates && \
    VAULT_VERSION=1.14.0 && \
    wget -q "https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip" -O /tmp/vault.zip && \
    unzip /tmp/vault.zip -d /usr/local/bin && \
    chmod +x /usr/local/bin/vault && \
    rm -rf /tmp/vault.zip && \
    apt-get remove -y wget unzip && apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]
