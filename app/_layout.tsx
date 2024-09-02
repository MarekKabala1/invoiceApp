import { InvoiceProvider } from '@/context/InvoiceContext';
import '../global.css';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import React from 'react';

export default function StackLayout() {
	return (
		<InvoiceProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen
					name='(stack)/createInvoice'
					options={{
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
