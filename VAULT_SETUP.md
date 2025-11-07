# 🔐 Vault Quick Guide

## After `make clean`

**1. Export VAULT_TOKEN:**
```bash
export VAULT_TOKEN='your_token_here'
```

**2. Build and start:**
```bash
make docker
```

**3. Unseal Vault (it will be sealed after restart):**
```bash
make unseal
```
Enter 3 of your 5 unseal keys.

**4. Restart services:**
```bash
make restart-services
```

---

## Regular Usage

**1. Export VAULT_TOKEN:**
```bash
export VAULT_TOKEN='your_token_here'
```

**2. Start services:**
```bash
make up
```

**3. If Vault is sealed, unseal it:**
```bash
make unseal
```

**4. After changing .env:**
```bash
make restart-services
```

---

## Commands

- `make up` - Start all services
- `make unseal` - Unseal Vault (needed after restart)
- `make restart-services` - Restart services only (Vault stays unsealed)
- `make vault-ready` - Check Vault status

**Note:** Vault seals itself on restart. You'll need to unseal it after `make restart` or `make clean`.
