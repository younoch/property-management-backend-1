import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from '../properties/unit.entity';

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully', type: Unit })
  @Post()
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

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
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully', type: Unit })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(+id, updateUnitDto);
  }

  @ApiOperation({ summary: 'Delete unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitsService.remove(+id);
  }
}


