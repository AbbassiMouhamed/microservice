# SmartLingua UI

Angular frontend for the SmartLingua platform.

## What It Does

- **Dashboard** — overview of learning activity
- **Courses** — browse, create (teacher/admin), and view course details
- **Quizzes** — take quizzes, view history, manage question bank, NLP analyzer
- **Forum** — posts, comments, announcements, notifications
- **Messaging** — real-time chat, chatbot, translator
- **Learning** — student profile, learning path, placement test, teacher dashboard
- **Exams** — take exams, view results, certificates
- **Admin** — user management (admin only)

## Prerequisites

- Node.js 24+
- npm

## Run Locally

```bash
cd frontend/smartlingua-ui
npm install
npm start
```

Open http://localhost:4200 (redirects to Keycloak login)

### Demo Users

| Username | Password | Role    |
|----------|----------|---------|
| admin    | admin    | ADMIN   |
| teacher  | teacher  | TEACHER |
| student  | student  | STUDENT |

## Build for Production

```bash
npm run build
```

Output goes to `dist/smartlingua-ui/`.

In Docker, the build output is served by **Nginx** on port 80, with a reverse proxy to the API Gateway.

## Tech

- Angular 21 (standalone components)
- Angular Material 21
- SCSS
- keycloak-js 26.2 (authentication)
- Vitest (testing)
# SmartLingua UI (Angular)

Student-facing UI for the SmartLingua Task 4 demo.

## Run (local dev)

```powershell
cd C:\Users\abbas\Desktop\microservice\frontend\smartlingua-ui
npm install
npm start
```

Open: http://localhost:4200 (will redirect to Keycloak login)

Keycloak: http://localhost:8180

Demo users:

- admin / admin
- teacher / teacher
- student / student

## API proxy

During local development the UI calls `/api/...` and forwards it using:

- [proxy.conf.json](proxy.conf.json)

If you change backend ports, update that file to match.
