import { db } from '@/db/config';
import { Customer, User, Invoice, WorkInformation, Payment, BankDetails, Note } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from './generateUuid';
import { calculateInvoiceWorkItemTotals } from './invoiceCalculations';
import { CustomerType, InvoiceType, PaymentType, WorkInformationType, BankDetailsType, NoteType, UserType } from '@/db/zodSchema';
import * as MailComposer from 'expo-mail-composer';
import * as Print from 'expo-print';
import { generateInvoiceHtml } from '@/templates/invoiceTemplate';
import { generateAndSavePdf } from './pdfOperations';

export const getInvoiceForNumber = async (): Promise<string> => {
  try {
    const getInvoices = await db.select().from(Invoice);
    if (!getInvoices || getInvoices.length === 0) {
      return 'No Invoices found';
    }

    const sortedData = [...getInvoices].sort((a, b) => {
      const idA = Number(a.id);
      const idB = Number(b.id);
      return idB - idA;
    });

    const mostRecentId = sortedData[0]?.id;
    if (!mostRecentId) {
      return 'No Invoice found';
    }
    return mostRecentId;
  } catch (error) {
    console.error('Error getting invoices:', error);
    return 'An error occurred while getting invoices';
  }
};

export const getCustomers = async (isUpdateMode: boolean, customerId?: string): Promise<Array<{ label: string; value: string }>> => {
  if (isUpdateMode && customerId) {
    const customerData = await db
      .select()
      .from(Customer)
      .where(eq(Customer.id, customerId));

    return customerData.map((customer) => ({
      label: customer.name || 'Unnamed Customer',
      value: customer.id,
    }));
  } else {
    const customersFromDb = await db.select().from(Customer);
    return customersFromDb.map((customer) => ({
      label: customer.name || 'Unnamed Customer',
      value: customer.id,
    }));
  }
};

export const getUsers = async (isUpdateMode: boolean, userId?: string): Promise<Array<{ label: string; value: string }>> => {
  if (isUpdateMode && userId) {
    const getUser = await db
      .select()
      .from(User)
      .where(eq(User.id, userId));
    return getUser.map((user) => ({
      label: user.fullName || 'Unnamed User',
      value: user.id,
    }));
  } else {
    const usersFromDb = await db.select().from(User);
    return usersFromDb.map((user) => ({
      label: user.fullName || 'Unnamed User',
      value: user.id,
    }));
  }
};

export const getCustomerDetails = async (customerId: string): Promise<CustomerType | null> => {
  const customer = await db.select().from(Customer).where(eq(Customer.id, customerId));
  if (customer.length > 0) {
    return {
      name: customer[0].name || 'Unnamed Customer',
      emailAddress: customer[0].emailAddress || '',
      id: customer[0].id,
      address: customer[0].address || '',
      phoneNumber: customer[0].phoneNumber || '',
      createdAt: customer[0].createdAt || '',
    };
  }
  return null;
};

export const getUserAndBankDetails = async (userId: string): Promise<{ userDetails: UserType | null; bankDetails: BankDetailsType | null }> => {
  const user = await db.select().from(User).where(eq(User.id, userId));
  let userDetails: UserType | null = null;
  let bankDetails: BankDetailsType | null = null;

  if (user.length > 0) {
    userDetails = {
      id: user[0].id,
      fullName: user[0].fullName || 'Unnamed User',
      emailAddress: user[0].emailAddress || '',
      address: user[0].address || '',
      phoneNumber: user[0].phoneNumber || '',
      utrNumber: user[0].utrNumber || '',
      ninNumber: user[0].ninNumber || '',
      createdAt: user[0].createdAt || '',
    };

    const bankDetailsForUser = await db.select().from(BankDetails).where(eq(BankDetails.userId, userId));
    if (bankDetailsForUser.length > 0) {
      bankDetails = {
        id: bankDetailsForUser[0].id,
        createdAt: bankDetailsForUser[0].createdAt || '',
        userId: bankDetailsForUser[0].userId || '',
        accountName: bankDetailsForUser[0].accountName || '',
        sortCode: bankDetailsForUser[0].sortCode || '',
        accountNumber: bankDetailsForUser[0].accountNumber || '',
        bankName: bankDetailsForUser[0].bankName || '',
      };
    }
  }

  return { userDetails, bankDetails };
};

