# API Gateway

Single entry point for all API requests. Routes traffic to the correct backend service.

## What It Does

- Routes incoming HTTP requests to backend services via Eureka
- Validates **JWT tokens** from Keycloak
- Supports **WebSocket** upgrade for messaging

## Routes

| Path                | Target Service            |
| ------------------- | ------------------------- |
| `/api/forum/**`     | forum-service             |
| `/api/courses/**`   | course-resource-service   |
| `/api/metier/**`    | course-resource-service   |
| `/api/quiz/**`      | quiz-service              |
| `/api/messaging/**` | messaging-service         |
| `/ws-messaging/**`  | messaging-service (WS)    |
| `/api/adaptive/**`  | adaptive-learning-service |
| `/api/**`           | exam-cert-service         |

## Port

| Environment | Port |
| ----------- | ---- |
| Docker      | 8080 |
| Local       | 8080 |

## Run Locally

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn -pl api-gateway spring-boot:run
```

## Tech

- Spring Cloud Gateway (WebFlux / reactive)
- Spring Security + OAuth2 Resource Server
- Eureka Client
