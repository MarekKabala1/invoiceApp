import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, SafeAreaView } from 'react-native';
import { and, eq, gte, lte, between } from 'drizzle-orm';
import { format, subMonths, startOfMonth, endOfMonth, set } from 'date-fns';
import { db } from '@/db/config';
import { Transactions } from '@/db/schema';
import { TransactionType } from '../../db/zodSchema';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';
import { getCategoryById, getCategoryEmoji } from '@/utils/categories';
import BaseCard from '@/components/BaseCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';
import { colors } from '@/utils/theme';

export default function BudgetScreen() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [transactions, setTransactions] = useState<TransactionType[]>([]);
	const [openSearchInput, setOpenSearchInput] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterByTransactionType, setFilterByTransactionType] = useState<TransactionType['type'] | ''>('');
	const [filterByCategory, setFilterByCategory] = useState('');

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
			if (openSearchInput === false) {
				fetchTransactions(currentDate);
			}
		}, [currentDate, Transactions, openSearchInput])
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

	const filterTransaction = (query: string) => {
		setSearchQuery(query);
		if (query) {
			const filteredTransactions = transactions.filter((transaction) => {
				const matchesDescription = transaction.description.toLowerCase().includes(query.toLowerCase());

				const categoryName = getCategoryById(transaction.categoryId)?.name || '';
				const matchesCategory = categoryName.toLowerCase().includes(query.toLowerCase());

				return matchesDescription || matchesCategory;
			});
			setTransactions(filteredTransactions);
		} else {
			if (filterByTransactionType) {
				const filtered = transactions.filter((transaction) => transaction.type === filterByTransactionType);
				setTransactions(filtered);
			} else {
				fetchTransactions(currentDate);
			}
		}
	};
	const handleFilterChangeIncome = async () => {
		if (filterByTransactionType === 'EXPENSE') {
			setFilterByTransactionType('');
			await fetchTransactions(currentDate);
		} else {
			setFilterByTransactionType('');
			await fetchTransactions(currentDate).then(() => {
				setFilterByTransactionType('INCOME');
				const filtered = transactions.filter((transaction) => transaction.type === 'INCOME');
				setTransactions(filtered);
			});
		}
	};

	const handleFilterChangeExpense = async () => {
		if (filterByTransactionType === 'INCOME') {
			setFilterByTransactionType('');
			await fetchTransactions(currentDate);
		} else {
			setFilterByTransactionType('');
			await fetchTransactions(currentDate).then(() => {
				setFilterByTransactionType('EXPENSE');
				const filtered = transactions.filter((transaction) => transaction.type === 'EXPENSE');
				setTransactions(filtered);
			});
		}
	};

	const handleFilterChange = async (type: TransactionType['type'] | '') => {
		//toDo:change to refetch data when type change from income to expense and vice versa

		await fetchTransactions(currentDate);
		if (type === filterByTransactionType) {
			setFilterByTransactionType('');
		} else {
			setFilterByTransactionType(type);
			if (type === 'EXPENSE' || type === 'INCOME') {
				const filtered = transactions.filter((transaction) => transaction.type === type);
				setTransactions(filtered);
			}
		}
	};

	const openSearch = () => {
		setSearchQuery('');
		setOpenSearchInput((prev) => !prev);
	};

	const insets = useSafeAreaInsets();
	return (
		<SafeAreaView className='flex-1 bg-primaryLight ' style={{ paddingTop: insets.top }}>
			<View className='flex-1 gap-4  p-2 mb-28'>
				<BaseCard className='mt-3'>
					<View className='flex-row justify-between items-center '>
						<TouchableOpacity onPress={handlePreviousMonth} className='p-2'>
							<Ionicons name='chevron-back' size={24} color={colors.textLight} />
						</TouchableOpacity>

						<Text className='text-lg font-semibold text-textLight'>{format(currentDate, 'MMMM yyyy')}</Text>

						<TouchableOpacity onPress={handleNextMonth} className='p-2'>
							<Ionicons name='chevron-forward' size={24} color={colors.textLight} />
						</TouchableOpacity>
					</View>
					<View className='flex-row justify-between mb-2'>
						<Text className='text-success font-semibold'>Income: £{totalIncome.toFixed(2)}</Text>
						<Text className='text-danger font-semibold'>Expenses: £{totalExpenses.toFixed(2)}</Text>
					</View>
					<Text className='text-textLight font-bold text-lg'>Balance: £{(totalIncome - totalExpenses).toFixed(2)}</Text>
				</BaseCard>
				<View className='flex-row justify-between'>
					<View className=' items-center '>
						<TouchableOpacity onPress={() => router.push('/addTransaction')} className='flex-row gap-1 items-center'>
							<View>
								<Ionicons name='add-circle-outline' size={24} color={colors.textLight} />
							</View>
							<Text className='text-textLight text-xs font-bold'>Add Budget</Text>
						</TouchableOpacity>
					</View>
					<View className=' items-center '>
						<TouchableOpacity onPress={openSearch} className='flex-row gap-1 items-center'>
							<View>
								<Ionicons name='search' size={24} color={colors.textLight} />
							</View>
							<Text className='text-textLight text-xs font-bold'>Search</Text>
						</TouchableOpacity>
					</View>
				</View>
				{openSearchInput && (
					<View className=' gap-2'>
						<View className='flex-row items-center gap-2 '>
							<BaseCard className='flex-row items-center gap-2 '>
								{filterByTransactionType === 'INCOME' ? (
									<TouchableOpacity className='flex-row items-center gap-2 ' onPress={() => handleFilterChange('')}>
										<Text className='text-textLight font-bold text-xs'>Income</Text>
										<Ionicons name='close-sharp' size={16} color={colors.textLight} />
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={handleFilterChangeIncome}>
										<Text className='text-textLight font-bold text-xs'>Income</Text>
									</TouchableOpacity>
								)}
							</BaseCard>
							<BaseCard className='flex-row items-center gap-2 '>
								{filterByTransactionType === 'EXPENSE' ? (
									<TouchableOpacity className='flex-row items-center gap-2 ' onPress={() => handleFilterChange('')}>
										<Text className='text-textLight font-bold text-xs'>Expenses</Text>
										<Ionicons name='close-sharp' size={16} color={colors.textLight} />
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={handleFilterChangeExpense}>
										<Text className='text-textLight font-bold text-xs'>Expenses</Text>
									</TouchableOpacity>
								)}
							</BaseCard>
						</View>
						<View className='flex-row items-center gap-2 w-full bg-navLight/50 p-2 rounded  text-textLight text-sm '>
							<TextInput
								onChangeText={filterTransaction}
								value={searchQuery}
								className=' w-[90%]'
								placeholder='Search'
								placeholderTextColor={colors.textLight}
							/>

							<TouchableOpacity onPress={() => setOpenSearchInput(false)}>
								<Ionicons name='close-sharp' size={20} color={colors.textLight} />
							</TouchableOpacity>
						</View>
					</View>
				)}
				<FlatList
					data={transactions}
					className=''
					renderItem={({ item }) => (
						<>
							<TouchableOpacity
								onLongPress={() => deleteTransaction(item.id)}
								className='flex-row justify-between items-center p-4 border-b border-textLight mx-2'>
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
							<Text className='text-xs text-mutedForeground opacity-50 text-center '>*Press and hold to delete Transaction</Text>
						</>
					)}
				/>
			</View>
		</SafeAreaView>
	);
}
