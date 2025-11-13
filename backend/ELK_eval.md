# ELK Stack - Evaluation Overview

## Purpose

The ELK Stack (Elasticsearch, Logstash, Kibana) provides centralized logging infrastructure for collecting, processing, storing, and visualizing application logs from all microservices.

## Architecture

```
Application Services
    ↓ (logs)
Filebeat (log collector)
    ↓
Logstash (log processor)
    ↓
Elasticsearch (log storage & search)
    ↓
Kibana (log visualization)
```

## Error codes example for testing
```
error_code:USERNAME_ALREADY_EXISTS
error_code:EMAIL_ALREADY_EXISTS
```

## Components

### Elasticsearch
- **Purpose**: Stores and indexes log data for fast searching
- **Version**: 7.17.9
- **Features**:
  - Full-text search capabilities
  - JSON document storage
  - Index management with ILM (Index Lifecycle Management)
  - Authentication required (X-Pack Security)

### Logstash
- **Purpose**: Collects, processes, and transforms log data
- **Functions**:
  - Receives logs from Filebeat (port 5044)
  - Parses JSON logs from Fastify/Pino
  - Extracts service names, timestamps, log levels
  - Enriches logs with metadata
  - Sends processed logs to Elasticsearch

### Kibana
- **Purpose**: Visualizes and analyzes log data
- **Features**:
  - Real-time log viewing
  - Custom dashboards
  - Log filtering and search
  - Service-specific log views
  - Performance metrics visualization

### Filebeat
- **Purpose**: Collects logs from application containers
- **Functions**:
  - Monitors log files from services
  - Sends logs to Logstash
  - Handles log rotation
  - Filters by container name

## Key Functions

### Log Collection
- Collects logs from all backend services:
  - Auth Service
  - User Service
  - Gateway Service
  - WebSocket Service
  - Frontend Service

### Log Processing
- Parses structured JSON logs
- Extracts key fields:
  - Service name
  - Log level (info, error, warn, debug)
  - Timestamp
  - HTTP method/status (for API logs)
  - Error codes and types
  - Correlation IDs

### Log Storage
- Indexes logs by date: `logs-YYYY.MM.dd`
- Automatic index rotation
- 30-day retention policy
- Compressed storage for older logs

### Log Visualization
- Real-time log stream in Kibana
- Filter by service, log level, error code
- Search by correlation ID for request tracing
- Custom dashboards for monitoring

## Main Components

### Configuration Files
- `logstash/logstash.conf` - Log processing pipeline
- `filebeat/filebeat.yml` - Log collection configuration
- `elasticsearch/ilm-policy.json` - Data retention policy
- `kibana/kibana.yml` - Kibana configuration

### Log Structure
Each log entry includes:
- `@timestamp`: Log timestamp
- `service`: Service name (auth-service, user-service, etc.)
- `log_level`: Log severity level
- `message`: Log message
- `http_method`, `http_url`, `http_status`: HTTP request data
- `error_code`, `error_type`: Error classification
- `correlation_id`: Request tracking ID

## Integration Points

- **All Services**: Send structured logs via Filebeat
- **Docker**: Logs collected from container stdout/stderr
- **Services**: Use structured logging utilities for consistent format

## Security Features

- Elasticsearch authentication required
- Kibana login required
- Encrypted saved objects in Kibana
- Secure inter-service communication
- Network isolation in Docker

## Data Retention

- **Retention Policy**: 30 days
- **Index Rotation**: Daily (new index per day)
- **Automatic Deletion**: Logs older than 30 days are deleted
- **Storage Optimization**: Compression for older indices

