import { Entity, Column, ManyToOne, Unique, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Portfolio } from './portfolio.entity';
import { User } from '../users/user.entity';

@Entity()
@Unique(['portfolio_id', 'user_id'])
@Index(['portfolio_id'])
@Index(['user_id'])
export class PortfolioMember extends BaseEntity {
@ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'varchar' })
  role: 'landlord' | 'admin' | 'manager' | 'viewer';

  // Timestamp fields (created_at, updated_at, deleted_at) are inherited from BaseEntity
}


