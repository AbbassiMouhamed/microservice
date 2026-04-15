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

Open the UI: http://localhost

## Local dev (Windows)

Recommended: keep **MySQL in Docker**, run Spring + Angular locally.

### 1) Start MySQL

```powershell
cd C:\Users\abbas\Desktop\microservice
docker compose up -d mysql
```

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

### 4) Start api-gateway

```powershell
cd backend
$env:EUREKA_URL = "http://localhost:8761/eureka"
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
