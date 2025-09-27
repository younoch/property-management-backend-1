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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  password_hash: string;

  // Role is required for proper access control
  @Column()
  role: 'super_admin' | 'landlord' | 'manager' | 'tenant';

  @Column({ nullable: true })
  profile_image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: true })
  requires_onboarding: boolean;

  @Column({ type: 'timestamp', nullable: true })
  onboarding_completed_at: Date | null;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Legacy fields removed for production readiness

  @DeleteDateColumn()
  deleted_at: Date | null;

  @OneToMany(() => Portfolio, (portfolio) => portfolio.landlord)
  owned_portfolios: Portfolio[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

}
