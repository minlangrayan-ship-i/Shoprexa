export const paymentProviders = [
  { id: 'MOCK', label: 'Simulation de paiement (test)' },
  { id: 'FLUTTERWAVE', label: 'Flutterwave' },
  { id: 'CINETPAY', label: 'CinetPay' },
  { id: 'PAYSTACK', label: 'Paystack (fallback mock)' }
] as const;
