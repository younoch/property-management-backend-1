import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';

@Entity()
@Index(['portfolio_id'])
@Index(['subject_type', 'subject_id'])
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: number;

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

   @DeleteDateColumn()
   deleted_at: Date | null;
}


