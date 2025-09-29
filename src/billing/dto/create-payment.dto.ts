import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class CreatePaymentDto {

  @ApiProperty({ example: 1, description: 'ID of the lease this payment is for' })
  @IsInt()
  @IsNotEmpty()
  lease_id: number;

  @ApiProperty({ example: 1, description: 'ID of the user creating the payment' })
  @IsInt()
  user_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  invoice_id?: number;

  @ApiProperty({ example: '2025-09-01T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  received_at?: string;

  @ApiProperty({ 
    enum: PaymentMethod, 
    enumName: 'PaymentMethod',
    example: 'credit_card',
    description: 'Payment method',
    required: false 
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'TXN-12345', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ enum: ['pending','succeeded','failed','refunded'], required: false })
  @IsOptional()
  @IsString()
  status?: any;
}


