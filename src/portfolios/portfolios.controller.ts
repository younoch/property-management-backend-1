import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Portfolio } from './portfolio.entity';

@ApiTags('portfolios')
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @ApiOperation({ summary: 'Create a new portfolio' })
  @ApiBody({
    description: 'Create Portfolio payload',
    schema: {
      example: {
        name: 'Rental Portfolio A',
        landlord_id: 12,
        subscription_plan: 'premium',
        // status is optional; defaults to 'active' if omitted
        provider_customer_id: ''
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Portfolio created successfully',
    type: Portfolio,
    schema: {
      example: {
        id: 1,
        name: 'Rental Portfolio A',
        landlord_id: 12,
        subscription_plan: 'premium',
        provider_customer_id: '',
        status: 'active',
        properties: [],
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @Post()
  create(@Body() createDto: CreatePortfolioDto) {
    return this.portfoliosService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all portfolios' })
  @ApiResponse({
    status: 200,
    description: 'Portfolios retrieved successfully',
    type: [Portfolio],
    schema: {
      example: [
        {
          id: 1,
          name: 'Rental Portfolio A',
          landlord_id: 12,
          subscription_plan: 'premium',
          provider_customer_id: '',
          status: 'active',
          properties: [],
          created_at: '2025-01-15T10:30:00.000Z',
          updated_at: '2025-01-15T10:30:00.000Z',
        },
        {
          id: 2,
          name: 'Short-Term Rentals',
          landlord_id: 12,
          subscription_plan: 'basic',
          provider_customer_id: '',
          status: 'inactive',
          properties: [],
          created_at: '2025-02-01T09:00:00.000Z',
          updated_at: '2025-02-10T11:15:00.000Z',
        },
      ],
    },
  })
  @Get()
  findAll() {
    return this.portfoliosService.findAll();
  }

  @ApiOperation({ summary: 'Get portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio found successfully',
    type: Portfolio,
    schema: {
      example: {
        id: 1,
        name: 'Rental Portfolio A',
        landlord_id: 12,
        subscription_plan: 'premium',
        provider_customer_id: '',
        status: 'active',
        properties: [],
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfoliosService.findOne(+id);
  }

  @ApiOperation({ summary: 'Get portfolios by landlord ID' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiResponse({
    status: 200,
    description: 'Landlord portfolios retrieved successfully',
    type: [Portfolio],
    schema: {
      example: [
        {
          id: 1,
          name: 'Rental Portfolio A',
          landlord_id: 12,
          subscription_plan: 'premium',
          provider_customer_id: '',
          status: 'active',
          properties: [],
          created_at: '2025-01-15T10:30:00.000Z',
          updated_at: '2025-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @Get('landlord/:landlordId')
  findByLandlord(@Param('landlordId') landlordId: string) {
    return this.portfoliosService.findByLandlord(+landlordId);
  }

  @ApiOperation({ summary: 'Update portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiBody({
    description: 'Update Portfolio payload (partial)',
    schema: {
      example: {
        name: 'Rental Portfolio A - Downtown Focus',
        status: 'suspended',
        provider_customer_id: ''
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio updated successfully',
    type: Portfolio,
    schema: {
      example: {
        id: 1,
        name: 'Rental Portfolio A - Downtown Focus',
        landlord_id: 12,
        subscription_plan: 'premium',
        provider_customer_id: '',
        status: 'suspended',
        properties: [],
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-03-01T12:00:00.000Z',
      },
    },
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePortfolioDto) {
    return this.portfoliosService.update(+id, updateDto);
  }

  @ApiOperation({ summary: 'Delete portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio deleted successfully',
    schema: {
      example: { success: true },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfoliosService.remove(+id);
  }
}


