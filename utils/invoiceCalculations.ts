import { InvoiceType, WorkInformationType } from '@/db/zodSchema';

//toDo: refactor that
export const calculateInvoiceWorkItemTotals = (workItems: WorkInformationType[], taxRate: number) => {
  const subtotal = workItems.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice.toString()) || 0;
    return sum + price;
  }, 0);

  const tax = subtotal * (taxRate / 100);
  const total = subtotal - tax;

  return { subtotal, tax, total };
};

export const calculateInvoiceTotal = (invoices: InvoiceType[]) => {
  const totalBeforeTax = invoices.reduce((sum, invoice) => sum + invoice.amountBeforeTax, 0);
  const totalAfterTax = invoices.reduce((sum, invoice) => sum + invoice.amountAfterTax, 0);
  const taxToPay = totalBeforeTax - totalAfterTax;


  return {
    totalBeforeTax,
    totalAfterTax,
    taxToPay,
  };
};