import { z } from 'zod';

// User Schema
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const userSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(255),
  address: z.string().min(2, { message: 'Address must be provided' }).max(255),
  emailAddress: z.string().email({ message: 'Email address is required' }).regex(emailRegex, { message: 'Invalid email address example: 0z2Q2@example.com' }),
  phoneNumber: z.string().optional(),
  utrNumber: z.string().optional(),
  ninNumber: z.string().optional(),
  createdAt: z.string().optional(),
  isAdmin: z.boolean().optional(),
});

// BankDetails Schema
export const bankDetailsSchema = z.object({
  id: z.string(),
  userId: z.string({ message: 'User is required' }),
  accountName: z.string().optional(),
  sortCode: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  createdAt: z.string().optional(),
});

// Customer Schema
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be provided' }).max(255),
  address: z.string().optional(),
  emailAddress: z.string().email({ message: 'Email address is required' }).regex(emailRegex, { message: 'Invalid email address' }),
  phoneNumber: z.string().optional(),
  createdAt: z.string().optional(),
});


export const workInformationSchema = z.object({
  id: z.string(),
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
  userId: z.string({ message: 'Select User for Invoice' }),
  customerId: z.string({ message: 'Select Customer for Invoice' }),
  invoiceDate: z.string({ message: 'Select Invoice Date' }),
  dueDate: z.string({ message: 'Select Due Date' }),
  amountAfterTax: z.number(),
  amountBeforeTax: z.number(),
  taxRate: z.number(),
  pdfPath: z.string().optional(),
  createdAt: z.string().optional(),
  currency: z.string().default('GBP'),
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

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
});

export const transactionSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1, { message: 'Select Category' }),
  userId: z.string().min(1, { message: 'Select User for Transaction' }),
  amount: z.number().positive({ message: 'Price is Require must be a positive number' }),
  date: z.string().min(1),
  description: z.string().default(''),
  type: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
  currency: z.string().default('GBP'),
});

// Types
export type UserType = z.infer<typeof userSchema>;
export type BankDetailsType = z.infer<typeof bankDetailsSchema>;
export type CustomerType = z.infer<typeof customerSchema>;
export type WorkInformationType = z.infer<typeof workInformationSchema>;
export type InvoiceType = z.infer<typeof invoiceSchema>;
export type PaymentType = z.infer<typeof paymentSchema>;
export type NoteType = z.infer<typeof noteSchema>;
export type CategoryType = z.infer<typeof categorySchema>;
export type TransactionType = z.infer<typeof transactionSchema>;
