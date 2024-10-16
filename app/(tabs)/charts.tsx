import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Dimensions } from 'react-native';
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

type UserType = z.infer<typeof userSchema>;
type InvoiceType = z.infer<typeof invoiceSchema>;

export default function Charts() {
	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<UserType>();
	const [users, setUsers] = useState<UserType[]>([]);
	const [userOptions, setUserOptions] = useState<Array<{ label: string; value: string }> | []>([]);
	const [userId, setUserId] = useState<string>('');
	const [invoices, setInvoices] = useState<InvoiceType[]>([]);

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
			throw new Error('Failed to fetch user data');
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
		if (selectedUserId) {
			fetchUserInvoices(selectedUserId);
		}
		fetchUsers();
	}, [selectedUserId]);

	const chartData = {
		labels: invoices.map((invoice) => new Date(invoice.createdAt as string).toLocaleDateString()),
		datasets: [
			{
				data: [100, ...invoices.map((invoice) => invoice.amountBeforeTax)],
			},
		],
	};

	const insets = useSafeAreaInsets();
	return (
		<View style={{ paddingTop: insets.top }} className='flex-1 bg-primaryLight p-4 w-screen'>
			<View className='gap-2  '>
				<Text className=' text-center'>Pick User to display charts</Text>
				<Controller
					control={control}
					name='id'
					render={({ field: { onChange, onBlur, value } }) => (
						<PickerWithTouchableOpacity initialValue={'Select User'} onValueChange={onChange} items={userOptions} />
					)}
				/>
				{invoices.length > 0 && (
					<LineChart
						data={chartData}
						width={Dimensions.get('window').width - 32}
						height={320}
						yAxisLabel='£'
						chartConfig={{
							backgroundColor: '#0B57A9 ',
							backgroundGradientFrom: '#509f9f',
							backgroundGradientTo: '#016D5b',
							decimalPlaces: 2,
							color: (opacity = 1) => `rgba(227, 222, 222, ${opacity})`,
							labelColor: (opacity = 1) => `rgba(227, 222, 222, ${opacity})`,
							propsForDots: {
								r: '6',
								strokeWidth: '2',
								stroke: '#0B57A9',
							},
						}}
						style={{
							marginVertical: 8,
							borderRadius: 10,
						}}
						decorator={() => {
							return chartData.datasets[0].data.map((value, index) => (
								<View key={index}>
									<Text
										style={{
											position: 'absolute',
											left: ((Dimensions.get('window').width - 120) / chartData.labels.length) * index,
											top: 220 - (value / Math.max(...chartData.datasets[0].data)) * 220,
											width: 40,
											textAlign: 'center',
											backgroundColor: 'rgba(255, 255, 255, 0.7)',
											color: '#000',
											fontSize: 10,
										}}>
										£{value}
									</Text>
								</View>
							));
						}}
					/>
				)}
			</View>
			<Text>How Many Payments Are made:{invoices.length}</Text>
		</View>
	);
}
