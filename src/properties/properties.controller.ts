import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiCookieAuth, 
  ApiBody 
} from '@nestjs/swagger';
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
  findAll(@Query() query: FindPropertiesDto) {
    return this.propertiesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a single property by ID' })
  @ApiResponse({ status: 200, description: 'Property found', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @ApiOperation({ summary: 'Search properties by location' })
  @ApiQuery({ name: 'city', description: 'City name', required: false })
  @ApiQuery({ name: 'state', description: 'State code', required: false })
  @Get('search/location')
  async findByLocation(
    @Query('city') city?: string,
    @Query('state') state?: string
  ) {
    return this.propertiesService.findByLocation(city, state);
  }

  @ApiOperation({ summary: 'Update a property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}

@ApiTags('portfolio-properties')
@Controller('portfolios/:portfolioId/properties')
@ApiCookieAuth()
@UseGuards(AuthGuard, PortfolioScopeGuard)
@ApiParam({ name: 'portfolioId', description: 'ID of the portfolio', type: String })
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ 
    summary: 'Create a new property for a portfolio',
    description: 'Creates a new property within the specified portfolio. Requires authentication and portfolio access.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Property created successfully', 
    type: Property 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - authentication required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  @ApiBody({ 
    type: CreatePropertyDto,
    description: 'Property details',
    examples: {
      basic: {
        summary: 'Basic property creation',
        value: {
          name: 'Sunny Apartments',
          property_type: 'apartment',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA'
        }
      }
    }
  })
  @Post()
  async create(
    @Param('portfolioId') portfolioId: string,
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ) {
    // Extract user ID from JWT token payload
    const accessToken = req.cookies?.access_token || req.signedCookies?.access_token;
    
    const payload = this.jwtService.verify<AccessTokenPayload>(
      accessToken,
      { secret: this.configService.get<string>('JWT_ACCESS_SECRET') }
    );
    
    const userId = payload.sub; // Keep as string to match service expectations
    
    return await this.propertiesService.create({ ...createPropertyDto, portfolio_id: portfolioId }, userId);
  }

  @ApiOperation({ 
    summary: 'Get all properties for a portfolio', 
    description: 'Retrieves a paginated list of properties for the specified portfolio with optional search and filtering.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Portfolio properties retrieved successfully', 
    type: PaginatedPropertiesResponseDto 
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  @ApiParam({
    name: 'portfolioId',
    description: 'ID of the portfolio to get properties for',
    type: String
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10
  })
  @Get()
  findByPortfolio(
    @Param('portfolioId') portfolioId: string, 
    @Query() query: FindPropertiesDto
  ) {
    return this.propertiesService.findByPortfolio(portfolioId, query);
  }
} 