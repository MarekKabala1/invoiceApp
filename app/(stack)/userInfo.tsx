import { db } from '@/db/config';
import { User } from '@/db/schema';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, Button, TouchableOpacity } from 'react-native';
import { asc, desc } from 'drizzle-orm';
import { useForm, Controller } from 'react-hook-form';

type User = typeof User.$inferInsert;

export default function UserInfo() {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<User>({
		defaultValues: {
			fullName: '',
			address: '',
			emailAddress: '',
			phoneNumber: '',
			utrNumber: '',
			ninNumber: '',
		},
	});

	const onSubmit = (data: User) => {
		try {
			return db.insert(User).values(data);
		} catch (err) {
			console.error(err);
		} finally {
			reset();
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

	return (
		<View className=' flex-1 p-4 px-8 bg-primaryLight'>
			<View className='min-w-full justify-start items-center'>
				<Text className='text-lg font-bold text-textLight'>Add Yours Info</Text>
			</View>
			<Controller
				control={control}
				rules={{
					required: true,
				}}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-mutedForeground p-2 my-2'
						placeholder='Full Name'
						value={value as string}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={myRef}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='fullName'
			/>
			{errors.fullName && <Text className='text-danger text-xs'>This is required.</Text>}
			<Controller
				control={control}
				rules={{
					required: true,
				}}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-mutedForeground p-2 my-2'
						placeholder='Address'
						value={value as string}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={myRef}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='address'
			/>
			{errors.address && <Text className='text-danger text-xs'>This is required.</Text>}
			<Controller
				control={control}
				rules={{
					required: true,
					pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
				}}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-mutedForeground p-2 my-2'
						placeholder='Email Address'
						value={value as string}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={myRef}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='emailAddress'
			/>
			{errors.emailAddress && <Text className='text-danger text-xs'>This is required or invalid add example:'yourlogin@provider.com'.</Text>}
			<Controller
				control={control}
				rules={{
					required: true,
				}}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-mutedForeground p-2 my-2'
						placeholder='Phone Number'
						value={value as string}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={myRef}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='phoneNumber'
			/>
			{errors.phoneNumber && <Text className='text-danger text-xs'>This is required.</Text>}
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-mutedForeground p-2 my-2'
						placeholder='UTR Number '
						value={value as string}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={myRef}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='utrNumber'
			/>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className='border rounded-md border-mutedForeground p-2 my-2'
						placeholder='NIN Number'
						value={value as string}
						onChangeText={onChange}
						onBlur={onBlur}
						ref={myRef}
						onSubmitEditing={focusInput}
						returnKeyType='next'
					/>
				)}
				name='ninNumber'
			/>
			<TouchableOpacity onPress={handleSubmit(onSubmit)} className='p-1 border max-w-fit border-textLight rounded-sm '>
				<Text className='text-textLight text-center text-lg'>Submit</Text>
			</TouchableOpacity>
			<View></View>
		</View>
	);
}
