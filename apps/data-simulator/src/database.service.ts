import { PrismaClient, SensorType } from '@prisma/client';

export class DatabaseService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Récupère tous les capteurs actifs avec leurs informations d'organisation
     */
    async getActiveSensors() {
        try {
            const sensors = await this.prisma.sensor.findMany({
                where: {
                    isActive: true,
                },
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            influxBucketName: true,
                            bucketSyncStatus: true,
                        }
                    }
                }
            });

            return sensors;
        } catch (error) {
            console.error('Error fetching sensors from database:', error);
            return [];
        }
    }

    /**
     * Crée des capteurs de test si aucun n'existe
     */
    async createTestSensors() {
        try {
            // Vérifier s'il y a des capteurs existants
            const existingSensors = await this.prisma.sensor.count();
            if (existingSensors > 0) {
                console.log(`Found ${existingSensors} existing sensors, skipping creation`);
                return;
            }

            console.log('No sensors found, creating test sensors...');

            // Créer une organisation de test si elle n'existe pas
            const testOrg = await this.prisma.organization.upsert({
                where: { id: 'test-org-1' },
                update: {},
                create: {
                    id: 'test-org-1',
                    name: 'Test Organization',
                    bucketSyncStatus: 'ACTIVE',
                    influxBucketName: 'ecowatch_org_test-org-1',
                    influxBucketId: 'test-bucket-id',
                    influxOrgId: 'ecowatch',
                    bucketRetentionDays: 90,
                    bucketCreatedAt: new Date(),
                }
            });

            // Créer plusieurs capteurs de test
            const testSensors = [
                {
                    id: 'sensor-temp-001',
                    name: 'Temperature Sensor Campus A',
                    type: SensorType.TEMPERATURE,
                    location: 'Campus A - Building 1',
                    latitude: 48.8566,
                    longitude: 2.3522,
                    isActive: true,
                    organizationId: testOrg.id,
                },
                {
                    id: 'sensor-humid-001',
                    name: 'Humidity Sensor Campus A',
                    type: SensorType.HUMIDITY,
                    location: 'Campus A - Building 1',
                    latitude: 48.8566,
                    longitude: 2.3522,
                    isActive: true,
                    organizationId: testOrg.id,
                },
                {
                    id: 'sensor-air-001',
                    name: 'Air Quality Sensor Campus A',
                    type: SensorType.AIR_QUALITY,
                    location: 'Campus A - Building 1',
                    latitude: 48.8566,
                    longitude: 2.3522,
                    isActive: true,
                    organizationId: testOrg.id,
                },
                {
                    id: 'sensor-pressure-001',
                    name: 'Pressure Sensor Campus A',
                    type: SensorType.PRESSURE,
                    location: 'Campus A - Building 1',
                    latitude: 48.8566,
                    longitude: 2.3522,
                    isActive: true,
                    organizationId: testOrg.id,
                },
                {
                    id: 'sensor-noise-001',
                    name: 'Noise Level Sensor Campus A',
                    type: SensorType.NOISE_LEVEL,
                    location: 'Campus A - Building 1',
                    latitude: 48.8566,
                    longitude: 2.3522,
                    isActive: true,
                    organizationId: testOrg.id,
                },
            ];

            for (const sensorData of testSensors) {
                await this.prisma.sensor.create({
                    data: sensorData
                });
            }

            console.log(`Created ${testSensors.length} test sensors`);
        } catch (error) {
            console.error('Error creating test sensors:', error);
        }
    }

    /**
     * Ferme la connexion à la base de données
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
} 