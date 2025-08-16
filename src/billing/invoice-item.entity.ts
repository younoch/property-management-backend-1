import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
@Index(['invoice_id'])
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column()
  invoice_id: number;

  @Column()
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 1 })
  qty: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unit_price: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


