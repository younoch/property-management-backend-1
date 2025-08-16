import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Ensures the request body contains account_id matching the user's allowed accounts (simple owner-only check)
@Injectable()
export class AccountScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.currentUser;
    const body = req.body || {};

    // If endpoint doesn't include account_id, allow (read endpoints may filter in services)
    if (body.account_id == null) return true;

    // For now, allow if user owns the account in owned_accounts (populated elsewhere) or is admin
    const allowedAccountIds: number[] = Array.isArray(user?.owned_accounts)
      ? user.owned_accounts.map((a: any) => a.id)
      : [];

    if (user?.admin) return true;

    if (!allowedAccountIds.includes(Number(body.account_id))) {
      throw new ForbiddenException('You do not have access to this account');
    }
    return true;
  }
}


