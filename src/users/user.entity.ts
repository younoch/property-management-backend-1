import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Notification } from '../notifications/notification.entity';

@Entity({ name: 'users' })
@Index(['email'])
export class User extends BaseEntity {
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

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date | null;

  @Column({ default: true })
  requires_onboarding: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  onboarding_completed_at: Date | null;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  // Timestamp fields (created_at, updated_at, deleted_at) are inherited from BaseEntity

  @OneToMany(() => Portfolio, (portfolio) => portfolio.landlord)
  owned_portfolios: Portfolio[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

}
