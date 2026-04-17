# Discovery Server

Eureka-based service registry. All backend services register here so the API Gateway can find them.

## What It Does

- Runs a **Netflix Eureka** server
- Backend services register themselves on startup
- API Gateway uses Eureka to route requests to the right service

## Port

| Environment | Port |
| ----------- | ---- |
| Docker      | 8761 |
| Local       | 8761 |

## Run Locally

```bash
cd backend
mvn -pl discovery-server spring-boot:run
```

Open the Eureka dashboard: http://localhost:8761

## Tech

- Spring Cloud Netflix Eureka Server
- Spring Boot Actuator
