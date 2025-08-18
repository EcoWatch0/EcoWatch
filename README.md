# EcoWatch

Plateforme de monitoring environnemental. Monorepo géré avec pnpm, composé d’une API Gateway NestJS, d’une app Web Next.js, d’un microservice MQTT→InfluxDB et d’un simulateur de données.

## Documentation

Toute la documentation détaillée est disponible dans `docs/`.
- Page d’accueil de la doc: `docs/README.md`
- Aperçu, env, déploiement, et pages par application.

## Architecture

- **apps/api-gateway**: API REST (NestJS 11) avec authentification JWT, gestion des utilisateurs, organisations et intégration InfluxDB (création de buckets par organisation).
- **apps/web**: Interface web (Next.js 15, App Router) pour l’administration et la visualisation.
- **apps/mqtt-influxdb-service**: Microservice qui consomme les messages MQTT et les écrit dans InfluxDB (multi-tenant par bucket d’organisation).
- **apps/data-simulator**: Génère et publie des données capteurs sur MQTT.
- **libs/shared**: Modules Nest partagés (Prisma, InfluxDB, interactors `users`, `organisations`, `sensors`, configurations).

### Schéma (simplifié)

```mermaid
graph LR
  subgraph Web
    A[Next.js App]-- JWT -->B(API Gateway)
  end
  subgraph Backend
    B(API Gateway)-- Prisma -->D[(PostgreSQL)]
    B-- Influx Bucket Mgmt -->E[(InfluxDB)]
  end
  subgraph Data Flow
    F[Data Simulator]-- MQTT -->C[(RabbitMQ MQTT)]
    C-- MQTT -->G[MQTT→InfluxDB Service]
    G-- write -->E
  end
```

## Structure du projet

```
EcoWatch/
├── apps/
│   ├── api-gateway/
│   ├── web/
│   ├── mqtt-influxdb-service/
│   └── data-simulator/
├── libs/
│   └── shared/
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
└── kube/
```

## Prérequis

- Node.js 20+
- pnpm 9/10+
- Docker (pour exécuter l’infra locale: Postgres, Redis, RabbitMQ, InfluxDB)

## Installation

```bash
pnpm install

# Générer Prisma client
pnpm prisma:generate

# (optionnel) appliquer les migrations en dev
pnpm prisma:migrate
```

## Variables d’environnement (extraits)

- Commun/Infra (utilisées par plusieurs apps):
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecowatch`
  - `JWT_SECRET=change-me`
  - `INFLUXDB_URL=http://localhost:8086`
  - `INFLUXDB_TOKEN=...`
  - `INFLUXDB_ORG=...`
  - `INFLUXDB_ORG_ID=...`
  - `INFLUXDB_BUCKET=...` (bucket par défaut)

- API Gateway (`apps/api-gateway`):
  - `API_PORT=3001` (par défaut)
  - `FRONTEND_URL=http://localhost:3000` (CORS)
  - `DATABASE_URL`, `JWT_SECRET` (obligatoires)

- Web (`apps/web`):
  - `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

- MQTT→InfluxDB (`apps/mqtt-influxdb-service`):
  - `APP_MQTT_INFLUXDB_SERVICE_PORT=3002`
  - `MQTT_BROKER_URL=mqtt://localhost:1883`
  - `MQTT_CLIENT_ID=mqtt-influxdb-service`
  - `MQTT_TOPIC=ecowatch/#` (ou liste séparée par des virgules)
  - `MQTT_QOS=1`
  - `BATCH_SIZE=100`, `BATCH_INTERVAL=5000`, `MAX_RETRIES=5`
  - `FAILED_MESSAGES_PATH=./failed-messages`
  - `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_ORG_ID`

- Data Simulator (`apps/data-simulator`):
  - `MQTT_BROKER_URL=mqtt://localhost:1883`
  - `MQTT_CLIENT_ID=eco-watch-data-simulator`
  - `MQTT_USERNAME=`, `MQTT_PASSWORD=` (si nécessaire)
  - `DATA_FAKER_INTERVAL_MS=5000`
  - `DATA_FAKER_SENSORS_COUNT=5`

Des scripts existent pour copier des fichiers `.env`:

```bash
pnpm env:copy:local   # copie env/.env.local vers chaque app et à la racine
pnpm env:copy:prod    # copie env/.env.prod
pnpm env:clean        # nettoie les .env copiés
```

## Démarrage rapide (local)

1) Lancer l’infrastructure (optionnel mais recommandé):

```bash
docker compose up -d
```

2) Démarrer toutes les apps en dev:

```bash
pnpm dev
```

3) Accès:

- Web: `http://localhost:3000`
- API: `http://localhost:3001/api` (Swagger: `http://localhost:3001/docs`)
- MQTT→InfluxDB Service: `http://localhost:3002`
- RabbitMQ UI: `http://localhost:15672`
- InfluxDB UI: `http://localhost:8086`

## API (aperçu)

- Authentification: `POST /api/auth/login` → `{ email, password }` → `{ access_token, user }`
- Utilisateurs (JWT + rôles): `POST /api/users`, `GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id`, `DELETE /api/users/:id`
- Organisations (JWT + rôles): `POST /api/organizations`, `GET /api/organizations`, `GET /api/organizations/:id`, `GET /api/organizations/:id/members`, `PATCH /api/organizations/:id`, `DELETE /api/organizations/:id`

Les rôles disponibles (Prisma): `ADMIN`, `OPERATOR`, `USER`. Les endpoints sont protégés via `JwtAuthGuard` et `RolesGuard`.

## Données et stockage

- PostgreSQL: modèle Prisma (`prisma/schema.prisma`) avec `User`, `Organization`, `Sensor`, `SensorData`, `Alert`.
- InfluxDB: buckets par organisation. Le microservice MQTT→InfluxDB écrit des points dans le bucket de l’organisation liée au capteur.
- MQTT: topics de publication simulés `ecowatch/sensors/{sensorId}/data`.

## Scripts utiles (racine)

```bash
pnpm dev        # lance toutes les apps en mode dev
pnpm build      # build de toutes les apps/libs
pnpm start      # start de toutes les apps (prod)
pnpm test       # exécute les tests
pnpm lint       # lint de tous les paquets
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:studio
```

## Déploiement

- Docker: `docker-compose.yml` fournit une stack complète (API, Web, Postgres, Redis, RabbitMQ, InfluxDB, simulateur, service MQTT→InfluxDB).
- Kubernetes: manifestes d’exemple dans `kube/` (dont `kube/web/*` et `kube/argo-cd/*`).

## Qualité et sécurité

- Validation de schémas avec `class-validator`/`class-transformer`
- Authentification JWT (variable `JWT_SECRET` requise)
- CORS configuré (`FRONTEND_URL`)

## Contribution

1. Créez une branche (`git checkout -b feature/ma-feature`)
2. Committez (`git commit -m 'feat: ...'`)
3. Poussez (`git push origin feature/ma-feature`)
4. Ouvrez une Pull Request

## Licence

MIT
