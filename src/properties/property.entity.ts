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
  DeleteDateColumn
} from "typeorm";
import { Portfolio } from "../portfolios/portfolio.entity";
import { Unit } from "../units/unit.entity";
import { IsNotEmpty } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';

import type { Expense } from '../expenses/expense.entity';

@Entity()
@Index(['city', 'state'])
@Index(['property_type'])
export class Property {
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
    name: string;

    @Column({ nullable: true })
    address_line1: string;

    @Column({ nullable: true })
    address_line2: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

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

    // number_of_units removed; derive by counting units

    @OneToMany(() => Unit, (unit) => unit.property)
    units: Unit[];

    @OneToMany('Expense', 'property', { cascade: true })
    @ApiHideProperty() // keep to prevent Swagger circular dependency
    expenses: Promise<Expense[]>;

    @Column({ nullable: true, type: "text" })
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date | null;
} 