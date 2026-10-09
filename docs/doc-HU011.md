# HU 11: Confirmar una reserva

**Épica:** Gestión de Reservas · **Sprint:** 2 · **Prioridad:** Alta · **Story Points:** 8
**Dependencias:** HU-007 (Registro de Reserva), HU-008 (Consulta de Reserva)

> Como personal autorizado del restaurante, quiero confirmar una reserva pendiente, para indicar que ha sido validada y será atendida por el restaurante.

## Resumen

Se agregó el endpoint `PATCH /api/v1/reservations/{id}/confirm`, que cambia el estado de una reserva de `PENDING` a `CONFIRMED` y registra el momento exacto de la confirmación en un nuevo campo, `confirmedAt`. La mesa asignada no se modifica y la reserva sigue bloqueando el horario.

Además, esta entrega incluye unos ajustes pequeños a la HU 10 (cancelar reserva), descritos al final en la sección **Ajustes realizados a la HU 10**.

## Endpoint

| | |
|---|---|
| **Método y ruta** | `PATCH /api/v1/reservations/{id}/confirm` |
| **Parámetro de ruta** | `id`: UUID de la reserva |
| **Cuerpo** | Ninguno |
| **Respuesta exitosa** | `200 OK` con la reserva actualizada (`status: CONFIRMED`, `confirmedAt` con la fecha y hora) |

### Respuestas posibles

| Código | Cuándo ocurre | Excepción | Dónde se origina |
|---|---|---|---|
| **200** | La reserva estaba en `PENDING` | ninguna | `ReservationsService.confirmReservation` |
| **400** | El `id` no tiene formato de UUID | (la lanza el pipe) | `ParseUUIDPipe` en el controller |
| **404** | No existe una reserva con ese `id` (RN-065) | `NotFoundException` | `ReservationsService.findOne` |
| **409** | La reserva no está en `PENDING` (RN-066, RN-067) | `ConflictException` | `ReservationsService.confirmReservation` |

## Comportamiento según el estado actual

| Estado de la reserva | Resultado |
|---|---|
| `PENDING` | Se confirma (200) |
| `CONFIRMED` | 409, no se modifica nada ni se sobrescribe `confirmedAt` |
| `CANCELLED` | 409 |
| `CHECKED_IN` | 409 |
| `NO_SHOW` | 409 |
| `COMPLETED` | 409 |

## Cambios por archivo

### `entities/reservation.entity.ts`
- Nuevo campo `confirmedAt`: columna normal (`timestamptz`, acepta nulos, tipo `Date | null`), con `@ApiProperty` para Swagger. Es `null` mientras la reserva no se confirma.
- Se usa `@Column`, no un decorador que se llene automáticamente, porque la fecha la asigna el service en el momento exacto de la confirmación.

### `reservations.service.ts`
- Nuevo método `confirmReservation(id)`:
  1. Busca la reserva con `this.findOne(id)`, que lanza `NotFoundException` si no existe.
  2. Si el estado es `CANCELLED`, `CHECKED_IN`, `NO_SHOW`, `COMPLETED` o `CONFIRMED`, lanza `ConflictException`.
  3. En cualquier otro caso (`PENDING`) asigna `status = CONFIRMED` y `confirmedAt = new Date()`, y guarda ambos cambios en la misma operación.

### `reservations.controller.ts`
- Nuevo handler `PATCH :id/confirm`, con `ParseUUIDPipe` para validar el `id`, sin cuerpo, y con la documentación de Swagger de las cuatro respuestas (200, 400, 404, 409).

## Reglas de negocio cubiertas

| Regla | Descripción | Cómo se cumple |
|---|---|---|
| RN-065 | La reserva debe existir | `NotFoundException` (404) |
| RN-066 | Solo se confirma desde `PENDING` | Cualquier otro estado, incluido `CONFIRMED`, lanza `ConflictException` (409) |
| RN-067 | Rechazar `CANCELLED`, `CHECKED_IN`, `NO_SHOW` y `COMPLETED` | `ConflictException` (409) |
| RN-068 | La mesa se conserva y sigue bloqueando el horario | El método no modifica `tableId`; `CONFIRMED` está en `BLOCKING_RESERVATION_STATUSES` (verificado leyendo el código) |
| RN-069 | Se guarda fecha y hora exactas de la confirmación | Campo `confirmedAt` |

## Base de datos

- Nueva columna `confirmedAt` en la tabla `reservations`.
- El proyecto no usa migraciones, por lo que no se agregó ninguna.

## Fuera de alcance

- Guard de autorización por rol (marcado como opcional en la HU): no se implementó. Pendiente de confirmar si el proyecto ya cuenta con autenticación y roles.

---

## Ajustes realizados a la HU 10 (cancelar reserva)

Al implementar la HU 11 se hicieron dos cambios pequeños en `cancelReservation`. Son un refactor: no cambian los códigos HTTP ni las reglas de la HU 10.

