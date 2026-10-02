import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { TableEntity } from '../entities/table.entity.js';
import { DEFAULT_DURATION_MINUTES } from './reservation.constants.js';
import { BLOCKING_RESERVATION_STATUSES } from './reservation-status.enum.js';
import { Reservation } from './entities/reservation.entity.js';
import { buildWindow, intervalsOverlap } from './reservation-time.util.js';

/** Criteria used to pick a table for a new reservation. */
export interface TableSearchCriteria {
  /** Number of people that must be seated (RN-044). */
  guests: number;
  /** Reservation day, `YYYY-MM-DD`. */
  date: string;
  /** Reservation start time, `HH:mm`. */
  time: string;
  /** Length of the sitting in minutes. */
  durationMinutes?: number;
}

/** Why a search did or did not return a table. */
export type UnavailableReason =
  'AVAILABLE' | 'NO_CAPACITY' | 'NO_OPERATIONAL_TABLE' | 'SCHEDULE_CONFLICT';

export interface AvailabilitySearchResult {
  /** Best fit table, or `null` when nothing is available. */
  table: TableEntity | null;
  /** `AVAILABLE` when `table` was found, otherwise the blocking reason. */
  reason: UnavailableReason;
  /** Ids of tables that fit but are already booked for that window (RN-045). */
  tablesWithConflict: number[];
}

/** Options that control how the search is executed. */
export interface TableSearchOptions {
  /**
   * When provided, the search runs inside that transaction. Required together
   * with `lockRows`.
   */
  manager?: EntityManager;
  /**
   * Locks the candidate rows with `pessimistic_write` so two concurrent
   * requests cannot pick the same table (RN-045). Requires an open transaction.
   */
  lockRows?: boolean;
}

/**
 * Read-only table availability used by the reservation flow.
 *
 * Deliberately decoupled from the tables module (HU-002): the reservation flow
 * only needs to know whether an operational table with enough free capacity and
 * no overlapping booking exists, so it reads `TableEntity` directly instead of
 * importing or modifying the other module.
 *
 * The module only ever **reads** tables; it never changes their status, so the
 * restaurant keeps full control of the physical floor.
 */
@Injectable()
export class TableAvailabilityService {
  constructor(
    @InjectRepository(TableEntity)
    private readonly tableRepository: Repository<TableEntity>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  /**
   * Finds the smallest operational table that fits `guests` and has no
   * overlapping reservation.
   *
   * "Smallest that fits" (best fit) keeps large tables free for large parties
   * instead of always consuming the biggest one.
   */
  async search(
    criteria: TableSearchCriteria,
    options: TableSearchOptions = {},
  ): Promise<AvailabilitySearchResult> {
    const { guests, date, time } = criteria;
    const durationMinutes =
      criteria.durationMinutes ?? DEFAULT_DURATION_MINUTES;
    const tables = this.tableRepositoryFor(options.manager);

    const query = tables
      .createQueryBuilder('t')
      // RN-044: enough seats.
      .where('t.capacity >= :guests', { guests })
      // RN-047: the table must be operational. AVAILABLE is the only bookable
      // state; OCCUPIED is reserved for walk-ins and OUT_OF_SERVICE is broken.
      .andWhere('t.status = :status', { status: 'AVAILABLE' })
      .orderBy('t.capacity', 'ASC')
      .addOrderBy('t.id', 'ASC');

    if (options.lockRows) {
      query.setLock('pessimistic_write');
    }

    const candidates = await query.getMany();

    if (candidates.length === 0) {
      return {
        ...(await this.explainEmpty(tables, guests)),
        tablesWithConflict: [],
      };
    }

    const busyTableIds = await this.findTablesWithConflict(
      candidates.map((table) => table.id),
      { date, time, durationMinutes },
      options.manager,
    );

    const free = candidates.find((table) => !busyTableIds.has(table.id));

    if (free) {
      return { table: free, reason: 'AVAILABLE', tablesWithConflict: [] };
    }

    return {
      table: null,
      reason: 'SCHEDULE_CONFLICT',
      tablesWithConflict: candidates.map((table) => table.id),
    };
  }

  /**
   * Distinguishes "the restaurant has no table big enough" from "every big
   * enough table is out of service" so the API can answer precisely.
   */
  private async explainEmpty(
    tables: Repository<TableEntity>,
    guests: number,
  ): Promise<Omit<AvailabilitySearchResult, 'tablesWithConflict'>> {
    const bigEnoughExists = await tables
      .createQueryBuilder('t')
      .where('t.capacity >= :guests', { guests })
      .getExists();

    return {
      table: null,
      reason: bigEnoughExists ? 'NO_OPERATIONAL_TABLE' : 'NO_CAPACITY',
    };
  }

  /**
   * Returns the ids of candidate tables whose schedule already overlaps the
   * requested window (RN-045).
   */
  private async findTablesWithConflict(
    tableIds: number[],
    window: { date: string; time: string; durationMinutes: number },
    manager?: EntityManager,
  ): Promise<Set<number>> {
    if (tableIds.length === 0) return new Set<number>();

    const reservations = this.reservationRepositoryFor(manager);
    const { startsAt, endsAt } = buildWindow(
      window.date,
      window.time,
      window.durationMinutes,
    );

    // A sitting is capped at 480 minutes, so it can never cross midnight and
    // only reservations on the same calendar day can overlap.
    const sameDay = await reservations.find({
      where: {
        tableId: In(tableIds),
        date: window.date,
        // Cancelled, no-show and completed bookings do not hold a table.
        status: In([...BLOCKING_RESERVATION_STATUSES]),
      },
    });

    const busy = new Set<number>();
    for (const reservation of sameDay) {
      const existing = buildWindow(
        reservation.date,
        reservation.time,
        reservation.durationMinutes,
      );
      if (
        intervalsOverlap(startsAt, endsAt, existing.startsAt, existing.endsAt)
      ) {
        busy.add(reservation.tableId);
      }
    }
    return busy;
  }

  /**
   * True when `table` is operational, i.e. it may receive a new reservation
   * (RN-047).
   */
  isOperational(table: TableEntity): boolean {
    return table.status === 'AVAILABLE';
  }

  /** True when `table` can seat `guests` (RN-044). */
  hasEnoughCapacity(table: TableEntity, guests: number): boolean {
    return table.capacity >= guests;
  }

  private tableRepositoryFor(manager?: EntityManager): Repository<TableEntity> {
    return manager ? manager.getRepository(TableEntity) : this.tableRepository;
  }

  private reservationRepositoryFor(
    manager?: EntityManager,
  ): Repository<Reservation> {
    return manager
      ? manager.getRepository(Reservation)
      : this.reservationRepository;
  }
}
