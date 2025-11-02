import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

class PaymentApplicationDto {
  @ApiProperty({ 
    example: '7c1b22e9-d893-41a6-917c-341d3c4d047a', 
    description: 'ID of the invoice to apply payment to' 
  })
  @IsString()
  @IsUUID()
  invoice_id: string;

  @ApiProperty({ 
    example: 100.00, 
    description: 'Amount to apply to this invoice' 
  })
  @IsNumber()
  amount: number;
}

export class CreatePaymentDto {
  @ApiProperty({ 
    example: '7c1b22e9-d893-41a6-917c-341d3c4d047a', 
    description: 'ID of the invoice this payment is for',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  invoice_id?: string | null;

  @ApiProperty({ 
    example: 1500.0,
    description: 'Total payment amount'
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Unapplied payment amount',
    example: 0.00,
    default: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  unapplied_amount?: number;

  @ApiProperty({ 
    enum: PaymentMethod,
    description: 'Payment method used for this transaction',
    default: PaymentMethod.BANK_TRANSFER,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiProperty({
    description: 'Date and time when the payment was made',
    example: '2023-11-02T12:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  payment_date?: string | Date;

  @ApiProperty({
    enum: PaymentStatus,
    description: 'Status of the payment',
    default: PaymentStatus.PENDING,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'Reference number for the payment',
    example: 'REF-789012',
    required: false
  })
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

  @ApiProperty({ 
    description: 'ID of the user creating the payment',
    required: false
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ 
    description: 'Additional notes about the payment',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}


