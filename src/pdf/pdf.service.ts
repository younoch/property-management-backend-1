import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { format, parseISO } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Readable } from 'stream';
import { Invoice } from '../billing/entities/invoice.entity';

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
  portfolio: {
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

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
  }

  async onModuleInit() {
    try {
      // Resolve Chromium path from env or config. Default to system path in production images.
      let executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        this.configService.get<string>('PUPPETEER_EXECUTABLE_PATH');

      if (!executablePath && this.configService.get('NODE_ENV') === 'production') {
        executablePath = '/usr/bin/chromium';
      }

      const candidates = Array.from(new Set([
        executablePath,
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
      ].filter(Boolean))) as string[];

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

      // Fallback: try Puppeteer's bundled Chromium when no system executable is available
      if (!this.browser) {
        try {
          this.logger.log('Initializing PDF Service with bundled Chromium');
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
          this.logger.warn(`Failed to launch bundled Chromium: ${err?.message || err}`);
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
      // Generate HTML for the invoice
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
    // Format date
    const formatDate = (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy');
      } catch (e) {
        console.error('Error formatting date:', e);
        return 'N/A';
      }
    };

    // Ensure items is an array
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
    const total = subtotal + taxTotal;
    const amountPaid = 'amount_paid' in invoice ? invoice.amount_paid || 0 : 0;
    const amountDue = total - amountPaid;

    // Generate items HTML
    const itemsHtml = items.map(item => `
      <tr>
        <td>${item.name || ''}</td>
        <td>${item.description || ''}</td>
        <td>${item.qty || 1}</td>
        <td>$${(item.unit_price || 0).toFixed(2)}</td>
        <td>${item.tax_rate ? `${item.tax_rate}%` : '-'}</td>
        <td>$${(item.amount || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .logo { max-width: 200px; margin-bottom: 20px; }
          .invoice-info { margin-bottom: 30px; }
          .invoice-details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 30px; 
          }
          .from-to { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .from, .to { flex: 1; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
          }
          .totals { 
            float: right; 
            width: 300px; 
            margin-top: 20px;
          }
          .totals table { width: 100%; }
          .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: capitalize;
            background-color: #f0f0f0;
          }
          .status-paid { background-color: #d4edda; color: #155724; }
          .status-overdue { background-color: #f8d7da; color: #721c24; }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #777; 
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>INVOICE</h1>
              <div class="status status-${invoice.status}">${invoice.status.replace('_', ' ')}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.5em; font-weight: bold; margin-bottom: 10px;">
            ${invoice.portfolio.name || 'Lease Director'}
          </div>
          ${invoice.portfolio.address ? `<div>${invoice.portfolio.address}</div>` : ''}
          ${invoice.portfolio.phone ? `<div>${invoice.portfolio.phone}</div>` : ''}
          ${invoice.portfolio.email ? `<div>${invoice.portfolio.email}</div>` : ''}
            </div>
          </div>

          <div class="invoice-info">
            <div><strong>Invoice #:</strong> ${invoice.invoice_number}</div>
            <div><strong>Issue Date:</strong> ${formatDate(invoice.issue_date)}</div>
            ${invoice.due_date ? `<div><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</div>` : ''}
          </div>

          <div class="from-to">
            <div class="from">
              <h3>From:</h3>
              <div>${invoice.portfolio.name || 'Lease Director'}</div>
              ${invoice.portfolio.address ? `<div>${invoice.portfolio.address}</div>` : ''}
              ${invoice.portfolio.phone ? `<div>${invoice.portfolio.phone}</div>` : ''}
              ${invoice.portfolio.email ? `<div>${invoice.portfolio.email}</div>` : ''}
            </div>
            <div class="to">
              <h3>To:</h3>
              <div>${invoice.lease.tenant_name || 'Tenant'}</div>
              ${invoice.lease.property_address ? `<div>${invoice.lease.property_address}</div>` : ''}
              ${invoice.lease.tenant_email ? `<div>${invoice.lease.tenant_email}</div>` : ''}
              ${invoice.lease.tenant_phone ? `<div>${invoice.lease.tenant_phone}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td>$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Tax:</strong></td>
                <td>$${taxTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Total:</strong></td>
                <td>$${total.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Amount Paid:</strong></td>
                <td>$${amountPaid.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Amount Due:</strong></td>
                <td>$${amountDue.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="clear: both;"></div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions about this invoice, please contact us at support@leasedirector.com</p>
            <p>Invoice generated on ${format(new Date(), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
