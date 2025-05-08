import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { db } from '@/db/config';
import { generateId } from '@/utils/generateUuid';
import { categories } from '@/utils/categories';
import BaseCard from '@/components/BaseCard';
import { transactionSchema, TransactionType } from '@/db/zodSchema';
import { Transactions, User } from '@/db/schema';
import PickerWithTouchableOpacity from '@/components/Picker';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/context/ThemeContext';
import DatePicker from '@/components/DatePicker';

const transactionTypes = [
	{ id: 'EXPENSE', label: 'Expense' },
	{ id: 'INCOME', label: 'Income' },
];

export default function AddTransaction() {
	const [users, setUsers] = useState<{ label: string; value: string }[]>([]);
	const { colors } = useTheme();
	const MAX_LENGTH = 20;
	const params = useLocalSearchParams();
	const isUpdateMode = params.mode === 'update';
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		reset,
	} = useForm<TransactionType>({
		// resolver: zodResolver(transactionSchema),
		defaultValues: {
			type: ((params.type as string) || 'EXPENSE') as 'EXPENSE' | 'INCOME',
			amount: isUpdateMode ? parseFloat(params.amount as string) : ('' as unknown as number),
			description: (params.description as string) || '',
			categoryId: (params.categoryId as string) || '',
			userId: (params.userId as string) || '',
			date: (params.data as string) || new Date().toISOString(),
			currency: 'GBP',
		},
	});

	const type = watch('type', 'EXPENSE');

	const getUsers = async () => {
		try {
			const usersFromDb = await db.select().from(User);
			const formattedUsers = usersFromDb.map((user) => ({
				label: user.fullName || 'Unnamed User',
				value: user.id || '',
			}));
			setUsers(formattedUsers);
		} catch (error) {
			console.error('Error geting users:', error);
			Alert.alert('Error', 'Failed to load users');
		}
	};

	useEffect(() => {
		getUsers();
	}, []);

	const onSubmit = async (data: TransactionType) => {
		try {
			// Validate fields
			if (!data.userId) {
				Alert.alert('Error', 'Please select a user');
				return;
			}
			if (!data.categoryId) {
				Alert.alert('Error', 'Please select a category');
				return;
			}

			const amount = parseFloat(data.amount as unknown as string);
			if (isNaN(amount)) {
				Alert.alert('Error', 'Please enter a valid amount');
				return;
			}

			const id = await generateId();
			const transaction = {
				...data,
				id: id,
				amount: amount,
				date: data.date,
				currency: 'GBP',
			};
			if (isUpdateMode) {
				function ensureString(value: string | string[]): string {
					return Array.isArray(value) ? value[0] : value;
				}
				const updatedTransaction = {
					...data,
					userId: params.userId.toString(),
					id: ensureString(params.transactionId),
					type: ensureString(params.types),
					date: ensureString(params.date),
				};

				await db
					.update(Transactions)
					.set(updatedTransaction)
					.where(eq(Transactions.id, params.transactionId as string));
			} else {
				await db.insert(Transactions).values(transaction);
			}

			Alert.alert('Success', 'Transaction added successfully', [
				{
					text: 'OK',
					onPress: () => {
						reset();
						router.back();
					},
				},
			]);
		} catch (error) {
			console.error('Failed to add transaction:', error);
			Alert.alert('Error', 'Failed to add transaction. Please try again.');
		}
	};

	return (
		<ScrollView className='flex-1 bg-light-primary dark:bg-dark-primary p-4'>
			<View className='space-y-4 gap-2'>
				<View className='flex-row gap-2'>
					<Controller
						control={control}
						name='type'
						render={({ field: { value, onChange } }) => (
							<>
								{transactionTypes.map((t) => {
									const isSelected = value ? value === t.id : params?.type === t.id;

									return (
										<TouchableOpacity
											key={t.id}
											onPress={() => {
												onChange(t.id);
											}}
											className={`flex-1 p-3 rounded-lg bg-light-nav dark:bg-dark-nav ${isSelected ? 'border-2 border-light-text dark:border-dark-text' : ''}`}>
											<Text className=' text-center text-light-text dark:text-dark-text'>{t.label}</Text>
										</TouchableOpacity>
									);
								})}
							</>
						)}
					/>
				</View>

				<View className='gap-2'>
					<Text className='text-light-text dark:text-dark-text mb-1'>Select User</Text>
					<Controller
						control={control}
						name='userId'
						render={({ field: { onChange, value } }) => (
							<>
								<PickerWithTouchableOpacity mode='dropdown' items={users} initialValue='Add User' onValueChange={(value) => setValue('userId', value)} />
								{errors.userId && <Text className='text-danger text-xs'>{errors.userId.message}</Text>}
							</>
						)}
					/>
				</View>

				<View className='gap-2'>
					<Controller
						control={control}
						name='date'
						render={({ field: { onChange, value } }) => {
							const dateValue = typeof value === 'string' ? new Date(value) : value;
							return (
								<>
									<Text className='text-dark-primary dark:text-light-primary'>Date :</Text>
									<DatePicker name='' value={dateValue} onChange={(date) => onChange(date.toISOString())} />
									{errors.date && <Text className='text-danger text-xs'>{errors.date.message}</Text>}
								</>
							);
						}}
					/>
				</View>

				<View className='gap-2'>
					<Text className='text-light-text dark:text-dark-text mb-1'>Amount</Text>
					<Controller
						control={control}
						name='amount'
						render={({ field: { value, onChange, onBlur } }) => (
							<TextInput
								className={`border rounded-lg p-2 ${errors.amount ? 'border-danger text-danger' : 'border-light-text dark:border-dark-text text-light-text dark:text-dark-text'}`}
								keyboardType='decimal-pad'
								value={value === 0 ? '' : value?.toString()}
								onChangeText={(text) => {
									const numericValue = text.replace(/[^0-9.]/g, '');
									const parts = numericValue.split('.');
									if (parts.length > 2) {
										return;
									}
									onChange(numericValue);
								}}
								onBlur={onBlur}
								placeholder='0.00'
								placeholderTextColor={colors.text}
							/>
						)}
					/>
					{errors.amount && <Text className='text-red-500 text-xs'>{errors.amount.message}</Text>}
				</View>

				<View className='gap-2'>
					<Text className='text-light-text dark:text-dark-text mb-1'>Description</Text>
					<Controller
						control={control}
						name='description'
						render={({ field: { value, onChange, onBlur } }) => (
							<TextInput
								className={`border rounded-lg p-2 ${errors.description ? 'border-danger text-danger' : 'border-light-text dark:border-dark-text text-light-text dark:text-dark-text'}`}
								maxLength={MAX_LENGTH}
								value={value}
								onChangeText={(text) => {
									onChange(text);
								}}
								onBlur={onBlur}
								placeholder='Enter description max 20 characters'
								placeholderTextColor={colors.text}
							/>
						)}
					/>
					{errors.description && <Text className='text-red-500 text-xs'>{errors.description.message}</Text>}
				</View>

				<View className='gap-2'>
					<Text className='text-light-text dark:text-dark-text mb-1'>Category</Text>
					<Controller
						control={control}
						name='categoryId'
						render={({ field: { value, onChange } }) => (
							<ScrollView className='gap-2' horizontal showsHorizontalScrollIndicator={false}>
								{(type === 'EXPENSE' ? categories.EXPENSE : categories.INCOME).map((category) => (
									<BaseCard key={category.id} className={`mr-2 ${value === category.id ? 'border-2 border-light-text dark:border-dark-text' : ''}`}>
										<TouchableOpacity
											onPress={() => {
												onChange(category.id);
											}}>
											<Text className='text-light-text dark:text-dark-text'>
												{category.name} {category.emoji}
											</Text>
										</TouchableOpacity>
									</BaseCard>
								))}
							</ScrollView>
						)}
					/>
					{errors.categoryId && <Text className='text-red-500 text-xs'>{errors.categoryId.message}</Text>}
				</View>

				<TouchableOpacity onPress={handleSubmit(onSubmit)} className='bg-light-nav dark:bg-dark-nav p-3 rounded-lg mt-4 elevation-md'>
					<Text className='text-light-text dark:text-dark-text text-center font-semibold'>{isUpdateMode ? 'Update Transaction' : 'Add Transaction'}</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
