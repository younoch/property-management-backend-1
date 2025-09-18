import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioDocumentsController, DocumentsGlobalController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document as Doc } from './document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doc])],
  controllers: [PortfolioDocumentsController, DocumentsGlobalController],
  providers: [DocumentsService],
})
export class DocumentsModule {}


