import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiParam, // <-- 1. Importa ApiParam aquí
} from '@nestjs/swagger';
import { TablesService } from './tables.service.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';
import { UpdateTableStatusDto } from './dto/update-table-status.dto.js';
import { FilterTablesDto } from './dto/filter-tables.dto.js';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(@Inject(TablesService) private readonly service: TablesService) {}

  @ApiOperation({
    summary: 'Register a reservation / Create table',
    description:
      'Creates a reservation for a future date and time, assigns the best ' +
      'available operational table that seats the party, and stores it with ' +
      'status PENDING. Rejects past date/time (RN-042), party sizes below one ' +
      '(RN-043), missing capacity (RN-044), schedule conflicts (RN-045) and ' +
      'out of service tables (RN-047).',
  })
  @ApiCreatedResponse({
    description: 'Table was created correctly.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, failed validation rules (RN-042, RN-043, etc.).',
  })
  @ApiConflictResponse({
    description: 'No table is available for the requested party and slot (RN-045).',
  })
  @Post()
  
  create(@Body() dto: CreateTableDto) {
    return this.service.create(dto);
  }

  @ApiOperation({
    summary: 'Get all tables',
    description: 'Retrieves a list of tables matching the specified filter criteria.',
  })
  @ApiOkResponse({
    description: 'List of tables retrieved successfully.',
  })
  @Get()
  findAll(@Query() filters: FilterTablesDto) {
    return this.service.findAll(filters);
  }

  @ApiOperation({
    summary: 'Get a table by ID',
    description: 'Retrieval details of a specific table using its unique identifier.',
  })
  @ApiOkResponse({
    description: 'Table found and returned successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Table with the specified ID was not found.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the table',
    type: String,
    example: "31d85014-5c67-426c-8352-1766204cbf0c",
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(String(id));
  }

  @ApiOperation({
    summary: 'Update a table',
    description: 'Updates the information of an existing table by its ID.',
  })
  @ApiOkResponse({
    description: 'Table updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid update payload provided.',
  })
  @ApiNotFoundResponse({
    description: 'Table with the specified ID was not found.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the table to update',
    type: String,
    example: "31d85014-5c67-426c-8352-1766204cbf0c",
  })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.service.update(String(id), dto);
  }

  @ApiOperation({
    summary: 'Update table status',
    description: 'Updates specifically the operational status of a table (e.g., active, out of service).',
  })
  @ApiOkResponse({
    description: 'Table status updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid status provided.',
  })
  @ApiNotFoundResponse({
    description: 'Table with the specified ID was not found.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the table to change its status',
    type: String,
    example: "31d85014-5c67-426c-8352-1766204cbf0c",
  })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableStatusDto,
  ) {
    return this.service.updateStatus(String(id), dto.status);
  }
}