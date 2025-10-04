import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService } from '../audit-log.service';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const { method, url, body, headers } = request;
    const params = request.params || {};
    const query = request.query || {};
    const user = (request as any).user;

    // Skip for GET requests to non-entity endpoints or if it's an audit log endpoint
    if ((method === 'GET' && !url.match(/\/([^\/]+)\/\d+$/)) || url.startsWith('/audit-logs')) {
      return next.handle();
    }

    const entityType = this.getEntityType(url);
    if (!entityType) {
      return next.handle();
    }

    // Get the portfolio ID from the request or body
    const portfolioId = body?.portfolioId || query.portfolioId || (user?.portfolioId ? Number(user.portfolioId) : null);
    
    // Get the entity ID from the most likely source based on the HTTP method
    let entityId: string | number | undefined;
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      entityId = params?.id || body?.id || query?.id;
    } else if (method === 'GET') {
      // For GET requests, try to get the ID from the URL
      const match = url.match(/\/(\d+)(?:\?|$)/);
      entityId = match ? match[1] : undefined;
    }

    // If we couldn't determine the entity ID, skip logging
    if (!entityId) {
      return next.handle();
    }

    // Store the original response
    return next.handle().pipe(
      tap((response) => {
        try {
          const action = this.getActionType(method);
          
          // For create/update, we can get the new value from the response
          const newValue = ['POST', 'PATCH', 'PUT'].includes(method) 
            ? response 
            : undefined;

          this.auditLogService.log({
            entityType,
            entityId: entityId.toString(),
            action,
            userId: user?.id,
            portfolioId: portfolioId,
            metadata: {
              method,
              url,
              params,
              query,
              ipAddress: request.ip || headers['x-forwarded-for'] || 'unknown',
              userAgent: headers['user-agent'] || 'unknown',
              ...(body && Object.keys(body).length > 0 && { requestBody: body })
            },
            newValue: newValue ? JSON.stringify(newValue) : null,
          });
          
          console.log(`Audit logged: ${action} ${entityType} ${entityId}`);
        } catch (error) {
          console.error('Error in audit interceptor:', error);
        }
      }),
      // Handle any errors that occur in the interceptor
      catchError((error) => {
        console.error('Error in audit interceptor (catchError):', error);
        throw error;
      })
    );
  }

  private getEntityType(url: string): string | null {
    // Extract entity type from URL (e.g., /users/123 -> users)
    const match = url.match(/\/([^\/]+)(?:\/\d+)?\/?$/);
    if (!match) return null;
    
    // Remove plural 's' if exists and convert to singular
    const entity = match[1].toLowerCase();
    return entity.endsWith('s') ? entity.slice(0, -1) : entity;
  }

  private getActionType(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PATCH':
      case 'PUT':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.READ;
    }
  }
}
