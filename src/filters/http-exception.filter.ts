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

    const errorResponse = {
      success: false,
      message: 
        typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse as any).message || exception.message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Add validation errors if they exist
    if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
      const messages = Array.isArray((exceptionResponse as any).message)
        ? (exceptionResponse as any).message
        : [(exceptionResponse as any).message];
      
      errorResponse.message = messages.join(', ');
    }

    response.status(status).json(errorResponse);
  }
} 