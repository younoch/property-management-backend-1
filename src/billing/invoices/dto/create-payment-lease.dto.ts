import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreatePaymentLeaseDto {
  @ApiProperty({ 
    description: 'ID of the invoice to apply payment to',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  invoice_id: string;

  @ApiProperty({ 
    description: 'Payment amount',
    example: 1500.00 
  })
  @IsNumber()
  amount: number;

  @ApiProperty({ 
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER
  })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ 
    description: 'Payment date (ISO string)',
    example: '2025-08-25T00:00:00.000Z',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  received_at?: string;

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
