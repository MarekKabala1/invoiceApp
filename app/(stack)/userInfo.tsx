import { db } from '@/db/config';
import { User } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { asc, desc } from 'drizzle-orm';
import { useForm, Controller } from 'react-hook-form';
import { userSchema } from '@/db/zodSchema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';

// type User = typeof User.$inferInsert;
type User = z.infer<typeof userSchema>;

export default function UserInfo() {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
		watch,
	} = useForm<User>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			id: 0,
			fullName: '',
			address: '',
			emailAddress: '',
			phoneNumber: '',
			utrNumber: '',
			ninNumber: '',
		},
	});

	const onSubmit = async (data: User) => {
		//ToDo:check why uuid not working
		try {
			const id = await generateId();
			const formData = { ...data, id };
			const userData = await db.insert(User).values(formData).returning();
			console.log('Inserted user data:', userData);
			reset();
		} catch (err) {
			console.error('Error submitting data:', err);
		}
	};
	const [users, setUsers] = useState<User[]>([]);

	const myRef = useRef<TextInput>(null);
	const focusInput = () => {
		return myRef.current?.focus();
	};

	const getLastAddedUser = async () => {
		const users = await db.select().from(User).orderBy(desc(User.createdAt));
		setUsers(users);
		// console.log(users);
	};
	useEffect(() => {
		getLastAddedUser();
	}, []);

	// ToDo:Add validation from zod schema
	return (
		<View className=' flex-1 p-4 px-8 bg-primaryLight'>
			<View className='min-w-full justify-start items-center'>
				<Text className='text-lg font-bold text-textLight'>Add Your&#39;s Info</Text>
			</View>
			<Controller
				control={control}
				rules={{
					required: true,
				}}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
					<TextInput
						className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-mutedForeground p-2 my-2'}
						placeholder='Full Name'
						value={value ?? ''}
						blurOnSubmit={true}
						onChangeText={onChange}
						onBlur={onBlur}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='fullName'
			/>
			{errors.fullName && <Text className='text-danger text-xs'>Full Name is required min 2 letters.</Text>}
			<Controller
				control={control}
				rules={{
					required: true,
				}}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
					<TextInput
						className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-mutedForeground p-2 my-2'}
						placeholder='Address'
						value={value ?? ''}
						onChangeText={onChange}
						onBlur={onBlur}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='address'
			/>
			{errors.address && <Text className='text-danger text-xs'>Address is required.</Text>}
			<Controller
				control={control}
				rules={{
					required: true,
					pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
				}}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
					<TextInput
						className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-mutedForeground p-2 my-2'}
						placeholder='Email Address'
						inputMode='email'
						value={value ?? ''}
						onChangeText={onChange}
						onBlur={onBlur}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='emailAddress'
			/>
			{errors.emailAddress && <Text className='text-danger text-xs'>Invalid email Address example: 0YH9k@example.com </Text>}
			<Controller
				control={control}
				rules={{
					required: true,
				}}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
					<TextInput
						className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-mutedForeground p-2 my-2'}
						placeholder='Phone Number'
						value={value ?? ''}
						onChangeText={onChange}
						onBlur={onBlur}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='phoneNumber'
			/>
			{errors.phoneNumber && <Text className='text-danger text-xs'>Phone Number is required.</Text>}
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
					<TextInput
						className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-mutedForeground p-2 my-2'}
						placeholder='UTR Number '
						value={value ?? ''}
						onChangeText={onChange}
						onBlur={onBlur}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='utrNumber'
			/>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
					<TextInput
						className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-mutedForeground p-2 my-2'}
						placeholder='NIN Number'
						value={value ?? ''}
						onChangeText={onChange}
						onBlur={onBlur}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='ninNumber'
			/>
			<TouchableOpacity
				onPress={handleSubmit(onSubmit, (errors) => console.log('Form validation failed:', errors))}
				className='p-1 border max-w-fit border-textLight rounded-sm '>
				<Text className='text-textLight text-center text-lg'>Submit</Text>
			</TouchableOpacity>
		</View>
	);
}