export const handleSaveInvoice = async (
  data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] },
  isUpdateMode: boolean,
  note: string,
  noteItemId?: string
): Promise<void> => {
  const { subtotal, tax, total, remainingBalance } = calculateInvoiceWorkItemTotals(data.workItems, data.taxRate, data.payments);
  const id = data.id || '';

  const newInvoice = {
    id,
    customerId: data.customerId,
    userId: data.userId,
    invoiceDate: data.invoiceDate,
    dueDate: data.dueDate,
    amountAfterTax: total,
    amountBeforeTax: remainingBalance,
    taxRate: data.taxRate,
    createdAt: data.invoiceDate,
  };

  if (isUpdateMode) {
    const updatedInvoice = {
      ...data,
      taxRate: data.taxRate,
      amountAfterTax: total,
      amountBeforeTax: remainingBalance,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      createdAt: data.invoiceDate,
    };
    await db
      .update(Invoice)
      .set(updatedInvoice)
      .where(eq(Invoice.id, id));
  } else {
    await db.insert(Invoice).values(newInvoice);
  }

  await handleWorkItems(data, id, isUpdateMode);
  await handlePayments(data, id, isUpdateMode);
  await handleNotes(id, data, note, noteItemId, isUpdateMode);
};

const handleWorkItems = async (
  data: InvoiceType & { workItems: WorkInformationType[] },
  id: string,
  isUpdateMode: boolean
): Promise<void> => {
  if (isUpdateMode) {
    const existingWorkItems = await db.select().from(WorkInformation).where(eq(WorkInformation.invoiceId, id));
    const processedWorkItemIds = new Set<string>();

    for (const workItem of data.workItems) {
      const matchingExistingItem = existingWorkItems.find((existing) => existing.id === workItem.id);
      const workItemMinusRax = calculateInvoiceWorkItemTotals([workItem], data.taxRate).total;

      if (matchingExistingItem) {
        await db
          .update(WorkInformation)
          .set({
            descriptionOfWork: workItem.descriptionOfWork,
            unitPrice: workItem.unitPrice,
            date: workItem.date,
            totalToPayMinusTax: workItem.unitPrice,
            createdAt: data.invoiceDate,
          })
          .where(eq(WorkInformation.id, matchingExistingItem.id));

        processedWorkItemIds.add(matchingExistingItem.id);
      } else {
        const newWorkId = await generateId();
        await db.insert(WorkInformation).values({
          id: newWorkId,
          invoiceId: id,
          descriptionOfWork: workItem.descriptionOfWork,
          unitPrice: workItem.unitPrice,
          date: workItem.date,
          totalToPayMinusTax: workItem.unitPrice,
          createdAt: data.invoiceDate,
        });
      }
    }

    const workItemsToRemove = existingWorkItems
      .filter((existing) => !processedWorkItemIds.has(existing.id))
      .map((item) => item.id);

    if (workItemsToRemove.length > 0) {
      await Promise.all(workItemsToRemove.map((itemId) => db.delete(WorkInformation).where(eq(WorkInformation.id, itemId))));
    }
  } else {
    for (const workItem of data.workItems) {
      const workId = await generateId();
      const workItems = {
        id: workId,
        invoiceId: id,
        descriptionOfWork: workItem.descriptionOfWork,
        unitPrice: workItem.unitPrice,
        date: workItem.date,
        totalToPayMinusTax: workItem.unitPrice,
        createdAt: data.invoiceDate,
      };
      await db.insert(WorkInformation).values(workItems);
    }
  }
};

