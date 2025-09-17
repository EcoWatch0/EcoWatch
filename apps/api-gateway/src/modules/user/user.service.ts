import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserInboundCreateDto, UserInboundDto, UserInboundProperties, UserRole } from './dto/user-inbound.dto';
import { UsersService } from '@ecowatch/shared';

@Injectable()
export class UserService {
  constructor(private usersService: UsersService) { }

  async create(createUserDto: UserInboundCreateDto) {
    if (!createUserDto.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.usersService.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    return plainToInstance(UserInboundProperties, user);
  }

  async findAll() {
    const users = await this.usersService.findMany({});
    return plainToInstance(UserInboundProperties, users);
  }

  async findOne(id: string) {
    const user = await this.usersService.findOne({
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

    const updatedUser = await this.usersService.update({
      where: { id },
      data: updateUserDto,
    });

    return plainToInstance(UserInboundProperties, updatedUser);
  }

  async remove(id: string) {
    await this.findOne(id);
    const deletedUser = await this.usersService.delete({
      where: { id },
    });
    return plainToInstance(UserInboundProperties, deletedUser);
  }
}