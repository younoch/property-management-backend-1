import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { Property } from '../properties/property.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    // Verify property exists
    const property = await this.propertyRepository.findOne({
      where: { id: createExpenseDto.property_id },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createExpenseDto.property_id} not found`,
      );
    }

    // Create the expense with the provided data
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      // Set the property relation using the property object
      property: Promise.resolve(property)
    });

    // Log the expense being created for debugging
    console.log('Creating expense with data:', {
      ...expense,
      property: '[Property]' // Avoid circular reference in log
    });
    
    try {
      const savedExpense = await this.expenseRepository.save(expense);
      console.log('Expense created successfully:', savedExpense.id);
      return savedExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async findAll(
    propertyId?: number,
    startDate?: Date,
    endDate?: Date,
    category?: string,
  ): Promise<Expense[]> {
    // Don't include the property relation to prevent circular references
    // The DTO will handle adding the property_id
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .orderBy('expense.date_incurred', 'DESC');

    if (propertyId) {
      query.andWhere('expense.property_id = :propertyId', { propertyId });
    }

    if (startDate) {
      query.andWhere('expense.date_incurred >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('expense.date_incurred <= :endDate', { endDate });
    }

    if (category) {
      query.andWhere('expense.category = :category', { category });
    }

    return query.orderBy('expense.date_incurred', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Expense> {
    return this.findOneForProperty(id);
  }

  async findOneForProperty(id: number, propertyId?: number): Promise<Expense> {
    const query = this.expenseRepository.createQueryBuilder('expense')
      .where('expense.id = :id', { id });

    if (propertyId) {
      query.andWhere('expense.property_id = :propertyId', { propertyId });
    }

    const expense = await query.getOne();

    if (!expense) {
      throw new NotFoundException(
        propertyId 
          ? `Expense with ID ${id} not found for property ${propertyId}`
          : `Expense with ID ${id} not found`
      );
    }

    return expense;
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
    propertyId?: number
  ): Promise<Expense> {
    const expense = propertyId 
      ? await this.findOneForProperty(id, propertyId)
      : await this.findOne(id);
    
    // Handle property update if property_id is provided
    if (updateExpenseDto.property_id !== undefined) {
      const property = await this.propertyRepository.findOne({
        where: { id: updateExpenseDto.property_id },
      });

      if (!property) {
        throw new NotFoundException(
          `Property with ID ${updateExpenseDto.property_id} not found`,
        );
      }
      
      // Update the property relation
      expense.property = Promise.resolve(property);
      expense.property_id = updateExpenseDto.property_id;
    }

    // Update other fields
    Object.assign(expense, updateExpenseDto);

    return this.expenseRepository.save(expense);
  }

  async updateForProperty(
    id: number,
    propertyId: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    return this.update(id, updateExpenseDto, propertyId);
  }

  async remove(id: number): Promise<void> {
    await this.removeForProperty(id);
  }

  async removeForProperty(id: number, propertyId?: number): Promise<void> {
    const query = this.expenseRepository
      .createQueryBuilder()
      .delete()
      .from(Expense)
      .where('id = :id', { id });

    if (propertyId) {
      query.andWhere('property_id = :propertyId', { propertyId });
    }

    const result = await query.execute();

    if (result.affected === 0) {
      throw new NotFoundException(
        propertyId
          ? `Expense with ID ${id} not found for property ${propertyId}`
          : `Expense with ID ${id} not found`
      );
    }
  }

  async getExpenseSummary(propertyId?: number): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    let query = this.expenseRepository.createQueryBuilder('expense');

    if (propertyId) {
      query = query.where('expense.property_id = :propertyId', { propertyId });
    }

    const expenses = await query.getMany();

    const summary = {
      total: 0,
      byCategory: {},
      byStatus: {},
    };

    expenses.forEach((expense) => {
      // Update total
      summary.total += parseFloat(expense.amount as any);

      // Update by category
      if (!summary.byCategory[expense.category]) {
        summary.byCategory[expense.category] = 0;
      }
      summary.byCategory[expense.category] += parseFloat(expense.amount as any);

      // Update by status
      if (!summary.byStatus[expense.status]) {
        summary.byStatus[expense.status] = 0;
      }
      summary.byStatus[expense.status] += parseFloat(expense.amount as any);
    });

    return summary;
  }
}