### 1. Se reutiliza `this.findOne(id)` en lugar de repetir la búsqueda

- **Qué se hizo:** se quitó la consulta con `findOneBy({ id })` y el `if (!reservation) throw new NotFoundException(...)` que `cancelReservation` tenía escritos por su cuenta, y se reemplazaron por una llamada a `this.findOne(id)`. Se aplicó el mismo criterio en `confirmReservation`.
- **Por qué:** `findOne` ya hacía exactamente eso (buscar la reserva y lanzar el 404 si no existe), y `update` y `updateStatus` ya lo usaban. Mantener la misma lógica copiada en varios métodos obliga a modificarla en todos si algún día cambia, por ejemplo el mensaje de error. Con este cambio la lógica queda en un solo lugar.
- **Efecto:** ninguno visible. El 404 sigue siendo `NotFoundException` con el mismo mensaje.

### 2. Se unificó la validación de estados en un solo `if`

- **Qué se hizo:** el `if` que rechazaba el estado `CANCELLED` se fusionó con el que rechazaba `COMPLETED`, `CHECKED_IN` y `NO_SHOW`. Ahora hay una única condición con los cuatro estados.
- **Por qué:** los dos casos terminaban en el mismo resultado (`ConflictException`, 409), por lo que tener dos bloques era código de más.
- **Efecto visible:** el texto del mensaje del 409 para una reserva ya cancelada ahora es el mismo que el de los otros estados (`... cannot be cancelled as it is already CANCELLED`). El código HTTP y la excepción siguen igual.

### Verificación de la HU 10 tras el refactor

Se incluyen casos de regresión en la sección de pruebas (12 a 14).

---

## Cómo probar

Requisitos: base de datos PostgreSQL en marcha, servidor corriendo y al menos una mesa creada. Usa fechas futuras al crear reservas.

### HU 11: confirmar

| # | Caso | Esperado | Resultado |
|---|---|---|---|
| 1 | Confirmar una reserva `PENDING` | 200, `CONFIRMED`, `confirmedAt` con fecha | ✅ completo |
| 2 | Confirmar otra vez la misma reserva | 409, `confirmedAt` no cambia | ✅ completo |
| 3 | Confirmar una reserva `CANCELLED` | 409 | ✅ completo |
| 4 | Confirmar una reserva `CHECKED_IN` | 409 | ✅ completo |
| 5 | Confirmar una reserva `NO_SHOW` | 409 | ✅ completo |
| 6 | Confirmar una reserva `COMPLETED` | 409 | ✅ completo |
| 7 | UUID válido que no existe | 404 | ✅ completo |
| 8 | Id que no es UUID (`abc`) | 400 | ✅ completo |
| 9 | Revisar en la base de datos | `confirmedAt` con la hora y `tableId` sin cambios | ✅ completo |
| 10 | Revisar una reserva nunca confirmada | `confirmedAt` es `null` | ✅ completo |
| 11 | Disponibilidad del mismo horario tras confirmar | La mesa sigue ocupada | ✅ completo |

### HU 10: regresión tras el refactor

| # | Caso | Esperado | Resultado |
|---|---|---|---|
| 12 | Cancelar una reserva `PENDING` o `CONFIRMED` | 200, `CANCELLED`, `cancelledAt` con fecha | ✅ completo |
| 13 | Cancelar una `CANCELLED`, `CHECKED_IN`, `COMPLETED` o `NO_SHOW` | 409 | ✅ completo |
| 14 | UUID válido que no existe | 404, mensaje igual que antes del refactor | ✅ completo |

### Swagger

- Los dos endpoints (`/cancel` y `/confirm`) aparecen con sus cuatro respuestas. ✅ completo
- Verificar qué tipo muestra Swagger para `cancelledAt` y `confirmedAt` en el esquema de `Reservation`, ya que son `Date | null`. ✅ completo

---

## Observaciones para el equipo

- `PATCH /reservations/{id}/status` permite pasar una reserva a `CONFIRMED` o `CANCELLED`, pero **no registra `confirmedAt` ni `cancelledAt`**, y si el estado ya era el mismo responde 200 en lugar de 409. Conviene decidir si esa ruta delega en los métodos nuevos o deja de aceptar esos destinos.
- La HU 11 menciona "antes de ejecutar la transacción". Hay que confirmar si se refiere a una transacción de base de datos o simplemente a la operación. Hoy el método no usa transacción: lee la reserva y luego guarda, por lo que dos peticiones simultáneas sobre la misma reserva (por ejemplo, confirmar y cancelar a la vez) podrían pisarse.
- La validación de `confirmReservation` enumera los estados rechazados. Si se agregan estados nuevos al enum, hay que revisarla, porque un estado no listado quedaría permitido.
- Los `ConflictException` se lanzan con un objeto (`error`, `from`), por lo que su cuerpo no incluye `statusCode` ni `message`, a diferencia de `NotFoundException`. Es la misma convención que ya usa `updateStatus`.