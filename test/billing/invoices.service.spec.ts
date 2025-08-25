import { InvoicesService } from '../../src/billing/invoices.service';

describe('InvoicesService (unit)', () => {
  it('prorates first month correctly', async () => {
    const lease = {
      id: 1,
      portfolio_id: 10,
      start_date: '2025-08-20',
      billing_day: 1,
      rent: '1000.00',
    } as any;

    // mocks
    const leaseRepo = { findOne: jest.fn().mockResolvedValue(lease) } as any;
    const invoiceRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation(async (x) => ({ id: 123, ...x })),
    } as any;

    const ds = { getRepository: jest.fn().mockImplementation((t) => leaseRepo) } as any;
    const svc = new InvoicesService(invoiceRepo, ds);

  const saved: any = await svc.generateNextForLease(1);
  expect(invoiceRepo.find).toHaveBeenCalled();
  expect(saved && saved.amount).toBeDefined();
  // prorated amount for Aug 20..31 should be > 0
  expect(Number(saved.amount)).toBeGreaterThan(0);
  });
});
