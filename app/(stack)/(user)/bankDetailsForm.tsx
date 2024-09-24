import { db } from '@/db/config';
import { BankDetails } from '@/db/schema';
import React, { useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';

// Define the schema for bank details
const bankDetailsSchema = z.object({
	accountName: z.string().min(1, 'Account Name is required'),
	sortCode: z.string().min(1, 'Sort Code is required'),
	accountNumber: z.string().min(1, 'Account Number is required'),
	bankName: z.string().min(1, 'Bank Name is required'),
});

type BankDetailsType = z.infer<typeof bankDetailsSchema>;

export default function BankDetailsForm() {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<BankDetailsType>({
		resolver: zodResolver(bankDetailsSchema),
	});

	const onSubmit = async (data: BankDetailsType) => {
		// const completeData = {
		//   id: generateId(),
		//   ...data
		// };

		// try {
		//   await db.insert(BankDetails).values(completeData).returning();
		//   reset();
		// } catch (err) {
		//   console.error('Error submitting data:', err);
		// }
		console.log(data);
	};
	const accountNameRef = useRef<TextInput>(null);
	const sortCodeRef = useRef<TextInput>(null);
	const accountNumberRef = useRef<TextInput>(null);
	const bankNameRef = useRef<TextInput>(null);

	return (
		<View className='flex-1 p-4 px-8 bg-primaryLight'>
			<Text className='text-lg font-bold text-textLight'>Bank Details</Text>
			<Controller
				control={control}
				name='accountName'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-mutedForeground p-2 my-2'
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
						className='border rounded-md border-mutedForeground p-2 my-2'
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
						className='border rounded-md border-mutedForeground p-2 my-2'
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
						className='border rounded-md border-mutedForeground p-2 my-2'
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

			<TouchableOpacity onPress={handleSubmit(onSubmit)} className='p-1 border max-w-fit border-textLight rounded-sm'>
				<Text className='text-textLight text-center text-lg'>Submit</Text>
			</TouchableOpacity>
		</View>
	);
}
