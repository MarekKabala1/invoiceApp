import InvoiceList from '@/components/InvoiceList';
import { View } from 'react-native';

export default function Invoices() {
	return (
		<View className='flex-1 bg-primaryLight'>
			<InvoiceList />
		</View>
	);
}
