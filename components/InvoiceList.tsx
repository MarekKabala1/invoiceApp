import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useInvoice } from '@/context/InvoiceContext';
import { Ionicons } from '@expo/vector-icons';
import InvoiceItem from './InvoiceCard';

type InvoiceType = {
	id: string;
	customer_id: string;
	invoice_date: Date;
	due_date: Date;
	amount_before_tax: number;
	amount_after_tax: number;
};

export default function InvoiceList() {
	const router = useRouter();
	const { invoices } = useInvoice();

	const hardcodedInvoices = [
		{ id: '1', customer_id: 'John Doe', invoice_date: new Date(), due_date: new Date(), amount_before_tax: 100, amount_after_tax: 120 },
		{ id: '2', customer_id: 'Marek Kabala', invoice_date: new Date(), due_date: new Date(), amount_before_tax: 100, amount_after_tax: 120 },
		{ id: '3', customer_id: 'Natan Kabala', invoice_date: new Date(), due_date: new Date(), amount_before_tax: 100, amount_after_tax: 120 },
	];

	return (
		<View className='flex-1 container bg-gray-100 p-4'>
			<FlatList
				data={hardcodedInvoices as InvoiceType[]}
				renderItem={({ item }) => <InvoiceItem item={item} />}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={<Text className='text-center text-gray-500 mt-4'>No invoices found</Text>}
			/>
			<TouchableOpacity
				onPress={() => router.push('/createInvoice')}
				className='absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg'>
				<Ionicons name='add' size={30} color='white' />
			</TouchableOpacity>
		</View>
	);
}
