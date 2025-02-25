import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, SafeAreaView, PanResponder } from 'react-native';
import { eq, between } from 'drizzle-orm';
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
import { color } from '@/utils/theme';
import { calculateTotals } from '@/utils/transactionCalculation';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function BudgetScreen() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [transactions, setTransactions] = useState<TransactionType[]>([]);
	const [openSearchInput, setOpenSearchInput] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterByTransactionType, setFilterByTransactionType] = useState<TransactionType['type'] | ''>('');
	const [filterByCategory, setFilterByCategory] = useState('');
	const [previousBalance, setPreviousBalance] = useState(0);
	const [allTransactions, setAllTransactions] = useState<TransactionType[]>([]);

	const { colors } = useTheme();

	const getTransactions = async (date: Date) => {
		const monthStart = startOfMonth(date).toISOString();
		const monthEnd = endOfMonth(date).toISOString();

		const getTransactionForGivenDate = await db
			.select()
			.from(Transactions)
			.where(between(Transactions.date, monthStart, monthEnd));

		const transformedData = getTransactionForGivenDate.map((item) => ({
			id: item.id,
			categoryId: item.categoryId!,
			userId: item.userId!,
			amount: item.amount!,
			date: item.date!,
			description: item.description!,
			type: item.type as 'EXPENSE' | 'INCOME',
			currency: item.currency!,
		}));

		const sortTransactionsByDate = () => {
			return [...transformedData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			return transformedData;
		};
		setTransactions(sortTransactionsByDate);
	};

	useFocusEffect(
		useCallback(() => {
			if (openSearchInput === false) {
				getTransactions(currentDate);
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

	const getAllTransactions = async () => {
		try {
			const getAllTransactions = await db.select().from(Transactions);
			const transformedData = getAllTransactions.map((item) => ({
				id: item.id,
				categoryId: item.categoryId!,
				userId: item.userId!,
				amount: item.amount!,
				date: item.date!,
				description: item.description!,
				type: item.type as 'EXPENSE' | 'INCOME',
				currency: item.currency!,
			}));
			setAllTransactions(transformedData);
		} catch (e) {
			console.error(`Error geting transactions:${e}`);
		}
	};

	//Balance for all transactions
	const overallBallance = useMemo(() => calculateTotals(allTransactions), [allTransactions]);

	//Balance for the current month
	const monthlyBallance = useMemo(() => calculateTotals(transactions).balance, [transactions]);
	const totalIncomeForTheMonth = useMemo(() => calculateTotals(transactions).income, [transactions]);
	const totalExpensesForTheMonth = useMemo(() => calculateTotals(transactions).expense, [transactions]);

	useEffect(() => {
		setPreviousBalance(overallBallance.balance);
	}, [overallBallance]);

	useFocusEffect(
		useCallback(() => {
			getAllTransactions();
		}, [])
	);

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
				getTransactions(currentDate);
			}
		}
	};
	useEffect(() => {
		filterTransaction(searchQuery);
	}, [filterByTransactionType, searchQuery]);

	const handleFilterChange = async (type: TransactionType['type'] | '') => {
		await getTransactions(currentDate);
		try {
			if (type === filterByTransactionType) {
				setFilterByTransactionType('');
			} else {
				setFilterByTransactionType(type);
				if (type === 'EXPENSE' || type === 'INCOME') {
					const filtered = transactions.filter((transaction) => transaction.type === type);
					setTransactions(filtered);
				}
			}
		} catch (e) {
			console.error(`Error geting transactions:${e}`);
		}
	};

	useEffect(() => {
		filterTransaction(searchQuery);
	}, [searchQuery]);

	const openSearch = () => {
		setSearchQuery('');
		setOpenSearchInput((prev) => !prev);
	};

	interface GestureState {
		/**
		 * dx: Distant on x axis
		 *  number - The distance of the gesture since the touch started
		 */

		dx: number;
	}

	const handleSwipe = async (gestureState: GestureState) => {
		if (gestureState.dx > 50) {
			handlePreviousMonth();
		} else if (gestureState.dx < -50) {
			handleNextMonth();
		}
	};

	const panResponder = PanResponder.create({
		onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 20,
		onPanResponderRelease: (evt, gestureState) => handleSwipe(gestureState),
	});

	const insets = useSafeAreaInsets();
	return (
		<View className='flex-1 bg-light-primary dark:bg-dark-primary ' style={{ paddingTop: insets.top }} {...panResponder.panHandlers}>
			<View className='flex-1 gap-2  p-2 mb-20'>
				<View className='w-full items-end'>
					<ThemeToggle size={30} />
				</View>
				<BaseCard>
					<View className='flex-row justify-between items-center '>
						<TouchableOpacity onPress={handlePreviousMonth} className='p-2'>
							<Ionicons name='chevron-back' size={24} color={colors.text} />
						</TouchableOpacity>

						<Text className='text-lg font-semibold text-light-text dark:text-dark-text'>{format(currentDate, 'MMMM yyyy')}</Text>

						<TouchableOpacity onPress={handleNextMonth} className='p-2'>
							<Ionicons name='chevron-forward' size={24} color={colors.text} />
						</TouchableOpacity>
					</View>
					<View className='flex-row justify-between items-center mb-2'>
						<Text className='text-success font-semibold'>Income: £{totalIncomeForTheMonth.toFixed(2)}</Text>
						<Text className='text-danger font-semibold'>Expenses: £{totalExpensesForTheMonth.toFixed(2)}</Text>
					</View>
					<View className='flex-col justify-between items-start mb-2'>
						<Text className='text-light-text dark:text-dark-text font-bold text-xl'>Total: £{monthlyBallance.toFixed(2)}</Text>
						<Text className='text-light-text dark:text-dark-text font-bold text-xs pl-1'>Balance: £{previousBalance.toFixed(2)}</Text>
					</View>
				</BaseCard>
				<View className='flex-row justify-between'>
					<View className=' items-center '>
						<TouchableOpacity onPress={() => router.push('/addTransaction')} className='flex-row gap-1 items-center'>
							<View>
								<Ionicons name='add-circle-outline' size={24} color={colors.text} />
							</View>
							<Text className='text-light-text dark:text-dark-text text-xs font-bold'>Add Budget</Text>
						</TouchableOpacity>
					</View>
					<View className=' items-center '>
						<TouchableOpacity onPress={openSearch} className='flex-row gap-1 items-center'>
							<View>
								<Ionicons name='search' size={24} color={colors.text} />
							</View>
							<Text className='text-light-text dark:text-dark-text text-xs font-bold'>Search</Text>
						</TouchableOpacity>
					</View>
				</View>
				{openSearchInput && (
					<View className=' gap-2'>
						<View className='flex-row items-center gap-2 '>
							<BaseCard className='flex-row items-center gap-2 '>
								{filterByTransactionType === 'INCOME' ? (
									<TouchableOpacity className='flex-row items-center gap-2 ' onPress={() => handleFilterChange('')}>
										<Text className='text-light-text dark:text-dark-text font-bold text-xs'>Income</Text>
										<Ionicons name='close-sharp' size={16} color={colors.text} />
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={() => handleFilterChange('INCOME')}>
										<Text className='text-light-text dark:text-dark-text font-bold text-xs'>Income</Text>
									</TouchableOpacity>
								)}
							</BaseCard>
							<BaseCard className='flex-row items-center gap-2 '>
								{filterByTransactionType === 'EXPENSE' ? (
									<TouchableOpacity className='flex-row items-center gap-2 ' onPress={() => handleFilterChange('')}>
										<Text className='text-light-text dark:text-dark-text font-bold text-xs'>Expenses</Text>
										<Ionicons name='close-sharp' size={16} color={colors.text} />
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={() => handleFilterChange('EXPENSE')}>
										<Text className='text-light-text dark:text-dark-text font-bold text-xs'>Expenses</Text>
									</TouchableOpacity>
								)}
							</BaseCard>
						</View>
						<View className='flex-row items-center gap-2 w-full bg-light-nav dark:bg-dark-nav p-2 rounded  text-light-text dark:text-dark-text text-sm '>
							<TextInput onChangeText={filterTransaction} value={searchQuery} className=' w-[90%]' placeholder='Search' placeholderTextColor={colors.text} />

							<TouchableOpacity onPress={() => setOpenSearchInput(false)}>
								<Ionicons name='close-sharp' size={20} color={colors.text} />
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
								className='flex-row justify-between items-center p-4 border-b border-light-text dark:border-dark-text mx-2'>
								<View className='flex-row items-center'>
									<Text className='mr-2 text-xl'>{getCategoryEmoji(item.categoryId)}</Text>
									<View>
										<Text className='font-bold text-light-text dark:text-dark-text'>{getCategoryById(item.categoryId)?.name || `${item.description}`}</Text>
										<Text className='text-xs text-light-text/50 dark:text-dark-text/50'>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
									</View>
								</View>
								<View className='flex-row items-center gap-2'>
									<View className='justify-center items-end '>
										<Text className={`${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
											{item.type === 'INCOME' ? '+' : '-'}
											{getCurrencySymbol(item.currency)}
											{item.amount.toFixed(2)}
										</Text>
										<Text className='text-light-text/50 dark:text-dark-text/50 text-xs'>{item.description}</Text>
									</View>
									<TouchableOpacity onPress={() => handleUpdateTransaction(item)} className='border border-light-text dark:border-dark-text rounded-md p-1'>
										<MaterialCommunityIcons name='update' size={16} color={colors.text} />
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
							<Text className='text-xs text-light-text/50 dark:text-dark-text/50  text-center '>*Press and hold to delete Transaction</Text>
						</>
					)}
				/>
			</View>
		</View>
	);
}
