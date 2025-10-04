import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceRequestDto {
  @ApiProperty({ example: '1' })
  @IsString()
  portfolio_id: string;

  @ApiProperty({ example: '1' })
  @IsString()
  property_id: string;

  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsString()
  unit_id?: string;

  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsString()
  tenant_id?: string;

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


