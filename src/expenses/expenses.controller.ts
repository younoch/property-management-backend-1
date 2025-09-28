import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiBody,
  getSchemaPath
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseDto } from './dto/expense.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Expense, ExpenseStatus } from './expense.entity';

export type ExpenseQueryParams = {
  propertyId?: number;
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
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiBody({ 
    type: CreateExpenseDto,
    examples: {
      basic: {
        summary: 'Basic expense',
        value: {
          property_id: 1,
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
  @Post()
  @ApiOperation({ summary: 'Create a new expense for a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  async create(
    @Param('propertyId', ParseIntPipe) propertyId: number,
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
      });
      
      console.log('Expense created successfully, ID:', expense.id);
      return await this.mapToDto(expense);
    } catch (error) {
      console.error('Error in controller when creating expense:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with optional filters' })
  @ApiQuery({ name: 'propertyId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['paid', 'pending', 'overdue'],
    description: 'Filter by status'
  })
  @ApiResponse({ status: 200, description: 'Returns the list of expenses', type: [ExpenseDto] })
  @Get()
  @ApiOperation({ summary: 'Get all expenses for a property with optional filters' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['paid', 'pending', 'overdue'],
    description: 'Filter by status'
  })
  @ApiResponse({ status: 200, description: 'Returns the list of expenses', type: [ExpenseDto] })
  async findAll(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
  ): Promise<ExpenseDto[]> {
    const expenses = await this.expensesService.findAll(
      propertyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      category,
    );
    return Promise.all(expenses.map(expense => this.mapToDto(expense)));
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get expense summary' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return expense summary',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 1500.75 },
        count: { type: 'number', example: 10 },
        byCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'Maintenance' },
              total: { type: 'number', example: 750.50 },
              count: { type: 'number', example: 5 }
            }
          }
        },
        byStatus: {
          type: 'object',
          properties: {
            paid: { type: 'number', example: 1000.25 },
            pending: { type: 'number', example: 400.50 },
            overdue: { type: 'number', example: 100.00 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSummary(@Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.expensesService.getExpenseSummary(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single expense by ID for a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Returns the expense', type: ExpenseDto })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async findOne(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<ExpenseDto> {
    const expense = await this.expensesService.findOneForProperty(id, propertyId);
    return await this.mapToDto(expense);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiParam({ 
    name: 'id', 
    type: Number,
    description: 'ID of the expense to update',
    example: 1
  })
  @ApiResponse({ status: 200, description: 'The expense has been successfully updated.', type: ExpenseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async update(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    // Convert the DTO to a partial expense object
    const updateData = { ...updateExpenseDto } as any;
    if (updateExpenseDto.property_id) {
      updateData.property = { id: updateExpenseDto.property_id } as any;
      delete updateData.property_id;
    }
    const expense = await this.expensesService.update(id, updateData);
    return this.mapToDto(expense);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense from a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'The expense has been deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async remove(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    await this.expensesService.removeForProperty(id, propertyId);
  }
}
