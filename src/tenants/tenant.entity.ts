import { Entity, Column, ManyToOne, Index, JoinColumn, OneToMany } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { BaseEntity } from '../common/base.entity';

@Entity()
@Index(['portfolio_id'])
export class Tenant extends BaseEntity {
  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column({ nullable: true })
  portfolio_id: string | null;

  @Column()
  @IsNotEmpty()
  first_name: string;

  @Column()
  @IsNotEmpty()
  last_name: string;

  @Column({ type: 'varchar', nullable: true })
  @IsEmail()
  @IsOptional()
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  phone: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => LeaseTenant, leaseTenant => leaseTenant.tenant, {
    cascade: true
  })
  lease_tenants: LeaseTenant[];
}
