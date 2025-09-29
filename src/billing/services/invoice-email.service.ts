import { Injectable, Logger, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { PdfService, InvoicePdfData } from '../../pdf/pdf.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { format } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { SendInvoiceEmailDto } from '../dto/send-invoice-email.dto';
import { Lease } from '../../leases/lease.entity';
@Injectable()
export class InvoiceEmailService {
  private readonly logger = new Logger(InvoiceEmailService.name);

  constructor(
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send an invoice via email with PDF attachment
   * @param invoiceId ID of the invoice to send
   * @param sendInvoiceEmailDto DTO containing email options
   * @returns Promise with the result of the email sending operation
   */
  async sendInvoiceEmail(
    invoiceId: number,
    sendInvoiceEmailDto: SendInvoiceEmailDto,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // Fetch the invoice with relations
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
        relations: ['lease'],
      });

      if (!invoice) {
        throw new BadRequestException(`Invoice with ID ${invoiceId} not found`);
      }

      // Fetch additional relations if needed
      const lease = invoice.lease || await this.leaseRepository.findOne({
        where: { id: invoice.lease_id },
        relations: ['tenant', 'property'],
      });

      if (!lease) {
        throw new BadRequestException('Associated lease not found for the invoice');
      }

      // Prepare invoice data for PDF generation with type assertion
      const invoiceData = {
        id: invoice.id,
        invoice_number: invoice.invoice_number || `INV-${invoice.id}`,
        issue_date: invoice.issue_date || new Date(),
        due_date: invoice.due_date || new Date(),
        status: invoice.status || 'pending',
        total_amount: invoice.total_amount || 0,
        amount_paid: invoice.amount_paid || 0,
        paid_date: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
        items: (invoice.items || []).map(item => ({
          id: item.id?.toString() || Math.random().toString(36).substr(2, 9),
          name: item.name,
          description: item.description || '',
          qty: item.qty || 1, // Using qty to match the item interface
          unit_price: item.unit_price || 0,
          amount: item.amount || 0,
          tax_rate: item.tax_rate || 0,
          tax_amount: (item.amount || 0) * ((item.tax_rate || 0) / 100),
          type: 'service' as const, // Explicitly typed as const
          period_start: item.period_start ? new Date(item.period_start).toISOString() : undefined,
          period_end: item.period_end ? new Date(item.period_end).toISOString() : undefined,
        })),
        lease: {
          id: lease.id,
          tenant_name: sendInvoiceEmailDto.recipient_name || 'Tenant',
          tenant_email: sendInvoiceEmailDto.recipient_email,
          tenant_phone: sendInvoiceEmailDto.recipient_phone,
        },
        sent_at: new Date(),
        // Store custom fields including notes and watermark preference
        custom_fields: {
          notes: invoice.notes || sendInvoiceEmailDto.notes || sendInvoiceEmailDto.message || '',
          include_watermark: sendInvoiceEmailDto.include_watermark || false,
        },
        // Calculate financial fields
        subtotal: invoice.subtotal || (invoice.items || []).reduce((sum, item) => sum + (item.amount || 0), 0),
        tax_amount: 0, // Will be calculated from items if needed
        discount_amount: 0, // Will be applied if discounts exist
      };

      // Generate the PDF
      const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceData);

      // Determine recipient email - use the one from DTO if provided, otherwise fall back to primary tenant's email
      let recipientEmail = sendInvoiceEmailDto.recipient_email;
      
      if (!recipientEmail) {
        // Load the primary tenant's email if not provided in DTO
        const leaseWithTenants = await this.leaseRepository.findOne({
          where: { id: lease.id },
          relations: ['lease_tenants', 'lease_tenants.tenant']
        });
        
        const primaryTenant = leaseWithTenants?.lease_tenants?.find(lt => lt.is_primary)?.tenant;
        recipientEmail = primaryTenant?.email || null;
      }
      
      if (!recipientEmail) {
        throw new BadRequestException('Recipient email address is required');
      }

      // Prepare email content
      const amountDue = invoice.total_amount - (invoice.amount_paid || 0);
      const subject = `Invoice #${invoiceData.invoice_number} from Your Property Management`;
      
      const text = this.getEmailText({
        invoiceNumber: invoiceData.invoice_number,
        amountDue,
        dueDate: invoiceData.due_date,
        additionalNotes: sendInvoiceEmailDto.message,
      });

      const html = this.getEmailHtml({
        invoiceNumber: invoiceData.invoice_number,
        amountDue,
        dueDate: invoiceData.due_date,
        additionalNotes: sendInvoiceEmailDto.message,
        currency: 'USD',
      });

      // Prepare email options
      const emailOptions = {
        to: recipientEmail,
        subject,
        text,
        html,
        attachments: [
          {
            filename: `Invoice-${invoiceData.invoice_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
        cc: sendInvoiceEmailDto.cc_emails,
        bcc: sendInvoiceEmailDto.bcc_emails,
        replyTo: sendInvoiceEmailDto.reply_to,
        from: this.configService.get('SMTP_FROM'),
      };

      // Send the email with PDF attachment
      await this.emailService.sendEmail(emailOptions);

      // Update the invoice to mark it as sent if it exists in the database
      if (invoice) {
        await this.markInvoiceAsSent(invoiceId);
      }

      return {
        success: true,
        message: `Invoice #${invoiceData.invoice_number} has been sent to ${recipientEmail}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send invoice email: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to send invoice email',
        error: error.message,
      };
    }
  }

  /**
   * Mark an invoice as sent in the database
   * @param invoiceId ID of the invoice to update
   * @private
   */
  private async markInvoiceAsSent(invoiceId: number): Promise<void> {
    try {
      await this.invoiceRepository.update(
        { id: invoiceId },
        {
          // Align with Invoice entity column names
          is_issued: true,
          sent_at: () => 'CURRENT_TIMESTAMP',
          // Do not set status here: valid statuses are
          // 'draft' | 'open' | 'partially_paid' | 'paid' | 'void' | 'overdue'
          // Let business logic determine status separately.
        } as any,
      );
      this.logger.log(`Invoice ${invoiceId} marked as sent`);
    } catch (error) {
      this.logger.error(`Failed to mark invoice ${invoiceId} as sent: ${error.message}`, error.stack);
      // Don't fail the whole operation if we can't update the status
    }
  }

  /**
   * Generate plain text email content
   * @private
   */
  private getEmailText({
    invoiceNumber,
    amountDue,
    dueDate,
    additionalNotes,
  }: {
    invoiceNumber: string;
    amountDue: number;
    dueDate: string | Date;
    additionalNotes?: string;
  }): string {
    const formattedDueDate = format(
      typeof dueDate === 'string' ? new Date(dueDate) : dueDate,
      'MMMM d, yyyy',
    );

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountDue);

    let text = `Invoice #${invoiceNumber} from Your Property Management\n\n`;
    text += `Amount Due: ${formattedAmount}\n`;
    text += `Due Date: ${formattedDueDate}\n\n`;
    
    if (additionalNotes) {
      text += `Notes: ${additionalNotes}\n\n`;
    }
    
    text += 'Please find your invoice attached as a PDF.\n\n';
    text += 'Thank you for your business!\n';
    
    return text;
  }

  /**
   * Generate HTML email content
   * @private
   */
  private getEmailHtml({
    invoiceNumber,
    amountDue,
    dueDate,
    additionalNotes,
    currency = 'USD',
  }: {
    invoiceNumber: string;
    amountDue: number;
    dueDate: string | Date;
    additionalNotes?: string;
    currency?: string;
  }): string {
    const formattedDueDate = format(
      typeof dueDate === 'string' ? new Date(dueDate) : dueDate,
      'MMMM d, yyyy',
    );

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amountDue);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { margin-bottom: 20px; }
          .content { margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
          .amount-due { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Invoice #${invoiceNumber}</h2>
            <p>From: Your Property Management</p>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            
            <p>Please find your invoice #${invoiceNumber} attached as a PDF.</p>
            
            <div class="amount-due">
              Amount Due: <strong>${formattedAmount}</strong><br>
              Due Date: ${formattedDueDate}
            </div>
            
            ${additionalNotes ? `<p>${additionalNotes.replace(/\n/g, '<br>')}</p>` : ''}
            
            <p>Thank you for your business!</p>
            
            <p>Best regards,<br>Your Property Management Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
