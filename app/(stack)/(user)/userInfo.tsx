import UsersCard from '@/components/Card';
import { db } from '@/db/config';
import { bankDetailsSchema, userSchema } from '@/db/zodSchema';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { router } from 'expo-router';

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BankDetails as BankDetailsType, User as UserType } from '@/db/schema';
import { z } from 'zod';

type User = z.infer<typeof userSchema>;
type BankDetails = z.infer<typeof bankDetailsSchema>;

export default function UserInfo() {
	const [users, setUsers] = useState<User[]>([]);
	const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);

	//ToDo: Update User and bank details to refetch data when gata added
	const fetchAllUsers = async () => {
		const usersData = await db.select().from(UserType);
		const bankDetailsData = await db.select().from(BankDetailsType);

		setUsers(usersData as User[]);
		setBankDetails(bankDetailsData as BankDetails[]);
	};

	useEffect(() => {
		fetchAllUsers();
	}, []);

	return (
		<View className='flex-1 container bg-primaryLight gap-4 p-4'>
			<TouchableOpacity onPress={() => router.push('/(stack)/(user)/userInfoForm')} className='flex items-start justify-start'>
				<View className='flex-row items-center gap-2'>
					<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
						<MaterialCommunityIcons name='pencil-outline' size={56} color='#016D6D' />
					</View>
					<Text className='text-sm font-bold text-textLight'>Your's / Company & Contact Details</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => router.push('/(stack)/(user)/bankDetailsForm')} className='items-start justify-start'>
				<View className='flex-row items-center gap-2'>
					<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
						<MaterialCommunityIcons name='pencil-outline' size={56} color='#016D6D' />
					</View>
					<Text className='text-sm font-bold text-textLight'>Bank Details</Text>
				</View>
			</TouchableOpacity>
			<View className='mt-4'>
				<UsersCard users={users} bankDetails={bankDetails} />
			</View>
			<Text className='text-xs text-mutedForeground text-center'>*You can add multiple Users</Text>
		</View>
	);
}
