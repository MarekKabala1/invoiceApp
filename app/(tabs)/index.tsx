if (__DEV__) {
	require('@/Reactotron.config');
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { router } from 'expo-router';

export const dbStudio = SQLite.openDatabaseSync('invoice.db');

export default function Index() {
	useDrizzleStudio(dbStudio);

	return (
		<SafeAreaView className='flex-1 bg-primaryLight'>
			<View className='flex-1 container bg-primaryLight gap-4 p-8'>
				<TouchableOpacity onPress={() => router.push('/userInfo')} className='flex items-start justify-start'>
					<View className='flex-row items-center gap-2'>
						<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
							<MaterialCommunityIcons name='pencil-outline' size={24} color='#0d47a1' />
						</View>
						<View>
							<Text className='text-sm text-textLight'>Add Your Information for Invoicing</Text>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity className=' items-start justify-start'>
					<View className='flex-row items-center gap-2'>
						<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
							<MaterialCommunityIcons name='pencil-outline' size={24} color='#0d47a1' />
						</View>
						<View>
							<Text className='text-sm text-textLight'>Add Customer information's</Text>
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
