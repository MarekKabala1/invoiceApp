if (__DEV__) {
	require('@/Reactotron.config');
}

import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite/next';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { router } from 'expo-router';
import migrations from '@/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import * as FileSystem from 'expo-file-system';

export const dbStudio = openDatabaseSync('invoice.db');
const burHash = 'LFNwNOa}~Ut7fSazoej[_1j[IWay';

const expoDb = openDatabaseSync('invoice.db', { enableChangeListener: true });

export const db = drizzle(expoDb);
export default function Index() {

	const { success, error } = useMigrations(db, migrations);

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

	const logError = async (error: Error) => {
		const logFile = `${FileSystem.documentDirectory}error.log`;
		const errorMessage = `${new Date().toISOString()}: ${error.message}\n${error.stack}\n\n`;

		try {
			// Check if the file exists
			const fileInfo = await FileSystem.getInfoAsync(logFile);

			if (fileInfo.exists) {
				// If file exists, read its content and append the new error
				const currentContent = await FileSystem.readAsStringAsync(logFile);
				await FileSystem.writeAsStringAsync(logFile, currentContent + errorMessage);
			} else {
				// If file doesn't exist, create it with the error message
				await FileSystem.writeAsStringAsync(logFile, errorMessage);
			}
		} catch (writeError) {
			console.error('Failed to write error log:', writeError);
		}
	};

	// Usage in your app's entry point
	try {
		// Your app initialization code
	} catch (error: any) {
		logError(new Error(String(error)));
	}

	return (
		<SafeAreaView className='flex-1 justify-center items-center h-screen bg-primaryLight gap-4 p-8'>
			<TouchableOpacity className='items-center gap-2 bg-primaryLight shadow-sm shadow-mutedForeground' onPress={() => router.push('/home')}>
				<Image source={require('../assets/images/icon.png')} className='w-24 h-24' resizeMode='contain' />
				<Text className='text-textLight'>Go to App</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
}
