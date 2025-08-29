import { Injectable } from '@nestjs/common';
import { Lease } from '../lease.entity';
import { LeaseResponseDto } from '../dto/lease-response.dto';
import { LeaseTenantResponseDto } from '../dto/lease-tenant-response.dto';
import { LeaseTenant } from '../lease-tenant.entity';

@Injectable()
export class LeaseMapper {
  private mapLeaseTenantToDto(leaseTenant: LeaseTenant): LeaseTenantResponseDto {
    return {
      lease_id: leaseTenant.lease_id,
      created_at: leaseTenant.created_at,
      updated_at: leaseTenant.updated_at,
      deleted_at: leaseTenant.deleted_at || null,
      is_primary: leaseTenant.is_primary || false,
      moved_in_date: leaseTenant.moved_in_date || null,
      moved_out_date: leaseTenant.moved_out_date || null,
      relationship: leaseTenant.relationship || null,
      tenant: leaseTenant.tenant ? {
        id: leaseTenant.tenant.id,
        first_name: leaseTenant.tenant.first_name,
        last_name: leaseTenant.tenant.last_name,
        email: leaseTenant.tenant.email || null,
        phone: leaseTenant.tenant.phone || null,
        is_active: leaseTenant.tenant.is_active,
        portfolio_id: leaseTenant.tenant.portfolio_id,
        created_at: leaseTenant.tenant.created_at,
        updated_at: leaseTenant.tenant.updated_at,
        deleted_at: leaseTenant.tenant.deleted_at || null
      } : null
    };
  }

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
      unit_id: lease.unit_id,
      portfolio_id: lease.portfolio_id,
      start_date: lease.start_date,
      end_date: lease.end_date,
      rent: toNumber(lease.rent, 0),
      deposit: toNumber(lease.deposit, 0),
      billing_day: lease.billing_day || null,
      grace_days: lease.grace_days || null,
      late_fee_flat: toNumber(lease.late_fee_flat, 0),
      late_fee_percent: toNumber(lease.late_fee_percent, 0),
      notes: lease.notes || null,
      status: lease.status,
      created_at: lease.created_at,
      updated_at: lease.updated_at,
      deleted_at: lease.deleted_at || null,
      lease_tenants: leaseTenants.map(lt => this.mapLeaseTenantToDto(lt))
    };
  }

  toResponseDtos(leases: Lease[]): LeaseResponseDto[] {
    return leases.map(lease => this.toResponseDto(lease));
  }
}
