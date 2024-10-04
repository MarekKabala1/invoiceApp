import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
	const insets = useSafeAreaInsets();

	return (
		<SafeAreaView className='flex-1 bg-primaryLight' style={{ paddingTop: insets.top }}>
			<View className='flex-1 bg-primaryLight gap-4 p-6'>
				<TouchableOpacity onPress={() => router.push('/userInfo')} className='items-start justify-start'>
					<View className='flex-row items-center gap-2'>
						<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
							<FontAwesome5 name='user' size={56} color='#016D6D' />
						</View>
						<View>
							<Text className='text-sm font-bold   text-textLight'>Your&#39;s Information</Text>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.push('/clientInfo')} className='items-start justify-start '>
					<View className='flex-row items-center gap-2'>
						<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
							<FontAwesome5 name='building' size={56} color='#016D6D' />
						</View>
						<View>
							<Text className='text-sm font-bold  text-textLight'>Client Information</Text>
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
