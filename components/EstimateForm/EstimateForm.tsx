import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	TextInput,
	ScrollView,
	TouchableOpacity,
	Modal,
	SafeAreaView,
} from 'react-native';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import {
	estimateSchema,
	estimateNotesSchema,
	CustomerType,
	EstimateType,
	EstimateNotesType,
	UserType,
	BankDetailsType,
} from '@/db/zodSchema';
import {
	getCustomers,
	getUsers,
	getCustomerDetails,
	getUserAndBankDetails,
	getLastEstimateId,
	handleSaveEstimate,
	handleSendEstimate,
	handleExportPdfEstimate,
	handlePreviewEstimate,
} from '@/utils/estimateOperations';
import { calculateEstimateTotals } from '@/utils/estimateCalculations';
import { EstimateHeaderSection } from './EstimateHeaderSection';
import { EstimateNotesSection } from './EstimateNotesSection';
import { EstimateTermsSection } from './EstimateTermsSection';
import { EstimateActionButtons } from './EstimateActionButtons';

interface EstimateFormProps {
	isUpdateMode?: boolean;
	estimateData?: EstimateType;
	notes?: Array<{ id: string; noteText: string }>;
}

const EstimateForm: React.FC<EstimateFormProps> = ({
	isUpdateMode = false,
	estimateData,
	notes,
}) => {
	const [lastEstimateId, setLastEstimateId] = useState<string>();
	const [isPreviewVisible, setIsPreviewVisible] = useState(false);
	const [htmlPreview, setHtmlPreview] = useState<string>('');
	const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
		null
	);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [customers, setCustomers] = useState<
		Array<{ label: string; value: string }>
	>([]);
	const [users, setUsers] = useState<Array<{ label: string; value: string }>>(
		[]
	);
	const [bankDetails, setBankDetails] = useState<BankDetailsType | null>(null);
	const [note, setNote] = useState('');
	const [noteItemId, setNoteItemId] = useState<string>('');
	const [calculatedAmountAfterTax, setCalculatedAmountAfterTax] =
		useState<number>(0);
	const [isEnabled, setIsEnabled] = useState(false);

	const toggleSwitch = () => {
		setIsEnabled((previousState) => !previousState);
		setValue('taxValue', !isEnabled);
	};

	const { colors } = useTheme();

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<EstimateType & { notes: EstimateNotesType[] }>({
		resolver: zodResolver(
			estimateSchema.extend({
				notes: z.array(estimateNotesSchema),
			})
		),
		defaultValues: {
			id: '',
			customerId: '',
			userId: '',
			estimateDate: new Date().toISOString(),
			estimateEndTime: new Date().toISOString(),
			currency: 'GBP',
			discount: 0,
			taxRate: 0,
			amountBeforeTax: 0,
			taxValue: false,
			isAccepted: false,
			notes: [],
		},
	});

	const {
		fields: noteFields,
		append: appendNote,
		remove: removeNote,
	} = useFieldArray({
		control,
		name: 'notes',
	});

	useEffect(() => {
		const fetchData = async () => {
			const lastId = await getLastEstimateId();
			setLastEstimateId(lastId);

			const customersData = await getCustomers(
				isUpdateMode,
				estimateData?.customerId
			);
			setCustomers(customersData);

			const usersData = await getUsers(isUpdateMode, estimateData?.userId);
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
				const { userDetails, bankDetails } =
					await getUserAndBankDetails(userId);
				setSelectedUser(userDetails);
				setBankDetails(bankDetails);
			};
			fetchUserAndBankDetails();
		}
	}, [watch('customerId'), watch('userId')]);

	useEffect(() => {
		const amountBeforeTax = watch('amountBeforeTax') || 0;
		const taxRate = watch('taxRate') || 0;
		const discount = watch('discount') || 0;
		const taxValue = watch('taxValue') || false;

		const { total } = calculateEstimateTotals(
			amountBeforeTax,
			taxRate,
			discount,
			taxValue
		);
		setCalculatedAmountAfterTax(total);
	}, [
		watch('amountBeforeTax'),
		watch('taxRate'),
		watch('discount'),
		watch('taxValue'),
	]);

	useEffect(() => {
		if (isUpdateMode && estimateData) {
			setValue('id', String(estimateData.id || ''));
			setValue('customerId', String(estimateData.customerId || ''));
			setValue('userId', String(estimateData.userId || ''));
			setValue(
				'estimateDate',
				String(estimateData.estimateDate || new Date().toISOString())
			);
			setValue(
				'estimateEndTime',
				String(estimateData.estimateEndTime || new Date().toISOString())
			);
			setValue('currency', estimateData.currency || 'GBP');
			setValue('discount', estimateData.discount || 0);
			setValue('taxRate', estimateData.taxRate || 0);
			setValue('amountBeforeTax', estimateData.amountBeforeTax || 0);
			setValue('taxValue', estimateData.taxValue || false);
			setValue('isAccepted', estimateData.isAccepted || false);
			setIsEnabled(estimateData.taxValue || false);

			if (notes) {
				const notesArray = Array.isArray(notes) ? notes : [notes];
				setNote(notesArray.map((n) => n.noteText || '').join('\n'));
				notesArray.forEach((item) => setNoteItemId(item.id));
			}
		}
	}, [isUpdateMode, estimateData]);

	const handleSave = async (
		data: EstimateType & {
			notes: EstimateNotesType[];
		}
	): Promise<void> => {
		try {
			await handleSaveEstimate(data, isUpdateMode, note, noteItemId);
			reset();
			router.navigate('/(tabs)/invoices');
		} catch (error) {
			console.error('Error saving estimate:', error);
		}
	};

	const handleSend = async (
		data: EstimateType & {
			notes: EstimateNotesType[];
		}
	): Promise<void> => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}
		try {
			await handleSendEstimate(
				data,
				selectedUser,
				selectedCustomer,
				bankDetails,
				note
			);
		} catch (error) {
			console.error('Error sending estimate:', error);
		}
	};

	const handleExportPdf = async (
		data: EstimateType & {
			notes: EstimateNotesType[];
		}
	): Promise<void> => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}
		try {
			await handleExportPdfEstimate(
				data,
				selectedUser,
				selectedCustomer,
				bankDetails,
				note,
				false
			);
		} catch (error) {
			console.error('Error exporting estimate PDF:', error);
		}
	};

	const handlePreview = (
		data: EstimateType & {
			notes: EstimateNotesType[];
		}
	): void => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}
		const html = handlePreviewEstimate(
			data,
			selectedUser,
			selectedCustomer,
			bankDetails,
			note,
			true
		);
		setHtmlPreview(html);
		setIsPreviewVisible(true);
	};

	const estimateIdRef = useRef<TextInput>(null);
	const taxRateRef = useRef<TextInput>(null);

	return (
		<ScrollView className='flex-1 p-4 bg-light-primary dark:bg-dark-primary'>
			<SafeAreaView className=' pb-10'>
				{!isUpdateMode && (
					<Text className='text-light-text dark:text-dark-text '>{`Last added estimate number : ${lastEstimateId ? lastEstimateId : 0}`}</Text>
				)}
				<Text className='text-lg text-light-text dark:text-dark-text font-bold mb-4'>
					Estimate Information
				</Text>
				<EstimateHeaderSection
					control={control}
					errors={errors}
					isUpdateMode={isUpdateMode}
					users={users}
					customers={customers}
					setValue={setValue}
					calculatedAmountAfterTax={calculatedAmountAfterTax}
					taxValue={isEnabled}
					toggleTaxValueSwitch={toggleSwitch}
				/>
				<EstimateNotesSection note={note} setNote={setNote} />
				{lastEstimateId && <EstimateTermsSection estimateId={lastEstimateId} />}
				<EstimateActionButtons
					isUpdateMode={isUpdateMode}
					onSave={handleSubmit(handleSave)}
					onSend={handleSubmit(handleSend)}
					onExportPdf={handleSubmit(handleExportPdf)}
					onPreview={handleSubmit(handlePreview)}
				/>
				<Modal visible={isPreviewVisible} animationType='slide'>
					<SafeAreaView className='flex-1 bg-light-primary dark:bg-dark-primary min-h-8'>
						<TouchableOpacity
							onPress={() => setIsPreviewVisible(false)}
							className='flex flex-row  items-center gap-1 p-1'>
							<Ionicons name='arrow-back' size={24} color={colors.text} />
							<Text className='text-xs text-light-text dark:text-dark-text'>
								Create Estimate
							</Text>
						</TouchableOpacity>
						<WebView
							originWhitelist={['*']}
							source={{ html: htmlPreview }}
							className='flex-1 w-dvw'
						/>
					</SafeAreaView>
				</Modal>
			</SafeAreaView>
		</ScrollView>
	);
};

export default EstimateForm;
