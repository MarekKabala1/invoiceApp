import React, { useEffect, useRef } from 'react';
import { Stack, Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, Animated } from 'react-native';

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
		<View>
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
					bottom: -4,
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
				tabBarStyle: { backgroundColor: '#efe7e2' },
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
							<MaterialCommunityIcons name='home' size={24} color='#B38450' />
						) : (
							<MaterialCommunityIcons name='home-outline' size={24} color='#4F4A3E' />
						),
				}}
			/>
			<Tabs.Screen
				name='invoices'
				options={{
					title: 'Invoices',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='file' size={24} color='#B38450' />
						) : (
							<MaterialCommunityIcons name='file-outline' size={24} color='#4F4A3E' />
						),
				}}
			/>
			<Tabs.Screen
				name='charts'
				options={{
					title: 'Charts',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='chart-bar' size={24} color='#B38450' />
						) : (
							<MaterialCommunityIcons name='chart-bar-stacked' size={24} color='#4F4A3E' />
						),
				}}
			/>
		</Tabs>
	);
}
