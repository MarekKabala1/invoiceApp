import '../global.css';
import 'expo-dev-client';
import React, { useEffect } from 'react';
import { TouchableOpacity, Text, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useNavigationContainerRef, useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

const HeaderLeft = () => {
	const router = useRouter();
	const { colors } = useTheme();

	return (
		<TouchableOpacity onPress={() => router.back()} className='flex flex-row items-center'>
			<MaterialCommunityIcons name='chevron-left' size={24} color={colors.text} />
			<Text className='text-light-text dark:text-dark-text text-sm'>Back</Text>
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
	const { colors, isDark, setColorScheme } = useTheme();
	const colorScheme = useColorScheme();

	useEffect(() => {
		if (ref) {
			routingInstrumentation.registerNavigationContainer(ref);
		}
	}, [ref]);
	useEffect(() => {
		if (colorScheme) {
			setColorScheme(colorScheme);
		}
	}, [colorScheme]);

	return (
		<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.primary } }}>
			<Stack.Screen
				name='(stack)/createInvoice'
				options={{
					headerShown: true,
					headerLeft: () => <HeaderLeft />,
					headerRight: () => <ThemeToggle size={30} />,
					title: 'Create Invoice',
					headerStyle: {
						backgroundColor: colors.primary,
					},
					headerTitleAlign: 'center',
					animation: 'slide_from_left',
					headerTintColor: colors.text,
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
					headerRight: () => <ThemeToggle size={30} />,
					title: 'User Info',
					headerStyle: {
						backgroundColor: colors.primary,
					},
					headerTitleAlign: 'center',
					headerTintColor: colors.text,
					animation: 'slide_from_left',
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
						backgroundColor: colors.primary,
					},
					headerTitleAlign: 'center',
					headerTintColor: colors.text,
					animation: 'slide_from_left',
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
					headerRight: () => <ThemeToggle size={30} />,
					title: 'Bank Details',
					headerStyle: {
						backgroundColor: colors.primary,
					},
					headerTitleAlign: 'center',
					headerTintColor: colors.text,
					animation: 'slide_from_left',
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
					headerRight: () => <ThemeToggle size={30} />,
					title: 'Customers Info',
					headerStyle: {
						backgroundColor: colors.primary,
					},
					headerTitleAlign: 'center',
					headerTintColor: colors.text,
					animation: 'slide_from_left',
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
					headerRight: () => <ThemeToggle size={30} />,
					title: 'Add Transaction',
					headerStyle: {
						backgroundColor: colors.primary,
					},
					headerTitleAlign: 'center',
					headerTintColor: colors.text,
					animation: 'slide_from_left',
					headerTitleStyle: {
						fontWeight: 'bold',
					},
				}}
			/>
		</Stack>
	);
}

function RootLayout() {
	return (
		<ThemeProvider>
			<StackLayout />
		</ThemeProvider>
	);
}
export default Sentry.wrap(RootLayout);
