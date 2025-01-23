import { InvoiceType, WorkInformationType, PaymentType } from '@/db/zodSchema';

//toDo: refactor that
export const calculateInvoiceWorkItemTotals = (workItems: WorkInformationType[], taxRate: number, payments?: PaymentType[]) => {
  const subtotal = workItems.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice.toString()) || 0;
    return sum + price;
  }, 0);

  const tax = subtotal * (taxRate / 100);

  const totalPayments = payments && payments.length > 0
    ? payments.reduce((sum, payment) => sum + payment.amountPaid, 0)
    : 0;


  const remainingBalance = subtotal - totalPayments;

  const total = remainingBalance - tax;

  return {
    subtotal,
    tax,
    total,
    remainingBalance,
  };
};

export const calculateInvoiceTotal = (invoices: InvoiceType[], payments?: PaymentType) => {
  const totalBeforeTax = invoices.reduce((sum, invoice) => sum + invoice.amountBeforeTax, 0);
  const totalAfterTax = invoices.reduce((sum, invoice) => sum + invoice.amountAfterTax, 0);
  const totalAfterPayment = totalBeforeTax - payments!.amountPaid
  const taxToPay = totalBeforeTax - totalAfterTax;


  return {
    totalBeforeTax,
    totalAfterTax,
    totalAfterPayment,
    taxToPay,
  };
};