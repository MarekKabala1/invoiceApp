import { z } from 'zod';

// User Schema
export const userSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2).max(255).nullable(),
  address: z.string().nullable(),
  emailAddress: z.string().email().nullable(),
  phoneNumber: z.string().optional().nullable(),
  utrNumber: z.string().optional().nullable(),
  ninNumber: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(), // Optional because it's auto-generated
});

// BankDetails Schema
export const bankDetailsSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  accountName: z.string().optional(),
  sortCode: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  createdAt: z.string().optional(), // Optional because it's auto-generated
});

// Customer Schema
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  emailAddress: z.string().email(), // Make sure email is unique
  phoneNumber: z.string().optional(),
  createdAt: z.string().optional(), // Optional because it's auto-generated
});

// WorkInformation Schema (assuming a separate Invoice table exists)
export const workInformationSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string(), // Reference existing invoice ID
  descriptionOfWork: z.string(),
  unitPrice: z.number(),
  date: z.string(),
  totalToPayMinusTax: z.number(),
  createdAt: z.string().optional(), // Optional because it's auto-generated
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
  createdAt: z.string().optional(), // Optional because it's auto-generated
});

// Payment Schema
export const paymentSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string(),
  paymentDate: z.string(),
  amountPaid: z.number(),
  createdAt: z.string().optional(), // Optional because it's auto-generated
});

// Note Schema
export const noteSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string(),
  noteDate: z.string(),
  noteText: z.string(),
  createdAt: z.string().optional(), // Optional because it's auto-generated
});