import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const User = sqliteTable('My_Info', {
  id: integer('id').primaryKey(),
  fullName: text('full_name').notNull(),
  address: text('address').notNull(),
  emailAddress: text('email_address').notNull().unique(),
  phoneNumber: text('phone_number'),
  utrNumber: text('UTR_number').notNull(),
  ninNumber: text('NIN_number').notNull(),
});

export const Bank_Details = sqliteTable('Bank_Details', {
  id: integer('Id').primaryKey(),
  userId: integer('user_id').notNull().references(() => User.id),
  accountName: text('Account_Name').notNull(),
  sortCode: text('Sort_Code').notNull(),
  accountNumber: text('Account_Number').notNull(),
  bankName: text('Bank_Name').notNull(),

});

export const Customer = sqliteTable('Customer', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  emailAddress: text('email_address').notNull().unique(),
  phoneNumber: text('phone_number').notNull(),
});

export const Work_Information = sqliteTable('Work_Information', {
  id: integer('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => Invoice.id),
  descriptionOfWork: text('description_of_work'),
  unitPrice: real('unit_price').notNull(),
  date: text('day_of_week').notNull(),
  totalToPayMinusTax: real('total_to_pay_minus_tax').notNull(),
});

export const Invoice = sqliteTable('Invoice', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => User.id),
  customerId: integer('customer_id').notNull().references(() => Customer.id),
  invoiceDate: text('invoice_date').notNull(),
  dueDate: text('due_date'),
  amountAfterTax: real('amount_after_tax').notNull(),
  amountBeforeTax: real('amount_before_tax').notNull(),
  taxRate: real('tax_rate').notNull(),
  pdfPath: text('pdf_path'),
});

export const Payment = sqliteTable('Payments', {
  id: integer('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => Invoice.id),
  paymentDate: text('payment_date'),
  amountPaid: real('amount_paid').notNull(),
});

export const Note = sqliteTable('Notes', {
  id: integer('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => Invoice.id),
  noteDate: text('note_date').notNull(),
  noteText: text('note_text').notNull(),
});
