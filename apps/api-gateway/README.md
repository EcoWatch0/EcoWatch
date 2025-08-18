# EcoWatch API Gateway

API REST bâtie avec NestJS 11. Fournit l’authentification JWT et la gestion des utilisateurs et organisations. Génère la documentation Swagger.

## Démarrage

```bash
pnpm install
pnpm dev        # nest start --watch
# ou
pnpm build && pnpm start
```

Par défaut, l’API écoute sur `http://localhost:3001` (préfixe global `/api`).

## Documentation API

- Swagger: `http://localhost:3001/docs`
- Base path: `/api`

## Variables d’environnement

- `API_PORT` (défaut: 3001)
- `FRONTEND_URL` (CORS, défaut: http://localhost:3000)
- `JWT_SECRET` (obligatoire)
- `DATABASE_URL` (obligatoire, connexion Prisma)
- Influx (si usages via libs partagées): `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_ORG_ID`, `INFLUXDB_BUCKET`

## Endpoints principaux

- Authentification
  - `POST /api/auth/login` → body `{ email, password }` → `{ access_token, user }`

- Utilisateurs (JWT + rôles)
  - `POST /api/users` (ADMIN)
  - `GET /api/users` (ADMIN, OPERATOR)
  - `GET /api/users/:id` (ADMIN, OPERATOR)
  - `PATCH /api/users/:id` (ADMIN)
  - `DELETE /api/users/:id` (ADMIN)

- Organisations (JWT + rôles)
  - `POST /api/organizations` (ADMIN) → crée aussi un bucket InfluxDB puis synchronise l’organisation
  - `GET /api/organizations` (ADMIN, OPERATOR)
  - `GET /api/organizations/:id` (ADMIN, OPERATOR)
  - `GET /api/organizations/:id/members` (ADMIN, OPERATOR)
  - `PATCH /api/organizations/:id` (ADMIN)
  - `DELETE /api/organizations/:id` (ADMIN)

Rôles globaux (`@prisma/client`): `ADMIN`, `OPERATOR`, `USER`. Protection via `JwtAuthGuard` et `RolesGuard`.

## Scripts

```bash
pnpm dev           # start en watch
pnpm build         # génère Prisma client puis build Nest
pnpm start         # start prod
pnpm test          # jest
pnpm lint          # eslint src/**/*.ts --fix
```

## Notes techniques

- Préfixe global: `app.setGlobalPrefix('api')`
- Swagger à `/docs`
- Validation globale via `ValidationPipe` (transform, whitelist)
- Arrêt propre sur SIGTERM/SIGINT


