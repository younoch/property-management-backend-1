import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Index, PrimaryColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from './entities/invoice.entity';

@Entity()
@Index(['invoice_id'])
@Index(['payment_id'])
@Index(['id'], { unique: true })
export class PaymentApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  payment_id: number;

  @Column()
  invoice_id: number;

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
      to: (value: number) => value,
      from: (value: string) => parseFloat(value || '0')
    }
  })
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
