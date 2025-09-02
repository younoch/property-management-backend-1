import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

@Entity()
@Index(['portfolio_id'])
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  @IsNotEmpty()
  portfolio_id: number;

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}


