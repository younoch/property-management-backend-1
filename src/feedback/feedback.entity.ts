import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { BaseEntity } from '../common/base.entity';

@Entity('user_feedback')
export class Feedback extends BaseEntity {
  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'user_id', nullable: true })
  user_id: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  page_url: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_reviewed: boolean;
}
