import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Portfolio } from './portfolio.entity';

@ApiTags('portfolios')
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @ApiOperation({ summary: 'Create a new portfolio' })
  @ApiResponse({ status: 201, description: 'Portfolio created successfully', type: Portfolio })
  @Post()
  create(@Body() createDto: CreatePortfolioDto) {
    return this.portfoliosService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all portfolios' })
  @ApiResponse({ status: 200, description: 'Portfolios retrieved successfully', type: [Portfolio] })
  @Get()
  findAll() {
    return this.portfoliosService.findAll();
  }

  @ApiOperation({ summary: 'Get portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, description: 'Portfolio found successfully', type: Portfolio })
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfoliosService.findOne(+id);
  }

  @ApiOperation({ summary: 'Get portfolios by landlord ID' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiResponse({ status: 200, description: 'Landlord portfolios retrieved successfully', type: [Portfolio] })
  @Get('landlord/:landlordId')
  findByLandlord(@Param('landlordId') landlordId: string) {
    return this.portfoliosService.findByLandlord(+landlordId);
  }

  @ApiOperation({ summary: 'Update portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, description: 'Portfolio updated successfully', type: Portfolio })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePortfolioDto) {
    return this.portfoliosService.update(+id, updateDto);
  }

  @ApiOperation({ summary: 'Delete portfolio by ID' })
  @ApiParam({ name: 'id', description: 'Portfolio ID' })
  @ApiResponse({ status: 200, description: 'Portfolio deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfoliosService.remove(+id);
  }
}


