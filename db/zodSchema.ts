import { z } from 'zod';

// User Schema
export const userSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2).max(255),
  address: z.string(),
  emailAddress: z.string().email(),
  phoneNumber: z.string().optional().nullable(),
  utrNumber: z.string().optional().nullable(),
  ninNumber: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

// BankDetails Schema
export const bankDetailsSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  accountName: z.string().optional(),
  sortCode: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  createdAt: z.string().optional(),
});

// Customer Schema
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  emailAddress: z.string().email(),
  phoneNumber: z.string().optional(),
  createdAt: z.string().optional(),
});


export const workInformationSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string(),
  descriptionOfWork: z.string(),
  unitPrice: z.number(),
  date: z.string(),
  totalToPayMinusTax: z.number(),
  createdAt: z.string().optional(),
});

// Invoice Schema
export const invoiceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  customerId: z.string(),
  invoiceDate: z.string(),
  dueDate: z.string(),
  amountAfterTax: z.number(),
  amountBeforeTax: z.number(),
  taxRate: z.number(),
  pdfPath: z.string().optional(),
  createdAt: z.string().optional(),
});

// Payment Schema
export const paymentSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string(),
  paymentDate: z.string(),
  amountPaid: z.number(),
  createdAt: z.string().optional(),
});

// Note Schema
export const noteSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string(),
  noteDate: z.string(),
  noteText: z.string(),
  createdAt: z.string().optional(),
});
