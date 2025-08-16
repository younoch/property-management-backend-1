import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaseChargeDto } from './create-lease-charge.dto';

export class UpdateLeaseChargeDto extends PartialType(CreateLeaseChargeDto) {}


