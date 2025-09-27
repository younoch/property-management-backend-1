import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';

@Entity()
@Index(['subject_type', 'subject_id'])
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

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


