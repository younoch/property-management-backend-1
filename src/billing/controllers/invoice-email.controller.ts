// src/billing/controllers/invoice-email.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  ParseIntPipe, 
  UseGuards, 
  Logger, 
  HttpStatus, 
  HttpException,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { InvoiceEmailService } from '../services/invoice-email.service';
import { SendInvoiceEmailDto } from '../dto/send-invoice-email.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(AuthGuard, RolesGuard)
export class InvoiceEmailController {
  private readonly logger = new Logger(InvoiceEmailController.name);

  constructor(private readonly invoiceEmailService: InvoiceEmailService) {}

  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.LANDLORD)
  @ApiOperation({ 
    summary: 'Send an invoice via email', 
    description: 'Sends the specified invoice as a PDF attachment via email' 
  })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - No valid access token provided or token expired' })
  @ApiResponse({ status: 403, description: 'Forbidden - CSRF token missing or invalid' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  @ApiParam({ name: 'id', type: 'number', description: 'Invoice ID' })
  @ApiBody({ type: SendInvoiceEmailDto })
  async sendInvoiceEmail(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() sendInvoiceEmailDto: SendInvoiceEmailDto,
  ) {
    try {
      const result = await this.invoiceEmailService.sendInvoiceEmail(
        invoiceId,
        sendInvoiceEmailDto,
      );

      if (!result.success) {
        throw new HttpException(result.error || 'Failed to send invoice email', HttpStatus.BAD_REQUEST);
      }

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Failed to send invoice email: ${error.message}`, error.stack);
      throw new BadRequestException(error.message || 'Failed to send invoice email');
    }
  }

}
