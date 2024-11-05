import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { and, eq, gte, lte, between } from 'drizzle-orm';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '@/db/config';
import { Transactions } from '@/db/schema';
import { TransactionType } from '../../db/zodSchema';
import { MaterialIcons } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';
import { getCategoryEmoji } from '@/utils/categories';
import BaseCard from '@/components/BaseCard';

export default function BudgetScreen() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [transactions, setTransactions] = useState<TransactionType[]>([]);

	const fetchTransactions = async (date: Date) => {
		const monthStart = startOfMonth(date).toISOString();
		const monthEnd = endOfMonth(date).toISOString();

		const query = await db
			.select()
			.from(Transactions)
			.where(between(Transactions.date, monthStart, monthEnd));

		const transformedData = query.map((item) => ({
			id: item.id ?? '',
			categoryId: item.categoryId ?? '',
			userId: item.userId ?? '',
			amount: item.amount ?? 0,
			date: item.date ?? new Date().toISOString(),
			description: item.description ?? '',
			type: item.type as 'EXPENSE' | 'INCOME',
			currency: item.currency ?? 'GBP',
		}));

		setTransactions(transformedData);
	};

	useFocusEffect(
		useCallback(() => {
			fetchTransactions(currentDate);
		}, [currentDate, Transactions])
	);

	useEffect(() => {
		fetchTransactions(currentDate);
	}, [currentDate, Transactions]);

	const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);

	const totalExpenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);

	const handlePreviousMonth = () => {
		setCurrentDate((prev) => subMonths(prev, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate((prev) => subMonths(prev, -1));
	};

	return (
		<View className='flex-1 bg-primaryLight pt-14 p-2'>
			<BaseCard className=''>
				<View className='flex-row justify-between items-center '>
					<TouchableOpacity onPress={handlePreviousMonth} className='p-2'>
						<MaterialIcons name='chevron-left' size={24} color='#8b5e3c ' />
					</TouchableOpacity>

					<Text className='text-lg font-semibold text-textLight'>{format(currentDate, 'MMMM yyyy')}</Text>

					<TouchableOpacity onPress={handleNextMonth} className='p-2'>
						<MaterialIcons name='chevron-right' size={24} color='#8b5e3c ' />
					</TouchableOpacity>
				</View>

				<View className='flex-row justify-between mb-2'>
					<Text className='text-success font-semibold'>Income: £{totalIncome.toFixed(2)}</Text>
					<Text className='text-danger font-semibold'>Expenses: £{totalExpenses.toFixed(2)}</Text>
				</View>
				<Text className='text-textLight font-bold text-lg'>Balance: £{(totalIncome - totalExpenses).toFixed(2)}</Text>
			</BaseCard>

			<FlatList
				data={transactions}
				className='flex-1'
				renderItem={({ item }) => (
					<View className='flex-row justify-between items-center p-4 border-b border-textLight mx-2'>
						<View className='flex-row items-center'>
							<Text className='mr-2 text-xl'>{getCategoryEmoji(item.categoryId)}</Text>
							<View>
								<Text className='font-semibold text-gray-800'>{item.description}</Text>
								<Text className='text-sm text-gray-500'>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
							</View>
						</View>
						<Text className={`${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
							{item.type === 'INCOME' ? '+' : '-'}£{item.amount.toFixed(2)}
						</Text>
					</View>
				)}
			/>

			<TouchableOpacity
				onPress={() => router.push('/addTransaction')}
				className='absolute bottom-6 right-6 bg-textLight  w-14 h-14 rounded-full items-center justify-center shadow-lg'>
				<MaterialIcons name='add' size={30} color='white' />
			</TouchableOpacity>
		</View>
	);
}
