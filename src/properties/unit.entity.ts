import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, Unique, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Property } from './property.entity';

@Entity()
@Index(['portfolio_id'])
@Index(['property_id'])
@Unique(['portfolio_id', 'property_id', 'label'])
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: number;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column()
  property_id: number;

  @Column()
  label: string; // e.g., "Unit 2B"

  @Column({ type: 'int', nullable: true })
  bedrooms: number | null;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  bathrooms: string | null;

  @Column({ type: 'int', nullable: true })
  sqft: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  market_rent: string | null;

  @Column({ type: 'varchar', default: 'vacant' })
  status: 'vacant' | 'occupied' | 'maintenance';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}


