import { db } from '@/db/config';
import { BankDetails, User } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';
import PickerWithTouchableOpacity from '@/components/Picker';
import { userSchema } from '@/db/zodSchema';
import { BankDetails as BankDetailsType, User as UserType } from '@/db/schema';
import { useLocalSearchParams } from 'expo-router';
import { set } from 'date-fns';
import { eq } from 'drizzle-orm';
import { BankDetailsToUpdate, BankDetailsUpdateParams } from '@/types';

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

interface BankDetailsFormProps {
	onSuccess?: () => void;
	dataToUpdate?: BankDetailsToUpdate;
	update?: boolean | null;
}

export default function BankDetailsForm({ onSuccess, dataToUpdate, update }: BankDetailsFormProps) {
	const {
		control,
		handleSubmit,
		reset,
		setValue,
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

	const [userOptions, setUserOptions] = useState<Array<{ label: string; value: string }> | []>([]);

	const onSubmit = async (data: BankDetailsType) => {
		try {
			if (update && dataToUpdate) {
				await db
					.update(BankDetails)
					.set({
						bankName: data.bankName,
						accountNumber: data.accountNumber,
						sortCode: data.sortCode,
						accountName: data.accountName,
					})
					.where(eq(BankDetails.id, dataToUpdate.id));
			} else {
				const id = await generateId();
				const formData = { ...data, id };
				await db.insert(BankDetails).values(formData).returning();
			}

			reset();
			onSuccess?.();
		} catch (err) {
			let errorMessage = 'An unexpected error occurred';

			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (typeof err === 'string') {
				errorMessage = err;
			}

			alert(errorMessage);
			console.error('Error submitting data:', err);
		}
	};
	const accountNameRef = useRef<TextInput>(null);
	const sortCodeRef = useRef<TextInput>(null);
	const accountNumberRef = useRef<TextInput>(null);
	const bankNameRef = useRef<TextInput>(null);

	const fetchAllUsers = async () => {
		if (update) {
			const fetchUser = await db
				.select()
				.from(User)
				.where(eq(User.id, dataToUpdate?.userId as string));

			const options = fetchUser.map((user) => ({
				label: user.fullName || 'Unnamed User',
				value: user.id,
			}));
			setUserOptions(options);
		} else {
			const usersData = await db.select().from(UserType);

			const options = usersData.map((user) => ({
				label: user.fullName || 'Unknown Name',
				value: user.id,
			}));

			setUserOptions(options);
		}
	};

	useEffect(() => {
		fetchAllUsers();
	}, []);

	useEffect(() => {
		if (dataToUpdate && update) {
			setValue('userId', dataToUpdate.userId as string);
			setValue('accountName', dataToUpdate.accountName as string);
			setValue('sortCode', dataToUpdate.sortCode as string);
			setValue('accountNumber', dataToUpdate.accountNumber as string);
			setValue('bankName', dataToUpdate.bankName as string);
		} else {
			reset();
		}
	}, [update, dataToUpdate]);

	return (
		<ScrollView>
			{update ? (
				<View className='gap-1 my-2'>
					<Text className='text-textLight font-bold text-xs'>Name </Text>
					<Text className='text-textLight opacity-80 font-bold text-lg '>{userOptions.map((user) => user.label).join(', ')}</Text>
				</View>
			) : (
				<View className='gap-1 my-2'>
					<Text className='text-textLight font-bold text-xs mb-2'>Name </Text>
					<Controller
						control={control}
						name='userId'
						render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
							<PickerWithTouchableOpacity initialValue={'Add User'} onValueChange={onChange} items={userOptions} />
						)}
					/>
				</View>
			)}
			<View className='gap-1'>
				<Text className='text-textLight font-bold text-xs'>Account Name </Text>
				<Controller
					control={control}
					name='accountName'
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			</View>
			<View className='gap-1'>
				<Text className='text-textLight font-bold text-xs'>Sort Code </Text>
				<Controller
					control={control}
					name='sortCode'
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			</View>
			<View className='gap-1'>
				<Text className='text-textLight font-bold text-xs'>Account Number </Text>
				<Controller
					control={control}
					name='accountNumber'
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			</View>
			<View className='gap-1'>
				<Text className='text-textLight font-bold text-xs'>Bank Name </Text>
				<Controller
					control={control}
					name='bankName'
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2 ' : 'border rounded-md border-textLight p-2 my-2 '}
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
			</View>
			<TouchableOpacity onPress={handleSubmit(onSubmit)} className='p-2 mt-5 border max-w-fit border-textLight rounded-md'>
				<Text className='text-textLight text-center text-md'>{update ? 'Update' : 'Submit'}</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}
