import '../global.css';
import 'expo-dev-client';
import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { InvoiceProvider } from '@/context/InvoiceContext';


export const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="createInvoice"
        options={{ title: 'Create Invoice' }}
      />
    </Stack>
  );
};

export default function AppLayout() {
	return (
		<InvoiceProvider>
			<Tabs>
				<Tabs.Screen
					name="index"
					options={{ title: 'All Invoices' }}
				/>

				{/* <Tabs.Screen
					name="invoice/[id]"
					options={{ title: 'Invoice Details' }}
				/> */}
			</Tabs>
		</InvoiceProvider>
	);
}