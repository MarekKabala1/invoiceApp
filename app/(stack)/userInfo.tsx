import React, { useState } from 'react';
import { View, TextInput, Text, Button, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserInfo() {
	const [fullName, setFullName] = useState('');
	const [address, setAddress] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [utrNumber, setUtrNumber] = useState('');
	const [ninNumber, setNinNumber] = useState('');

	const handleSubmit = () => {
		// Handle form submission
		console.log({ fullName, address, email, phoneNumber, utrNumber, ninNumber });
	};

	return (
		<View className=' flex-1 p-4 px-8 bg-primaryLight'>
			<View className='min-w-full justify-start items-center'>
				<Text className='text-lg font-bold text-textLight'>Add Yours Info</Text>
			</View>
			<TextInput className='border rounded-md border-mutedForeground p-2 my-2' placeholder='Full Name' value={fullName} onChangeText={setFullName} />
			<TextInput className='border rounded-md border-mutedForeground  p-2 my-2' placeholder='Address' value={address} onChangeText={setAddress} />
			<TextInput
				className='border rounded-md border-mutedForeground p-2 my-2'
				placeholder='Email Address'
				value={email}
				onChangeText={setEmail}
				keyboardType='email-address'
			/>
			<TextInput
				className='border rounded-md border-mutedForeground p-2 my-2'
				placeholder='Phone Number'
				value={phoneNumber}
				onChangeText={setPhoneNumber}
				keyboardType='phone-pad'
			/>
			<TextInput className='border rounded-md border-mutedForeground p-2 my-2' placeholder='UTR Number ' value={utrNumber} onChangeText={setUtrNumber} />
			<TextInput className='border rounded-md border-mutedForeground p-2 my-2' placeholder='NIN Number ' value={ninNumber} onChangeText={setNinNumber} />
			<TouchableOpacity onPress={handleSubmit} className='p-1 border max-w-fit border-textLight rounded-sm '>
				<Text className='text-textLight text-center text-lg'>Submit</Text>
			</TouchableOpacity>
		</View>
	);
}
