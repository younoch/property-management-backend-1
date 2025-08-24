import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, ArrayUnique, IsInt } from 'class-validator';

export class AttachTenantsDto {
  @ApiProperty({ type: [Number], example: [1, 4], description: 'Array of tenant IDs to attach to the lease' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  tenant_ids: number[];
}
