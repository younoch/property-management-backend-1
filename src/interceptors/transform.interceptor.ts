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
    const url = request.url;
    
    // Generate appropriate success message based on HTTP method and endpoint
    let message = 'Operation completed successfully';
    
    if (method === 'GET') {
      if (url.includes('/auth/whoami')) {
        message = 'User information retrieved successfully';
      } else if (url.includes('/properties')) {
        message = 'Properties retrieved successfully';
      } else if (url.includes('/portfolios')) {
        message = 'Accounts retrieved successfully';
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
    } else if (method === 'POST') {
      if (url.includes('/auth/signup')) {
        message = 'User registered successfully';
      } else if (url.includes('/auth/signin')) {
        message = 'User signed in successfully';
      } else if (url.includes('/auth/signout')) {
        message = 'User signed out successfully';
      } else if (url.includes('/properties')) {
        message = 'Property created successfully';
      } else if (url.includes('/portfolios')) {
        message = 'Account created successfully';
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
        message = 'Account updated successfully';
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
        message = 'Account deleted successfully';
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