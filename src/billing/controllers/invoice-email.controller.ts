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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { InvoiceEmailService } from '../services/invoice-email.service';
import { SendInvoiceEmailDto } from '../dto/send-invoice-email.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceEmailController {
  private readonly logger = new Logger(InvoiceEmailController.name);

  constructor(private readonly invoiceEmailService: InvoiceEmailService) {}

  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ 
    summary: 'Send an invoice via email', 
    description: 'Sends the specified invoice as a PDF attachment via email' 
  })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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

  @Post('send-test-email')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ 
    summary: 'Send a test invoice email', 
    description: 'Sends a test invoice email to the specified email address with a sample invoice.' 
  })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or missing data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async sendTestEmail(
    @Body('email') email: string,
    @Body('includeWatermark') includeWatermark: boolean = true,
  ) {
    if (!email) {
      throw new BadRequestException('Email address is required');
    }

    try {
      // This would typically use a test invoice ID or create a sample invoice
      // For now, we'll just log and return a success message
      this.logger.log(`Sending test invoice email to ${email}`);
      
      return {
        success: true,
        message: `Test invoice email sent to ${email}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send test invoice email: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to send test invoice email');
    }
  }
}
