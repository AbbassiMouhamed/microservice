# SonarQube

## What is it?

SonarQube is a static code analysis platform that measures code quality, catches bugs, detects security vulnerabilities, and tracks technical debt over time. It provides a quality gate — a pass/fail threshold that CI pipelines can enforce.

## Why we use it

- **Multi-language** — single analysis covers both the Java backend and the TypeScript/Angular frontend
- **Security scanning** — detects OWASP Top 10 vulnerabilities in application code
- **Quality gate enforcement** — the CI job fails if new code doesn't meet the quality threshold, preventing regressions
- **Coverage tracking** — aggregates JaCoCo (Java) and LCOV (TypeScript) reports into one dashboard

## Configuration

### Root config — `sonar-project.properties`

Covers the entire monorepo:

```properties
sonar.projectKey=smartlingua-monorepo
sonar.sources=backend,frontend/smartlingua-ui/src
sonar.tests=backend,frontend/smartlingua-ui/src
sonar.test.inclusions=**/*.spec.ts,**/*Test.java,**/*Tests.java
sonar.exclusions=**/node_modules/**,**/dist/**,**/target/**
sonar.coverage.jacoco.xmlReportPaths=backend/**/target/site/jacoco/jacoco.xml
sonar.javascript.lcov.reportPaths=frontend/smartlingua-ui/coverage/**/lcov.info
sonar.java.binaries=backend/**/target/classes
```

### Frontend config — `frontend/smartlingua-ui/sonar-project.properties`

Scoped to the Angular app for standalone frontend analysis runs.

## CI Integration

Sonar analysis runs in dedicated jobs in `.github/workflows/ci.yml`:

| Job              | Trigger                    | Condition                                              |
| ---------------- | -------------------------- | ------------------------------------------------------ |
| `backend-sonar`  | after `backend-ci` passes  | `SONAR_TOKEN` and `SONAR_HOST_URL` secrets must be set |
| `frontend-sonar` | after `frontend-ci` passes | same secrets required                                  |

The `if: ${{ secrets.SONAR_TOKEN != '' && secrets.SONAR_HOST_URL != '' }}` condition makes Sonar **optional** — the pipeline passes even without it. This allows contributors without a Sonar server to run CI.

## Backend Analysis

Runs via the Maven plugin:

```bash
mvn -f backend/pom.xml -B verify sonar:sonar \
  -Dsonar.host.url="$SONAR_HOST_URL" \
  -Dsonar.token="$SONAR_TOKEN" \
  -Dsonar.projectKey=smartlingua-backend
```

The `verify` phase runs unit tests and generates JaCoCo XML reports before the Sonar analysis reads them.

## Frontend Analysis

Uses the official `SonarSource/sonarqube-scan-action@v5` GitHub Action, which reads `frontend/smartlingua-ui/sonar-project.properties` automatically.

## Setting up a Local SonarQube Server

```bash
# Pull and start SonarQube Community Edition
docker run -d --name sonarqube -p 9000:9000 sonarqube:community

# Open http://localhost:9000
# Default credentials: admin / admin (change on first login)

# Generate a token under My Account → Security → Generate Tokens
# Set GitHub secrets: SONAR_TOKEN=<token> SONAR_HOST_URL=http://your-server:9000
```
