import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity()
@Index(['subject_type', 'subject_id'])
export class Document extends BaseEntity {
  @Column()
  subject_type: string;

  @Column('bigint')
  subject_id: string;

  @Column()
  filename: string;

  @Column()
  storage_key: string; // e.g., S3 path

  @Column({ nullable: true })
  mime_type: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
