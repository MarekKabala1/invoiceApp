import UsersCard from '@/components/Card';
import { db } from '@/db/config';
import { bankDetailsSchema, userSchema } from '@/db/zodSchema';
import { EvilIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';

import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BankDetails, User } from '@/db/schema';
import { z } from 'zod';

type User = z.infer<typeof userSchema>;
type BankDetails = z.infer<typeof bankDetailsSchema>;

export default function UserInfo() {
	const [users, setUsers] = useState<User[]>([]);
	const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);

	const fetchAllUsers = async () => {
		const usersData = await db.select().from(User);
		const bankDetailsData = await db.select().from(BankDetails);

		setUsers(usersData as User[]);
		setBankDetails(bankDetailsData as BankDetails[]);
	};
	useFocusEffect(
		useCallback(() => {
			fetchAllUsers();
		}, [User, BankDetails])
	);

	// useEffect(() => {
	// 	fetchAllUsers();
	// }, [User, BankDetails]);

	return (
		<View className='flex-1 container bg-primaryLight gap-4 p-4'>
			<TouchableOpacity onPress={() => router.push('/(stack)/(user)/userInfoForm')} className='flex items-start justify-start'>
				<View className='flex-row items-center gap-2'>
					<View className='bg-textLight  rounded-lg shadow p-1 py-2'>
						<EvilIcons name='pencil' size={36} color='#f1fcfa' />
					</View>
					<Text className='text-xs font-bold text-textLight'>Your's / Company & Contact Details</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => router.push('/(stack)/(user)/bankDetailsForm')} className='items-start justify-start'>
				<View className='flex-row items-center gap-2'>
					<View className='bg-textLight  rounded-lg shadow p-1 py-2'>
						<EvilIcons name='pencil' size={36} color='#f1fcfa' />
					</View>
					<Text className='text-xs font-bold text-textLight'>Bank Details</Text>
				</View>
			</TouchableOpacity>
			<View className='mt-4'>
				<UsersCard users={users} bankDetails={bankDetails} />
			</View>
			<Text className='text-xs text-textLight text-center'>*You can add multiple Users</Text>
		</View>
	);
}
