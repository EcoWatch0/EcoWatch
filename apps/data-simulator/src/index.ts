import { DataSimulator } from './simulator';
import { MqttPublisher } from './mqtt-client';
import { config } from './config';

async function startSimulator() {
  console.log('EcoWatch Data Simulator Starting...');
  console.log(`Configuration: interval: ${config.simulation.intervalMs}ms`);

  // Créer les instances
  const simulator = new DataSimulator();
  const publisher = new MqttPublisher();

  try {
    // Initialiser le simulateur avec les capteurs de la base de données
    await simulator.initialize();

    // Afficher les informations des capteurs
    const sensorsInfo = simulator.getSensorsInfo();
    console.log('\nActive sensors:');
    sensorsInfo.forEach(sensor => {
      console.log(`  - ${sensor.name} (${sensor.type}) - Org: ${sensor.organization} - Status: ${sensor.bucketStatus}`);
    });

    if (sensorsInfo.length === 0) {
      console.error('No active sensors found. Exiting...');
      process.exit(1);
    }

    // Fonction pour générer et publier des données
    const generateAndPublish = () => {
      try {
        console.log('\n--- Generating new sensor data ---');
        const allSensorsData = simulator.generateAllSensorsData();

        if (allSensorsData.length > 0) {
          publisher.publishAllSensorsData(allSensorsData);
          console.log(`Published data for ${allSensorsData.length} sensors`);
        } else {
          console.log('No data generated (no active sensors with ready buckets)');
        }
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

      // Nettoyer les ressources du simulateur
      await simulator.cleanup();

      console.log('EcoWatch Data Simulator stopped.');
      process.exit(0);
    });

    // Démarrer la simulation
    console.log(`Starting simulation cycle every ${config.simulation.intervalMs}ms`);
    generateAndPublish(); // Exécuter immédiatement une première fois

    // Variable pour stocker l'identifiant de l'intervalle
    const intervalId = setInterval(generateAndPublish, config.simulation.intervalMs);

    console.log('EcoWatch Data Simulator running. Press Ctrl+C to stop.');

  } catch (error) {
    console.error('Failed to start simulator:', error);
    await simulator.cleanup();
    process.exit(1);
  }
}

// Démarrer l'application
startSimulator().catch(console.error); 