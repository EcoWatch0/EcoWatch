import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TestService } from './test.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('test')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post('user')
  @ApiOperation({ summary: 'Create a test user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() data: { email: string; name: string }) {
    return this.testService.createTestUser(data.email, data.name);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async getAllUsers() {
    return this.testService.getAllUsers();
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return user by id' })
  async getUserById(@Param('id') id: string) {
    return this.testService.getUserById(parseInt(id));
  }
} 