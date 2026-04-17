# Quiz Service

Question bank, quiz attempts, and NLP-powered text analysis.

## What It Does

- Manage a **question bank** (teachers/admins)
- Generate and submit **quiz attempts** with automatic scoring
- **NLP text analysis** using LanguageTool API (grammar, spelling, style)

## API Endpoints

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/quiz/questions` | List questions           |
| POST   | `/api/quiz/questions` | Create a question        |
| GET    | `/api/quiz/attempts`  | List quiz attempts       |
| POST   | `/api/quiz/attempts`  | Submit a quiz attempt    |
| POST   | `/api/quiz/nlp`       | Analyze text with NLP    |

## Port

| Environment | Port |
|-------------|------|
| Docker      | 8084 |
| Local       | 8084 |

## Run Locally

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn -pl quiz-service spring-boot:run
```

Swagger UI: http://localhost:8084/swagger-ui

## Tech

- Spring Boot (Web, JPA, Security)
- Spring WebFlux (reactive HTTP client for NLP API)
- MySQL + Flyway migrations
- Eureka Client
