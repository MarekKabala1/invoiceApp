import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomerType, InvoiceType } from '@/db/zodSchema';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';
import { useEffect, useState } from 'react';

export default function InvoiceSettingsModal({
	showSettings,
	setShowSettings,
	invoice,
	customer,
	onUpdate,
}: {
	showSettings: boolean;
	setShowSettings: (show: boolean) => void;
	invoice: InvoiceType;
	customer: CustomerType | undefined;
	onUpdate: (id: string, updateData?: Partial<InvoiceType>) => void;
}) {
	const [localInvoice, setLocalInvoice] = useState(invoice);
	const { colors } = useTheme();

	const isPayed = localInvoice.isPayed;

	useEffect(() => {
		setLocalInvoice(invoice);
	}, [invoice.id]);

	const handleMarkAsPayed = async () => {
		const newPayedStatus = !isPayed;
		setLocalInvoice((prev) => ({ ...prev, isPayed: newPayedStatus }));

		try {
			onUpdate(invoice.id, { isPayed: newPayedStatus });
		} catch (error) {
			setLocalInvoice((prev) => ({ ...prev, isPayed: !newPayedStatus }));
		}
	};

	const handleEditInvoice = () => {
		onUpdate(invoice.id);
	};

	return (
		<Modal visible={showSettings} animationType='slide' transparent={true} onRequestClose={() => setShowSettings(false)}>
			<View className='flex-1 justify-end  bg-light-text/30 dark:bg-dark-text/30'>
				<View className='bg-light-primary dark:bg-dark-primary w-full h-[70%] rounded-t-lg p-6'>
					<View className='flex-row w-full items-center justify-between mb-8 '>
						<View>
							<Text className='text-lg font-bold text-light-text dark:text-dark-text'>
								Invoice # {localInvoice.id} to {customer?.name}
							</Text>
						</View>
						<TouchableOpacity onPress={() => setShowSettings(false)}>
							<MaterialCommunityIcons name='close' size={20} color={colors.text} />
						</TouchableOpacity>
					</View>
					<View className=' w-full gap-2 items-center justify-center'>
						<View className='flex-row w-full  items-center justify-between'>
							<Text className='text-sm text-light-text dark:text-dark-text'>To Be Paid</Text>
							{isPayed ? (
								<Text className='text-sm text-success dark:text-success'>
									{getCurrencySymbol(localInvoice.currency)}
									{localInvoice.amountAfterTax}
								</Text>
							) : (
								<Text className='text-sm text-danger dark:text-danger'>
									{getCurrencySymbol(localInvoice.currency)}
									{localInvoice.amountAfterTax}
								</Text>
							)}
						</View>
						<View className='flex-row w-full  items-center justify-between'>
							<Text className='text-sm text-light-text dark:text-dark-text'>Invoice Due Date</Text>
							<Text className='text-sm text-light-text dark:text-dark-text'>{new Date(localInvoice.dueDate).toLocaleDateString()}</Text>
						</View>
						<View className='flex-row w-full  items-center justify-between'>
							<Text className='text-sm text-light-text dark:text-dark-text'>Invoice Status</Text>
							{isPayed ? (
								<Text className='text-sm font-bold text-success dark:text-success'>Payed</Text>
							) : (
								<Text className='text-sm font-bold text-danger dark:text-danger'>Overdue</Text>
							)}
						</View>
						<View className='flex-row w-full  items-center justify-between'>
							<Text className='text-sm text-light-text dark:text-dark-text'>Mark as payed</Text>
							<View className='flex-row items-center justify-center'>
								{isPayed ? (
									<TouchableOpacity onPress={handleMarkAsPayed}>
										<MaterialCommunityIcons name='checkbox-marked-outline' size={24} color={colors.text} />
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={handleMarkAsPayed}>
										<MaterialCommunityIcons name='checkbox-blank-outline' size={24} color={colors.text} />
									</TouchableOpacity>
								)}
							</View>
						</View>
						<View className='flex-row w-full  items-center justify-between'>
							<Text className='text-sm text-light-text dark:text-dark-text'>Edit Invoice</Text>
							<TouchableOpacity onPress={handleEditInvoice} className=' rounded-md p-1'>
								<MaterialCommunityIcons name='pencil' size={20} color={colors.text} />
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
}
