import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from '../properties/unit.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';

@ApiTags('units')
@Controller('units')
export class UnitsGlobalController {
  constructor(private readonly unitsService: UnitsService) {}

  @ApiOperation({ summary: 'Get all units' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully', type: [Unit] })
  @Get()
  findAll() {
    return this.unitsService.findAll();
  }

  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit found successfully', type: Unit })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully', type: Unit })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @ApiOperation({ summary: 'Delete unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.remove(id);
  }
}

@ApiTags('units')
@Controller('portfolios/:portfolioId/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @ApiOperation({ summary: 'Create a new unit for a portfolio' })
  @ApiResponse({ status: 201, description: 'Unit created successfully', type: Unit })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  create(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create({ ...createUnitDto, portfolio_id: portfolioId });
  }

  @ApiOperation({ summary: 'Get all units for a portfolio' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully', type: [Unit] })
  @Get()
  findByPortfolio(@Param('portfolioId', ParseIntPipe) portfolioId: number) {
    return this.unitsService.findByPortfolio(portfolioId);
  }
}


