import React, { useState } from 'react';
import { Button, View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { FadeIn } from 'react-native-reanimated';

interface DatePickerProps {
	value: Date | null;
	onChange: (date: Date) => void;
	name: string;
}

export default function DatePicker({ value, onChange, name }: DatePickerProps) {
	const [show, setShow] = useState(false);
	const [iosShow, setIosShow] = useState(true);

	if (iosShow === false) {
		setTimeout(() => {
			setIosShow(true);
		}, 500);
	}

	const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
		setShow(false);
		setIosShow(false);
		if (selectedDate) {
			onChange(selectedDate);
		}
	};

	const showDatepicker = () => {
		setShow(true);
	};

	return (
		<TouchableOpacity onPress={showDatepicker}>
			<View className='flex-row justify-between'>
				<View className='flex-row justify-start items-center'>
					<Text className='font-bold text-textLight'>{name} </Text>
					<Text className='text-mutedForeground'>{Platform.OS === 'ios' && value ? '' : value?.toLocaleDateString()}</Text>
				</View>
				{Platform.OS === 'ios'
					? iosShow && (
							<>
								<Animated.View entering={FadeIn} />
								<DateTimePicker
									testID='dateTimePicker'
									value={value || new Date()}
									mode='date'
									onChange={handleChange}
									display={Platform.OS === 'ios' ? 'compact' : 'default'}
								/>
							</>
						)
					: show && <DateTimePicker testID='dateTimePicker' value={value || new Date()} mode='date' onChange={handleChange} />}
			</View>
		</TouchableOpacity>
	);
}
