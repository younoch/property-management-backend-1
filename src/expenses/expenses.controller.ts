import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseDto } from './dto/expense.dto';
import { ExpenseCategory } from '../common/enums/expense-category.enum';
import { AuthGuard } from '../guards/auth.guard';
import { Expense } from './expense.entity';

export type ExpenseQueryParams = {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
};

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('properties/:propertyId/expenses')
@UseGuards(AuthGuard)
export class ExpensesController {
  private async mapToDto(expense: Expense): Promise<ExpenseDto> {
    // Convert the expense to a plain object and then to the DTO
    const plainExpense = { ...expense };
    return plainExpense as unknown as ExpenseDto;
  }
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense for a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiBody({ 
    type: CreateExpenseDto,
    examples: {
      basic: {
        summary: 'Basic expense',
        value: {
          property_id: '1',
          amount: 250.75,
          category: 'Maintenance',
          date_incurred: '2023-10-15',
          status: 'pending',
          description: 'Monthly water bill for October 2023',
          vendor: 'ABC Plumbing',
          payment_method: 'Credit Card',
          receipt_url: 'https://example.com/receipts/oct-water-bill.pdf',
          tax_amount: 15.25,
          tax_rate: 8.25,
          notes: 'Paid via company credit card ending in 1234'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The expense has been successfully created.',
    type: ExpenseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('propertyId') propertyId: string,
    @Body() createExpenseDto: CreateExpenseDto
  ): Promise<ExpenseDto> {
    // Log the incoming data for debugging
    console.log('Creating expense with data:', {
      ...createExpenseDto,
      property_id: propertyId
    });
    
    try {
      // Ensure the expense is created for the specified property
      const expense = await this.expensesService.create({
        ...createExpenseDto,
        property_id: propertyId // This will be used to set up the relation
      } as any);
      
      console.log('Expense created successfully, ID:', expense.id);
      return await this.mapToDto(expense);
    } catch (error) {
      console.error('Error in controller when creating expense:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses for a property with optional filters' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    type: String,
    description: 'Start date for filtering expenses (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    type: String,
    description: 'End date for filtering expenses (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    enum: Object.values(ExpenseCategory),
    enumName: 'ExpenseCategory'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of expenses', 
    type: [ExpenseDto] 
  })
  async findAll(
    @Param('propertyId') propertyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
  ): Promise<ExpenseDto[]> {
    const expenses = await this.expensesService.findAll({
      propertyId,
      startDate,
      endDate,
      category,
    } as any);
    return Promise.all(expenses.map(expense => this.mapToDto(expense)));
  }
  @Get('summary')
  @ApiOperation({ summary: 'Get expense summary for a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiResponse({ status: 200, description: 'Expense summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSummary(@Param('propertyId') propertyId: string) {
    return this.expensesService.getExpenseSummary(parseInt(propertyId, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiParam({ name: 'id', description: 'ID of the expense' })
  @ApiResponse({ status: 200, description: 'The expense', type: ExpenseDto })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async findOne(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string
  ): Promise<ExpenseDto> {
    const expense = await this.expensesService.findOne(parseInt(id, 10));
    return this.mapToDto(expense);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiParam({ name: 'id', description: 'ID of the expense' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiResponse({ status: 200, description: 'The updated expense', type: ExpenseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async update(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto
  ): Promise<ExpenseDto> {
    const updateData = {
      ...updateExpenseDto,
      property_id: propertyId // The DTO should handle the string to number conversion
    };
    const expense = await this.expensesService.update(parseInt(id, 10), updateData as any);
    return this.mapToDto(expense);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiParam({ name: 'id', description: 'ID of the expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async remove(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string
  ): Promise<void> {
    await this.expensesService.removeForProperty(parseInt(id, 10), parseInt(propertyId, 10));
  }
}
