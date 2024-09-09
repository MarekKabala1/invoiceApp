import { InvoiceProvider } from '@/context/InvoiceContext';
import '../global.css';
import 'expo-dev-client';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Button, TouchableOpacity, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '@/db/config';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { SafeAreaView } from 'react-native-safe-area-context';

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
	const { success, error } = useMigrations(db as any, migrations);

	if (error) {
		return (
			<SafeAreaView className='flex-1 items-center justify-center'>
				<View className='flex flex-col items-center justify-center'>
					<Text>Migration error: {error.message}</Text>
				</View>
			</SafeAreaView>
		);
	}
	if (!success) {
		return (
			<View>
				<Text>Migration is in progress...</Text>
			</View>
		);
	}

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
