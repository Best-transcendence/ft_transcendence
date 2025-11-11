FROM hashicorp/vault:1.14.0

# Create directories for config and data
RUN mkdir -p /vault/config /vault/file

# Copy config and helper scripts
COPY vault.hcl /vault/config/vault.hcl
COPY policies.hcl /vault/config/policies.hcl
COPY init-vault.sh /vault/config/init-vault.sh

RUN chmod +x /vault/config/init-vault.sh

# Expose Vault port (default port)
EXPOSE 8200

# Start Vault server by default
ENTRYPOINT ["vault", "server", "-config=/vault/config/vault.hcl"]
