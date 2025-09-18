import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsUrlOrPath(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUrlOrPath',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must be a valid URL or path`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          
          // Allow empty string (handled by @IsOptional)
          if (value === '') {
            return true;
          }

          // Check if it's a valid URL
          try {
            // This will accept most valid URLs including localhost and IPs
            new URL(value);
            return true;
          } catch {
            // If URL parsing fails, check if it's a valid path
            // Simple path regex: starts with / or . or just alphanumeric
            return /^(\/|\/\/|\.|\w+:).*/.test(value);
          }
        },
      },
    });
  };
}
