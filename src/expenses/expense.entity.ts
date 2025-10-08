import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Property } from '../properties/property.entity';
import { ExpenseCategory, EXPENSE_CATEGORIES, getExpenseCategoryLabel } from '../common/enums/expense-category.enum';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { BaseEntity } from '../common/base.entity';

export type ExpenseStatus = 'paid' | 'pending' | 'overdue';

export const EXPENSE_STATUSES: ExpenseStatus[] = ['paid', 'pending', 'overdue'];

@Entity('expenses')
@Index(['property_id'])
@Index(['date_incurred'])
@Index(['category'])
export class Expense extends BaseEntity {

  @Column()
  property_id: string;

  @ManyToOne('Property', 'expenses', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  @ApiHideProperty()
  property: Property;   

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    default: ExpenseCategory.OTHER
  })
  @ApiProperty({
    enum: ExpenseCategory,
    enumName: 'ExpenseCategory',
    example: ExpenseCategory.MAINTENANCE,
    description: 'Category of the expense'
  })
  category: ExpenseCategory;

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

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true
  })
  payment_method?: PaymentMethod;
  @Column({ nullable: true })
  receipt_url?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax_amount: number = 0;
}
