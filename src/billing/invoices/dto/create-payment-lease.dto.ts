import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

export class CreatePaymentLeaseDto {
  @ApiProperty({ 
    description: 'ID of the invoice to apply payment to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  invoice_id?: string | null;

  @ApiProperty({ 
    description: 'Payment amount',
    example: 1500.00 
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ 
    description: 'Unapplied payment amount',
    example: 0.00,
    required: false
  })
  @IsOptional()
  @IsNumber()
  unapplied_amount?: number;

  @ApiProperty({ 
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiProperty({ 
    description: 'Date and time when the payment was made',
    example: '2025-08-25T00:00:00.000Z',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @ApiProperty({
    description: 'Status of the payment',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ 
    description: 'Payment reference number',
    example: 'TXN-123',
    required: false 
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ 
    description: 'Additional payment notes',
    example: 'Partial payment',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'ID of the user creating the payment',
    example: 'user-123'
  })
  @IsString()
  user_id: string;
}
