import '../global.css';
import 'expo-dev-client';
import React, { useEffect } from 'react';
import { Button, TouchableOpacity, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { InvoiceProvider } from '@/context/InvoiceContext';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://1ad35978df417359cf4c6cd17d210ad3@o4508151262347264.ingest.de.sentry.io/4508151272112208',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});

const HeaderLeft = () => {
	const router = useRouter();

	return (
		<TouchableOpacity onPress={() => router.back()} className='flex flex-row items-center'>
			<MaterialCommunityIcons name='chevron-left' size={24} color='#016D6D' />
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
							backgroundColor: '#F1FCFA',
						},
						headerTitleAlign: 'center',
						headerTintColor: '#016D6D',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
				<Stack.Screen
					name='(stack)/(user)/userInfo'
					options={{
						headerShown: true,
						headerLeft: () => <HeaderLeft />,
						title: 'User Info',
						headerStyle: {
							backgroundColor: '#F1FCFA',
						},
						headerTitleAlign: 'center',
						headerTintColor: '#016D6D',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
				<Stack.Screen
					name='(stack)/(user)/userInfoForm'
					options={{
						headerShown: true,
						headerLeft: () => <HeaderLeft />,
						title: 'Company Details',
						headerStyle: {
							backgroundColor: '#F1FCFA',
						},
						headerTitleAlign: 'center',
						headerTintColor: '#016D6D',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
				<Stack.Screen
					name='(stack)/(user)/bankDetailsForm'
					options={{
						headerShown: true,
						headerLeft: () => <HeaderLeft />,
						title: 'Bank Details',
						headerStyle: {
							backgroundColor: '#F1FCFA',
						},
						headerTitleAlign: 'center',
						headerTintColor: '#016D6D',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
				<Stack.Screen
					name='(stack)/clientInfo'
					options={{
						headerShown: true,
						headerLeft: () => <HeaderLeft />,
						title: 'Client Info',
						headerStyle: {
							backgroundColor: '#F1FCFA',
						},
						headerTitleAlign: 'center',
						headerTintColor: '#016D6D',
						headerTitleStyle: {
							fontWeight: 'bold',
						},
					}}
				/>
			</Stack>
		</InvoiceProvider>
	);
}
