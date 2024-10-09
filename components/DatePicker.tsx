import React, { useState } from 'react';
import { Button, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerProps {
	value: Date | null;
	onChange: (date: Date) => void;
	name: string;
}

export default function DatePicker({ value, onChange, name }: DatePickerProps) {
	const [show, setShow] = useState(false);

	const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
		setShow(false);
		if (selectedDate) {
			onChange(selectedDate);
		}
	};

	const showDatepicker = () => {
		setShow(true);
	};

	return (
		<TouchableOpacity onPress={showDatepicker}>
			<View className='flex-row'>
				<Text className='font-bold text-textLight'>{name} </Text>
				<Text className='text-mutedForeground'>{value ? value.toLocaleDateString() : 'Select Date'}</Text>
			</View>
			{show && <DateTimePicker testID='dateTimePicker' value={value || new Date()} mode='date' onChange={handleChange} />}
		</TouchableOpacity>
	);
}
