import { useCallback } from 'react';
import { db } from '@/db/config';
import { Transactions, Invoice } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Hook to manage the link between invoices and transactions
 * Transactions are identified by description format: "Invoice #<invoiceId> - <customerName>"
 */
export const useInvoiceTransaction = () => {
	
	/**
	 * Delete the transaction associated with an invoice
	 * @param invoiceId - The invoice ID
	 * @param customerName - The customer name (optional, for matching)
	 * @returns true if a transaction was deleted, false otherwise
	 */
	const deleteInvoiceTransaction = useCallback(async (invoiceId: string, customerName?: string): Promise<boolean> => {
		try {
			// Find transactions that match this invoice
			// Format: "Invoice #123_2025 - Customer Name"
			const allTransactions = await db.select().from(Transactions);
			
			for (const transaction of allTransactions) {
				if (transaction.description?.startsWith('Invoice #')) {
					const match = transaction.description.match(/^Invoice #(.+?)_/);
					if (match && match[1] === invoiceId) {
						// Found the transaction for this invoice, delete it
						await db.delete(Transactions).where(eq(Transactions.id, transaction.id));
						return true;
					}
				}
			}
			return false;
		} catch (error) {
			return false;
		}
	}, []);

	/**
	 * Check if an invoice has a transaction in budget
	 * @param invoiceId - The invoice ID
	 * @returns true if transaction exists, false otherwise
	 */
	const hasInvoiceTransaction = useCallback(async (invoiceId: string): Promise<boolean> => {
		try {
			const allTransactions = await db.select().from(Transactions);
			
			for (const transaction of allTransactions) {
				if (transaction.description?.startsWith('Invoice #')) {
					const match = transaction.description.match(/^Invoice #(.+?)_/);
					if (match && match[1] === invoiceId) {
						return true;
					}
				}
			}
			return false;
		} catch (error) {
			return false;
		}
	}, []);

	return {
		deleteInvoiceTransaction,
		hasInvoiceTransaction,
	};
};
