import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';

@Entity()
@Index(['portfolio_id'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @IsNotEmpty()
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  phone: string | null;

  @Column({ type: 'boolean', default: true })
  @IsNotEmpty()
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;

  @OneToMany(() => LeaseTenant, leaseTenant => leaseTenant.tenant, {
    cascade: true
  })
  lease_tenants: LeaseTenant[];
}


