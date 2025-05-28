import { View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import PickerWithTouchableOpacity from './Picker';
import currencyData from '@/assets/currency.json';
import { useState } from 'react';
import { categories } from '@/utils/categories';
import { useTransaction } from '@/hooks/useTransaction';
import { TransactionType } from '@/db/zodSchema';
import { generateId } from '@/utils/generateUuid';
import { db } from '@/db/config';
import { Transactions } from '@/db/schema';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const AddTransactionAfterScan = () => {
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		reset,
	} = useForm<TransactionType>({});

	const [isAddToBudgetModalVisible, setIsAddToBudgetModalVisible] = useState(false);
	const [addAmount, setAddAmount] = useState('');
	const [addCurrency, setAddCurrency] = useState('');

	const { users, currencies } = useTransaction();
	const { colors } = useTheme();

	const addDataToBudget = async () => {
		try {
			const data = watch();
			setIsAddToBudgetModalVisible(true);
			const id = await generateId();
			const categoryId = categories.INCOME.find((category) => category.id === 'work_expenses')?.id;
			await db.insert(Transactions).values({
				id: id,
				amount: data.amount,
				description: `Work Expenses`,
				date: new Date().toISOString(),
				type: 'INCOME',
				categoryId: categoryId,
				userId: data.userId,
				currency: data.currency,
			});
			setIsAddToBudgetModalVisible(false);
			reset();
			Alert.alert('Success', 'Transaction added to budget');
		} catch (error) {
			console.error('Error adding to budget:', error);
			Alert.alert('Error', 'Failed to add to budget');
		}
	};

	return (
		<Modal visible={isAddToBudgetModalVisible} transparent={true} animationType='slide' onRequestClose={() => setIsAddToBudgetModalVisible(false)}>
			<View className='flex-1 justify-center items-center  bg-light-text/30 dark:bg-dark-text/30'>
				<View className='bg-light-primary dark:bg-dark-primary p-4 rounded-lg w-11/12'>
					<Text>Add to Budget</Text>
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
						<Text className='text-light-text dark:text-dark-text mb-1'>Currency</Text>
						<Controller
							control={control}
							name='currency'
							render={({ field: { value, onChange, onBlur } }) => (
								<PickerWithTouchableOpacity mode='dropdown' items={currencies} initialValue={value} onValueChange={(value) => onChange(value)} />
							)}
						/>
					</View>

					<TouchableOpacity onPress={addDataToBudget}>
						<Text>Add</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

export default AddTransactionAfterScan;
