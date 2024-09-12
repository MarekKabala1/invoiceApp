if (__DEV__) {
	require('@/Reactotron.config');
}

import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { router } from 'expo-router';
import { db } from '@/db/config';
import migrations from '@/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

export const dbStudio = SQLite.openDatabaseSync('invoice.db');
const burHash = 'LFNwNOa}~Ut7fSazoej[_1j[IWay';
export default function Index() {
	useDrizzleStudio(dbStudio);

	const { success, error } = useMigrations(db as any, migrations);

	if (error) {
		return (
			<SafeAreaView className='flex-1 items-center justify-center'>
				<View className='flex flex-col items-center justify-center p-4'>
					<Text className='text-danger text-bold'>Migration error: {error.message}</Text>
				</View>
			</SafeAreaView>
		);
	}
	if (!success) {
		return (
			<View>
				<Text>Migration is in progress...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView className='flex-1 bg-primaryLight'>
			<View className='flex-1 container justify-center items-center bg-primaryLight gap-4 p-8 '>
				<TouchableOpacity className='items-center gap-2 bg-primaryLight shadow-sm shadow-mutedForeground' onPress={() => router.push('/home')}>
					<Image source={require('../assets/images/icon.png')} className='w-24 h-24' resizeMode='contain' />
					<Text className='text-textLight'>Go to App</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
