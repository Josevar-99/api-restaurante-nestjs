# HU: Cancelar una reserva

**Épica:** Gestión de Reservas · **Sprint:** 2 · **Prioridad:** Muy Alta · **Story Points:** 8
**Dependencias:** HU-007 (Registro de Reserva), HU-008 (Consulta de Reserva)

> Como cliente del restaurante, quiero cancelar una reserva existente, para liberar la mesa cuando ya no pueda asistir.

## Resumen

Se agregó el endpoint `PATCH /api/v1/reservations/{id}/cancel`, que cambia el estado de una reserva a `CANCELLED` y registra el momento exacto de la cancelación en un nuevo campo, `cancelledAt`. La reserva **no se elimina**: queda disponible como historial. Al dejar de estar en un estado que bloquea mesa, la mesa vuelve a estar disponible para ese horario.

## Endpoint

| | |
|---|---|
| **Método y ruta** | `PATCH /api/v1/reservations/{id}/cancel` |
| **Parámetro de ruta** | `id`: UUID de la reserva |
| **Cuerpo** | Ninguno |
| **Respuesta exitosa** | `200 OK` con la reserva actualizada (`status: CANCELLED`, `cancelledAt` con la fecha y hora) |

### Respuestas posibles

| Código | Cuándo ocurre | Excepción | Dónde se origina |
|---|---|---|---|
| **200** | La reserva estaba en `PENDING` o `CONFIRMED` | ninguna | `ReservationsService.cancelReservation` |
| **400** | El `id` no tiene formato de UUID | (la lanza el pipe) | `ParseUUIDPipe` en el controller |
| **404** | No existe una reserva con ese `id` (RN-059) | `NotFoundException` | `ReservationsService` |
| **409** | La reserva ya estaba `CANCELLED` (RN-060) | `ConflictException` | `ReservationsService` |
| **409** | La reserva está `CHECKED_IN`, `COMPLETED` o `NO_SHOW` (RN-061) | `ConflictException` | `ReservationsService` |

## Comportamiento según el estado actual

| Estado de la reserva | Resultado |
|---|---|
| `PENDING` | Se cancela (200) |
| `CONFIRMED` | Se cancela (200) |
| `CANCELLED` | 409, no se modifica nada |
| `CHECKED_IN` | 409 |
| `COMPLETED` | 409 |
| `NO_SHOW` | 409 |

El estado `NO_SHOW` tiene su propia HU: aquí solo se rechaza la cancelación desde ese estado, no se modifica su lógica.

## Cambios por archivo

### `entities/reservation.entity.ts`
- Nuevo campo `cancelledAt`: columna normal (`timestamptz`, acepta nulos). Es `null` mientras la reserva no se cancela.
- Importante: se usa `@Column` y **no** `@UpdateDateColumn` ni `@DeleteDateColumn`, porque estos se llenan o esconden registros automáticamente y romperían el historial (RN-062).

### `reservations.service.ts`
- Nuevo método `cancelReservation(id)`:
  1. Busca la reserva; si no existe, `NotFoundException`.
  2. Si ya está `CANCELLED`, `ConflictException`.
  3. Si está `COMPLETED`, `CHECKED_IN` o `NO_SHOW`, `ConflictException`.
  4. En cualquier otro caso (`PENDING` o `CONFIRMED`) asigna `status = CANCELLED` y `cancelledAt = new Date()` y guarda ambos cambios en la misma operación.

### `reservations.controller.ts`
- Nuevo handler `PATCH :id/cancel`, con `ParseUUIDPipe` para validar el `id`, sin cuerpo, y con la documentación de Swagger de las cuatro respuestas (200, 400, 404, 409).

## Disponibilidad de la mesa (RN-063)

No fue necesario modificar `table-availability.service.ts`. La búsqueda de conflictos de horario solo considera las reservas cuyo estado está en `BLOCKING_RESERVATION_STATUSES` (`PENDING`, `CONFIRMED`, `CHECKED_IN`). Como `CANCELLED` no está en esa lista, una reserva cancelada deja de bloquear la mesa en cuanto cambia su estado.

## Reglas de negocio cubiertas

| Regla | Descripción | Cómo se cumple |
|---|---|---|
| RN-059 | La reserva debe existir | `NotFoundException` (404) |
| RN-060 | No cancelar una reserva ya cancelada | `ConflictException` (409) |
| RN-061 | No cancelar si está en curso o finalizada | `ConflictException` (409) |
| RN-062 | La reserva no se elimina físicamente | Solo cambia el estado; sigue consultable |
| RN-063 | La mesa vuelve a estar disponible | Verificado en `table-availability.service.ts` |
| RN-064 | Se guarda fecha y hora exactas de la cancelación | Campo `cancelledAt` |

## Base de datos

- Nueva columna `cancelledAt` en la tabla `reservations`.
- El proyecto no usa migraciones, por lo que no se agregó ninguna.

## Cómo probar

Requisitos: base de datos PostgreSQL en marcha, servidor corriendo y al menos una mesa creada. Usa fechas futuras al crear reservas.

| # | Caso | Esperado | Resultado |
|---|---|---|---|
| 1 | Cancelar una reserva `PENDING` | 200, `CANCELLED`, `cancelledAt` con fecha | ✅ completo |
| 2 | Cancelar una reserva `CONFIRMED` | 200, igual | ✅ completo |
| 3 | Cancelar de nuevo una ya cancelada | 409, `cancelledAt` no cambia | ✅ completo |
| 4 | Cancelar una reserva `CHECKED_IN` | 409 | ✅ completo |
| 5 | Cancelar una reserva `COMPLETED` | 409 | ✅ completo |
| 6 | UUID válido que no existe | 404 | ✅ completo |
| 7 | Id que no es UUID (`abc`) | 400 |  ✅ completo |
| 8 | GET de una reserva cancelada | 200, sigue existiendo | ✅ completo |
| 9 | Revisar la fila en la base de datos | Existe, `cancelledAt` con la hora | ✅ completo |
| 10 | Revisar una reserva nunca cancelada | `cancelledAt` es `null` | ✅ completo |
| 11 | Disponibilidad antes y después de cancelar el mismo horario (con una sola mesa candidata) | Antes: no disponible. Después: disponible | ✅ completo |

## Observaciones para el equipo

- `PATCH /reservations/{id}/status` permite pasar una reserva a `CANCELLED`, pero **no registra `cancelledAt`** y, si la reserva ya estaba cancelada, responde 200 en lugar del 409 que pide RN-060. Conviene decidir si esa ruta delega en `cancelReservation` o si deja de aceptar ese destino.
- Los `ConflictException` se lanzan con un objeto (`error`, `from`), por lo que su cuerpo no incluye `statusCode` ni `message`, a diferencia de `NotFoundException`. Es la misma convención que ya usa `updateStatus`.
- El método valida los estados de forma explícita; si se agregan estados nuevos al enum, hay que revisarlo, porque cualquier estado no listado como rechazado se cancelaría.