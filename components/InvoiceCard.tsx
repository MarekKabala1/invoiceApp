import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { invoiceSchema, workInformationSchema, paymentSchema, noteSchema } from '@/db/zodSchema';
import { z } from 'zod';

type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;
type PaymentType = z.infer<typeof paymentSchema>;
type NoteType = z.infer<typeof noteSchema>;

type InvoiceItemProps = {
	invoice: InvoiceType;
	workItems: WorkInformationType[];
	payments: PaymentType[];
	notes: NoteType[];
};

export default function InvoiceCard({ invoice, workItems, payments, notes }: InvoiceItemProps) {
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);

	const totalPaid = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
	const balance = invoice.amountAfterTax - totalPaid;

	return (
		<View className='bg-white rounded-lg shadow-md mb-4 p-4'>
			<TouchableOpacity onPress={() => setExpanded(!expanded)} className='flex-row justify-between items-center'>
				<View>
					<Text className='text-lg font-bold text-gray-800'>Invoice #{invoice.id}</Text>
					<Text className='text-sm text-gray-600'>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
				</View>
				<View className='flex-row items-center'>
					<Text className='font-bold text-lg text-gray-800 mr-2'>${invoice.amountAfterTax.toFixed(2)}</Text>
					<Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color='#0284c7' />
				</View>
			</TouchableOpacity>

			{expanded && (
				<View className='mt-4'>
					<Text className='font-semibold text-gray-700'>Work Items:</Text>
					<FlatList
						data={workItems}
						keyExtractor={(item) => item.id as string}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='text-gray-600'>{item.descriptionOfWork}</Text>
								<Text className='text-gray-600'>${item.unitPrice.toFixed(2)}</Text>
							</View>
						)}
					/>

					<Text className='font-semibold text-gray-700 mt-2'>Payments:</Text>
					<FlatList
						data={payments}
						keyExtractor={(item) => item.id as string}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='text-gray-600'>{new Date(item.paymentDate).toLocaleDateString()}</Text>
								<Text className='text-gray-600'>${item.amountPaid.toFixed(2)}</Text>
							</View>
						)}
					/>

					<Text className='font-semibold text-gray-700 mt-2'>Balance: ${balance.toFixed(2)}</Text>

					<Text className='font-semibold text-gray-700 mt-2'>Notes:</Text>
					<FlatList
						data={notes}
						keyExtractor={(item) => item.id as string}
						renderItem={({ item }) => (
							<View className='my-1'>
								<Text className='text-gray-600'>{item.noteText}</Text>
							</View>
						)}
					/>
				</View>
			)}
		</View>
	);
}
