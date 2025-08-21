import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Ensures the request body contains portfolio_id matching the user's allowed portfolios (simple owner-only check)
@Injectable()
export class PortfolioScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.currentUser;
    const body = req.body || {};
    const params = req.params || {};

    // Prefer route param over body when available (nested routes)
    const portfolioId = params.portfolioId ?? body.portfolio_id;

    // If endpoint doesn't include portfolio context, allow (global endpoints may filter in services)
    if (portfolioId == null) return true;

    // For now, allow if user owns the portfolio in owned_portfolios (populated elsewhere) or is super_admin
    const allowedPortfolioIds: number[] = Array.isArray(user?.owned_portfolios)
      ? user.owned_portfolios.map((p: any) => p.id)
      : [];

    if (user?.role === 'super_admin') return true;

    if (!allowedPortfolioIds.includes(Number(portfolioId))) {
      throw new ForbiddenException('You do not have access to this portfolio');
    }
    return true;
  }
}


