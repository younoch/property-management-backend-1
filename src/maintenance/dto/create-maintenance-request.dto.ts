import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  property_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  unit_id?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  tenant_id?: number;

  @ApiProperty({ example: 'Leaking sink' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The kitchen sink is leaking when turned on', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['low','medium','high','emergency'], required: false })
  @IsOptional()
  @IsEnum(['low','medium','high','emergency'] as any)
  priority?: any;
}


