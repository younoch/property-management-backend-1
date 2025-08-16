import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document as Doc } from './document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doc])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}


