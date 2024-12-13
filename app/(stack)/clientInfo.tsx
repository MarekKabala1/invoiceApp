import { db } from '@/db/config';
import { Customer } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal, ScrollView, ScrollViewBase } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';
import Card from '@/components/Card';
import BaseCard from '@/components/BaseCard';
import { colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { eq, is } from 'drizzle-orm';

const customerSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	address: z.string().min(1, 'Address is required'),
	emailAddress: z.string().email('Invalid email address'),
	phoneNumber: z.string().min(1, 'Phone Number is required'),
});

type CustomerType = z.infer<typeof customerSchema>;
type Customer = z.infer<typeof customerSchema>;

export default function CustomerForm() {
	const params = useLocalSearchParams();
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [isUpdateMode, setIsUpdateMode] = useState(params?.mode === 'update');

	const {
		control,
		handleSubmit,
		reset,
		setValue,
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
			if (isUpdateMode) {
				await db
					.update(Customer)
					.set({
						name: data.name,
						address: data.address,
						emailAddress: data.emailAddress,
						phoneNumber: data.phoneNumber,
					})
					.where(eq(Customer.id, params.customerId as string));
			} else {
				const id = await generateId();
				if (!id) {
					throw new Error('Failed to generate ID');
				}
				const formData = { ...data, id };
				await db.insert(Customer).values(formData).returning();
			}
			reset();
			setModalVisible(false);
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

	const resetFormAndCloseModal = () => {
		// setIsUpdateMode(false);
		reset({
			name: '',
			address: '',
			emailAddress: '',
			phoneNumber: '',
		});
		setModalVisible(false);
	};

	useEffect(() => {
		if (isUpdateMode) {
			setModalVisible(true);

			setValue('name', params.customerName as string);
			setValue('address', params.address as string);
			setValue('emailAddress', params.email as string);
			setValue('phoneNumber', params.phoneNumber as string);
		} else {
			reset();
		}
	}, [isUpdateMode]);

	return (
		<View className='flex-1 gap-4 p-4 bg-primaryLight'>
			<Card customers={customers} />

			<Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
				<View className='flex-1 justify-center items-center bg-textLight/30'>
					<View className='bg-primaryLight w-[90%] rounded-lg p-6 max-h-[90%]'>
						<View className='flex-row w-full items-center mb-4'>
							<Text className='text-lg font-bold m-auto text-textLight'>{isUpdateMode ? 'Update Customer' : 'Add Customer'}</Text>
							<TouchableOpacity onPress={() => setModalVisible(false)}>
								<Text className='text-textLight text-right text-lg'>✕</Text>
							</TouchableOpacity>
						</View>

						<ScrollView className='gap-4'>
							<View>
								<Text className='text-textLight text-sm'>Company Name</Text>
								<Controller
									control={control}
									name='name'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
							</View>
							<View>
								<Text className='text-textLight text-sm'>Address</Text>
								<Controller
									control={control}
									name='address'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
							</View>
							<View>
								<Text className='text-textLight text-sm'>Email</Text>
								<Controller
									control={control}
									name='emailAddress'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
							</View>
							<View>
								<Text className='text-textLight text-sm'>Phone Number</Text>
								<Controller
									control={control}
									name='phoneNumber'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
							</View>
							<TouchableOpacity onPress={handleSubmit(onSubmit)} className='border border-textLight py-2 rounded-md mt-5'>
								<Text className='text-textLight text-center text-lg'>{isUpdateMode ? 'Update' : 'Add'} Customer</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>
			<View className='flex-row justify-between'>
				<Text className='text-xs text-textLight text-center'>*You can add multiple Users</Text>
				<Text className='text-xs text-textLight text-center'>*Long Press to Delete</Text>
			</View>

			<BaseCard className='absolute bottom-5 right-4 justify-center items-center'>
				<TouchableOpacity onPress={() => setModalVisible(true)} className='flex-row items-center gap-2 bg-primary px-4 rounded-md'>
					<Ionicons name='add-circle-outline' size={36} color={colors.textLight} />
					<Text className='text-textLight font-semibold'>Add New Customer</Text>
				</TouchableOpacity>
			</BaseCard>
		</View>
	);
}
