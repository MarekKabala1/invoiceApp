import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InvoiceCard from './InvoiceCard';
import { invoiceSchema, workInformationSchema, paymentSchema, noteSchema } from '@/db/zodSchema';
import { z } from 'zod';

type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;
type PaymentType = z.infer<typeof paymentSchema>;
type NoteType = z.infer<typeof noteSchema>;

export default function InvoiceList() {
	const router = useRouter();

	// Mock data for invoices
	const mockInvoices: InvoiceType[] = [
		{
			id: '1',
			userId: 'user1',
			customerId: 'customer1',
			invoiceDate: '2023-05-01',
			dueDate: '2023-05-15',
			amountAfterTax: 120,
			amountBeforeTax: 100,
			taxRate: 0.2,
			pdfPath: '/path/to/pdf1',
			createdAt: '2023-05-01T10:00:00Z',
		},
		{
			id: '2',
			userId: 'user1',
			customerId: 'customer2',
			invoiceDate: '2023-05-02',
			dueDate: '2023-05-16',
			amountAfterTax: 240,
			amountBeforeTax: 200,
			taxRate: 0.2,
			pdfPath: '/path/to/pdf2',
			createdAt: '2023-05-02T11:00:00Z',
		},
	];

	// Mock data for work items, payments, and notes
	const mockWorkItems: WorkInformationType[] = [
		{
			id: 'work1',
			invoiceId: '1',
			descriptionOfWork: 'Web Development',
			unitPrice: 100,
			date: '2023-05-01',
			totalToPayMinusTax: 100,
		},
	];

	const mockPayments: PaymentType[] = [
		{
			id: 'payment1',
			invoiceId: '1',
			paymentDate: '2023-05-10',
			amountPaid: 60,
		},
	];

	const mockNotes: NoteType[] = [
		{
			id: 'note1',
			invoiceId: '1',
			noteDate: '2023-05-05',
			noteText: 'Client requested minor changes',
		},
	];

	return (
		<View className='flex-1 bg-primaryLight p-4'>
			<FlatList
				data={mockInvoices}
				renderItem={({ item }) => (
					<InvoiceCard
						invoice={item}
						workItems={mockWorkItems.filter((wi) => wi.invoiceId === item.id)}
						payments={mockPayments.filter((p) => p.invoiceId === item.id)}
						notes={mockNotes.filter((n) => n.invoiceId === item.id)}
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
