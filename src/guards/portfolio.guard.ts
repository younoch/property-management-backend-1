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

    console.log('PortfolioScopeGuard - Request:', {
      method: req.method,
      path: req.path,
      params,
      body,
      query,
      user: user ? { id: user.id, email: user.email, role: user.role } : 'No user'
    });

    // Prefer route param over body/query when available (nested routes)
    const portfolioId = params.portfolioId ?? body.portfolio_id ?? query.portfolio_id;
    
    console.log('PortfolioScopeGuard - Portfolio ID from request:', portfolioId);

    // If endpoint doesn't include portfolio context, allow (global endpoints may filter in services)
    if (!portfolioId) {
      console.log('PortfolioScopeGuard - No portfolio ID in request, allowing access');
      return true;
    }

    // Super admin has access to all portfolios
    if (user?.role === 'super_admin') {
      console.log('PortfolioScopeGuard - User is super admin, allowing access');
      return true;
    }

    if (!user?.id) {
      console.error('PortfolioScopeGuard - No user ID found in request');
      throw new ForbiddenException('Authentication required');
    }

    try {
      console.log('PortfolioScopeGuard - Checking portfolio access for user:', user.id);
      
      // First check if the portfolio exists
      const portfolio = await this.portfolioRepository.findOne({
        where: { id: portfolioId },
        select: ['id', 'landlord_id']
      });

      console.log('PortfolioScopeGuard - Found portfolio:', portfolio);

      if (!portfolio) {
        console.error('Portfolio not found:', portfolioId);
        throw new ForbiddenException('Portfolio not found');
      }

      // Check if the user is the owner of the portfolio
      if (portfolio.landlord_id !== user.id) {
        console.error('Access denied. User is not the owner of the portfolio', {
          portfolioId,
          portfolioLandlordId: portfolio.landlord_id,
          userId: user.id
        });
        throw new ForbiddenException('You do not have access to this portfolio');
      }

      console.log('PortfolioScopeGuard - Access granted to portfolio:', portfolioId);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        console.error('PortfolioScopeGuard - Forbidden:', error.message);
        throw error;
      }
      console.error('PortfolioScopeGuard - Error:', error);
      throw new ForbiddenException('Error verifying portfolio access');
    }
  }
}
