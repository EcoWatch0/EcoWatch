export interface InfluxBucket {
    id: string;
    name: string;
    orgID: string;
    retentionPeriod: number; // en secondes
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBucketRequest {
    name: string;
    orgID: string;
    retentionPeriod?: number; // défaut: 90 jours
    description?: string;
}

export interface BucketSyncResult {
    success: boolean;
    bucketId?: string;
    bucketName?: string;
    error?: string;
}

export interface OrganizationBucketInfo {
    organizationId: string;
    influxBucketName: string;
    influxBucketId: string;
    influxOrgId: string;
    retentionDays: number;
    syncStatus: 'PENDING' | 'CREATING' | 'ACTIVE' | 'ERROR' | 'DELETING';
} 