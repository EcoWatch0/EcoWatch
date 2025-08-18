import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../service/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }

  async findMany<T extends Prisma.UserFindManyArgs>(args: T) {
    return this.prismaService.user.findMany(args);
  }

  async findOne<T extends Prisma.UserFindUniqueArgs>(args: T) {
    return this.prismaService.user.findUnique(args);
  }

  async create<T extends Prisma.UserCreateArgs>(args: T) {
    return this.prismaService.user.create(args);
  }

  async update<T extends Prisma.UserUpdateArgs>(args: T) {
    return this.prismaService.user.update(args);
  }

  async delete<T extends Prisma.UserDeleteArgs>(args: T) {
    return this.prismaService.user.delete(args);
  }

  async deleteMany<T extends Prisma.UserDeleteManyArgs>(args: T) {
    return this.prismaService.user.deleteMany(args);
  }

  async count<T extends Prisma.UserCountArgs>(args: T) {
    return this.prismaService.user.count(args);
  }

  async findFirst<T extends Prisma.UserFindFirstArgs>(args: T) {
    return this.prismaService.user.findFirst(args);
  }

  async findUnique<T extends Prisma.UserFindUniqueArgs>(args: T) {
    return this.prismaService.user.findUnique(args);
  }

  async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }
}