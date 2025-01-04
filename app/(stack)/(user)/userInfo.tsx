import UsersCard from '@/components/Card';
import { db } from '@/db/config';
import { BankDetailsType, UserType } from '@/db/zodSchema';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { BankDetails, User } from '@/db/schema';
import BaseCard from '@/components/BaseCard';
import { color } from '@/utils/theme';
import UserInfoForm from './userInfoForm';
import BankDetailsForm from './bankDetailsForm';
import { BankDetailsUpdateParams, UserUpdateParams } from '@/types';

export default function UserInfo() {
	const [users, setUsers] = useState<UserType[]>([]);
	const [bankDetails, setBankDetails] = useState<BankDetailsType[]>([]);
	const [userModalVisible, setUserModalVisible] = useState(false);
	const [bankModalVisible, setBankModalVisible] = useState(false);
	const [userToUpdate, setUserToUpdate] = useState<UserType | null>(null);
	const [bankDetailsToUpdate, setBankDetailsToUpdate] = useState<BankDetailsType | null>(null);

	const params = useLocalSearchParams<UserUpdateParams | BankDetailsUpdateParams>();
	const [isUpdateMode, setIsUpdateMode] = useState(params?.mode === 'update');
	const type = params?.type;

	const getAllUsers = async () => {
		const usersData = await db.select().from(User);
		const bankDetailsData = await db.select().from(BankDetails);
		setUsers(usersData as UserType[]);
		setBankDetails(bankDetailsData as BankDetailsType[]);
	};

	useFocusEffect(
		useCallback(() => {
			getAllUsers();
		}, [])
	);

	useEffect(() => {
		if (isUpdateMode && type === 'user') {
			setUserToUpdate({
				id: params.id as string,
				fullName: params.fullName as string,
				address: params.address as string,
				emailAddress: params.emailAddress as string,
				phoneNumber: params.phoneNumber as string,
				utrNumber: params.utrNumber as string,
				ninNumber: params.ninNumber as string,
				createdAt: params.createdAt as string,
			});

			setUserModalVisible(true);
		} else {
			setUserToUpdate(null);
		}
	}, [isUpdateMode, type]);

	useEffect(() => {
		if (isUpdateMode && type === 'bankDetails') {
			setBankDetailsToUpdate({
				id: params?.id as string,
				userId: params?.userId as string,
				accountName: params.accountName as string,
				sortCode: params.sortCode as string,
				accountNumber: params.accountNumber as string,
				bankName: params.bankName as string,
				createdAt: params.createdAt as string,
			});

			setBankModalVisible(true);
		} else {
			setBankDetailsToUpdate(null);
		}
	}, [isUpdateMode, type]);

	const resetUserFormAndCloseModal = () => {
		setUserToUpdate(null);
		setUserModalVisible(false);
		router.setParams({ mode: null, type: null });
		setIsUpdateMode(false);
	};

	const resetBankDetailsFormAndCloseModal = () => {
		setBankDetailsToUpdate(null);
		setBankModalVisible(false);
		router.setParams({ mode: null, type: null });
		setIsUpdateMode(false);
	};
	const resetUpdateMode = () => {
		setIsUpdateMode(false); // Clear the data
	};

	return (
		<View className='flex-1 container bg-light-primary gap-4 p-4'>
			<View className='mt-4 gap-4'>
				<UsersCard users={users} bankDetails={bankDetails} />
			</View>

			{/* User Info Modal */}
			<Modal animationType='slide' transparent={true} visible={userModalVisible} onRequestClose={() => setUserModalVisible(false)}>
				<View className=' flex-1 justify-center items-center bg-light-text/30'>
					<View className='bg-light-primary w-[90%] rounded-lg p-6 '>
						<View className='flex-row w-full items-center mb-4'>
							<Text className='text-lg font-bold m-auto text-light-text'>{isUpdateMode ? 'Update User' : 'Add User'}</Text>
							<TouchableOpacity onPress={resetUserFormAndCloseModal}>
								<Text className='text-light-text text-right text-lg'>✕</Text>
							</TouchableOpacity>
						</View>
						<UserInfoForm
							update={isUpdateMode}
							dataToUpdate={userToUpdate ?? undefined}
							onSuccess={() => {
								setUserModalVisible(false);
								getAllUsers();
								resetUpdateMode();
							}}
						/>
					</View>
				</View>
			</Modal>

			{/* Bank Details Modal */}
			<Modal animationType='slide' transparent={true} visible={bankModalVisible} onRequestClose={() => setBankModalVisible(false)}>
				<View className='flex-1 justify-center items-center bg-light-text/30'>
					<View className='bg-light-primary w-[90%] rounded-lg p-6 max-h-[90%]'>
						<View className='flex-row items-center mb-4'>
							<Text className='text-lg m-auto font-bold text-light-text'>{isUpdateMode ? 'Update Bank Details' : 'Add Bank Details'}</Text>
							<TouchableOpacity onPress={resetBankDetailsFormAndCloseModal}>
								<Text className='text-light-text text-lg'>✕</Text>
							</TouchableOpacity>
						</View>
						<BankDetailsForm
							update={isUpdateMode}
							dataToUpdate={bankDetailsToUpdate ?? undefined}
							onSuccess={() => {
								setBankModalVisible(false);
								getAllUsers();
								resetUpdateMode();
							}}
						/>
					</View>
				</View>
			</Modal>

			<View className='flex-row justify-between'>
				<Text className='text-xs text-light-text text-center'>*You can add multiple Users</Text>
				<Text className='text-xs text-light-text text-center'>*Long Press to Delete</Text>
			</View>
			<View className='absolute bottom-5 right-4 gap-2'>
				<BaseCard>
					<TouchableOpacity onPress={() => setUserModalVisible(true)} className='flex-row items-center gap-2 w-full'>
						<Ionicons name='add-circle-outline' size={36} color={color.light.text} />
						<Text className='text-xs font-bold text-light-text'>Contact Information</Text>
					</TouchableOpacity>
				</BaseCard>

				<BaseCard>
					<TouchableOpacity onPress={() => setBankModalVisible(true)} className='flex-row items-center gap-2 w-full'>
						<Ionicons name='add-circle-outline' size={36} color={color.light.text} />
						<Text className='text-xs font-bold text-light-text'>Bank Details</Text>
					</TouchableOpacity>
				</BaseCard>
			</View>
		</View>
	);
}
