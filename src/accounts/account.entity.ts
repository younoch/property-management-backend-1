import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany,
  CreateDateColumn, 
  UpdateDateColumn,
  JoinColumn,
  Index
} from "typeorm";
import { User } from "../users/user.entity";
import { Property } from "../properties/property.entity";

@Entity()
@Index(['landlord'])
@Index(['status'])
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'landlord_id' })
    landlord: User;

    @Column()
    landlord_id: number;

    @Column()
    subscription_plan: string;

    @Column()
    status: string;

    @OneToMany(() => Property, (property) => property.account)
    properties: Property[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 