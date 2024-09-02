import InvoiceList from '@/components/InvoiceList';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';

export default function Index() {
	return (
		<SafeAreaView className='flex-1 bg-primaryLight'>
			<View className='flex-1 container bg-primaryLight gap-4 p-8'>
				<TouchableOpacity className=' items-start justify-start'>
					<View className='flex-row items-center gap-2'>
						<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
							<MaterialCommunityIcons name='pencil-outline' size={24} color='#0d47a1' />
						</View>
						<View>
							<Text className='text-sm text-textLight'>Add Your Company</Text>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity className=' items-start justify-start'>
					<View className='flex-row items-center gap-2'>
						<View className='bg-navLight border-2 border-navLight rounded-md text-textLight shadow-sm shadow-slate-400 p-2'>
							<MaterialCommunityIcons name='pencil-outline' size={24} color='#0d47a1' />
						</View>
						<View>
							<Text className='text-sm text-textLight'>Add Coustomer</Text>
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
