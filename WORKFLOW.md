# SmartLingua — Project workflow (Frontend use-cases + Backend API)

This document explains **how the app works end-to-end**:

- What a user can do in the **frontend UI** (use-cases)
- Which **backend APIs** are called for each step
- How the **microservices** interact (Gateway + Eureka + exam-cert-service)

If you only need “how to run”, see the root README.

## Big picture (how requests flow)

All browser requests are meant to go through the **API Gateway**.

- **Frontend → Gateway**: the UI calls relative URLs under `/api/...`.
- **Gateway → exam-cert-service**: the gateway routes `/api/**` to the service using Eureka discovery.
- **exam-cert-service → MySQL**: data is stored in MySQL.
- **Digital signature + PDF**: when issuing a certificate, the service creates a canonical JSON payload, signs it, and generates a PDF.

### URLs you’ll use (local)

- UI (Docker): `http://localhost`
- UI (local dev): `http://localhost:4200`
- Gateway: `http://localhost:8080`
- Eureka: `http://localhost:8761`
- exam-cert-service (debug/Swagger/Actuator): `http://localhost:8081`

### How `/api` works in the UI

- In Docker: Nginx in the frontend container reverse-proxies `/api/*` to the gateway.
- In local development: Angular uses `proxy.conf.json` so `/api/*` is forwarded to `http://localhost:8080`.

## Frontend pages (use-cases)

The UI is intentionally simple and focuses on Task 4.

### 1) Courses

Goal: define what the exam is associated with.

What you do in the UI:

- View existing courses
- Create a course

API calls:

- `GET /api/courses`
- `POST /api/courses`

### 2) Students

Goal: create test students who can take exams.

What you do in the UI:

- View users filtered to students
- Create a student

API calls:

- `GET /api/users?type=STUDENT`
- `POST /api/users`

### 3) Exams

Goal: create and manage exams (draft → published → closed).

What you do in the UI:

- View all exams
- Create an exam for a course
- Publish an exam (make it “active”)
- Close an exam

API calls:

- `GET /api/exams`
- `POST /api/exams`
- `PUT /api/exams/{examId}/publish`
- `PUT /api/exams/{examId}/close`

### 4) Exam details (Attempts)

Goal: submit attempts and determine pass/fail.

What you do in the UI:

- Open an exam
- View attempts for that exam
- Submit an attempt for a selected student with a score

What the backend does:

- Stores the attempt
- Computes `passed` based on `score >= passingScore`
- Computes a `skillLevel` (A1..C2) for reporting

API calls:

- `GET /api/exams/{examId}`
- `GET /api/exams/{examId}/attempts`
- `POST /api/exams/{examId}/attempts`

### 5) Certificates (Digital signature + PDF)

Goal: issue a signed certificate PDF for a _passing_ attempt.

What you do in the UI:

- View issued certificates
- Issue a certificate from a passing attempt
- Verify a certificate’s signature
- Download the certificate PDF

What the backend does when issuing:

1. Builds a canonical JSON payload (certificate + student + exam + attempt)
2. Signs it using RSA (SHA256withRSA)
3. Generates a PDF that contains certificate info + signature
4. Stores:
   - payload JSON
   - signature (Base64)
   - public key (PEM)
   - PDF bytes

API calls:

- `GET /api/certificates`
- `POST /api/certificates/issue`
- `GET /api/certificates/{certificateId}/verify`
- `GET /api/certificates/{certificateId}/download`

## “Happy path” workflow (recommended demo)

1. Create a course
2. Create a student
3. Create an exam for that course (in DRAFT)
4. Publish the exam
5. Submit an attempt with a passing score
6. Issue a certificate for that attempt
7. Verify the signature
8. Download the PDF

## Backend API reference (what’s exposed)

Base URL (via gateway): `http://localhost:8080`

> PowerShell note: `curl` is an alias for `Invoke-WebRequest`. Use `curl.exe` for real curl.

### Users

- `GET /api/users`
  - Optional query: `type` = `ADMIN | TEACHER | STUDENT`
- `GET /api/users/{id}`
- `POST /api/users`
  - Body:
    - `name` (required)
    - `email` (required, must look like an email)
    - `userType` (required)

### Courses

- `GET /api/courses`
- `GET /api/courses/{id}`
- `POST /api/courses`
  - Body:
    - `title` (required)
    - `level` (optional)
    - `startDate` (optional, ISO string)

### Exams

- `GET /api/exams`
- `GET /api/exams/{id}`
- `POST /api/exams`
  - Body:
    - `courseId` (required)
    - `title` (required)
    - `scheduledAt` (optional, ISO string)
    - `durationMinutes` (required, >= 1)
    - `maxScore` (required, >= 1)
    - `passingScore` (required, >= 0)
- `PUT /api/exams/{id}/publish`
- `PUT /api/exams/{id}/close`
- `GET /api/exams/{id}/attempts`
- `POST /api/exams/{id}/attempts`
  - Body:
    - `studentId` (required)
    - `score` (required, >= 0)

Exam status values:

- `DRAFT`
- `PUBLISHED`
- `CLOSED`

### Attempts

- `GET /api/attempts/{id}`

Attempt fields you’ll commonly use:

- `passed` (boolean)
- `skillLevel` (`A1 | A2 | B1 | B2 | C1 | C2`)

### Certificates

- `GET /api/certificates`
- `GET /api/certificates/{id}`
- `POST /api/certificates/issue`
  - Body:
    - `examAttemptId` (required)
  - Notes:
    - returns **400** if the attempt did not pass
    - returns **400** if a certificate already exists for the attempt
- `GET /api/certificates/{id}/verify`
  - Response:
    - `{ "valid": true | false }`
- `GET /api/certificates/{id}/download`
  - Returns: `application/pdf` (attachment)

## Service-only docs (direct access)

These endpoints are not routed through the gateway (because the gateway only forwards `/api/**`).

- Swagger UI: `http://localhost:8081/swagger-ui`
- OpenAPI JSON: `http://localhost:8081/api-docs`
- Actuator: `http://localhost:8081/actuator`

## Common troubleshooting hints

- If the UI can’t call the backend:
  - ensure the gateway is running on `8080`
  - ensure Angular dev proxy (local) or Nginx (Docker) is in place
- If issuing a certificate fails:
  - confirm the attempt is `passed=true`
  - confirm you didn’t already issue a certificate for that attempt
