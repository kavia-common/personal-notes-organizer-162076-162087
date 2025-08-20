# personal-notes-organizer-162076-162087

Backend notes:
- Required env vars for notes_backend:
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - JWT_SECRET (required for secure tokens in production)
  - BCRYPT_SALT_ROUNDS (optional, default 10)
  - PORT (optional, default 3000)
  - HOST (optional, default 0.0.0.0)
  - CORS_ORIGIN (optional, comma-separated list of allowed origins; default allows localhost:4200 and :3000)
  - JSON_BODY_LIMIT (optional, default 1mb)
- Auth endpoints (mounted under /api/auth):
  - POST /api/auth/register { email, password }
  - POST /api/auth/login { email, password }
  - GET /api/auth/profile (Authorization: Bearer <token>)

Frontend notes:
- The Angular app should use an environment variable for API base URL (e.g., http://localhost:3000).
- When deploying with SSR/reverse proxy, ensure the browser origin is added to CORS_ORIGIN on the backend.
- OpenAPI/Swagger docs are available at:
  - /docs (UI) and /openapi.json (JSON). The server URL is dynamically derived from the incoming request host/protocol.
- Typical local dev setup:
  - Backend: PORT=3000
  - Frontend (Angular dev server): http://localhost:4200
  - Ensure CORS_ORIGIN includes http://localhost:4200 for local development.