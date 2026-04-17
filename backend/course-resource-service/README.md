# Course & Resource Service

Manages courses, chapters, sessions, and learning resources.

## What It Does

- CRUD for **courses**
- Organize content into **chapters** and **séances** (sessions)
- Attach **resources** (files, links) to courses
- Manage **métiers** (professions/domains)

## API Endpoints

| Method | Path                          | Description      |
| ------ | ----------------------------- | ---------------- |
| GET    | `/api/courses`                | List courses     |
| POST   | `/api/courses`                | Create a course  |
| GET    | `/api/courses/{id}/chapters`  | List chapters    |
| GET    | `/api/courses/{id}/seances`   | List sessions    |
| GET    | `/api/courses/{id}/resources` | List resources   |
| GET    | `/api/metier`                 | List professions |

## Port

| Environment | Port |
| ----------- | ---- |
| Docker      | 8083 |
| Local       | 8083 |

## Run Locally

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn -pl course-resource-service spring-boot:run
```

Swagger UI: http://localhost:8083/swagger-ui

## Tech

- Spring Boot (Web, JPA, Security)
- MySQL + Flyway migrations
- Eureka Client
