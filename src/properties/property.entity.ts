import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../common/base.entity";
import { Portfolio } from "../portfolios/portfolio.entity";
import { Unit } from "../units/unit.entity";
import { IsNotEmpty } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import type { Expense } from '../expenses/expense.entity';

@Entity()
@Index(['city', 'state'])
@Index(['property_type'])
export class Property extends BaseEntity {
@ManyToOne(() => Portfolio, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column({ name: 'portfolio_id', nullable: true })
  portfolio_id: string | null;


  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: true })
  address_line1: string;

  @Column({ nullable: true })
  address_line2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @OneToMany(() => Unit, unit => unit.property, {
    onDelete: 'CASCADE'
  })
  @ApiProperty({ type: () => [Unit], description: 'List of units in this property' })
  units: Unit[];

  @Column({ name: 'postal_code', nullable: true })
  zip_code: string;

  @Column({ nullable: true })
  country: string;

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column()
  @IsNotEmpty()
  property_type: string;

  @OneToMany('Expense', 'property', { cascade: true })
  @ApiHideProperty()
  expenses: Promise<Expense[]>;

  @Column({ nullable: true, type: "text" })
  description: string;

  // Timestamp fields (created_at, updated_at, deleted_at) are inherited from BaseEntity
}
