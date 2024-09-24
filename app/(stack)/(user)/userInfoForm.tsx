import { db } from '@/db/config';
import { User } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
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
			id: '',
			fullName: '',
			address: '',
			emailAddress: '',
			phoneNumber: '',
			utrNumber: '',
			ninNumber: '',
		},
	});

	const onSubmit = async (data: User) => {
		try {
			const id = await generateId();
			const formData = { ...data, id };
			await db.insert(User).values(formData).returning();
			// console.log('Inserted user data:', userData);
			reset();
		} catch (err) {
			console.error('Error submitting data:', err);
		}
	};

	const fullNameRef = useRef<TextInput>(null);
	const addressRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const phoneRef = useRef<TextInput>(null);
	const utrRef = useRef<TextInput>(null);
	const ninRef = useRef<TextInput>(null);

	useEffect(() => {
		const id = generateId();
		// console.log(id);
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
						ref={fullNameRef}
						onSubmitEditing={() => {
							addressRef?.current?.focus();
						}}
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
						onSubmitEditing={() => {
							emailRef?.current?.focus();
						}}
						ref={addressRef}
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
						onSubmitEditing={() => {
							phoneRef?.current?.focus();
						}}
						ref={emailRef}
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
						onSubmitEditing={() => {
							utrRef?.current?.focus();
						}}
						keyboardType='numeric'
						ref={phoneRef}
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
						onSubmitEditing={() => {
							ninRef?.current?.focus();
						}}
						ref={utrRef}
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
						ref={ninRef}
						returnKeyType='done'
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
