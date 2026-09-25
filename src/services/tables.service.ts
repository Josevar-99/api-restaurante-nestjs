import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { TableEntity } from '../entities/table.entity.js';
import type { CreateTableDto } from '../dtos/create-table.dto.js';
import type { UpdateTableDto } from '../dtos/update-table.dto.js';
import type { FilterTablesDto } from '../dtos/filter-tables.dto.js';
import type { TableStatus } from '../constants/table.constants.js';

@Injectable()
export class TablesService {
    constructor(@InjectRepository(TableEntity) private readonly repo: Repository<TableEntity>) { }

    async create(dto: CreateTableDto) {
        await this.assertNumberFree(dto.tableNumber);
        return this.repo.save(this.repo.create({ ...dto, status: 'AVAILABLE' }));
    }

    findAll(f: FilterTablesDto = {}) {
        const where: FindOptionsWhere<TableEntity> = {};
        if (f.status) where.status = f.status;
        if (f.zone) where.zone = f.zone;
        if (f.capacity) where.capacity = MoreThanOrEqual(f.capacity);
        return this.repo.find({ where, order: { tableNumber: 'ASC' } });
    }

    async findOne(id: number) {
        const t = await this.repo.findOneBy({ id });
        if (!t) throw new NotFoundException(`Mesa ${id} no encontrada`);
        return t;
    }

    async update(id: number, dto: UpdateTableDto) {
        const t = await this.findOne(id);
        if (dto.tableNumber !== undefined && dto.tableNumber !== t.tableNumber) {
            await this.assertNumberFree(dto.tableNumber);
        }
        return this.repo.save(Object.assign(t, dto));
    }

    async updateStatus(id: number, status: TableStatus) {
        const t = await this.findOne(id);
        t.status = status;
        return this.repo.save(t);
    }

    async assertTableIsUsable(id: number) {
        const t = await this.findOne(id);
        if (t.status === 'OUT_OF_SERVICE') {
            throw new ConflictException(`Mesa ${t.tableNumber} fuera de servicio`);
        }
        return t;
    }

    private async assertNumberFree(tableNumber: number) {
        if (await this.repo.existsBy({ tableNumber })) {
            throw new ConflictException(`Ya existe la mesa ${tableNumber}`);
        }
    }
}