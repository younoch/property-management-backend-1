import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from '../units/unit.entity';

// Global units controller for /units routes
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
  @ApiParam({ name: 'id', description: 'Unit ID', example: '8bfae7e0-f098-422f-9726-73bdf46b912e' })
  @ApiResponse({ status: 200, description: 'Unit found successfully', type: Unit })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @ApiOperation({ 
    summary: 'Update unit by ID',
    description: 'Update unit details. This endpoint supports partial updates.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID of the unit to update',
    example: '8bfae7e0-f098-422f-9726-73bdf46b912e'
  })
  @ApiBody({ 
    type: UpdateUnitDto,
    description: 'Unit data to update',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unit updated successfully', 
    type: Unit 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Unit not found' 
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string, 
    @Body() updateUnitDto: UpdateUnitDto
  ) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @ApiOperation({ summary: 'Delete unit by ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID of the unit to delete',
    example: '8bfae7e0-f098-422f-9726-73bdf46b912e'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unit deleted successfully',
    schema: { 
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true }
      }
    }
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}

// Property-specific units controller for /properties/:propertyId/units routes
@ApiTags('properties')
@Controller('properties/:propertyId/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @ApiOperation({ 
    summary: 'Create a new unit for a property',
    description: 'Create a new unit within the specified property. The property must exist.'
  })
  @ApiParam({ 
    name: 'propertyId', 
    description: 'ID of the property to add the unit to',
    example: '28f06083-28db-4f0c-ad3c-871e3ae99be1',
    required: true
  })
  @ApiBody({ 
    type: CreateUnitDto,
    description: 'Unit details to create',
    required: true
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Unit created successfully', 
    type: Unit 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input or property ID format' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Authentication required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Param('propertyId') propertyId: string,
    @Body() createUnitDto: CreateUnitDto,
  ) {
    return this.unitsService.create({ ...createUnitDto, property_id: propertyId });
  }

  @ApiOperation({ 
    summary: 'Get all units for a property',
    description: 'Retrieve all units that belong to the specified property.'
  })
  @ApiParam({ 
    name: 'propertyId', 
    description: 'ID of the property to get units for',
    example: '28f06083-28db-4f0c-ad3c-871e3ae99be1',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Units retrieved successfully', 
    type: [Unit],
    isArray: true
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid property ID format' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  @Get()
  async findByProperty(@Param('propertyId') propertyId: string) {
    return this.unitsService.findByProperty(propertyId);
  }

  @ApiOperation({ 
    summary: 'Get a specific unit in a property',
    description: 'Retrieve details of a specific unit within a property.'
  })
  @ApiParam({ 
    name: 'propertyId', 
    description: 'ID of the property',
    example: '28f06083-28db-4f0c-ad3c-871e3ae99be1',
    required: true
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID of the unit to retrieve',
    example: '8bfae7e0-f098-422f-9726-73bdf46b912e',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unit retrieved successfully', 
    type: Unit
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid ID format' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Unit or property not found' 
  })
  @Get(':id')
  async findOneInProperty(
    @Param('propertyId') propertyId: string,
    @Param('id') id: string
  ) {
    return this.unitsService.findOneInProperty(propertyId, id);
  }
}
