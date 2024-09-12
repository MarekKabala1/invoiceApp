import { db } from '@/db/config';
import { User } from '@/db/schema';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, Button, TouchableOpacity } from 'react-native';
import * as schema from '../../db/schema';
import { SQLiteDatabase } from 'expo-sqlite';
import { asc, desc } from 'drizzle-orm';

type User = typeof User.$inferInsert;

export default function UserInfo() {
	const [users, setUsers] = useState<User[]>([]);
	const [formData, setFormData] = useState<User>({
		fullName: '',
		address: '',
		emailAddress: '',
		phoneNumber: '',
		utrNumber: '',
		ninNumber: '',
	});

	const myRef = useRef<TextInput>(null);
	const focusInput = () => {
		myRef.current?.focus();
	};

	const handleInputChange = (field: string, value: string) => {
		if (field.valueOf === null || field.valueOf === undefined || field === '') return;
		setFormData((prevFormData) => ({
			...prevFormData,
			[field]: value,
		}));
	};
	const insertUserInfo = async (user: User) => {
		return db.insert(User).values(user);
	};

	const handleSubmit = () => {
		try {
			const newUser: User = { ...formData };
			insertUserInfo(newUser);
		} catch (error) {
			console.error(error);
		} finally {
			setFormData({ fullName: '', address: '', emailAddress: '', phoneNumber: '', utrNumber: '', ninNumber: '' });
		}
	};

	const getLastAddedUser = async () => {
		const user1 = await db.select().from(User).orderBy(asc(User.createdAt));
		// console.log(user1);
	};
	useEffect(() => {
		getLastAddedUser();
	}, []);

	return (
		<View className=' flex-1 p-4 px-8 bg-primaryLight'>
			<View className='min-w-full justify-start items-center'>
				<Text className='text-lg font-bold text-textLight'>Add Yours Info</Text>
			</View>
			<TextInput
				className='border rounded-md border-mutedForeground p-2 my-2'
				placeholder='Full Name'
				value={formData.fullName as string}
				onChangeText={(text) => handleInputChange('fullName', text)}
				ref={myRef}
				onSubmitEditing={focusInput}
				returnKeyType='next'
			/>
			<TextInput
				className='border rounded-md border-mutedForeground  p-2 my-2'
				placeholder='Address'
				value={formData.address as string}
				onChangeText={(text) => handleInputChange('address', text)}
				ref={myRef}
				onSubmitEditing={focusInput}
				returnKeyType='next'
			/>
			<TextInput
				className='border rounded-md border-mutedForeground p-2 my-2'
				placeholder='Email Address'
				value={formData.emailAddress as string}
				onChangeText={(text) => handleInputChange('emailAddress', text)}
				keyboardType='email-address'
				ref={myRef}
				onSubmitEditing={focusInput}
				returnKeyType='next'
			/>
			<TextInput
				className='border rounded-md border-mutedForeground p-2 my-2'
				placeholder='Phone Number'
				value={formData.phoneNumber as string}
				onChangeText={(text) => handleInputChange('phoneNumber', text)}
				keyboardType='phone-pad'
				ref={myRef}
				onSubmitEditing={focusInput}
				returnKeyType='next'
			/>
			<TextInput
				className='border rounded-md border-mutedForeground p-2 my-2'
				placeholder='UTR Number '
				value={formData.utrNumber as string}
				onChangeText={(text) => handleInputChange('utrNumber', text)}
				ref={myRef}
				onSubmitEditing={focusInput}
				returnKeyType='next'
			/>
			<TextInput
				className='border rounded-md border-mutedForeground p-2 my-2'
				placeholder='NIN Number '
				value={formData.ninNumber as string}
				onChangeText={(text) => handleInputChange('ninNumber', text)}
				ref={myRef}
				onSubmitEditing={focusInput}
				returnKeyType='done'
			/>
			<TouchableOpacity onPress={handleSubmit} className='p-1 border max-w-fit border-textLight rounded-sm '>
				<Text className='text-textLight text-center text-lg'>Submit</Text>
			</TouchableOpacity>
			<View></View>
		</View>
	);
}
