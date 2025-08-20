# Notes Backend (Express) - Run, Configuration, Health, and E2E

This service exposes REST APIs for authentication and notes CRUD. It is designed to run locally against the MySQL database from notes_database and be consumed by the Angular frontend.

Key routes:
- Health: GET /
- OpenAPI (JSON): GET /openapi.json
- Swagger UI: GET /docs
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile
- Notes: GET/POST /api/notes, GET/PUT/DELETE /api/notes/:id

Required software:
- Node.js 18+ and npm
- A reachable MySQL instance (defaults assume local MySQL at 127.0.0.1:5000 set up by notes_database)

Environment variables:
- Server
  - PORT (default 3001)
  - HOST (default 0.0.0.0)
  - JSON_BODY_LIMIT (default 1mb)
- CORS
  - CORS_ORIGIN: Comma-separated list of allowed origins. Default allows:
    - http://localhost:4200, http://127.0.0.1:4200 (Angular dev default)
    - http://localhost:3000, http://127.0.0.1:3000
- Database
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - Alternatively, MYSQL_URL, MYSQL_PORT, MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD
- Auth
  - JWT_SECRET (required in production; set a strong value)
  - BCRYPT_SALT_ROUNDS (default 10)

Recommended local .env:
```
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
```

Install and run (development):
1) Ensure MySQL is running (see notes_database/startup.sh)
2) cd personal-notes-organizer-162076-162087/notes_backend
3) npm install
4) npm run dev
   The server listens on http://localhost:3001 by default.

Install and run (production-style):
- npm start

Ports and endpoints:
- Base: http://localhost:3001
- Health: GET /
- Swagger UI: GET /docs
- OpenAPI JSON: GET /openapi.json
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile (Bearer)
- Notes: GET /api/notes, POST /api/notes, GET /api/notes/:id, PUT /api/notes/:id, DELETE /api/notes/:id

Health and Swagger checks:
- curl http://localhost:3001/
- Open http://localhost:3001/docs
- curl http://localhost:3001/openapi.json

Minimal E2E smoke test (with frontend):
1) Start database (port 5000), backend (port 3001), and frontend (port 3000).
2) In the frontend, register a user. Verify POST /api/auth/register returns 201 and a token.
3) Login with the same user. Verify POST /api/auth/login returns 200 and a token; GET /api/auth/profile returns the profile when Authorization header is set.
4) Create a note via UI. Verify POST /api/notes returns 201 with a note id.
5) Open the created note (GET /api/notes/:id).
6) Update note fields (PUT /api/notes/:id) and verify updated values.
7) Delete the note (DELETE /api/notes/:id) and verify 204.

Reverse proxy notes:
- app.set('trust proxy', true) is enabled.
- Ensure CORS_ORIGIN includes the browser origin used to access the API when behind a proxy/HTTPS terminator.
- Swagger UI and /openapi.json compute the server URL dynamically from the incoming request, so the UI will point to the correct origin.

Troubleshooting:
- 401 Unauthorized from notes routes: ensure the Authorization header contains a valid “Bearer <token>” from login/register.
- CORS errors: ensure CORS_ORIGIN includes the Angular dev origin (http://localhost:3000).
- DB errors: confirm .env matches MySQL host:port and credentials. The DB schema for users/notes is created by notes_database/schema.sql; notes service also ensures the notes table exists.

Sources:
- src/app.js, src/config.js, src/db.js
- src/routes/*, src/controllers/*, src/services/*
- swagger.js and interfaces/openapi.json
