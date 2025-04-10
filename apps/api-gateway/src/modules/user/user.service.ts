import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ecowatch/shared';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserInboundCreateDto, UserInboundDto, UserInboundProperties } from './dto/user-inbound.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: UserInboundCreateDto) {
    if (!createUserDto.password) {
      throw new Error('Password is required');
    }
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    return plainToInstance(UserInboundProperties, user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return plainToInstance(UserInboundProperties, users);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return plainToInstance(UserInboundProperties, user);
  }

  async update(id: string, updateUserDto: UserInboundDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return plainToInstance(UserInboundProperties, updatedUser);
  }

  async remove(id: string) {
    await this.findOne(id);
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });
    return plainToInstance(UserInboundProperties, deletedUser);
  }
} 