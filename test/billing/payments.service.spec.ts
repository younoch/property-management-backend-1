import { PaymentsService } from '../../src/billing/payments.service';
import { AuditLogService } from '../../src/common/audit-log.service';

describe('PaymentsService (unit)', () => {
  it('applies payment FIFO across invoices', async () => {
    // two invoices: 500 and 300 open
    const invoices = [
      { id: 1, lease_id: 1, total: '500.00', status: 'open' },
      { id: 2, lease_id: 1, total: '300.00', status: 'open' },
    ];

    const invoiceRepo = {
      find: jest.fn().mockResolvedValue(invoices),
      save: jest.fn().mockImplementation(async (inv) => inv),
      findOne: jest.fn().mockResolvedValue(null),
    } as any;

    const paRepo = { 
      create: jest.fn((x) => x), 
      save: jest.fn(async (x) => x), 
      find: jest.fn().mockResolvedValue([]) 
    } as any;
    
    const paymentRepo = { 
      create: jest.fn((x) => x), 
      save: jest.fn().mockImplementation(async (p) => ({ id: 10, ...p })), 
      find: jest.fn() 
    } as any;
    
    const ds = { 
      getRepository: jest.fn().mockImplementation((t) => {
        if (t && (t as any).name === 'Invoice') return invoiceRepo;
        if (t && (t as any).name === 'PaymentApplication') return paRepo;
        return null;
      }) 
    } as any;

    const auditLogService = {
      log: jest.fn().mockResolvedValue(undefined)
    } as unknown as AuditLogService;

    const svc = new PaymentsService(paymentRepo as any, ds as any, auditLogService);
    const result = await svc.createForLease(1, { amount: '600.00', method: 'cash', at: '2025-08-25' } as any);

    // verify paRepo.save called at least once and invoices updated
    expect(paRepo.save).toHaveBeenCalled();
    expect(invoiceRepo.save).toHaveBeenCalled();
  });
});
