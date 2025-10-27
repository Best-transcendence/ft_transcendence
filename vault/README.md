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

## 🔓 Running Vault (Dev / Exam)

### Step 1 — Build and compose

```bash
docker-compose build vault-service
docker-compose up -d vault-service
```

### Step 2 — Check Vault health

```bash
docker-compose ps vault-service
# or
curl -sSf http://127.0.0.1:8200/v1/sys/health
```

Vault should respond status `503` or (status `200` but **will be sealed initially**).

---

### Step 3 — Initialize Vault (first time/machine only)

Run:

```bash
vault operator init
```

- This generates:
    - **Unseal keys** (used to unseal Vault)
    - **Root token** (used for administrative operations)
- **Do not commit these keys** — each dev should generate their own
- Copy these keys securely — each dev will need them to unseal Vault

---

### Step 4 — Unseal Vault

For each unseal key received:

```bash
vault operator unseal <UNSEAL_KEY>
```

- Repeat with all unseal keys if using multiple shares.
- Once Vault is unsealed, it’s ready to serve secrets.

---

### Step 5 — Check if all healthy

Try checking:

```bash
curl -sSf http://127.0.0.1:8200/v1/sys/health>
```

- Response should start with `{"initialized":true,"sealed":false,`

---

### Step 6 — Fetch secrets

- Backend services are configured to fetch secrets dynamically from Vault:
    - Database credentials
    - JWT signing keys
    - SSL certs/keys
    - Passwords
    - API keys
    - TOTP seeds for 2FA - if time allows for 2FA implementation
- **No secrets are stored in the code anymore.**

---

### ✅ Notes

- **Development workflow:**
    - Preloaded secrets in Vault allow fast testing.
    - Each dev can run their own Vault container.
- **Exam workflow:**
    - Evaluator runs their own Vault instance.
    - Must manually initialize and unseal.
    - Preloaded secrets are fetched automatically after unseal.
