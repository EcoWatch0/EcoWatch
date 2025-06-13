import { DataSimulator } from './simulator';
import { MqttPublisher } from './mqtt-client';
import { dataFakerConfig } from '@ecowatch/shared/src/config/data-faker.config';
import { OrganisationsService } from '@ecowatch/shared/src/interactors/organisations/organisations.service';
import { SensorsService } from '@ecowatch/shared/src/interactors/sensors/sensors.service';
import { PrismaService } from '@ecowatch/shared/src/service/prisma/prisma.service';
import { DatabaseService } from './database.service';

async function startSimulator() {
  console.log('EcoWatch Data Simulator Starting...');
  console.log(`Configuration: interval: ${dataFakerConfig().intervalMs}ms`);

  const organisationsService = new OrganisationsService(new PrismaService());
  const sensorsService = new SensorsService(new PrismaService());

  // Créer les instances
  const simulator = new DataSimulator(
    new DatabaseService(
      organisationsService,
      sensorsService,
    ),
  );
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

      console.log('EcoWatch Data Simulator stopped.');
      process.exit(0);
    });

    // Démarrer la simulation
    console.log(`Starting simulation cycle every ${dataFakerConfig().intervalMs}ms`);
    generateAndPublish(); // Exécuter immédiatement une première fois

    // Variable pour stocker l'identifiant de l'intervalle
    const intervalId = setInterval(generateAndPublish, dataFakerConfig().intervalMs);

    console.log('EcoWatch Data Simulator running. Press Ctrl+C to stop.');

  } catch (error) {
    console.error('Failed to start simulator:', error);
    process.exit(1);
  }
}

// Démarrer l'application
startSimulator().catch(console.error); 