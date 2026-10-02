import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../reservation-status.enum.js';

/**
 * Payload of `PATCH /api/v1/reservations/:id/status`.
 *
 * Only the transitions declared in `RESERVATION_STATUS_TRANSITIONS` are
 * accepted; the service rejects anything else with a conflict error.
 */
export class UpdateReservationStatusDto {
  @ApiProperty({
    description: 'New lifecycle state',
    enum: ReservationStatus,
    enumName: 'ReservationStatus',
  })
  @IsEnum(ReservationStatus, {
    message: `status must be one of: ${Object.values(ReservationStatus).join(', ')}`,
  })
  status: ReservationStatus;
}
