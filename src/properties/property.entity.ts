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
import { Account } from "../accounts/account.entity";

@Entity()
@Index(['account'])
@Index(['city', 'state'])
@Index(['property_type'])
export class Property {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Account, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @Column()
    account_id: number;

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

    @Column()
    zip_code: string;

    @Column()
    country: string;

    @Column("decimal", { precision: 10, scale: 6 })
    latitude: number;

    @Column("decimal", { precision: 10, scale: 6 })
    longitude: number;

    @Column()
    property_type: string;

    @Column()
    number_of_units: number;

    @Column({ nullable: true, type: "text" })
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 