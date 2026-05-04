# Documentation Index

## Microservices

| Service | Port | Description |
|---|---|---|
| [discovery-server](../backend/discovery-server/README.md) | 8761 | Netflix Eureka service registry |
| [config-server](../backend/config-server/README.md) | 8888 | Spring Cloud Config — centralized configuration |
| [api-gateway](../backend/api-gateway/README.md) | 8080 | Single entry point — routing + JWT validation |
| [exam-cert-service](../backend/exam-cert-service/README.md) | 8081 | Exams, attempts, PDF certificates |
| [forum-service](../backend/forum-service/README.md) | 8082 | Discussion forum, posts, comments, announcements |
| [course-resource-service](../backend/course-resource-service/README.md) | 8083 | Courses, chapters, sessions, resources |
| [quiz-service](../backend/quiz-service/README.md) | 8084 | Question bank, quizzes, NLP text analysis |
| [messaging-service](../backend/messaging-service/README.md) | 8085 | Real-time chat, WebSocket, video signaling |
| [adaptive-learning-service](../backend/adaptive-learning-service/README.md) | 8086 | AI-powered adaptive learning engine |

## CI/CD Tools

| Tool | Doc | Purpose |
|---|---|---|
| GitHub Actions | [github-actions.md](ci-cd/github-actions.md) | CI (build + test) and CD (Docker build + deploy) |
| Docker | [docker.md](ci-cd/docker.md) | Multi-stage container builds for all services |
| Docker Compose | [docker-compose.md](ci-cd/docker-compose.md) | Full-stack local development and deployment |
| SonarQube | [sonarqube.md](ci-cd/sonarqube.md) | Static code analysis and quality gates |
| Kubernetes | [kubernetes.md](ci-cd/kubernetes.md) | Production container orchestration |

## Monitoring

| Tool | Doc | Purpose |
|---|---|---|
| Prometheus | [prometheus.md](monitoring/prometheus.md) | Metrics collection from all services |
| Grafana | [grafana.md](monitoring/grafana.md) | Dashboard visualization and alerting |

## Infrastructure

| Component | Doc | Purpose |
|---|---|---|
| Keycloak | [keycloak.md](infrastructure/keycloak.md) | Identity provider — OAuth2, JWT, RBAC |
| Spring Cloud | [spring-cloud.md](infrastructure/spring-cloud.md) | Eureka, Config Server, API Gateway internals |
