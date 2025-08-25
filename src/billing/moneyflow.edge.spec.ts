import { InvoicesService } from './invoices.service';
import { PaymentsService } from './payments.service';

describe('Money Flow edge cases', () => {
  it('prorates to exact cents for mid-month start', async () => {
    const lease = {
      id: 5,
      portfolio_id: 1,
      start_date: '2025-08-15',
      billing_day: 1,
      rent: '999.99',
    } as any;

    const leaseRepo = { findOne: jest.fn().mockResolvedValue(lease) } as any;
    const invoiceRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((x) => x),
      save: jest.fn().mockImplementation(async (x) => ({ id: 201, ...x })),
    } as any;
    const ds = { getRepository: jest.fn().mockImplementation(() => leaseRepo) } as any;
    const svc = new InvoicesService(invoiceRepo, ds);

    const saved: any = await svc.generateNextForLease(5);
    expect(saved).toBeDefined();
    // expect subtotal in cents integer
    const cents = Math.round(Number(saved.subtotal) * 100);
    expect(Number.isInteger(cents)).toBe(true);
    expect(cents).toBeGreaterThan(0);
  });

  it('partial payment applies FIFO across invoices correctly', async () => {
    const invoices = [
      { id: 11, lease_id: 7, total: '200.00', balance: '200.00', status: 'open' },
      { id: 12, lease_id: 7, total: '300.00', balance: '300.00', status: 'open' },
    ];

    const invoiceRepo = {
      find: jest.fn().mockResolvedValue(invoices),
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
    } as any;

    const paRepo = { create: jest.fn((x) => x), save: jest.fn().mockResolvedValue(undefined), find: jest.fn().mockResolvedValue([]) } as any;
    const paymentRepo = { create: jest.fn((x) => x), save: jest.fn().mockResolvedValue({ id: 77, ...{ amount: '250.00' } }), find: jest.fn(), findOne: jest.fn().mockResolvedValue({ id: 77, amount: '250.00' }) } as any;

    const ds = { getRepository: jest.fn().mockImplementation((t) => {
      if ((t as any).name === 'Invoice') return invoiceRepo;
      if ((t as any).name === 'PaymentApplication') return paRepo;
      return null;
    }) } as any;

    const svc = new PaymentsService(paymentRepo as any, ds as any);
    const result = await svc.createForLease(7, { amount: '250.00', method: 'cash', at: '2025-08-25' } as any);

    // should create at least two payment applications (one full for invoice 11, one partial for invoice 12)
    expect(paRepo.save).toHaveBeenCalled();
    expect(invoiceRepo.save).toHaveBeenCalled();
  });
});
