import { Injectable } from '@nestjs/common';
import moment from 'moment-timezone';

@Injectable()
export class TimezoneService {
  /**
   * Get current date in the specified timezone
   * @param timezone Timezone string (e.g., 'America/New_York', 'Asia/Dhaka')
   * @returns Date object in the specified timezone
   */
  getCurrentDate(timezone: string = 'UTC'): Date {
    return moment().tz(timezone).toDate();
  }

  /**
   * Convert a date to the specified timezone
   * @param date Date to convert
   * @param timezone Target timezone (e.g., 'America/New_York')
   * @returns Date object in the target timezone
   */
  toTimezone(date: Date, timezone: string): Date {
    return moment(date).tz(timezone).toDate();
  }

  /**
   * Format a date in the specified timezone and format
   * @param date Date to format
   * @param format Format string (default: 'YYYY-MM-DD HH:mm:ss')
   * @param timezone Timezone string (default: 'UTC')
   * @returns Formatted date string
   */
  formatDate(
    date: Date, 
    format: string = 'YYYY-MM-DD HH:mm:ss', 
    timezone: string = 'UTC'
  ): string {
    return moment(date).tz(timezone).format(format);
  }

  /**
   * Check if a timezone is valid
   * @param timezone Timezone string to validate
   * @returns boolean indicating if the timezone is valid
   */
  isValidTimezone(timezone: string): boolean {
    return moment.tz.zone(timezone) !== null;
  }

  /**
   * Get all available timezones
   * @returns Array of timezone strings
   */
  getAllTimezones(): string[] {
    return moment.tz.names();
  }
}
