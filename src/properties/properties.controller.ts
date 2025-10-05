import { 
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
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
import { Logger } from '@nestjs/common';

@ApiTags('properties')
@Controller('properties')
export class PropertiesGlobalController {
  private readonly logger = new Logger(PropertiesGlobalController.name);

  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('PropertiesGlobalController initialized');
  }

  @ApiResponse({ status: 200, description: 'Properties retrieved successfully', type: PaginatedPropertiesResponseDto })
  @ApiOperation({ summary: 'Get all properties (paginated + search)' })
  findAll(@Query() query: FindPropertiesDto) {
    return this.propertiesService.findAll(query);
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

    @ApiOperation({ 
    summary: 'Update a property (PATCH)',
    description: 'Update a property. This endpoint supports both full and partial updates. Only the fields provided in the request body will be updated.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the property to update',
    example: '28f06083-28db-4f0c-ad3c-871e3ae99be1'
  })
  @ApiBody({
    type: UpdatePropertyDto,
    description: 'The property data to update. Only include the fields you want to update.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property updated successfully', 
    type: Property 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  @ApiOperation({ 
    summary: 'Update a property',
    description: 'Update a property. This endpoint supports both full and partial updates. Only the fields provided in the request body will be updated.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the property to update',
    example: '28f06083-28db-4f0c-ad3c-871e3ae99be1'
  })
  @ApiBody({
    type: UpdatePropertyDto,
    description: 'The property data to update. Only include the fields you want to update.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property updated successfully', 
    type: Property 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    this.logger.log(`PATCH /properties/${id} called`);
    try {
      const result = await this.propertiesService.update(id, updatePropertyDto);
      this.logger.log(`PATCH /properties/${id} completed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`PATCH /properties/${id} failed: ${error.message}`, error.stack);
      throw error;
    }
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