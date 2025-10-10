import { Entity, Column, ManyToOne, Index, Unique, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Property } from '../properties/property.entity';
import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity('units')
@Index(['property'])
@Unique(['property', 'label'])
export class Unit extends BaseEntity {
  @ManyToOne(() => Property, property => property.units, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'property_id' })
  @ApiProperty({ type: () => Property, description: 'The property this unit belongs to' })
  property: Property;

  @Column({ nullable: true })
  property_id: string;

  @Column()
  @IsNotEmpty()
  @ApiProperty({ description: 'Unit identifier (e.g., "Unit 2B")' })
  label: string;

  @Column('int', { nullable: true })
  @IsOptional()
  bedrooms: number;

  @Column('int', { nullable: true })
  @IsOptional()
  bathrooms: number;

  @Column('int', { nullable: true })
  @IsOptional()
  sqft: number;

  @Column('decimal', { 
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  market_rent: number;

  @Column({ 
    type: 'enum',
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant'
  })
  @IsIn(['vacant', 'occupied', 'maintenance'])
  status: 'vacant' | 'occupied' | 'maintenance';
}
