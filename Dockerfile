FROM node:20-alpine AS builder

# Installation de pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installation des dépendances
RUN pnpm install

# Copie du reste des fichiers
COPY . .

# Build de l'application
RUN pnpm run build

# Image de production
FROM node:20-alpine

WORKDIR /app

# Installation de pnpm
RUN npm install -g pnpm

# Copie des fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Installation des dépendances de production uniquement
RUN pnpm install --prod

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/apps/api-gateway/src/main.js"] 