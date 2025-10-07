import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
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

  async create(createPaymentDto: CreatePaymentDto) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Get the lease to ensure it exists
      const lease = await this.leaseRepo.findOne({
        where: { id: createPaymentDto.lease_id },
      });

      if (!lease) {
        throw new NotFoundException(`Lease with ID ${createPaymentDto.lease_id} not found`);
      }

      // Create payment with proper type casting
      const payment = this.paymentRepo.create({
        lease_id: createPaymentDto.lease_id,
        amount: typeof createPaymentDto.amount === 'number' 
          ? createPaymentDto.amount.toString() 
          : createPaymentDto.amount,
        payment_method: createPaymentDto.payment_method || PaymentMethod.BANK_TRANSFER,
        reference: createPaymentDto.reference || null,
        notes: createPaymentDto.notes || null,
        payment_date: createPaymentDto.received_at 
          ? new Date(createPaymentDto.received_at) 
          : new Date(),
      });

      const savedPayment = await transactionalEntityManager.save(payment);

      // Apply to invoices if specified
      if (createPaymentDto.applications?.length > 0) {
        const invoiceIds = createPaymentDto.applications.map(app => app.invoice_id);
        const invoices = await this.invoiceRepo.find({
          where: { id: In(invoiceIds) },
        });

        if (invoices.length !== createPaymentDto.applications.length) {
          throw new NotFoundException('One or more invoices not found');
        }

        // Create payment applications
        const paymentApplications = createPaymentDto.applications.map(app => {
          const invoice = invoices.find(inv => inv.id === app.invoice_id);
          if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${app.invoice_id} not found`);
          }
          const paymentApp = new PaymentApplication();
          paymentApp.payment_id = savedPayment.id;
          paymentApp.invoice_id = invoice.id;
          paymentApp.amount = app.amount.toString();
          return paymentApp;
        });

        await transactionalEntityManager.save(paymentApplications);

        // Log each application
        for (const app of paymentApplications) {
          const invoice = invoices.find(inv => inv.id === app.invoice_id);
          if (createPaymentDto.user_id) {
            await this.auditLogService.log({
              entityType: 'PaymentApplication',
              entityId: app.id,
              action: AuditAction.PAYMENT,
              userId: createPaymentDto.user_id,
              newValue: {
                paymentId: savedPayment.id,
                invoiceId: invoice.id,
                amount: app.amount,
                remainingBalance: invoice.balance_due
              },
              description: `Applied $${parseFloat(app.amount).toFixed(2)} from payment #${savedPayment.id} to invoice #${invoice.invoice_number || invoice.id}`
            });
          }
        }
      }

      // Log the payment creation
      if (createPaymentDto.user_id) {
        await this.auditLogService.log({
          entityType: 'Payment',
          entityId: savedPayment.id,
          action: AuditAction.CREATE,
          userId: createPaymentDto.user_id,
          description: `Created payment #${savedPayment.id} for lease #${lease.id}`,
          newValue: {
            amount: savedPayment.amount,
            paymentMethod: savedPayment.payment_method,
            reference: savedPayment.reference,
            leaseId: savedPayment.lease_id
          }
        });
      }

      return savedPayment;
    });
  }

  async findOne(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['applications', 'applications.invoice'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepo.findOneBy({ id });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Update payment fields
    if (updatePaymentDto.amount !== undefined) {
      payment.amount = typeof updatePaymentDto.amount === 'number' 
        ? updatePaymentDto.amount.toString() 
        : updatePaymentDto.amount;
    }
    if (updatePaymentDto.payment_method !== undefined) {
      payment.payment_method = updatePaymentDto.payment_method;
    }
    if (updatePaymentDto.reference !== undefined) {
      payment.reference = updatePaymentDto.reference;
    }
    if (updatePaymentDto.notes !== undefined) {
      payment.notes = updatePaymentDto.notes;
    }
    
    const updatedPayment = await this.paymentRepo.save(payment);
    
    // Log the update if user_id is provided
    if (updatePaymentDto.user_id) {
      await this.auditLogService.log({
        entityType: 'Payment',
        entityId: id,
        action: AuditAction.UPDATE,
        userId: updatePaymentDto.user_id,
        description: `Updated payment #${id}`,
        newValue: {
          amount: updatedPayment.amount,
          paymentMethod: updatedPayment.payment_method,
          reference: updatedPayment.reference,
          notes: updatedPayment.notes
        }
      });
    }

    return updatedPayment;
  }

  async remove(id: string, userId?: string) {
    const payment = await this.paymentRepo.findOne({ 
      where: { id },
      relations: ['applications'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    // Delete associated payment applications first
    if (payment.applications?.length > 0) {
      await this.paymentAppRepo.remove(payment.applications);
    }

    await this.paymentRepo.remove(payment);

    // Log the deletion if user_id is provided
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
    return this.paymentRepo.find({
      where: { lease_id: leaseId },
      order: { created_at: 'DESC' },
      relations: ['applications'],
    });
  }

  async createForLease(leaseId: string, createPaymentDto: Omit<CreatePaymentDto, 'lease_id'>) {
    return this.create({
      ...createPaymentDto,
      lease_id: leaseId,
    });
  }

  async findAll() {
    return this.paymentRepo.find({
      relations: ['lease'],
      order: { created_at: 'DESC' }
    });
  }
}
