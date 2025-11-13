# ft_transcendence - Evaluation Overview

## Project Purpose

ft_transcendence is a real-time Pong tournament platform built with a microservices architecture. It provides multiplayer gaming, tournament management, user profiles, and real-time communication capabilities.

## Architecture Overview

The system follows a **microservices architecture** with clear separation of concerns:

- **Frontend**: Single-page application (TypeScript/Vite) handling user interface
- **Backend Services**: Multiple independent microservices (Auth, User, Gateway, WebSocket)
- **Infrastructure**: ELK stack for logging, Vault for secrets management, WAF for security

## Main Components

### Backend Services
- **Auth Service**: User authentication, registration, JWT token management
- **User Service**: User profiles, friends, game statistics, match history
- **Gateway Service**: Single entry point, request routing, JWT validation
- **WebSocket Service**: Real-time connections, user presence, game signaling

### Infrastructure
- **ELK Stack**: Centralized logging (Elasticsearch, Logstash, Kibana)
- **Vault**: Secure secrets management (JWT keys, SSL certificates)
- **WAF**: Web Application Firewall for security and routing

## System Flow

```
Frontend → Gateway → Auth Service / User Service
         ↓
    WebSocket Service (direct connection)
         ↓
    ELK Stack (logging)
    Vault (secrets)
```

## Key Features

- **Microservices Architecture**: Independent, scalable services
- **JWT Authentication**: Secure token-based authentication
- **Real-time Communication**: WebSocket for live updates
- **Centralized Logging**: ELK stack for monitoring and debugging
- **Secrets Management**: Vault for secure credential storage
- **API Gateway**: Single entry point with routing and validation

## Technology Stack

- **Backend**: Node.js, Fastify, SQLite
- **Frontend**: TypeScript, Vite
- **Infrastructure**: Docker, ELK Stack, HashiCorp Vault
- **Security**: WAF (ModSecurity), JWT, HTTPS

