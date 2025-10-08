import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from '../users/user.entity';

@Entity()
@Index(['make', 'model'])
@Index(['lat', 'lng'])
@Index(['year'])
@Index(['approved'])
export class Report extends BaseEntity {
@Column({ default: false })
  approved: boolean;

  @Column()
  price: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  lng: number;

  @Column()
  lat: number;

  @Column()
  mileage: number;

  @ManyToOne(() => User)
  user: User;

  // Timestamp fields (created_at, updated_at, deleted_at) are inherited from BaseEntity
}
