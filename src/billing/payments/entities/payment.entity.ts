import { Entity, Column, ManyToOne, Index, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/base.entity';
import { Lease } from '../../../leases/lease.entity';
import { PaymentApplication } from './payment-application.entity';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

@Entity('payments')
@Index(['lease_id'])
export class Payment extends BaseEntity {

  @ManyToOne(() => Lease, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease;

  @Column()
  @ApiProperty({ example: 1, description: 'ID of the associated lease' })
  lease_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  unapplied_amount: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  @ApiProperty({ 
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
    description: 'Payment method used for this transaction'
  })
  payment_method: PaymentMethod | null;

  @Column({ type: 'timestamptz' })
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

}