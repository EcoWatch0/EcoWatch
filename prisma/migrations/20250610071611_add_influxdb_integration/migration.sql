/*
  Warnings:

  - A unique constraint covering the columns `[influxBucketName]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[influxBucketId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BucketSyncStatus" AS ENUM ('PENDING', 'CREATING', 'ACTIVE', 'ERROR', 'DELETING');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "bucketCreatedAt" TIMESTAMP(3),
ADD COLUMN     "bucketRetentionDays" INTEGER DEFAULT 90,
ADD COLUMN     "bucketSyncStatus" "BucketSyncStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "influxBucketId" TEXT,
ADD COLUMN     "influxBucketName" TEXT,
ADD COLUMN     "influxOrgId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_influxBucketName_key" ON "Organization"("influxBucketName");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_influxBucketId_key" ON "Organization"("influxBucketId");

-- CreateIndex
CREATE INDEX "Organization_influxBucketName_idx" ON "Organization"("influxBucketName");

-- CreateIndex
CREATE INDEX "Organization_bucketSyncStatus_idx" ON "Organization"("bucketSyncStatus");
