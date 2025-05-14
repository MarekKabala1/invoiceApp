import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InvoiceCard from './InvoiceCard';
import { Invoice, Payment, Note, WorkInformation, Customer, Transactions } from '@/db/schema';
import { z } from 'zod';
import { db } from '@/db/config';
import { InvoiceType, WorkInformationType, PaymentType, NoteType, CustomerType } from '@/db/zodSchema';
import { InvoiceForUpdate } from '@/types';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { categories, getCategoryById } from '@/utils/categories';
import { generateId } from '@/utils/generateUuid';

export default function InvoiceList() {
	const [data, setData] = useState<{
		invoices: InvoiceType[];
		payments: PaymentType[];
		notes: NoteType[];
		workItems: WorkInformationType[];
		customers: CustomerType[];
	}>({
		invoices: [],
		payments: [],
		notes: [],
		workItems: [],
		customers: [],
	});
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [filterCustomer, setFilterCustomer] = useState<string>('');
	const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
	const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const router = useRouter();
	const { colors } = useTheme();

	const loadData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [invoicesData, paymentsData, notesData, workItemsData, customersData] = await Promise.all([
				db.select().from(Invoice),
				db.select().from(Payment),
				db.select().from(Note),
				db.select().from(WorkInformation),
				db.select().from(Customer),
			]);

			setData({
				invoices: invoicesData.map((invoice) => ({
					...invoice,
					userId: invoice?.userId!,
					customerId: invoice.customerId!,
					invoiceDate: invoice.invoiceDate!,
					dueDate: invoice.dueDate!,
					amountAfterTax: invoice.amountAfterTax!,
					amountBeforeTax: invoice.amountBeforeTax!,
					taxRate: invoice.taxRate!,
					pdfPath: invoice.pdfPath!,
					createdAt: invoice.createdAt!,
					currency: 'GBP',
				})),
				payments: paymentsData.map((payment) => ({
					...payment,
					invoiceId: payment.invoiceId ?? '',
					paymentDate: payment.paymentDate ?? '',
					amountPaid: payment.amountPaid ?? 0,
					createdAt: payment.createdAt ?? '',
				})),
				notes: notesData.map((note) => ({
					...note,
					invoiceId: note.invoiceId!,
					noteDate: note.noteDate!,
					noteText: note.noteText ?? 'No text',
					createdAt: note.createdAt!,
				})),
				workItems: workItemsData.map((workItem) => ({
					...workItem,
					invoiceId: workItem.invoiceId ?? '',
					descriptionOfWork: workItem.descriptionOfWork ?? 'No description',
					unitPrice: workItem.unitPrice ?? 0,
					date: workItem.date ?? '',
					totalToPayMinusTax: workItem.totalToPayMinusTax ?? 0,
					createdAt: workItem.createdAt ?? '',
				})),
				customers: customersData.map((customer) => ({
					...customer,
					emailAddress: customer.emailAddress ?? '',
					name: customer.name ?? '',
					id: customer.id,
					address: customer.address ?? undefined,
					phoneNumber: customer.phoneNumber ?? undefined,
					createdAt: customer.createdAt ?? '',
				})),
			});
		} catch (error) {
			console.error('Error loading data:', error);
			setError('Failed to load data');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData])
	);

	const memoizedInvoices = useMemo(() => {
		return data.invoices
			.map((invoice) => {
				const invoicePayments = data.payments.filter((p) => p.invoiceId === invoice.id);
				const invoiceNotes = data.notes.filter((n) => n.invoiceId === invoice.id);
				const invoiceWorkItems = data.workItems.filter((w) => w.invoiceId === invoice.id);
				const customer = data.customers.find((c) => c.id === invoice.customerId) || {
					name: 'Unknown',
					emailAddress: 'unknown@example.com',
					id: invoice.customerId,
				};

				return {
					...invoice,
					payments: invoicePayments,
					notes: invoiceNotes,
					workItems: invoiceWorkItems,
					customer,
				};
			})
			.filter((invoice) => filterCustomer === '' || invoice.customer.name.toLowerCase().includes(filterCustomer.toLowerCase()));
	}, [data, filterCustomer]);

	const handleAddToBudget = useCallback(async () => {
		// Open category selection modal
		setIsCategoryModalVisible(true);
	}, []);

	const confirmAddToBudget = useCallback(async () => {
		if (!selectedCategory) {
			Alert.alert('Error', 'Please select a category');
			return;
		}

		try {
			const selectedInvoiceDetails = memoizedInvoices.filter((invoice) => selectedInvoices.includes(invoice.id));

			await Promise.all(
				selectedInvoiceDetails.map(async (invoice) => {
					const id = await generateId();
					await db.insert(Transactions).values({
						id: id.toString(),
						amount: invoice.amountAfterTax,
						description: `Invoice from ${invoice.customer.name}`,
						date: new Date().toISOString(),
						type: 'INCOME',
						categoryId: selectedCategory,
						userId: invoice.userId,
						currency: invoice.currency,
					});
				})
			);

			setSelectedInvoices([]);
			setIsCategoryModalVisible(false);
			setSelectedCategory(null);
			await loadData();

			Alert.alert('Success', `Added ${selectedInvoices.length} invoices to budget`);
		} catch (error) {
			console.error('Error adding to budget:', error);
			Alert.alert('Error', 'Failed to add invoices to budget');
		}
	}, [memoizedInvoices, selectedInvoices, selectedCategory, loadData]);

	const handleToggleInvoiceSelection = useCallback((invoiceId: string) => {
		setSelectedInvoices((prev) => (prev.includes(invoiceId) ? prev.filter((id) => id !== invoiceId) : [...prev, invoiceId]));
	}, []);

	const handleDeleteInvoice = useCallback(
		async (invoiceId: string) => {
			try {
				await db.transaction(async (tx) => {
					await Promise.all([
						tx.delete(WorkInformation).where(eq(WorkInformation.invoiceId, invoiceId)),
						tx.delete(Payment).where(eq(Payment.invoiceId, invoiceId)),
						tx.delete(Note).where(eq(Note.invoiceId, invoiceId)),
						tx.delete(Invoice).where(eq(Invoice.id, invoiceId)),
					]);
				});
				await loadData();
			} catch (error) {
				console.error('Error deleting invoice:', error);
				Alert.alert('Error', 'Failed to delete invoice. Please try again.');
			}
		},
		[loadData]
	);

	const handleUpdateInvoice = useCallback(
		(invoice: InvoiceForUpdate) => {
			router.push({
				pathname: '/createInvoice',
				params: {
					mode: 'update',
					invoiceId: invoice.id,
					invoice: JSON.stringify(invoice),
					workItems: JSON.stringify(invoice.workItems),
					notes: JSON.stringify(invoice.notes),
					payments: JSON.stringify(invoice.payments),
				},
			});
		},
		[router]
	);

	if (error) {
		return (
			<View>
				<Text style={{ color: colors.danger }}>{error}</Text>
			</View>
		);
	}

	return (
		<View className='flex-1 bg-light-primary dark:bg-dark-primary'>
			<View className='flex-row justify-between p-4'>
				<ThemeToggle size={24} />
				<TouchableOpacity onPress={() => router.push('/createInvoice')} className='flex-row gap-1 items-center'>
					<View>
						<Ionicons name='add-circle-outline' size={24} color={colors.text} />
					</View>
					<Text className='text-light-text dark:text-dark-text text-xs font-bold'>Create Invoice</Text>
				</TouchableOpacity>
			</View>

			<View className='px-4 pb-2'>
				<TextInput
					placeholder='Filter by Customer Name'
					value={filterCustomer}
					onChangeText={setFilterCustomer}
					className='bg-light-nav dark:bg-dark-nav p-2 text-light-text dark:text-dark-text'
					placeholderTextColor='gray'
				/>
			</View>

			{selectedInvoices.length > 0 && (
				<TouchableOpacity onPress={handleAddToBudget} className='bg-success p-3 m-4 rounded-md flex-row items-center justify-center'>
					<Ionicons name='add-circle' size={24} color='white' />
					<Text className='text-white font-bold ml-2'>Add {selectedInvoices.length} Invoice(s) to Budget</Text>
				</TouchableOpacity>
			)}

			<Modal visible={isCategoryModalVisible} transparent={true} animationType='slide' onRequestClose={() => setIsCategoryModalVisible(false)}>
				<View className='flex-1 justify-center items-center  bg-light-text/30 dark:bg-dark-text/30'>
					<View className='bg-light-primary dark:bg-dark-primary p-4 rounded-lg w-11/12'>
						<Text className='text-lg font-bold mb-4 text-center text-light-text dark:text-dark-text'>Select Income Category</Text>
						<View className='flex-row flex-wrap justify-center'>
							{categories.INCOME.map((category) => (
								<TouchableOpacity
									key={category.id}
									onPress={() => setSelectedCategory(category.id)}
									className={`p-2 m-1 rounded-md ${selectedCategory === category.id ? 'bg-success' : 'bg-muted'}`}>
									<Text className={`text-center ${selectedCategory === category.id ? 'text-light-text' : 'text-dark-text'}`}>
										{category.emoji} {category.name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						<View className='flex-row justify-between mt-4'>
							<TouchableOpacity onPress={() => setIsCategoryModalVisible(false)} className='bg-danger p-2 rounded-md'>
								<Text className='text-dark-text'>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={confirmAddToBudget} className='bg-success p-2 rounded-md' disabled={!selectedCategory}>
								<Text className='text-dark-text'>Confirm</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{isLoading ? (
				<View className='flex-1 justify-center items-center'>
					<Text className='text-light-text dark:text-dark-text'>Loading...</Text>
				</View>
			) : (
				<>
					<View className='flex-row justify-between items-center p-2'>
						<Text className='text-sm font-bold text-light-text dark:text-dark-text'>Invoices</Text>
						<TouchableOpacity onPress={() => router.push('/#')} className='flex-row gap-1 items-center'>
							<View>
								<Ionicons name='add-circle-outline' size={24} color={colors.text} />
							</View>
							<Text className='text-sm font-bold text-light-text dark:text-dark-text'>Add to budget</Text>
						</TouchableOpacity>
					</View>
					<FlatList
						data={memoizedInvoices}
						keyExtractor={(item) => item.id || String(Math.random())}
						renderItem={({ item }) => (
							<View className='flex-row items-center justify-center'>
								<InvoiceCard
									invoice={item}
									workItems={item.workItems}
									payments={item.payments}
									notes={item.notes}
									customer={item.customer}
									onDelete={() =>
										Alert.alert('Delete Invoice', 'Are you sure you want to delete this invoice? This action cannot be undone.', [
											{ text: 'Cancel', style: 'cancel' },
											{
												text: 'Delete',
												style: 'destructive',
												onPress: () => handleDeleteInvoice(item.id),
											},
										])
									}
									onUpdate={() => handleUpdateInvoice(item)}
								/>
								<TouchableOpacity onPress={() => handleToggleInvoiceSelection(item.id)} className='p-2'>
									<Ionicons name={selectedInvoices.includes(item.id) ? 'checkbox' : 'square-outline'} size={24} color={colors.text} />
								</TouchableOpacity>
							</View>
						)}
						contentContainerStyle={{ padding: 16 }}
					/>
				</>
			)}
		</View>
	);
}
