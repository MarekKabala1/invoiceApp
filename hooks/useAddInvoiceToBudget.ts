import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { db } from '@/db/config';
import { Transactions } from '@/db/schema';
import { InvoiceForUpdate } from '@/types';
import { generateId } from '@/utils/generateUuid';
import { categories } from '@/utils/categories';
import { eq, and } from 'drizzle-orm';

interface UseAddInvoiceToBudgetReturn {
	isCategoryModalVisible: boolean;
	selectedCategory: string | null;
	showCategoryModal: () => void;
	hideCategoryModal: () => void;
	setSelectedCategory: (categoryId: string | null) => void;
	handleAddInvoicesToBudget: (invoices: InvoiceForUpdate[], transactionDate?: string) => Promise<void>;
	incomeCategories: typeof categories.INCOME;
}

export const useAddInvoiceToBudget = (): UseAddInvoiceToBudgetReturn => {
	const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const showCategoryModal = useCallback(() => {
		setIsCategoryModalVisible(true);
	}, []);

	const hideCategoryModal = useCallback(() => {
		setIsCategoryModalVisible(false);
		setSelectedCategory(null);
	}, []);

	const handleAddInvoicesToBudget = useCallback(
		async (invoices: InvoiceForUpdate[], transactionDate?: string) => {
			if (!selectedCategory) {
				Alert.alert('Error', 'Please select a category');
				return;
			}

			try {
				let alreadyAddedCount = 0;
				let addedCount = 0;
				
				for (const invoice of invoices) {
					// Create unique identifier using invoice ID
					// This ensures each invoice can only be added once
					const invoiceIdentifier = `Invoice #${invoice.id}`;
					const description = `Invoice #${invoice.id} - ${invoice.customer.name}`;
					
					// Check if this specific invoice has already been added
					// Using invoice ID in description for unique identification
					const existing = await db
						.select()
						.from(Transactions)
						.where(
							and(
								eq(Transactions.description, description),
								eq(Transactions.userId, invoice.userId),
								eq(Transactions.type, 'INCOME')
							)
						)
						.limit(1);

					if (existing && existing.length > 0) {
						alreadyAddedCount++;
						continue;
					}

					const id = await generateId();
					
					// Use the provided transaction date, or fall back to invoice date
					const dateToUse = transactionDate || invoice.invoiceDate;
					
					await db.insert(Transactions).values({
						id: id.toString(),
						amount: invoice.amountAfterTax,
						description,
						date: dateToUse,
						type: 'INCOME',
						categoryId: selectedCategory,
						userId: invoice.userId,
						currency: invoice.currency,
					});
					addedCount++;
				}

				hideCategoryModal();

				if (addedCount > 0) {
					Alert.alert(
						'Success',
						`Added ${addedCount} invoice(s) to budget${alreadyAddedCount > 0 ? `, ${alreadyAddedCount} already added` : ''}`
					);
				} else {
					Alert.alert(
						'Info',
						'All selected invoices were already added to the budget.'
					);
				}
			} catch (error) {
				console.error('Error adding to budget:', error);
				Alert.alert('Error', 'Failed to add invoices to budget');
			}
		},
		[selectedCategory, hideCategoryModal]
	);

	return {
		isCategoryModalVisible,
		selectedCategory,
		showCategoryModal,
		hideCategoryModal,
		setSelectedCategory,
		handleAddInvoicesToBudget,
		incomeCategories: categories.INCOME,
	};
};
