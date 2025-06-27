# --- Builder stage (install + build) ---
FROM node:20-alpine AS builder

# 1) Installer pnpm & préparer le workdir
RUN npm install -g pnpm
WORKDIR /app

# 2) Copier les manifests pour installer TOUTES les deps (prod + dev)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api-gateway/package.json                   ./apps/api-gateway/
COPY apps/web/package.json                           ./apps/web/
COPY apps/mqtt-influxdb-service/package.json         ./apps/mqtt-influxdb-service/
COPY apps/data-simulator/package.json                ./apps/data-simulator/
COPY libs/shared/package.json                        ./libs/shared/
RUN pnpm install --frozen-lockfile

# 3) Copier le code source
COPY . .

# 4) Générer les clients Prisma dans chaque workspace concerné
RUN pnpm prisma generate

# 5) Compiler chaque workspace
RUN pnpm --filter shared                   build \
    && pnpm --filter api-gateway           build \
    && pnpm --filter web                   build \
    && pnpm --filter data-simulator        build \
    && pnpm --filter mqtt-influxdb-service build

# --- Runner for API Gateway ---
FROM node:20-alpine AS runner-api
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copier build + seules prod deps
COPY --chown=nextjs:nodejs --from=builder /app/apps/api-gateway/dist         ./apps/api-gateway/dist
COPY --chown=nextjs:nodejs --from=builder /app/node_modules                  ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared/node_modules      ./libs/shared/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared                   ./libs/shared

USER nextjs
EXPOSE 3001
CMD ["node", "apps/api-gateway/dist/main.js"]

# --- Runner for Web ---
FROM node:20-alpine AS runner-web
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --chown=nextjs:nodejs --from=builder /app/apps/web/.next           ./apps/web/.next
COPY --chown=nextjs:nodejs --from=builder /app/apps/web/public          ./apps/web/public
COPY --chown=nextjs:nodejs --from=builder /app/node_modules             ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/apps/web/node_modules    ./apps/web/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared/node_modules ./libs/shared/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared              ./libs/shared

USER nextjs
WORKDIR /app/apps/web
ENV PATH /app/apps/web/node_modules/.bin:$PATH
EXPOSE 3000
CMD ["next", "start"]

# --- Runner for Data Simulator ---
FROM node:20-alpine AS runner-data-simulator
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --chown=nextjs:nodejs --from=builder /app/apps/data-simulator/dist         ./apps/data-simulator/dist
COPY --chown=nextjs:nodejs --from=builder /app/node_modules                     ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/apps/data-simulator/node_modules ./apps/data-simulator/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared/node_modules         ./libs/shared/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared                      ./libs/shared

USER nextjs
CMD ["node", "apps/data-simulator/dist/index.js"]

# --- Runner for MQTT→InfluxDB Service ---
FROM node:20-alpine AS runner-mqtt-influxdb-service
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --chown=nextjs:nodejs --from=builder /app/apps/mqtt-influxdb-service/dist         ./apps/mqtt-influxdb-service/dist
COPY --chown=nextjs:nodejs --from=builder /app/node_modules                            ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/apps/mqtt-influxdb-service/node_modules ./apps/mqtt-influxdb-service/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared/node_modules                ./libs/shared/node_modules
COPY --chown=nextjs:nodejs --from=builder /app/libs/shared                             ./libs/shared

USER nextjs
CMD ["node", "apps/mqtt-influxdb-service/dist/main.js"]
