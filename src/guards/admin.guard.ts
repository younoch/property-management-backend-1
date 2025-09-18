import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.currentUser) {
      return false;
    }

    // Check for super_admin role instead of legacy admin boolean
    return request.currentUser.role === 'super_admin';
  }
}
