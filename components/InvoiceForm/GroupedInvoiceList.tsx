import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import InvoiceCard from './InvoiceCard';
import { GroupedInvoice } from '@/utils/invoiceGrouping';
import { InvoiceType } from '@/db/zodSchema';
import { InvoiceForUpdate } from '@/types';

interface GroupedInvoiceListProps {
	groupedInvoices: GroupedInvoice[];
	onDelete: (invoiceId: string) => void;
	onUpdate: (invoice: InvoiceForUpdate, updateData?: Partial<InvoiceType>) => void;
	onToggleSelection: (invoiceId: string) => void;
	selectedInvoices: string[];
	addInvoiceToBudget: boolean;
}

export default function GroupedInvoiceList({
	groupedInvoices,
	onDelete,
	onUpdate,
	onToggleSelection,
	selectedInvoices,
	addInvoiceToBudget,
}: GroupedInvoiceListProps) {
	const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
	const { colors } = useTheme();

	const toggleGroup = (key: string) => {
		setExpandedGroups((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	console.log(groupedInvoices.length);

	return (
		<View>
			{groupedInvoices.map((group) => {
				const groupKey = `${group.year}-${group.month}`;
				const isExpanded = expandedGroups[groupKey];

				return (
					<View key={groupKey} className=''>
						<TouchableOpacity
							onPress={() => toggleGroup(groupKey)}
							className={`flex-row justify-between items-center p-2  ${isExpanded ? '' : ' border-b border-light-text/20 dark:border-dark-text/20'}`}>
							<Text className='text-light-text dark:text-dark-text font-bold'>
								{group.month} {group.year} ({group.invoices.length})
							</Text>
							<Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.text} />
						</TouchableOpacity>

						{isExpanded && (
							<View className={`${isExpanded ? ' border-b border-light-text/20 dark:border-dark-text/20' : ''}`}>
								{group.invoices.map((invoice) => (
									<View key={invoice.id} className='flex-row items-center'>
										<InvoiceCard
											invoice={invoice}
											onAdd={addInvoiceToBudget}
											workItems={invoice.workItems}
											payments={invoice.payments}
											notes={invoice.notes}
											customer={invoice.customer}
											onDelete={() =>
												Alert.alert('Delete Invoice', 'Are you sure you want to delete this invoice? This action cannot be undone.', [
													{ text: 'Cancel', style: 'cancel' },
													{
														text: 'Delete',
														style: 'destructive',
														onPress: () => onDelete(invoice.id),
													},
												])
											}
											onUpdate={(id, updateData) => onUpdate(invoice, updateData)}
										/>
										{addInvoiceToBudget && (
											<View>
												<TouchableOpacity onPress={() => onToggleSelection(invoice.id)} className='p-2'>
													<Ionicons name={selectedInvoices.includes(invoice.id) ? 'checkbox' : 'square-outline'} size={24} color={colors.text} />
												</TouchableOpacity>
											</View>
										)}
									</View>
								))}
							</View>
						)}
					</View>
				);
			})}
		</View>
	);
}
