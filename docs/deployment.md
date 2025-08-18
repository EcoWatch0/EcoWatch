# Déploiement

## Docker Compose

Le fichier `docker-compose.yml` lance:

- `api` (port 3001)
- `web` (port 3000)
- `db` (PostgreSQL, port 5432)
- `redis` (port 6379)
- `influxdb` (port 8086)
- `rabbitmq` (ports 1883, 5672, 15672)
- `data-simulator`
- `mqtt-influxdb-service` (port 3002)

Commandes:

```bash
docker compose up -d
docker compose logs -f api | web | mqtt-influxdb-service
```

## Kubernetes

Des manifestes sont fournis dans `kube/` (ex: `kube/web/*`). Adaptez les `ConfigMap`, `Deployment`, `Service` et `Ingress` à votre cluster.

## Scripts monorepo

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm lint
```


