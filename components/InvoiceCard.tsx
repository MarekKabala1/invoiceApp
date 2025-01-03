import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { InvoiceType, WorkInformationType, PaymentType, NoteType, CustomerType } from '@/db/zodSchema';
import { useRouter } from 'expo-router';
import BaseCard from './BaseCard';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/utils/theme';

type InvoiceCardProps = {
	invoice: InvoiceType;
	workItems: WorkInformationType[];
	payments: PaymentType[];
	notes: NoteType[];
	customer: CustomerType[];
	onDelete?: (invoiceId: string) => void;
	onUpdate: (id: string) => void;
};

export default function InvoiceCard({ invoice, workItems, payments, notes, customer, onDelete, onUpdate }: InvoiceCardProps) {
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);

	const balance = invoice.amountBeforeTax;
	const taxBalance = balance - invoice.amountAfterTax;
	const tax = invoice.taxRate;

	return (
		<BaseCard className='mb-3'>
			<TouchableOpacity
				onPress={() => setExpanded(!expanded)}
				onLongPress={() => onDelete?.(invoice.id!)}
				className='flex-col justify-between items-center gap-1'>
				<View className='flex-row w-full justify-between items-center'>
					<View>
						<Text className='text-lg font-bold text-textLight '>Invoice # {invoice.id}</Text>
						<Text className='text-xs text-textLight'>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
					</View>

					<View className='flex-col items-center'>
						<Text className='font-bold text-lg text-textLight mr-2'>
							{getCurrencySymbol(invoice.currency)}
							{invoice.amountAfterTax.toFixed(2)}
						</Text>
					</View>
					<TouchableOpacity onPress={() => onUpdate(invoice.id!)} className='border border-textLight rounded-md p-1'>
						<MaterialCommunityIcons name='update' size={16} color={colors.textLight} />
					</TouchableOpacity>
				</View>
				<View className='flex-row w-full justify-between'>
					<Text className='text-xs text-textLight opacity-50 text-center'>* Press to expand</Text>
					<Text className='text-xs text-textLight opacity-50 text-center'>* Long Press to delete</Text>
				</View>
			</TouchableOpacity>

			{expanded && (
				<View className='mt-4'>
					<View className='flex-row justify-between items-center'>
						<Text className='font-semibold text-textLight'>Customer:</Text>
						<Text className=' text-textLight text-xs'>{customer.map((c) => c.name)}</Text>
					</View>
					<Text className='font-semibold text-textLight'>Work Items:</Text>
					<FlatList
						data={workItems}
						keyExtractor={(item) => item.id!}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='max-w-52 pl-4 text-textLight'>{item.descriptionOfWork}</Text>
								<Text className='text-textLight'>
									{getCurrencySymbol(invoice.currency)}
									{item.unitPrice.toFixed(2)}
								</Text>
							</View>
						)}
					/>

					<Text className='font-semibold text-textLight'>Payments:</Text>
					<FlatList
						data={payments}
						keyExtractor={(item) => item.id!}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='text-textLight'>{new Date(item.paymentDate).toLocaleDateString()}</Text>
								<Text className='text-textLight'>
									{getCurrencySymbol(invoice.currency)}
									{item.amountPaid.toFixed(2)}
								</Text>
							</View>
						)}
					/>
					<View className='flex-row justify-between items-center'>
						<Text className='font-semibold text-textLight'>Tax:</Text>
						<Text className=' text-textLight'>
							{tax}% ({taxBalance})
						</Text>
					</View>
					<View className='flex-row justify-between items-center'>
						<Text className='font-semibold text-textLight'>Balance:</Text>
						<Text className='font-semibold text-textLight text-md border-b border-textLight'>
							{getCurrencySymbol(invoice.currency)}
							{balance.toFixed(2)}
						</Text>
					</View>

					<Text className='font-semibold text-textLight'>Notes:</Text>
					<FlatList
						data={notes}
						keyExtractor={(item) => item.id!}
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
