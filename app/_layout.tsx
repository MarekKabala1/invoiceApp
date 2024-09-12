import '../global.css';
import 'expo-dev-client';
import React, { useEffect } from 'react';
import { Button, TouchableOpacity, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { InvoiceProvider } from '@/context/InvoiceContext';

const HeaderLeft = () => {
	const router = useRouter();

	return (
		<TouchableOpacity onPress={() => router.back()} className='flex flex-row items-center'>
			<MaterialCommunityIcons name='chevron-left' size={24} color='#0d47a1' />
			<Text className='text-textLight text-sm'>Back</Text>
		</TouchableOpacity>
	);
};

export default function StackLayout() {
	return (
		<InvoiceProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen
					name='(stack)/createInvoice'
					options={{
						headerShown: true,
						headerLeft: () => <HeaderLeft />,
						title: 'Create Invoice',
						headerStyle: {
							backgroundColor: '#F3EDF7',
						},
						headerTintColor: '#0d47a1',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
				<Stack.Screen
					name='(stack)/userInfo'
					options={{
						headerShown: true,
						headerLeft: () => <HeaderLeft />,
						title: 'User Info',
						headerStyle: {
							backgroundColor: '#F3EDF7',
						},
						headerTintColor: '#0d47a1',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
			</Stack>
		</InvoiceProvider>
	);
}
