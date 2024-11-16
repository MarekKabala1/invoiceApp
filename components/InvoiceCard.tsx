import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { InvoiceType, WorkInformationType, PaymentType, NoteType } from '@/db/zodSchema';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BaseCard from './BaseCard';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';

type InvoiceCardProps = {
	invoice: InvoiceType;
	workItems: WorkInformationType[];
	payments: PaymentType[];
	notes: NoteType[];
	onDelete: (invoiceId: string) => void;
};

export default function InvoiceCard({ invoice, workItems, payments, notes, onDelete }: InvoiceCardProps) {
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);

	const balance = invoice.amountBeforeTax;
	const taxBalance = balance - invoice.amountAfterTax;
	const tax = invoice.taxRate;

	return (
		<BaseCard className='mb-4'>
			<TouchableOpacity
				onPress={() => setExpanded(!expanded)}
				onLongPress={() => onDelete(invoice.id as string)}
				className='flex-col justify-between items-center gap-1'>
				<View className='flex-row w-full justify-between items-center'>
					<View>
						<Text className='text-lg font-bold text-textLight '>Invoice #{invoice.id}</Text>
						<Text className='text-sm text-textLight'>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
					</View>

					<View className='flex-row items-center'>
						<Text className='font-bold text-lg text-textLight mr-2'>
							{getCurrencySymbol(invoice.currency)}
							{invoice.amountAfterTax.toFixed(2)}
						</Text>
					</View>
				</View>
				<View className='flex-row w-full justify-between'>
					<Text className='text-xs text-textLight opacity-50 text-center'>* Press to expand</Text>
					<Text className='text-xs text-textLight opacity-50 text-center'>* Long Press to delete</Text>
				</View>
			</TouchableOpacity>

			{expanded && (
				<View className='mt-4'>
					<Text className='font-semibold text-textLight'>Work Items:</Text>
					<FlatList
						data={workItems}
						keyExtractor={(item) => item.id as string}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='max-w-52 text-textLight'>{item.descriptionOfWork}</Text>
								<Text className='text-textLight'>{getCurrencySymbol(invoice.currency)}{item.unitPrice.toFixed(2)}</Text>
							</View>
						)}
					/>

					<Text className='font-semibold text-textLight mt-2'>Payments:</Text>
					<FlatList
						data={payments}
						keyExtractor={(item) => item.id as string}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='text-textLight'>{new Date(item.paymentDate).toLocaleDateString()}</Text>
								<Text className='text-textLight'>{getCurrencySymbol(invoice.currency)}{item.amountPaid.toFixed(2)}</Text>
							</View>
						)}
					/>
					<View className=''>
						<Text className='font-semibold text-textLight mt-2'>
							Tax:{tax}% ({taxBalance})
						</Text>
						<Text className='font-semibold text-textLight mt-2'>Balance: {getCurrencySymbol(invoice.currency)}{balance.toFixed(2)}</Text>
					</View>

					<Text className='font-semibold text-textLight mt-2'>Notes:</Text>
					<FlatList
						data={notes}
						keyExtractor={(item) => item.id as string}
						renderItem={({ item }) => (
							<View className='my-1'>
								<Text className='text-textLight'>{item.noteText}</Text>
							</View>
						)}
					/>
				</View>
			)}
		</BaseCard>
	);
}
