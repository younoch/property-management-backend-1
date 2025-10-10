import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';

@Injectable()
export class PortfolioScopeGuard implements CanActivate {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.currentUser;
    const body = req.body || {};
    const params = req.params || {};
    const query = req.query || {};

    // Prefer route param over body/query when available (nested routes)
    const portfolioId = params.portfolioId ?? body.portfolio_id ?? query.portfolio_id;
    
    // If endpoint doesn't include portfolio context, allow (global endpoints may filter in services)
    if (!portfolioId) {
      return true;
    }

    // Super admin has access to all portfolios
    if (user?.role === 'super_admin') {
      return true;
    }

    if (!user?.id) {
      throw new ForbiddenException('Authentication required');
    }

    try {
      // First check if the portfolio exists
      const portfolio = await this.portfolioRepository.findOne({
        where: { id: portfolioId },
        select: ['id', 'landlord_id']
      });

      if (!portfolio) {
        throw new ForbiddenException('Portfolio not found');
      }

      // Check if the user is the owner of the portfolio
      if (portfolio.landlord_id !== user.id) {
        throw new ForbiddenException('You do not have access to this portfolio');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error verifying portfolio access');
    }
  }
}
