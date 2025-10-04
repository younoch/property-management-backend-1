import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Notification } from '../notifications/notification.entity';

@Entity({ name: 'users' })
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'password_hash' })
  password_hash: string;

  // Role is required for proper access control
  @Column()
  role: 'super_admin' | 'landlord' | 'manager' | 'tenant';

  @Column({ name: 'profile_image_url', nullable: true })
  profile_image_url: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'requires_onboarding', default: true })
  requires_onboarding: boolean;

  @Column({ name: 'onboarding_completed_at', type: 'timestamptz', nullable: true })
  onboarding_completed_at: Date | null;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  // Legacy fields removed for production readiness

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;

  @OneToMany(() => Portfolio, (portfolio) => portfolio.landlord)
  owned_portfolios: Portfolio[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

}
