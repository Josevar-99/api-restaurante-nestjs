import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TablesService } from '../services/tables.service.js';
import { CreateTableDto } from '../dtos/create-table.dto.js';
import { UpdateTableDto } from '../dtos/update-table.dto.js';
import { UpdateTableStatusDto } from '../dtos/update-table-status.dto.js';
import { FilterTablesDto } from '../dtos/filter-tables.dto.js';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
    constructor(@Inject(TablesService) private readonly service: TablesService) { }

    @Post()
    create(@Body() dto: CreateTableDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query() filters: FilterTablesDto) {
        return this.service.findAll(filters);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableStatusDto) {
        return this.service.updateStatus(id, dto.status);
    }
}