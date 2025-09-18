import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lease } from '../tenancy/lease.entity';
import { InvoiceItem, InvoiceItemType } from './entities/invoice.entity';

export interface LeaseInvoiceItem extends Omit<InvoiceItem, 'amount'> {
  id: string;
  type: InvoiceItemType;
  name: string;
  description?: string;
  qty: number;
  unit_price: number;
  amount: number;
  lease_term_id?: number;
  is_recurring: boolean;
}

@Injectable()
export class LeaseToInvoiceMapper {
  constructor() {}

  /**
   * Map lease terms to invoice items
   */
  mapLeaseToInvoiceItems(lease: Lease): LeaseInvoiceItem[] {
    const items: LeaseInvoiceItem[] = [];
    const timestamp = Date.now();
    
    // Add base rent
    if (lease.rent) {
      items.push({
        id: `rent-${lease.id}-${timestamp}`,
        type: 'rent',
        name: 'Base Rent',
        description: `Monthly rent for ${lease.unit?.label || 'unit'}`,
        qty: 1,
        unit_price: parseFloat(lease.rent.toString()),
        amount: parseFloat(lease.rent.toString()),
        is_recurring: true,
        lease_term_id: lease.id
      });
    }

    // Add late fees if they exist
    if (lease.late_fee_flat || lease.late_fee_percent) {
      if (lease.late_fee_flat) {
        items.push({
          id: `late-fee-${lease.id}-${timestamp}`,
          type: 'late_fee',
          name: 'Late Fee',
          description: 'Flat late fee',
          qty: 1,
          unit_price: parseFloat(lease.late_fee_flat.toString()),
          amount: parseFloat(lease.late_fee_flat.toString()),
          is_recurring: true,
          lease_term_id: lease.id
        });
      }
      // Note: Percentage-based late fees would need the invoice amount to calculate
    }

    return items;
  }

  /**
   * Calculate prorated amount for a partial period
   */
  calculateProratedAmount(
    dailyRate: number,
    startDate: Date,
    endDate: Date,
    periodStart: Date,
    periodEnd: Date
  ): number {
    const actualStart = startDate > periodStart ? startDate : periodStart;
    const actualEnd = endDate < periodEnd ? endDate : periodEnd;
    
    if (actualStart >= actualEnd) return 0;
    
    const daysInPeriod = Math.ceil((actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24));
    return parseFloat((dailyRate * daysInPeriod).toFixed(2));
  }
}
