import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AvailabilityQueryDto,
  ReservationQueryDto,
} from './dto/reservation-query.dto.js';
import { AvailabilityResponseDto } from './dto/availability-response.dto.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationsService } from './reservations.service.js';

/**
 * Reservation endpoints, exposed under the global `api/v1` prefix.
 *
 * HU-007 requires `POST /api/v1/reservations`; HU-006 requires
 * `GET /api/v1/reservations/availability`. The reads and the status transition
 * exist so the reservation lifecycle the stories describe can be exercised.
 */
@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a reservation',
    description:
      'Creates a reservation for a future date and time, assigns the best ' +
      'available operational table that seats the party, and stores it with ' +
      'status PENDING. Rejects past date/time (RN-042), party sizes below one ' +
      '(RN-043), missing capacity (RN-044), schedule conflicts (RN-045) and ' +
      'out of service tables (RN-047).',
  })
  @ApiCreatedResponse({
    description: 'Reservation created and linked to an available table.',
    type: Reservation,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, or the date/time is in the past (RN-042).',
  })
  @ApiConflictResponse({
    description: 'No table is available for the requested party and slot.',
  })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'List reservations' })
  @ApiOkResponse({
    description: 'Reservations matching the filters.',
    type: [Reservation],
  })
  findAll(@Query() query: ReservationQueryDto) {
    return this.reservationsService.findAll(query);
  }

  @Get('availability')
  @ApiOperation({
    summary: 'Check table availability for a date, time and party size',
    description:
      'Read-only lookup that lists the tables a customer could book. Only ' +
      'AVAILABLE tables (RN-038/RN-041) with capacity greater than or equal ' +
      'to the guests (RN-039) and no overlapping reservation (RN-040) are ' +
      'returned. Guests must be greater than zero (RN-036) and the date/time ' +
      'must be in the future (RN-037/RN-042). When nothing is free the answer ' +
      'is still 200 with `available: false`, a `reason` and a `message`.',
  })
  @ApiOkResponse({
    description:
      'Availability result for the requested slot, with the free tables.',
    type: AvailabilityResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Missing or malformed date, time or guests; guests below one; or a ' +
      'past date/time.',
  })
  checkAvailability(@Query() query: AvailabilityQueryDto) {
    return this.reservationsService.checkAvailability(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by id' })
  @ApiOkResponse({ description: 'The reservation.', type: Reservation })
  @ApiNotFoundResponse({ description: 'No reservation with that id.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update customer details of a reservation',
    description: 'Date, time and assigned table cannot be changed.',
  })
  @ApiOkResponse({ description: 'The updated reservation.', type: Reservation })
  @ApiNotFoundResponse({ description: 'No reservation with that id.' })
  @ApiConflictResponse({
    description: 'The party no longer fits the assigned table.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Move a reservation to another lifecycle state',
    description:
      'Accepts only the transitions of the reservation flow: ' +
      'PENDING to CONFIRMED or CANCELLED, CONFIRMED to CHECKED_IN, ' +
      'CANCELLED or NO_SHOW, and CHECKED_IN to COMPLETED.',
  })
  @ApiOkResponse({
    description: 'The reservation with its new status.',
    type: Reservation,
  })
  @ApiNotFoundResponse({ description: 'No reservation with that id.' })
  @ApiConflictResponse({
    description: 'The requested transition is not allowed.',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(
      id,
      updateReservationStatusDto,
    );
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a reservation',
    description:
      'Moves a reservation to CANCELLED state, if it is currently PENDING or CONFIRMED.',
  })
  @ApiOkResponse({
    description: 'The reservation with its new status.',
    type: Reservation,
  })
  @ApiBadRequestResponse({
    description: 'The provided reservation ID is not a valid UUID.',
  })
  @ApiNotFoundResponse({ description: 'No reservation with that id.' })
  @ApiConflictResponse({
    description:
      'The reservation cannot be cancelled because it is not in PENDING or CONFIRMED state.',
  })
  cancelReservation(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.cancelReservation(id);
  }
}
