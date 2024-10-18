
import { invoiceSchema } from '@/db/zodSchema';
import { z } from 'zod';

type InvoiceType = z.infer<typeof invoiceSchema>;

export const calculateInvoiceTotals = (invoices: InvoiceType[]) => {
  const totalBeforeTax = invoices.reduce((sum, invoice) => sum + invoice.amountBeforeTax, 0);
  const totalAfterTax = invoices.reduce((sum, invoice) => sum + invoice.amountAfterTax, 0);
  const taxToPay = totalBeforeTax - totalAfterTax;

  return {
    totalBeforeTax,
    totalAfterTax,
    taxToPay
  };
};