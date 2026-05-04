# Spring Cloud Infrastructure

## What is it?

Spring Cloud is a set of libraries that solves common distributed-systems problems: service discovery, centralized configuration, and intelligent routing. SmartLingua uses three Spring Cloud components to wire all microservices together.

## Components

### 1. Eureka — Service Discovery (`discovery-server`)

**What**: Netflix Eureka is a service registry. Every microservice registers itself with a name and address on startup.

**Why**:
- The API Gateway doesn't need hardcoded IP addresses — it resolves service names like `exam-cert-service` dynamically
- Services can scale horizontally; the registry always reflects the current set of live instances
- Health checks automatically deregister crashed instances

**How it works**:
```
discovery-server starts (port 8761)
       ↓
each service registers: "I am exam-cert-service at 172.x.x.x:8081"
       ↓
api-gateway queries Eureka: "where is exam-cert-service?"
       ↓
api-gateway routes to the live instance
```

Dashboard: **http://localhost:8761**

---

### 2. Config Server — Centralized Configuration (`config-server`)

**What**: Spring Cloud Config Server serves configuration properties to all microservices from a single location. Services fetch their config at startup instead of bundling `application.properties` in their JAR.

**Why**:
- One place to change a shared property (DB URL, Keycloak URL) — no need to rebuild 9 services
- Environment-specific overrides — the same service picks up `dev` or `prod` properties based on its active profile
- Runtime refresh — `POST /actuator/refresh` reloads config without restarting a service

**Config files** (inside `config-server/src/main/resources/config/`):

| File | Served to |
|---|---|
| `application.properties` | All services (shared defaults) |
| `exam-cert-service.properties` | exam-cert-service only |
| `forum-service.properties` | forum-service only |
| `course-resource-service.properties` | course-resource-service only |
| `quiz-service.properties` | quiz-service only |
| `messaging-service.properties` | messaging-service only |
| `adaptive-learning-service.properties` | adaptive-learning-service only |

**Client configuration** (in each microservice):

```yaml
spring:
  config:
    import: optional:configserver:http://config-server:8888
```

Endpoints:
- `GET http://localhost:8888/{service}/{profile}` — view a service's resolved config
- `POST http://localhost:{port}/actuator/refresh` — refresh a running service's config

---

### 3. API Gateway — Routing + Security (`api-gateway`)

**What**: Spring Cloud Gateway (reactive, WebFlux-based) is the single entry point for all API traffic. It resolves services from Eureka and validates JWT tokens from Keycloak.

**Why**:
- **Single ingress point** — the frontend only needs one URL (`http://localhost:8080`)
- **JWT validation at the edge** — backend services trust the forwarded token; no duplicate auth logic
- **WebSocket support** — transparently proxies WebSocket upgrade for the messaging service

**Route table** (resolved by Eureka):

| Path | Target | Notes |
|---|---|---|
| `/api/forum/**` | `forum-service` | |
| `/api/courses/**` | `course-resource-service` | |
| `/api/metier/**` | `course-resource-service` | |
| `/api/quiz/**` | `quiz-service` | |
| `/api/messaging/**` | `messaging-service` | |
| `/ws-messaging/**` | `messaging-service` | WebSocket upgrade |
| `/api/adaptive/**` | `adaptive-learning-service` | |
| `/api/**` | `exam-cert-service` | catch-all for exam/cert/user APIs |

## Startup Order

The services must start in this order to avoid registration failures:

```
1. discovery-server  (must be running before any service registers)
2. config-server     (must be running before any service fetches config)
3. mysql + keycloak  (must be healthy before business services start)
4. [all microservices in parallel]
5. frontend          (last, after api-gateway is ready)
```

Docker Compose `depends_on` with `condition: service_healthy` enforces this automatically.

## Technology Versions

| Component | Version |
|---|---|
| Spring Boot | 3.5.3 |
| Spring Cloud | 2025.0.0 |
| Java | 25 |
| Spring Cloud Netflix Eureka | included in `spring-cloud-dependencies` BOM |
| Spring Cloud Config | included in `spring-cloud-dependencies` BOM |
| Spring Cloud Gateway | included in `spring-cloud-dependencies` BOM |
