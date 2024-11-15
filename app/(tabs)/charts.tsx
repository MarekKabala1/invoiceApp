import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '@/db/config';
import { User, Invoice } from '@/db/schema';
import { userSchema, invoiceSchema } from '@/db/zodSchema';
import { z } from 'zod';
import PickerWithTouchableOpacity from '@/components/Picker';
import { Controller, useForm } from 'react-hook-form';
import { eq } from 'drizzle-orm';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { calculateInvoiceTotals } from '@/utils/invoiceCalculating';
import { format } from 'date-fns';
import BaseCard from '@/components/BaseCard';

type UserType = z.infer<typeof userSchema>;
type InvoiceType = z.infer<typeof invoiceSchema>;

export default function Charts() {
	const { control, watch } = useForm<UserType>();
	const [userOptions, setUserOptions] = useState<Array<{ label: string; value: string }>>([]);
	const [invoices, setInvoices] = useState<InvoiceType[]>([]);
	const [totals, setTotals] = useState({ totalBeforeTax: 0, totalAfterTax: 0, taxToPay: 0 });

	const selectedUserId = watch('id');

	const fetchUsers = async () => {
		try {
			const usersData = await db.select().from(User);
			const options = usersData.map((user) => ({
				label: user.fullName || 'First add User',
				value: user.id,
			}));
			setUserOptions(options);
		} catch (error) {
			console.error('Failed to fetch user data:', error);
		}
	};

	const fetchUserInvoices = async (userId: string) => {
		try {
			const invoiceData = await db.select().from(Invoice).where(eq(Invoice.userId, userId));
			setInvoices(invoiceData as InvoiceType[]);
		} catch (error) {
			console.error('Failed to fetch invoice data:', error);
		}
	};

	useEffect(() => {
		const newTotals = calculateInvoiceTotals(invoices);
		setTotals(newTotals);
	}, [invoices]);

	useFocusEffect(
		useCallback(() => {
			if (selectedUserId) {
				fetchUserInvoices(selectedUserId);
			}
			fetchUsers();
		}, [selectedUserId])
	);

	const chartData = {
		labels: ['', ...invoices.map((invoice) => format(new Date(invoice.createdAt as string), 'dd/MM/yy'))],
		datasets: [
			{
				data: [0, ...invoices.map((invoice) => invoice.amountBeforeTax)],
			},
		],
	};

	const screenWidth = Dimensions.get('window').width;
	const chartWidth = Math.max(screenWidth - 32, chartData.labels.length * 50);

	const insets = useSafeAreaInsets();
	return (
		<View style={{ paddingTop: insets.top }} className='flex-1 bg-primaryLight p-4 w-screen'>
			<View className='gap-4'>
				<Text className='text-center font-bold text-textLight'>Pick User to display charts</Text>
				<Controller
					control={control}
					name='id'
					render={({ field: { onChange, onBlur, value } }) => (
						<PickerWithTouchableOpacity initialValue={'Select User'} onValueChange={onChange} items={userOptions} />
					)}
				/>
				{invoices.length > 0 && (
					<BaseCard>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<LineChart
								data={chartData}
								width={chartWidth}
								height={360}
								yAxisLabel='£'
								chartConfig={{
									backgroundColor: '#6d492f ',
									backgroundGradientFrom: '#8B5E3C',
									backgroundGradientTo: '#6d492f',
									decimalPlaces: 2,
									color: (opacity = 1) => `rgba(222, 197, 178, ${opacity})`,
									labelColor: (opacity = 1) => `rgba(222, 197, 178, ${opacity})`,
									propsForDots: {
										r: '6',
										strokeWidth: '2',
										stroke: '#4a3220',
									},
								}}
								style={{
									marginVertical: 8,
								}}
								verticalLabelRotation={90}
								xLabelsOffset={-10}
								decorator={() => {
									return chartData.datasets[0].data
										.map((value, index) => {
											if (index === 0) return null;
											return (
												<View key={index}>
													<Text
														style={{
															position: 'absolute',
															left: (chartWidth / chartData.labels.length) * index,
															top: 320 - (value / Math.max(...chartData.datasets[0].data)) * 320,
															width: 'auto',
															textAlign: 'center',
															backgroundColor: 'rgba(224, 201, 184, 0.9)',
															color: '#4a3220',
															fontSize: 10,
															borderRadius: 10,
															padding: 1,
														}}>
														£{value}
													</Text>
												</View>
											);
										})
										.filter(Boolean);
								}}
								bezier
							/>
						</ScrollView>
					</BaseCard>
				)}

				<BaseCard>
					<View className='flex-row justify-between border-b border-gray-200 pb-2'>
						<Text className='font-bold text-textLight'>Invoices Sent So Far this Year:</Text>
						<Text className='text-textLight'>{invoices.length}</Text>
					</View>

					<View className='flex-row justify-between border-b border-gray-200 py-2'>
						<Text className='font-bold text-textLight'>Sum Before Tax:</Text>
						<Text className='text-textLight'>{totals.totalBeforeTax.toFixed(2)}</Text>
					</View>

					<View className='flex-row justify-between border-b border-gray-200 py-2'>
						<Text className='font-bold text-textLight'>Sum After Tax:</Text>
						<Text className='text-textLight'>£{totals.totalAfterTax.toFixed(2)}</Text>
					</View>

					<View className='flex-row justify-between py-2'>
						<Text className='font-bold text-textLight'>Tax to Pay:</Text>
						<Text className='text-textLight'>£{totals.taxToPay.toFixed(2)}</Text>
					</View>
				</BaseCard>
			</View>
		</View>
	);
}
