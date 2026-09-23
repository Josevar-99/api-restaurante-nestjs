import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { TablesService } from '../src/services/tables.service.js';
import type { TableEntity } from '../src/entities/table.entity.js';

// Forma del filtro que arma el service, solo para tipar el mock de find
interface TableWhere {
    status?: string;
    zone?: string;
    capacity?: object; // MoreThanOrEqual devuelve un objeto especial de TypeORM
}

// Repositorio falso: pruebas unitarias sin base de datos
const makeRepo = () => ({
    create: vi.fn((d) => d),
    save: vi.fn(async (d) => ({ id: 1, ...d })),
    find: vi.fn(async (_options?: { where?: TableWhere }) => [] as TableEntity[]),
    findOneBy: vi.fn(),
    existsBy: vi.fn(async () => false),
});

describe('TablesService', () => {
    let repo: ReturnType<typeof makeRepo>;
    let service: TablesService;

    beforeEach(() => {
        repo = makeRepo();
        service = new TablesService(repo as unknown as Repository<TableEntity>);
    });

    it('crea la mesa en AVAILABLE', async () => {
        const r = await service.create({ tableNumber: 1, capacity: 4, zone: 'INDOOR' });
        expect(r.status).toBe('AVAILABLE');
    });

    it('rechaza número repetido', async () => {
        repo.existsBy.mockResolvedValue(true);
        await expect(service.create({ tableNumber: 1, capacity: 4, zone: 'INDOOR' })).rejects.toThrow(ConflictException);
    });

    it('findOne lanza 404 si no existe', async () => {
        repo.findOneBy.mockResolvedValue(null);
        await expect(service.findOne(9)).rejects.toThrow(NotFoundException);
    });

    it('aplica filtros de estado, zona y capacidad mínima', async () => {
        await service.findAll({ status: 'AVAILABLE', zone: 'VIP', capacity: 4 });
        const arg = repo.find.mock.calls[0][0];
        expect(arg?.where?.status).toBe('AVAILABLE');
        expect(arg?.where?.zone).toBe('VIP');
        expect(arg?.where?.capacity).toBeDefined();
    });

    it('update rechaza un número que ya usa otra mesa', async () => {
        repo.findOneBy.mockResolvedValue({ id: 1, tableNumber: 1, capacity: 2, zone: 'BAR', status: 'AVAILABLE' });
        repo.existsBy.mockResolvedValue(true);
        await expect(service.update(1, { tableNumber: 5 })).rejects.toThrow(ConflictException);
    });

    it('updateStatus cambia el estado', async () => {
        repo.findOneBy.mockResolvedValue({ id: 1, tableNumber: 1, status: 'AVAILABLE' });
        const r = await service.updateStatus(1, 'OCCUPIED');
        expect(r.status).toBe('OCCUPIED');
    });

    it('una mesa OUT_OF_SERVICE bloquea reservas/pedidos', async () => {
        repo.findOneBy.mockResolvedValue({ id: 1, tableNumber: 3, status: 'OUT_OF_SERVICE' });
        await expect(service.assertTableIsUsable(1)).rejects.toThrow(ConflictException);
    });

    it('una mesa AVAILABLE sí puede usarse', async () => {
        repo.findOneBy.mockResolvedValue({ id: 1, tableNumber: 3, status: 'AVAILABLE' });
        await expect(service.assertTableIsUsable(1)).resolves.toBeDefined();
    });

    it('findAll sin filtros no agrega condiciones al where', async () => {
        await service.findAll();
        const arg = repo.find.mock.calls[0][0];
        expect(arg?.where).toEqual({});
    });

    it('update sin cambiar tableNumber no revisa duplicados', async () => {
        repo.findOneBy.mockResolvedValue({ id: 1, tableNumber: 1, capacity: 4, zone: 'BAR', status: 'AVAILABLE' });
        await service.update(1, { capacity: 6 });
        expect(repo.existsBy).not.toHaveBeenCalled();
    });
});