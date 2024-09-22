import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
	return (
		<View className='flex-1 container bg-primaryLight gap-4 p-8'>
			<TouchableOpacity onPress={() => router.push('/userInfo')} className='items-start justify-start'>
				<View className='flex-row items-center gap-2'>
					<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
						<FontAwesome5 name='user' size={24} color='#0d47a1' />
					</View>
					<View>
						<Text className='text-sm  text-textLight'>Your&#39;s Information</Text>
					</View>
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => router.push('/clientInfo')} className='items-start justify-start '>
				<View className='flex-row items-center gap-2'>
					<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
						<FontAwesome5 name='building' size={24} color='#0d47a1' />
					</View>
					<View>
						<Text className='text-sm  text-textLight'>Client Information</Text>
					</View>
				</View>
			</TouchableOpacity>
		</View>
	);
}
