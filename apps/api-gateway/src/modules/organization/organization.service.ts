import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluxDBBucketService, influxdbConfig, InfluxDBService, PrismaService } from '@ecowatch/shared';
import { OrganizationInboundCreateDto, OrganizationInboundDto, OrganizationInboundProperties } from './dto/organization-inbound.dto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService, private influxDBService: InfluxDBService, private influxDBBucketService: InfluxDBBucketService) {
    console.log(influxdbConfig());
  }

  async create(createOrganizationDto: OrganizationInboundCreateDto) {
    // get organisation from config service
    console.log(influxdbConfig().org);

    const organization = await this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
      },
    });

    const bucket = await this.influxDBBucketService.createBucketForOrganization(organization.id);
    console.log(bucket);

    const updatedOrganization = await this.prisma.organization.findUnique({
      where: { id: organization.id },
    });

    console.log(updatedOrganization);

    return plainToInstance(OrganizationInboundProperties, updatedOrganization);
  }

  async findAll() {
    const organizations = await this.prisma.organization.findMany({
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
    return plainToInstance(OrganizationInboundProperties, organizations);
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return plainToInstance(OrganizationInboundProperties, organization);
  }

  async update(id: string, updateOrganizationDto: OrganizationInboundDto) {
    await this.findOne(id);
    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });

    return plainToInstance(OrganizationInboundProperties, updatedOrganization);
  }

  async remove(id: string) {
    await this.findOne(id);
    const deletedOrganization = await this.prisma.organization.delete({
      where: { id },
    });
    return plainToInstance(OrganizationInboundProperties, deletedOrganization);
  }

  async getMembers(id: string) {
    const organization = await this.findOne(id);
    return (organization.memberships ?? []).map(membership => ({
      ...membership.user,
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));
  }
} 