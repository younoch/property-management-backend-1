import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Index, AfterInsert } from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { getManager } from 'typeorm';

@Entity()
@Index(['invoice_id'])
@Index(['payment_id'])
@Index(['id'], { unique: true })
export class PaymentApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payment_id: string;

  @Column()
  invoice_id: string;

  @ManyToOne(() => Payment, (p) => p.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: string) => value,
      from: (value: string) => parseFloat(value || '0')
    }
  })
  amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @AfterInsert()
  async afterInsert() {
    // Get the invoice and apply the payment
    const entityManager = getManager();
    const invoice = await entityManager.findOne(Invoice, {
      where: { id: this.invoice_id },
      relations: ['payment_applications', 'payment_applications.payment']
    });

    if (invoice) {
      // Calculate total payment amount for this invoice from all payment applications
      const totalPaid = invoice.payment_applications
        .reduce((sum, app) => sum + parseFloat(app.amount.toString() || '0'), 0);
      
      // Get the payment date from the associated payment
      const payment = await entityManager.findOne(Payment, {
        where: { id: this.payment_id }
      });
      
      const paymentDate = payment?.payment_date || new Date();
      
      // Apply the payment to update the invoice status
      await invoice.applyPayment(parseFloat(this.amount.toString() || '0'), paymentDate);
      
      // Save the updated invoice
      await entityManager.save(Invoice, invoice);
    }
  }
