import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn,
  JoinColumn,
  Index
} from "typeorm";
import { Portfolio } from "../portfolios/portfolio.entity";

@Entity()
@Index(['account'])
@Index(['city', 'state'])
@Index(['property_type'])
export class Property {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'portfolio_id' })
    portfolio: Portfolio;

    @Column()
    portfolio_id: number;

    @Column()
    name: string;

    @Column()
    address_line1: string;

    @Column({ nullable: true })
    address_line2: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column({ name: 'postal_code' })
    zip_code: string;

    @Column()
    country: string;

    @Column("decimal", { precision: 10, scale: 6 })
    latitude: number;

    @Column("decimal", { precision: 10, scale: 6 })
    longitude: number;

    @Column()
    property_type: string;

    // number_of_units removed; derive by counting units

    @Column({ nullable: true, type: "text" })
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 