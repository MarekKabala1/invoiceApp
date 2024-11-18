import React, { useEffect, useRef } from 'react';
import { Stack, Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { View, Text, Animated, Platform } from 'react-native';

const AnimatedTabLabel = ({ focused, children }: { focused: boolean; children: React.ReactNode }) => {
	const [width, setWidth] = React.useState(0);
	const animatedWidth = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(animatedWidth, {
			toValue: focused ? width : 0,
			duration: 150,
			useNativeDriver: false,
		}).start();
	}, [focused, width]);

	return (
		<View style={{ position: 'relative', alignItems: 'center' }}>
			<Text
				onLayout={({ nativeEvent }) => {
					setWidth(nativeEvent.layout.width);
				}}
				style={{
					color: focused ? '#B38450' : '#4F4A3E',
					fontSize: 10,
					marginBottom: 4,
				}}>
				{children}
			</Text>
			<Animated.View
				style={{
					height: 2,
					backgroundColor: '#B38450',
					width: animatedWidth,
					position: 'absolute',
					bottom: -2,
					left: 0,
					right: 0,
					alignSelf: 'center',
				}}
			/>
		</View>
	);
};

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: '#efe7e2' },
				headerTintColor: '#4F4A3E',
				headerTitleStyle: { fontWeight: 'bold' },
				tabBarStyle: Platform.select({
					android: {
						position: 'absolute',
						bottom: 10,
						backgroundColor: '#efe7e2',
						height: 80,
						margin: 10,
						paddingBottom: 10,
						paddingTop: 10,
						borderRadius: 20,
						elevation: 10,
					},
					ios: {
						position: 'absolute',
						bottom: 15,
						backgroundColor: '#efe7e2',
						height: 80,
						margin: 10,
						paddingBottom: 10,
						paddingTop: 10,
						borderRadius: 20,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 10 },
						shadowOpacity: 0.3,
						shadowRadius: 10,
						justifyContent: 'center',
						alignItems: 'center',
					},
				}),

				tabBarActiveTintColor: '#B38450',
				tabBarInactiveTintColor: '#4F4A3E',
				headerTitleAlign: 'center',
				tabBarHideOnKeyboard: true,
				headerShown: false,
				tabBarLabel: ({ focused, children }) => <AnimatedTabLabel focused={focused}>{children}</AnimatedTabLabel>,
			}}>
			<Tabs.Screen
				name='home'
				options={{
					title: 'Home',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<Ionicons name='home' size={24} color='#B38450' style={{ transform: [{ scale: 1.2 }] }} />
						) : (
							<Ionicons name='home-outline' size={24} color='#4F4A3E' />
						),
				}}
			/>
			<Tabs.Screen
				name='invoices'
				options={{
					title: 'Invoices',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<Ionicons name='document' size={24} color='#B38450' style={{ transform: [{ scale: 1.2 }] }} />
						) : (
							<Ionicons name='document-outline' size={24} color='#4F4A3E' />
						),
				}}
			/>
			<Tabs.Screen
				name='charts'
				options={{
					title: 'Charts',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<Ionicons name='bar-chart' size={24} color='#B38450' style={{ transform: [{ scale: 1.2 }] }} />
						) : (
							<Ionicons name='bar-chart-outline' size={24} color='#4F4A3E' />
						),
				}}
			/>
			<Tabs.Screen
				name='budget'
				options={{
					title: 'Budget',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<Ionicons name='wallet' size={24} color='#B38450' style={{ transform: [{ scale: 1.2 }] }} />
						) : (
							<Ionicons name='wallet-outline' size={24} color='#4F4A3E' />
						),
				}}
			/>
		</Tabs>
	);
}
