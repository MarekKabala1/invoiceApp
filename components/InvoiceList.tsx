import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InvoiceCard from './InvoiceCard';
import { Invoice, Payment, Note, WorkInformation } from '@/db/schema';
import { z } from 'zod';
import { db } from '@/db/config';
import { invoiceSchema, workInformationSchema, paymentSchema, noteSchema } from '@/db/zodSchema';

type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;
type PaymentType = z.infer<typeof paymentSchema>;
type NoteType = z.infer<typeof noteSchema>;

export default function InvoiceList() {
	const [invoices, setInvoices] = useState<InvoiceType[]>([]);
	const [payments, setPayments] = useState<PaymentType[]>([]);
	const [notes, setNotes] = useState<NoteType[]>([]);
	const [workItems, setWorkItems] = useState<WorkInformationType[]>([]);
	const router = useRouter();

	const fetchInvoices = async () => {
		const fetchedInvoices = await db.select().from(Invoice);

		// Transform the fetched data to ensure non-nullable fields
		const formattedInvoices = fetchedInvoices.map((invoice) => ({
			...invoice,
			userId: invoice.userId ?? '',
			customerId: invoice.customerId ?? '',
			invoiceDate: invoice.invoiceDate ?? '',
			dueDate: invoice.dueDate ?? '',
			amountAfterTax: invoice.amountAfterTax ?? 0,
			amountBeforeTax: invoice.amountBeforeTax ?? 0,
			taxRate: invoice.taxRate ?? 0,
			pdfPath: invoice.pdfPath ?? '',
			createdAt: invoice.createdAt ?? '',
		}));

		setInvoices(formattedInvoices);
	};

	const fetchPayments = async () => {
		const fetchedPayments = await db.select().from(Payment);

		// Transform the fetched data to ensure non-nullable fields
		const formattedPayments = fetchedPayments.map((payment) => ({
			...payment,
			invoiceId: payment.invoiceId ?? '',
			paymentDate: payment.paymentDate ?? '',
			amountPaid: payment.amountPaid ?? 0,
			createdAt: payment.createdAt ?? '',
		}));

		setPayments(formattedPayments);
	};

	const fetchNotes = async () => {
		const fetchedNotes = await db.select().from(Note);

		// Transform the fetched data to ensure non-nullable fields
		const formattedNotes = fetchedNotes.map((note) => ({
			...note,
			invoiceId: note.invoiceId ?? '',
			noteDate: note.noteDate ?? '',
			noteText: note.noteText ?? 'No text',
			createdAt: note.createdAt ?? '',
		}));

		setNotes(formattedNotes);
	};

	const fetchWorkInformation = async () => {
		const fetchedWorkItems = await db.select().from(WorkInformation);

		// Transform the fetched data to ensure non-nullable fields
		const formattedWorkItems = fetchedWorkItems.map((workItem) => ({
			...workItem,
			invoiceId: workItem.invoiceId ?? '',
			descriptionOfWork: workItem.descriptionOfWork ?? 'No description', // Default to 'No description' if null
			unitPrice: workItem.unitPrice ?? 0,
			date: workItem.date ?? '',
			totalToPayMinusTax: workItem.totalToPayMinusTax ?? 0,
			createdAt: workItem.createdAt ?? '',
		}));

		setWorkItems(formattedWorkItems);
	};

	useEffect(() => {
		const loadData = async () => {
			await fetchInvoices();
			await fetchPayments();
			await fetchNotes();
			await fetchWorkInformation();
		};

		loadData();
	}, []);

	return (
		<View className='flex-1 bg-primaryLight p-4'>
			<FlatList
				data={invoices}
				renderItem={({ item }) => (
					<InvoiceCard
						invoice={item}
						workItems={workItems.filter((wi) => wi.invoiceId === item.id)}
						payments={payments.filter((p) => p.invoiceId === item.id)}
						notes={notes.filter((n) => n.invoiceId === item.id)}
					/>
				)}
				keyExtractor={(item) => item.id as string}
				ListEmptyComponent={<Text className='text-center mt-4 text-mutedForeground'>No invoices found</Text>}
			/>
			<TouchableOpacity
				onPress={() => router.push('/createInvoice')}
				className='absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg'>
				<Ionicons name='add' size={30} color='white' />
			</TouchableOpacity>
		</View>
	);
}
