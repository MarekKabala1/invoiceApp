import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: '#F3EDF7' },
				headerTintColor: '#0d47a1',
				headerTitleStyle: { fontWeight: 'bold' },
				tabBarStyle: { backgroundColor: '#F3EDF7' },
				tabBarActiveTintColor: '#0d47a1',
				tabBarInactiveTintColor: '#0d47a1',
				// headerShown: false,
			}}>
			<Tabs.Screen
				name='home'
				options={{
					title: 'Home',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='home' size={24} color='#0d47a1' />
						) : (
							<MaterialCommunityIcons name='home-outline' size={24} color='#0d47a1' />
						),
				}}
			/>
			<Tabs.Screen
				name='invoices'
				options={{
					title: 'Invoices',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='file' size={24} color='#0d47a1' />
						) : (
							<MaterialCommunityIcons name='file-outline' size={24} color='#0d47a1' />
						),
				}}
			/>
			<Tabs.Screen
				name='charts'
				options={{
					title: 'Charts',
					tabBarIcon: ({ focused }) =>
						focused ? (
							<MaterialCommunityIcons name='chart-bar' size={24} color='#0d47a1' />
						) : (
							<MaterialCommunityIcons name='chart-bar-stacked' size={24} color='#0d47a1' />
						),
				}}
			/>
		</Tabs>
	);
}
