import { InvoiceProvider } from '@/context/InvoiceContext';
import '../global.css';
import 'expo-dev-client';
import { router, Stack, useRouter } from 'expo-router';
import React from 'react';
import { Button, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StackLayout() {
	const router = useRouter();

	const HeaderLeft = () => {
		return (
			<TouchableOpacity onPress={() => router.back()} className='flex flex-row items-center'>
				<MaterialCommunityIcons name='chevron-left' size={24} color='#0d47a1' />
				<Text className='text-textLight text-sm'>Back</Text>
			</TouchableOpacity>
		);
	};

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
							backgroundColor: '#f8fafc',
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
