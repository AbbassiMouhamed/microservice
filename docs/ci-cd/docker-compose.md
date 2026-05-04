# Docker Compose

## What is it?

Docker Compose is a tool for defining and running multi-container applications from a single YAML file. One command — `docker compose up` — starts the entire stack.

## Why we use it

- **Local development** — developers run the full stack on their machine with a single command
- **Service orchestration** — handles startup order via `depends_on` with health checks
- **Environment injection** — service configuration (DB URLs, Keycloak URLs, ports) is injected via environment variables, keeping Dockerfiles generic
- **Optional deployment** — the same `docker-compose.yml` is used by the CD pipeline to deploy to a Docker host via SSH

## File: `docker-compose.yml`

### Stack Overview

```
frontend (port 80)
  └─ api-gateway (port 8080)
       ├─ discovery-server (port 8761)
       ├─ config-server (port 8888)
       ├─ keycloak (port 8180)
       └─ [all microservices]
            └─ mysql (port 3306)
```

### Services

| Service                     | Image / Build                      | Port | Depends on                                                |
| --------------------------- | ---------------------------------- | ---- | --------------------------------------------------------- |
| `mysql`                     | `mysql:8.0`                        | 3306 | —                                                         |
| `keycloak`                  | `quay.io/keycloak/keycloak:26.1.2` | 8180 | —                                                         |
| `discovery-server`          | build                              | 8761 | —                                                         |
| `config-server`             | build                              | 8888 | discovery-server                                          |
| `api-gateway`               | build                              | 8080 | discovery-server, config-server, keycloak                 |
| `exam-cert-service`         | build                              | 8081 | mysql ✓healthy, discovery-server, config-server, keycloak |
| `forum-service`             | build                              | 8082 | mysql ✓healthy, discovery-server, config-server, keycloak |
| `course-resource-service`   | build                              | 8083 | mysql ✓healthy, discovery-server, config-server, keycloak |
| `quiz-service`              | build                              | 8084 | mysql ✓healthy, discovery-server, config-server, keycloak |
| `messaging-service`         | build                              | 8085 | mysql ✓healthy, discovery-server, config-server, keycloak |
| `adaptive-learning-service` | build                              | 8086 | mysql ✓healthy, discovery-server, config-server, keycloak |
| `frontend`                  | build                              | 80   | api-gateway                                               |

### MySQL Health Check

MySQL uses a proper health check so services don't start before the database is ready:

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot"]
  interval: 5s
  timeout: 5s
  retries: 30
```

Services that need the database use `condition: service_healthy` — guaranteeing Flyway migrations don't fail at startup.

### Keycloak Realm Auto-Import

Keycloak starts with `--import-realm` and mounts `./keycloak/` to `/opt/keycloak/data/import`. The `realm-smartlingua.json` file pre-creates the realm, clients, and demo users on first boot.

### API Gateway — Dual Keycloak URL

The API Gateway has two Keycloak URLs to handle mixed browser/container access:

| Variable               | Value                       | Reason                                                                |
| ---------------------- | --------------------------- | --------------------------------------------------------------------- |
| `KEYCLOAK_ISSUER_URI`  | `http://localhost:8180/...` | Browser tokens include this as issuer; gateway validates token issuer |
| `KEYCLOAK_JWK_SET_URI` | `http://keycloak:8080/...`  | Container fetches JWKS from internal network, not host port           |

### Volumes

| Volume           | Used by           | Purpose                                           |
| ---------------- | ----------------- | ------------------------------------------------- |
| `mysql-data-8-0` | mysql             | Persist database data across restarts             |
| `signing-keys`   | exam-cert-service | Persist RSA keys used for PDF certificate signing |

## Quick Commands

```bash
# Start everything (build if needed)
docker compose up --build

# Start in background
docker compose up -d --build

# View logs for one service
docker compose logs -f api-gateway

# Stop everything
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

## Monitoring Compose

A separate optional stack `docker-compose.yml` can be extended with the `monitoring/` directory to add Prometheus + Grafana. See [prometheus.md](../monitoring/prometheus.md).
