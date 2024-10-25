import { db } from '@/db/config';
import { BankDetails } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';
import PickerWithTouchableOpacity from '@/components/Picker';
import { userSchema } from '@/db/zodSchema';
import { BankDetails as BankDetailsType, User as UserType } from '@/db/schema';
import { router } from 'expo-router';

// Define the schema for bank details
const bankDetailsSchema = z.object({
	accountName: z.string().min(1, 'Account Name is required'),
	sortCode: z.string().min(1, 'Sort Code is required'),
	accountNumber: z.string().min(1, 'Account Number is required'),
	bankName: z.string().min(1, 'Bank Name is required'),
	userId: z.string().min(1, 'Select User'),
});

type BankDetailsType = z.infer<typeof bankDetailsSchema>;
type User = z.infer<typeof userSchema>;

export default function BankDetailsForm() {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<BankDetailsType>({
		resolver: zodResolver(bankDetailsSchema),
		defaultValues: {
			accountName: '',
			accountNumber: '',
			bankName: '',
			sortCode: '',
			userId: '',
		},
	});

	const onSubmit = async (data: BankDetailsType) => {
		try {
			const id = await generateId();
			const formData = { ...data, id };
			await db.insert(BankDetails).values(formData).returning();
			reset();
			router.back();
		} catch (err) {
			console.error('Error submitting data:', err);
		}
	};
	const accountNameRef = useRef<TextInput>(null);
	const sortCodeRef = useRef<TextInput>(null);
	const accountNumberRef = useRef<TextInput>(null);
	const bankNameRef = useRef<TextInput>(null);

	const [userOptions, setUserOptions] = useState<Array<{ label: string; value: string }> | []>([]);

	const fetchAllUsers = async () => {
		const usersData = await db.select().from(UserType);

		const options = usersData.map((user) => ({
			label: user.fullName || 'Unknown Name', // Use fullName or a default label
			value: user.id, // Use user ID as the value
		}));

		setUserOptions(options);
	};

	useEffect(() => {
		fetchAllUsers();
	}, []);

	return (
		<View className='flex-1 p-4 px-8 gap-4 bg-primaryLight'>
			<Text className='text-lg font-bold text-textLight'>Bank Details</Text>
			<Controller
				control={control}
				name='userId'
				render={({ field: { onChange, onBlur, value } }) => (
					<PickerWithTouchableOpacity
						initialValue={'Add User'}
						onValueChange={onChange}
						items={userOptions} // Pass the fetched bank options
					/>
				)}
			/>
			<Controller
				control={control}
				name='accountName'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2 '
						placeholder='Account Name'
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={accountNameRef}
						onSubmitEditing={() => {
							sortCodeRef?.current?.focus();
						}}
						returnKeyType='next'
					/>
				)}
			/>
			{errors.accountName && <Text className='text-danger text-xs'>{errors.accountName.message}</Text>}

			<Controller
				control={control}
				name='sortCode'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2'
						placeholder='Sort Code'
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={sortCodeRef}
						onSubmitEditing={() => {
							accountNumberRef?.current?.focus();
						}}
						returnKeyType='next'
					/>
				)}
			/>
			{errors.sortCode && <Text className='text-danger text-xs'>{errors.sortCode.message}</Text>}

			<Controller
				control={control}
				name='accountNumber'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2'
						placeholder='Account Number'
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={accountNumberRef}
						onSubmitEditing={() => {
							bankNameRef?.current?.focus();
						}}
						returnKeyType='next'
					/>
				)}
			/>
			{errors.accountNumber && <Text className='text-danger text-xs'>{errors.accountNumber.message}</Text>}

			<Controller
				control={control}
				name='bankName'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2'
						placeholder='Bank Name'
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={bankNameRef}
						returnKeyType='done'
					/>
				)}
			/>
			{errors.bankName && <Text className='text-danger text-xs'>{errors.bankName.message}</Text>}

			<TouchableOpacity onPress={handleSubmit(onSubmit)} className='p-2 border max-w-fit border-textLight rounded-md'>
				<Text className='text-textLight text-center text-md'>Submit</Text>
			</TouchableOpacity>
		</View>
	);
}
