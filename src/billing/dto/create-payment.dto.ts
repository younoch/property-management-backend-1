import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class CreatePaymentDto {

  @ApiProperty({ example: 1, description: 'ID of the lease this payment is for' })
  @IsString()
  @IsNotEmpty()
  lease_id: string;

  @ApiProperty({ example: 1, description: 'ID of the user creating the payment' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: '7c1b22e9-d893-41a6-917c-341d3c4d047a', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  invoice_id?: string;

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


