
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import InvoicesList from '@/components/InvocesList';

export default function Index() {
	const router = useRouter();

	return (
		<View className='flex-1 container bg-slate-500'>
			<InvoicesList />
		</View>
	);
}
