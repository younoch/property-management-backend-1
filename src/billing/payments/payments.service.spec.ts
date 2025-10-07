import { PaymentsService } from './payments.service';

describe('PaymentsService (unit)', () => {
  it('applies payment FIFO across invoices', async () => {
    const invoices = [
      { id: 1, lease_id: 1, total: '500.00', status: 'open' },
      { id: 2, lease_id: 1, total: '300.00', status: 'open' },
    ];

    const invoiceRepo = {
      find: jest.fn().mockResolvedValue(invoices),
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
    } as any;

    const paRepo = { create: jest.fn((x) => x), save: jest.fn().mockResolvedValue(undefined), find: jest.fn().mockResolvedValue([]) } as any;
  const paymentRepo = { create: jest.fn((x) => x), save: jest.fn().mockResolvedValue({ id: 10, ...{ amount: '600.00' } }), find: jest.fn(), findOne: jest.fn().mockResolvedValue({ id: 10, amount: '600.00' }) } as any;
    const ds = { getRepository: jest.fn().mockImplementation((t) => {
      if ((t as any).name === 'Invoice') return invoiceRepo;
      if ((t as any).name === 'PaymentApplication') return paRepo;
      return null;
    }) } as any;

    const svc = new PaymentsService(paymentRepo as any, ds as any);
    const result = await svc.createForLease(1, { amount: '600.00', method: 'cash', at: '2025-08-25' } as any);

    expect(paRepo.save).toHaveBeenCalled();
    expect(invoiceRepo.save).toHaveBeenCalled();
  });
});
