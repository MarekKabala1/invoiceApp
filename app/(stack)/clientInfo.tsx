import { db } from '@/db/config';
import { Customer } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';
import Card from '@/components/Card';

// Define the schema for customer details
const customerSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	address: z.string().min(1, 'Address is required'),
	emailAddress: z.string().email('Invalid email address'),
	phoneNumber: z.string().min(1, 'Phone Number is required'),
});

type CustomerType = z.infer<typeof customerSchema>;
type Customer = z.infer<typeof customerSchema>;

export default function CustomerForm() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CustomerType>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			name: '',
			address: '',
			emailAddress: '',
			phoneNumber: '',
		},
	});

	const onSubmit = async (data: CustomerType) => {
		try {
			const id = await generateId();
			if (!id) {
				throw new Error('Failed to generate ID');
			}
			const formData = { ...data, id };
			await db.insert(Customer).values(formData).returning();
			reset();
			fetchCustomers();
		} catch (err) {
			console.error('Error submitting data:', err);
		}
	};

	const nameRef = useRef<TextInput>(null);
	const addressRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const phoneRef = useRef<TextInput>(null);

	const fetchCustomers = async () => {
		try {
			const customersData = await db.select().from(Customer);
			setCustomers(customersData as Customer[]);
		} catch (e) {
			throw new Error(`There is problem to fetch customers ${e}`);
		}
	};
	useEffect(() => {
		fetchCustomers();
	}, [Customer]);

	return (
		<View className='flex-1 p-4 px-8 gap-4 bg-primaryLight'>
			<Text className='text-lg font-bold text-textLight'>Customer Information</Text>
			<Controller
				control={control}
				name='name'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2'
						placeholder='Name'
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={nameRef}
						returnKeyType='next'
					/>
				)}
			/>
			{errors.name && <Text className='text-danger text-xs'>{errors.name.message}</Text>}

			<Controller
				control={control}
				name='address'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2'
						placeholder='Address'
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={addressRef}
						returnKeyType='next'
					/>
				)}
			/>
			{errors.address && <Text className='text-danger text-xs'>{errors.address.message}</Text>}

			<Controller
				control={control}
				name='emailAddress'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2'
						placeholder='Email Address'
						value={value}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={emailRef}
						returnKeyType='next'
					/>
				)}
			/>
			{errors.emailAddress && <Text className='text-danger text-xs'>{errors.emailAddress.message}</Text>}

			<Controller
				control={control}
				name='phoneNumber'
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-textLight p-2'
						placeholder='Phone Number'
						value={value}
						keyboardType='phone-pad'
						onChangeText={onChange}
						onBlur={onBlur}
						ref={phoneRef}
						returnKeyType='done'
					/>
				)}
			/>
			{errors.phoneNumber && <Text className='text-danger text-xs'>{errors.phoneNumber.message}</Text>}

			<TouchableOpacity onPress={handleSubmit(onSubmit)} className='p-1 border max-w-fit border-textLight rounded-sm'>
				<Text className='text-textLight text-center text-lg'>Submit</Text>
			</TouchableOpacity>
			<View>
				<Card customers={customers} />
			</View>
		</View>
	);
}
