# GitHub Actions

## What is it?

GitHub Actions is a CI/CD platform built into GitHub. It runs automated workflows on events such as pushes, pull requests, and manual triggers — no external CI server required.

## Why we use it

- **Zero infrastructure** — workflows run on GitHub-hosted runners, nothing to self-host
- **Native integration** — tight feedback loop: build status shows directly on every PR
- **Matrix builds** — we use matrix strategy to build all 9 Docker images in parallel (one job per service)
- **Conditional steps** — Sonar and deploy jobs only run when the required secrets are configured, making the pipeline safe to run in any fork

## Workflows

### CI — `.github/workflows/ci.yml`

Triggered on every push and pull request to any branch.

| Job              | Purpose                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `backend-ci`     | Compile + unit-test all 9 Spring Boot modules with JDK 25 and a live MySQL container                             |
| `frontend-ci`    | Install, build, and run Vitest unit tests for the Angular app                                                    |
| `backend-sonar`  | Static code analysis on the backend (runs after `backend-ci`, requires `SONAR_TOKEN` + `SONAR_HOST_URL` secrets) |
| `frontend-sonar` | Static code analysis on the frontend (requires same secrets)                                                     |

### CD — `.github/workflows/cd.yml`

Triggered on every push to `main` and on manual dispatch (`workflow_dispatch`).

| Job               | Purpose                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-backend`  | Builds Docker images for all 9 backend services (matrix strategy, `fail-fast: false`)                                                                                   |
| `docker-frontend` | Builds the Angular/Nginx Docker image                                                                                                                                   |
| `deploy`          | SSH into a remote host, extract the archive, and run `docker compose up -d` (optional — requires `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH` secrets) |

## Required Secrets

| Secret           | Used by                           | Description                                  |
| ---------------- | --------------------------------- | -------------------------------------------- |
| `SONAR_TOKEN`    | `backend-sonar`, `frontend-sonar` | SonarQube authentication token               |
| `SONAR_HOST_URL` | `backend-sonar`, `frontend-sonar` | SonarQube server URL                         |
| `DEPLOY_HOST`    | `deploy`                          | Remote server hostname or IP                 |
| `DEPLOY_USER`    | `deploy`                          | SSH username on remote server                |
| `DEPLOY_SSH_KEY` | `deploy`                          | Private SSH key (PEM format)                 |
| `DEPLOY_PATH`    | `deploy`                          | Deployment target directory on remote server |
| `DEPLOY_PORT`    | `deploy`                          | SSH port (optional, defaults to `22`)        |

## Key Decisions

- **JDK 25 (Temurin)** — matches the project's `maven.compiler.release=25` in `backend/pom.xml`
- **MySQL service container** — the `backend-ci` job spins up a real MySQL 8 instance using GitHub's service containers; `ci-init.sql` creates the databases the microservices expect
- **`npm ci` over `npm install`** — ensures deterministic installs in CI using the lockfile
- **`fetch-depth: 0` for Sonar** — SonarQube needs full git history to compute new-code coverage correctly
