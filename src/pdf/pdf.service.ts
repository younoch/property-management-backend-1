import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { format, parseISO } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Readable } from 'stream';
import { Invoice } from '../billing/entities/invoice.entity';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';
import * as path from 'path';

export interface InvoicePdfData {
  id: number;
  invoice_number: string;
  issue_date: string | Date;
  due_date: string | Date;
  status: string;
  total_amount: number;
  items: Array<{
    id: string;
    type: string;
    name: string;
    description?: string;
    qty: number;
    unit_price: number;
    amount: number;
    tax_rate?: number;
    tax_amount?: number;
    period_start?: string;
    period_end?: string;
  }>;
  lease: {
    id: number;
    tenant_name: string;
    tenant_email?: string;
    tenant_phone?: string;
    property_address?: string;
  };
  portfolio?: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    currency?: string;
  };
  amount_paid?: number;
  paid_date?: string | Date;
  sent_at?: string | Date;
}

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private browser: puppeteer.Browser | null = null;
  private readonly logger = new Logger(PdfService.name);
  private baseUrl: string;
  private invoiceTemplateHtml: string | null = null;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('APP_URL') || 'http://localhost:8000';
  }

  async onModuleInit() {
    try {
      // Resolve Chromium path with a strong preference for Puppeteer's bundled Chromium
      // This is important on platforms like Render where system Chrome is not available.
      const bundledPath = (puppeteer as any).executablePath?.() as string | undefined;

      // Build candidate list with the most reliable first
      const candidates = Array.from(
        new Set(
          [
            bundledPath, // prefer bundled Chromium if available
            // common system paths as fallbacks
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
          ].filter(Boolean)
        )
      ) as string[];

      let lastError: any = null;
      for (const path of candidates) {
        try {
          this.logger.log(`Initializing PDF Service with Chromium at: ${path}`);
          this.browser = await puppeteer.launch({
            headless: true,
            executablePath: path,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-gpu',
            ],
          });
          break; // success
        } catch (err) {
          lastError = err;
          this.logger.warn(`Failed to launch Chromium at ${path}: ${err?.message || err}`);
        }
      }

      // Final fallback: try without explicit executable path (Puppeteer decides)
      if (!this.browser) {
        try {
          this.logger.log('Initializing PDF Service with Puppeteer default executable');
          this.browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--single-process',
              '--disable-gpu',
            ],
          });
        } catch (err) {
          lastError = err;
          this.logger.warn(`Failed to launch Puppeteer default executable: ${err?.message || err}`);
        }
      }

      if (!this.browser && lastError) {
        throw lastError;
      }
      this.logger.log('PDF Service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize PDF Service', error as any);
      this.logger.warn(
        'PDF Service is disabled. Ensure Chromium is installed and PUPPETEER_EXECUTABLE_PATH is set.'
      );
      this.browser = null;
      // Do not throw here to allow the application to continue running without PDF support
    }
  }

  async onModuleDestroy() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      this.logger.error('Error closing browser', error);
    }
  }

  async generateInvoicePdf(invoice: InvoicePdfData): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    
    const page = await this.browser.newPage();
    
    try {
      // Generate HTML for the invoice via EJS template
      const html = this.generateInvoiceHtml(invoice);
      
      // Set the content and wait for any resources to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000, // 30 seconds timeout
      });

      // Generate PDF with proper margins and print media type
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      // Convert Uint8Array to Buffer if needed
      return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private generateInvoiceHtml(invoice: InvoicePdfData): string {
    // Ensure items is an array
    const items = Array.isArray(invoice.items) ? invoice.items : [];

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
    const total = subtotal + taxTotal;
    const amountPaid = 'amount_paid' in invoice ? invoice.amount_paid || 0 : 0;
    const amountDue = total - amountPaid;

    // Determine currency symbol (default to $)
    const currencySymbol = '$';

    // Support email fallbacks: portfolio.email -> SUPPORT_EMAIL env -> default
    const supportEmail =
      invoice.portfolio?.email || this.configService.get('SUPPORT_EMAIL') || 'support@leasedirector.com';

    const helpers = {
      formatDate: (dateInput: string | Date) => {
        try {
          const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
          return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy');
        } catch (e) {
          this.logger.error('Error formatting date in template', e as any);
          return 'N/A';
        }
      },
    };

    // Load template (cached) and render
    const template = this.loadInvoiceTemplate();
    return ejs.render(template, {
      invoice,
      totals: { subtotal, taxTotal, total, amountPaid, amountDue },
      currencySymbol,
      supportEmail,
      helpers,
    });
  }

  private loadInvoiceTemplate(): string {
    if (this.invoiceTemplateHtml) return this.invoiceTemplateHtml;

    // Try dist path first (when compiled)
    const distPath = path.join(__dirname, 'templates', 'invoice.ejs');
    // Fallback to src path for development
    const srcPath = path.join(process.cwd(), 'src', 'pdf', 'templates', 'invoice.ejs');

    let resolvedPath = distPath;
    try {
      this.invoiceTemplateHtml = readFileSync(resolvedPath, 'utf8');
      return this.invoiceTemplateHtml;
    } catch (_) {
      resolvedPath = srcPath;
    }

    try {
      this.invoiceTemplateHtml = readFileSync(resolvedPath, 'utf8');
      return this.invoiceTemplateHtml;
    } catch (err) {
      this.logger.error(`Failed to load invoice template from ${resolvedPath}`, err as any);
      throw new Error('Invoice template not found');
    }
  }
}
