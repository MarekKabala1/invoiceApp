import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const User = sqliteTable('User', {
  id: text('id').primaryKey(),
  fullName: text('full_name'),
  address: text('address'),
  emailAddress: text('email_address').unique(),
  phoneNumber: text('phone_number'),
  utrNumber: text('UTR_number'),
  ninNumber: text('NIN_number'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`)
});

export const BankDetails = sqliteTable('Bank_Details', {
  id: text('Id').primaryKey(),
  userId: text('user_id').references(() => User.id),
  accountName: text('Account_Name'),
  sortCode: text('Sort_Code'),
  accountNumber: text('Account_Number'),
  bankName: text('Bank_Name'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`)

});

export const Customer = sqliteTable('Customer', {
  id: text('id').primaryKey(),
  name: text('name'),
  address: text('address'),
  emailAddress: text('email_address').unique(),
  phoneNumber: text('phone_number'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`)
});

export const WorkInformation = sqliteTable('Work_Information', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => Invoice.id),
  descriptionOfWork: text('description_of_work'),
  unitPrice: real('unit_price'),
  date: text('day_of_week'),
  totalToPayMinusTax: real('total_to_pay_minus_tax'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`)
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
  createdAt: text('timestamp').default(sql`(current_timestamp)`)
});

export const Payment = sqliteTable('Payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => Invoice.id),
  paymentDate: text('payment_date'),
  amountPaid: real('amount_paid'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`)
});

export const Note = sqliteTable('Notes', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => Invoice.id),
  noteDate: text('note_date'),
  noteText: text('note_text'),
  createdAt: text('timestamp').default(sql`(current_timestamp)`)
});