const handlePayments = async (
  data: InvoiceType & { payments: PaymentType[] },
  id: string,
  isUpdateMode: boolean
): Promise<void> => {
  if (isUpdateMode) {
    const existingPayments = await db.select().from(Payment).where(eq(Payment.invoiceId, id));
    const processedPaymentIds = new Set<string>();

    for (const payment of data.payments) {
      const matchingExistingItem = existingPayments.find((existing) => existing.id === payment.id);

      if (matchingExistingItem) {
        await db
          .update(Payment)
          .set({
            paymentDate: payment.paymentDate,
            amountPaid: payment.amountPaid,
            createdAt: payment.createdAt,
          })
          .where(eq(Payment.id, matchingExistingItem.id));

        processedPaymentIds.add(matchingExistingItem.id);
      } else {
        const paymentId = await generateId();
        await db.insert(Payment).values({
          id: paymentId,
          invoiceId: id,
          paymentDate: payment.paymentDate,
          amountPaid: payment.amountPaid,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const paymentsToRemove = existingPayments
      .filter((existing) => !processedPaymentIds.has(existing.id))
      .map((item) => item.id);

    if (paymentsToRemove.length > 0) {
      await Promise.all(paymentsToRemove.map((paymentId) => db.delete(Payment).where(eq(Payment.id, paymentId))));
    }
  } else {
    for (const payment of data.payments) {
      const paymentId = await generateId();
      const payments = {
        id: paymentId,
        invoiceId: id,
        paymentDate: payment.paymentDate,
        amountPaid: payment.amountPaid,
        createdAt: new Date().toISOString(),
      };
      await db.insert(Payment).values(payments);
    }
  }
};

const handleNotes = async (
  invoiceId: string,
  data: InvoiceType,
  note: string,
  noteItemId?: string,
  isUpdateMode?: boolean
): Promise<void> => {
  if (note.trim()) {
    if (isUpdateMode && noteItemId) {
      await db
        .update(Note)
        .set({
          noteText: note,
          noteDate: data.invoiceDate,
        })
        .where(eq(Note.id, noteItemId));
    } else {
      const noteId = await generateId();
      const notes = {
        id: noteId,
        invoiceId: invoiceId,
        noteText: note,
        noteDate: data.invoiceDate,
        createdAt: new Date().toISOString(),
      };
      await db.insert(Note).values(notes);
    }
  }
};

export const handleSendInvoice = async (
  data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] },
  selectedUser: UserType,
  selectedCustomer: CustomerType,
  bankDetails: BankDetailsType,
  note: string
): Promise<void> => {
  const { subtotal, tax, total, remainingBalance } = calculateInvoiceWorkItemTotals(data.workItems, data.taxRate, data.payments);

  const html = generateInvoiceHtml({
    data: {
      ...data,
      user: selectedUser,
      customer: selectedCustomer,
      bankDetails: bankDetails,
      notes: note,
      payments: data.payments,
    },
    tax,
    subtotal,
    total,
    remainingBalance,
  });

  try {
    const { uri } = await Print.printToFileAsync({ html });

    await MailComposer.composeAsync({
      subject: `Invoice ${data.id}`,
      body: 'Please find the attached invoice.',
      attachments: [uri],
    });
  } catch (error) {
    console.error('Error generating or sending PDF:', error);
  }
};

export const handleExportPdfInvoice = async (
  data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] },
  selectedUser: UserType,
  selectedCustomer: CustomerType,
  bankDetails: BankDetailsType,
  note: string
): Promise<void> => {
  const { subtotal, tax, total, remainingBalance } = calculateInvoiceWorkItemTotals(data.workItems, data.taxRate, data.payments);

  await generateAndSavePdf({
    data: {
      ...data,
      user: selectedUser,
      customer: selectedCustomer,
      bankDetails: bankDetails,
      notes: note,
      payments: data.payments,
    },
    tax,
    subtotal,
    total,
    remainingBalance,
  });
};

export const handlePreviewInvoice = (
  data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] },
  selectedUser: UserType,
  selectedCustomer: CustomerType,
  bankDetails: BankDetailsType,
  note: string
): string => {
  const { subtotal, tax, total, remainingBalance } = calculateInvoiceWorkItemTotals(data.workItems, data.taxRate, data.payments);

  return generateInvoiceHtml({
    data: {
      ...data,
      user: selectedUser,
      customer: selectedCustomer,
      bankDetails: bankDetails,
      notes: note,
      payments: data.payments,
    },
    subtotal,
    tax,
    total,
    remainingBalance,
  });
};