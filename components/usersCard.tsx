import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { userSchema, bankDetailsSchema } from '@/db/zodSchema';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type User = z.infer<typeof userSchema>;
type BankDetails = z.infer<typeof bankDetailsSchema>;

interface UserWithBankDetails extends User {
	bankDetails?: BankDetails | null;
}

export default function UsersCard({ users, bankDetails }: { users: User[]; bankDetails: BankDetails[] }) {
	const [usersWithBankDetails, setUsersWithBankDetails] = useState<UserWithBankDetails[]>([]);

	// Function to find the bank details for a specific user
	const getBankDetailsForUser = (userId: string) => {
		return bankDetails.find((details) => details.userId === userId) || null;
	};

	useEffect(() => {
		const mappedUsers = users.map((user) => ({
			...user,
			bankDetails: getBankDetailsForUser(user.id),
		}));
		setUsersWithBankDetails(mappedUsers);
	}, [users, bankDetails]);

	return (
		<View>
			<FlatList
				data={usersWithBankDetails}
				renderItem={({ item }) => (
					<View className='bg-navLight p-2 mb-2 rounded-lg shadow-sm flex-row justify-between items-center'>
						<Text className='text-md font-bold text-textLight'>{item.fullName}</Text>
						<View className='text-xs text-textLight'>
							{item.bankDetails ? (
								<Text className='text-xs text-textLight'>{item.bankDetails.bankName}</Text>
							) : (
								<Text className='text-xs text-danger'>Bank details not added</Text>
							)}
						</View>
						<View className='flex-row gap-2'>
							<TouchableOpacity>
								<View className='bg-navLight border-2 border-textLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
									<MaterialCommunityIcons name='update' size={12} color='#016D6D' />
								</View>
							</TouchableOpacity>
							<TouchableOpacity>
								<View className='bg-navLight border-2 border-danger rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
									<MaterialCommunityIcons name='delete-outline' size={12} color='#ef4444' />
								</View>
							</TouchableOpacity>
						</View>
					</View>
				)}
				keyExtractor={(item) => item.id}
			/>
		</View>
	);
}
