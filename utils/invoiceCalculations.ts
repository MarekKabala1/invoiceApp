import { WorkInformationType } from '@/db/zodSchema';

export const calculateInvoiceTotals = (workItems: WorkInformationType[], taxRate: number) => {
  const subtotal = workItems.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice.toString()) || 0;
    return sum + price;
  }, 0);

  const tax = subtotal * (taxRate / 100);
  const total = subtotal - tax;

  return { subtotal, tax, total };
};