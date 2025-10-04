import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Lease } from '../leases/lease.entity';
import { PaymentApplication } from './payment-application.entity';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Entity()
@Index(['lease_id'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lease, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease;

  @Column()
  @ApiProperty({ example: 1, description: 'ID of the associated lease' })
  lease_id: string;

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

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: string) => value,
      from: (value: string) => parseFloat(value || '0')
    }
  })
  unapplied_amount: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER
  })
  @ApiProperty({ 
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
    description: 'Payment method used for this transaction'
  })
  payment_method: PaymentMethod | null;

  @Column({ type: 'timestamptz', name: 'payment_date' })
  payment_date: Date;

  @Column({ 
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  reference?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @OneToMany(() => PaymentApplication, (pa) => pa.payment)
  applications: PaymentApplication[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}