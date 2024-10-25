import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { db } from '@/db/config';
import { User, Customer } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { userSchema, bankDetailsSchema, customerSchema } from '@/db/zodSchema';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type User = z.infer<typeof userSchema>;
type BankDetails = z.infer<typeof bankDetailsSchema>;
type Customer = z.infer<typeof customerSchema>;

interface UserWithBankDetails extends User {
	bankDetails?: BankDetails | null;
}

export default function UsersCard({ users, bankDetails, customers }: { users?: User[]; bankDetails?: BankDetails[]; customers?: Customer[] }) {
	const [usersWithBankDetails, setUsersWithBankDetails] = useState<UserWithBankDetails[]>([]);
	const [dbCustomers, setDbCustomers] = useState<Customer[]>([]);

	// Function to find the bank details for a specific user
	const getBankDetailsForUser = (userId: string) => {
		return bankDetails?.find((details) => details.userId === userId) || null;
	};

	const deleteUser = async (userId: string) => {
		try {
			await db.delete(User).where(eq(User.id, userId));
			setUsersWithBankDetails((prevUsers) => prevUsers.filter((user) => user.id !== userId));
		} catch (e) {
			throw new Error(`There is problem to delete User ${e}`);
		}
	};
	const deleteCustomer = async (customerId: string) => {
		try {
			await db.delete(Customer).where(eq(Customer.id, customerId));
			setDbCustomers((prevCustomers) => prevCustomers.filter((customer) => customer.id !== customerId));
		} catch (e) {
			throw new Error(`There is problem to delete Customer ${e}`);
		}
	};

	useEffect(() => {
		const mappedUsers = users?.map((user) => ({
			...user,
			bankDetails: getBankDetailsForUser(user.id),
		}));
		setUsersWithBankDetails(mappedUsers as UserWithBankDetails[]);
		const mappedCustomers = customers?.map((customer) => ({
			...customer,
		}));
		setDbCustomers(mappedCustomers as Customer[]);
	}, [users, bankDetails, customers]);

	return (
		<View>
			{usersWithBankDetails ? (
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
									<View className='bg-navLight border border-textLight rounded-md p-1'>
										<MaterialCommunityIcons name='update' size={14} color='#8B5E3C' />
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => deleteUser(item.id)}>
									<View className='bg-navLight border border-danger rounded-md p-1'>
										<MaterialCommunityIcons name='delete-outline' size={14} color='#ef4444' />
									</View>
								</TouchableOpacity>
							</View>
						</View>
					)}
					keyExtractor={(item) => item.id}
				/>
			) : (
				<FlatList
					data={dbCustomers}
					renderItem={({ item }) => (
						<View className='bg-navLight p-2 mb-2 rounded-lg shadow-sm flex-row justify-between items-center'>
							<Text className='text-md font-bold text-textLight'>{item.name}</Text>
							<View className='flex-row gap-2'>
								<TouchableOpacity>
									<View className='bg-navLight border border-textLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
										<MaterialCommunityIcons name='update' size={12} color='#8B5E3C' />
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => deleteCustomer(item.id as string)}>
									<View className='bg-navLight border border-danger rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
										<MaterialCommunityIcons name='delete-outline' size={12} color='#ef4444' />
									</View>
								</TouchableOpacity>
							</View>
						</View>
					)}
					keyExtractor={(item) => item.id as string}
				/>
			)}
		</View>
	);
}
