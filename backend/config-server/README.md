# Config Server

## What is it?

The Config Server is a centralized configuration service built with **Spring Cloud Config Server**. It stores and serves configuration properties for all microservices in the SmartLingua platform from a single location, instead of each service managing its own configuration independently.

## Why use it?

- **Centralized management** — All service configurations live in one place (`resources/config/`), making them easy to find and update.
- **Consistency** — Shared properties (database, Keycloak, Eureka) are defined once in `application.properties` and inherited by all services.
- **Runtime refresh** — Configuration changes can be applied without restarting services using the `/actuator/refresh` endpoint.

## How it works

The Config Server runs on **port 8888** and uses the `native` profile to load `.properties` files from the classpath:

```
resources/config/
├── application.properties              # Shared config (all services)
├── exam-cert-service.properties        # Exam service overrides
├── forum-service.properties            # Forum service overrides
├── course-resource-service.properties  # Course service overrides
├── quiz-service.properties             # Quiz service overrides
├── messaging-service.properties        # Messaging service overrides
└── adaptive-learning-service.properties # Adaptive learning overrides
```

Each client service fetches its config at startup via:

```yaml
spring:
  config:
    import: optional:configserver:http://config-server:8888
```

## Quick start

```bash
# Run with Docker Compose (starts automatically with all services)
docker compose up -d config-server

# Verify it's running
curl http://localhost:8888/actuator/health

# Fetch a service's config
curl http://localhost:8888/exam-cert-service/default

# Refresh a client's config at runtime (no restart needed)
curl -X POST http://localhost:8081/actuator/refresh
```
