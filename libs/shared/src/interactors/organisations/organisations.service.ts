import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../service/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class OrganisationsService {
    constructor(private readonly prismaService: PrismaService) { }

    async findMany<T extends Prisma.OrganizationFindManyArgs>(args: T) {
        return this.prismaService.organization.findMany(args);
    }

    async findOne<T extends Prisma.OrganizationFindUniqueArgs>(args: T) {
        return this.prismaService.organization.findUnique(args);
    }

    async create<T extends Prisma.OrganizationCreateArgs>(args: T) {
        return this.prismaService.organization.create(args);
    }

    async update<T extends Prisma.OrganizationUpdateArgs>(args: T) {
        return this.prismaService.organization.update(args);
    }

    async delete<T extends Prisma.OrganizationDeleteArgs>(args: T) {
        return this.prismaService.organization.delete(args);
    }

    async deleteMany<T extends Prisma.OrganizationDeleteManyArgs>(args: T) {
        return this.prismaService.organization.deleteMany(args);
    }

    async count<T extends Prisma.OrganizationCountArgs>(args: T) {
        return this.prismaService.organization.count(args);
    }

    async findFirst<T extends Prisma.OrganizationFindFirstArgs>(args: T) {
        return this.prismaService.organization.findFirst(args);
    }

    async findUnique<T extends Prisma.OrganizationFindUniqueArgs>(args: T) {
        return this.prismaService.organization.findUnique(args);
    }

}   