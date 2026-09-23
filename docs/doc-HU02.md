# Gestión de Mesas (HU-002)

Módulo de administración de mesas del restaurante. Permite crear, consultar, actualizar y controlar el estado de las mesas para gestionar su disponibilidad en reservas y pedidos.

## Épica
**Gestión Operativa**
Como administrador del restaurante, quiero registrar y administrar las mesas disponibles, para controlar la capacidad y disponibilidad del restaurante para reservas y pedidos.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/tables` | Crea una mesa. Siempre inicia en estado `AVAILABLE`. |
| GET | `/api/v1/tables` | Lista mesas. Admite filtros por `status`, `zone` y `capacity` (capacidad mínima). |
| GET | `/api/v1/tables/:id` | Obtiene una mesa por id. |
| PATCH | `/api/v1/tables/:id` | Actualiza número, capacidad o zona. No permite cambiar `status`. |
| PATCH | `/api/v1/tables/:id/status` | Cambia el estado de la mesa (`AVAILABLE`, `OCCUPIED`, `OUT_OF_SERVICE`). |

## Reglas de negocio
- El número de mesa es único y positivo.
- La capacidad debe ser mayor a 0.
- La zona debe ser una de las zonas válidas (`TABLE_ZONES`).
- El estado debe ser uno de los estados válidos (`TABLE_STATUSES`).
- Toda mesa nueva se crea en estado `AVAILABLE`, sin importar lo que se envíe en el body.
- Una mesa en estado `OUT_OF_SERVICE` bloquea su uso en reservas y pedidos (método `assertTableIsUsable` en el service, expuesto para que otros módulos lo consuman).

## Validaciones
Se usa `class-validator` con el `ValidationPipe` global de Nest (`whitelist`, `forbidNonWhitelisted`, `transform`). La zona y el estado se aceptan en mayúsculas o minúsculas: se normalizan a mayúsculas antes de validarse (`@Transform`).

## Estructura de archivos

- src/
  - constants/table.constants.ts — Estados y zonas válidas
  - entities/table.entity.ts — Entidad TypeORM
  - dtos/
    - create-table.dto.ts
    - update-table.dto.ts
    - update-table-status.dto.ts
    - filter-tables.dto.ts
  - services/tables.service.ts — Reglas de negocio
  - controllers/tables.controller.ts — Endpoints
  - modules/tables.module.ts
- test/
  - tables.service.spec.ts — Pruebas unitarias del service
  - tables.dto.spec.ts — Pruebas unitarias de las validaciones

## Persistencia
Las mesas se guardan en PostgreSQL mediante TypeORM (tabla `tables`), con `tableNumber` único a nivel de base de datos.

## Pruebas

### Pruebas unitarias
Se probaron el `TablesService` (con un repositorio falso, sin base de datos) y las validaciones de los DTOs (con `class-validator`).

`test/tables.service.spec.ts` cubre:
- La mesa nueva siempre se crea en estado `AVAILABLE`.
- Rechazo de número de mesa repetido (`ConflictException`).
- `findOne` lanza `NotFoundException` si la mesa no existe.
- Los filtros de `findAll` (estado, zona, capacidad mínima) se arman correctamente, incluyendo el caso sin filtros.
- `update` valida duplicado solo cuando cambia el número de mesa, y no consulta duplicados si no cambia.
- `updateStatus` cambia el estado de la mesa.
- Una mesa `OUT_OF_SERVICE` bloquea su uso (`assertTableIsUsable`), y una `AVAILABLE` sí puede usarse.

`test/tables.dto.spec.ts` cubre:
- Aceptación de datos válidos.
- Rechazo de número de mesa no entero, cero o negativo.
- Rechazo de capacidad cero o negativa.
- Rechazo de zona y estado inválidos.
- Aceptación de zona en minúsculas, normalizada automáticamente a mayúsculas.
- Manejo correcto cuando `zone` o `status` llegan con un tipo distinto a string (rama alternativa del `@Transform`).

Ejecutar:

```bash
npm test
```

Ejecutar con reporte de cobertura:

```bash
npm run test:cov
```

### Captura de prueba unitaria
![alt text](image.png)

## Cómo probar manualmente
1. Levantar el proyecto (`npm run start:dev` o vía Docker).
2. Probar los endpoints con Thunder Client, Postman o curl, con el prefijo `/api/v1`.

Ejemplo de creación:

```bash
curl -X POST http://localhost:3000/api/v1/tables \
  -H "Content-Type: application/json" \
  -d '{"tableNumber": 1, "capacity": 4, "zone": "INDOOR"}'
```



## Autor
```
Dilant Murillo
```