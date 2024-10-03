import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Charts() {
	const insets = useSafeAreaInsets();
	return (
		<SafeAreaView style={{ paddingTop: insets.top }} className='flex-1 bg-primaryLight'>
			<View className='flex-1 bg-primaryLight p-4'>
				<Text>Charts</Text>
			</View>
		</SafeAreaView>
	);
}
