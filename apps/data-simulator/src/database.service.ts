import { SensorType } from '@prisma/client';
import { InfluxDB } from '@influxdata/influxdb-client';
import { BucketsAPI } from '@influxdata/influxdb-client-apis';
import { influxdbConfig } from '@ecowatch/shared';
import { OrganisationsService } from '@ecowatch/shared/src/interactors/organisations/organisations.service';
import { SensorsService } from '@ecowatch/shared/src/interactors/sensors/sensors.service';
import { DatabaseSensor } from './types';

export class DatabaseService {
    private bucketsAPI: BucketsAPI;

    constructor(
        private organisationsService: OrganisationsService,
        private sensorsService: SensorsService,
    ) {
        // Initialiser l'API InfluxDB pour la création de buckets
        if (!influxdbConfig().token) {
            throw new Error('INFLUXDB_TOKEN environment variable is required');
        }

        const influxDB = new InfluxDB({
            url: influxdbConfig().url,
            token: influxdbConfig().token
        });
        this.bucketsAPI = new BucketsAPI(influxDB);
    }

    /**
     * Récupère tous les capteurs actifs avec leurs informations d'organisation
     * @returns {Promise<DatabaseSensor[]>}
     */
    async getActiveSensors(): Promise<DatabaseSensor[]> {
        try {
            const sensors = await this.sensorsService.findMany({
                where: {
                    isActive: true,
                },
            });
            const organizations = await this.organisationsService.findMany({
                where: {
                    id: {
                        in: sensors.map(sensor => sensor.organizationId)
                    }
                }
            });

            return sensors
                .map(sensor => {
                    const organization = organizations.find(org => org.id === sensor.organizationId);
                    if (!organization) {
                        console.warn(`Organization not found for sensor ${sensor.id}`);
                        return null;
                    }
                    return {
                        id: sensor.id,
                        name: sensor.name,
                        type: sensor.type,
                        location: sensor.location,
                        latitude: sensor.latitude,
                        longitude: sensor.longitude,
                        isActive: sensor.isActive,
                        organizationId: sensor.organizationId,
                        organization: {
                            id: organization.id,
                            name: organization.name,
                            influxBucketName: organization.influxBucketName,
                            bucketSyncStatus: organization.bucketSyncStatus
                        }
                    } as DatabaseSensor;
                })
                .filter((sensor): sensor is DatabaseSensor => sensor !== null);
        } catch (error) {
            console.error('Error fetching sensors from database:', error);
            return [];
        }
    }

    /**
     * Crée un bucket InfluxDB pour une organisation
     * @param {string} organizationId - L'ID de l'organisation
     * @returns {Promise<{ success: boolean, bucketName?: string, bucketId?: string, error?: string }>}
     */
    private async createInfluxBucket(organizationId: string): Promise<{ success: boolean, bucketName?: string, bucketId?: string, error?: string }> {
        try {
            console.log(`Creating InfluxDB bucket for organization ${organizationId}`);

            const bucketName = `ecowatch_org_${organizationId}`;
            const influxOrgId = influxdbConfig().orgId;

            // Vérifier si le bucket existe déjà
            const existingBuckets = await this.bucketsAPI.getBuckets({ name: bucketName });
            if (existingBuckets?.buckets && existingBuckets.buckets.length > 0) {
                console.log(`Bucket ${bucketName} already exists`);
                return {
                    success: true,
                    bucketName: bucketName,
                    bucketId: existingBuckets.buckets[0].id
                };
            }

            // Créer le bucket
            const retentionPeriod = 90 * 24 * 60 * 60; // 90 jours en secondes
            const bucket = await this.bucketsAPI.postBuckets({
                body: {
                    name: bucketName,
                    orgID: influxOrgId,
                    retentionRules: [{
                        type: 'expire',
                        everySeconds: retentionPeriod
                    }],
                    description: `EcoWatch data bucket for organization ${organizationId}`
                }
            });

            if (!bucket || !bucket.id) {
                throw new Error('Failed to create bucket - no ID returned');
            }

            console.log(`Successfully created bucket ${bucketName} with ID ${bucket.id}`);

            return {
                success: true,
                bucketName: bucketName,
                bucketId: bucket.id
            };

        } catch (error) {
            console.error(`Failed to create bucket for organization ${organizationId}:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Crée des capteurs de test si aucun n'existe
     * @returns {Promise<void>}
     */
    async createTestSensors() {
        try {
            // Vérifier s'il y a des capteurs existants
            const existingSensors = await this.sensorsService.count({});
            if (existingSensors > 0) {
                console.log(`Found ${existingSensors} existing sensors, skipping creation`);
                return;
            }

            console.log('No sensors found, creating test sensors...');

            // Créer une organisation de test si elle n'existe pas
            let testOrg = await this.organisationsService.findUnique({
                where: { id: 'test-org-1' }
            });

            if (!testOrg) {
                console.log('Creating test organization...');

                // Étape 1: Créer l'organisation avec statut PENDING
                testOrg = await this.organisationsService.create({
                    data: {
                        id: 'test-org-1',
                        name: 'Test Organization',
                        bucketSyncStatus: 'PENDING',
                    }
                });

                // Étape 2: Créer le bucket InfluxDB via le service
                console.log('Creating InfluxDB bucket for test organization...');
                await this.organisationsService.update({
                    where: { id: testOrg.id },
                    data: { bucketSyncStatus: 'CREATING' }
                });

                const bucketResult = await this.createInfluxBucket(testOrg.id);

                if (bucketResult.success) {
                    // Étape 3: Mettre à jour l'organisation avec les infos du bucket
                    testOrg = await this.organisationsService.update({
                        where: { id: testOrg.id },
                        data: {
                            influxBucketName: bucketResult.bucketName,
                            influxBucketId: bucketResult.bucketId,
                            influxOrgId: influxdbConfig().orgId,
                            bucketCreatedAt: new Date(),
                            bucketSyncStatus: 'ACTIVE',
                            bucketRetentionDays: 90
                        }
                    });
                    console.log(`✅ Test organization created with active bucket: ${bucketResult.bucketName}`);
                } else {
                    // En cas d'erreur, marquer comme ERROR
                    await this.organisationsService.update({
                        where: { id: testOrg.id },
                        data: { bucketSyncStatus: 'ERROR' }
                    });
                    throw new Error(`Failed to create bucket: ${bucketResult.error}`);
                }
            } else {
                console.log('Test organization already exists');
            }

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
                await this.sensorsService.create({
                    data: sensorData
                });
            }

            console.log(`Created ${testSensors.length} test sensors`);
        } catch (error) {
            console.error('Error creating test sensors:', error);
        }
    }
} 