# API Gateway

API NestJS 11 avec authentification JWT, gestion des utilisateurs et organisations.

## Démarrage

```bash
pnpm install
pnpm dev
# ou
pnpm build && pnpm start
```

Base path: `/api` — Swagger: `http://localhost:3001/docs`

## Endpoints

- Auth
  - `POST /api/auth/login` → `{ email, password }`

- Users (JWT + rôles)
  - `POST /api/users` (ADMIN)
  - `GET /api/users` (ADMIN, OPERATOR)
  - `GET /api/users/:id` (ADMIN, OPERATOR)
  - `PATCH /api/users/:id` (ADMIN)
  - `DELETE /api/users/:id` (ADMIN)

- Organizations (JWT + rôles)
  - `POST /api/organizations` (ADMIN)
  - `GET /api/organizations`
  - `GET /api/organizations/:id`
  - `GET /api/organizations/:id/members`
  - `PATCH /api/organizations/:id` (ADMIN)
  - `DELETE /api/organizations/:id` (ADMIN)

Rôles: `ADMIN`, `OPERATOR`, `USER`.

## Variables d’environnement

- `API_PORT=3001`, `FRONTEND_URL`, `DATABASE_URL`, `JWT_SECRET`


