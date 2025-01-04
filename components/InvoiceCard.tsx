import React, { useState, memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { InvoiceType, WorkInformationType, PaymentType, NoteType, CustomerType } from '@/db/zodSchema';
import { useRouter } from 'expo-router';
import BaseCard from './BaseCard';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { color } from '@/utils/theme';

type InvoiceCardProps = {
	invoice: InvoiceType;
	workItems: WorkInformationType[];
	payments: PaymentType[];
	notes: NoteType[];
	customer: CustomerType[];
	onDelete?: (invoiceId: string) => void;
	onUpdate: (id: string) => void;
};

const InvoiceCard = ({ invoice, workItems, payments, notes, customer, onDelete, onUpdate }: InvoiceCardProps) => {
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);

	// Memoize calculations
	const { balance, taxBalance, tax } = useMemo(
		() => ({
			balance: invoice.amountBeforeTax,
			taxBalance: invoice.amountBeforeTax - invoice.amountAfterTax,
			tax: invoice.taxRate,
		}),
		[invoice.amountBeforeTax, invoice.amountAfterTax, invoice.taxRate]
	);

	// Memoize handlers
	const handleExpand = useCallback(() => {
		setExpanded((prev) => !prev);
	}, []);

	const handleDelete = useCallback(() => {
		onDelete?.(invoice.id!);
	}, [invoice.id, onDelete]);

	return (
		<BaseCard className='mb-3'>
			<TouchableOpacity onPress={handleExpand} onLongPress={handleDelete} className='flex-col justify-between items-center gap-1'>
				<View className='flex-row w-full justify-between items-center'>
					<View>
						<Text className='text-lg font-bold text-light-text '>Invoice # {invoice.id}</Text>
						<Text className='text-xs text-light-text'>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
					</View>

					<View className='flex-col items-center'>
						<Text className='font-bold text-lg text-light-text mr-2'>
							{getCurrencySymbol(invoice.currency)}
							{invoice.amountAfterTax.toFixed(2)}
						</Text>
					</View>
					<TouchableOpacity onPress={() => onUpdate(invoice.id!)} className='border border-light-text rounded-md p-1'>
						<MaterialCommunityIcons name='update' size={16} color={color.light.text} />
					</TouchableOpacity>
				</View>
				<View className='flex-row w-full justify-between'>
					<Text className='text-xs text-light-text opacity-50 text-center'>* Press to expand</Text>
					<Text className='text-xs text-light-text opacity-50 text-center'>* Long Press to delete</Text>
				</View>
			</TouchableOpacity>

			{expanded && (
				<View className='mt-4'>
					<View className='flex-row justify-between items-center'>
						<Text className='font-semibold text-light-text'>Customer:</Text>
						<Text className=' text-light-text text-xs'>{customer.map((c) => c.name)}</Text>
					</View>
					<Text className='font-semibold text-light-text'>Work Items:</Text>
					<FlatList
						data={workItems}
						keyExtractor={(item) => item.id!}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='max-w-52 pl-4 text-light-text'>{item.descriptionOfWork}</Text>
								<Text className='text-light-text'>
									{getCurrencySymbol(invoice.currency)}
									{item.unitPrice.toFixed(2)}
								</Text>
							</View>
						)}
					/>

					<Text className='font-semibold text-light-text'>Payments:</Text>
					<FlatList
						data={payments}
						keyExtractor={(item) => item.id!}
						renderItem={({ item }) => (
							<View className='flex-row justify-between my-1'>
								<Text className='text-light-text'>{new Date(item.paymentDate).toLocaleDateString()}</Text>
								<Text className='text-light-text'>
									{getCurrencySymbol(invoice.currency)}
									{item.amountPaid.toFixed(2)}
								</Text>
							</View>
						)}
					/>
					<View className='flex-row justify-between items-center'>
						<Text className='font-semibold text-light-text'>Tax:</Text>
						<Text className=' text-light-text'>
							{tax}% ({taxBalance})
						</Text>
					</View>
					<View className='flex-row justify-between items-center'>
						<Text className='font-semibold text-light-text'>Balance:</Text>
						<Text className='font-semibold text-light-text text-md border-b border-light-text'>
							{getCurrencySymbol(invoice.currency)}
							{balance.toFixed(2)}
						</Text>
					</View>

					<Text className='font-semibold text-light-text'>Notes:</Text>
					<FlatList
						data={notes}
						keyExtractor={(item) => item.id!}
						renderItem={({ item }) => (
							<View className='my-1'>
								<Text className='text-light-text'>{item.noteText}</Text>
							</View>
						)}
					/>
				</View>
			)}
		</BaseCard>
	);
};

export default memo(InvoiceCard);
