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
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto.js';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationsService } from './reservations.service.js';

/**
 * Reservation endpoints, exposed under the global `api/v1` prefix.
 *
 * The single endpoint required by HU-007 is `POST /api/v1/reservations`; the
 * reads and the status transition exist so the reservation lifecycle the story
 * describes can actually be exercised.
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
    summary: 'Check table availability for a slot',
    description:
      'Read-only lookup used to show a customer what can be booked before ' +
      'submitting the reservation.',
  })
  @ApiOkResponse({ description: 'Availability result for the requested slot.' })
  @ApiBadRequestResponse({ description: 'Invalid or past date/time.' })
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

  /**
   * Cancel a reservation
   */
  @Patch(':id/cancel')
  cancelReservation(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reservationsService.cancelReservation(id);
  }
}
