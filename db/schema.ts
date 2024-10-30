import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const User = sqliteTable('User', {
  id: text('id').primaryKey(),
  fullName: text('full_name'),
  address: text('address'),
  emailAddress: text('email_address').unique(),
  phoneNumber: text('phone_number'),
  utrNumber: text('UTR_number'),
  ninNumber: text('NIN_number'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.emailAddress),
  };
});

export const BankDetails = sqliteTable('Bank_Details', {
  id: text('Id').primaryKey(),
  userId: text('user_id').references(() => User.id),
  accountName: text('Account_Name'),
  sortCode: text('Sort_Code'),
  accountNumber: text('Account_Number'),
  bankName: text('Bank_Name'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`),
}, (table) => {
  return {
    userIdx: index('user_idx').on(table.userId),
  };
});

export const Customer = sqliteTable('Customer', {
  id: text('id').primaryKey(),
  name: text('name'),
  address: text('address'),
  emailAddress: text('email_address').unique(),
  phoneNumber: text('phone_number'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.emailAddress),
  };
});

export const WorkInformation = sqliteTable('Work_Information', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => Invoice.id),
  descriptionOfWork: text('description_of_work'),
  unitPrice: real('unit_price'),
  date: text('day_of_week'),
  totalToPayMinusTax: real('total_to_pay_minus_tax'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`),
}, (table) => {
  return {
    invoiceIdx: index('invoice_idx').on(table.invoiceId),
  };
});

export const Invoice = sqliteTable('Invoice', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => User.id),
  customerId: text('customer_id').references(() => Customer.id),
  invoiceDate: text('invoice_date'),
  dueDate: text('due_date'),
  amountAfterTax: real('amount_after_tax'),
  amountBeforeTax: real('amount_before_tax'),
  taxRate: real('tax_rate'),
  pdfPath: text('pdf_path'),
  currency: text('currency').default('GBP'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`),
}, (table) => {
  return {
    userIdx: index('user_idx').on(table.userId),
    customerIdx: index('customer_idx').on(table.customerId),
  };
});

export const Payment = sqliteTable('Payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => Invoice.id),
  paymentDate: text('payment_date'),
  amountPaid: real('amount_paid'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`),
}, (table) => {
  return {
    invoiceIdx: index('invoice_idx').on(table.invoiceId),
  };
});

export const Note = sqliteTable('Notes', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => Invoice.id),
  noteDate: text('note_date'),
  noteText: text('note_text'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`),
}, (table) => {
  return {
    invoiceIdx: index('invoice_idx').on(table.invoiceId),
  };
});

export const Categories = sqliteTable('Categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
}, (table) => {
  return {
    nameIdx: uniqueIndex('name_idx').on(table.name),
  };
});

export const Transactions = sqliteTable('Transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => User.id).notNull(),
  categoryId: text('category_id').references(() => Categories.id).notNull(),
  amount: real('amount').notNull(),
  date: text('date').notNull(),
  currency: text('currency').default('GBP'),
  description: text('description').default(''),
  type: text('type').notNull(),
}, (table) => {
  return {
    userIdx: index('user_idx').on(table.userId),
    categoryIdx: index('category_idx').on(table.categoryId),
    dateIdx: index('date_idx').on(table.date),
  };
});
