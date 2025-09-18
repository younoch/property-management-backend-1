import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error type and message from exception response
    let errorType = 'UNKNOWN_ERROR';
    let message = exception.message;

    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).errorType) {
      errorType = (exceptionResponse as any).errorType;
    }

    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
      message = (exceptionResponse as any).message;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    // Handle specific error types for better user experience
    if (request.url.includes('/auth/whoami')) {
      switch (errorType) {
        case 'NO_TOKEN':
          message = 'Access token is required. Please sign in to continue.';
          break;
        case 'TOKEN_EXPIRED':
          message = 'Your session has expired. Please sign in again.';
          break;
        case 'TOKEN_EXPIRED_REFRESH_AVAILABLE':
          message = 'Access token expired. Attempting to refresh automatically...';
          break;
        case 'REFRESH_FAILED':
          message = 'Session expired. Please sign in again.';
          break;
        case 'INVALID_TOKEN':
          message = 'Invalid access token. Please sign in again.';
          break;
        case 'USER_NOT_FOUND':
          message = 'User account not found. Please contact support.';
          break;
        case 'ACCOUNT_DEACTIVATED':
          message = 'Your account has been deactivated. Please contact support.';
          break;
        case 'INTERNAL_ERROR':
          message = 'Unable to retrieve user information. Please try again later.';
          break;
        default:
          // Keep the original message for unknown error types
          break;
      }
    }

    const errorResponse = {
      success: false,
      message: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorType: errorType,
    };

    // Add validation errors if they exist
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
      const messages = Array.isArray((exceptionResponse as any).message)
        ? (exceptionResponse as any).message
        : [(exceptionResponse as any).message];
      
      // Only override message if it's not a custom error type
      if (errorType === 'UNKNOWN_ERROR') {
        errorResponse.message = messages.join(', ');
      }
    }

    response.status(status).json(errorResponse);
  }
} 