import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2 })
  portfolio_id: number;

  @ApiProperty({ example: 1, nullable: true })
  lease_id: number | null;

  @ApiProperty({ example: 1000.00 })
  amount: number;

  @ApiProperty({ example: 'cash', enum: ['cash', 'bank_transfer', 'card', 'ach', 'mobile'] })
  method: string;

  @ApiProperty({ example: '2025-08-28T00:00:00.000Z' })
  at: Date | string;

  @ApiProperty({ example: 'TXN-12345', nullable: true })
  reference: string | null;

  @ApiProperty({ example: 'Payment notes', nullable: true })
  notes: string | null;

  @ApiProperty({ example: 0 })
  unapplied_amount: number;

  @ApiProperty({ example: '2025-08-28T15:32:56.833Z' })
  created_at: Date | string;

  @ApiProperty({ example: '2025-08-28T15:32:56.833Z' })
  updated_at: Date | string;

  @ApiProperty({ nullable: true })
  deleted_at: Date | string | null;

  // Include the lease object if needed
  lease?: any;

  // Include the portfolio object if needed
  portfolio?: any;

  // Include applications if needed
  applications?: any[];
}
