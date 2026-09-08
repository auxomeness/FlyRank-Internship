# Week 4 Auth API Source Brief

Goal: build an Express API with Supabase Auth.

Required endpoints:

- GET /
- GET /health
- POST /auth/signup
- POST /auth/login
- POST /auth/logout
- GET /public/info
- GET /protected/profile
- GET /protected/dashboard

Required behavior:

- Signup returns 201 for a created user.
- Login returns 200 and access/refresh tokens.
- Logout returns 204.
- Missing, malformed, invalid, or expired bearer tokens return 401 JSON.
- Public route works without auth.
- Protected routes require `Authorization: Bearer <token>`.
- Invalid request bodies return 400 JSON.

Required project proof:

- Supabase URL and publishable key are loaded from `.env`.
- `.env` is gitignored.
- `.env.example` is committed.
- The API uses reusable middleware for protected routes.
- Swagger UI documents every endpoint and bearer auth.
- README explains setup, run command, endpoint table, and security notes.
- A screenshot shows Swagger UI.
