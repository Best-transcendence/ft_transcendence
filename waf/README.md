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

## Design Decisions & Assumptions

- WAF is implemented as a **standalone container** in front of backend services.
- **DetectionOnly mode** for safe testing before enabling blocking.
- Assumes backend services handle SSL termination or TLS is added at a later stage → @Tina ?.
- Custom exceptions are managed in `exception-rules.conf`.
- Logs are intended for monitoring and debugging, not yet integrated with a log aggregation system.

---

## Testing
This section describes how to verify that ModSecurity is correctly integrated with the project, both in **DetectionOnly (dev)** and **blocking (staging/production)** modes.

### **1. Prerequisites**

- Ensure the WAF container is running (`waf_service`) with Nginx + ModSecurity integrated.
- SSL certificates should be configured (`/etc/nginx/certs/server.crt` and `server.key`).
- For local testing, `curl -k` is used to bypass self-signed cert warnings.

---

### **2. Example Tests**

### **2.1 Health Check**

```bash
curl -k https://localhost/health

```

**Expected output:**

- Frontend HTML page (if `/` is mapped to SPA)
- Confirms normal traffic passes through WAF without interference.

---

### **2.2 SQL Injection**

```bash
curl -k "https://localhost/?id=1%20OR%201=1"
curl -k "https://localhost/?username=admin'--"

```

**Expected output:**

- **DetectionOnly:** HTML response of the page; request logged in `/var/log/modsec/modsec_audit.log`
- **Blocking (`SecRuleEngine On`):** HTTP **403 Forbidden** response (request blocked), and logged in ModSecurity.

---

### **2.3 Cross-Site Scripting (XSS)**

```bash
curl -k "https://localhost/?q=%3Cscript%3Ealert('xss')%3C/script%3E"

```

**Expected output:**

- **DetectionOnly:** HTML page returned, logs show XSS detection.
- **Blocking:** 403 Forbidden, log contains matched XSS rule.

---

### **2.4 Local File Inclusion (LFI)**

```bash
curl -k "https://localhost/?file=../../../../etc/passwd"

```

**Expected output:**

- **DetectionOnly:** HTML page returned; ModSecurity logs entries like:

```
id "930120" → OS File Access Attempt
id "932160" → Remote Command Execution
id "949110" → Inbound Anomaly Score Exceeded

```

- **Blocking:** HTTP 403 Forbidden; request logged with same rule IDs.

---

### **2.5 HTTP TRACE Method**

```bash
curl -k -X TRACE https://localhost/

```

**Expected output:**

- **DetectionOnly:** 405 Not Allowed (blocked by Nginx)
- **Blocking:** 405 Not Allowed (same; ModSecurity may also log)

---

### **3. ModSecurity Logs**

- Logs are located inside the WAF container:

```bash
docker exec -it waf_service tail -f /var/log/modsec/modsec_audit.log

```

- Logs show rule matches, variable values, request URIs, and anomaly scores.
- **DetectionOnly:** Events logged but requests pass.
- **Blocking (`SecRuleEngine On`):** Requests are denied with HTTP 403.

---

### **4. Notes**

- Ensure you **escape special characters** in URLs for SQLi/XSS tests (`%20`, `%3C`, etc.).
- In development, leave `SecRuleEngine DetectionOnly` to avoid accidental blocking.
- When moving to production, switch to `SecRuleEngine On` to actively block malicious traffic.
<br>
---

## ✅ **Status:** Ready for testing

⚠️ **Next steps before production:**

1. Enable `SecRuleEngine On` to actually block malicious requests.
2. Consider mounting a persistent volume for logs (`/var/log/modsec_audit.log`) to prevent log loss on container restart.
3. Add SSL support (HTTPS)
4. Optional: tune CRS/custom rules to reduce false positives.
