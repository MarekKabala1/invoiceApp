import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '@/db/config';
import { User, Invoice, Payment } from '@/db/schema';
import { userSchema, invoiceSchema, paymentSchema } from '@/db/zodSchema';
import { z } from 'zod';
import PickerWithTouchableOpacity from '@/components/Picker';
import { Controller, useForm } from 'react-hook-form';
import { eq, inArray } from 'drizzle-orm';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { calculateInvoiceTotal } from '@/utils/invoiceCalculations';
import { format } from 'date-fns';
import BaseCard from '@/components/BaseCard';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

type UserType = z.infer<typeof userSchema>;
type InvoiceType = z.infer<typeof invoiceSchema>;
type PaymentType = {
	id: string;
	invoiceId: string;
	paymentDate: string | null | undefined;
	amountPaid: number | null | undefined;
	createdAt: string | null | undefined;
};

export default function Charts() {
	const { control, watch } = useForm<UserType>();
	const [userOptions, setUserOptions] = useState<Array<{ label: string; value: string }>>([]);
	const [invoices, setInvoices] = useState<InvoiceType[]>([]);
	const [payments, setPayments] = useState<Record<string, PaymentType[]>>({});
	const [totals, setTotals] = useState({ totalBeforeTax: 0, totalAfterTax: 0, taxToPay: 0, remainingToPay: 0 });

	const { colors, isDark } = useTheme();

	const selectedUserId = watch('id');

	const getUsers = async () => {
		try {
			const usersData = await db.select().from(User);
			const options = usersData.map((user) => ({
				label: user.fullName || 'First add User',
				value: user.id,
			}));
			setUserOptions(options);
		} catch (error) {
			console.error('Failed to get user data:', error);
		}
	};

	//todo:simplify this functions for getting and calculating invoices fixed by Ai looks good but can be done better

	const getUserInvoices = async (userId: string) => {
		try {
			// Fetch invoices for the user
			const invoiceData = await db.select().from(Invoice).where(eq(Invoice.userId, userId));
			setInvoices(invoiceData as unknown as InvoiceType[]);

			// Fetch payments for these invoices
			const invoiceIds = invoiceData.map((invoice) => invoice.id);
			const paymentsData = await db.select().from(Payment).where(inArray(Payment.invoiceId, invoiceIds));

			// Group payments by invoice ID
			const paymentsMap = paymentsData.reduce<Record<string, PaymentType[]>>((acc, payment) => {
				// Only process payments that have all required fields
				if (payment.invoiceId && payment.paymentDate && payment.amountPaid !== null) {
					const invoiceId = payment.invoiceId;
					if (!acc[invoiceId]) {
						acc[invoiceId] = [];
					}
					acc[invoiceId].push({
						id: payment.id,
						invoiceId: payment.invoiceId,
						paymentDate: payment.paymentDate,
						amountPaid: payment.amountPaid,
						createdAt: payment.createdAt,
					});
				}
				return acc;
			}, {});
			setPayments(paymentsMap);

			// Calculate totals
			const newTotals = invoiceData.reduce(
				(acc, invoice) => {
					const invoicePayments = invoice.id ? paymentsMap[invoice.id] || [] : [];
					const totalPaid = invoicePayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
					const remainingForInvoice = (invoice.amountBeforeTax || 0) - totalPaid;

					return {
						totalBeforeTax: acc.totalBeforeTax + (invoice.amountBeforeTax || 0),
						totalAfterTax: acc.totalAfterTax + (invoice.amountAfterTax || 0),
						taxToPay: acc.taxToPay + ((invoice.amountAfterTax || 0) - (invoice.amountBeforeTax || 0)),
						remainingToPay: acc.remainingToPay + remainingForInvoice,
					};
				},
				{ totalBeforeTax: 0, totalAfterTax: 0, taxToPay: 0, remainingToPay: 0 }
			);

			setTotals(newTotals);
		} catch (error) {
			console.error('Failed to get invoice data:', error);
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (selectedUserId) {
				getUserInvoices(selectedUserId);
			}
			getUsers();
		}, [selectedUserId])
	);

	const chartData = {
		labels: [
			'',
			...invoices.map((invoice) => {
				const date = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
				return format(date, 'dd/MM/yy');
			}),
		],
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
		<View style={{ paddingTop: insets.top }} className='flex-1 bg-light-primary dark:bg-dark-primary p-4 w-screen'>
			<View className='w-full items-end'>
				<ThemeToggle size={30} />
			</View>
			<View className='gap-4'>
				<Text className='text-center font-bold text-light-text dark:text-dark-text'>Pick User to display charts</Text>
				<Controller
					control={control}
					name='id'
					render={({ field: { onChange, onBlur, value } }) => (
						<PickerWithTouchableOpacity initialValue={'Select User'} onValueChange={onChange} items={userOptions} />
					)}
				/>
				{invoices.length > 0 && (
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<LineChart
							data={chartData}
							width={chartWidth}
							height={360}
							yAxisLabel='£'
							chartConfig={{
								backgroundColor: colors.nav,
								backgroundGradientFrom: colors.nav,
								backgroundGradientTo: colors.nav,

								decimalPlaces: 2,
								color: (opacity = 1) => (isDark ? `rgba(222, 197, 178, ${opacity})` : `rgba(73, 62, 62, ${opacity})`),
								labelColor: (opacity = 1) => (isDark ? `rgba(222, 197, 178, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
								propsForDots: {
									r: '6',
									strokeWidth: '2',
									stroke: colors.primary,
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
														backgroundColor: colors.text,
														color: colors.primary,
														fontSize: 10,
														borderRadius: 5,
														padding: 2,
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
				)}

				<BaseCard className='rounded-sm p-2'>
					<View className='flex-row justify-between border-b border-gray-200 pb-2'>
						<Text className='font-bold text-light-text dark:text-dark-text'>Invoices Sent So Far this Year:</Text>
						<Text className='text-light-text dark:text-dark-text'>{invoices.length}</Text>
					</View>

					<View className='flex-row justify-between border-b border-gray-200 py-2'>
						<Text className='font-bold text-light-text dark:text-dark-text'>Sum Before Tax:</Text>
						<Text className='text-light-text dark:text-dark-text'>{totals.totalBeforeTax.toFixed(2)}</Text>
					</View>

					<View className='flex-row justify-between border-b border-gray-200 py-2'>
						<Text className='font-bold text-light-text dark:text-dark-text'>Sum After Tax:</Text>
						<Text className='text-light-text dark:text-dark-text'>£{totals.totalAfterTax.toFixed(2)}</Text>
					</View>

					<View className='flex-row justify-between py-2'>
						<Text className='font-bold text-light-text dark:text-dark-text'>Tax to Pay:</Text>
						<Text className='text-light-text dark:text-dark-text'>£{totals.taxToPay.toFixed(2)}</Text>
					</View>
				</BaseCard>
			</View>
		</View>
	);
}
