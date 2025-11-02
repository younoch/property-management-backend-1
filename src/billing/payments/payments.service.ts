import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { Invoice } from '../invoices/entities/invoice.entity';
import { UpdatePaymentDto } from '../invoices/dto/update-payment.dto';
import { PaymentApplication } from './entities/payment-application.entity';
import { CreatePaymentDto } from '../invoices/dto/create-payment.dto';
import { Lease } from '../../leases/lease.entity';
import { LeaseTenant } from '../../tenancy/lease-tenant.entity';
import { AuditLogService } from '../../common/audit-log.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepo: Repository<Payment>,
    @Inject('INVOICE_REPOSITORY')
    private readonly invoiceRepo: Repository<Invoice>,
    @Inject('PAYMENT_APPLICATION_REPOSITORY')
    private readonly paymentAppRepo: Repository<PaymentApplication>,
    @Inject('LEASE_REPOSITORY')
    private readonly leaseRepo: Repository<Lease>,
    @Inject('LEASE_TENANT_REPOSITORY')
    private readonly leaseTenantRepo: Repository<LeaseTenant>,
    private readonly auditLogService: AuditLogService,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  private parseAmount(value: any): number {
    const num = parseFloat(value);
    if (isNaN(num)) throw new Error(`Invalid amount: ${value}`);
    return num;
  }

  private async validateInvoices(invoiceIds: string[], repo: Repository<Invoice>) {
    const invoices = await repo.find({ where: { id: In(invoiceIds) } });
    if (invoices.length !== invoiceIds.length) {
      const found = invoices.map(i => i.id);
      const missing = invoiceIds.filter(id => !found.includes(id));
      throw new NotFoundException(`Missing invoice(s): ${missing.join(', ')}`);
    }
    return invoices;
  }

  private async applyPaymentToInvoice(transactionalManager, invoice: Invoice, paymentApp: PaymentApplication) {
    const totalAmount = this.parseAmount(invoice.total_amount);
    const currentPaid = this.parseAmount(invoice.amount_paid || 0);
    const applied = this.parseAmount(paymentApp.amount);

    const newPaid = currentPaid + applied;
    const newBalance = Math.max(0, totalAmount - newPaid);

    const newStatus =
      newBalance <= 0.01
        ? 'paid'
        : newPaid > 0
        ? 'partially_paid'
        : invoice.status;

    await transactionalManager.update(Invoice, invoice.id, {
      amount_paid: newPaid,
      balance_due: newBalance,
      status: newStatus,
      paid_at: newStatus === 'paid' ? new Date() : invoice.paid_at,
      updated_at: new Date(),
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const amount = this.parseAmount(createPaymentDto.amount);
      const applications = (createPaymentDto.applications || []).map(app => ({
        ...app,
        amount: this.parseAmount(app.amount),
      }));

      const totalApplied = applications.reduce((sum, a) => sum + a.amount, 0);
      if (totalApplied > amount) {
        throw new Error('Applied amount exceeds total payment amount');
      }

      const invoiceIds = [
        createPaymentDto.invoice_id,
        ...applications.map(app => app.invoice_id),
      ].filter(Boolean) as string[];

      const invoices = await this.validateInvoices(invoiceIds, this.invoiceRepo);

      const payment = manager.create(Payment, {
        invoice_id: createPaymentDto.invoice_id || null,
        amount,
        unapplied_amount: createPaymentDto.unapplied_amount !== undefined 
          ? this.parseAmount(createPaymentDto.unapplied_amount) 
          : amount,
        payment_method: createPaymentDto.payment_method || PaymentMethod.BANK_TRANSFER,
        payment_date: createPaymentDto.payment_date 
          ? new Date(createPaymentDto.payment_date) 
          : new Date(),
        status: createPaymentDto.status || PaymentStatus.PENDING,
        reference: createPaymentDto.reference || null,
        notes: createPaymentDto.notes || null,
      });

      const savedPayment = await manager.save(payment);
      const appsToProcess = applications.length === 0 && createPaymentDto.invoice_id
        ? [{ invoice_id: createPaymentDto.invoice_id, amount }]
        : applications;

      let totalAppliedAmt = 0;

      for (const app of appsToProcess) {
        const invoice = invoices.find(i => i.id === app.invoice_id);
        if (!invoice) continue;

        const paymentApp = await manager.save(PaymentApplication, {
          payment: savedPayment,
          invoice,
          amount: this.parseAmount(app.amount),
        });

        try {
          await this.applyPaymentToInvoice(manager, invoice, paymentApp);
          totalAppliedAmt += paymentApp.amount;
        } catch (error) {
          throw error;
        }
      }

      savedPayment.unapplied_amount = Math.max(0, amount - totalAppliedAmt);
      await manager.save(savedPayment);

      if (createPaymentDto.user_id) {
        await this.auditLogService.log({
          entityType: 'Payment',
          entityId: savedPayment.id,
          action: AuditAction.CREATE,
          userId: createPaymentDto.user_id,
          newValue: {
            paymentId: savedPayment.id,
            amount: savedPayment.amount,
            unappliedAmount: savedPayment.unapplied_amount,
            status: savedPayment.status,
          },
          description: `Created payment #${savedPayment.id}`,
        });
      }

      await queryRunner.commitTransaction();

      return this.paymentRepo.findOne({
        where: { id: savedPayment.id },
        relations: ['applications'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['applications'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const payment = await this.paymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);

    const updates: Partial<Payment> = {};
    if (dto.amount !== undefined) updates.amount = this.parseAmount(dto.amount);
    if (dto.payment_method !== undefined) updates.payment_method = dto.payment_method;
    if (dto.reference !== undefined) updates.reference = dto.reference;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.invoice_id !== undefined && dto.invoice_id !== null) {
      updates.invoice_id = dto.invoice_id;
    }

    Object.assign(payment, updates);
    const updated = await this.paymentRepo.save(payment);

    if (dto.user_id) {
      await this.auditLogService.log({
        entityType: 'Payment',
        entityId: id,
        action: AuditAction.UPDATE,
        userId: dto.user_id,
        description: `Updated payment #${id}`,
        newValue: updated,
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['applications'],
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);

    if (payment.applications?.length) {
      await this.paymentAppRepo.remove(payment.applications);
    }
    await this.paymentRepo.remove(payment);

    if (userId) {
      await this.auditLogService.log({
        entityType: 'Payment',
        entityId: id,
        action: AuditAction.DELETE,
        userId,
        description: `Deleted payment #${id}`,
      });
    }

    return { success: true };
  }

  async findByLease(leaseId: string) {
    const invoices = await this.invoiceRepo.find({
      where: { lease_id: leaseId },
      select: ['id'],
    });

    if (!invoices.length) return [];

    return this.paymentRepo.find({
      where: { invoice_id: In(invoices.map(i => i.id)) },
      order: { created_at: 'DESC' },
      relations: ['applications', 'invoice'],
    });
  }

  async createForLease(leaseId: string, dto: Omit<CreatePaymentDto, 'invoice_id'>) {
    const invoice = await this.invoiceRepo.findOne({
      where: { lease_id: leaseId },
      order: { created_at: 'ASC' },
      select: ['id'],
    });
    if (!invoice) throw new NotFoundException(`No invoices for lease ${leaseId}`);

    return this.create({ ...dto, invoice_id: invoice.id });
  }

  async findAll() {
    return this.paymentRepo.find({
      relations: ['lease'],
      order: { created_at: 'DESC' },
    });
  }
}
