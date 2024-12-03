import UsersCard from '@/components/Card';
import { db } from '@/db/config';
import { bankDetailsSchema, userSchema } from '@/db/zodSchema';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { BankDetails, User } from '@/db/schema';
import { z } from 'zod';
import BaseCard from '@/components/BaseCard';
import { colors } from '@/utils/theme';
import UserInfoForm from './userInfoForm';
import BankDetailsForm from './bankDetailsForm';

type User = z.infer<typeof userSchema>;
type BankDetails = z.infer<typeof bankDetailsSchema>;

export default function UserInfo() {
	const [users, setUsers] = useState<User[]>([]);
	const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);
	const [userModalVisible, setUserModalVisible] = useState(false);
	const [bankModalVisible, setBankModalVisible] = useState(false);

	const fetchAllUsers = async () => {
		const usersData = await db.select().from(User);
		const bankDetailsData = await db.select().from(BankDetails);
		setUsers(usersData as User[]);
		setBankDetails(bankDetailsData as BankDetails[]);
	};

	useFocusEffect(
		useCallback(() => {
			fetchAllUsers();
		}, [])
	);

	return (
		<View className='flex-1 container bg-primaryLight gap-4 p-4'>
			<View className='mt-4 gap-4'>
				<UsersCard users={users} bankDetails={bankDetails} />
			</View>

			{/* User Info Modal */}
			<Modal animationType='slide' transparent={true} visible={userModalVisible} onRequestClose={() => setUserModalVisible(false)}>
				<View className='flex-1 justify-center items-center bg-textLight/30'>
					<View className='bg-primaryLight w-[90%] rounded-lg p-6 max-h-[90%]'>
						<View className='flex-row justify-between items-center mb-4'>
							<Text className='text-lg font-bold text-textLight'>Add User Info</Text>
							<TouchableOpacity onPress={() => setUserModalVisible(false)}>
								<Text className='text-textLight text-lg'>✕</Text>
							</TouchableOpacity>
						</View>
						<UserInfoForm
							onSuccess={() => {
								setUserModalVisible(false);
								fetchAllUsers();
							}}
						/>
					</View>
				</View>
			</Modal>

			{/* Bank Details Modal */}
			<Modal animationType='slide' transparent={true} visible={bankModalVisible} onRequestClose={() => setBankModalVisible(false)}>
				<View className='flex-1 justify-center items-center bg-textLight/30'>
					<View className='bg-primaryLight w-[90%] rounded-lg p-6 max-h-[90%]'>
						<View className='flex-row justify-between items-center mb-4'>
							<Text className='text-lg font-bold text-textLight'>Add Bank Details</Text>
							<TouchableOpacity onPress={() => setBankModalVisible(false)}>
								<Text className='text-textLight text-lg'>✕</Text>
							</TouchableOpacity>
						</View>
						<BankDetailsForm
							onSuccess={() => {
								setBankModalVisible(false);
								fetchAllUsers();
							}}
						/>
					</View>
				</View>
			</Modal>

			<View className='flex-row justify-between'>
				<Text className='text-xs text-textLight text-center'>*You can add multiple Users</Text>
				<Text className='text-xs text-textLight text-center'>*Long Press to Delete</Text>
			</View>
			<View className='absolute bottom-5 right-4 gap-2'>
				<BaseCard>
					<TouchableOpacity onPress={() => setUserModalVisible(true)} className='flex-row items-center gap-2 w-full'>
						<Ionicons name='add-circle-outline' size={36} color={colors.textLight} />
						<Text className='text-xs font-bold text-textLight'>Contact Information</Text>
					</TouchableOpacity>
				</BaseCard>

				<BaseCard>
					<TouchableOpacity onPress={() => setBankModalVisible(true)} className='flex-row items-center gap-2 w-full'>
						<Ionicons name='add-circle-outline' size={36} color={colors.textLight} />
						<Text className='text-xs font-bold text-textLight'>Bank Details</Text>
					</TouchableOpacity>
				</BaseCard>
			</View>
		</View>
	);
}
