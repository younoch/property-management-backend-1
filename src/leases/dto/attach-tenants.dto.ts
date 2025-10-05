import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, ArrayUnique, IsString } from 'class-validator';

export class AttachTenantsDto {
  @ApiProperty({ type: [String], example: ['025342a2-0739-45f0-8724-abd1c8e7b649', '025342a2-0739-45f0-8724-abd1c8e7b649'], description: 'Array of tenant IDs to attach to the lease' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  tenant_ids: string[];
}
