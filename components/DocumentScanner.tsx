import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCameraScanner } from '@/hooks/useCameraScanner';
import { useTheme } from '@/context/ThemeContext';
import BaseCard from './BaseCard';

interface DocumentScannerProps {
	onScanComplete?: (data: { pages: string[]; pdf?: string | null }) => void;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScanComplete }) => {
	const { colors, isDark } = useTheme();
	const { scannedData, handleScan, isLoading, resetScanDirectory } = useCameraScanner();
	const [scannedDataVisibleInUi, setScannedDataVisibleInUi] = useState(false);
	const handleScanPress = async () => {
		await handleScan();
		if (scannedData && onScanComplete) {
			onScanComplete(scannedData);
		}
	};

	useEffect(() => {
		if (scannedData) {
			setScannedDataVisibleInUi(true);
			setTimeout(() => {
				setScannedDataVisibleInUi(false);
			}, 2000);
		}
	}, [scannedData]);

	const handleReset = () => {
		Alert.alert('Reset Directory', 'Reset scan directory location?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Reset', style: 'destructive', onPress: resetScanDirectory },
		]);
	};

	return (
		<View className='flex gap-3'>
			<BaseCard className='p-4'>
				{scannedDataVisibleInUi ? (
					<Text className='text-success text-center text-lg font-bold'>✓ Scan Completed</Text>
				) : (
					<TouchableOpacity onPress={handleScanPress} disabled={isLoading}>
						<View className='flex-row items-center justify-center'>
							<MaterialCommunityIcons name={isLoading ? 'loading' : 'camera-outline'} size={24} color='white' className='mr-2' />
							<Text className='text-white text-lg font-semibold'>{isLoading ? 'Scanning...' : 'Scan Document'}</Text>
						</View>
					</TouchableOpacity>
				)}
			</BaseCard>

			<BaseCard className='p-4'>
				<TouchableOpacity onPress={handleReset} className='flex-row items-center justify-center'>
					<MaterialCommunityIcons name='folder-cog-outline' size={20} color={colors.text} className='mr-2' />
					<Text className='text-light-text dark:text-dark-text'>Reset Scan Directory</Text>
				</TouchableOpacity>
			</BaseCard>
			<Text className='text-xs text-center text-light-text dark:text-dark-text opacity-50'>
				*To setup new folder for documents, please reset the directory.
			</Text>
		</View>
	);
};

export default DocumentScanner;
