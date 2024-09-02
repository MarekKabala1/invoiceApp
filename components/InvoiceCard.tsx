import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useInvoice } from '@/context/InvoiceContext';
import { Ionicons } from '@expo/vector-icons';

type InvoiceType = {
	id: string;
	customer_id: string;
	invoice_date: Date;
	due_date: Date;
	amount_before_tax: number;
	amount_after_tax: number;
};

export default function InvoiceItem({ item }: { item: InvoiceType }) {
	return (
		<TouchableOpacity
			// onPress={() => router.push(`/invoice/${item.id}`)}
			className='bg-navLight p-4 mb-2 rounded-lg shadow-sm flex-row justify-between items-center'>
			<View>
				<Text className='font-bold text-textLight text-lg'>{item.customer_id}</Text>
				<Text className='text-textLight text-xs text-opacity-60'>Due: {item.due_date.toLocaleDateString()}</Text>
			</View>
			<View className='flex-row items-center'>
				<Text className='font-bold text-textLight text-lg mr-2'>${item.amount_after_tax.toFixed(2)}</Text>
				<Ionicons name='chevron-forward' size={24} color='#0284c7' />
			</View>
		</TouchableOpacity>
	);
}
