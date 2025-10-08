import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../common/base.entity";
import { User } from "../users/user.entity";
import { Portfolio } from "../portfolios/portfolio.entity";

@Entity()
@Index(['user'])
@Index(['is_read'])
@Index(['sent_at'])
@Index(['portfolio_id'])
export class Notification extends BaseEntity {
@ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  type: string;

  @Column("text")
  message: string;

  // Polymorphic subject (e.g., invoice, lease, maintenance_request)
  @Column({ type: 'varchar', nullable: true })
  subject_type: string | null;

  @Column({ type: 'bigint', nullable: true })
  subject_id: number | null;

  @Column({ default: false })
  is_read: boolean;

  @Column()
  channel: string; // in_app | email | sms | push

  @Column({ type: 'timestamptz', nullable: true })
  sent_at: Date | null;

  // Timestamp fields (created_at, updated_at, deleted_at) are inherited from BaseEntity
} 