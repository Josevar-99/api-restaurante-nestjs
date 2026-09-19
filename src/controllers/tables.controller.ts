// src/controllers/tables.controller.ts
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TablesService } from '../services/tables.service.js';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';
import { createTableSchema, type CreateTableDto } from '../dtos/create-table.dto.js';
import { updateTableSchema, type UpdateTableDto } from '../dtos/update-table.dto.js';
import { updateTableStatusSchema, type UpdateTableStatusDto } from '../dtos/update-table-status.dto.js';
import { filterTablesSchema, type FilterTablesDto } from '../dtos/filter-tables.dto.js';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
    constructor(@Inject(TablesService) private readonly service: TablesService) { }

    @Post()
    create(@Body(new ZodValidationPipe(createTableSchema)) dto: CreateTableDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query(new ZodValidationPipe(filterTablesSchema)) f: FilterTablesDto) {
        return this.service.findAll(f);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body(new ZodValidationPipe(updateTableSchema)) dto: UpdateTableDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body(new ZodValidationPipe(updateTableStatusSchema)) dto: UpdateTableStatusDto) {
        return this.service.updateStatus(id, dto.status);
    }
}