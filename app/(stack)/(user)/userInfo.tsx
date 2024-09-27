import UsersCard from '@/components/usersCard';
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

	const fetchAllUsers = async () => {
		const usersData = await db.select().from(UserType);
		const bankDetailsData = await db.select().from(BankDetailsType); // Ensure correct table

		setUsers(usersData as User[]);
		setBankDetails(bankDetailsData as BankDetails[]);
	};

	useEffect(() => {
		fetchAllUsers();
	}, []);

	return (
		<View className='flex-1 container bg-primaryLight gap-4 p-8'>
			<TouchableOpacity onPress={() => router.push('/(stack)/(user)/userInfoForm')} className='flex items-start justify-start'>
				<View className='flex-row items-center gap-2'>
					<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
						<MaterialCommunityIcons name='pencil-outline' size={24} color='#0d47a1' />
					</View>
					<Text className='text-sm font-bold text-textLight'>Your's / Company & Contact Details</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => router.push('/(stack)/(user)/bankDetailsForm')} className='items-start justify-start'>
				<View className='flex-row items-center gap-2'>
					<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
						<MaterialCommunityIcons name='pencil-outline' size={24} color='#0d47a1' />
					</View>
					<Text className='text-sm font-bold text-textLight'>Bank Details</Text>
				</View>
			</TouchableOpacity>
			<View className='mt-4'>
				<UsersCard users={users} bankDetails={bankDetails} />
			</View>
		</View>
	);
}
