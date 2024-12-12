import { db } from '@/db/config';
import { User } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { userSchema, UserType } from '@/db/zodSchema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';
import { router } from 'expo-router';
import { eq, is } from 'drizzle-orm';
import { UserToUpdate } from '@/types';

type User = z.infer<typeof userSchema>;

interface UserInfoFormProps {
	onSuccess?: () => void;
	dataToUpdate?: UserToUpdate;
	update?: boolean;
}

export default function UserInfoForm({ onSuccess, dataToUpdate, update }: UserInfoFormProps) {
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
		watch,
	} = useForm<User>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			id: dataToUpdate?.id || '',
			fullName: dataToUpdate?.fullName || '',
			address: dataToUpdate?.address || '',
			emailAddress: dataToUpdate?.emailAddress || '',
			phoneNumber: dataToUpdate?.phoneNumber || '',
			utrNumber: dataToUpdate?.utrNumber || '',
			ninNumber: dataToUpdate?.ninNumber || '',
		},
	});

	const onSubmit = async (data: UserType) => {
		try {
			if (update && dataToUpdate) {
				const result = await db
					.update(User)
					.set({
						fullName: data.fullName,
						address: data.address,
						emailAddress: data.emailAddress,
						phoneNumber: data.phoneNumber,
						utrNumber: data.utrNumber,
						ninNumber: data.ninNumber,
						createdAt: data.createdAt,
					})
					.where(eq(User.id, dataToUpdate.id));

				if (result) {
					reset();
					onSuccess?.();
				} else {
					throw new Error('No rows were updated. Please check the user ID.');
				}
			} else {
				const id = await generateId();
				const formData = { ...data, id };
				const result = await db.insert(User).values(formData).returning();

				if (result) {
					reset();
					onSuccess?.();
				} else {
					throw new Error('Failed to insert new record.');
				}
			}
		} catch (err) {
			let errorMessage = 'An unexpected error occurred';

			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (typeof err === 'string') {
				errorMessage = err;
			}
			alert(errorMessage);
		}
	};

	const fullNameRef = useRef<TextInput>(null);
	const addressRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const phoneRef = useRef<TextInput>(null);
	const utrRef = useRef<TextInput>(null);
	const ninRef = useRef<TextInput>(null);

	useEffect(() => {
		if (dataToUpdate && update) {
			setValue('id', dataToUpdate.id);
			setValue('fullName', dataToUpdate.fullName);
			setValue('address', dataToUpdate.address);
			setValue('emailAddress', dataToUpdate.emailAddress);
			setValue('phoneNumber', dataToUpdate.phoneNumber);
			setValue('utrNumber', dataToUpdate.utrNumber);
			setValue('ninNumber', dataToUpdate.ninNumber);
		}
	}, [dataToUpdate, update]);

	// ToDo:Add validation from zod schema
	return (
		<View className='  p-4 px-8 bg-primaryLight'>
			<View>
				<Text className='text-xs font-bold text-textLight'>Full Name</Text>
				<Controller
					control={control}
					rules={{
						required: true,
					}}
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			</View>
			<View>
				<Text className='text-xs font-bold text-textLight'>Address</Text>
				<Controller
					control={control}
					rules={{
						required: true,
					}}
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			</View>
			<View>
				<Text className='text-xs font-bold text-textLight'>Email Address</Text>
				<Controller
					control={control}
					rules={{
						required: true,
						pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
					}}
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			</View>
			<View>
				<Text className='text-xs font-bold text-textLight'>Phone Number</Text>
				<Controller
					control={control}
					rules={{
						required: true,
					}}
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			</View>
			<View>
				<Text className='text-xs font-bold text-textLight'>UTR Number</Text>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
				{errors.utrNumber && <Text className='text-danger text-xs'>UTR Number is required.</Text>}
			</View>
			<View>
				<Text className='text-xs font-bold text-textLight'>NIN Number</Text>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
						<TextInput
							className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2 mb-5'}
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
				{errors.ninNumber && <Text className='text-danger text-xs '>NIN Number is required.</Text>}
			</View>
			<TouchableOpacity onPress={handleSubmit(onSubmit)} className='p-2 border max-w-fit border-textLight rounded-md '>
				<Text className='text-textLight text-center text-md'>{update ? 'Update' : 'Submit'}</Text>
			</TouchableOpacity>
		</View>
	);
}
