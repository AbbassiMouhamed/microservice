# Task 4 — Exam & Certification (Digital Signature)

Goal: manage exams and issue **digitally signed PDF certificates** for students who pass.

## What you can do (demo)

1. Create a **course**
2. Create a **student**
3. Create an **exam** → publish it
4. Submit an **attempt** (score)
5. Issue a **certificate** → verify signature → download PDF

## Roles (conceptual)

- **Admin**: manage users
- **Teacher**: manage exams + issue certificates
- **Student**: submit attempts + receive certificate

> The UI is a simple demo (no real authentication).

## Where it lives

- UI pages: Courses, Students, Exams, Certificates
- API base path: `/api/...` (usually via the gateway)

Run instructions are in the root README: [README.md](README.md)
