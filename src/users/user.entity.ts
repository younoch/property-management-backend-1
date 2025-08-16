import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Notification } from '../notifications/notification.entity';

@Entity()
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  password_hash: string;

  // Keep role for auth payload compatibility, but optional in new model
  @Column({ nullable: true })
  role: 'super_admin' | 'landlord' | 'manager' | 'tenant';

  @Column({ nullable: true })
  profile_image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Legacy fields for backward compatibility
  @Column({ nullable: true })
  password: string;

  @Column({ default: true })
  admin: boolean;

  @OneToMany(() => Account, (account) => account.landlord)
  owned_accounts: Account[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated User with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed User with id', this.id);
  }
}
