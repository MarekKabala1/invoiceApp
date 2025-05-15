import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import PickerWithTouchableOpacity from '@/components/Picker';
import DatePicker from '@/components/DatePicker';
import {
	invoiceSchema,
	workInformationSchema,
	paymentSchema,
	CustomerType,
	InvoiceType,
	PaymentType,
	WorkInformationType,
	UserType,
	BankDetailsType,
} from '@/db/zodSchema';
import {
	getInvoiceForNumber,
	getCustomers,
	getUsers,
	getCustomerDetails,
	getUserAndBankDetails,
	handleSaveInvoice,
	handleSendInvoice,
	handleExportPdfInvoice,
	handlePreviewInvoice,
} from '@/utils/invoiceFormOperations';
import { InvoiceHeaderSection } from './InvoiceForm/InvoiceHeaderSection';
import { WorkItemsList } from './InvoiceForm/WorkItemsList';
import { PaymentsList } from './InvoiceForm/PaymentsList';
import { NotesSection } from './InvoiceForm/NotesSection';
import { ActionButtons } from './InvoiceForm/ActionButtons';

interface InvoiceFormProps {
	isUpdateMode?: boolean;
	invoiceData?: InvoiceType;
	workItemsData?: WorkInformationType[];
	paymentsData?: PaymentType[];
	notes?: Array<{ id: string; noteText: string }>;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ isUpdateMode = false, invoiceData, workItemsData, paymentsData, notes }) => {
	const [lastInvoiceId, setLastInvoiceId] = useState<string>();
	const [isPreviewVisible, setIsPreviewVisible] = useState(false);
	const [htmlPreview, setHtmlPreview] = useState<string>('');
	const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [customers, setCustomers] = useState<Array<{ label: string; value: string }>>([]);
	const [users, setUsers] = useState<Array<{ label: string; value: string }>>([]);
	const [bankDetails, setBankDetails] = useState<BankDetailsType | null>(null);
	const [isNotesOpen, setIsNotesOpen] = useState(false);
	const [note, setNote] = useState('');
	const [workItemId, setWorkItemId] = useState<string>('');
	const [noteItemId, setNoteItemId] = useState<string>('');
	const { colors } = useTheme();

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }>({
		resolver: zodResolver(
			invoiceSchema.extend({
				workItems: z.array(workInformationSchema),
				payments: z.array(paymentSchema),
			})
		),
		defaultValues: {
			id: '',
			customerId: '',
			userId: '',
			invoiceDate: new Date().toISOString(),
			dueDate: new Date().toISOString(),
			amountAfterTax: 0,
			amountBeforeTax: 0,
			taxRate: 0,
			pdfPath: '',
			createdAt: new Date().toISOString(),
			workItems: [],
			payments: [],
		},
	});

	const {
		fields: workFields,
		append: appendWork,
		remove: removeWork,
	} = useFieldArray({
		control,
		name: 'workItems',
	});

	const {
		fields: paymentFields,
		append: appendPayment,
		remove: removePayment,
	} = useFieldArray({
		control,
		name: 'payments',
	});

	useEffect(() => {
		const fetchData = async () => {
			const lastId = await getInvoiceForNumber();
			setLastInvoiceId(lastId);

			const customersData = await getCustomers(isUpdateMode, invoiceData?.customerId);
			setCustomers(customersData);

			const usersData = await getUsers(isUpdateMode, invoiceData?.userId);
			setUsers(usersData);
		};

		fetchData();
	}, []);

	useEffect(() => {
		const customerId = watch('customerId');
		const userId = watch('userId');

		if (customerId) {
			const fetchCustomerDetails = async () => {
				const customer = await getCustomerDetails(customerId);
				setSelectedCustomer(customer);
			};
			fetchCustomerDetails();
		}

		if (userId) {
			const fetchUserAndBankDetails = async () => {
				const { userDetails, bankDetails } = await getUserAndBankDetails(userId);
				setSelectedUser(userDetails);
				setBankDetails(bankDetails);
			};
			fetchUserAndBankDetails();
		}
	}, [watch('customerId'), watch('userId')]);

	useEffect(() => {
		if (isUpdateMode && invoiceData) {
			setValue('id', String(invoiceData.id || ''));
			setValue('customerId', String(invoiceData.customerId || ''));
			setValue('userId', String(invoiceData.userId || ''));
			setValue('invoiceDate', String(invoiceData.invoiceDate || new Date().toISOString()));
			setValue('dueDate', String(invoiceData.dueDate || new Date().toISOString()));
			setValue('amountBeforeTax', parseFloat(String(invoiceData.amountBeforeTax || '0')));
			setValue('amountAfterTax', parseFloat(String(invoiceData.amountAfterTax || '0')));
			setValue('taxRate', Number(invoiceData.taxRate));
			setValue('currency', String(invoiceData.currency || ''));
			setValue('workItems', workItemsData || []);
			setValue('payments', paymentsData || []);

			if (workItemsData) {
				workItemsData.forEach((item) => setWorkItemId(item.id));
			}

			if (notes) {
				const notesArray = Array.isArray(notes) ? notes : [notes];
				setNote(notesArray.map((n) => n.noteText || '').join('\n'));
				setIsNotesOpen(true);
				notesArray.forEach((item) => setNoteItemId(item.id));
			}
		}
	}, [isUpdateMode, invoiceData]);

	const getDayOfWeek = (index: number): string => {
		const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		return days[index % 7];
	};

	const handleSave = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }): Promise<void> => {
		await handleSaveInvoice(data, isUpdateMode, note, noteItemId);
		reset();
		router.navigate('/(tabs)/invoices');
	};

	const handleSend = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }): Promise<void> => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}
		await handleSendInvoice(data, selectedUser, selectedCustomer, bankDetails, note);
	};

	const handleExportPdf = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }): Promise<void> => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}
		await handleExportPdfInvoice(data, selectedUser, selectedCustomer, bankDetails, note);
	};

	const handlePreview = (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }): void => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}
		const html = handlePreviewInvoice(data, selectedUser, selectedCustomer, bankDetails, note);
		setHtmlPreview(html);
		setIsPreviewVisible(true);
	};

	const handleAddWorkItem = (): void => {
		const newIndex = workFields.length;
		const dayOfWeek = getDayOfWeek(newIndex);
		appendWork({
			id: '',
			descriptionOfWork: '',
			unitPrice: 0,
			date: dayOfWeek,
			invoiceId: '',
			totalToPayMinusTax: 0,
		});
	};

	const handleAddPayment = (): void => {
		appendPayment({
			id: '',
			invoiceId: '',
			paymentDate: '',
			amountPaid: 0,
			createdAt: new Date().toISOString(),
		});
	};

	const invoiceIdRef = useRef<TextInput>(null);
	const taxRateRef = useRef<TextInput>(null);
	const workItemRefs = useRef<(TextInput | null)[]>([]);
	const paymentRefs = useRef<(TextInput | null)[]>([]);

	return (
		<ScrollView className='flex-1 p-4 bg-light-primary dark:bg-dark-primary'>
			<SafeAreaView className=' pb-10'>
				{!isUpdateMode && <Text className='text-light-text dark:text-dark-text '>{`Last added invoice number : ${lastInvoiceId ? lastInvoiceId : 0}`}</Text>}
				<Text className='text-lg text-light-text dark:text-dark-text font-bold mb-4'>Invoice Information</Text>
				<InvoiceHeaderSection control={control} errors={errors} isUpdateMode={isUpdateMode} users={users} customers={customers} setValue={setValue} />
				<WorkItemsList control={control} errors={errors} workFields={workFields} appendWork={appendWork} removeWork={removeWork} workItemRefs={workItemRefs} />
				<PaymentsList
					control={control}
					errors={errors}
					paymentFields={paymentFields}
					appendPayment={appendPayment}
					removePayment={removePayment}
					paymentRefs={paymentRefs}
				/>
				<NotesSection isNotesOpen={isNotesOpen} setIsNotesOpen={setIsNotesOpen} note={note} setNote={setNote} />
				<ActionButtons
					isUpdateMode={isUpdateMode}
					onSave={handleSubmit(handleSave)}
					onSend={handleSubmit(handleSend)}
					onExportPdf={handleSubmit(handleExportPdf)}
					onPreview={handleSubmit(handlePreview)}
				/>
				<Modal visible={isPreviewVisible} animationType='slide'>
					<View className='flex-1 bg-light-primary dark:bg-dark-primary min-h-8'>
						<TouchableOpacity onPress={() => setIsPreviewVisible(false)} className='flex flex-row  items-center gap-1 p-1'>
							<Ionicons name='arrow-back' size={24} color={colors.text} />
							<Text className='text-xs text-light-text dark:text-dark-text'>Create Invoice</Text>
						</TouchableOpacity>
						<WebView originWhitelist={['*']} source={{ html: htmlPreview }} className='flex-1 w-full' />
					</View>
				</Modal>
			</SafeAreaView>
		</ScrollView>
	);
};

export default InvoiceForm;
