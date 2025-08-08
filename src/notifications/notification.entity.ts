import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index
} from "typeorm";
import { User } from "../users/user.entity";

@Entity()
@Index(['user'])
@Index(['is_read'])
@Index(['sent_at'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column()
  type: string;

  @Column("text")
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @Column()
  channel: string;

  @Column({ type: "timestamp" })
  sent_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 