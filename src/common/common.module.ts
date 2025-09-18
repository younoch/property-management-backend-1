import { Module } from '@nestjs/common';
import { TimezoneService } from './services/timezone.service';

@Module({
  providers: [TimezoneService],
  exports: [TimezoneService],
})
export class CommonModule {}
