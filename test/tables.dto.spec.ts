import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTableDto } from '../src/dtos/create-table.dto.js';
import { UpdateTableStatusDto } from '../src/dtos/update-table-status.dto.js';

// Con class-validator se arma una instancia real de la clase (plainToInstance)
// y se llama a validate(); un array vacío significa que no hubo errores.
describe('Validaciones de mesas (class-validator)', () => {
    const valid = { tableNumber: 1, capacity: 4, zone: 'INDOOR' };

    it('acepta datos válidos', async () => {
        const dto = plainToInstance(CreateTableDto, valid);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it.each([0, -3, 1.5])('rechaza número de mesa %s', async (tableNumber) => {
        const dto = plainToInstance(CreateTableDto, { ...valid, tableNumber });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it.each([0, -1])('rechaza capacidad %s', async (capacity) => {
        const dto = plainToInstance(CreateTableDto, { ...valid, capacity });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rechaza zona inválida', async () => {
        const dto = plainToInstance(CreateTableDto, { ...valid, zone: 'MARS' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('acepta zona en minúsculas (se transforma a mayúsculas)', async () => {
        const dto = plainToInstance(CreateTableDto, { ...valid, zone: 'indoor' });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.zone).toBe('INDOOR');
    });

    it('rechaza estado inválido', async () => {
        const dto = plainToInstance(UpdateTableStatusDto, { status: 'BROKEN' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('acepta estado válido', async () => {
        const dto = plainToInstance(UpdateTableStatusDto, { status: 'OUT_OF_SERVICE' });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('no revienta si zone no es string (rama del Transform)', async () => {
        const dto = plainToInstance(CreateTableDto, { tableNumber: 1, capacity: 4, zone: 123 });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('no revienta si status no es string (rama del Transform)', async () => {
        const dto = plainToInstance(UpdateTableStatusDto, { status: 123 });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});