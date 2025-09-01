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

@Entity()
@Index(['landlord'])
@Index(['status'])
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landlord_id' })
  landlord: User;

  @Column()
  @IsNotEmpty()
  landlord_id: number;

  @Column()
  subscription_plan: string;

  @Column({ default: '' })
  provider_customer_id: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @OneToMany(() => Property, (property) => property.portfolio)
  properties: Property[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
