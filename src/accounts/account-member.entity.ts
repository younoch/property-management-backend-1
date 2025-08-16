import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { User } from '../users/user.entity';

@Entity()
@Unique(['account_id', 'user_id'])
@Index(['account_id'])
@Index(['user_id'])
export class AccountMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ type: 'varchar' })
  role: 'owner' | 'admin' | 'manager' | 'viewer';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


