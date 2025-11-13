#!/bin/bash
set -e

# ===========================
#   Multi-account Git setup
# ===========================

echo "[1/5] Creating ~/.ssh directory if missing..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Personal key paths
PERSONAL_KEY=~/.ssh/id_github_personal
SCHOOL_KEY=~/.ssh/id_github_42

echo "[2/5] Generating SSH keys (personal + 42)..."

# Personal key
if [ -f "$PERSONAL_KEY" ]; then
  echo "⚠️  Personal key already exists, skipping..."
else
  ssh-keygen -t ed25519 -C "leanor13" -f "$PERSONAL_KEY" -N ""
  echo "Personal key created."
fi

# School key
if [ -f "$SCHOOL_KEY" ]; then
  echo "⚠️  42-school key already exists, skipping..."
else
  ssh-keygen -t ed25519 -C "42-student" -f "$SCHOOL_KEY" -N ""
  echo "42-school key created."
fi

echo "[3/5] Writing ~/.ssh/config..."
cat > ~/.ssh/config <<EOF
# ===============================
#  SSH config for two accounts
# ===============================

# Personal GitHub account (leanor13)
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_github_personal

# 42 school GitHub (if used)
Host github.com-42
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_github_42

# 42 GitLab example (adjust if needed)
Host git.42.fr
    HostName git.42.fr
    User git
    IdentityFile ~/.ssh/id_github_42
EOF

chmod 600 ~/.ssh/config

echo "[4/5] Showing your public keys:"
echo ""
echo "===== PERSONAL (GitHub: leanor13) ====="
cat "${PERSONAL_KEY}.pub"
echo ""
echo "===== SCHOOL (42 account) ====="
cat "${SCHOOL_KEY}.pub"
echo ""

echo "[5/5] Next steps:"
echo "👉 Go to GitHub → Settings → SSH keys → Add key (for personal)"
echo "👉 Go to school Git → Add SSH key (for 42)"
echo ""
echo "🔥 Clone personal repos like:"
echo "    git clone git@github.com-personal:leanor13/REPO.git"
echo ""
echo "🔥 Clone 42 repos like:"
echo "    git clone git@github.com-42:LOGIN/REPO.git"
echo "or:"
echo "    git clone git@git.42.fr:LOGIN/REPO.git"
echo ""
echo "✅ Git multi-account setup completed!"
