import InvoiceList from '@/components/InvoiceList';
import { SafeAreaView, View } from 'react-native';

export default function Invoices() {
	return (
		<SafeAreaView className='flex-1 bg-primaryLight'>
			<View className='flex-1 bg-primaryLight'>
				<InvoiceList />
			</View>
		</SafeAreaView>
	);
}
