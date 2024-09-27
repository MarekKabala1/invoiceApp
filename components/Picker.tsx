import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, Modal, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PickerWithTouchableOpacityProps {
	initialValue: string;
	onValueChange: (value: string) => void;
	items: { label: string; value: string }[];
}

const PickerWithTouchableOpacity: React.FC<PickerWithTouchableOpacityProps> = ({ items, initialValue, onValueChange }) => {
	const [selectedValue, setSelectedValue] = useState<string>(initialValue);
	const [isPickerVisible, setPickerVisible] = useState<boolean>(false);
	const [selectedLabel, setSelectedLabel] = useState<string>('Select User');

	useEffect(() => {
		setSelectedValue(initialValue);
		const initialItem = items.find((item) => item.value === initialValue);
		if (initialItem) {
			setSelectedLabel(initialItem.label);
		}
	}, [initialValue, items]);

	const togglePicker = () => {
		setPickerVisible(!isPickerVisible);
	};

	const pickerItems = [{ label: 'Select User', value: '' }, ...items];

	return (
		<View>
			{Platform.OS === 'ios' ? (
				<TouchableOpacity onPress={togglePicker} className='flex-row justify-between items-center border rounded-md border-mutedForeground p-2 my-2'>
					<Text className='text-sm text-mutedForeground'>{selectedLabel || 'Select User'}</Text>
					<MaterialCommunityIcons name='chevron-down' size={18} color={'#64748b'} />
				</TouchableOpacity>
			) : (
				<View className='border rounded-md border-mutedForeground'>
					<Picker
						selectedValue={selectedValue}
						onValueChange={(itemValue) => {
							setSelectedValue(itemValue);
							onValueChange(itemValue);
							const selectedItem = pickerItems.find((item) => item.value === itemValue);
							if (selectedItem) {
								setSelectedLabel(selectedItem.label);
							}
						}}>
						{pickerItems.map((item) => (
							<Picker.Item key={item.value} label={item.label} value={item.value} />
						))}
					</Picker>
				</View>
			)}

			{Platform.OS === 'ios' && (
				<Modal visible={isPickerVisible} transparent={true} animationType='slide' onRequestClose={togglePicker}>
					<View className='flex-1 justify-center'>
						<View className='bg-primaryLight rounded-lg m-5 p-5 justify-center'>
							<Picker
								selectedValue={selectedValue}
								onValueChange={(itemValue) => {
									setSelectedValue(itemValue);
									onValueChange(itemValue);
									const selectedItem = pickerItems.find((item) => item.value === itemValue);
									if (selectedItem) {
										setSelectedLabel(selectedItem.label);
									}
									togglePicker();
								}}>
								{pickerItems.map((item) => (
									<Picker.Item key={item.value} label={item.label} value={item.value} />
								))}
							</Picker>

							<TouchableOpacity onPress={togglePicker} className='mt-4 p-2 bg-blue-600 rounded'>
								<Text className='text-white text-center'>Close</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			)}
		</View>
	);
};

export default PickerWithTouchableOpacity;
