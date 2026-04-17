# Adaptive Learning Service

AI-powered adaptive learning engine that personalizes the learning experience.

## What It Does

- Build **student profiles** with skill levels
- **Adjust difficulty** based on student performance (runs every 10 min)
- Generate **AI recommendations** using OpenAI via Spring AI (runs every hour)
- Provide **placement tests** to assess starting level
- **Teacher dashboard** — view student progress and analytics
- Communicate with other services via **Feign clients**

## API Endpoints

| Method | Path                    | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | `/api/adaptive`         | Main adaptive endpoint |
| GET    | `/adaptive/me/profile`  | Student's own profile  |
| GET    | `/api/adaptive/teacher` | Teacher dashboard data |

## Port

| Environment | Port |
| ----------- | ---- |
| Docker      | 8086 |
| Local       | 8086 |

## Environment Variables

| Variable         | Description                  |
| ---------------- | ---------------------------- |
| `OPENAI_API_KEY` | OpenAI API key for Spring AI |

## Run Locally

```bash
cd backend
SPRING_PROFILES_ACTIVE=local OPENAI_API_KEY=your-key mvn -pl adaptive-learning-service spring-boot:run
```

## Tech

- Spring Boot (Web, JPA, Security)
- Spring AI + OpenAI (1.0.0-M6)
- Spring Cloud OpenFeign (inter-service calls)
- MySQL + Flyway migrations
- Eureka Client
- Scheduled tasks (`@Scheduled`)
