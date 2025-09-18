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
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(EmailService.name);
  private from: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const isEmailEnabled = this.configService.get('EMAIL_ENABLED', 'true') === 'true';

    if (!isEmailEnabled) {
      this.logger.warn('Email service is disabled by configuration');
      return;
    }

    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const secure = this.configService.get('SMTP_SECURE') === 'true';
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASSWORD');
    this.from = this.configService.get('DEFAULT_FROM_EMAIL') || `"Lease Director" <${user}>`;

    const auth = user && pass ? { user, pass } : undefined;

    if (!host || !port) {
      this.logger.warn('SMTP configuration is incomplete. Email service will not be available.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure,
        auth,
        tls: {
          // Do not fail on invalid certs in development
          rejectUnauthorized: this.configService.get('NODE_ENV') === 'production',
        },
      });

      this.logger.log(
        `Email transport created → host=${host}, port=${port}, secure=${secure}, auth=${auth ? 'YES' : 'NO'}`
      );

      await this.verifyTransporter(this.transporter);

      this.logger.log('Email service initialized successfully ✅');
    } catch (error) {
      this.logger.error('Failed to initialize email service', error);
      this.transporter = null;
    }
  }

  async onModuleDestroy() {
    if (this.transporter) {
      await this.transporter.close();
    }
  }

  private async verifyTransporter(transporter: nodemailer.Transporter) {
    let retries = 5;
    while (retries > 0) {
      try {
        await transporter.verify();
        this.logger.log('SMTP connection verified ✅');
        return;
      } catch (err) {
        retries--;
        this.logger.error(`SMTP verify failed, retries left: ${retries}`, err);
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
    this.logger.warn('SMTP verification skipped after max retries');
  }

  /**
   * Send a basic email
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
      attachments: sendEmailDto.attachments,
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
   * Send an email with PDF attachment
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

  /**
   * Send an email with custom attachment
   */
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
      invoiceNumber = '',
    } = options;

    const emailText =
      `Dear ${tenantName},\n\n` +
      (invoiceNumber ? `Please find attached your invoice #${invoiceNumber}.\n\n` : '') +
      (dueDate ? `Due Date: ${dueDate}\n` : '') +
      (amountDue ? `Amount Due: ${currency}${amountDue.toFixed(2)}\n\n` : '\n') +
      'Thank you for your business.\n\nBest regards,\nLease Director Team';

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
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        },
      ],
    });
  }
}
