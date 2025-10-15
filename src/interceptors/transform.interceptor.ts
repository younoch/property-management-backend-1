import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
  const method = request.method;
  // use path without query string for more robust matching
  const url = request.url;
  const path = url.split('?')[0];
    
    // Generate appropriate success message based on HTTP method and endpoint
    let message = 'Operation completed successfully';
    
    if (method === 'GET') {
      if (url.includes('/auth/whoami')) {
        message = 'User information retrieved successfully';
      } else if (url.includes('/properties')) {
        message = 'Properties retrieved successfully';
      } else if (url.includes('/portfolios')) {
        message = 'Portfolios retrieved successfully';
      } else if (url.includes('/users')) {
        message = 'Users retrieved successfully';
      } else if (url.includes('/reports')) {
        message = 'Reports retrieved successfully';
      } else if (url.includes('/notifications')) {
        message = 'Notifications retrieved successfully';
      } else if (url.includes('/health')) {
        message = 'Health check completed successfully';
      } else if (url.includes('/metrics')) {
        message = 'Metrics retrieved successfully';
      } else {
        message = 'Data retrieved successfully';
      }
    }
    if (method === 'POST') {
      // Lease-specific POST endpoints (check the path first with stricter rules)
      if (/\/portfolios\/\d+\/leases\/\d+\/end/.test(path) || (path.includes('/leases') && path.includes('/end'))) {
        message = 'Lease ended successfully';
      } else if (path.includes('/leases') && path.includes('/tenants')) {
        message = 'Tenants attached successfully';
      } else if (path.includes('/leases') && path.includes('/activate')) {
        message = 'Lease activated successfully';
      } else if (/\/portfolios\/\d+\/units\/\d+\/leases/.test(path) || (path.includes('/portfolios') && path.includes('/units') && path.includes('/leases'))) {
        message = 'Lease created successfully';
      } else if (path.includes('/auth/signup')) {
        message = 'User registered successfully';
      } else if (url.includes('/auth/signin')) {
        message = 'User signed in successfully';
      } else if (url.includes('/auth/signout')) {
        message = 'User signed out successfully';
      } else if (path.includes('/feedback')) {
        message = 'Thank you for your feedback! We appreciate you taking the time to share your thoughts with us.';
      } else if (url.includes('/properties')) {
        message = 'Property created successfully';
      } else if (url.includes('/portfolios') && url.includes('/payments')) {
        message = 'Payment created successfully';
      } else if (url.includes('/portfolios') && !url.includes('/units') && !url.includes('/leases') && !url.includes('/end')) {
        // only treat as portfolio-creation when the route is not acting on nested resources
        message = 'Portfolio created successfully';
      } else if (url.includes('/users')) {
        message = 'User created successfully';
      } else if (url.includes('/reports')) {
        message = 'Report created successfully';
      } else if (url.includes('/notifications')) {
        message = 'Notification created successfully';
      } else {
        message = 'Resource created successfully';
      }
    } else if (method === 'PATCH') {
      if (url.includes('/properties')) {
        message = 'Property updated successfully';
      } else if (url.includes('/portfolios')) {
        message = 'Portfolio updated successfully';
      } else if (url.includes('/users')) {
        message = 'User updated successfully';
      } else if (url.includes('/reports')) {
        message = 'Report updated successfully';
      } else if (url.includes('/notifications')) {
        message = 'Notification updated successfully';
      } else {
        message = 'Resource updated successfully';
      }
    } else if (method === 'DELETE') {
      if (url.includes('/properties')) {
        message = 'Property deleted successfully';
      } else if (url.includes('/portfolios')) {
        message = 'Portfolio deleted successfully';
      } else if (url.includes('/users')) {
        message = 'User deleted successfully';
      } else if (url.includes('/reports')) {
        message = 'Report deleted successfully';
      } else if (url.includes('/notifications')) {
        message = 'Notification deleted successfully';
      } else {
        message = 'Resource deleted successfully';
      }
    }
    
    return next.handle().pipe(
      map(data => ({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      }))
    );
  }
} 