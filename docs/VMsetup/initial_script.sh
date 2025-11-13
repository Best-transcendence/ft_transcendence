#!/bin/bash
set -e

# ===========================
#  [0/9] Basic sanity checks
# ===========================
if [ "$EUID" -eq 0 ]; then
  echo "⚠️  Do NOT run this script as root. Run it as a normal user."
  exit 1
fi

echo "[1/9] Updating system..."
sudo apt update -y && sudo apt upgrade -y

echo "[2/9] Installing Docker dependencies..."
sudo apt install -y ca-certificates curl gnupg lsb-release

echo "[3/9] Adding Docker GPG key and repository..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "[4/9] Installing Docker + Compose plugin..."
sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "[5/9] Adding user '$USER' to docker group..."
sudo usermod -aG docker "$USER"

echo "[6/9] Installing developer tools..."
sudo apt install -y git make vim htop wget unzip tree

echo "[7/9] Installing VSCode (.deb, not snap)..."
wget -q https://update.code.visualstudio.com/latest/linux-deb-x64/stable -O code_amd64.deb
sudo apt install -y ./code_amd64.deb
rm code_amd64.deb

echo "[8/9] Installing Zsh + Oh My Zsh..."
sudo apt install -y zsh

# Set zsh as default for future logins
chsh -s "$(which zsh)"

# Non-interactive Oh My Zsh installation
export RUNZSH=no
export CHSH=no
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Change theme and add plugins
sed -i 's/ZSH_THEME=".*"/ZSH_THEME="robbyrussell"/' ~/.zshrc

# Plugins install
git clone https://github.com/zsh-users/zsh-autosuggestions \
  "${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions"

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \
  "${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting"

# Enable plugins
sed -i 's/plugins=(git)/plugins=(git zsh-autosuggestions zsh-syntax-highlighting)/' ~/.zshrc

echo "[9/9] Cleaning up apt cache to save disk space..."
sudo apt clean

echo ""
echo "✅ DONE!"
echo "➡ Please logout or reboot for Docker group + Zsh to activate."
echo ""
