export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  ACH_TRANSFER = 'ach_transfer',
  WIRE_TRANSFER = 'wire_transfer',
  CHECK = 'check',
  MONEY_ORDER = 'money_order',
  CASH = 'cash',
  PAYPAL = 'paypal',
  VENMO = 'venmo',
  ZELLE = 'zelle',
  CASH_APP = 'cash_app',
  CRYPTOCURRENCY = 'cryptocurrency',
  OTHER = 'other'
}

// Map enum values to display names
const paymentMethodDisplayNames: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.DEBIT_CARD]: 'Debit Card',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.ACH_TRANSFER]: 'ACH Transfer',
  [PaymentMethod.WIRE_TRANSFER]: 'Wire Transfer',
  [PaymentMethod.CHECK]: 'Check',
  [PaymentMethod.MONEY_ORDER]: 'Money Order',
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.PAYPAL]: 'PayPal',
  [PaymentMethod.VENMO]: 'Venmo',
  [PaymentMethod.ZELLE]: 'Zelle',
  [PaymentMethod.CASH_APP]: 'Cash App',
  [PaymentMethod.CRYPTOCURRENCY]: 'Cryptocurrency',
  [PaymentMethod.OTHER]: 'Other'
};

export const PAYMENT_METHODS = Object.values(PaymentMethod);

export function getPaymentMethodDisplayName(method: PaymentMethod): string {
  return paymentMethodDisplayNames[method] || method;
}

export function getPaymentMethodOptions() {
  return Object.entries(paymentMethodDisplayNames).map(([value, label]) => ({
    value,
    label
  }));
}
