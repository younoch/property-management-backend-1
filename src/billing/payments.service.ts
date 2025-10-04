import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { AuditAction } from '../common/enums/audit-action.enum';
import { Invoice } from './entities/invoice.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentApplication } from './payment-application.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Lease } from '../leases/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { AuditLogService } from '../common/audit-log.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService, // <- inject by type, no @Inject token needed
  ) {}

  async create(dto: CreatePaymentDto) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const invoiceRepo = transactionalEntityManager.getRepository(Invoice);
      const paymentAppRepo = transactionalEntityManager.getRepository(PaymentApplication);
      const leaseRepo = transactionalEntityManager.getRepository(Lease);

      // Get the lease to ensure it exists
      const lease = await leaseRepo.findOne({
        where: { id: dto.lease_id },
        relations: ['unit']
      });

      if (!lease) {
        throw new NotFoundException(`Lease with ID ${dto.lease_id} not found`);
      }

      // Create payment with proper type casting
      const payment = this.repo.create({
        lease_id: dto.lease_id,
        amount: typeof dto.amount === 'number' ? dto.amount.toString() : dto.amount,
        payment_method: dto.payment_method || PaymentMethod.BANK_TRANSFER,
        reference: dto.reference || null,
        notes: dto.notes || null,
        payment_date: dto.received_at ? new Date(dto.received_at) : new Date()
      });

      const savedPayment = await transactionalEntityManager.save(payment);

      // Initialize metadata for audit log
      // Type assertion to access properties safely
      const savedPaymentData = Array.isArray(savedPayment) ? savedPayment[0] : savedPayment;
      
      const metadata = {
        amount: savedPaymentData.amount,
        payment_method: savedPaymentData.payment_method,
        reference: savedPaymentData.reference,
        leaseId: savedPaymentData.lease_id
      };

      // Process payment applications if any
      if (dto.amount > 0) {
        const paymentAmount = typeof dto.amount === 'string' ? parseFloat(dto.amount) : dto.amount;
        let remaining = paymentAmount;
        
        // Load open/overdue invoices for this lease, ordered by due date
        const invoices = await invoiceRepo.find({
          where: { 
            lease_id: dto.lease_id,
            status: In(['open', 'overdue', 'partially_paid'])
          },
          order: { due_date: 'ASC' }
        });

        // Apply payment to invoices in chronological order
        for (const invoice of invoices) {
          if (remaining <= 0) break;
          
          const invoiceBalance = invoice.balance_due;
          const amountToApply = Math.min(remaining, invoiceBalance);
          
          if (amountToApply > 0) {
            const paymentApplication = paymentAppRepo.create({
              payment_id: savedPaymentData.id,
              invoice_id: invoice.id,
              amount: amountToApply.toFixed(2)
            });
            
            await transactionalEntityManager.save(paymentApplication);
            remaining = parseFloat((remaining - amountToApply).toFixed(2));
            
            // Recalculate invoice to update all financials and status
            await invoice.recalculate(transactionalEntityManager);
            await transactionalEntityManager.save(invoice);
            
            // Log payment application
            if (dto.user_id) {
              await this.auditLogService.log({
                entityType: 'PaymentApplication',
                entityId: paymentApplication.id,
                action: AuditAction.PAYMENT,
                userId: dto.user_id ? parseInt(dto.user_id.toString(), 10) : undefined,
                newValue: {
                  paymentId: savedPaymentData.id,
                  invoiceId: invoice.id,
                  amount: amountToApply,
                  remainingBalance: invoice.balance_due
                },
                description: `Applied $${amountToApply.toFixed(2)} from payment #${savedPaymentData.id} to invoice #${invoice.invoice_number || invoice.id}`
              });
            }
          }
        }
        
        // Update remaining amount in payment if any
        if (remaining > 0) {
          // Note: If unapplied_amount is needed, it should be added to the Payment entity
          // For now, we'll just log it
          console.log(`Unapplied amount: ${remaining.toFixed(2)}`);
          // await transactionalEntityManager.save(Payment, savedPayment);
        }
      }
      
      // Log the payment creation
      if (dto.user_id) {
        await this.auditLogService.log({
          entityType: 'Payment',
          entityId: savedPaymentData.id,
          action: AuditAction.CREATE,
          userId: dto.user_id ? parseInt(dto.user_id.toString(), 10) : undefined,
          description: `Created payment #${savedPaymentData.id} for lease #${lease.id} (unit ${lease.unit_id})`,
          newValue: {
            amount: savedPaymentData.amount,
            payment_method: savedPaymentData.payment_method,
            reference: savedPaymentData.reference,
            leaseId: savedPaymentData.lease_id
          }
        });
      }

      return savedPayment;
    });
  }

  async findOne(id: string) {
    const payment = await this.repo.findOne({
      where: { id },
      relations: ['lease', 'applications', 'applications.invoice']
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    
    // Update payment fields
    if (dto.amount !== undefined) {
      payment.amount = typeof dto.amount === 'number' ? dto.amount.toString() : dto.amount;
    }
    if (dto.payment_method !== undefined) {
      payment.payment_method = dto.payment_method;
    }
    if (dto.reference !== undefined) {
      payment.reference = dto.reference;
    }
    if (dto.notes !== undefined) {
      payment.notes = dto.notes;
    }
    
    const updatedPayment = await this.repo.save(payment);
    
    // Log the update if user_id is provided
    if (dto.user_id) {
      await this.auditLogService.log({
        entityType: 'Payment',
        entityId: id,
        action: AuditAction.UPDATE,
        userId: dto.user_id ? parseInt(dto.user_id.toString(), 10) : undefined,
        description: `Updated payment #${id}`,
        newValue: {
          amount: updatedPayment.amount,
          payment_method: updatedPayment.payment_method,
          reference: updatedPayment.reference,
          notes: updatedPayment.notes
        }
      });
    }

    return updatedPayment;
  }

  async remove(id: string) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    await this.repo.remove(payment);
    return { success: true };
  }

  async findByLease(leaseId: string) {
    return this.repo.find({
      where: { lease_id: leaseId },
      order: { created_at: 'DESC' }
    });
  }

  async createForLease(leaseId: string, dto: CreatePaymentDto) {
    return this.create({
      ...dto,
      lease_id: leaseId
    });
  }

  async findAll() {
    return this.repo.find({
      relations: ['lease'],
      order: { created_at: 'DESC' }
    });
  }
}
