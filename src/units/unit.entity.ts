import { Entity, Column, ManyToOne, Index, Unique, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Property } from '../properties/property.entity';

@Entity('units')
@Index(['property'])
@Unique(['property', 'label'])
export class Unit extends BaseEntity {

  @ManyToOne(() => Property, property => property.units, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'property_id', nullable: true })
  propertyId: string | null;

  @Column({ name: 'label' })
  label: string; // e.g., "Unit 2B"

  @Column({ type: 'int', name: 'bedrooms', nullable: true })
  bedrooms: number | null;

  @Column({ type: 'int', name: 'bathrooms', nullable: true })
  bathrooms: number | null;

  @Column({ type: 'int', name: 'sqft', nullable: true })
  sqft: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'market_rent',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => value ? parseFloat(value) : null
    }
  })
  marketRent: number | null;

  @Column({ type: 'varchar', name: 'status', default: 'vacant' })
  status: 'vacant' | 'occupied' | 'maintenance';

}
