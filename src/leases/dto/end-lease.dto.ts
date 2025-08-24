import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class EndLeaseDto {
  @ApiProperty({ example: '2025-08-28', description: 'Date the lease ends (YYYY-MM-DD)' })
  @IsDateString()
  end_date: string;
}
