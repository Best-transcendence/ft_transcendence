# 🔐 Vault Quick Guide

## 🎯 NEW AUTOMATED WORKFLOW (Recommended)

### First Time Setup (One-Time):
```bash
make save-vault-keys
```
This will prompt you to enter your VAULT_TOKEN and 3 unseal keys. They will be saved securely in `.vault-keys` (gitignored).

### Daily Usage - Option 1 (Full Clean Start):
```bash
make dev
```
This does everything automatically:
1. Cleans all containers
2. Builds and starts services
3. Auto-unseals Vault
4. Follows logs

### Daily Usage - Option 2 (Quick Start):
```bash
make start
```
Faster option without cleaning:
1. Builds and starts services (no clean)
2. Auto-unseals Vault
3. Follows logs

### That's it! No more manual token export or unseal keys! 🎉

---

## 📚 Traditional Manual Workflow (Still Available)

### After `make clean`

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

## Regular Usage (Manual)

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

## 📋 All Commands

### Automated Workflow (Recommended):
- `make save-vault-keys` - Save your keys once (first-time setup)
- `make dev` - Complete automated workflow (clean → start → unseal)
- `make start` - Quick start without cleaning (start → unseal)
- `make auto-unseal` - Auto-unseal Vault using saved keys

### Manual Workflow:
- `make up` - Start all services
- `make unseal` - Unseal Vault manually (interactive, requires 3 keys)
- `make restart-services` - Restart services only (Vault stays unsealed)
- `make vault-ready` - Check Vault status

### Other:
- `make docker` - Traditional workflow (manual unseal required)
- `make clean` - Clean all Docker resources

**Note:** Vault seals itself on restart. You'll need to unseal it after `make restart` or `make clean`.

---

## 🔒 Security Notes

- The `.vault-keys` file is automatically added to `.gitignore`
- File permissions are set to `600` (owner read/write only)
- Never commit this file to git!
- Keep your unseal keys backed up separately in a secure location
