import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from './entities/invoice.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentApplication } from './payment-application.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Lease } from '../tenancy/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { AuditLogService, AuditAction } from '../common/audit-log.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService, // <- inject by type, no @Inject token needed
  ) {}

  async create(dto: CreatePaymentDto) {
    if (!dto.portfolio_id) {
      throw new Error('Portfolio ID is required');
    }
    
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const invoiceRepo = transactionalEntityManager.getRepository(Invoice);
      const paymentAppRepo = transactionalEntityManager.getRepository(PaymentApplication);
      const leaseRepo = transactionalEntityManager.getRepository(Lease);
      const paymentRepo = transactionalEntityManager.getRepository(Payment);

      // Create payment with proper type casting
      const paymentData: Partial<Payment> = {
        portfolio: { id: Number(dto.portfolio_id) } as any,
        lease: { id: Number(dto.lease_id) } as any,
        lease_id: Number(dto.lease_id),
        portfolio_id: Number(dto.portfolio_id),
        amount: parseFloat(dto.amount.toString()),
        method: dto.method || 'cash',
        reference: dto.reference || null,
        at: (dto.received_at || new Date().toISOString().slice(0, 10)) as any,
        notes: dto.notes || null
      };
      
      const payment = this.repo.create(paymentData);
      const savedPayment = await transactionalEntityManager.save(payment);
      
      // Initialize metadata for audit log
      const metadata: Record<string, any> = {
        amount: savedPayment.amount,
        method: savedPayment.method,
        reference: savedPayment.reference,
        leaseId: dto.lease_id
      };
      
      // Apply payment to invoices for the lease
      const lease = await leaseRepo.findOne({ 
        where: { id: dto.lease_id },
        relations: ['unit']
      });
      
      if (lease) {
        let remaining = parseFloat(dto.amount.toString());
        
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
              payment_id: savedPayment.id,
              invoice_id: invoice.id,
              amount: amountToApply
            });
            
            await transactionalEntityManager.save(paymentApplication);
            
            // Recalculate invoice to update all financials and status
            await invoice.recalculate(transactionalEntityManager);
            await transactionalEntityManager.save(invoice);
            
            remaining = parseFloat((remaining - amountToApply).toFixed(2));
          }
        }
        
        // Update remaining amount in payment
        savedPayment.unapplied_amount = remaining;
        await transactionalEntityManager.save(Payment, savedPayment);
      }
      
      // Log the payment creation
      if (dto.user_id) {
        if (dto.invoice_id) {
          metadata.invoiceId = dto.invoice_id;
        }
        
        await this.auditLogService.log({
          entityType: 'Payment',
          entityId: savedPayment.id,
          action: AuditAction.CREATE,
          userId: dto.user_id,
          portfolioId: dto.portfolio_id,
          metadata,
          description: `Created payment #${savedPayment.id}`
        });
      }
      
      // Reload the payment with all relations before returning
      const finalPayment = await transactionalEntityManager.findOne(Payment, {
        where: { id: savedPayment.id },
        relations: ['portfolio', 'lease', 'applications', 'applications.invoice']
      });
      
      return finalPayment || savedPayment;
    });
  }

  findAll() {
    return this.repo.find();
  }

  findByLease(leaseId: number) {
    return this.repo.find({ where: { lease_id: leaseId }, relations: ['applications'] });
  }

  async createForLease(leaseId: number, dto: CreatePaymentDto) {
    // Start a transaction to ensure data consistency
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const invoiceRepo = transactionalEntityManager.getRepository(Invoice);
      const paymentAppRepo = transactionalEntityManager.getRepository(PaymentApplication);
      const leaseRepo = transactionalEntityManager.getRepository(Lease);

      // Get the lease with unit and portfolio
      const lease = await leaseRepo.findOne({ 
        where: { id: leaseId },
        relations: ['unit']
      });
      
      if (!lease) {
        throw new NotFoundException(`Lease with ID ${leaseId} not found`);
      }
      
      // Get the primary tenant
      const leaseTenant = await transactionalEntityManager.findOne(LeaseTenant, {
        where: { 
          lease_id: leaseId,
          is_primary: true 
        },
        relations: ['tenant']
      });

      if (!leaseTenant) {
        throw new NotFoundException(`Primary tenant not found for lease ${leaseId}`);
      }
      
      // Ensure portfolio_id is properly set
      if (!lease.portfolio_id && lease.unit) {
        lease.portfolio_id = lease.unit.portfolio_id;
      }

      // Create payment with proper type casting
      const paymentData: Partial<Payment> = {
        portfolio: { id: lease.portfolio_id } as any,
        lease: { id: leaseId } as any,
        amount: parseFloat(dto.amount.toString()),
        method: dto.method || 'cash',
        reference: dto.reference || null,
        at: (dto.received_at || new Date().toISOString().slice(0, 10)) as any,
        notes: dto.notes || null
      };
      
      const payment = this.repo.create(paymentData);
      const savedPayment = await transactionalEntityManager.save(payment);
      
      // Log payment creation
      if (dto.user_id) {
        await this.auditLogService.log({
          entityType: 'Payment',
          entityId: savedPayment.id,
          action: AuditAction.CREATE,
          userId: dto.user_id,
          portfolioId: lease.portfolio_id,
          metadata: {
            amount: savedPayment.amount,
            method: savedPayment.method,
            leaseId: leaseId,
            reference: savedPayment.reference
          },
          description: `Payment of $${savedPayment.amount} received for lease #${lease.id} (unit ${lease.unit_id})`
        });
      }
      
      let remaining = parseFloat(dto.amount.toString());
      const paymentAmount = remaining; // Store the original payment amount

      // Load open/overdue invoices for this lease, ordered by due date
      const invoices = await invoiceRepo.find({
        where: { 
          lease_id: leaseId,
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
            payment_id: savedPayment.id,
            invoice_id: invoice.id,
            amount: amountToApply
          });
          
          const savedApp = await transactionalEntityManager.save(PaymentApplication, paymentApplication);
          remaining = parseFloat((remaining - amountToApply).toFixed(2));
          
          // Recalculate invoice and update status
          await invoice.recalculate(transactionalEntityManager);
          await transactionalEntityManager.save(Invoice, invoice);
          
          // Log payment application
          await this.auditLogService.log({
            entityType: 'PaymentApplication',
            entityId: savedApp.id,
            action: AuditAction.PAYMENT,
            userId: dto.user_id,
            portfolioId: lease.portfolio_id,
            metadata: {
              paymentId: savedPayment.id,
              invoiceId: invoice.id,
              amount: amountToApply,
              remainingBalance: invoice.balance_due
            },
            description: `Applied $${amountToApply.toFixed(2)} from payment #${savedPayment.id} to invoice #${invoice.invoice_number || invoice.id}`
          });
        }
      }

      // If there's any remaining amount, create a credit memo or handle as needed
      if (remaining > 0) {
        console.warn(`Payment ${savedPayment.id} has remaining unapplied amount: ${remaining}`);
        // Optionally create a credit memo here
      }

      // Reload the payment with all its relations
      const updatedPayment = await transactionalEntityManager.findOne(Payment, {
        where: { id: savedPayment.id },
        relations: ['applications']
      });
      
      if (!updatedPayment) {
        throw new Error('Failed to load updated payment');
      }

      return updatedPayment; // Return the updated payment with lease relationship
    });
  }

  async findByPortfolio(portfolioId: number) {
    return this.repo.find({ 
      where: { 
        portfolio: { id: portfolioId } 
      },
      relations: ['portfolio', 'lease']
    });
  }

  async findOne(id: number) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    // Only allow updating specific fields
    const updatableFields: (keyof CreatePaymentDto)[] = ['method', 'reference', 'notes'];
    updatableFields.forEach(field => {
      if (dto[field] !== undefined) {
        payment[field] = dto[field];
      }
    });
    
    const updatedPayment = await this.repo.save(payment);
    
    // Log the update
    await this.auditLogService.log({
      entityType: 'Payment',
      entityId: updatedPayment.id,
      action: AuditAction.UPDATE,
      userId: dto.user_id,
      portfolioId: payment.portfolio_id,
      metadata: {
        updatedFields: updatableFields.filter(field => dto[field] !== undefined),
        previousValues: updatableFields.reduce((acc, field) => {
          if (dto[field] !== undefined) {
            acc[field] = payment[field];
          }
          return acc;
        }, {})
      },
      description: `Updated payment #${updatedPayment.id}`
    });
    
    return updatedPayment;
  }

  async remove(id: number, userId?: number) {
    const payment = await this.findOne(id);
    
    // Log the deletion before removing
    if (userId && payment) {
      await this.auditLogService.log({
        entityType: 'Payment',
        entityId: payment.id,
        action: AuditAction.DELETE,
        userId,
        portfolioId: payment.portfolio_id,
        metadata: {
          amount: payment.amount,
          method: payment.method,
          leaseId: payment.lease_id,
          reference: payment.reference
        },
        description: `Deleted payment #${payment.id}`
      });
    }
    
    await this.repo.remove(payment);
    return { success: true };
  }
}


