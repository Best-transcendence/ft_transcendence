# WAF Service

- This service is a **Web Application Firewall (WAF)** implemented with **Nginx** and **ModSecurity.**
- It acts as a reverse proxy in front of your other services (WebSocket service, Gateway service).
- It takes charge of inspecting and optionally blocking malicious HTTP traffic before the requests reach the code.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Setup Instructions](#setup-instructions)
3. [Service Structure](#service-structure)
4. [Example Requests/Responses](#example-requests-responses)
5. [Design Decisions & Assumptions](#design-decisions--assumptions)

---

## Tech Stack

- **Docker**: containerization
- **Nginx (stable-alpine)**: reverse proxy + WAF integration
- **ModSecurity**: WAF module for HTTP request/response inspection
- **OWASP CRS**: baseline set of security rules
- **Custom exception rules**: project-specific overrides (None at this time)

---

## Setup Instructions

1. **Generate self-signed certs on your local machine**
```bash
mkdir -p waf/certs
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout waf/certs/server.key \
  -out waf/certs/server.crt \
  -subj "/CN=localhost"
```


2. **Build the Docker image**

```bash
docker build -t waf-service .
```

3. **Run the container**

```bash
docker run -p 80:80 --name waf-service waf-service
```

4. **Verify WAF logs**
- Audit logs are stored inside the container at `/var/log/modsec_audit.log`.
- Logs are in **DetectionOnly mode** by default (no blocking).

5. **Switch to blocking mode (final)**
- For the time being and while still developing, ModSecurity is running on `DetectionOnly` → it won’t block any user/request, but will simply log it
- For production, we’ll change it in `modsecurity.conf`:

```
SecRuleEngine On
```

---

## Service Structure

```
waf/
│
├── Dockerfile
├── nginx.conf                 # Nginx reverse proxy configuration
├── modsecurity.conf           # ModSecurity main config
├── crs/                       # OWASP Core Rule Set + custom rules
│   ├── crs-setup.conf
│   └── rules/*.conf
└── exception-rules.conf       # Project-specific exceptions

```

### Nginx configuration highlights

- **Proxy /ws → WebSocket service (`ws-service:4000`)**
- **Proxy / → Gateway service (`gateway-service:3003`)**
- Preserves headers:
    - Host, X-Real-IP, X-Forwarded-For (so that backend knows who is making the request)
        - Host → tells backend which hostname the client requested
        - X-Real-IP → original client’s IP address
        - X-Forwarded-For → Chain of IP addresses showing the original client + any intermediate proxies
    - Upgrade & Connection (for WebSocket support)
        - Upgrade → Tells server that the client wants to switch protocols (ex. HTTP to WS)
        - Connection → Must be set to “upgrade”
    - Authorization (for API requests)
        - Header that carries credentials like JWT tokens or API keys

### ModSecurity configuration highlights

- `SecRuleEngine DetectionOnly`: logs attacks but does not block
- `SecRequestBodyAccess On`: inspects request bodies
- `SecAuditEngine RelevantOnly`: only logs requests triggering rules
- Includes **CRS rules** + **custom exceptions**

---

## Example Requests / Responses

**Request to Gateway:**

```
GET /api/user HTTP/1.1
Host: example.com
Authorization: Bearer <token>
```

**WAF Response in DetectionOnly mode:**

- HTTP status code unchanged
- Potential threats logged to `/var/log/modsec_audit.log`

**Request to WebSocket:**

```
GET /ws HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade

```

**Response:** proxied to WebSocket service transparently

---

## Design Decisions & Assumptions

- WAF is implemented as a **standalone container** in front of backend services.
- **DetectionOnly mode** for safe testing before enabling blocking.
- Assumes backend services handle SSL termination or TLS is added at a later stage → @Tina ?.
- Custom exceptions are managed in `exception-rules.conf`.
- Logs are intended for monitoring and debugging, not yet integrated with a log aggregation system.

---

✅ **Status:** Ready for testing

⚠️ **Next steps before production:**

1. Enable `SecRuleEngine On` to actually block malicious requests.
2. Consider mounting a persistent volume for logs (`/var/log/modsec_audit.log`) to prevent log loss on container restart.
3. Add SSL support (HTTPS)
4. Optional: tune CRS/custom rules to reduce false positives.
