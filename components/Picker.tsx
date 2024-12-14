import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, Modal, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/utils/theme';

interface PickerWithTouchableOpacityProps {
	initialValue: string;
	onValueChange: (value: string) => void;
	items: { label: string; value: string }[];
	mode?: 'dropdown' | 'button';
	isRequired?: boolean;
	errorMessage?: string;
	errorState?: boolean;
}

const PickerWithTouchableOpacity: React.FC<PickerWithTouchableOpacityProps> = ({
	items,
	initialValue,
	onValueChange,
	mode = 'dropdown',
	errorState,
	errorMessage,
}) => {
	const [selectedValue, setSelectedValue] = useState<string>(initialValue);
	const [isPickerVisible, setPickerVisible] = useState<boolean>(false);
	const [selectedLabel, setSelectedLabel] = useState<string>();
	// const [isTouched, setIsTouched] = useState(false);

	useEffect(() => {
		setSelectedValue(initialValue);
		const initialItem = items.find((item) => item.value === initialValue);
		if (initialItem) {
			setSelectedLabel(initialItem.label);
		} else if (errorState) {
			setSelectedLabel(errorMessage);
		}
	}, [initialValue, items, errorState]);

	const togglePicker = () => {
		setPickerVisible(!isPickerVisible);
	};

	const pickerItems = [{ label: initialValue, value: '' }, ...items];

	return (
		<View>
			{Platform.OS === 'ios' ? (
				<TouchableOpacity onPress={togglePicker} className='flex-row justify-between items-center border rounded-md border-textLight p-2 h-[33px]'>
					<Text className='text-[12px] text-mutedForeground/50'>{selectedLabel || initialValue}</Text>
					<MaterialCommunityIcons name='chevron-down' size={12} color={'#64748b'} />
				</TouchableOpacity>
			) : (
				<View
					className={
						errorState
							? 'border rounded-md justify-center text-danger  border-danger h-[46px]'
							: 'border rounded-md justify-center text-textLight  border-textLight h-[46px]'
					}>
					<Picker
						mode='dropdown'
						style={errorState ? { color: colors.danger, fontSize: 8 } : { color: colors.textLight, fontSize: 8 }}
						selectedValue={selectedValue}
						onValueChange={(itemValue: string) => {
							setSelectedValue(itemValue);
							onValueChange(itemValue);
							const selectedItem = pickerItems.find((item) => item.value === itemValue);
							if (selectedItem) {
								setSelectedLabel(selectedItem.label);
							}
						}}>
						{pickerItems.map((item) => (
							<Picker.Item style={{ padding: 0 }} key={item.value} label={item.label} value={item.value} />
						))}
					</Picker>
				</View>
			)}

			{Platform.OS === 'ios' && (
				<Modal visible={isPickerVisible} transparent={true} animationType='slide' onRequestClose={togglePicker}>
					<View className='flex-1 justify-center items-center bg-mutedForeground/50'>
						<View className='bg-primaryLight/90  rounded-lg  w-3/4'>
							<Picker
								placeholder={initialValue}
								style={{ textAlign: 'center', fontSize: 12 }}
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
								<Text className='text-textDark text-center'>Close</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			)}
		</View>
	);
};

export default PickerWithTouchableOpacity;
