# personal-notes-organizer-162076-162087

Backend notes:
- Required env vars for notes_backend:
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - JWT_SECRET (required for secure tokens in production)
  - BCRYPT_SALT_ROUNDS (optional, default 10)
  - PORT (optional, default 3000)
- Auth endpoints (mounted under /api/auth):
  - POST /api/auth/register { email, password }
  - POST /api/auth/login { email, password }
  - GET /api/auth/profile (Authorization: Bearer <token>)