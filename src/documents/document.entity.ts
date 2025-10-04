import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';

@Entity()
@Index(['subject_type', 'subject_id'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject_type: string;

  @Column('bigint')
  subject_id: string;

  @Column()
  filename: string;

  @Column()
  storage_key: string; // e.g., S3 path

  @Column({ nullable: true })
  mime_type: string | null;

  @Column({ type: 'bigint', nullable: true })
  size_bytes: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}


