import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, Modal } from 'react-native';
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
	const [selectedLabel, setSelectedLabel] = useState<string>('');

	useEffect(() => {
		setSelectedValue(initialValue);
		const initialItem = items.find((item) => item.value === initialValue);
		if (initialItem) {
			setSelectedLabel(initialItem.label);
		}
	}, [initialValue]);

	// Function to toggle picker visibility
	const togglePicker = () => {
		setPickerVisible(!isPickerVisible);
	};

	return (
		<View>
			{/* TouchableOpacity to show the currently selected value */}
			<TouchableOpacity onPress={togglePicker} className=' flex-row justify-between items-center border rounded-md border-mutedForeground p-2 my-2'>
				<Text className='text-sm text-mutedForeground'>{selectedLabel || 'Select an option'}</Text>
				<MaterialCommunityIcons name='chevron-down' size={18} color={'#64748b'} />
			</TouchableOpacity>

			{/* Modal to show the picker when the TouchableOpacity is pressed */}
			<Modal visible={isPickerVisible} transparent={true} animationType='slide' onRequestClose={togglePicker}>
				<View className='flex-1 justify-center '>
					<View className='bg-primaryLight rounded-lg m-5 p-5 justify-center'>
						<Picker
							selectedValue={selectedValue}
							onValueChange={(itemValue) => {
								setSelectedValue(itemValue);
								onValueChange(itemValue);
								togglePicker(); // Close the picker once a value is selected
							}}>
							{items.map((item) => (
								<Picker.Item key={item.value} label={item.label} value={item.value} />
							))}
						</Picker>

						{/* Close button */}
						<TouchableOpacity onPress={togglePicker} className='mt-4 p-2 bg-blue-600 rounded'>
							<Text className='text-white text-center'>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default PickerWithTouchableOpacity;
