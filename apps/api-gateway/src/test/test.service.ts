import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ecowatch/shared';

@Injectable()
export class TestService {
  constructor(private prisma: PrismaService) {}

  async createTestUser(email: string, name: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
} 