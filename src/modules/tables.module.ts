import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableEntity } from '../entities/table.entity.js';
import { TablesController } from '../controllers/tables.controller.js';
import { TablesService } from '../services/tables.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([TableEntity])],
    controllers: [TablesController],
    providers: [TablesService],
    exports: [TablesService], 
})
export class TablesModule {}
