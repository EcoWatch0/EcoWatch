import { Inject, Injectable, Logger } from '@nestjs/common';
import { BucketsAPI, OrgsAPI, Bucket } from '@influxdata/influxdb-client-apis';
import { InfluxDB } from '@influxdata/influxdb-client';
import { PrismaService } from '../prisma/prisma.service';
import {
    BucketSyncResult,
    OrganizationBucketInfo
} from './interface/influxdb-bucket.interface';
import { influxdbConfig } from './config/influxdb.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class InfluxDBBucketService {
    private readonly logger = new Logger(InfluxDBBucketService.name);
    private bucketsAPI: BucketsAPI;
    private orgsAPI: OrgsAPI;

    constructor(
        private readonly prisma: PrismaService
    ) {
        const influxDB = new InfluxDB({ url: influxdbConfig().url, token: influxdbConfig().token });
        this.bucketsAPI = new BucketsAPI(influxDB);
        this.orgsAPI = new OrgsAPI(influxDB);
    }

    /**
     * Génère un nom de bucket unique pour une organisation
     */
    generateBucketName(organizationId: string): string {
        return `ecowatch_org_${organizationId}`;
    }

    /**
     * Crée un bucket InfluxDB pour une organisation
     */
    async createBucketForOrganization(organizationId: string): Promise<BucketSyncResult> {
        try {
            this.logger.log(`Creating InfluxDB bucket for organization ${organizationId}`);

            // Mettre à jour le statut à CREATING
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: { bucketSyncStatus: 'CREATING' }
            });

            // Générer le nom du bucket
            const bucketName = this.generateBucketName(organizationId);

            // Vérifier si le bucket existe déjà
            const existingBucket = await this.getBucketByName(bucketName);
            if (existingBucket) {
                this.logger.warn(`Bucket ${bucketName} already exists`);
                return {
                    success: true,
                    bucketId: existingBucket.id,
                    bucketName: existingBucket.name
                };
            }

            // Créer le bucket
            const retentionPeriod = 90 * 24 * 60 * 60; // 90 jours en secondes
            const bucket = await this.bucketsAPI.postBuckets({
                body: {
                    name: bucketName,
                    orgID: influxdbConfig().orgId,
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

            // Mettre à jour Prisma avec les informations du bucket
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: {
                    influxBucketName: bucketName,
                    influxBucketId: bucket.id,
                    influxOrgId: influxdbConfig().orgId,
                    bucketCreatedAt: new Date(),
                    bucketSyncStatus: 'ACTIVE',
                    bucketRetentionDays: 90
                }
            });

            this.logger.log(`Successfully created bucket ${bucketName} with ID ${bucket.id}`);

            return {
                success: true,
                bucketId: bucket.id,
                bucketName: bucketName
            };

        } catch (error) {
            this.logger.error(`Failed to create bucket for organization ${organizationId}:`, error);

            // Mettre à jour le statut à ERROR
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: { bucketSyncStatus: 'ERROR' }
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Supprime un bucket InfluxDB pour une organisation
     */
    async deleteBucketForOrganization(organizationId: string): Promise<BucketSyncResult> {
        try {
            this.logger.log(`Deleting InfluxDB bucket for organization ${organizationId}`);

            const organization = await this.prisma.organization.findUnique({
                where: { id: organizationId },
                select: { influxBucketId: true, influxBucketName: true }
            });

            if (!organization?.influxBucketId) {
                this.logger.warn(`No bucket found for organization ${organizationId}`);
                return { success: true };
            }

            // Mettre à jour le statut à DELETING
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: { bucketSyncStatus: 'DELETING' }
            });

            // Supprimer le bucket d'InfluxDB
            await this.bucketsAPI.deleteBucketsID({
                bucketID: organization.influxBucketId
            });

            // Nettoyer les champs Prisma
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: {
                    influxBucketName: null,
                    influxBucketId: null,
                    influxOrgId: null,
                    bucketCreatedAt: null,
                    bucketSyncStatus: 'PENDING',
                    bucketRetentionDays: null
                }
            });

            this.logger.log(`Successfully deleted bucket for organization ${organizationId}`);

            return { success: true };

        } catch (error) {
            this.logger.error(`Failed to delete bucket for organization ${organizationId}:`, error);

            // Remettre le statut à ERROR
            await this.prisma.organization.update({
                where: { id: organizationId },
                data: { bucketSyncStatus: 'ERROR' }
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Récupère un bucket par son nom
     */
    async getBucketByName(bucketName: string): Promise<Bucket | null> {
        try {
            const buckets = await this.bucketsAPI.getBuckets({ name: bucketName });
            return buckets?.buckets?.[0] || null;
        } catch (error) {
            this.logger.error(`Failed to get bucket ${bucketName}:`, error);
            return null;
        }
    }

    /**
     * Valide qu'un bucket existe dans InfluxDB
     */
    async validateBucketExists(bucketName: string): Promise<boolean> {
        const bucket = await this.getBucketByName(bucketName);
        return bucket !== null;
    }

    /**
     * Synchronise toutes les organisations existantes
     */
    async syncAllOrganizations(): Promise<void> {
        this.logger.log('Starting synchronization of all organizations');

        const organizations = await this.prisma.organization.findMany({
            where: {
                OR: [
                    { influxBucketName: null },
                    { bucketSyncStatus: 'PENDING' }
                ]
            }
        });

        this.logger.log(`Found ${organizations.length} organizations to sync`);

        for (const org of organizations) {
            await this.createBucketForOrganization(org.id);
            // Petite pause pour éviter de surcharger InfluxDB
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.logger.log('Finished synchronization of all organizations');
    }

    /**
     * Récupère les informations de bucket pour une organisation
     */
    async getOrganizationBucketInfo(organizationId: string): Promise<OrganizationBucketInfo | null> {
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                influxBucketName: true,
                influxBucketId: true,
                influxOrgId: true,
                bucketRetentionDays: true,
                bucketSyncStatus: true
            }
        });

        if (!organization?.influxBucketName) {
            return null;
        }

        return {
            organizationId: organization.id,
            influxBucketName: organization.influxBucketName!,
            influxBucketId: organization.influxBucketId!,
            influxOrgId: organization.influxOrgId!,
            retentionDays: organization.bucketRetentionDays || 90,
            syncStatus: organization.bucketSyncStatus as any
        };
    }
} 