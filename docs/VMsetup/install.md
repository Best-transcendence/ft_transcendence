https://xubuntu.org/download/

tu Installation Guide for VirtualBox
*(Optimized for 20 GB exam VM — Docker, VSCode, Browser support)*

## 1. Boot from ISO
- Start the VM  
- Select **“Try or Install Xubuntu”**

---

## 2. Choose Language
- Select **English**  
- Click **Continue**

---

## 3. Keyboard Layout
- **English (US)**  
- **English (US)**  
- Click **Continue**

---

## 4. Updates & Other Software
Choose:

### ✔ Normal installation  
(includes Firefox and needed utilities)

### ✔ Install third-party software  
(recommended for drivers/codecs inside VM)

### ✔ Download updates while installing  
(optional if network is slow)

Click **Continue**

---

## 5. Installation Type
Select:

### ✔ Erase disk and install Xubuntu

This applies **only** to the virtual disk inside VirtualBox.

Click **Install Now**  
Confirm → **Continue**

---

## 6. Time Zone
- Select your city or **Lisbon**  
- Click **Continue**

---

## 7. Create User Account
Fill in:

| Field | Example |
|-------|---------|
| Your name | anything |
| Computer name | xubuntu-vm |
| Username | **** (or your preferred) |
| Password | **** your password |

Choose either:

- ✔ Log in automatically  
or  
- ✔ Require password  

Click **Continue**

---

## 8. Installation Process
- Wait 5–10 minutes  
- Click **Restart Now** when finished  

When asked to remove the installation medium → press **Enter**

---

## 9. First Steps After Boot
Open Terminal and run:

```bash
sudo apt update -y && sudo apt upgrade -y
```

Reboot once.

Your system is now ready for your setup script.

---

## 10. (Optional) Install VirtualBox Guest Additions
Improves display, clipboard, mouse integration:

```bash
sudo apt install virtualbox-guest-dkms virtualbox-guest-utils virtualbox-guest-x11 -y
```

Reboot.

---

## 11. Run Your Setup Script
Place your script in the VM and run:

```bash
./setup_vm.sh
```