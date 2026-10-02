import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import {
  isValidReservationDate,
  isValidReservationTime,
} from '../reservation-time.util.js';

/**
 * Format validators for the reservation payload.
 *
 * `class-validator`'s `IsDateString` would accept full ISO timestamps and other
 * shapes, but the HU-007 contract is explicitly `YYYY-MM-DD` + `HH:mm`, so the
 * module ships its own constraints. They delegate to the same helpers used by
 * the service, which keeps validation and persistence in agreement.
 */

@ValidatorConstraint({ name: 'isReservationDate', async: false })
class IsReservationDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidReservationDate(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return (
      `${args.property} must be a valid calendar day formatted as YYYY-MM-DD ` +
      `(received "${args.value}")`
    );
  }
}

/** Accepts only real calendar days written as `YYYY-MM-DD`. */
export function IsReservationDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: {
        message: 'date must be a valid calendar day (YYYY-MM-DD)',
        ...validationOptions,
      },
      validator: IsReservationDateConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isReservationTime', async: false })
class IsReservationTimeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidReservationTime(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return (
      `${args.property} must be a valid 24 hour time formatted as HH:mm ` +
      `(received "${args.value}")`
    );
  }
}

/** Accepts only 24 hour clock times written as `HH:mm`. */
export function IsReservationTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: {
        message: 'time must be a valid 24 hour time (HH:mm)',
        ...validationOptions,
      },
      validator: IsReservationTimeConstraint,
    });
  };
}
