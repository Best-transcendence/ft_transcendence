FROM owasp/modsecurity:nginx

#NO_VAULT: removing the Vault CLI install:
# Install Vault CLI
#RUN apt-get update && apt-get install -y wget unzip \
#    && wget https://releases.hashicorp.com/vault/1.14.0/vault_1.14.0_linux_amd64.zip \
#    && unzip vault_1.14.0_linux_amd64.zip \
#    && mv vault /usr/local/bin/ \
#    && rm vault_1.14.0_linux_amd64.zip

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY crs/ /etc/nginx/modsec/crs/

#NO_VAULT: certs get copied from local to container context
COPY certs/ /etc/nginx/certs/

#NO_VAULT: commenting these lines because we're no longer using the entrypoint:
#   RUN chmod +x /entrypoint.sh
#   CMD ["/entrypoint.sh"]

#NO_VAULT: launching directly from here since we removed the entrypoint
CMD ["nginx", "-g", "daemon off;"]

