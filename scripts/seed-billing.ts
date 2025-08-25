import 'dotenv/config';
import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/users/user.entity';
import { Portfolio } from '../src/portfolios/portfolio.entity';
import { Property } from '../src/properties/property.entity';
import { Unit } from '../src/properties/unit.entity';
import { Lease } from '../src/tenancy/lease.entity';
import { InvoicesService } from '../src/billing/invoices.service';
import { PaymentsService } from '../src/billing/payments.service';

async function main() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const portfolioRepo = AppDataSource.getRepository(Portfolio);
  const propertyRepo = AppDataSource.getRepository(Property);
  const unitRepo = AppDataSource.getRepository(Unit);
  const leaseRepo = AppDataSource.getRepository(Lease);

  const user = (await userRepo.save(userRepo.create({ name: 'Seed User', email: `seed+${Date.now()}@example.com`, password_hash: 'seed', role: 'landlord' } as any))) as any;
  const portfolio = (await portfolioRepo.save(portfolioRepo.create({ name: 'Seed Portfolio', landlord_id: (user as any).id, subscription_plan: 'free' } as any))) as any;
  const property = (await propertyRepo.save(propertyRepo.create({ portfolio_id: (portfolio as any).id, name: 'Seed Property', address_line1: '123 Seed St', city: 'Seedville', state: 'SeedState', zip_code: '12345', country: 'Seedland', latitude: 0.0, longitude: 0.0, property_type: 'residential' } as any))) as any;
  const unit = (await unitRepo.save(unitRepo.create({ portfolio_id: (portfolio as any).id, property_id: (property as any).id, label: 'Unit 1', status: 'vacant' } as any))) as any;

  const lease = (await leaseRepo.save(leaseRepo.create({ portfolio_id: (portfolio as any).id, unit_id: (unit as any).id, start_date: new Date().toISOString().slice(0,10), end_date: new Date(Date.now() + 1000*60*60*24*30).toISOString().slice(0,10), rent: '1000.00', billing_day: 1, status: 'active' } as any))) as any;

  const invoicesService = new InvoicesService(AppDataSource.getRepository((await import('../src/billing/invoice.entity')).Invoice), AppDataSource as any);
  const paymentsService = new PaymentsService(AppDataSource.getRepository((await import('../src/billing/payment.entity')).Payment) as any, AppDataSource as any);

  console.log('Generating invoice for lease', lease.id);
  const invoice = await invoicesService.generateNextForLease(lease.id);
  console.log('Generated invoice', invoice);

  console.log('Recording payment for lease', lease.id);
  const payment = await paymentsService.createForLease(lease.id, { amount: '1000.00', method: 'cash', at: new Date().toISOString().slice(0,10) });
  console.log('Recorded payment', payment);

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
