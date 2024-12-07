import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { db } from '@/db/config';
import { User, Customer, BankDetails } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { userSchema, bankDetailsSchema, customerSchema } from '@/db/zodSchema';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import BaseCard from './BaseCard';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/utils/theme';

type User = z.infer<typeof userSchema>;
type BankDetails = z.infer<typeof bankDetailsSchema>;
type Customer = z.infer<typeof customerSchema>;

interface UserWithBankDetails extends User {
	bankDetails?: BankDetails | null;
}

export default function UsersCard({ users, bankDetails, customers }: { users?: User[]; bankDetails?: BankDetails[]; customers?: Customer[] }) {
	const [usersWithBankDetails, setUsersWithBankDetails] = useState<UserWithBankDetails[]>([]);
	const [dbCustomers, setDbCustomers] = useState<Customer[]>([]);
	const [updateModalVisible, setUpdateModalVisible] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	// Function to find the bank details for a specific user
	const getBankDetailsForUser = (userId: string) => {
		return bankDetails?.find((details) => details.userId === userId) || null;
	};

	const deleteUser = async (userId: string) => {
		try {
			await db.delete(User).where(eq(User.id, userId));
			await db.delete(BankDetails).where(eq(BankDetails.userId, userId));
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

	const updateUser = async (userId: string) => {
		const users = await db.select().from(User);
		const user = users.find((usr) => usr.id === userId);
		if (user) {
			router.replace({
				pathname: '/(user)/userInfo',
				params: {
					mode: 'update',
					type: 'user',
					userId: user.id,
					fullName: user.fullName,
					address: user.address,
					emailAddress: user.emailAddress,
					phoneNumber: user.phoneNumber,
					utrNumber: user.utrNumber,
					ninNumber: user.ninNumber,
					createAt: user.createdAt,
				},
			});
		}
	};

	const updateBankDetails = (userId: string) => {
		const bankDetails = getBankDetailsForUser(userId);
		if (bankDetails) {
			router.replace({
				pathname: '/(user)/userInfo',
				params: {
					mode: 'update',
					type: 'bankDetails',
					bankDetailsId: bankDetails.id,
					userId: bankDetails.userId,
					accountName: bankDetails.accountName,
					sortCode: bankDetails?.sortCode,
					accountNumber: bankDetails?.accountNumber,
					bankName: bankDetails?.bankName,
					createAt: bankDetails?.createdAt,
				},
			});
		}
	};
	const updateCustomer = (customerId: string) => {
		const customer = dbCustomers.find((cst) => cst.id === customerId);

		if (customer) {
			router.replace({
				pathname: '/clientInfo',
				params: {
					mode: 'update',
					customerId: customer.id,
					customerName: customer.name,
					address: customer.address,
					email: customer.emailAddress,
					phoneNumber: customer.phoneNumber,
				},
			});
		}
	};

	const [modalPosition, setModalPosition] = useState({ top: 0 });

	const toggleModal = (event: { nativeEvent: { pageY: number } }, userId?: string) => {
		const { pageY } = event.nativeEvent;
		setModalPosition({
			top: pageY,
		});
		setSelectedUserId(userId as string);
		setUpdateModalVisible((prevVisible) => !prevVisible);
	};
	return (
		<View>
			{usersWithBankDetails &&
				usersWithBankDetails.map((item) => (
					<BaseCard key={item.id} className='mb-4 relative  '>
						<TouchableOpacity onLongPress={() => deleteUser(item.id)} className='flex-row justify-between items-center'>
							<Text className='text-lg font-bold text-textLight px-2'>{item.fullName}</Text>
							<View className='flex-row items-center gap-10'>
								<View className='text-xs text-textLight'>
									{item.bankDetails ? (
										<Text className='text-xs text-textLight'>{item.bankDetails.bankName}</Text>
									) : (
										<Text className='text-xs text-danger'>Bank details not added</Text>
									)}
								</View>
								<View className='flex-row'>
									<TouchableOpacity onPress={(e) => toggleModal(e, item.id)}>
										<View className='bg-navLight border border-textLight rounded-md p-1 '>
											<MaterialCommunityIcons name='update' size={24} color='#8B5E3C' />
										</View>
									</TouchableOpacity>
									<Modal animationType='fade' transparent={true} visible={updateModalVisible} onRequestClose={() => setUpdateModalVisible(false)}>
										<TouchableOpacity className='flex-1 bg-textLight/10' activeOpacity={1} onPress={toggleModal}>
											<TouchableOpacity
												activeOpacity={1}
												onPress={(e) => e.stopPropagation()}
												style={{
													top: modalPosition.top,
												}}
												className='grid grid-cols-2 justify-start absolute right-5  gap-4 bg-primaryLight border border-textLight rounded-md p-4 shadow-lg elevation-lg'>
												<TouchableOpacity onPress={() => updateUser(selectedUserId as string)} className='flex-row gap-4 items-center justify-start '>
													<FontAwesome style={{ paddingRight: 7 }} name='user-o' size={20} color={colors.textLight} />
													<Text className='text-textLight font-bold '>User</Text>
												</TouchableOpacity>
												<TouchableOpacity onPress={() => updateBankDetails(item.id)} className='flex-row gap-4 items-center justify-start'>
													<FontAwesome name='bank' size={20} color={colors.textLight} />
													<Text className='text-textLight font-bold'> Bank Details</Text>
												</TouchableOpacity>
											</TouchableOpacity>
										</TouchableOpacity>
									</Modal>
								</View>
							</View>
						</TouchableOpacity>
					</BaseCard>
				))}
			{dbCustomers &&
				dbCustomers.map((item) => (
					<BaseCard key={item.id} className='mb-4'>
						<TouchableOpacity onLongPress={() => deleteCustomer(item.id as string)} className='flex-row justify-between items-center  '>
							<Text className='text-lg font-bold text-textLight'>{item.name}</Text>
							<View className='flex-row gap-2'>
								<TouchableOpacity onPress={() => updateCustomer(item.id as string)}>
									<View className='bg-navLight border border-textLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
										<MaterialCommunityIcons name='update' size={20} color='#8B5E3C' />
									</View>
								</TouchableOpacity>
							</View>
						</TouchableOpacity>
					</BaseCard>
				))}
		</View>
	);
}
