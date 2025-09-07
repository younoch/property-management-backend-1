import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

export interface Attachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
  cid?: string;
}

export interface SendEmailWithAttachmentDto extends Omit<SendEmailDto, 'attachments'> {
  attachments?: Attachment[];
}

@Injectable()
export class EmailService implements OnModuleInit, OnModuleDestroy {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private from: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const secure = this.configService.get('SMTP_SECURE') === 'true';
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASSWORD');
    this.from = this.configService.get('SMTP_FROM') || `"Lease Director" <${user}>`;

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure,
        auth: user && pass ? { user, pass } : undefined,
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: this.configService.get('NODE_ENV') === 'production',
        },
      });

      // Verify connection configuration
      await this.verifyConnection();
      this.logger.log('Email service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email service', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.transporter) {
      await this.transporter.close();
    }
  }

  private async verifyConnection(): Promise<boolean> {
    try {
      const success = await this.transporter.verify();
      this.logger.log('SMTP Connection verified');
      return success;
    } catch (error) {
      this.logger.error('SMTP Connection verification failed', error);
      throw error;
    }
  }

  /**
   * Send an email
   * @param sendEmailDto Email details
   * @returns Promise with the result of the email sending operation
   */
  async sendEmail(sendEmailDto: SendEmailDto): Promise<SentMessageInfo> {
    if (!this.transporter) {
      const error = new Error('Email service not initialized');
      this.logger.error(error.message);
      throw error;
    }

    const mailOptions: MailOptions = {
      from: sendEmailDto.from || this.from,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      text: sendEmailDto.text,
      html: sendEmailDto.html,
      cc: sendEmailDto.cc,
      bcc: sendEmailDto.bcc,
      replyTo: sendEmailDto.replyTo,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${sendEmailDto.to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  /**
   * Send an email with a PDF attachment
   * @param to Email recipient(s)
   * @param subject Email subject
   * @param text Email text content
   * @param html Email HTML content
   * @param pdfBuffer PDF file buffer
   * @param filename Name for the attached PDF file
   * @param options Additional email options
   * @returns Promise<SentMessageInfo>
   */
  async sendEmailWithPdf(
    to: string | string[],
    subject: string,
    text: string,
    html: string,
    pdfBuffer: Buffer,
    filename: string,
    options: {
      from?: string;
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
    } = {}
  ): Promise<SentMessageInfo> {
    const attachment: Attachment = {
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    };

    return this.sendEmail({
      to,
      subject,
      text,
      html,
      from: options.from,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: [attachment],
    });
  }
  async sendEmailWithAttachment(
    to: string | string[],
    subject: string,
    text: string,
    html: string,
    attachment: {
      filename: string;
      content: Buffer;
      contentType: string;
    },
    options: {
      from?: string;
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
      tenantName?: string;
      dueDate?: string;
      amountDue?: number;
      currency?: string;
      invoiceNumber?: string;
    } = {}
  ): Promise<SentMessageInfo> {
    const { 
      tenantName = 'Valued Customer', 
      dueDate, 
      amountDue, 
      currency = '$',
      invoiceNumber = '' 
    } = options;
    
    const emailText = `Dear ${tenantName},\n\n` +
      (invoiceNumber ? `Please find attached your invoice #${invoiceNumber}.\n\n` : '') +
      (dueDate ? `Due Date: ${dueDate}\n` : '') +
      (amountDue ? `Amount Due: ${currency}${amountDue.toFixed(2)}\n\n` : '\n') +
      'Thank you for your business.\n\n' +
      'Best regards,\n' +
      'Lease Director Team';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <p>Dear ${tenantName},</p>
        ${invoiceNumber ? `<p>Please find attached your invoice <strong>#${invoiceNumber}</strong>.</p>` : ''}
        ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate}</p>` : ''}
        ${amountDue ? `<p><strong>Amount Due:</strong> ${currency}${amountDue.toFixed(2)}</p>` : ''}
        <p>Thank you for your business.</p>
        <p>Best regards,<br>Lease Director Team</p>
      </div>`;

    return this.sendEmail({
      to,
      subject,
      text: emailText,
      html: emailHtml,
      from: options.from,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: [{
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      }],
    });
  }
}
