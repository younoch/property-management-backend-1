import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import type { Relation } from 'typeorm';
// Import Property using type-only import to avoid circular dependency
import { Property } from '../properties/property.entity';
import { ApiHideProperty } from '@nestjs/swagger';

export type ExpenseStatus = 'paid' | 'pending' | 'overdue';

export const EXPENSE_STATUSES: ExpenseStatus[] = ['paid', 'pending', 'overdue'];

@Entity('expenses')
@Index(['property_id'])
@Index(['date_incurred'])
@Index(['category'])
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  property_id: number;

  @ManyToOne('Property', 'expenses', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  @ApiHideProperty()
  property: Promise<Property>;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  category: string;

  @Column({ type: 'date' })
  date_incurred: Date;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date_recorded: Date;

  @Column({
    type: 'enum',
    enum: EXPENSE_STATUSES,
    default: 'pending'
  })
  status: ExpenseStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  vendor?: string;

  @Column({ nullable: true })
  payment_method?: string;

  @Column({ nullable: true })
  receipt_url?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax_amount: number = 0;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax_rate: number = 0;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
