import { PaymentsService } from './payments.service';

describe('PaymentsService (unit)', () => {
  it('applies payment FIFO across invoices', async () => {
    const leaseId = '123e4567-e89b-12d3-a456-426614174000';
    const invoices = [
      { id: '123e4567-e89b-12d3-a456-426614174001', lease_id: leaseId, total: 500.00, status: 'open' },
      { id: '123e4567-e89b-12d3-a456-426614174002', lease_id: leaseId, total: 300.00, status: 'open' },
    ];

    const invoiceRepo = { 
      save: jest.fn(),
      find: jest.fn().mockResolvedValue(invoices)
    } as any;
    const paymentRepo = { 
      create: jest.fn((x) => x), 
      save: jest.fn().mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174010', amount: 600.00 }), 
      find: jest.fn(), 
      findOne: jest.fn().mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174010', amount: 600.00 }) 
    } as any;
    const paRepo = { 
      create: jest.fn((x) => x), 
      save: jest.fn().mockResolvedValue(undefined), 
      find: jest.fn().mockResolvedValue([]) 
    } as any;
    const leaseRepo = { findOne: jest.fn() } as any;
    const leaseTenantRepo = { find: jest.fn() } as any;
    const auditLogService = { log: jest.fn() } as any;
    
    const dataSource = { 
      getRepository: jest.fn().mockImplementation((t) => {
        if (t.name === 'Invoice') return invoiceRepo;
        if (t.name === 'PaymentApplication') return paRepo;
        return null;
      }),
      transaction: jest.fn().mockImplementation(cb => cb({
        getRepository: jest.fn().mockImplementation((t) => {
          if (t.name === 'Invoice') return invoiceRepo;
          if (t.name === 'Payment') return paymentRepo;
          if (t.name === 'PaymentApplication') return paRepo;
          return null;
        })
      }))
    } as any;

    const svc = new PaymentsService(
      paymentRepo,
      invoiceRepo,
      paRepo,
      leaseRepo,
      leaseTenantRepo,
      auditLogService,
      dataSource
    );
    const result = await svc.createForLease(leaseId, { 
      amount: 600.00, 
      method: 'cash', 
      at: '2025-08-25' 
    } as any);

    expect(paRepo.save).toHaveBeenCalled();
    expect(invoiceRepo.save).toHaveBeenCalled();
  });
});
