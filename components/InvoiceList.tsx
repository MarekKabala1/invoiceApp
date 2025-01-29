import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InvoiceCard from './InvoiceCard';
import { Invoice, Payment, Note, WorkInformation, Customer } from '@/db/schema';
import { z } from 'zod';
import { db } from '@/db/config';
import { invoiceSchema, workInformationSchema, paymentSchema, noteSchema, customerSchema } from '@/db/zodSchema';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from './ThemeToggle';

type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;
type PaymentType = z.infer<typeof paymentSchema>;
type NoteType = z.infer<typeof noteSchema>;
type CustomerSchema = z.infer<typeof customerSchema>;

export default function InvoiceList() {
	const [data, setData] = useState<{
		invoices: InvoiceType[];
		payments: PaymentType[];
		notes: NoteType[];
		workItems: WorkInformationType[];
		customers: CustomerSchema[];
	}>({
		invoices: [],
		payments: [],
		notes: [],
		workItems: [],
		customers: [],
	});
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
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
					userId: invoice.userId!,
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
					emailAddress: customer.emailAddress ?? '', // Ensure non-null string
					name: customer.name ?? '', // Ensure non-null string
					id: customer.id,
					address: customer.address ?? undefined, // Make optional
					phoneNumber: customer.phoneNumber ?? undefined, // Make optional
					createdAt: customer.createdAt ?? undefined, // Make optional
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
		return data.invoices.map((invoice) => {
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
		});
	}, [data]);

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
				<Text className='text-2xl font-bold text-light-text dark:text-dark-text'>Invoices</Text>
				<ThemeToggle size={24} />
			</View>
			{isLoading ? (
				<View className='flex-1 justify-center items-center'>
					<Text className='text-light-text dark:text-dark-text'>Loading...</Text>
				</View>
			) : (
				<FlatList
					data={memoizedInvoices}
					keyExtractor={(item) => item.id || String(Math.random())}
					renderItem={({ item }) => (
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
										onPress: async () => {
											try {
												await db.transaction(async (tx) => {
													if (!item.id) {
														throw new Error('Invoice ID is undefined');
													}
													await tx.delete(WorkInformation).where(eq(WorkInformation.invoiceId, item.id as string));
													await tx.delete(Payment).where(eq(Payment.invoiceId, item.id as string));
													await tx.delete(Note).where(eq(Note.invoiceId, item.id as string));
													await tx.delete(Invoice).where(eq(Invoice.id, item.id as string));
												});

												await loadData();
											} catch (error) {
												console.error('Error deleting invoice:', error);
												Alert.alert('Error', 'Failed to delete invoice. Please try again.');
											}
										},
									},
								])
							}
							onUpdate={() => {
								const invoice = item;
								const invoiceWorkItems = item.workItems;
								const invoiceNotes = item.notes;
								const payment = item.payments;

								router.push({
									pathname: '/createInvoice',
									params: {
										mode: 'update',
										invoiceId: invoice.id,
										invoice: JSON.stringify(invoice),
										workItems: JSON.stringify(invoiceWorkItems),
										notes: JSON.stringify(invoiceNotes),
										payments: JSON.stringify(payment),
									},
								});
							}}
						/>
					)}
					contentContainerStyle={{ padding: 16 }}
				/>
			)}
			<TouchableOpacity
				className='absolute bottom-4 right-4 bg-light-primary dark:bg-dark-primary rounded-full w-[60px] h-[60px] justify-center items-center'
				onPress={() => router.push('/createInvoice')}>
				<Ionicons name='add' size={30} color={colors.primary} />
			</TouchableOpacity>
		</View>
	);
}
