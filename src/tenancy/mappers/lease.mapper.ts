import { Injectable } from '@nestjs/common';
import { Lease } from '../lease.entity';
import { LeaseResponseDto } from '../dto/lease-response.dto';

@Injectable()
export class LeaseMapper {
  toResponseDto(lease: Lease): LeaseResponseDto {
    // Safely handle lease_tenants which might be undefined or null
    const leaseTenants = Array.isArray(lease.lease_tenants) 
      ? lease.lease_tenants 
      : [];

    // Helper function to safely convert string numbers to numbers
    const toNumber = (value: string | number | null | undefined, defaultValue = 0): number => {
      if (value === null || value === undefined) return defaultValue;
      if (typeof value === 'number') return value;
      const num = parseFloat(value);
      return isNaN(num) ? defaultValue : num;
    };
      
    return {
      id: lease.id,
      portfolio_id: lease.portfolio_id,
      unit_id: lease.unit_id,
      start_date: lease.start_date,
      end_date: lease.end_date,
      rent: toNumber(lease.rent),
      deposit: toNumber(lease.deposit),
      billing_day: lease.billing_day,
      grace_days: lease.grace_days,
      late_fee_flat: lease.late_fee_flat !== null && lease.late_fee_flat !== undefined 
        ? toNumber(lease.late_fee_flat, null as any)
        : null,
      late_fee_percent: lease.late_fee_percent !== null && lease.late_fee_percent !== undefined
        ? toNumber(lease.late_fee_percent, null as any)
        : null,
      notes: lease.notes || null,
      status: lease.status,
      created_at: lease.created_at,
      updated_at: lease.updated_at,
      deleted_at: lease.deleted_at || null,
      lease_tenants: leaseTenants.map(lt => ({
        lease_id: lt.lease_id,
        tenant_id: lt.tenant_id,
        created_at: lt.created_at,
        updated_at: lt.updated_at,
        deleted_at: lt.deleted_at || null,
        is_primary: lt.is_primary || false,
        moved_in_date: lt.moved_in_date || null,
        moved_out_date: lt.moved_out_date || null,
        relationship: lt.relationship || null
      }))
    };
  }

  toResponseDtos(leases: Lease[]): LeaseResponseDto[] {
    return leases.map(lease => this.toResponseDto(lease));
  }
}
