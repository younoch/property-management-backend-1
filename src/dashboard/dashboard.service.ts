import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../billing/payment.entity';

import {
  LessThanOrEqual,
  LessThan,
  MoreThan,
  Repository
} from 'typeorm';
import { Unit } from '../units/unit.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Invoice } from '../billing/entities/invoice.entity';
import { Expense } from '../expenses/expense.entity';
import { Lease } from '../leases/lease.entity';
import {
  DashboardFilterDto,
  DashboardStatsResponseDto,
  OverduePaymentDto
} from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) { }

  private getDateRange(dateRange?: Pick<DashboardFilterDto, 'startDate' | 'endDate'>) {
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (dateRange?.startDate) startDate = new Date(dateRange.startDate);
    if (dateRange?.endDate) {
      endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  async getDashboardStats(filter?: DashboardFilterDto): Promise<DashboardStatsResponseDto> {
    const { startDate, endDate } = this.getDateRange(filter);
    const propertyId = filter?.propertyId;

    // Units
    const [totalUnits, rentedUnits] = await Promise.all([
      this.unitRepository.count({
        where: {
          ...(propertyId ? { property_id: propertyId } : {}),
          created_at: LessThanOrEqual(endDate)
        }
      }),
      this.leaseRepository
        .createQueryBuilder('lease')
        .innerJoin('lease.unit', 'unit')
        .where('unit.status = :status', { status: 'occupied' })
        .andWhere('lease.start_date <= :endDate', { endDate })
        .andWhere('lease.end_date >= :startDate', { startDate })
        .andWhere('lease.status = :leaseStatus', { leaseStatus: 'active' })
        .andWhere(propertyId ? 'unit.property_id = :propertyId' : '1=1', { propertyId })
        .getCount(),
    ]);

    // Active tenants
    const activeTenantsQuery = this.tenantRepository
      .createQueryBuilder('tenant')
      .where('tenant.is_active = :isActive', { isActive: true })
      .andWhere('tenant.created_at <= :endDate', { endDate });

    if (propertyId) {
      activeTenantsQuery
        .innerJoin('tenant.lease_tenants', 'lt')
        .innerJoin('lt.lease', 'lease')
        .innerJoin('lease.unit', 'unit')
        .andWhere('unit.property_id = :propertyId', { propertyId });
    } else {
      const subQuery = this.tenantRepository
        .createQueryBuilder('t')
        .innerJoin('t.lease_tenants', 'lt')
        .innerJoin('lt.lease', 'l')
        .where('t.id = tenant.id')
        .andWhere('l.start_date <= :endDate')
        .andWhere('l.end_date >= :startDate')
        .getQuery();
      activeTenantsQuery.andWhere(`EXISTS (${subQuery})`, { endDate, startDate });
    }
    const activeTenants = await activeTenantsQuery.getCount();

    // Revenue and expenses
    const [invoices, expenses] = await Promise.all([
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.lease', 'lease')
        .leftJoin('lease.unit', 'unit')
        .where('invoice.status = :status', { status: 'paid' })
        .andWhere('invoice.paid_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere(propertyId ? 'unit.property_id = :propertyId' : '1=1', { propertyId })
        .getMany(),
      this.expenseRepository
        .createQueryBuilder('expense')
        .where('expense.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere(propertyId ? 'expense.property_id = :propertyId' : '1=1', { propertyId })
        .getMany()
    ]);

    const totalRevenue = invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount.toString()) || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount.toString()) || 0), 0);

    // ⚡ FIXED monthlyRevenueQuery using entity aliasing
    const monthlyRevenueQuery = this.paymentRepository
      .createQueryBuilder('p')
      .select([
        'EXTRACT(YEAR FROM p.payment_date) AS year',
        'EXTRACT(MONTH FROM p.payment_date) AS month',
        'COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0) AS amount'
      ])
      .innerJoin('p.applications', 'pa')
      .innerJoin('pa.invoice', 'invoice')
      .where('p.payment_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('invoice.status = :status', { status: 'completed' })
      .groupBy('year, month')
      .orderBy('year, month', 'ASC');

    if (propertyId) {
      monthlyRevenueQuery
        .innerJoin('p.lease', 'lease')
        .innerJoin('lease.unit', 'unit')
        .andWhere('unit.property_id = :propertyId', { propertyId });
    }

    const monthlyExpensesQuery = this.expenseRepository
      .createQueryBuilder('expense')
      .select([
        'EXTRACT(YEAR FROM expense.created_at) AS year',
        'EXTRACT(MONTH FROM expense.created_at) AS month',
        'SUM(expense.amount) AS amount'
      ])
      .where('expense.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('year, month')
      .orderBy('year, month', 'ASC');

    if (propertyId) {
      monthlyExpensesQuery.andWhere('expense.property_id = :propertyId', { propertyId });
    }

    const [monthlyRevenueData, monthlyExpensesData] = await Promise.all([
      monthlyRevenueQuery.getRawMany(),
      monthlyExpensesQuery.getRawMany(),
    ]);

    const formatMonthlyData = (data: any[]) => data.map(item => ({
      year: parseInt(item.year),
      month: parseInt(item.month),
      amount: parseFloat(item.amount),
      label: new Date(parseInt(item.year), parseInt(item.month) - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    }));

    const monthlyRevenue = formatMonthlyData(monthlyRevenueData);
    const monthlyExpenses = formatMonthlyData(monthlyExpensesData);

    // Overdue payments & occupancy
    const overdueInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.lease', 'lease')
      .leftJoinAndSelect('lease.unit', 'unit')
      .leftJoin('lease.lease_tenants', 'leaseTenant')
      .leftJoin('leaseTenant.tenant', 'tenant')
      .where('invoice.due_date < :now', { now: new Date() })
      .andWhere('invoice.status = :status', { status: 'open' })
      .orderBy('invoice.due_date', 'ASC')
      .getMany();

    const overduePayments: OverduePaymentDto[] = await Promise.all(overdueInvoices.map(async (invoice) => {
      const dueDate = new Date(invoice.due_date);
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const lease = await this.leaseRepository.findOne({
        where: { id: invoice.lease_id },
        relations: ['lease_tenants', 'lease_tenants.tenant', 'unit'],
      });
      const tenantNames = lease?.lease_tenants
        ?.map(lt => `${lt.tenant.first_name} ${lt.tenant.last_name}`.trim())
        .filter(Boolean)
        .join(', ') || 'Unknown Tenant';

      return {
        tenantName: tenantNames,
        unitNumber: lease?.unit?.label || 'N/A',
        amount: parseFloat(invoice.balance_due.toString()),
        dueDate,
        daysOverdue: diffDays,
      };
    }));

    const activeLeases = await this.leaseRepository.count({
      where: {
        start_date: LessThan(new Date().toISOString().split('T')[0]) as any,
        end_date: MoreThan(new Date().toISOString().split('T')[0]) as any,
        status: 'active' as any,
        ...(propertyId && { unit: { property_id: propertyId.toString() } })
      } as any,
    });

    const currentOccupancyRate = totalUnits > 0 ? (rentedUnits / totalUnits) : 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const uniqueMonths = new Set([...monthlyRevenue, ...monthlyExpenses].map(item => `${monthNames[item.month - 1]}, ${item.year}`));
    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => {
      const [aMonth, aYear] = a.split(', ');
      const [bMonth, bYear] = b.split(', ');
      return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    });

    // Calculate historical occupancy rates
    const formattedOccupancyData: [string, number][] = [];
    
    for (const monthYear of sortedMonths) {
      const [monthName, year] = monthYear.split(', ');
      const monthIndex = monthNames.findIndex(m => m === monthName) + 1;
      const startDate = new Date(parseInt(year), monthIndex - 1, 1);
      const endDate = new Date(parseInt(year), monthIndex, 0);

      // Count total units for the property (or all properties if no filter)
      const totalUnitsQuery = this.unitRepository.createQueryBuilder('unit')
        .where('unit.deleted_at IS NULL');
      
      if (propertyId) {
        totalUnitsQuery.andWhere('unit.property_id = :propertyId', { propertyId });
      }
      
      const totalUnitsCount = await totalUnitsQuery.getCount();

      if (totalUnitsCount === 0) {
        formattedOccupancyData.push([monthYear, 0]);
        continue;
      }

      // Count occupied units (with active leases) for the month
      const occupiedUnitsQuery = this.leaseRepository.createQueryBuilder('lease')
        .innerJoin('lease.unit', 'unit')
        .where('lease.start_date <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
        .andWhere('lease.end_date >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
        .andWhere('lease.status = :status', { status: 'active' })
        .andWhere('lease.deleted_at IS NULL')
        .andWhere('unit.deleted_at IS NULL');

      if (propertyId) {
        occupiedUnitsQuery.andWhere('unit.property_id = :propertyId', { propertyId });
      }

      const occupiedUnitsCount = await occupiedUnitsQuery.getCount();
      
      // Calculate occupancy rate (capped at 100%)
      const occupancyRate = Math.min(1, occupiedUnitsCount / totalUnitsCount);
      formattedOccupancyData.push([monthYear, parseFloat(occupancyRate.toFixed(2))]);
    }
    

    return {
      totalUnits,
      rentedUnits,
      activeTenants,
      totalRevenue,
      totalExpenses,
      overduePayments,
      activeLeases,
      monthlyRevenue,
      monthlyExpenses,
      occupancyRate: currentOccupancyRate,
      historicalOccupancy: formattedOccupancyData,
    };
  }
}
