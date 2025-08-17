import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document as Doc } from './document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Doc) private readonly repo: Repository<Doc>,
  ) {}

  create(dto: CreateDocumentDto) {
    const doc = this.repo.create(dto as any);
    return this.repo.save(doc);
  }

  findAll() {
    return this.repo.find();
  }

  findByAccount(accountId: number) {
    return this.repo.find({ where: { portfolio_id: accountId } });
  }

  async findOne(id: number) {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Document not found');
    return d;
  }

  async update(id: number, dto: UpdateDocumentDto) {
    const d = await this.findOne(id);
    Object.assign(d, dto);
    return this.repo.save(d);
  }

  async remove(id: number) {
    const d = await this.findOne(id);
    await this.repo.remove(d);
    return { success: true };
  }
}


