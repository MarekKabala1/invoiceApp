import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { z } from 'zod';
import { userSchema, bankDetailsSchema } from '@/db/zodSchema';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type User = z.infer<typeof userSchema>;
type BankDetails = z.infer<typeof bankDetailsSchema>;

export default function UsersCard({ users, bankDetails }: { users: User[]; bankDetails: BankDetails[] }) {
	// Function to get the bank details for a specific user
	const getBankDetailsForUser = (userId: string) => {
		return bankDetails.find((details) => details.userId === userId);
	};

	return (
		<View>
			<FlatList
				data={users}
				renderItem={({ item }) => {
					const userBankDetails = getBankDetailsForUser(item.id); // Find bank details for the current user
					return (
						<View className='bg-navLight p-2 mb-2 rounded-lg shadow-sm flex-row justify-between items-center'>
							<Text className='text-md text-textLight'>{item.fullName}</Text>
							<Text className='text-xs text-textLight'>
								{userBankDetails?.bankName ? userBankDetails.bankName : <Text className='text-xs text-danger'>Bank details not added</Text>}
							</Text>
							<View className='flex-row gap-2'>
								<TouchableOpacity>
									<View className='bg-navLight border-2 border-textLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
										<MaterialCommunityIcons name='update' size={12} color='#253cad' />
									</View>
								</TouchableOpacity>
								<TouchableOpacity>
									<View className='bg-navLight border-2 border-danger rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
										<MaterialCommunityIcons name='delete-outline' size={12} color='#ef4444' />
									</View>
								</TouchableOpacity>
							</View>
						</View>
					);
				}}
				keyExtractor={(item) => item.id}
			/>
		</View>
	);
}
