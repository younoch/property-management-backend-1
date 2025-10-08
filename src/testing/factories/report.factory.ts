import { Report } from '../../reports/report.entity';
import { User } from '../../users/user.entity';

export class ReportFactory {
  static create(overrides: Partial<Report> = {}, user?: User): Report {
    const report = new Report();
    Object.assign(report, {
      id: '00000000-0000-0000-0000-000000000001',
      approved: false,
      price: 25000,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      lng: -122.4194,
      lat: 37.7749,
      mileage: 50000,
      user: user || null,
      // BaseEntity fields will be handled by TypeORM
      ...overrides,
    });
    return report;
  }

  static createApproved(overrides: Partial<Report> = {}, user?: User): Report {
    return this.create({
      approved: true,
      ...overrides,
    }, user);
  }

  static createMany(count: number, overrides: Partial<Report> = {}, user?: User): Report[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
        price: 20000 + (index * 5000),
        year: 2018 + index,
        ...overrides,
      }, user)
    );
  }
} 