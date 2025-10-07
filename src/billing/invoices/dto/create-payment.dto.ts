import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

class PaymentApplicationDto {
  @ApiProperty({ example: '7c1b22e9-d893-41a6-917c-341d3c4d047a', description: 'ID of the invoice to apply payment to' })
  @IsString()
  @IsUUID()
  invoice_id: string;

  @ApiProperty({ example: 100.00, description: 'Amount to apply to this invoice' })
  @IsNumber()
  amount: number;
}

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

  @ApiProperty({ 
    type: [PaymentApplicationDto],
    description: 'List of invoice applications for this payment',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentApplicationDto)
  applications?: PaymentApplicationDto[];

  @ApiProperty({ enum: ['pending','succeeded','failed','refunded'], required: false })
  @IsOptional()
  @IsString()
  status?: any;
}


