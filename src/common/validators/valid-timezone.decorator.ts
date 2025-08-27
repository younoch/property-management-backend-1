import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as moment from 'moment-timezone';

export function IsValidTimezone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidTimezone',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        message: `${propertyName} must be a valid IANA timezone (e.g., 'America/New_York', 'Asia/Dhaka')`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return moment.tz.zone(value) !== null;
        },
      },
    });
  };
}
