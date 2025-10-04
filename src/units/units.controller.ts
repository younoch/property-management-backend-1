import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from '../units/unit.entity';

@ApiTags('units')
@Controller('properties/:propertyId/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @ApiOperation({ summary: 'Create a new unit for a property' })
  @ApiResponse({ status: 201, description: 'Unit created successfully', type: Unit })
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Param('propertyId') propertyId: string,
    @Body() createUnitDto: CreateUnitDto,
  ) {
    return this.unitsService.create({ ...createUnitDto, property_id: propertyId });
  }

  @ApiOperation({ summary: 'Get all units' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully', type: [Unit] })
  @Get()
  findAll() {
    return this.unitsService.findAll();
  }

  @ApiOperation({ summary: 'Get all units for a property' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully', type: [Unit] })
  @Get('property/:propertyId')
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.unitsService.findByProperty(propertyId);
  }

  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit found successfully', type: Unit })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully', type: Unit })
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @ApiOperation({ summary: 'Delete unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}


