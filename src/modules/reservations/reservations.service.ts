import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto.js';
import { AvailabilityResponseDto } from './dto/availability-response.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import {
  AVAILABILITY_RULES,
  BUSINESS_RULES,
  DEFAULT_DURATION_MINUTES,
} from './reservation.constants.js';
import {
  ReservationStatus,
  canTransitionTo,
} from './reservation-status.enum.js';
import { addMinutes, combineDateAndTime } from './reservation-time.util.js';
import {
  TableAvailabilityService,
  UnavailableReason,
} from './table-availability.service.js';
import { ReservationQueryDto } from './dto/reservation-query.dto.js';

/**
 * Human readable explanation for each way the availability search can end.
 * `AVAILABLE` carries no message because the slot could be booked.
 */
const AVAILABILITY_MESSAGES: Record<UnavailableReason, string | undefined> = {
  AVAILABLE: undefined,
  NO_CAPACITY:
    'No table in the restaurant has enough capacity for the requested number of people',
  NO_OPERATIONAL_TABLE:
    'Every table that fits the party is currently out of service',
  SCHEDULE_CONFLICT: 'No table is free for the requested date and time',
};

/**
 * Reservation use cases for the Reservations epic.
 *
 * Business rules implemented here, in the order the flow requires them:
 * RN-042 past date/time, RN-043 positive guests, RN-044 sufficient capacity,
 * RN-045 no schedule conflict, RN-046 initial PENDING status and RN-047 the
 * assigned table must be operational.
 *
 * The availability query (HU-006) applies RN-036 (positive guests) and
 * RN-037/RN-042 (no past date/time) here, and RN-038 to RN-041 in
 * `TableAvailabilityService`.
 */
