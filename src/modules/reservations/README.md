# Reservations Module — HU-007 (Reservation Registration)

> Epic: Reservations Management · Sprint 2 · Priority: Critical · Story Points: 13
> Dependencies: HU-002 (Table Administration), HU-006 (Table Availability Query)

As a restaurant customer, I want to register a reservation for a specific date
and time so that I can secure an available table before coming to the
restaurant.

This module implements the reservation registration flow described in HU-007.
It lives entirely in `src/modules/reservations` and **does not modify any other
module**.

---

## Table of contents

- [Scope](#scope)
- [Business rules](#business-rules)
- [API](#api)
  - [POST /api/v1/reservations](#post-apiv1reservations)
  - [GET /api/v1/reservations](#get-apiv1reservations)
  - [GET /api/v1/reservations/availability](#get-apiv1reservationsavailability)
  - [GET /api/v1/reservations/:id](#get-apiv1reservationsid)
  - [PATCH /api/v1/reservations/:id](#patch-apiv1reservationsid)
  - [PATCH /api/v1/reservations/:id/status](#patch-apiv1reservationsidstatus)
- [Reservation states](#reservation-states)
- [How table assignment works](#how-table-assignment-works)
- [Concurrency and double booking](#concurrency-and-double-booking)
- [Data model](#data-model)
- [Validation rules](#validation-rules)
- [Project layout](#project-layout)
- [Running the tests](#running-the-tests)
- [Error responses](#error-responses)
- [Design decisions and trade-offs](#design-decisions-and-trade-offs)
- [Out of scope](#out-of-scope)

---

## Scope

The customer provides a name, phone, email, date, time and number of people.
Before the reservation is stored the system verifies that a table with enough
capacity is available, assigns that table, and saves the reservation with the
`PENDING` status.

The flow implemented by `ReservationsService.create`:

```
Enter customer details
        ↓
Pick date and time
        ↓
Enter number of people
        ↓
Query availability
        ↓
Assign an available table
        ↓
Create the reservation
        ↓
Store the reservation
        ↓
Return the confirmation
```

Reads (`GET`), customer-detail updates (`PATCH /:id`) and status transitions
(`PATCH /:id/status`) are included so the lifecycle the story describes can
actually be exercised end to end.

---

## Business rules

| Rule       | Requirement                                                               | Where it is enforced                                                           |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **RN-042** | No reservation may be registered for a past date or time.                 | `ReservationsService.assertNotInThePast` → `400 Bad Request`                   |
| **RN-043** | The number of people must be greater than zero.                           | DTO `@IsPositive` and `ReservationsService.assertGuestsWithinLimits` → `400`   |
| **RN-044** | A reservation may only be created if a table with enough capacity exists. | `TableAvailabilityService` (`t.capacity >= :guests`) → `409 Conflict`          |
| **RN-045** | A table may not be assigned to two reservations with overlapping times.   | `TableAvailabilityService.findTablesWithConflict` → `409 Conflict`             |
| **RN-046** | Every new reservation starts with the status `PENDING`.                   | `ReservationsService.create` → the status is set server side, never from input |
| **RN-047** | The assigned table must be operational at the time of registration.       | `TableAvailabilityService` (`t.status = 'AVAILABLE'`) → `409 Conflict`         |

Errors raised for these rules carry the rule id in the `rule` field of the
response body, for example:

```json
{
  "statusCode": 409,
  "error": "No table is free for the requested date and time",
  "rule": "RN-045",
  "reason": "SCHEDULE_CONFLICT"
}
```

---

## API

All routes sit under the global `api/v1` prefix set in `src/main.ts` and are
documented in Swagger at `/api/docs`.

### POST /api/v1/reservations

Registers a reservation. This is the endpoint required by HU-007.

**Request body**

| Field             | Type    | Required | Rules                                               |
| ----------------- | ------- | -------- | --------------------------------------------------- |
| `customerName`    | string  | yes      | 2 to 150 characters                                 |
| `phone`           | string  | yes      | 7 to 15 digits, optional leading `+`, no separators |
| `email`           | string  | yes      | valid email address                                 |
| `date`            | string  | yes      | `YYYY-MM-DD`, a real calendar day, not in the past  |
| `time`            | string  | yes      | `HH:mm` on a 24 hour clock                          |
| `guests`          | integer | yes      | greater than zero (RN-043)                          |
| `durationMinutes` | integer | no       | 15 to 480, defaults to `120`                        |

```bash
curl -X POST http://localhost:3000/api/v1/reservations \
  -H 'Content-Type: application/json' \
  -d '{
    "customerName": "Carlos Pérez",
    "phone": "3001234567",
    "email": "carlos@example.com",
    "date": "2026-09-20",
    "time": "19:00",
    "guests": 4
  }'
```

**`201 Created`**

```json
{
  "id": "3f1c9a52-6b2e-4a1a-9f0e-2b7c4d1e8a90",
  "customerName": "Carlos Pérez",
  "phone": "3001234567",
  "email": "carlos@example.com",
  "date": "2026-09-20",
  "time": "19:00",
  "durationMinutes": 120,
  "guests": 4,
  "tableId": 3,
  "status": "PENDING",
  "table": {
    "id": 3,
    "tableNumber": 7,
    "capacity": 6,
    "zone": "INDOOR",
    "status": "AVAILABLE"
  },
  "createdAt": "2026-09-15T14:03:11.000Z",
  "updatedAt": "2026-09-15T14:03:11.000Z"
}
```

**Responses**

| Status | When                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------- |
| `201`  | Reservation created and linked to an available table                                                |
| `400`  | Payload validation failed, or the date/time is in the past (RN-042)                                 |
| `409`  | No table available: no capacity (RN-044), all out of service (RN-047) or schedule conflict (RN-045) |

### GET /api/v1/reservations

Lists reservations, most recent first.

| Query param | Description                               |
| ----------- | ----------------------------------------- |
| `status`    | Filter by lifecycle state, e.g. `PENDING` |
| `date`      | Exact day, `YYYY-MM-DD`                   |
| `from`      | Only reservations on or after this day    |
| `to`        | Only reservations on or before this day   |

```bash
curl "http://localhost:3000/api/v1/reservations?status=PENDING&from=2026-09-01"
```

### GET /api/v1/reservations/availability

Read-only lookup used to show a customer what can be booked before submitting.
Accepts the same `date`, `time`, `guests` and `durationMinutes` parameters.

```bash
curl "http://localhost:3000/api/v1/reservations/availability?date=2026-09-20&time=19:00&guests=4"
```

```json
{
  "available": true,
  "reason": "AVAILABLE",
  "table": { "id": 3, "tableNumber": 7, "capacity": 6, "zone": "INDOOR" },
  "message": "A table is available",
  "tablesWithConflict": []
}
```

`reason` is one of `AVAILABLE`, `NO_CAPACITY`, `NO_OPERATIONAL_TABLE` or
`SCHEDULE_CONFLICT`.

### GET /api/v1/reservations/:id

Returns a single reservation, or `404` when the id does not exist.

### PATCH /api/v1/reservations/:id

Updates the customer details: `customerName`, `phone`, `email` and `guests`.

`date`, `time` and `tableId` are **not** editable. Moving a reservation to
another slot means re-running the whole availability check, which is a
different operation; the supported way to reschedule is to cancel the
reservation and create a new one. Reducing `guests` beyond the capacity of the
already assigned table is rejected with `409` (RN-044).

### PATCH /api/v1/reservations/:id/status

Moves a reservation to another state. See
[Reservation states](#reservation-states) for the allowed transitions.

```bash
curl -X PATCH http://localhost:3000/api/v1/reservations/<id>/status \
  -H 'Content-Type: application/json' \
  -d '{ "status": "CONFIRMED" }'
```

---

## Reservation states

```
PENDING ──► CONFIRMED ──► CHECKED_IN ──► COMPLETED
   │            │
   ├────────────┴──► CANCELLED
   └───────────────► NO_SHOW
```

| State        | Holds the table | Can move to                          |
| ------------ | --------------- | ------------------------------------ |
| `PENDING`    | yes             | `CONFIRMED`, `CANCELLED`, `NO_SHOW`  |
| `CONFIRMED`  | yes             | `CHECKED_IN`, `CANCELLED`, `NO_SHOW` |
| `CHECKED_IN` | yes             | `COMPLETED`                          |
| `CANCELLED`  | no              | —                                    |
| `NO_SHOW`    | no              | —                                    |
| `COMPLETED`  | no              | —                                    |

`CANCELLED`, `NO_SHOW` and `COMPLETED` are final. Any other transition is
rejected with `409`. Because only the blocking states reserve a table,
cancelling a booking immediately frees the table for someone else.

---

## How table assignment works

`TableAvailabilityService.search` performs two steps:

1. **Candidates** — operational tables with enough seats, best fit first:

   ```sql
   SELECT * FROM tables
   WHERE capacity >= :guests
     AND status = 'AVAILABLE'
   ORDER BY capacity ASC, id ASC
   FOR UPDATE          -- only inside the booking transaction
   ```

   "Smallest that fits" is deliberate: it keeps large tables free for large
   parties instead of always consuming the biggest one.

2. **Conflicts** — existing reservations on those tables for the requested day
   are loaded and the first non-overlapping candidate wins. If every candidate
   collides, the request fails with `409` and reason `SCHEDULE_CONFLICT`.

Two windows overlap when they intersect for any non-zero length of time:

```
existing 17:00 ───────────────────── 19:00
requested            18:00 ─────────── 20:00
                     └ overlap ─┘          → conflict

existing 17:00 ───────────────────── 19:00
requested                          19:00 ───────── 21:00
                                    └ touching only ┘   → allowed
```

Back-to-back bookings therefore share the table, which keeps the floor usable
instead of leaving a two hour hole after every sitting.

The module only ever **reads** `tables`; it never changes a table's status, so
the restaurant keeps full control of the physical floor.

---

## Concurrency and double booking

Checking availability and then inserting is a read-modify-write race: two
requests arriving at the same instant could both see table 3 as free and both
be told it was assigned.

`ReservationsService.create` prevents this with a single transaction:

1. `manager.transaction(...)` opens a transaction.
2. The candidate tables are selected with `setLock('pessimistic_write')`, so
   concurrent transactions queue on the same rows.
3. The conflict check runs against the locked rows.
4. The reservation is inserted and the transaction commits.

Because every booking path takes that lock, a second request blocks until the
first one commits, then re-evaluates availability against the now updated
schedule and is offered a different table. Overlap is therefore impossible
under concurrency, not merely unlikely.

> A sitting is capped at 8 hours (`MAX_DURATION_MINUTES`), so a reservation can
> never cross midnight. That is what allows the conflict check to look at a
> single day instead of a range.

---

## Data model

Table `reservations`:

| Column            | Type           | Notes                                    |
| ----------------- | -------------- | ---------------------------------------- |
| `id`              | `uuid`         | Primary key, generated                   |
| `customerName`    | `varchar(150)` | Required                                 |
| `phone`           | `varchar(20)`  | Required                                 |
| `email`           | `varchar(150)` | Required                                 |
| `date`            | `date`         | Calendar day                             |
| `time`            | `time`         | Start of the sitting                     |
| `durationMinutes` | `int`          | Defaults to `120`                        |
| `guests`          | `int`          | Party size                               |
| `tableId`         | `int`          | Foreign key to `tables.id`, not nullable |
| `status`          | `varchar(20)`  | Defaults to `PENDING`                    |
| `createdAt`       | `timestamptz`  | Managed by TypeORM                       |
| `updatedAt`       | `timestamptz`  | Managed by TypeORM                       |

Indexes:

- `idx_reservations_table_date` on `(tableId, date)` — the conflict lookup.
- `idx_reservations_date` on `(date)` — the list filters.

`date` and `time` are stored separately because that is the shape of the API
contract. Together with `durationMinutes` they define the occupied window that
RN-045 protects.

### Date and time handling

`date` and `time` are combined into an instant **in the server's local time**,
built from their individual parts:

```ts
new Date(year, month - 1, day, hours, minutes);
```

`new Date('2026-09-20')` would be parsed as UTC midnight and could resolve to
the 19th in negative UTC offsets, silently moving a customer's booking by a
day. Building the date from its parts avoids that entirely.

---

## Validation rules

Request shape is validated with `class-validator` through the global
`ValidationPipe` configured in `src/main.ts` (`whitelist`, `forbidNonWhitelisted`,
`transform`). Unknown properties are rejected rather than silently dropped.

| Field             | Validated by                                           |
| ----------------- | ------------------------------------------------------ |
| `customerName`    | `@Length(2, 150)`                                      |
| `phone`           | `@Matches(/^\+?\d{7,15}$/)`                            |
| `email`           | `@IsEmail` plus a shape check                          |
| `date`            | `IsReservationDate` — format **and** real calendar day |
| `time`            | `IsReservationTime` — 24 hour `HH:mm`                  |
| `guests`          | `@Type(() => Number)`, `@IsInt`, `@IsPositive`         |
| `durationMinutes` | `@IsInt`, `@Min(15)`, `@Max(480)`                      |

`date` and `time` use custom constraints in
`validators/reservation-format.validators.ts`, which delegate to the same
helpers the service uses. `IsDateString` was not reused because it also accepts
full ISO timestamps, while the story specifies a calendar day and a clock time.
Reusing the helpers keeps validation and persistence in agreement.

RN-042 is checked in the service rather than in a validator, because "in the
past" is relative to the moment the request is handled.

---

## Project layout

```
src/reservations/
├── README.md
├── reservation.constants.ts          # formats, duration limits, rule ids
├── reservation-status.enum.ts        # states, transitions, blocking states
├── reservation-status.enum.spec.ts
├── reservation-time.util.ts          # pure date/time helpers
├── reservation-time.util.spec.ts
├── table-availability.service.ts     # capacity + operational + conflict rules
├── table-availability.service.spec.ts
├── reservations.service.ts           # use cases
├── reservations.service.spec.ts
├── reservations.controller.ts        # HTTP layer
├── reservations.controller.spec.ts
├── reservations.module.ts
├── dto/
│   ├── create-reservation.dto.ts
│   ├── create-reservation.dto.spec.ts
│   ├── reservation-query.dto.ts      # list and availability filters
│   ├── reservation-response.dto.ts   # documented response shape
│   ├── update-reservation.dto.ts
│   └── update-reservation-status.dto.ts
├── entities/
│   └── reservation.entity.ts
└── validators/
    └── reservation-format.validators.ts
```

---

## Running the tests

171 unit tests cover the rules, the time helpers, the DTOs, the service and
the controller. They run against mocked repositories, so no database is needed.

```bash
# whole suite
npm test

# this module only
npm test -- --testPathPatterns "src/reservations"
```

Coverage per rule:

| Spec                                 | What it verifies                                                     |
| ------------------------------------ | -------------------------------------------------------------------- |
| `reservation-time.util.spec.ts`      | Date/time parsing, local time, overlap, back-to-back bookings        |
| `reservation-status.enum.spec.ts`    | The six states, blocking states, allowed and rejected transitions    |
| `dto/create-reservation.dto.spec.ts` | Every validation rule of the request body                            |
| `table-availability.service.spec.ts` | RN-044 capacity, RN-047 operational state, RN-045 conflicts, locking |
| `reservations.service.spec.ts`       | RN-042 to RN-047 end to end, plus reads, updates and transitions     |
| `reservations.controller.spec.ts`    | Controller wiring and delegation                                     |

---

## Error responses

Validation failures use the standard Nest shape:

```json
{
  "statusCode": 400,
  "message": ["guests must be greater than zero (RN-043)"],
  "error": "Bad Request"
}
```

Business rule failures add the rule id:

```json
{
  "statusCode": 400,
  "error": "Reservations cannot be registered for a past date or time (requested 2020-01-01 19:00)",
  "rule": "RN-042"
}
```

| Status | Meaning                                                     |
| ------ | ----------------------------------------------------------- |
| `400`  | Malformed payload, or the date/time is in the past (RN-042) |
| `404`  | No reservation with that id                                 |
| `409`  | No table available, or an illegal status transition         |

---

## Design decisions and trade-offs

- **`durationMinutes` is part of the request, defaulting to 120.** The story
  defines no sitting length, but RN-045 cannot be evaluated without one. Making
  it explicit keeps the API honest about what it reserves and lets a client ask
  for a longer table turn, at the cost of one optional field.
- **Back-to-back bookings are allowed.** Windows are half open, so a 19:00–21:00
  sitting and a 21:00–23:00 sitting can share a table. Treating the end instant
  as occupied would needlessly idle tables.
- **Best fit, not first fit.** Ordering candidates by capacity ASC keeps big
  tables available for big parties.
- **The module reads `TableEntity` directly** instead of importing
  `TablesService`. Reservations only need to know whether a usable table exists,
  and reading the entity keeps the tables module (HU-002) completely untouched.
  The trade-off is a read-only coupling to the `tables` schema.
- **Status transitions are validated centrally** in
  `RESERVATION_STATUS_TRANSITIONS`, so the lifecycle is described in one place
  rather than spread across controller checks.
- **`date`, `time` and `tableId` are immutable after creation.** Rescheduling
  would require re-running the availability check; cancelling and rebooking is
  explicit and auditable.
- **A `409` is returned for every kind of unavailability**, with `reason` and
  `rule` distinguishing them. This keeps the client contract stable while still
  telling the customer whether to try another time, a smaller party or another
  day.

---

## Out of scope

- Confirming, checking in, cancelling and closing a reservation as separate
  endpoints. The states and the transition rules exist, and
  `PATCH /:id/status` drives them, but the dedicated flows belong to their own
  stories.
- Deposits, pre-orders and any menu related to a reservation.
- Table layout, zones and merging, which belong to HU-002.
- Recurring or group reservations.
- Notifications such as confirmation emails or reminders.
