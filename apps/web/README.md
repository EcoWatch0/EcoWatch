# EcoWatch Web (Next.js)

Interface web (Next.js 15, App Router) pour l’administration et la visualisation des données EcoWatch.

## Démarrage

```bash
pnpm install
pnpm dev
# ou
pnpm build && pnpm start
```

Par défaut, l’application écoute sur `http://localhost:3000`.

## Variables d’environnement

- `NEXT_PUBLIC_API_URL` (ex: `http://localhost:3001/api`)

## Fonctionnalités

- Pages d’authentification (login, register, reset password)
- Tableau de bord et sections d’administration (utilisateurs, organisations)
- Thème clair/sombre, composants UI (Radix UI + TailwindCSS)

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

