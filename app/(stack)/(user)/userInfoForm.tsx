import { db } from '@/db/config';
import { User } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { userSchema } from '@/db/zodSchema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateId } from '@/utils/generateUuid';
import { router } from 'expo-router';
import { eq, is } from 'drizzle-orm';

// type User = typeof User.$inferInsert;
type User = z.infer<typeof userSchema>;

interface UserToUpdate extends User {
	id: string;
	fullName: string;
	address: string;
	emailAddress: string;
	phoneNumber?: string | undefined | null;
	utrNumber?: string | undefined | null;
	ninNumber?: string | undefined | null;
	createdAt?: string | undefined | null;
}
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
			id: '',
			fullName: '',
			address: '',
			emailAddress: '',
			phoneNumber: '',
			utrNumber: '',
			ninNumber: '',
		},
	});

	//ToDo: Check that!!!!!!!
	const onSubmit = async (data: User) => {
		try {
			const id = await generateId();
			const formData = { ...data, id };
			if (update) {
				const updateUser = {
					...data,
					fullName: data.fullName,
					address: data.address,
					emailAddress: data.emailAddress,
					phoneNumber: data.phoneNumber,
					utrNumber: data.utrNumber,
					ninNumber: data.ninNumber,
				};
				console.log(updateUser);
				await db
					.update(User)
					.set(updateUser)
					.where(eq(User.id, dataToUpdate?.id as string));
			} else {
				await db.insert(User).values(formData).returning();
			}

			reset();
			onSuccess?.();
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
		if (dataToUpdate && update) {
			setValue('id', dataToUpdate?.id);
			setValue('fullName', dataToUpdate?.fullName);
			setValue('address', dataToUpdate?.address);
			setValue('emailAddress', dataToUpdate?.emailAddress);
			setValue('phoneNumber', dataToUpdate?.phoneNumber);
			setValue('utrNumber', dataToUpdate?.utrNumber);
			setValue('ninNumber', dataToUpdate?.ninNumber);
		}
	}, []);

	// ToDo:Add validation from zod schema
	return (
		<View className='  p-4 px-8 bg-primaryLight'>
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
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
					<TextInput
						className={error ? 'border rounded-md border-danger p-2 my-2' : 'border rounded-md border-textLight p-2 my-2'}
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
			<TouchableOpacity onPress={handleSubmit(onSubmit)} className='p-2 border max-w-fit border-textLight rounded-md '>
				<Text className='text-textLight text-center text-md'>Submit</Text>
			</TouchableOpacity>
		</View>
	);
}
