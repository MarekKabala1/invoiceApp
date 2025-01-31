import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InvoiceCard from './InvoiceCard';
import { Invoice, Payment, Note, WorkInformation, Customer } from '@/db/schema';
import { z } from 'zod';
import { db } from '@/db/config';
import { InvoiceType, WorkInformationType, PaymentType, NoteType, CustomerType } from '@/db/zodSchema';
import { InvoiceForUpdate } from '@/types';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from './ThemeToggle';

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
						<Ionicons name='add-circle-outline' size={28} color={colors.text} />
					</View>
					<Text className='text-light-text dark:text-dark-text text-xs font-bold'>Create Invoice</Text>
				</TouchableOpacity>
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
										onPress: () => handleDeleteInvoice(item.id),
									},
								])
							}
							onUpdate={() => handleUpdateInvoice(item)}
						/>
					)}
					contentContainerStyle={{ padding: 16 }}
				/>
			)}
		</View>
	);
}
