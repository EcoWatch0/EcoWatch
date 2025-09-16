import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/swagger';
// Avoid importing Prisma types in DTOs to keep tests decoupled from generated client

export class OrganizationInboundProperties {
    @Expose()
    @IsString()
    @IsNotEmpty()
    id: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsString()
    @IsOptional()
    address?: string;

    @Expose()
    @IsNotEmpty()
    createdAt: Date;

    @Expose()
    @IsNotEmpty()
    updatedAt: Date;

    @Expose()
    memberships?: Array<{
        user: { id: string; email: string; firstName: string; lastName: string; role: string };
        role: string;
        joinedAt: Date;
    }>;
}

export class OrganizationInboundDto extends PartialType(OmitType(OrganizationInboundProperties, ['memberships', 'createdAt', 'updatedAt'])) {}

export class OrganizationInboundCreateDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    address?: string;
} 