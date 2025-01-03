import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InvoiceCard from './InvoiceCard';
import { Invoice, Payment, Note, WorkInformation, Customer } from '@/db/schema';
import { z } from 'zod';
import { db } from '@/db/config';
import { invoiceSchema, workInformationSchema, paymentSchema, noteSchema, customerSchema } from '@/db/zodSchema';
import { eq } from 'drizzle-orm';
import BaseCard from './BaseCard';
import { colors } from '@/utils/theme';

type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;
type PaymentType = z.infer<typeof paymentSchema>;
type NoteType = z.infer<typeof noteSchema>;
type CustomerSchema = z.infer<typeof customerSchema>;

export default function InvoiceList() {
	const [invoices, setInvoices] = useState<InvoiceType[]>([]);
	const [payments, setPayments] = useState<PaymentType[]>([]);
	const [notes, setNotes] = useState<NoteType[]>([]);
	const [workItems, setWorkItems] = useState<WorkInformationType[]>([]);
	const [customer, setCustomer] = useState<CustomerSchema[]>([]);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const fetchInvoices = async () => {
		const fetchedInvoices = await db.select().from(Invoice);

		const formattedInvoices = fetchedInvoices.map((invoice) => ({
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
		}));

		setInvoices(formattedInvoices);
	};

	const fetchPayments = async () => {
		try {
			const fetchedPayments = await db.select().from(Payment);

			const formattedPayments = fetchedPayments.map((payment) => ({
				...payment,
				invoiceId: payment.invoiceId ?? '',
				paymentDate: payment.paymentDate ?? '',
				amountPaid: payment.amountPaid ?? 0,
				createdAt: payment.createdAt ?? '',
			}));
			setPayments(formattedPayments);
		} catch (error) {
			console.error('Error fetching payments:', error);
			setError('no payments found');
		}
	};

	const fetchNotes = async () => {
		try {
			const fetchedNotes = await db.select().from(Note);
			const formattedNotes = fetchedNotes.map((note) => ({
				...note,
				invoiceId: note.invoiceId!,
				noteDate: note.noteDate!,
				noteText: note.noteText ?? 'No text',
				createdAt: note.createdAt!,
			}));
			setNotes(formattedNotes);
		} catch (error) {
			console.error('Error fetching notes:', error);
			setError('No notes found');
		}
	};

	const fetchWorkInformation = async () => {
		try {
			const fetchedWorkItems = await db.select().from(WorkInformation);

			const formattedWorkItems = fetchedWorkItems.map((workItem) => ({
				...workItem,
				invoiceId: workItem.invoiceId ?? '',
				descriptionOfWork: workItem.descriptionOfWork ?? 'No description',
				unitPrice: workItem.unitPrice ?? 0,
				date: workItem.date ?? '',
				totalToPayMinusTax: workItem.totalToPayMinusTax ?? 0,
				createdAt: workItem.createdAt ?? '',
			}));
			setWorkItems(formattedWorkItems);
		} catch (error) {
			console.error('Error fetching work items:', error);
			setError('No work items found');
		}
	};

	const fetchCustomers = async () => {
		try {
			const fetchedCustomers = await db.select().from(Customer);
			const formattedCustomers = fetchedCustomers.map((customer) => ({
				id: customer.id,
				name: customer.name ?? '',
				emailAddress: customer.emailAddress ?? '',
				phoneNumber: customer.phoneNumber ?? '',
				address: customer.address ?? '',
				createdAt: customer.createdAt ?? '',
			}));
			setCustomer(formattedCustomers);
		} catch (error) {
			console.error('Error fetching customers:', error);
			setError('No customers found');
		}
	};

	const loadData = async () => {
		await fetchInvoices();
		await fetchPayments();
		await fetchNotes();
		await fetchWorkInformation();
		await fetchCustomers();
	};
	useEffect(() => {
		loadData();
	}, []);

	useFocusEffect(
		React.useCallback(() => {
			loadData();
		}, [])
	);

	const deleteInvoice = async (invoiceId: string) => {
		try {
			await db.transaction(async (tx) => {
				await tx.delete(WorkInformation).where(eq(WorkInformation.invoiceId, invoiceId));
				await tx.delete(Payment).where(eq(Payment.invoiceId, invoiceId));
				await tx.delete(Note).where(eq(Note.invoiceId, invoiceId));
				await tx.delete(Invoice).where(eq(Invoice.id, invoiceId));
			});

			await loadData();
		} catch (error) {
			console.error('Error deleting invoice:', error);
			Alert.alert('Error', 'Failed to delete invoice. Please try again.');
		}
	};

	const handleDeleteInvoice = (invoiceId: string) => {
		Alert.alert('Delete Invoice', 'Are you sure you want to delete this invoice? This action cannot be undone.', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => deleteInvoice(invoiceId),
			},
		]);
	};

	const handleUpdateInvoice = (invoiceId: string) => {
		const invoice = invoices.find((inv) => inv.id === invoiceId);
		const invoiceWorkItems = workItems.filter((item) => item.invoiceId === invoiceId);
		const invoiceNotes = notes.filter((note) => note.invoiceId === invoiceId);

		if (invoice) {
			router.push({
				pathname: '/createInvoice',
				params: {
					mode: 'update',
					invoiceId: invoiceId,
					invoice: JSON.stringify(invoice),
					workItems: JSON.stringify(invoiceWorkItems),
					notes: JSON.stringify(invoiceNotes),
				},
			});
		}
	};

	return (
		<View className=' flex-1 bg-primaryLight gap-4 p-4 pt-4 mb-28'>
			<BaseCard className=' items-center'>
				<TouchableOpacity onPress={() => router.push('/createInvoice')} className='flex-row gap-1 items-center'>
					<View>
						<Ionicons name='add-circle-outline' size={28} color={colors.textLight} />
					</View>
					<Text className='text-textLight text-xs font-bold'>Create Invoice</Text>
				</TouchableOpacity>
			</BaseCard>
			<FlatList
				data={invoices}
				renderItem={({ item }) => (
					<InvoiceCard
						invoice={item}
						workItems={workItems.filter((workItem) => workItem.invoiceId === item.id)}
						payments={payments.filter((payment) => payment.invoiceId === item.id)}
						notes={notes.filter((note) => note.invoiceId === item.id)}
						customer={customer.filter((c) => c.id === item.customerId)}
						key={item.id}
						onDelete={handleDeleteInvoice}
						onUpdate={handleUpdateInvoice}
					/>
				)}
				keyExtractor={(item) => item.id as string}
				ListEmptyComponent={<Text className='text-center mt-4 text-mutedForeground'>No invoices found</Text>}
			/>
		</View>
	);
}