@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly availability: TableAvailabilityService,
  ) {}

  /**
   * Registers a reservation and assigns it the best available table.
   *
   * Runs in a single transaction: the candidate tables are locked with
   * `pessimistic_write` before the conflict check, so two simultaneous requests
   * cannot both be told the same table is free (RN-045). The insert and the
   * table choice therefore commit or roll back together.
   */
  async create(dto: CreateReservationDto) {
    const durationMinutes = dto.durationMinutes ?? DEFAULT_DURATION_MINUTES;

    this.assertNotInThePast(dto.date, dto.time);
    this.assertGuestsWithinLimits(dto.guests);

    return this.reservationRepository.manager.transaction(async (manager) => {
      const { table, reason } = await this.availability.search(
        {
          guests: dto.guests,
          date: dto.date,
          time: dto.time,
          durationMinutes,
        },
        { manager, lockRows: true },
      );

      if (!table) {
        throw new ConflictException({
          error: AVAILABILITY_MESSAGES[reason],
          rule: this.ruleFor(reason),
          reason,
        });
      }

      // RN-046: a new reservation always starts as PENDING.
      const reservation = manager.create(Reservation, {
        customerName: dto.customerName.trim(),
        phone: dto.phone.trim(),
        email: dto.email.trim().toLowerCase(),
        date: dto.date,
        time: dto.time,
        durationMinutes,
        guests: dto.guests,
        tableId: table.id,
        status: ReservationStatus.PENDING,
      });

      return manager.save(Reservation, reservation);
    });
  }

  /** Lists reservations, newest first, with optional filters. */
  async findAll(query: ReservationQueryDto = {}): Promise<Reservation[]> {
    const where: FindOptionsWhere<Reservation> = {};

    if (query.status) where.status = query.status;
    if (query.date) {
      where.date = query.date;
    } else if (query.from && query.to) {
      where.date = Between(query.from, query.to);
    } else if (query.from) {
      where.date = MoreThanOrEqual(query.from);
    } else if (query.to) {
      where.date = LessThanOrEqual(query.to);
    }

    return this.reservationRepository.find({
      where,
      order: { date: 'DESC', time: 'DESC' },
    });
  }

  /** Returns one reservation or fails with 404. */
  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOneBy({ id });

    if (!reservation) {
      throw new NotFoundException(`Reservation with id "${id}" was not found`);
    }
    return reservation;
  }

  /**
   * Updates customer details. `date`, `time` and `tableId` are immutable here
   * (see `UpdateReservationDto`); a customer that needs another slot cancels
   * and books again.
   */
  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (dto.guests !== undefined) {
      this.assertGuestsWithinLimits(dto.guests);
      // RN-044/RN-047 still hold for the already assigned table.
      const table = reservation.table;
      if (table && !this.availability.hasEnoughCapacity(table, dto.guests)) {
        throw new ConflictException({
          error: `Table ${table.tableNumber} seats ${table.capacity} people and cannot host ${dto.guests}`,
          rule: BUSINESS_RULES.CAPACITY_AVAILABLE,
        });
      }
    }

    // Normalise the incoming values once, then apply only what was sent so an
    // omitted field keeps its stored value.
    const patch: Partial<Reservation> = {};

    if (dto.customerName !== undefined) {
      patch.customerName = dto.customerName.trim();
    }
    if (dto.phone !== undefined) {
      patch.phone = dto.phone.trim();
    }
    if (dto.email !== undefined) {
      patch.email = dto.email.trim().toLowerCase();
    }
    if (dto.guests !== undefined) {
      patch.guests = dto.guests;
    }

    Object.assign(reservation, patch);

    return this.reservationRepository.save(reservation);
  }

  /**
   * Moves a reservation to a new lifecycle state, rejecting transitions that
   * are not part of the flow.
   */
  async updateStatus(
    id: string,
    dto: UpdateReservationStatusDto,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status === dto.status) {
      return reservation;
    }

    if (!canTransitionTo(reservation.status, dto.status)) {
      throw new ConflictException({
        error: `A reservation in status ${reservation.status} cannot move to ${dto.status}`,
        from: reservation.status,
        to: dto.status,
      });
    }

    reservation.status = dto.status;
    return this.reservationRepository.save(reservation);
  }

  /**
   * Read-only availability lookup for a slot (HU-006).
   *
   * Lists every table that is operational, seats the party and has no
   * overlapping reservation. When nothing can be offered it still answers 200
   * with `available: false`, a `reason` and a clear `message`, because "no
   * availability" is a valid answer to the question, not an error.
   */
  async checkAvailability(query: {
    date: string;
    time: string;
    guests: number;
    durationMinutes?: number;
  }): Promise<AvailabilityResponseDto> {
    this.assertNotInThePast(
      query.date,
      query.time,
      AVAILABILITY_RULES.NO_PAST_DATE_TIME,
    );
    this.assertGuestsWithinLimits(
      query.guests,
      AVAILABILITY_RULES.POSITIVE_GUESTS,
    );

    const durationMinutes = query.durationMinutes ?? DEFAULT_DURATION_MINUTES;

    const { tables, reason } = await this.availability.findAvailable({
      guests: query.guests,
      date: query.date,
      time: query.time,
      durationMinutes,
    });

    const available = tables.length > 0;

    return {
      available,
      reason,
      message: available
        ? 'Tables are available for the requested slot'
        : (AVAILABILITY_MESSAGES[reason] ?? 'No table is available'),
      date: query.date,
      time: query.time,
      guests: query.guests,
      durationMinutes,
      tables: tables.map(({ id, tableNumber, capacity, zone }) => ({
        id,
        tableNumber,
        capacity,
        zone,
      })),
    };
  }

  /** End instant of a reservation, useful for clients rendering the slot. */
  endsAt(reservation: Reservation): Date {
    return addMinutes(
      combineDateAndTime(reservation.date, reservation.time),
      reservation.durationMinutes,
    );
  }

  /**
   * Rejects a date/time that has already passed (RN-042 when booking,
   * RN-037/RN-042 when querying availability).
   *
   * A few minutes of tolerance is not granted: the instant is compared against
   * the current time, so booking for "now" is only valid while that minute has
   * not elapsed.
   */
  private assertNotInThePast(
    date: string,
    time: string,
    rule: string = BUSINESS_RULES.NO_PAST_DATE_TIME,
  ): void {
    const startsAt = this.startOf(date, time, rule);

    if (startsAt.getTime() <= Date.now()) {
      throw new BadRequestException({
        error: `Reservations cannot be registered for a past date or time (requested ${date} ${time})`,
        rule,
      });
    }
  }

  /**
   * The party size must be a whole number greater than zero (RN-043 when
   * booking, RN-036 when querying availability).
   */
  private assertGuestsWithinLimits(
    guests: number,
    rule: string = BUSINESS_RULES.POSITIVE_GUESTS,
  ): void {
    if (!Number.isInteger(guests) || guests <= 0) {
      throw new BadRequestException({
        error: 'The number of people must be an integer greater than zero',
        rule,
      });
    }
  }

  private startOf(date: string, time: string, rule: string): Date {
    try {
      return combineDateAndTime(date, time);
    } catch (error) {
      throw new BadRequestException({
        error: (error as Error).message,
        rule,
      });
    }
  }

  private ruleFor(reason: UnavailableReason): string | undefined {
    switch (reason) {
      case 'NO_CAPACITY':
        return BUSINESS_RULES.CAPACITY_AVAILABLE;
      case 'NO_OPERATIONAL_TABLE':
        return BUSINESS_RULES.TABLE_OPERATIONAL;
      case 'SCHEDULE_CONFLICT':
        return BUSINESS_RULES.NO_SCHEDULE_CONFLICT;
      default:
        return undefined;
    }
  }
}
