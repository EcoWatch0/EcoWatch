import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService, UsersService } from '@ecowatch/shared';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) { }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.getUserByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const orgMemberships = await this.prisma.organizationMembership.findMany({
      where: { userId: user.id },
      select: { organizationId: true, role: true },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgMemberships,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }
} 