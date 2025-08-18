import { Report } from '../../reports/report.entity';
import { User } from '../../users/user.entity';

export class ReportFactory {
  static create(overrides: Partial<Report> = {}, user?: User): Report {
    return {
      id: 1,
      approved: false,
      price: 25000,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      lng: -122.4194,
      lat: 37.7749,
      mileage: 50000,
      user: user || null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      ...overrides,
    };
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
        id: index + 1,
        price: 20000 + (index * 5000),
        year: 2018 + index,
        ...overrides,
      }, user)
    );
  }
} 