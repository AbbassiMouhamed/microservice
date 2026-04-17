# Forum Service

Discussion forum for students and teachers with posts, comments, and announcements.

## What It Does

- Create, edit, and delete **forum posts**
- Add **comments** to posts
- Publish **announcements** (teachers/admins)
- Track **notifications** for users

## API Endpoints

| Method | Path                                  | Description           |
|--------|---------------------------------------|-----------------------|
| GET    | `/api/forum/posts`                    | List posts            |
| POST   | `/api/forum/posts`                    | Create a post         |
| GET    | `/api/forum/posts/{id}/comments`      | List comments         |
| POST   | `/api/forum/posts/{id}/comments`      | Add a comment         |
| GET    | `/api/forum/announcements`            | List announcements    |
| GET    | `/api/forum/notifications`            | Get notifications     |

## Port

| Environment | Port |
|-------------|------|
| Docker      | 8082 |
| Local       | 8082 |

## Run Locally

```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn -pl forum-service spring-boot:run
```

Swagger UI: http://localhost:8082/swagger-ui

## Tech

- Spring Boot (Web, JPA, Security)
- MySQL + Flyway migrations
- Eureka Client
