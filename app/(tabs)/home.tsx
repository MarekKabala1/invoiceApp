import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseCard from '@/components/BaseCard';
import Svg, { Circle, Path } from 'react-native-svg';

export const BulletPoints = () => {
	return (
		<Svg width='12' height='12' viewBox='0 0 12 12'>
			<Circle cx='6' cy='6' r='4' fill='#8B5E3C' />
		</Svg>
	);
};

export default function Home() {
	const insets = useSafeAreaInsets();

	return (
		<SafeAreaView className='flex-1 bg-primaryLight ' style={{ paddingTop: insets.top }}>
			<View className='flex-1 bg-primaryLight p-4 gap-16'>
				<View className='gap-4 items-center'>
					<Text
						className='text-2xl font-bold text-textLight mb-2 text-center '
						style={{
							display: 'flex',
							letterSpacing: 2,
							textShadowColor: 'black',
							textShadowOffset: { width: 2, height: 1 },
							textShadowRadius: 0,
							color: '#8B5E3C',
						}}>
						Invoice & Budget{'\n'} Manager
					</Text>
					<View className='flex-row items-center gap-2 '>
						<BulletPoints />
						<Text className='text-base text-textLight/80 leading-5'>Manage your invoices and track your business finances with ease.</Text>
					</View>
					<View className='flex-row items-center gap-2 '>
						<BulletPoints />
						<Text className='text-base text-textLight/80 leading-5'>Track your Budget with ability to add Incomes and Expenses .</Text>
					</View>
				</View>
				<View className='gap-4'>
					<BaseCard className='p-4'>
						<TouchableOpacity onPress={() => router.push('/userInfo')}>
							<View className='flex-row items-center gap-4'>
								<View className='bg-textLight rounded-xl shadow-md p-3'>
									<FontAwesome5 name='user' size={32} color='#f1fcfa' />
								</View>
								<View>
									<Text className='text-lg font-bold text-textLight'>Your Information</Text>
									<Text className='text-sm text-textLight/80'>Manage your personal details</Text>
								</View>
							</View>
						</TouchableOpacity>
					</BaseCard>
					<BaseCard className='p-4'>
						<TouchableOpacity onPress={() => router.push('/clientInfo')}>
							<View className='flex-row items-center gap-4'>
								<View className='bg-textLight rounded-xl shadow-md p-3'>
									<FontAwesome5 name='building' size={32} color='#f1fcfa' />
								</View>
								<View>
									<Text className='text-lg font-bold text-textLight'>Client Information</Text>
									<Text className='text-sm text-textLight/80'>Manage client details</Text>
								</View>
							</View>
						</TouchableOpacity>
					</BaseCard>
				</View>

				<View className='mt-auto mb-4'>
					<Text className='text-center text-sm text-textLight/70 italic'>Tap on any card to get started</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}
