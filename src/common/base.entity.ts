import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  // Optional: Add createdBy, updatedBy fields if you have user tracking
  // @Column({ type: 'uuid', name: 'created_by_id', nullable: true })
  // created_by_id: string | null;
  // 
  // @Column({ type: 'uuid', name: 'updated_by_id', nullable: true })
  // updated_by_id: string | null;
}
