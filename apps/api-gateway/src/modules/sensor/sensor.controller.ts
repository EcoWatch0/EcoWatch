import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SensorsService } from '@ecowatch/shared';
import { UserRole } from '../user/dto/user-inbound.dto';

@Controller('sensors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SensorController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.USER)
  async list(@Query('orgId') orgId?: string) {
    const sensors = await this.sensorsService.findMany({
      where: {
        isActive: true,
        ...(orgId ? { organizationId: orgId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: { influxBucketName: true }
        }
      }
    } as any);

    return sensors.map((s: any) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      organizationId: s.organizationId,
      isActive: s.isActive,
      orgBucket: s.organization?.influxBucketName
    }));
  }
}

