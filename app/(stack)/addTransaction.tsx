import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { db } from '@/db/config';
import { generateId } from '@/utils/generateUuid';
import { getCategoryById, getCategoryEmoji, categories } from '@/utils/categories';
import BaseCard from '@/components/BaseCard';

const transactionTypes = [
	{ id: 'EXPENSE', label: 'Expense' },
	{ id: 'INCOME', label: 'Income' },
];

export default function AddTransaction() {
	const [amount, setAmount] = useState('');
	const [description, setDescription] = useState('');
	const [type, setType] = useState('EXPENSE');
	const [selectedCategory, setSelectedCategory] = useState('');

	const handleSubmit = async () => {
		if (!amount || !description || !selectedCategory) return;
		const id = await generateId();
		const transaction = {
			id,
			amount: parseFloat(amount),
			description,
			type,
			categoryId: selectedCategory,
			date: new Date().toISOString(),
			currency: 'GBP',
		};

		router.back();
	};

	return (
		<ScrollView className='flex-1 bg-primaryLight p-4'>
			<View className='space-y-4 gap-2'>
				{/* Type Selection */}
				<View className='flex-row gap-2'>
					{transactionTypes.map((t) => (
						<TouchableOpacity key={t.id} onPress={() => setType(t.id)} className={`flex-1 p-3 rounded-lg ${type === t.id ? 'bg-textLight ' : 'bg-gray-200'}`}>
							<Text className={`text-center ${type === t.id ? 'text-white' : 'text-gray-800'}`}>{t.label}</Text>
						</TouchableOpacity>
					))}
				</View>

				<View className='gap-2'>
					<Text className='text-gray-600 mb-1'>Amount</Text>
					<TextInput className='border border-gray-300 rounded-lg p-3' keyboardType='decimal-pad' value={amount} onChangeText={setAmount} placeholder='0.00' />
				</View>

				<View className='gap-2'>
					<Text className='text-gray-600 mb-1'>Description</Text>
					<TextInput className='border border-gray-300 rounded-lg p-3' value={description} onChangeText={setDescription} placeholder='Enter description' />
				</View>

				<View className='gap-2'>
					<Text className='text-gray-600 mb-1'>Category</Text>
					<ScrollView className=' gap-2' horizontal showsHorizontalScrollIndicator={false}>
						{type === 'EXPENSE'
							? categories.EXPENSE.map((i) => (
									<TouchableOpacity onPress={() => setSelectedCategory(i.id)}>
										<BaseCard className='mr-2'>
											<Text key={i.id}>
												{i.name} {i.emoji}
											</Text>
										</BaseCard>
									</TouchableOpacity>
								))
							: categories.INCOME.map((i) => (
									<TouchableOpacity onPress={() => setSelectedCategory(i.id)}>
										<BaseCard className='mr-2'>
											<Text key={i.id}>
												{i.name} {i.emoji}
											</Text>
										</BaseCard>
									</TouchableOpacity>
								))}
					</ScrollView>
				</View>

				<TouchableOpacity onPress={handleSubmit} className='bg-textLight  p-4 rounded-lg mt-4'>
					<Text className='text-white text-center font-semibold'>Add Transaction</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
