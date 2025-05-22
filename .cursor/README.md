# EcoWatch Cursor Configuration

This directory contains custom configuration for the Cursor IDE to optimize development workflow for the EcoWatch project.

## Configuration Files

- `.cursorrc` - Main configuration file
- `rules.json` - Code quality and formatting rules
- `settings.json` - Editor and project settings

## Key Features

- TypeScript-optimized settings for monorepo structure
- NestJS and Next.js specific conventions
- shadcn/ui component integration
- Performance and security suggestions
- Code quality automation

## Usage

1. These configuration files are automatically loaded by Cursor
2. No additional setup required
3. Settings are optimized for TypeScript development in a Turborepo monorepo

## Project Structure

The EcoWatch project follows a monorepo structure:

```
EcoWatch/
├── apps/
│   ├── api-gateway/          # API Gateway service
│   ├── mqtt-influxdb-service/ # MQTT to InfluxDB service
│   ├── data-simulator/       # Data simulation service
│   └── web/                  # Next.js frontend
├── libs/
│   └── shared/               # Shared code and utilities
└── .cursor/                  # Cursor IDE configuration
```

## Custom Rules

The custom rules in `rules.json` enforce:

1. TypeScript best practices
2. Consistent code formatting
3. NestJS and Next.js conventions
4. Monorepo dependency management
5. Security practices

## Recommended Extensions

For the best development experience, install these Cursor extensions:

1. ESLint
2. Prettier
3. Turborepo
4. Tailwind CSS IntelliSense
5. GitLens

## CI/CD Integration

The configuration is compatible with the project's CI/CD pipeline and helps prevent common issues that might fail pipeline checks. 