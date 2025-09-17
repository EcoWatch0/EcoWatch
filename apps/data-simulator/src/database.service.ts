import { SensorType } from '@prisma/client';
import { InfluxDB } from '@influxdata/influxdb-client';
import { BucketsAPI } from '@influxdata/influxdb-client-apis';
import { influxdbConfig } from '@ecowatch/shared';
import { OrganisationsService, SensorsService } from '@ecowatch/shared';
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
            // Helpers
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
            const randomInt = (min: number, max: number) => Math.floor(randomInRange(min, max + 1));
            const randomChoice = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
            const parseBBoxEnv = () => {
                const raw = process.env.DATA_FAKER_CITY_BBOX;
                if (!raw) return { latMin: 48.80, lngMin: 2.28, latMax: 48.90, lngMax: 2.41 };
                const parts = raw.split(',').map(p => Number(p.trim()));
                if (parts.length !== 4 || parts.some(p => !Number.isFinite(p))) {
                    return { latMin: 48.80, lngMin: 2.28, latMax: 48.90, lngMax: 2.41 };
                }
                const [latMin, lngMin, latMax, lngMax] = parts;
                return { latMin, lngMin, latMax, lngMax };
            };

            const bbox = parseBBoxEnv();

            const existingSensors = await this.sensorsService.count({});
            console.log(`Existing sensors in DB: ${existingSensors}`);

            // Récupérer toutes les organisations
            let orgs = await this.organisationsService.findMany({});

            // Si aucune organisation: en créer une de test (comme avant)
            if (!orgs || orgs.length === 0) {
                console.log('No organizations found, creating a test organization...');
                const created = await this.organisationsService.create({
                    data: {
                        id: 'test-org-1',
                        name: 'Test Organization',
                        bucketSyncStatus: 'PENDING',
                    }
                });
                // Créer le bucket
                await this.organisationsService.update({ where: { id: created.id }, data: { bucketSyncStatus: 'CREATING' } });
                const bucketResult = await this.createInfluxBucket(created.id);
                if (bucketResult.success) {
                    await this.organisationsService.update({
                        where: { id: created.id },
                        data: {
                            influxBucketName: bucketResult.bucketName,
                            influxBucketId: bucketResult.bucketId,
                            influxOrgId: influxdbConfig().orgId,
                            bucketCreatedAt: new Date(),
                            bucketSyncStatus: 'ACTIVE',
                            bucketRetentionDays: 90
                        }
                    });
                } else {
                    await this.organisationsService.update({ where: { id: created.id }, data: { bucketSyncStatus: 'ERROR' } });
                    throw new Error(`Failed to create bucket: ${bucketResult.error}`);
                }
                orgs = [created];
            }

            // Pour chaque organisation, si aucun capteur: créer un nombre aléatoire de capteurs
            for (const org of orgs) {
                const countForOrg = await this.sensorsService.count({ where: { organizationId: org.id } });
                if (countForOrg > 0) {
                    continue;
                }

                // S'assurer que le bucket Influx est actif
                if (org.bucketSyncStatus !== 'ACTIVE') {
                    console.log(`Creating Influx bucket for org ${org.id} (${org.name})`);
                    await this.organisationsService.update({ where: { id: org.id }, data: { bucketSyncStatus: 'CREATING' } });
                    const bucketResult = await this.createInfluxBucket(org.id);
                    if (bucketResult.success) {
                        await this.organisationsService.update({
                            where: { id: org.id },
                            data: {
                                influxBucketName: bucketResult.bucketName,
                                influxBucketId: bucketResult.bucketId,
                                influxOrgId: influxdbConfig().orgId,
                                bucketCreatedAt: new Date(),
                                bucketSyncStatus: 'ACTIVE',
                                bucketRetentionDays: 90
                            }
                        });
                    } else {
                        await this.organisationsService.update({ where: { id: org.id }, data: { bucketSyncStatus: 'ERROR' } });
                        console.warn(`Failed to create bucket for org ${org.id}: ${bucketResult.error}`);
                        continue;
                    }
                }

                const numToCreate = randomInt(3, 8);
                console.log(`Creating ${numToCreate} sensors for organization ${org.name} (${org.id})`);
                const types: SensorType[] = [
                    SensorType.TEMPERATURE,
                    SensorType.HUMIDITY,
                    SensorType.AIR_QUALITY,
                    // SensorType.PRESSURE,
                    // SensorType.NOISE_LEVEL, // Non supportés par le MVP
                ];

                for (let i = 0; i < numToCreate; i++) {
                    const type = randomChoice(types);
                    const lat = randomInRange(bbox.latMin, bbox.latMax);
                    const lng = randomInRange(bbox.lngMin, bbox.lngMax);
                    const id = `sensor-${org.id}-${type.toLowerCase()}-${String(i + 1).padStart(3, '0')}`;
                    const name = `${type.replace('_', ' ').toLowerCase()} sensor ${i + 1} - ${org.name}`;
                    const location = `EcoWatch Zone org ${org.name}`;

                    await this.sensorsService.create({
                        data: {
                            id,
                            name,
                            type,
                            location,
                            latitude: lat,
                            longitude: lng,
                            isActive: true,
                            organizationId: org.id,
                        }
                    });
                }
            }

            console.log('Sensor seeding completed');
        } catch (error) {
            console.error('Error creating test sensors:', error);
        }
    }
} 