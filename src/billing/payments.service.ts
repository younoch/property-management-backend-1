import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  create(dto: CreatePaymentDto) {
    const payment = this.repo.create(dto as any);
    return this.repo.save(payment);
  }

  findAll() {
    return this.repo.find();
  }

  findByPortfolio(portfolioId: number) {
    return this.repo.find({ where: { portfolio_id: portfolioId } });
  }

  async findOne(id: number) {
    const payment = await this.repo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    return this.repo.save(payment);
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    await this.repo.remove(payment);
    return { success: true };
  }
}


