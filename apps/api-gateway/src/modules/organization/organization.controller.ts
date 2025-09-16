import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../user/dto/user-inbound.dto';
import { OrganizationInboundCreateDto, OrganizationInboundDto } from './dto/organization-inbound.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createOrganizationDto: OrganizationInboundCreateDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  findAll() {
    return this.organizationService.findAll();
  }

  @Get('me')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.USER)
  findMine(@Req() req: any) {
    return this.organizationService.findMine(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findOne(id);
  }

  @Get(':id/members')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.getMembers(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: OrganizationInboundDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.remove(id);
  }
} 