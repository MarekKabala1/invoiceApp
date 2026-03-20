import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import DatePicker from './DatePicker';
import { InvoiceForUpdate } from '@/types';

interface InvoiceWithDate extends InvoiceForUpdate {
	selectedDate: string;
}

interface AddToBudgetModalProps {
	isVisible: boolean;
	onClose: () => void;
	onConfirm: (date: string) => void;
	onConfirmMultiple?: (invoicesWithDates: InvoiceWithDate[]) => void;
	selectedCategory: string | null;
	onSelectCategory: (categoryId: string) => void;
	incomeCategories: Array<{ id: string; name: string; emoji: string }>;
	title?: string;
	confirmText?: string;
	initialDate?: string;
	invoices?: InvoiceForUpdate[];
}

const AddToBudgetModal: React.FC<AddToBudgetModalProps> = ({
	isVisible,
	onClose,
	onConfirm,
	onConfirmMultiple,
	selectedCategory,
	onSelectCategory,
	incomeCategories,
	title = 'Select Income Category',
	confirmText = 'Confirm',
	initialDate,
	invoices = [],
}) => {
	const { colors } = useTheme();
	const [selectedDate, setSelectedDate] = useState<Date>(
		initialDate ? new Date(initialDate) : new Date()
	);
	const [invoicesWithDates, setInvoicesWithDates] = useState<InvoiceWithDate[]>(
		invoices.map(inv => ({
			...inv,
			selectedDate: inv.invoiceDate,
		}))
	);

	const isMultipleInvoices = invoices.length > 1;

	const handleConfirm = () => {
		if (isMultipleInvoices && onConfirmMultiple) {
			onConfirmMultiple(invoicesWithDates);
		} else {
			onConfirm(selectedDate.toISOString());
		}
	};

	const handleDateChange = (date: Date) => {
		setSelectedDate(date);
	};

	const handleInvoiceDateChange = (invoiceId: string, date: Date) => {
		setInvoicesWithDates(prev =>
			prev.map(inv =>
				inv.id === invoiceId
					? { ...inv, selectedDate: date.toISOString() }
					: inv
			)
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	return (
		<Modal
			visible={isVisible}
			transparent={true}
			animationType='slide'
			onRequestClose={onClose}>
			<View className='flex-1 justify-center items-center bg-light-text/30 dark:bg-dark-text/30'>
				<View className='bg-light-primary dark:bg-dark-primary p-4 rounded-lg w-11/12 max-h-[90%]'>
					<ScrollView>
						<Text className='text-lg font-bold mb-4 text-center text-light-text dark:text-dark-text'>
							{title}
						</Text>
						
						{isMultipleInvoices ? (
							/* Multiple Invoices - Show date picker for each */
							<View className='mb-4'>
								<Text className='text-sm font-medium mb-2 text-light-text dark:text-dark-text'>
									Confirm or change the date for each invoice:
								</Text>
								{invoicesWithDates.map((invoice, index) => (
									<View key={invoice.id} className='mb-4 p-3 bg-light-nav dark:bg-dark-nav rounded-lg'>
										<Text className='text-sm font-bold mb-1 text-light-text dark:text-dark-text'>
											Invoice #{invoice.id}
										</Text>
										<Text className='text-xs mb-2 text-light-text dark:text-dark-text opacity-70'>
											{invoice.customer?.name || 'Unknown Customer'} - {invoice.currency} {invoice.amountAfterTax?.toFixed(2)}
										</Text>
										<DatePicker
											value={new Date(invoice.selectedDate)}
											onChange={(date) => handleInvoiceDateChange(invoice.id, date)}
											name='Date:'
										/>
									</View>
								))}
							</View>
						) : (
							/* Single Invoice - Show single date picker */
							<View className='mb-4 p-3 bg-light-nav dark:bg-dark-nav rounded-lg'>
								<Text className='text-sm font-medium mb-2 text-light-text dark:text-dark-text'>
									Transaction Date
								</Text>
								<DatePicker
									value={selectedDate}
									onChange={handleDateChange}
									name='Date:'
								/>
								<Text className='text-xs text-light-text dark:text-dark-text opacity-60 mt-1'>
									You can change the date to match when the invoice was paid.
								</Text>
							</View>
						)}

						{/* Category Selection */}
						<Text className='text-sm font-medium mb-2 text-light-text dark:text-dark-text'>
							Income Category
						</Text>
						<View className='flex-row flex-wrap justify-center'>
							{incomeCategories.map((category) => (
								<TouchableOpacity
									key={category.id}
									onPress={() => onSelectCategory(category.id)}
									className={`p-2 m-1 rounded-md ${selectedCategory === category.id ? 'bg-success' : 'bg-muted'}`}>
									<Text
										className={`text-center ${selectedCategory === category.id ? 'text-light-text' : 'text-dark-text'}`}>
										{category.emoji} {category.name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						<View className='flex-row justify-between mt-4'>
							<TouchableOpacity
								onPress={onClose}
								className='bg-danger p-2 rounded-md'>
								<Text className='text-dark-text'>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleConfirm}
								className='bg-success p-2 rounded-md'
								disabled={!selectedCategory}>
								<Text className='text-dark-text'>
									{isMultipleInvoices ? `Add ${invoices.length} Invoices` : confirmText}
								</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

export default AddToBudgetModal;
