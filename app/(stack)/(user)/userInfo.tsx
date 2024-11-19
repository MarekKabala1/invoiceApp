import UsersCard from '@/components/Card';
import { db } from '@/db/config';
import { bankDetailsSchema, userSchema } from '@/db/zodSchema';
import { Ionicons } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';

import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BankDetails, User } from '@/db/schema';
import { z } from 'zod';
import BaseCard from '@/components/BaseCard';
import { colors } from '@/utils/theme';

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
		<View className='flex-1 container bg-primaryLight  gap-4 p-4'>
			<BaseCard>
				<TouchableOpacity onPress={() => router.push('/(stack)/(user)/userInfoForm')} className='flex-row items-center gap-2 w-full'>
					<Ionicons name='add-circle-outline' size={36} color={colors.textLight} />
					<Text className='text-xs font-bold text-textLight'>Your's / Company & Contact Details</Text>
				</TouchableOpacity>
			</BaseCard>
			<BaseCard>
				<TouchableOpacity onPress={() => router.push('/(stack)/(user)/bankDetailsForm')} className='flex-row items-center gap-2 w-full'>
					<Ionicons name='add-circle-outline' size={36} color={colors.textLight} />
					<Text className='text-xs font-bold text-textLight'>Bank Details</Text>
				</TouchableOpacity>
			</BaseCard>
			<View className='mt-4 gap-4'>
				<UsersCard users={users} bankDetails={bankDetails} />
			</View>
			<View className='flex-row justify-between'>
				<Text className='text-xs text-textLight text-center'>*You can add multiple Users</Text>
				<Text className='text-xs text-textLight text-center'>*Long Press to Delete</Text>
			</View>
		</View>
	);
}
