import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, ParseUUIDPipe, BadRequestException, ForbiddenException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAccessGuard } from '../../auth/guards/admin-access.guard';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { PrismaService } from '@ecowatch/shared';

type OrgRole = 'STAFF' | 'MANAGER' | 'SUPERVISOR' | 'CONSULTANT';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminAccessGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  // GET /admin/users?orgId=...
  @Get('users')
  @AdminOnly()
  async listUsers(@Query('orgId') orgId: string | undefined, @Query() _q: Record<string, string>, @Req() req: any) {
    const caller = req?.user as { id: string; role: 'ADMIN' | 'OPERATOR' | 'USER' } | undefined;
    const isPlatformAdmin = caller?.role === 'ADMIN';

    if (!isPlatformAdmin) {
      if (!orgId) {
        throw new ForbiddenException('Managers must specify orgId');
      }
      // Guard already ensures caller is MANAGER of orgId
    }

    if (orgId) {
      const users = await (this.prisma as any).user.findMany({
        where: {
          memberships: { some: { organizationId: orgId } },
        },
        include: {
          memberships: {
            where: { organizationId: orgId },
          },
        },
      });
      return users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        orgRole: u.memberships[0]?.role ?? null,
      }));
    }

    // Platform admin: global list
    const users = await (this.prisma as any).user.findMany({
      include: { memberships: true },
    });
    return users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      organizations: u.memberships.map(m => ({ organizationId: m.organizationId, role: m.role })),
    }));
  }

  // GET /admin/orgs/:orgId/users
  @Get('orgs/:orgId/users')
  @AdminOnly()
  async listOrgUsers(@Param('orgId', ParseUUIDPipe) orgId: string) {
    const users = await (this.prisma as any).user.findMany({
      where: {
        memberships: { some: { organizationId: orgId } },
      },
      include: {
        memberships: { where: { organizationId: orgId } },
      },
    });
    return users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      orgRole: u.memberships[0]?.role ?? null,
    }));
  }

  // POST /admin/orgs/:orgId/users
  @Post('orgs/:orgId/users')
  @AdminOnly()
  async addUserToOrg(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() body: { email: string; orgRole: OrgRole; makePlatformAdmin?: boolean },
    @Req() req: any,
  ) {
    const caller = req?.user as { id: string; role: 'ADMIN' | 'OPERATOR' | 'USER' } | undefined;
    const isPlatformAdmin = caller?.role === 'ADMIN';

    const allowedOrgRoles: OrgRole[] = ['STAFF', 'MANAGER'];
    if (!allowedOrgRoles.includes(body.orgRole)) {
      throw new BadRequestException('Invalid orgRole');
    }

    const email = normalizeEmail(body.email);
    const org = await (this.prisma as any).organization.findUnique({ where: { id: orgId } });
    if (!org) throw new BadRequestException('Organization not found');

    const existingUser = await (this.prisma as any).user.findUnique({ where: { email } });
    let userId: string;
    if (!existingUser) {
      const created = await (this.prisma as any).user.create({
        data: {
          email,
          password: '',
          firstName: '',
          lastName: '',
          role: isPlatformAdmin && body.makePlatformAdmin ? 'ADMIN' : 'USER',
        },
      });
      userId = created.id;
    } else {
      userId = existingUser.id;
      if (isPlatformAdmin && typeof body.makePlatformAdmin === 'boolean') {
        await (this.prisma as any).user.update({ where: { id: userId }, data: { role: body.makePlatformAdmin ? 'ADMIN' : 'USER' } });
      }
    }

    await (this.prisma as any).organizationMembership.upsert({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      create: { userId, organizationId: orgId, role: body.orgRole },
      update: { role: body.orgRole },
    });

    return { success: true };
  }

  // PATCH /admin/orgs/:orgId/users/:userId
  @Patch('orgs/:orgId/users/:userId')
  @AdminOnly()
  async updateOrgUser(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('userId') userId: string,
    @Body() body: { orgRole?: OrgRole; makePlatformAdmin?: boolean },
    @Req() req: any,
  ) {
    const caller = req?.user as { id: string; role: 'ADMIN' | 'OPERATOR' | 'USER' } | undefined;
    const isPlatformAdmin = caller?.role === 'ADMIN';

    // Enforce org role updates only within allowed set
    if (body.orgRole && !['STAFF', 'MANAGER'].includes(body.orgRole)) {
      throw new BadRequestException('Invalid orgRole');
    }

    // Prevent removing last MANAGER of org
    if (body.orgRole && body.orgRole !== 'MANAGER') {
      const managersCount = await (this.prisma as any).organizationMembership.count({
        where: { organizationId: orgId, role: 'MANAGER' },
      });
      const isTargetManager = await (this.prisma as any).organizationMembership.findUnique({
        where: { userId_organizationId: { userId, organizationId: orgId } },
        select: { role: true },
      });
      if (isTargetManager?.role === 'MANAGER' && managersCount <= 1) {
        throw new BadRequestException('Cannot remove the last MANAGER from the organization');
      }
    }

    if (body.orgRole) {
      await (this.prisma as any).organizationMembership.upsert({
        where: { userId_organizationId: { userId, organizationId: orgId } },
        create: { userId, organizationId: orgId, role: body.orgRole as OrgRole },
        update: { role: body.orgRole as OrgRole },
      });
    }

    if (typeof body.makePlatformAdmin === 'boolean') {
      if (!isPlatformAdmin) {
        throw new ForbiddenException('Only platform admins can change platform admin role');
      }
      await (this.prisma as any).user.update({ where: { id: userId }, data: { role: body.makePlatformAdmin ? 'ADMIN' : 'USER' } });
    }

    return { success: true };
  }
}

