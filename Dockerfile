FROM node:20-alpine AS builder

# Installation de pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copie des fichiers de dépendances
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/web/package.json ./apps/web/
COPY libs/shared/package.json ./libs/shared/

# Installation des dépendances
RUN pnpm install

# Copie du reste des fichiers
COPY . .

# Build des applications
RUN pnpm --filter shared build
RUN pnpm prisma generate
RUN pnpm --filter api-gateway build
RUN pnpm --filter web build

FROM node:20-alpine AS runner-api

WORKDIR /app

# Copier les fichiers nécessaires depuis l’étape builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY --from=builder /app/libs/shared/node_modules ./libs/shared/node_modules

EXPOSE 3001

# Lancer l’API (remplacez le chemin si nécessaire)
CMD ["node", "dist/apps/api-gateway/src/main.js"]

FROM node:20-alpine AS runner-web

WORKDIR /app

# Copier les fichiers nécessaires pour l’application web
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

EXPOSE 3000

# Positionner le contexte de travail dans le dossier de l’application web
WORKDIR /app/apps/web

# Ajouter le répertoire des exécutables de l’application web dans le PATH
ENV PATH /app/apps/web/node_modules/.bin:$PATH

# Lancer Next en mode production
CMD ["next", "start"]