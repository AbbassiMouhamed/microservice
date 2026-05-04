# Docker

## What is it?

Docker is a container runtime that packages an application and all its dependencies into an isolated, portable image. The same image runs identically on a developer laptop, CI, or production server.

## Why we use it

- **Reproducible builds** — every developer and CI job builds the exact same artifact
- **Dependency isolation** — each service carries its own JRE, no conflicts between services
- **Simplified deployment** — a single `docker compose up` starts the full stack including MySQL, Keycloak, and all 9 microservices

## Image Strategy — Multi-Stage Builds

All 9 backend Dockerfiles use a two-stage build to keep images small and secure:

```
Stage 1 — build   (maven:3.9-eclipse-temurin-25)
 └─ compile + package the JAR

Stage 2 — runtime (eclipse-temurin:25-jre)
 └─ copy only the JAR — no Maven, no source code, no build tools
```

Benefits:

- **Final images contain no build tools** — reduces attack surface
- **JRE-only runtime** — `eclipse-temurin:25-jre` is ~250 MB vs ~500 MB for the full JDK
- **Layer caching** — POMs are copied and dependencies resolved before source code, so code changes don't bust the dependency cache

## Dependency Cache Pattern

Each Dockerfile follows this sequence to maximize Docker layer caching:

```dockerfile
# 1. Copy all pom.xml files (rarely change)
COPY backend/pom.xml backend/pom.xml
COPY backend/<service>/pom.xml backend/<service>/pom.xml
...

# 2. Install parent POM
RUN mvn -f backend/pom.xml -N install -q

# 3. Pre-fetch dependencies (cached unless pom.xml changes)
RUN mvn -f backend/<service>/pom.xml -DskipTests dependency:go-offline

# 4. Copy source (changes frequently — comes last)
COPY backend/<service>/src backend/<service>/src

# 5. Build
RUN mvn -f backend/<service>/pom.xml -DskipTests package
```

## Service Images

| Service                     | Exposed Port | Base Image               |
| --------------------------- | ------------ | ------------------------ |
| `discovery-server`          | 8761         | `eclipse-temurin:25-jre` |
| `config-server`             | 8888         | `eclipse-temurin:25-jre` |
| `api-gateway`               | 8080         | `eclipse-temurin:25-jre` |
| `exam-cert-service`         | 8081         | `eclipse-temurin:25-jre` |
| `forum-service`             | 8082         | `eclipse-temurin:25-jre` |
| `course-resource-service`   | 8083         | `eclipse-temurin:25-jre` |
| `quiz-service`              | 8084         | `eclipse-temurin:25-jre` |
| `messaging-service`         | 8085         | `eclipse-temurin:25-jre` |
| `adaptive-learning-service` | 8086         | `eclipse-temurin:25-jre` |
| `frontend`                  | 80           | `nginx:alpine`           |

## Frontend Image

The Angular app uses a separate two-stage approach:

1. **Build stage** — `node:20-alpine` runs `npm ci` + `ng build`
2. **Runtime stage** — `nginx:alpine` serves the compiled static files via `nginx.conf`

## `.dockerignore`

The root `.dockerignore` excludes:

- `.git/` — not needed in image, saves hundreds of MB
- `**/target/` — build artifacts are re-created inside the container
- `**/node_modules/` — re-installed inside the container
- `**/.angular/` — Angular dev cache

## Naming Convention

Images are tagged with the git SHA in CI: `smartlingua/<service>:<github.sha>`. This makes every build fully traceable to its source commit.
