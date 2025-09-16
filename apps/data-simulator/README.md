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

# Simulation Configuration (via data-faker.config et variables additionnelles)
DATA_FAKER_INTERVAL_MS=5000
DATA_FAKER_SENSORS_COUNT=5

# Paramètres additionnels du simulateur (tous optionnels, avec valeurs par défaut robustes)
# Reproductibilité (même journée simulée à seed constant)
DATA_FAKER_SEED=1337

# Zone urbaine (bbox) pour la génération des positions (Paris par défaut)
# Format: "latMin,lngMin,latMax,lngMax"
DATA_FAKER_CITY_BBOX="48.80,2.28,48.90,2.41"

# Taux d'anomalies par lecture (ex: 0.003 = 0.3%)
DATA_FAKER_ANOMALY_RATE=0.003

# Taux de panne de communication par tick/capteur (message omis)
DATA_FAKER_DROP_RATE=0.005

# Décroissance de batterie en %/heure (base, modulée par capteur)
DATA_FAKER_BATTERY_DECAY_PER_HOUR=0.2
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