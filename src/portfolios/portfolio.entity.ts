import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Property } from '../properties/property.entity';
import { IsNotEmpty } from 'class-validator';

// Import LeaseCharge as a type only to avoid circular dependency
type LeaseChargeType = import('../billing/lease-charge.entity').LeaseCharge;

@Entity()
@Index(['landlord'])
@Index(['status'])
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postal_code?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  tax_id?: string;

  @Column({ nullable: true })
  registration_number?: string;

  @Column({ nullable: true })
  vat_number?: string;

  @Column({ default: 'USD' })
  currency: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'landlord_id' })
  landlord: User;

  @Column({ nullable: true })
  landlord_id: string | null;

  @Column()
  subscription_plan: string;

  @Column({ default: '' })
  provider_customer_id: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ nullable: true })
  logo_url?: string;

  @Column({ type: 'jsonb', nullable: true })
  invoice_settings?: {
    footer_text?: string;
    terms_conditions?: string;
    notes?: string;
    tax_enabled: boolean;
    tax_rate?: number;
    tax_inclusive: boolean;
    payment_terms_days: number;
    late_fee_enabled: boolean;
    late_fee_amount?: number;
    late_fee_type?: 'fixed' | 'percentage';
  };

  /** Relations */
  @OneToMany(() => Property, (property) => property.portfolio)
  properties: Property[];

  @OneToMany('LeaseCharge', 'portfolio')
  leaseCharges: LeaseChargeType[];

  /** Timestamps */
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}
