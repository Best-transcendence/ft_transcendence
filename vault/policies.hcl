# FULL ACCESS FOR DEV - TODO - remove before launching prod
path "secret/*"
{
	capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Permission to view Vault system info
path "sys/*"
{
	capabilities = ["read", "list"]
}

# Permission to access auth-service secrets
path "secret/data/services/auth-service/*"
{
	capabilities = ["read", "list"]
}

# Permission to access user-service secrets
path "secret/data/services/user-service/*"
{
	capabilities = ["read", "list"]
}

# Permission to access gateway-service secrets
path "secret/data/services/gateway-service/*"
{
	capabilities = ["read", "list"]
}

# Permission to access ws-service secrets
path "secret/data/services/ws-service/*"
{
	capabilities = ["read", "list"]
}

# Permission to access waf-service secrets
path "secret/data/services/waf-service/*"
{
	capabilities = ["read", "list"]
}
