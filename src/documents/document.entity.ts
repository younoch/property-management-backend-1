import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';

@Entity()
@Index(['account_id'])
@Index(['subject_type', 'subject_id'])
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @Column()
  subject_type: string;

  @Column('bigint')
  subject_id: number;

  @Column()
  filename: string;

  @Column()
  storage_key: string; // e.g., S3 path

  @Column({ nullable: true })
  mime_type: string | null;

  @Column({ type: 'bigint', nullable: true })
  size_bytes: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


