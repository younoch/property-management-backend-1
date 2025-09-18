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
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './property.entity';
import { FindPropertiesDto } from './dto/find-properties.dto';
import { PaginatedPropertiesResponseDto } from './dto/paginated-properties.dto';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from '../common/types/jwt.types';

@ApiTags('properties')
@Controller('properties')
export class PropertiesGlobalController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Get all properties (paginated + search)' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully', type: PaginatedPropertiesResponseDto })
  @Get()
  findAll(@Query() query: FindPropertiesDto) {
    return this.propertiesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property found successfully', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.findOne(id);
  }

  @ApiOperation({ summary: 'Search properties by location' })
  @ApiQuery({ name: 'city', description: 'City name', required: false })
  @ApiQuery({ name: 'state', description: 'State name', required: false })
  @ApiResponse({ status: 200, description: 'Properties found by location', type: [Property] })
  @Get('location/search')
  findByLocation(
    @Query('city') city: string,
    @Query('state') state: string,
  ) {
    return this.propertiesService.findByLocation(city, state);
  }

  @ApiOperation({ summary: 'Update property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: Property })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @ApiOperation({ summary: 'Delete property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.remove(id);
  }
}

@ApiTags('properties')
@Controller('portfolios/:portfolioId/properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Create a new property for a portfolio' })
  @ApiResponse({ status: 201, description: 'Property created successfully', type: Property })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ) {
    // Extract user ID from JWT token payload
    const accessToken = req.cookies?.access_token || req.signedCookies?.access_token;
    
    const payload = this.jwtService.verify<AccessTokenPayload>(
      accessToken,
      { secret: this.configService.get<string>('JWT_ACCESS_SECRET') }
    );
    
    const userId = parseInt(payload.sub, 10);
    
    return await this.propertiesService.create({ ...createPropertyDto, portfolio_id: portfolioId }, userId);
  }

  @ApiOperation({ summary: 'Get all properties for a portfolio (paginated + search)' })
  @ApiResponse({ status: 200, description: 'Portfolio properties retrieved successfully', type: PaginatedPropertiesResponseDto })
  @Get()
  findByPortfolio(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Query() query: FindPropertiesDto) {
    return this.propertiesService.findByPortfolio(portfolioId, query);
  }
} 