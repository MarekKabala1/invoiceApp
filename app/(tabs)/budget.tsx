import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { db } from '@/db/config';
import { Transaction } from '../../db/zodSchema';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { getCategoryEmoji } from '@/utils/categories';
import { SafeAreaView } from 'react-native-safe-area-context';
import BaseCard from '@/components/BaseCard';

export default function BudgetScreen() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	const fetchTransactions = async () => {
		const start = startOfMonth(currentDate);
		const end = endOfMonth(currentDate);

		//ToDo: Implement the query to fetch transactions between start and end dates
	};

	const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);

	const totalExpenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);

	return (
		<View className='flex-1 bg-primaryLight pt-14 p-2'>
			<BaseCard className=''>
				<View className='flex-row justify-between items-center '>
					<TouchableOpacity onPress={() => setCurrentDate((prev) => subMonths(prev, 1))} className='p-2'>
						<MaterialIcons name='chevron-left' size={24} color='#4F4A3E' />
					</TouchableOpacity>

					<Text className='text-lg font-semibold text-gray-800'>{format(currentDate, 'MMMM yyyy')}</Text>

					<TouchableOpacity onPress={() => setCurrentDate((prev) => subMonths(prev, -1))} className='p-2'>
						<MaterialIcons name='chevron-right' size={24} color='#4F4A3E' />
					</TouchableOpacity>
				</View>

				<View className='flex-row justify-between mb-2'>
					<Text className='text-success font-semibold'>Income: £{totalIncome.toFixed(2)}</Text>
					<Text className='text-danger font-semibold'>Expenses: £{totalExpenses.toFixed(2)}</Text>
				</View>
				<Text className='text-gray-800 font-bold text-lg'>Balance: £{(totalIncome - totalExpenses).toFixed(2)}</Text>
			</BaseCard>

			<FlatList
				data={transactions}
				className='flex-1'
				renderItem={({ item }) => (
					<View className='flex-row justify-between items-center p-4 border-b border-gray-200'>
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
