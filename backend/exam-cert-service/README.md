# Exam & Certificate Service

Manages exams, student attempts, and generates digitally signed PDF certificates.

## What It Does

- CRUD for **exams** (create, publish, manage)
- Record and score **exam attempts**
- Generate **PDF certificates** with digital signatures
- Manage **user profiles** and **courses** (exam context)

## API Endpoints

| Method | Path                | Description         |
| ------ | ------------------- | ------------------- |
| GET    | `/api/exams`        | List exams          |
| POST   | `/api/exams`        | Create an exam      |
| GET    | `/api/attempts`     | List attempts       |
| POST   | `/api/attempts`     | Submit an attempt   |
| GET    | `/api/certificates` | List certificates   |
| POST   | `/api/certificates` | Issue a certificate |
| GET    | `/api/users`        | List users          |

## Port

| Environment | Port |
| ----------- | ---- |
| Docker      | 8081 |
| Local       | 8081 |

## Run Locally

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn -pl exam-cert-service spring-boot:run
```

Swagger UI: http://localhost:8081/swagger-ui

## Tech

- Spring Boot (Web, JPA, Security)
- MySQL + Flyway migrations
- Apache PDFBox (PDF generation)
- Eureka Client
