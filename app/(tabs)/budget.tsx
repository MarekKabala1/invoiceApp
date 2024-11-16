import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { and, eq, gte, lte, between } from 'drizzle-orm';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '@/db/config';
import { Transactions } from '@/db/schema';
import { TransactionType } from '../../db/zodSchema';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';
import { getCategoryById, getCategoryEmoji } from '@/utils/categories';
import BaseCard from '@/components/BaseCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';

export default function BudgetScreen() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [transactions, setTransactions] = useState<TransactionType[]>([]);

	const fetchTransactions = async (date: Date) => {
		const monthStart = startOfMonth(date).toISOString();
		const monthEnd = endOfMonth(date).toISOString();

		const getTransactionForGivenDate = await db
			.select()
			.from(Transactions)
			.where(between(Transactions.date, monthStart, monthEnd));

		const transformedData = getTransactionForGivenDate.map((item) => ({
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
	const deleteTransaction = async (transactionId: string) => {
		try {
			await db.delete(Transactions).where(eq(Transactions.id, transactionId));
			setTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction.id !== transactionId));
		} catch (e) {
			throw new Error(`There is problem to delete Customer ${e}`);
		}
	};

	const handleUpdateTransaction = (transaction: TransactionType) => {
		router.push({
			pathname: '/addTransaction',
			params: {
				mode: 'update',
				userId: transaction.userId,
				transactionId: transaction.id,
				categoryId: transaction.categoryId,
				amount: transaction.amount.toString(),
				description: transaction.description,
				type: transaction.type,
				date: transaction.date,
			},
		});
	};

	const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);

	const totalExpenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);

	const handlePreviousMonth = () => {
		setCurrentDate((prev) => subMonths(prev, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate((prev) => subMonths(prev, -1));
	};
	const insets = useSafeAreaInsets();
	return (
		<View className='flex-1 gap-4 bg-primaryLight  p-2 ' style={{ paddingTop: insets.top }}>
			<BaseCard>
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
			<BaseCard className=' items-center '>
				<TouchableOpacity onPress={() => router.push('/addTransaction')} className='flex-row gap-1'>
					<View className=' border border-textLight rounded-full'>
						<MaterialIcons name='add' size={16} color='#8b5e3c' />
					</View>
					<Text className='text-textLight text-xs'>Add Budget</Text>
				</TouchableOpacity>
			</BaseCard>

			<FlatList
				data={transactions}
				className=''
				renderItem={({ item }) => (
					<TouchableOpacity onLongPress={() => deleteTransaction(item.id)} className='flex-row justify-between items-center p-4 border-b border-textLight mx-2'>
						<View className='flex-row items-center'>
							<Text className='mr-2 text-xl'>{getCategoryEmoji(item.categoryId)}</Text>
							<View>
								<Text className='font-semibold text-gray-800'>{getCategoryById(item.categoryId)?.name || `${item.description}`}</Text>
								<Text className='text-sm text-gray-500'>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
							</View>
						</View>
						<View className='flex-row items-center gap-2'>
							<View className='justify-center items-end '>
								<Text className={`${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
									{item.type === 'INCOME' ? '+' : '-'}
									{getCurrencySymbol(item.currency)}
									{item.amount.toFixed(2)}
								</Text>
								<Text className='text-mutedForeground text-xs'>{item.description}</Text>
							</View>
							<TouchableOpacity onPress={() => handleUpdateTransaction(item)} className='border border-textLight rounded-md p-1'>
								<MaterialCommunityIcons name='update' size={16} color={'#8b5e3c'} />
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				)}
			/>
			<Text className='text-xs text-mutedForeground opacity-50 text-center mb-4'>*Press and hold to delete Transaction</Text>
		</View>
	);
}
