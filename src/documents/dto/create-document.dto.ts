import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: '1' })
  @IsString()
  portfolio_id: string;

  @ApiProperty({ example: 'invoice' })
  @IsString()
  @IsNotEmpty()
  subject_type: string;

  @ApiProperty({ example: '123' })
  @IsString()
  subject_id: string;

  @ApiProperty({ example: 'invoice-sept.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 's3://bucket/key' })
  @IsString()
  storage_key: string;

  @ApiProperty({ example: 'application/pdf', required: false })
  @IsOptional()
  @IsString()
  mime_type?: string;
}


