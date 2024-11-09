import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Invoice, WorkInformation, Payment, Note } from '@/db/schema';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { invoiceSchema, workInformationSchema, paymentSchema, noteSchema } from '@/db/zodSchema';
import BaseCard from './BaseCard';

type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;
type PaymentType = z.infer<typeof paymentSchema>;
type NoteType = z.infer<typeof noteSchema>;

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
		<BaseCard>
			<TouchableOpacity onPress={() => setExpanded(!expanded)} className='flex-row justify-between items-center'>
				<View>
					<Text className='text-lg font-bold text-textLight '>Invoice #{invoice.id}</Text>
					<Text className='text-sm text-textLight'>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
				</View>

				<View className='flex-row items-center'>
					<Text className='font-bold text-lg text-textLight mr-2'>£{invoice.amountAfterTax.toFixed(2)}</Text>
					<Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color='#0f172a' />
					<TouchableOpacity onPress={() => onDelete(invoice.id as string)} className=''>
						<View>
							<MaterialCommunityIcons name='trash-can-outline' size={24} color='#ef4444' />
						</View>
					</TouchableOpacity>
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
								<Text className='text-textLight'>£{item.unitPrice.toFixed(2)}</Text>
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
								<Text className='text-textLight'>${item.amountPaid.toFixed(2)}</Text>
							</View>
						)}
					/>
					<View className=''>
						<Text className='font-semibold text-textLight mt-2'>Tax:{tax}%</Text>
						<Text className='font-semibold text-textLight mt-2'>Balance: £{balance.toFixed(2)}</Text>
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
