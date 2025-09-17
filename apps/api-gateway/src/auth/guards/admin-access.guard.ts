import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator';

@Injectable()
export class AdminAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAdminOnly) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as { id: string; role: 'ADMIN' | 'OPERATOR' | 'USER'; orgMemberships?: { organizationId: string; role: 'MANAGER' | 'SUPERVISOR' | 'STAFF' | 'CONSULTANT' }[] } | undefined;
    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    const activeOrgId: string | undefined = (req.query?.orgId as string | undefined) || (req.params?.orgId as string | undefined) || undefined;
    if (!activeOrgId) {
      throw new ForbiddenException('Organization context required');
    }

    const hasManagerMembership = (user.orgMemberships ?? []).some(m => m.organizationId === activeOrgId && m.role === 'MANAGER');
    if (!hasManagerMembership) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}

