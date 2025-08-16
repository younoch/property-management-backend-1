import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  invoice_id: number;

  @ApiProperty({ example: 'Monthly Rent' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  amount: number;
}


