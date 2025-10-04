import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardFilterDto {
  @ApiProperty({ required: false, description: 'Start date in YYYY-MM-DD format' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date in YYYY-MM-DD format' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
  
  @ApiProperty({ 
    required: false, 
    description: 'Filter by property ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  propertyId?: string;
}

export class MonthlyDataDto {
  @ApiProperty({ description: 'Year of the data point' })
  year: number;

  @ApiProperty({ description: 'Month of the data point (1-12)' })
  month: number;

  @ApiProperty({ description: 'Total amount for the month' })
  amount: number;

  @ApiProperty({ description: 'Formatted month-year string (e.g., Jan 2023)' })
  label: string;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ description: 'Total number of units' })
  totalUnits: number;

  @ApiProperty({ description: 'Number of units currently rented' })
  rentedUnits: number;

  @ApiProperty({ 
    description: 'Current occupancy rate (0-1)',
    example: 0.75
  })
  occupancyRate: number;

  @ApiProperty({
    description: 'Historical occupancy rate data',
    example: [['Jan, 2025', 0.72], ['Feb, 2025', 0.75]],
    type: 'array',
    items: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string', description: 'Month and year (e.g., Jan, 2025)' },
          { type: 'number', description: 'Occupancy rate (0-1)' }
        ]
      }
    }
  })
  historicalOccupancy: [string, number][];

  @ApiProperty({ description: 'Number of active tenants' })
  activeTenants: number;

  @ApiProperty({ description: 'Total revenue for the period' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total expenses for the period' })
  totalExpenses: number;

  @ApiProperty({ description: 'List of overdue payments' })
  overduePayments: OverduePaymentDto[];

  @ApiProperty({ description: 'Total number of active leases' })
  activeLeases: number;

  @ApiProperty({ 
    description: 'Monthly revenue data',
    type: [MonthlyDataDto]
  })
  monthlyRevenue: MonthlyDataDto[];

  @ApiProperty({ 
    description: 'Monthly expenses data',
    type: [MonthlyDataDto]
  })
  monthlyExpenses: MonthlyDataDto[];
}

export class OverduePaymentDto {
  @ApiProperty({ description: 'Tenant name' })
  tenantName: string;

  @ApiProperty({ description: 'Unit number' })
  unitNumber: string;

  @ApiProperty({ description: 'Amount due' })
  amount: number;

  @ApiProperty({ description: 'Due date' })
  dueDate: Date;

  @ApiProperty({ description: 'Number of days overdue' })
  daysOverdue: number;
}
