import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../service/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class SensorsService {
    constructor(private readonly prismaService: PrismaService) { }

    async findMany<T extends Prisma.SensorFindManyArgs>(args: T) {
        return this.prismaService.sensor.findMany(args);
    }

    async findOne<T extends Prisma.SensorFindUniqueArgs>(args: T) {
        return this.prismaService.sensor.findUnique(args);
    }

    async create<T extends Prisma.SensorCreateArgs>(args: T) {
        return this.prismaService.sensor.create(args);
    }

    async update<T extends Prisma.SensorUpdateArgs>(args: T) {
        return this.prismaService.sensor.update(args);
    }

    async delete<T extends Prisma.SensorDeleteArgs>(args: T) {
        return this.prismaService.sensor.delete(args);
    }

    async deleteMany<T extends Prisma.SensorDeleteManyArgs>(args: T) {
        return this.prismaService.sensor.deleteMany(args);
    }

    async count<T extends Prisma.SensorCountArgs>(args: T) {
        return this.prismaService.sensor.count(args);
    }

    async findFirst<T extends Prisma.SensorFindFirstArgs>(args: T) {
        return this.prismaService.sensor.findFirst(args);
    }

    async findUnique<T extends Prisma.SensorFindUniqueArgs>(args: T) {
        return this.prismaService.sensor.findUnique(args);
    }
}