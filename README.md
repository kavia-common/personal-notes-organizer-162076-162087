# Personal Notes Organizer - Monorepo Overview

This repository contains a fullstack notes application split into three containers:
- notes_database (MySQL): stores users and notes
- notes_backend (Express): serves REST APIs for auth and notes CRUD
- notes_frontend (Angular): browser UI for user registration, login, and managing notes

This README provides end-to-end setup, run instructions, health/Swagger/DB checks, ports summary, and a minimal E2E smoke test that covers register → login → create/read/update/delete a note.

Repository structure:
- personal-notes-organizer-162076-162085/notes_database
- personal-notes-organizer-162076-162087/notes_backend
- personal-notes-organizer-162076-162086/notes_frontend

Prerequisites:
- Node.js 18+ and npm
- MySQL 8.x accessible locally or the ability to run the provided MySQL startup script (Linux-based environment with sudo for local mysqld)
- Open network ports: 5000 (MySQL), 3001 (backend), 3000 (Angular dev server by default is configured to 3000 in angular.json)

Quick start (local development):
1) Database (MySQL on port 5000)
   - cd personal-notes-organizer-162076-162085/notes_database
   - bash startup.sh
     This starts MySQL on port 5000 with:
       DB: myapp
       Root password: dbuser123
       App user: appuser / dbuser123
     It applies schema.sql idempotently and saves a connection helper at db_connection.txt.
   - Optional DB viewer:
     - source db_visualizer/mysql.env
     - cd db_visualizer && npm install && npm start
     - Visit http://localhost:3000 to inspect the database (adjust if port is in use).

2) Backend (Express on port 3001)
   - cd personal-notes-organizer-162076-162087/notes_backend
   - Create .env (example values for local dev):
       HOST=0.0.0.0
       PORT=3001
       DB_HOST=127.0.0.1
       DB_PORT=5000
       DB_NAME=myapp
       DB_USER=appuser
       DB_PASSWORD=dbuser123
       JWT_SECRET=replace-with-a-strong-secret
       CORS_ORIGIN=http://localhost:3000
       JSON_BODY_LIMIT=1mb
     Alternatively you can use MYSQL_* variables (MYSQL_PORT, MYSQL_DB, etc.) as supported by src/config.js.
   - npm install
   - npm run dev
   - Health endpoint: http://localhost:3001/
   - Swagger UI: http://localhost:3001/docs
   - OpenAPI JSON: http://localhost:3001/openapi.json

3) Frontend (Angular dev server on port 3000)
   - cd personal-notes-organizer-162076-162086/notes_frontend
   - npm install
   - Ensure the backend base URL for dev is set to http://localhost:3001:
       See src/environments/environment.development.ts -> apiBaseUrl
       It defaults to (globalThis as any)?.ENV_API_BASE_URL || 'http://localhost:3001'
       You can launch with environment variable ENV_API_BASE_URL if needed.
   - npm start
   - Visit http://localhost:3000

Endpoint/port summary:
- MySQL: localhost:5000 (DB myapp, user appuser/dbuser123; root/dbuser123)
- Backend: http://localhost:3001
  - Health: GET /
  - Swagger UI: GET /docs
  - OpenAPI JSON: GET /openapi.json
  - Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile (Bearer)
  - Notes:
    - GET /api/notes
    - POST /api/notes
    - GET /api/notes/:id
    - PUT /api/notes/:id
    - DELETE /api/notes/:id
- Frontend (Angular dev): http://localhost:3000 (configured in angular.json serve options)

Health/Swagger/DB connection checks:
- Database:
  - From notes_database dir, use the printed mysql command in db_connection.txt (e.g., mysql -u appuser -pdbuser123 -h localhost -P 5000 myapp)
  - Ensure the users and notes tables exist (schema.sql applies automatically via startup.sh)
- Backend:
  - Health: curl http://localhost:3001/
  - Swagger: open http://localhost:3001/docs and try the endpoints
  - OpenAPI JSON: curl http://localhost:3001/openapi.json
- Frontend:
  - Visit http://localhost:3000
  - Ensure CORS_ORIGIN in backend includes http://localhost:3000

Minimal E2E smoke test:
1) Register
   - In the frontend at http://localhost:3000, go to Register.
   - Create a new account with email and password (≥ 6 chars).
   - The frontend calls POST /api/auth/register and stores a JWT on success.
2) Login
   - If logged out, use Login with the same credentials.
   - Successful login stores JWT and shows your email in the top bar.
3) Create a note
   - Click New Note, enter a title and optional content/tags, click Save.
   - This calls POST /api/notes and redirects to /notes/:id.
4) Read notes
   - Go to My Notes to see the list. Search and tag filter are available.
   - Selecting a note calls GET /api/notes/:id.
5) Update a note
   - In the editor, modify the title/content/tags or Archived toggle, click Save.
   - This calls PUT /api/notes/:id and navigates to the updated note.
6) Delete a note
   - In the editor, click Delete and confirm. This calls DELETE /api/notes/:id and returns to the list.

Troubleshooting:
- CORS errors: ensure backend CORS_ORIGIN includes the frontend origin (http://localhost:3000).
- DB connection errors: confirm MySQL is running on port 5000 and credentials match .env in backend.
- Swagger reports different server address: /docs and /openapi.json dynamically adapt to the current host/port—prefer accessing them via the same URL the backend is served on.

Security notes:
- Always set a strong JWT_SECRET in production.
- Restrict CORS_ORIGIN to trusted origins only in production.

Sources:
- notes_backend: src/app.js, src/config.js, src/routes/*, src/services/*
- notes_database: startup.sh, schema.sql, db_visualizer/*
- notes_frontend: src/environments/environment.development.ts, angular.json, src/app/**
