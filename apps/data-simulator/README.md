# EcoWatch Data Simulator

Un microservice qui génère des données environnementales simulées et les publie sur un broker MQTT pour l'application EcoWatch.

## Fonctionnalités

- Simulation de plusieurs capteurs environnementaux
- Génération de données pour la température, l'humidité, la qualité de l'air, la qualité de l'eau et l'humidité du sol
- Publication des données via MQTT
- Configuration via variables d'environnement
- Support pour les connexions sécurisées (via mot de passe MQTT)

## Installation

```bash
# Installer les dépendances
pnpm install

# Compiler le code TypeScript
pnpm build
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_CLIENT_ID=eco-watch-data-simulator
MQTT_USERNAME=
MQTT_PASSWORD=

# Simulation Configuration
SIMULATION_INTERVAL_MS=5000
SENSORS_COUNT=5
```

## Utilisation

```bash
# Démarrer en mode développement
pnpm dev

# Démarrer en mode production (après build)
pnpm start

# Démarrer en mode watch (redémarrage automatique)
pnpm watch
```

## Structure des données

Les données publiées suivent le format JSON suivant :

```json
{
  "sensorId": "sensor-1",
  "readings": [
    {
      "id": "sensor-1-temperature",
      "type": "temperature",
      "value": 22.5,
      "unit": "°C",
      "timestamp": "2023-10-25T15:30:00Z",
      "location": {
        "lat": 48.85,
        "lng": 2.35,
        "name": "Location sensor-1"
      },
      "batteryLevel": 78,
      "metadata": {
        "accuracy": 95,
        "readingInterval": 5000
      }
    },
    // ... autres lectures
  ],
  "deviceInfo": {
    "id": "device-sensor-1",
    "model": "EcoWatchSensor-v1",
    "firmware": "1.0.0"
  }
}
```

## Integration dans le projet

Ce microservice s'intègre au projet EcoWatch en publiant des données sur le broker MQTT défini dans le docker-compose.yml.
Ces données peuvent ensuite être consommées par les autres services qui s'abonnent aux topics MQTT appropriés.

## Topics MQTT

Les données sont publiées sur les topics suivants :

- `ecowatch/sensors/{sensorId}/data` - Données complètes d'un capteur 