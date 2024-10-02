import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: '#F1FCFA' },
				headerTintColor: '#016D6D',
				headerTitleStyle: { fontWeight: 'bold' },
				tabBarStyle: { backgroundColor: '#F1FCFA' },
				tabBarActiveTintColor: '#016D6D',
				tabBarInactiveTintColor: '#016D6D',
				headerTitleAlign: 'center',
				tabBarHideOnKeyboard: true,
				headerShown: false,
			}}>
			<Tabs.Screen
				name='home'
				options={{
					title: 'Home',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='home' size={24} color='#016D6D' />
						) : (
							<MaterialCommunityIcons name='home-outline' size={24} color='#016D6D' />
						),
				}}
			/>
			<Tabs.Screen
				name='invoices'
				options={{
					title: 'Invoices',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='file' size={24} color='#016D6D' />
						) : (
							<MaterialCommunityIcons name='file-outline' size={24} color='#016D6D' />
						),
				}}
			/>
			<Tabs.Screen
				name='charts'
				options={{
					title: 'Charts',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='chart-bar' size={24} color='#016D6D' />
						) : (
							<MaterialCommunityIcons name='chart-bar-stacked' size={24} color='#016D6D' />
						),
				}}
			/>
		</Tabs>
	);
}
