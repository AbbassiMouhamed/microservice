# SmartLingua

A microservices-based language learning platform built with **Spring Boot** and **Angular**.

## Architecture

```
┌──────────┐     ┌─────────────┐     ┌──────────────────────┐
│ Frontend │────▶│ API Gateway │────▶│  Backend Services    │
│ (Angular)│     │  (port 8080)│     │                      │
│  port 80 │     └──────┬──────┘     │  discovery-server    │
└──────────┘            │            │  exam-cert-service   │
                        │            │  forum-service       │
                  ┌─────▼─────┐      │  course-resource     │
                  │  Keycloak │      │  quiz-service        │
                  │ (port 8180│      │  messaging-service   │
                  └───────────┘      │  adaptive-learning   │
                                     └──────────┬───────────┘
                                                │
                                          ┌─────▼─────┐
                                          │   MySQL   │
                                          │ (port 3306│
                                          └───────────┘
```

## Tech Stack

| Layer       | Technology                         |
| ----------- | ---------------------------------- |
| Frontend    | Angular 21, Angular Material, SCSS |
| Backend     | Spring Boot 3.4.4, Java 17         |
| API Gateway | Spring Cloud Gateway (reactive)    |
| Discovery   | Netflix Eureka                     |
| Auth        | Keycloak 26.1 (OAuth2 / JWT)       |
| Database    | MySQL 8.0 + Flyway migrations      |
| AI          | Spring AI + OpenAI (adaptive)      |
| Containers  | Docker + Docker Compose            |

## Services Overview

| Service                     | Port | Description                            |
| --------------------------- | ---- | -------------------------------------- |
| `frontend`                  | 80   | Angular UI served via Nginx            |
| `api-gateway`               | 8080 | Routes requests to backend services    |
| `discovery-server`          | 8761 | Eureka service registry                |
| `exam-cert-service`         | 8081 | Exams, attempts, PDF certificates      |
| `forum-service`             | 8082 | Forum posts, comments, announcements   |
| `course-resource-service`   | 8083 | Courses, chapters, sessions, resources |
| `quiz-service`              | 8084 | Quizzes, question bank, NLP analysis   |
| `messaging-service`         | 8085 | Real-time chat, WebSocket, chatbot     |
| `adaptive-learning-service` | 8086 | AI-powered adaptive learning engine    |

## Quick Start

### Prerequisites

- Docker Desktop

### Run everything

```bash
docker compose up --build
```

Wait until all services are healthy, then open:

- **App** → http://localhost
- **Keycloak Admin** → http://localhost:8180/admin
- **Eureka Dashboard** → http://localhost:8761

### Demo Users

| Username | Password | Role    |
| -------- | -------- | ------- |
| admin    | admin    | ADMIN   |
| teacher  | teacher  | TEACHER |
| student  | student  | STUDENT |

## Project Structure

```
microservice/
├── backend/
│   ├── adaptive-learning-service/
│   ├── api-gateway/
│   ├── course-resource-service/
│   ├── discovery-server/
│   ├── exam-cert-service/
│   ├── forum-service/
│   ├── messaging-service/
│   ├── quiz-service/
│   └── pom.xml              (parent POM)
├── frontend/
│   └── smartlingua-ui/       (Angular app)
├── keycloak/                 (realm config)
└── docker-compose.yml
```

## Local Development

If you want to run services outside Docker:

1. Start infrastructure:

   ```bash
   docker compose up -d mysql keycloak
   ```

2. Start discovery server:

   ```bash
   cd backend
   mvn -pl discovery-server spring-boot:run
   ```

3. Start any backend service:

   ```bash
   cd backend
   SPRING_PROFILES_ACTIVE=local mvn -pl <service-name> spring-boot:run
   ```

4. Start frontend:
   ```bash
   cd frontend/smartlingua-ui
   npm install
   npm start
   ```
   Open http://localhost:4200

# SmartLingua (Task 4) — Exams & Certificates

Small microservices project for **exam management** and **digitally signed PDF certificates**.

## What’s in this repo

- **frontend**: Angular UI
- **api-gateway**: Spring Cloud Gateway (single API entry point)
- **discovery-server**: Eureka service registry
- **exam-cert-service**: Spring Boot service (courses, users, exams, attempts, certificates)
- **mysql**: MySQL 8 database

## Quick start (recommended): Docker Compose

Prereqs: Docker Desktop

```powershell
cd C:\Users\abbas\Desktop\microservice
docker compose up --build
```

Open the UI: http://localhost (you’ll be redirected to Keycloak login)

Demo users:

- admin / admin
- teacher / teacher
- student / student

Keycloak admin console: http://localhost:8180/admin (admin / admin)

## Local dev (Windows)

Recommended: keep **MySQL in Docker**, run Spring + Angular locally.

### 1) Start MySQL + Keycloak

```powershell
cd C:\Users\abbas\Desktop\microservice
docker compose up -d mysql keycloak
```

Keycloak: http://localhost:8180

### 2) Start Eureka

```powershell
cd backend
mvn -pl discovery-server -DskipTests spring-boot:run
```

### 3) Start exam-cert-service (uses local profile)

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE = "local"
mvn -pl exam-cert-service -DskipTests spring-boot:run
```

### 4) Start api-gateway (uses local profile)

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE = "local"
$env:SERVER_PORT = "8080"
mvn -pl api-gateway -DskipTests spring-boot:run
```

### 5) Start the UI

```powershell
cd frontend\smartlingua-ui
npm install
npm start
```

The Angular dev server uses a proxy for `/api` (see [frontend/smartlingua-ui/proxy.conf.json](frontend/smartlingua-ui/proxy.conf.json)).

## 2-minute demo flow

1. Create a **course**
2. Create a **student**
3. Create an **exam** → publish it
4. Submit an **attempt** (score)
5. Issue a **certificate** → verify signature → download PDF

## Useful URLs

- UI (local dev): http://localhost:4200
- Eureka: http://localhost:8761
- Gateway (if used): http://localhost:8080
- exam-cert-service (Swagger): http://localhost:8081/swagger-ui

## Notes

- If you run Spring services **outside Docker**, the database host must be `localhost` (not `mysql`).
- If ports like **80/8080/3306** are already in use, change ports or stop the conflicting app.

More details (optional): [WORKFLOW.md](WORKFLOW.md)
