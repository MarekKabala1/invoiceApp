import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { db } from '@/db/config';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as MailComposer from 'expo-mail-composer';
import * as Print from 'expo-print';
import PickerWithTouchableOpacity from '@/components/Picker';
import { generateId } from '@/utils/generateUuid';
import { Customer, User, Invoice, WorkInformation, Payment, BankDetails, Note } from '@/db/schema';
import {
	invoiceSchema,
	workInformationSchema,
	paymentSchema,
	CustomerType,
	InvoiceType,
	PaymentType,
	UserType,
	WorkInformationType,
	BankDetailsType,
	NoteType,
} from '@/db/zodSchema';
import DatePicker from '@/components/DatePicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { eq } from 'drizzle-orm';
import { generateInvoiceHtml } from '@/templates/invoiceTemplate';
import { color } from '@/utils/theme';
import { useLocalSearchParams } from 'expo-router';
import { generateAndSavePdf } from '@/utils/pdfOperations';
import { calculateInvoiceWorkItemTotals } from '@/utils/invoiceCalculations';
import { sub } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';

interface FormDate {
	date: Date | string;
}

const InvoiceFormPage = () => {
	const [lastInvoiceId, setLastInvoiceId] = useState<string>();
	const [isPreviewVisible, setIsPreviewVisible] = useState(false);
	const [htmlPreview, setHtmlPreview] = useState<string>('');
	const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);
	const [users, setUsers] = useState<{ label: string; value: string }[]>([]);
	const [bankDetails, setBankDetails] = useState<BankDetailsType | null>(null);
	const [isNotesOpen, setIsNotesOpen] = useState(false);
	const [note, setNote] = useState('');
	const [workItemId, setWorkItemId] = useState<string>('');
	const [noteItemId, setNoteItemId] = useState<string>('');
	const { colors } = useTheme();

	const params = useLocalSearchParams();
	const isUpdateMode = params?.mode === 'update';

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

	const getInvoiceForNumber = async () => {
		try {
			const getInvoices = await db.select().from(Invoice);
			if (!getInvoices || getInvoices.length === 0) {
				return 'No Invoices found';
			}

			const sortedData = [...getInvoices].sort((a, b) => {
				const idA = String(a.id);
				const idB = String(b.id);
				return idB.localeCompare(idA);
			});

			const mostRecentId = sortedData[0]?.id;
			if (!mostRecentId) {
				return 'No Invoice found';
			}
			setLastInvoiceId(mostRecentId);
		} catch (error) {
			console.error('Error getting invoices:', error);
			return 'An error occurred while geting invoices';
		}
	};

	const getCustomers = async () => {
		const invoiceUpdateData: InvoiceType = typeof params.invoice === 'string' ? JSON.parse(params.invoice) : params.invoice;

		if (isUpdateMode) {
			// get only the customer associated with the invoice
			const customerData = await db
				.select()
				.from(Customer)
				.where(eq(Customer.id, invoiceUpdateData.customerId as string));

			const formattedCustomerToUpdate = customerData.map((customer) => ({
				label: customer.name || 'Unnamed Customer',
				value: customer.id,
			}));

			setCustomers(formattedCustomerToUpdate);
		} else {
			// get all customers
			const customersFromDb = await db.select().from(Customer);

			const formattedCustomers = customersFromDb.map((customer) => ({
				label: customer.name || 'Unnamed Customer',
				value: customer.id,
			}));

			setCustomers(formattedCustomers);
		}
	};

	const getUsers = async () => {
		const invoiceUpdateData: InvoiceType = typeof params.invoice === 'string' ? JSON.parse(params.invoice) : params.invoice;
		if (isUpdateMode) {
			// get only the user associated with the invoice
			const getUser = await db
				.select()
				.from(User)
				.where(eq(User.id, invoiceUpdateData.userId as string));
			const formattedUserToUpdate = getUser.map((user) => ({
				label: user.fullName || 'Unnamed User',
				value: user.id,
			}));
			setUsers(formattedUserToUpdate);
		} else {
			// get all users
			const usersFromDb = await db.select().from(User);
			const formattedUsers = usersFromDb.map((user) => ({
				label: user.fullName || 'Unnamed User',
				value: user.id,
			}));
			setUsers(formattedUsers);
		}
	};

	useEffect(() => {
		getCustomers();
		getUsers();
		getInvoiceForNumber();
	}, []);

	const calculateTotals = () => {
		const workItems = watch('workItems') as WorkInformationType[];
		const taxRate = watch('taxRate') as number;
		return calculateInvoiceWorkItemTotals(workItems, taxRate);
	};

	useEffect(() => {
		const { subtotal, total, tax } = calculateTotals();
		setValue('amountBeforeTax', subtotal);
		setValue('amountAfterTax', total);
	}, [workFields.length, watch('taxRate')]);

	useEffect(() => {
		const customerId = watch('customerId');
		const userId = watch('userId');
		if (customerId) {
			const getCustomer = async () => {
				const customer = await db.select().from(Customer).where(eq(Customer.id, customerId));
				if (customer.length > 0) {
					setSelectedCustomer({
						name: customer[0].name || 'Unnamed Customer',
						emailAddress: customer[0].emailAddress || '',
						id: customer[0].id,
						address: customer[0].address || '',
						phoneNumber: customer[0].phoneNumber || '',
						createdAt: customer[0].createdAt || '',
					});
				} else {
					setSelectedCustomer(null);
				}
			};
			getCustomer();
		}

		if (userId) {
			const getUserAndBankDetails = async () => {
				const getUser = async () => {
					const user = await db.select().from(User).where(eq(User.id, userId));
					if (user.length > 0) {
						setSelectedUser({
							id: user[0].id,
							fullName: user[0].fullName || 'Unnamed User',
							emailAddress: user[0].emailAddress || '',
							address: user[0].address || '',
							phoneNumber: user[0].phoneNumber || '',
							utrNumber: user[0].utrNumber || '',
							ninNumber: user[0].ninNumber || '',
							createdAt: user[0].createdAt || '',
						});
					} else {
						setSelectedUser(null);
					}
				};

				await getUser();

				const getBankDetails = async () => {
					const bankDetailsForUser = await db.select().from(BankDetails).where(eq(BankDetails.userId, userId));
					if (bankDetailsForUser.length > 0) {
						setBankDetails({
							id: bankDetailsForUser[0].id,
							createdAt: bankDetailsForUser[0].createdAt || '',
							userId: bankDetailsForUser[0].userId || '',
							accountName: bankDetailsForUser[0].accountName || '',
							sortCode: bankDetailsForUser[0].sortCode || '',
							accountNumber: bankDetailsForUser[0].accountNumber || '',
							bankName: bankDetailsForUser[0].bankName || '',
						});
					} else {
						setBankDetails(null);
					}
				};

				await getBankDetails();
			};

			getUserAndBankDetails();
		}
	}, [watch('customerId'), watch('userId')]);

	const getDayOfWeek = (index: number) => {
		const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		return days[index % 7];
	};

	useEffect(() => {
		if (isUpdateMode && params.invoice) {
			const invoiceUpdateData: InvoiceType = typeof params.invoice === 'string' ? JSON.parse(params.invoice) : params.invoice;

			const workItemsData: WorkInformationType[] = (() => {
				if (Array.isArray(params.workItems)) {
					return params.workItems.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
				}
				if (typeof params.workItems === 'string') {
					return JSON.parse(params.workItems);
				}

				return [];
			})();
			workItemsData.map((item) => setWorkItemId(item.id as string));

			const paymentsData: PaymentType[] = (() => {
				if (Array.isArray(params.payments)) {
					return params.payments.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
				}
				if (typeof params.payments === 'string') {
					return JSON.parse(params.payments);
				}
				return [];
			})();

			let notes = [] as NoteType[];
			if (params.notes) {
				if (typeof params.notes === 'string') {
					try {
						notes = JSON.parse(params.notes);
					} catch {
						notes = JSON.parse(`[${params.notes}]`);
					}
				} else if (Array.isArray(params.notes)) {
					notes = params.notes.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
				}
				if (notes.length > 0) {
					setIsNotesOpen(true);
				}
			}
			notes.map((item) => setNoteItemId(item.id as string));

			setNote(Array.isArray(notes) ? notes.map((n) => n.noteText || '').join('\n') : '');

			setValue('id', String(invoiceUpdateData.id || ''));
			setValue('customerId', String(invoiceUpdateData.customerId || ''));
			setValue('userId', String(invoiceUpdateData.userId || ''));
			setValue('invoiceDate', String(invoiceUpdateData.invoiceDate || new Date().toISOString()));
			setValue('dueDate', String(invoiceUpdateData.dueDate || new Date().toISOString()));
			setValue('amountBeforeTax', parseFloat(String(invoiceUpdateData.amountBeforeTax || '0')));
			setValue('amountAfterTax', parseFloat(String(invoiceUpdateData.amountAfterTax || '0')));
			setValue('taxRate', Number(invoiceUpdateData.taxRate));
			setValue('currency', String(invoiceUpdateData.currency || ''));
			setValue('workItems', workItemsData);
			setValue('payments', paymentsData);
		}
	}, [params.mode]);

	const handleSave = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		try {
			const { subtotal, tax, total } = calculateTotals();
			const id = data.id || '';

			const newInvoice = {
				id,
				customerId: data.customerId,
				userId: data.userId,
				invoiceDate: data.invoiceDate,
				dueDate: data.dueDate,
				amountAfterTax: total,
				amountBeforeTax: subtotal,
				taxRate: data.taxRate,
				createdAt: data.invoiceDate,
			};
			if (isUpdateMode) {
				const updatedInvoice = {
					...data,
					taxRate: data.taxRate,
					amountAfterTax: total,
					amountBeforeTax: subtotal,
					invoiceDate: data.invoiceDate,
					dueDate: data.dueDate,
					createdAt: data.invoiceDate,
				};
				await db
					.update(Invoice)
					.set(updatedInvoice)
					.where(eq(Invoice.id, params.invoiceId as string));
			} else {
				await db.insert(Invoice).values(newInvoice);
			}

			//WorkItems
			if (isUpdateMode) {
				const existingWorkItems = await db.select().from(WorkInformation).where(eq(WorkInformation.invoiceId, id));

				const processedWorkItemIds = new Set<string>();

				for (const workItem of data.workItems) {
					// Check if this work item exists
					const matchingExistingItem = existingWorkItems.find((existing) => existing.id === workItem.id);
					const workItemMinusRax = calculateInvoiceWorkItemTotals([workItem], data.taxRate).total;

					if (matchingExistingItem) {
						// Update
						await db
							.update(WorkInformation)
							.set({
								descriptionOfWork: workItem.descriptionOfWork,
								unitPrice: workItem.unitPrice,
								date: workItem.date,
								totalToPayMinusTax: workItemMinusRax,
								createdAt: data.invoiceDate,
							})
							.where(eq(WorkInformation.id, matchingExistingItem.id));

						processedWorkItemIds.add(matchingExistingItem.id);
					} else {
						// Create
						const newWorkId = await generateId();
						await db.insert(WorkInformation).values({
							id: newWorkId,
							invoiceId: id,
							descriptionOfWork: workItem.descriptionOfWork,
							unitPrice: workItem.unitPrice,
							date: workItem.date,
							totalToPayMinusTax: workItemMinusRax,
							createdAt: data.invoiceDate,
						});
					}
				}

				const workItemsToRemove = existingWorkItems.filter((existing) => !processedWorkItemIds.has(existing.id)).map((item) => item.id);

				if (workItemsToRemove.length > 0) {
					await Promise.all(workItemsToRemove.map((itemId) => db.delete(WorkInformation).where(eq(WorkInformation.id, itemId))));
				}
			} else {
				for (const workItem of data.workItems) {
					const workId = await generateId();
					const workItems = {
						id: workId,
						invoiceId: id,
						descriptionOfWork: workItem.descriptionOfWork,
						unitPrice: workItem.unitPrice,
						date: workItem.date,
						totalToPayMinusTax: workItem.unitPrice,
						createdAt: data.invoiceDate,
					};
					await db.insert(WorkInformation).values(workItems);
				}
			}

			// Payments
			if (isUpdateMode) {
				const existingPayments = await db.select().from(Payment).where(eq(Payment.invoiceId, id));
				const processedPaymentIds = new Set<string>();

				for (const payment of data.payments) {
					const matchingExistingItem = existingPayments.find((existing) => existing.id === payment.id);

					if (matchingExistingItem) {
						// Update
						await db
							.update(Payment)
							.set({
								paymentDate: payment.paymentDate,
								amountPaid: payment.amountPaid,
								createdAt: payment.createdAt,
							})
							.where(eq(Payment.id, matchingExistingItem.id));

						processedPaymentIds.add(matchingExistingItem.id);
					} else {
						// Create new payment
						const newPaymentId = await generateId();
						await db.insert(Payment).values({
							id: newPaymentId,
							invoiceId: id,
							paymentDate: payment.paymentDate,
							amountPaid: payment.amountPaid,
							createdAt: new Date().toISOString(),
						});
					}
				}

				const paymentsToRemove = existingPayments.filter((existing) => !processedPaymentIds.has(existing.id)).map((item) => item.id);

				if (paymentsToRemove.length > 0) {
					await Promise.all(paymentsToRemove.map((paymentId) => db.delete(Payment).where(eq(Payment.id, paymentId))));
				}
			} else {
				// Create
				for (const payment of data.payments) {
					const paymentId = await generateId();
					const payments = {
						id: paymentId,
						invoiceId: id,
						paymentDate: payment.paymentDate,
						amountPaid: payment.amountPaid,
						createdAt: new Date().toISOString(),
					};
					await db.insert(Payment).values(payments);
				}
			}

			if (note.trim()) {
				await handleAddNote(id, data);
			}

			reset();
			router.navigate('/(tabs)/invoices');
		} catch (error) {
			console.error('Error saving invoice:', error);
		}
	};

	const handleSend = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		const { subtotal, tax, total } = calculateTotals();
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}

		const html = generateInvoiceHtml({
			data: {
				...data,
				user: selectedUser,
				customer: selectedCustomer,
				bankDetails: bankDetails,
				notes: note,
			},
			tax,
			subtotal,
			total,
		});

		try {
			const { uri } = await Print.printToFileAsync({ html });

			await MailComposer.composeAsync({
				subject: `Invoice ${data.id}`,
				body: 'Please find the attached invoice.',
				attachments: [uri],
			});
		} catch (error) {
			console.error('Error generating or sending PDF:', error);
		}
	};

	const handleExportPdf = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}

		const { subtotal, tax, total } = calculateTotals();

		await generateAndSavePdf({
			data: {
				...data,
				user: selectedUser,
				customer: selectedCustomer,
				bankDetails: bankDetails,
				notes: note,
			},
			tax,
			subtotal,
			total,
		});
	};

	const handlePreview = (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		if (!selectedUser || !selectedCustomer || !bankDetails) {
			console.error('Missing required information.');
			return;
		}

		const { subtotal, tax, total } = calculateTotals();
		const html = generateInvoiceHtml({
			data: {
				...data,
				user: selectedUser,
				customer: selectedCustomer,
				bankDetails: bankDetails,
				notes: note,
			},
			subtotal,
			tax,
			total,
		});
		setHtmlPreview(html);
		setIsPreviewVisible(true);
	};

	const handleAddNote = async (invoiceId: string, data: InvoiceType) => {
		if (note.trim()) {
			if (isUpdateMode && noteItemId) {
				// Update existing note
				await db
					.update(Note)
					.set({
						noteText: note,
						noteDate: data.invoiceDate,
					})
					.where(eq(Note.id, noteItemId));
			} else {
				// Create new note
				const noteId = await generateId();
				const notes = {
					id: noteId,
					invoiceId: invoiceId,
					noteText: note,
					noteDate: data.invoiceDate,
					createdAt: new Date().toISOString(),
				};
				await db.insert(Note).values(notes);
			}
		}
	};
	const handleAddWorkItem = () => {
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
	const handleAddPayment = async () => {
		const newIndex = paymentFields.length;
		appendPayment({
			id: '',
			invoiceId: '',
			paymentDate: new Date().toISOString(),
			amountPaid: 0,
			createdAt: new Date().toISOString(),
		});
	};

	// Add refs for TextInput components
	const invoiceIdRef = useRef<TextInput>(null);
	const taxRateRef = useRef<TextInput>(null);
	const workItemRefs = useRef<(TextInput | null)[]>([]);
	const paymentRefs = useRef<(TextInput | null)[]>([]);

	return (
		<ScrollView className='flex-1 p-4 bg-light-primary dark:bg-dark-primary'>
			<SafeAreaView className=' pb-10'>
				{!isUpdateMode && <Text className='text-light-text dark:text-dark-text '>{`Last added invoice number : ${lastInvoiceId ? lastInvoiceId : 0}`}</Text>}
				<Text className='text-lg text-light-text dark:text-dark-text font-bold mb-4'>Invoice Information</Text>
				<View className='justify-between gap-5 mb-5'>
					<Controller
						control={control}
						name='id'
						render={({ field: { onChange, value } }) => (
							<>
								<TextInput
									ref={invoiceIdRef}
									className={`border  ${errors.id ? 'border-danger' : 'border-light-text dark:border-dark-text'} p-2 rounded-md text-light-text dark:text-dark-text`}
									placeholder='Invoice Number'
									placeholderTextColor={colors.text}
									value={value}
									onChangeText={onChange}
								/>
								{errors.id && <Text className='text-danger text-xs'>{errors.id.message}</Text>}
							</>
						)}
					/>
					{isUpdateMode ? (
						<View className='flex-row item-center'>
							<Text className='text-light-text dark:text-dark-text font-extrabold text-lg'>Name : </Text>
							<Text className='text-light-text dark:text-dark-text opacity-80 font-bold text-lg '>{users.map((user) => user.label).join(', ')}</Text>
						</View>
					) : (
						<Controller
							control={control}
							name='userId'
							render={({ field: { onChange, value } }) => (
								<>
									<PickerWithTouchableOpacity mode='dropdown' items={users} initialValue='Add User' onValueChange={(value) => setValue('userId', value)} />
									{errors.userId && <Text className='text-danger text-xs'>{errors.userId.message}</Text>}
								</>
							)}
						/>
					)}
					{isUpdateMode ? (
						<View className='flex-row item-center'>
							<Text className='text-light-text dark:text-dark-text font-extrabold text-xl'>Customer : </Text>
							<Text className='text-light-text dark:text-dark-text opacity-80 font-bold text-lg '>
								{customers.map((customer) => customer.label).join(', ')}
							</Text>
						</View>
					) : (
						<Controller
							control={control}
							name='customerId'
							render={({ field: { onChange, value } }) => (
								<>
									<PickerWithTouchableOpacity
										mode='dropdown'
										items={customers}
										initialValue='Add Customer'
										onValueChange={(value) => setValue('customerId', value)}
									/>
									{errors.customerId && <Text className='text-danger text-xs'>{errors.customerId.message}</Text>}
								</>
							)}
						/>
					)}

					<Controller
						control={control}
						name='invoiceDate'
						render={({ field: { onChange, value } }) => {
							const dateValue = typeof value === 'string' ? new Date(value) : value;
							return (
								<>
									<DatePicker name='Invoice Date:' value={dateValue} onChange={(date) => onChange(date.toISOString())} />
									{errors.invoiceDate && <Text className='text-danger text-xs'>{errors.invoiceDate.message}</Text>}
								</>
							);
						}}
					/>
					<Controller
						control={control}
						name='dueDate'
						render={({ field: { onChange, value } }) => {
							const dateValue = typeof value === 'string' ? new Date(value) : value;
							return (
								<>
									<DatePicker name='Due Date:' value={dateValue} onChange={(date) => onChange(date.toISOString())} />
									{errors.dueDate && <Text className='text-danger text-xs'>{errors.dueDate.message}</Text>}
								</>
							);
						}}
					/>
					<Controller
						control={control}
						name='taxRate'
						render={({ field: { onChange, value } }) => (
							<>
								<TextInput
									ref={taxRateRef}
									className={`border text-light-text dark:text-dark-text ${errors.taxRate ? 'border-danger' : 'border-light-text dark:border-dark-text'} p-2 rounded-md`}
									placeholder='Tax Rate (%)'
									placeholderTextColor={colors.text}
									value={value === 0 ? '' : value?.toString()}
									onChangeText={(text) => onChange(Number(text))}
									keyboardType='number-pad'
								/>
								{errors.taxRate && <Text className='text-danger text-xs'>{errors.taxRate.message}</Text>}
							</>
						)}
					/>
				</View>
				<Text className='text-lg text-light-text dark:text-dark-text  font-bold mb-2'>Work Items</Text>
				{workFields.map((item, index) => (
					<React.Fragment key={item.id || index}>
						<Controller
							control={control}
							name={`workItems.${index}.date`}
							render={({ field: { value } }) => <Text className='text-sm font-bold mb-2 text-light-text dark:text-dark-text'>{value}</Text>}
						/>
						<View className='flex-row items-center justify-center mb-2 gap-2 flex-1 px-4'>
							<Controller
								control={control}
								name={`workItems.${index}.descriptionOfWork`}
								render={({ field: { onChange, value } }) => (
									<TextInput
										ref={(el) => (workItemRefs.current[index] = el)}
										className='border text-light-text dark:text-dark-text border-light-text dark:border-dark-text p-1 rounded w-3/4'
										multiline={true}
										numberOfLines={2}
										placeholder='Description of Work'
										placeholderTextColor={colors.text}
										value={value}
										onChangeText={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name={`workItems.${index}.unitPrice`}
								render={({ field: { onChange, value } }) => (
									<TextInput
										ref={(el) => (workItemRefs.current[index + workFields.length] = el)}
										className='border text-light-text dark:text-dark-text p-2 rounded min-w-20 border-light-text dark:border-dark-text '
										placeholder='Unit Price'
										placeholderTextColor={colors.text}
										value={value === 0 ? '' : value?.toString()}
										onChangeText={(text) => onChange(Number(text))}
										keyboardType='numeric'
									/>
								)}
							/>
							<TouchableOpacity onPress={() => removeWork(index)}>
								<Ionicons name='trash-outline' color={'red'} size={18} />
							</TouchableOpacity>
						</View>
					</React.Fragment>
				))}

				<TouchableOpacity onPress={handleAddWorkItem} className='flex-row items-center gap-2 mb-2'>
					<Ionicons name={'add-circle-outline'} size={18} color={colors.secondary} />
					<Text className='text-light-secondary dark:text-dark-secondary'>Add Work Item</Text>
				</TouchableOpacity>
				<Text className='text-lg text-light-text dark:text-dark-text  font-bold mb-2'>Payments</Text>
				{paymentFields.map((item, index) => (
					<React.Fragment key={item.id || index}>
						<Controller
							control={control}
							name={`payments.${index}.paymentDate`}
							render={({ field: { value } }) => (
								<Text className='text-sm font-bold mb-2 text-light-text dark:text-dark-text'>{new Date(value).toLocaleDateString()}</Text>
							)}
						/>
						<View className='flex-row items-center  mb-2 gap-2 flex-1 px-4'>
							<Controller
								control={control}
								name={`payments.${index}.amountPaid`}
								render={({ field: { onChange, value } }) => (
									<TextInput
										ref={(el) => (paymentRefs.current[index + paymentFields.length] = el)}
										className='border text-light-text dark:text-dark-text p-2 rounded min-w-20 border-light-text dark:border-dark-text '
										placeholder='Unit Price'
										placeholderTextColor={colors.text}
										value={value === 0 ? '' : value?.toString()}
										onChangeText={(text) => onChange(Number(text))}
										keyboardType='numeric'
									/>
								)}
							/>
							<TouchableOpacity onPress={() => removePayment(index)}>
								<Ionicons name='trash-outline' color={'red'} size={18} />
							</TouchableOpacity>
						</View>
					</React.Fragment>
				))}
				<TouchableOpacity onPress={handleAddPayment} className='flex-row items-center gap-2 mb-2'>
					<Ionicons name={'add-circle-outline'} size={18} color={colors.secondary} />
					<Text className='text-light-secondary dark:text-dark-secondary'>Add Payment</Text>
				</TouchableOpacity>

				<View className='mb-4'>
					<Text className='text-lg text-light-text dark:text-dark-text  font-bold mb-2'>Notes</Text>
					<TouchableOpacity onPress={() => setIsNotesOpen(!isNotesOpen)} className='flex-row items-center gap-2'>
						<Ionicons name={isNotesOpen ? 'remove-circle-outline' : 'add-circle-outline'} size={18} color={colors.secondary} />
						<Text className='text-light-secondary dark:text-dark-secondary'>Add Notes</Text>
					</TouchableOpacity>

					{isNotesOpen && (
						<TextInput
							className='border text-light-text dark:text-dark-text border-light-text dark:border-dark-text p-4 rounded-md mt-2 w-full'
							placeholder='Add notes to this invoice...'
							placeholderTextColor={colors.text}
							multiline={true}
							numberOfLines={5}
							value={note}
							onChangeText={setNote}
							textAlignVertical='top'
						/>
					)}
				</View>
				<View className=' gap-4'>
					<TouchableOpacity onPress={handleSubmit(handleSave)} className=''>
						<Text className='bg-light-secondary text-light-primary text-center p-2 rounded'>{isUpdateMode ? 'Update Invoice' : 'Save Invoice to Db'}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleSubmit(handleSend)} className=''>
						<Text className='bg-success text-light-primary text-center p-2 rounded'>Send Invoice</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleSubmit(handleExportPdf)}>
						<Text className='bg-yellow-600 text-light-primary text-center p-2 rounded'>Export PDF to File</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleSubmit(handlePreview)}>
						<Text className='bg-purple-600 text-light-primary text-center p-2 rounded'>Preview Invoice</Text>
					</TouchableOpacity>
				</View>

				{/* Modal for HTML Preview */}
				<Modal visible={isPreviewVisible} animationType='slide'>
					<View className='flex-1 bg-light-primary pt-10'>
						<TouchableOpacity onPress={() => setIsPreviewVisible(false)} className='items-end p-1'>
							<Ionicons name='close-circle-outline' size={30} color={color.danger} />
						</TouchableOpacity>
						<WebView originWhitelist={['*']} source={{ html: htmlPreview }} className='flex-1 w-full' />
					</View>
				</Modal>
			</SafeAreaView>
		</ScrollView>
	);
};

export default InvoiceFormPage;
