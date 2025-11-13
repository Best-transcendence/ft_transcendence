# ELK Stack Security Documentation

## Overview
This document describes the security measures implemented to protect log data and access to the ELK stack components.

## Security Measures Implemented

### 1. Elasticsearch Security

#### Authentication
- **X-Pack Security enabled**: All access requires authentication
- **Username**: `elastic`
- **Password**: Configured via `ELASTIC_PASSWORD` environment variable (default: `changeme`)
- **Anonymous access**: DISABLED - all requests require valid credentials

#### Access Control
- Elasticsearch is exposed on port `9200` but requires authentication for all requests
- Health checks use authenticated requests
- All inter-service communication uses authenticated connections

#### Configuration
```yaml
xpack.security.enabled: true
ELASTIC_PASSWORD: changeme  # Change in production!
```

### 2. Kibana Security

#### Authentication
- **X-Pack Security enabled**: Login required to access Kibana UI
- **Authentication Provider**: Basic authentication (username/password)
- **Username**: `elastic`
- **Password**: Same as Elasticsearch (`changeme`)

#### Session Management
- **Idle Timeout**: 8 hours
- **Session Lifespan**: 30 days
- Sessions are encrypted using encryption keys

#### Encryption Keys
Three separate encryption keys are configured:
- `xpack.security.encryptionKey`: For general security features
- `xpack.encryptedSavedObjects.encryptionKey`: For saved objects encryption
- `xpack.reporting.encryptionKey`: For reports encryption

#### Access Control
- Kibana is exposed on port `5601`
- All access requires authentication
- Anonymous access is disabled

### 3. Logstash Security

#### Authenticated Output
- Logstash connects to Elasticsearch using authenticated requests
- Credentials configured via environment variables:
  ```conf
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    user => "elastic"
    password => "${ELASTIC_PASSWORD}"
  }
  ```

#### Input Security
- Filebeat connections on port `5044` (internal network only)
- No external exposure

### 4. Filebeat Security

#### Collection Scope
- Only collects logs from specific application containers:
  - `user_service`
  - `auth_service`
  - `gateway_service`
  - `ws_service`
  - `frontend_service`
- Does not collect logs from system or other containers

#### Network Security
- Communicates only with Logstash on internal Docker network
- No external ports exposed

### 5. Network Isolation

All ELK stack components run on an isolated Docker network (`ft_transcendence_network`):
- Inter-service communication is restricted to this network
- External access only through exposed ports with authentication

## Default Credentials

### Elasticsearch & Kibana
- **Username**: `elastic`
- **Password**: `changeme`

**⚠️ IMPORTANT**: Change the default password before deploying to production!

## Accessing ELK Components

### Elasticsearch API
```bash
# This will be rejected (401 Unauthorized)
curl http://localhost:9200/

# This will work
curl -u elastic:changeme http://localhost:9200/
```

### Kibana UI
1. Navigate to `http://localhost:5601`
2. Login with username: `elastic` and password: `changeme`
3. Access the Kibana dashboards and features

### Logstash
- Not exposed externally
- Accessible only within Docker network on port `5044`

## Security Best Practices for Production

### 1. Change Default Passwords
Update the `ELASTIC_PASSWORD` in your `.env` file:
```bash
ELASTIC_PASSWORD=your-strong-password-here
```

### 2. Use Strong Encryption Keys
Generate new encryption keys (32+ characters):
```bash
# Example: Generate random keys
openssl rand -base64 32
```

Update in `backend/kibana/kibana.yml`:
```yaml
xpack.security.encryptionKey: "your-generated-key-here"
xpack.encryptedSavedObjects.encryptionKey: "your-generated-key-here"
xpack.reporting.encryptionKey: "your-generated-key-here"
```

### 3. Enable HTTPS/TLS
For production, enable SSL/TLS encryption:
- Configure Elasticsearch with SSL certificates
- Update Kibana to use HTTPS
- Update all connections to use secure protocols

### 4. Implement Role-Based Access Control (RBAC)
Create separate users with specific roles:
- Read-only users for viewing logs
- Admin users for configuration
- Service accounts for applications

### 5. Regular Security Updates
- Keep ELK stack versions up to date
- Monitor security advisories
- Apply patches promptly

### 6. Audit Logging
Enable audit logging in Elasticsearch to track:
- Authentication attempts
- Access to sensitive data
- Configuration changes

### 7. Network Security
- Use firewall rules to restrict access to ELK ports
- Consider using a VPN for remote access
- Implement IP whitelisting if possible

## Verification

### Test Elasticsearch Security
```bash
# Should fail with 401 Unauthorized
curl http://localhost:9200/

# Should succeed
curl -u elastic:changeme http://localhost:9200/
```

### Test Kibana Security
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:5601`
3. Should redirect to login page
4. Login with `elastic/changeme`

### Test Logstash Connection
Check Logstash logs for successful authenticated connections:
```bash
docker logs logstash | grep -i "elasticsearch"
```

## Monitoring

### Check Elasticsearch Security Status
```bash
curl -u elastic:changeme http://localhost:9200/_xpack/security/_authenticate
```

### View Active Kibana Sessions
Login to Kibana and navigate to:
- Stack Management → Security → Users

### Monitor Failed Login Attempts
Check Elasticsearch audit logs (if enabled) or Kibana logs:
```bash
docker logs kibana | grep -i "authentication"
```

## Troubleshooting

### Cannot Access Elasticsearch
- Verify password is correct
- Check that `xpack.security.enabled: true` is set
- Ensure ELASTIC_PASSWORD environment variable is set correctly

### Cannot Login to Kibana
- Verify Elasticsearch is running and accessible
- Check Kibana logs: `docker logs kibana`
- Verify encryption keys are properly set in kibana.yml
- Clear browser cookies and try again

### Logstash Cannot Connect to Elasticsearch
- Verify ELASTIC_PASSWORD is correctly set in docker-compose.yml
- Check Logstash logs: `docker logs logstash`
- Ensure Elasticsearch is healthy before Logstash starts

## Compliance

These security measures help meet common compliance requirements:
- **Authentication**: All access is authenticated
- **Encryption**: Sensitive data encrypted at rest (saved objects)
- **Audit Trail**: Access logs maintained
- **Access Control**: Role-based permissions available
- **Session Management**: Automatic timeout for inactive sessions

## Additional Resources

- [Elasticsearch Security Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-settings.html)
- [Kibana Security Documentation](https://www.elastic.co/guide/en/kibana/7.17/security-settings-kb.html)
- [Elastic Stack Security Best Practices](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-best-practices.html)

