# 🔐 HashiCorp Vault — Secrets Management

---

## 🔑 What Vault is

- **Vault is a secure secrets manager**.
- It stores sensitive information such as:
    - Database credentials
    - JWT signing keys
    - SSL certificates/keys
    - TOTP seeds for 2FA
- **Vault encrypts all secrets** and enforces access control via policies.
- Backend services fetch secrets dynamically at runtime instead of using plaintext `.env` values.

---

## 📝 Vault in this project

- We use **Docker** to run Vault.
- Secrets are **preloaded as templates** for practicality of demonstration
- **Vault must be initialized and unsealed manually** for security

**Important:** Each dev must run their own Vault instance and manually initialize/unseal. Secrets are already in the repo, so they can fetch them once Vault is unsealed.

---

## 🗂️ Files involved

| File | Purpose |
| --- | --- |
| `./vault/vault.hcl` | Vault configuration |
| `./vault/policies.hcl` | Service-specific policies |
| `./vault/Dockerfile` | Vault Docker image setup |
| `./docker-compose.yml` | Main docker-compose (includes Vault service) |

---
## 🔓 Vault First Setup

- Vault's security principles lie on locality and uniqueness:
	- Each machine gets its own unique encryption key
	- Each machine has its own Vault instance -> and secrets must be injected manually.

### Step 1 — Build and compose

```bash
make build
make up-vault
```

### Step 2 — Get tokens and keys unique to host machine
```bash
docker exec -it vault_service vault operator init
```
This command will return a set of tokens and key to keep outside of the repo at your discretion.
It contains:
- 1 Initial Root Token -> this serves as a login credential for devs, as well as for services willing to access Vault
- 5 Unseal keys -> Vault is always "locked" or sealed. It requires entering 3 out of these 5 keys to unseal. If not unsealed, no service is able to communicate with Vault.

### Step 3 — Export VAULT variables to local env
```bash
export VAULT_ADDR='127.0.0.1:8200'
export VAULT_TOKEN='your_generated_initial_root_token'
```

- `VAULT_ADDR`: This one only for the local machine to locate the service - within containers, the default address will be `vault-service:8200`
- `VAULT_TOKEN`: this variable will be imported into the containers' `.env`. It allows services to authenticate - without it, access will be denied, and you will get error `403`

### Step 4 — Unseal Vault
```bash
make unseal
```
You will be prompted to enter 3 of your 5 Unseal Keys. Vault will then display its status - first lines should show:

```bash
init	true
sealed	false
```

### Step 5 — Login
```bash
docker exec -it vault_service vault login
```
Enter your Initial Root Token. You are then ready to work with your Vault!

### Step 6 — Load secrets
Create the secret path and enable kv engine:
```bash
docker exec -it vault_service vault secrets enable -path=secret kv-v2
```

Add JWT token to the secrets:
```bash
docker exec -it vault_service vault kv put secret/jwt JWT_SECRET='secretjwt'
```

Create certs, migrate them to secrets, delete them from the repo:
```bash
mkdir -p certs && \
openssl req -x509 -nodes -days 365 -newkey rsa=2048 \
  -keyout certs/server.key -out certs/server.crt \
  -subj "/CN=localhost" && \
docker exec -i vault_service vault kv put secret/ssl \
  CRT="$(cat certs/server.crt)" KEY="$(cat certs/server.key)" && \
rm -r certs

```
### Step 7 — Up the containers

```bash
make up
```
---

## 🔓 Running Vault - already set up on machine

### Step 1 — Build and compose

```bash
make build
make up-vault
```

### Step 2 — Export VAULT variables to local env
Only if they're not in your environment already:
```bash
export VAULT_ADDR='127.0.0.1:8200'
export VAULT_TOKEN='your_generated_initial_root_token'
```

### Step 3 — Unseal Vault
```bash
make unseal
```
You will be prompted to enter 3 of your 5 Unseal Keys. Vault will then display its status - first lines should show:

```bash
init	true
sealed	false
```

### Step 4 — Up the containers

```bash
make up
```

### Step 5 — Check if all healthy

Try checking:

```bash
curl -sSf http://127.0.0.1:8200/v1/sys/health>
```

- Response should start with `{"initialized":true,"sealed":false,`

---

## What is stored

- Backend services are configured to fetch secrets dynamically from Vault:
    - JWT signing keys
    - SSL certs/keys
    - TOTP seeds for 2FA - if time allows for 2FA implementation

---

## ✅ Notes

- **Development workflow:**
    - Preloaded secrets in Vault allow fast testing.
    - Each dev can run their own Vault container.
- **Exam workflow:**
    - Evaluator runs their own Vault instance.
    - Must manually initialize and unseal.
    - Preloaded secrets are fetched automatically after unseal.
