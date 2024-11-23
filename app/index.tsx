if (__DEV__) {
	require('@/Reactotron.config');
}

import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite/next';
import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import migrations from '@/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import {Image} from 'expo-image'

export const dbStudio = openDatabaseSync('invoice.db');
const blurHash = 'LFNwNOa}~Ut7fSazoej[_1j[IWay';
const img = require('../assets/images/icon.png');
const backgroundImg = { uri: '../assets/images/wave.jpg' };

const expoDb = openDatabaseSync('invoice.db', { enableChangeListener: true });
export const db = drizzle(expoDb);
export default function Index() {
	const { success, error } = useMigrations(db, migrations);
	if (__DEV__) {
		useDrizzleStudio(dbStudio);
	}
	// useEffect(() => {
	// 	const timer = setTimeout(handleNavigation, 2000);
	// 	return () => clearTimeout(timer);
	// }, []);

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
	const handleNavigation = () => {
		router.push('/home');
	};

	return (
		<SafeAreaView className='flex-1 justify-center items-center h-screen bg-primaryLight gap-4 p-8'>
			<ImageBackground source={require('../assets/images/bgVector.png')} resizeMode='contain' className='flex-1 w-full justify-center items-center '>
				<TouchableOpacity
					className='items-center gap-2 bg-transparent '
					onPress={() => {
						handleNavigation();
					}}>

								<Image
									source={img}
									style={{
										height: 150,
										width: 150,
									}}
									contentFit="contain"
									placeholder={blurHash}
								/>

					<Text className='text-textLight'>Go to App</Text>
				</TouchableOpacity>
			</ImageBackground>
		</SafeAreaView>
	);
}
