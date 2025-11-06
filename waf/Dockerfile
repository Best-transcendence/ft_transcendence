FROM owasp/modsecurity:nginx

# Install Vault CLI
RUN apt-get update && apt-get install -y wget unzip \
    && wget https://releases.hashicorp.com/vault/1.14.0/vault_1.14.0_linux_amd64.zip \
    && unzip vault_1.14.0_linux_amd64.zip \
    && mv vault /usr/local/bin/ \
    && rm vault_1.14.0_linux_amd64.zip

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# You no longer copy certs from build context
# COPY certs/ /etc/nginx/certs/

CMD ["/entrypoint.sh"]

