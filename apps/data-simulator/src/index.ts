import { DataSimulator } from './simulator';
import { MqttPublisher } from './mqtt-client';
import { config } from './config';

console.log('EcoWatch Data Simulator Starting...');
console.log(`Configuration: ${config.simulation.sensorsCount} sensors, interval: ${config.simulation.intervalMs}ms`);

// Créer les instances
const simulator = new DataSimulator();
const publisher = new MqttPublisher();

// Fonction pour générer et publier des données
const generateAndPublish = () => {
  try {
    console.log('\n--- Generating new sensor data ---');
    const allSensorsData = simulator.generateAllSensorsData();

    publisher.publishAllSensorsData(allSensorsData);
  } catch (error) {
    console.error('Error in simulation cycle:', error);
  }
};

// Gérer l'arrêt propre de l'application
process.on('SIGINT', async () => {
  console.log('\nShutting down...');

  // Arrêter l'intervalle
  clearInterval(intervalId);

  // Fermer la connexion MQTT
  await publisher.close();

  console.log('EcoWatch Data Simulator stopped.');
  process.exit(0);
});

// Démarrer la simulation
console.log(`Starting simulation cycle every ${config.simulation.intervalMs}ms`);
generateAndPublish(); // Exécuter immédiatement une première fois

// Variable pour stocker l'identifiant de l'intervalle
const intervalId = setInterval(generateAndPublish, config.simulation.intervalMs);

console.log('EcoWatch Data Simulator running. Press Ctrl+C to stop.'); 