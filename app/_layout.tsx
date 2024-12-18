import '../global.css';
import 'expo-dev-client';
import React, { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useNavigationContainerRef, useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

const HeaderLeft = () => {
	const router = useRouter();

	return (
		<TouchableOpacity onPress={() => router.back()} className='flex flex-row items-center'>
			<MaterialCommunityIcons name='chevron-left' size={24} color='#8B5E3C' />
			<Text className='text-textLight text-sm'>Back</Text>
		</TouchableOpacity>
	);
};
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
	dsn: 'https://d28491e1b8f26b6a29beefe0093c6d02@o4508151262347264.ingest.de.sentry.io/4508158889689168',

	debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
	integrations: [
		new Sentry.ReactNativeTracing({
			// Pass instrumentation to be used as `routingInstrumentation`
			routingInstrumentation,
			enableNativeFramesTracking: !isRunningInExpoGo(),
			// ...
		}),
	],
	tracesSampleRate: 1.0,
});

function StackLayout() {
	const ref = useNavigationContainerRef();

	useEffect(() => {
		if (ref) {
			routingInstrumentation.registerNavigationContainer(ref);
		}
	}, [ref]);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name='(stack)/createInvoice'
				options={{
					headerShown: true,
					headerLeft: () => <HeaderLeft />,
					title: 'Create Invoice',
					headerStyle: {
						backgroundColor: '#efe7e2',
					},
					headerTitleAlign: 'center',
					headerTintColor: '#8B5E3C',
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
						backgroundColor: '#efe7e2',
					},
					headerTitleAlign: 'center',
					headerTintColor: '#8B5E3C',
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
						backgroundColor: '#efe7e2',
					},
					headerTitleAlign: 'center',
					headerTintColor: '#8B5E3C',
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
						backgroundColor: '#efe7e2',
					},
					headerTitleAlign: 'center',
					headerTintColor: '#8B5E3C',
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
					title: 'Customers Info',
					headerStyle: {
						backgroundColor: '#efe7e2',
					},
					headerTitleAlign: 'center',
					headerTintColor: '#8B5E3C',
					headerTitleStyle: {
						fontWeight: 'bold',
					},
				}}
			/>
			<Stack.Screen
				name='(stack)/addTransaction'
				options={{
					headerShown: true,
					headerLeft: () => <HeaderLeft />,
					title: 'Add Transaction',
					headerStyle: {
						backgroundColor: '#efe7e2',
					},
					headerTitleAlign: 'center',
					headerTintColor: '#8B5E3C',
					headerTitleStyle: {
						fontWeight: 'bold',
					},
				}}
			/>
		</Stack>
	);
}
export default Sentry.wrap(StackLayout);
