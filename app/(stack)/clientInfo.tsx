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
import { color } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { eq, is } from 'drizzle-orm';
import { useTheme } from '@/context/ThemeContext';

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

	const { colors } = useTheme();

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
			getCustomers();
		} catch (err) {
			console.error('Error submitting data:', err);
		}
	};

	const nameRef = useRef<TextInput>(null);
	const addressRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const phoneRef = useRef<TextInput>(null);

	const getCustomers = async () => {
		try {
			const customersData = await db.select().from(Customer);
			setCustomers(customersData as Customer[]);
		} catch (e) {
			throw new Error(`There is problem to get customers ${e}`);
		}
	};
	useEffect(() => {
		getCustomers();
	}, [Customer]);

	const resetFormAndCloseModal = () => {
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
		<View className='flex-1 gap-4 p-4 bg-light-primary dark:bg-dark-primary'>
			<Card customers={customers} />

			<Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
				<View className='flex-1 justify-center items-center bg-light-text/30 dark:bg-dark-text/30'>
					<View className='bg-light-primary dark:bg-dark-primary w-[90%] rounded-lg p-6 max-h-[90%]'>
						<View className='flex-row w-full items-center mb-4'>
							<Text className='text-lg font-bold m-auto text-light-text dark:text-dark-text'>{isUpdateMode ? 'Update Customer' : 'Add Customer'}</Text>
							<TouchableOpacity onPress={resetFormAndCloseModal}>
								<Text className='text-light-text dark:text-dark-text text-right text-lg'>✕</Text>
							</TouchableOpacity>
						</View>

						<ScrollView className='gap-4'>
							<View>
								<Text className={errors.name ? 'text-danger text-xs font-bold' : 'text-light-text dark:text-dark-text text-xs font-bold'}>Company Name</Text>
								<Controller
									control={control}
									name='name'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 mb-3' : 'border rounded-md border-light-text dark:border-dark-text p-2 mb-3'}
											placeholder={errors.name ? errors.name.message : ''}
											placeholderTextColor={errors.name ? color.danger : color.light.text}
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											ref={nameRef}
											returnKeyType='next'
										/>
									)}
								/>
							</View>
							<View>
								<Text className={errors.name ? 'text-danger text-xs font-bold' : 'text-light-text dark:text-dark-text text-xs font-bold'}>Address</Text>
								<Controller
									control={control}
									name='address'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 mb-3' : 'border rounded-md border-light-text dark:border-dark-text p-2 mb-3'}
											placeholder={errors.address ? errors.address.message : ''}
											placeholderTextColor={errors.address ? color.danger : color.light.text}
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
											ref={addressRef}
											returnKeyType='next'
										/>
									)}
								/>
							</View>
							<View>
								<Text className={errors.name ? 'text-danger text-xs font-bold' : 'text-light-text dark:text-dark-text text-xs font-bold'}>Email</Text>
								<Controller
									control={control}
									name='emailAddress'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 mb-3' : 'border rounded-md border-light-text dark:border-dark-text p-2 mb-3'}
											placeholder={errors.emailAddress ? errors.emailAddress.message : ''}
											value={value}
											placeholderTextColor={errors.emailAddress ? color.danger : color.light.text}
											onChangeText={onChange}
											onBlur={onBlur}
											ref={emailRef}
											returnKeyType='next'
										/>
									)}
								/>
							</View>
							<View>
								<Text className={errors.name ? 'text-danger text-xs font-bold' : 'text-light-text dark:text-dark-text text-xs font-bold'}>Phone Number</Text>
								<Controller
									control={control}
									name='phoneNumber'
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<TextInput
											className={error ? 'border rounded-md border-danger p-2 mb-3' : 'border rounded-md border-light-text dark:border-dark-text p-2 mb-3'}
											placeholder={errors.phoneNumber ? errors.phoneNumber.message : ''}
											placeholderTextColor={errors.phoneNumber ? color.danger : color.light.text}
											value={value}
											keyboardType='phone-pad'
											onChangeText={onChange}
											onBlur={onBlur}
											ref={phoneRef}
											returnKeyType='done'
										/>
									)}
								/>
							</View>
							<TouchableOpacity onPress={handleSubmit(onSubmit)} className='border border-light-text dark:border-dark-text py-2 rounded-md mt-3'>
								<Text className='text-light-text dark:text-dark-text text-center text-lg'>{isUpdateMode ? 'Update' : 'Add'} Customer</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</Modal>
			<View className='flex-row justify-between'>
				<Text className='text-xs text-light-text dark:text-dark-text text-center'>*You can add multiple Users</Text>
				<Text className='text-xs text-light-text dark:text-dark-text text-center'>*Long Press to Delete</Text>
			</View>

			<BaseCard className='absolute bottom-5 right-4 justify-center items-center'>
				<TouchableOpacity onPress={() => setModalVisible(true)} className='flex-row items-center gap-2 bg-primary px-4 rounded-md'>
					<Ionicons name='add-circle-outline' size={36} color={colors.text} />
					<Text className='text-light-text dark:text-dark-text font-semibold'>Add New Customer</Text>
				</TouchableOpacity>
			</BaseCard>
		</View>
	);
}
