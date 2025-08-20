# Notes Backend (Express) - Configuration and Environment

This service exposes REST APIs for authentication and notes CRUD.

Key routes:
- Health: GET /
- OpenAPI (JSON): GET /openapi.json
- Swagger UI: GET /docs
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile
- Notes: GET/POST /api/notes, GET/PUT/DELETE /api/notes/:id

Environment variables:
- Server
  - PORT (default 3000)
  - HOST (default 0.0.0.0)
  - JSON_BODY_LIMIT (default 1mb)
- CORS
  - CORS_ORIGIN: Comma-separated list of allowed origins. Default allows:
    - http://localhost:4200, http://127.0.0.1:4200 (Angular dev)
    - http://localhost:3000, http://127.0.0.1:3000
- Database
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - Alternatively, MYSQL_URL, MYSQL_PORT, MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD
- Auth
  - JWT_SECRET (required in production)
  - BCRYPT_SALT_ROUNDS (default 10)

CORS behavior:
- If CORS_ORIGIN is set, only those origins are allowed.
- If not set, defaults allow Angular dev server and common localhost ports.
- Non-browser clients (no Origin header) are allowed.

API base URL:
- Local development: http://localhost:3000
- In Swagger UI (/docs), the server URL is set dynamically from the incoming request scheme/host/port. You can also fetch /openapi.json which dynamically reflects the current host.

SSR / Reverse proxy notes:
- If served behind a proxy (e.g., Nginx) or HTTPS terminator, ensure:
  - app.set('trust proxy', true) is enabled (already set).
  - The external browser origin (e.g., https://app.example.com) is included in CORS_ORIGIN.
  - If the proxy maps to a different port, the OpenAPI docs will reflect the proxy host/port thanks to dynamic server calculation.

Running:
- npm run dev (nodemon) or npm start
- Ensure the database is reachable and the required tables exist (see src/models/README.md for DDL).

See .env.example for a full list of variables and sane defaults.
