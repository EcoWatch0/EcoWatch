# EcoWatch Backend

Backend monorepo pour l'application EcoWatch, construit avec NestJS.

## Structure du Projet

```
ecowatch-backend/
├── apps/
│   ├── api-gateway/        # API Gateway principal
│   ├── auth-service/       # Service d'authentification
│   └── user-service/       # Service de gestion des utilisateurs
└── libs/
    └── shared/            # Code partagé entre les services
```

## Prérequis

- Node.js (v20+)
- pnpm (v10+)

## Installation

```bash
# Installation des dépendances
pnpm install
```

## Démarrage

```bash
# Mode développement
pnpm start:dev

# Mode production
pnpm start:prod
```

## Documentation API

La documentation Swagger est disponible à l'adresse : `http://localhost:3000/api`

## Tests

```bash
# Tests unitaires
pnpm test

# Tests e2e
pnpm test:e2e

# Couverture de tests
pnpm test:cov
```

## Conventions de Code

### Style de Code
- Utilisation de TypeScript strict
- Respect des principes SOLID
- Documentation des fonctions et classes avec JSDoc

### Nommage
- Interfaces : Préfixe `I` (ex: `IUser`)
- DTOs : Suffixe `Dto` (ex: `CreateUserDto`)
- Services : Suffixe `Service` (ex: `AuthService`)

### Structure des Dossiers
- `src/` : Code source
  - `controllers/` : Contrôleurs REST
  - `services/` : Services métier
  - `dto/` : Data Transfer Objects
  - `entities/` : Entités de base de données
  - `interfaces/` : Interfaces TypeScript

### Git
- Branches : `feature/`, `bugfix/`, `hotfix/`
- Commits : Format conventionnel
  - `feat:` Nouvelles fonctionnalités
  - `fix:` Corrections de bugs
  - `docs:` Documentation
  - `refactor:` Refactoring
  - `test:` Tests

## Sécurité

- Authentification JWT
- Validation des entrées avec class-validator
- Protection CORS configurée
- Rate limiting activé
- Helmet pour les en-têtes HTTP

## Contribution

1. Créer une branche (`git checkout -b feature/AmazingFeature`)
2. Commit des changements (`git commit -m 'feat: Add some AmazingFeature'`)
3. Push vers la branche (`git push origin feature/AmazingFeature`)
4. Ouvrir une Pull Request

## License

[MIT](LICENSE)
