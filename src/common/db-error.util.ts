import { BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common'
import { QueryFailedError } from 'typeorm'

/**
 * Maps common Postgres error codes to meaningful HTTP errors.
 * Extend as needed.
 */
export function rethrowDbError(e: unknown): never {
  if (e instanceof QueryFailedError) {
    const driverErr: any = e as any
    switch (driverErr.code) {
      case '23505': { // unique_violation
        // Example detail: Key (email)=(john@x.com) already exists.
        const detail = driverErr.detail || 'Duplicate value violates unique constraint'
        throw new ConflictException(detail)
      }
      case '23503': { // foreign_key_violation
        // detail: Key (portfolio_id)=(7) is not present in table "portfolio".
        const detail = driverErr.detail || 'Foreign key violation'
        throw new BadRequestException(detail)
      }
      case '23502': { // not_null_violation
        const column = driverErr.column || 'a required column'
        throw new BadRequestException(`Missing required value for ${column}`)
      }
      case '22P02': { // invalid_text_representation (e.g., invalid UUID)
        throw new BadRequestException('Invalid value format for one or more fields')
      }
    }
  }
  // Fallback
  throw new InternalServerErrorException((e as Error)?.message || 'Unexpected database error')
}
