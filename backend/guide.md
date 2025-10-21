# 🛠️ ft_transcendence – Backend Setup Guide

## 📌 Overview
The backend is composed of this microservices:
- **Auth Service** (authentication, JWT, login/signup)
- **User Service** (profiles, friends, stats)
- **Gateway Service** (API routing, load balancing)
- **WebSocket Service** (real-time communication)

⚠️ **Important:** Due to current Docker issues, you must run the `make` file **in each individual service** to start it locally.
Do not rely on Docker Compose alone. Because for remote connections is not connecting very well.

## 2. ⚙️ Environment Configuration

Copy the example `example.env.txt` file:

Edit `.env` and set your **LAN IP**:

```env
LAN_IP=192.168.x.xxx   # your local IP
```

Replace all `localhost` references with `${LAN_IP}` so services can talk to each other across the network.

### 🔍 How to find your LAN IP
- **Linux/macOS**: `ip addr show` → look for `inet 192.168.x.x`
- **Windows**: `ipconfig` → look for `IPv4 Address`
- **Phone**: Wi-Fi settings → IP Address

---

## 4. ▶️ Running Services

Because of Docker issues, **each backend service must be started individually**:

```bash
cd auth-service
make

cd ../user-service
make

cd ../gateway-service
make

cd ../ws-service
make
```

Each `make` command will install dependencies, build, and start the service.

---

## 5. 🚀 Services & Ports

| Service            | Port  | URL                          |
|--------------------|-------|------------------------------|
| Frontend           | 3000  | http://YOUR_IP:3000          |
| Auth Service       | 3001  | http://YOUR_IP:3001          |
| User Service       | 3002  | http://YOUR_IP:3002          |
| Gateway Service    | 3003  | http://YOUR_IP:3003          |
| WebSocket Service  | 4000  | ws://YOUR_IP:4000            |

---

## 6. 🧪 Testing the Setup

- Check Auth Service health:
  ```bash
  curl http://YOUR_IP:3001/health
  ```
- Check Gateway routes:
  ```bash
  curl http://YOUR_IP:3003/api
  ```
- Open frontend in browser:
  ```
  http://YOUR_IP:3000
  ```

---

## ✅ Summary

1. Configure `.env` with your LAN IP
2. Run `make` in each backend service (`auth`, `user`, `gateway`, `ws`)
3. Access services via `http://YOUR_IP:<port>`
