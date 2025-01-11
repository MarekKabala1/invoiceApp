import InvoiceList from '@/components/InvoiceList';
import { SafeAreaView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Invoices() {
	const insets = useSafeAreaInsets();
	return (
		<SafeAreaView className='flex-1 bg-light-primary dark:bg-dark-primary' style={{ paddingTop: insets.top }}>
			<View className='flex-1 bg-light-primary dark:bg-dark-primary'>
				<InvoiceList />
			</View>
		</SafeAreaView>
	);
}
