import { db } from '@/db/config';
import { Customer } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';
import Card from '@/components/Card';
import BaseCard from '@/components/BaseCard';

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
	const [modalVisible, setModalVisible] = useState(false);
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

	return (
		<View className='flex-1 gap-4 p-4 bg-primaryLight'>
			<Card customers={customers} />

			<Modal animationType='slide' transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
				<View className='flex-1 justify-center items-center bg-textLight/30'>
					<View className='bg-primaryLight w-[90%] rounded-lg p-6 max-h-[90%]'>
						<View className='flex-row justify-between items-center mb-4'>
							<Text className='text-lg font-bold text-textLight'>Add New Customer</Text>
							<TouchableOpacity onPress={() => setModalVisible(false)}>
								<Text className='text-textLight text-lg'>✕</Text>
							</TouchableOpacity>
						</View>

						<View className='gap-4'>
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

							<TouchableOpacity onPress={handleSubmit(onSubmit)} className='border border-textLight py-2 rounded-md'>
								<Text className='text-textLight text-center text-lg'>Submit</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			<View className='absolute bottom-5 w-full left-4'>
				<BaseCard className='w-full absolute bottom-5 justify-center items-center'>
					<TouchableOpacity onPress={() => setModalVisible(true)} className='bg-primary px-4 py-2 rounded-md'>
						<Text className='text-textLight font-semibold'>Add New Customer</Text>
					</TouchableOpacity>
				</BaseCard>
			</View>
		</View>
	);
}
