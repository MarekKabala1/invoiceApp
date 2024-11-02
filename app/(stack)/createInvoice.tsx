import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import * as Print from 'expo-print';
import { useInvoice } from '@/context/InvoiceContext';
import PickerWithTouchableOpacity from '@/components/Picker';
import { db } from '@/db/config';
import { generateId } from '@/utils/generateUuid';
import { Customer, User, Invoice, WorkInformation, Payment } from '@/db/schema';
import { invoiceSchema, workInformationSchema, paymentSchema, CustomerType, InvoiceType, PaymentType, UserType, WorkInformationType } from '@/db/zodSchema';
import DatePicker from '@/components/DatePicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { eq } from 'drizzle-orm';

interface FormDate {
	date: Date | string;
}

const InvoiceFormPage = () => {
	const { addInvoice } = useInvoice();
	const [lastInvoiceId, setLastInvoiceId] = useState<string>();
	const [isPreviewVisible, setIsPreviewVisible] = useState(false);
	const [htmlPreview, setHtmlPreview] = useState<string>('');
	const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
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
	const fetchInvoiceForNumber = async () => {
		try {
			const fetchedInvoices = await db.select().from(Invoice);
			if (!fetchedInvoices || fetchedInvoices.length === 0) {
				return 'No Invoices found';
			}

			const sortedData = [...fetchedInvoices].sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

			const mostRecentId = sortedData[0]?.id;
			if (!mostRecentId) {
				return 'No Invoice found';
			}
			setLastInvoiceId(mostRecentId);
		} catch (error) {
			console.error('Error fetching invoices:', error);
			return 'An error occurred while fetching invoices';
		}
	};

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

	const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);
	const [users, setUsers] = useState<{ label: string; value: string }[]>([]);

	useEffect(() => {
		const fetchCustomers = async () => {
			const customersFromDb = await db.select().from(Customer);
			const formattedCustomers = customersFromDb.map((customer) => ({
				label: customer.name || 'Unnamed Customer',
				value: customer.id,
			}));
			setCustomers(formattedCustomers);
		};

		const fetchUsers = async () => {
			const usersFromDb = await db.select().from(User);
			const formattedUsers = usersFromDb.map((user) => ({
				label: user.fullName || 'Unnamed User',
				value: user.id,
			}));
			setUsers(formattedUsers);
		};

		fetchCustomers();
		fetchUsers();
		fetchInvoiceForNumber();
	}, []);

	const calculateTotals = () => {
		const workItems = watch('workItems') as { unitPrice: number }[];
		const taxRate = watch('taxRate') as number;

		const subtotal = workItems.reduce((sum, item) => {
			const price = parseFloat(item.unitPrice.toString()) || 0;
			return sum + price;
		}, 0);

		const tax = subtotal * (taxRate / 100);
		const total = subtotal - tax;

		return { subtotal, tax, total };
	};

	useEffect(() => {
		const { subtotal, total } = calculateTotals();
		setValue('amountBeforeTax', subtotal);
		setValue('amountAfterTax', total);
	}, [workFields.length, watch('taxRate')]);
	useEffect(() => {
		const customerId = watch('customerId');
		const userId = watch('userId');

		if (customerId) {
			const fetchCustomer = async () => {
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
			fetchCustomer();
		}

		if (userId) {
			const fetchUser = async () => {
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
			fetchUser();
		}
	}, [watch('customerId'), watch('userId')]);

	const getDayOfWeek = (index: number) => {
		const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		return days[index % 7];
	};

	const generateHtml = (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[]; user: UserType; customer: CustomerType }) => {
		const customFormat = (date: Date) => {
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear();
			return `${day}/${month}/${year}`;
		};
		const { subtotal, tax, total } = calculateTotals();
		return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script src="https://cdn.tailwindcss.com"></script>
				<script>
					tailwind.config = {
						theme: {
							extend: {
								colors: {
									primary: '#0F172A',
									primaryLight: '#1E293B',
									secondary: '#38BDF8',
									accent: '#F59E0B',
									textLight: '#F8FAFC',
									textDark: '#0F172A',
									danger: '#EF4444',
									mutedForeground: '#64748B',
								}
							}
						}
					}
				</script>
			</head>
			<body class="bg-primaryLight font-sans text-textLight">
				<div class="max-w-4xl mx-auto p-8 bg-primary shadow-lg rounded-lg mt-10">
					<div class="mb-8 border-b border-secondary pb-4">
						<h1 class="text-3xl font-bold text-secondary">Invoice #${data.id}</h1>
						<p class="text-textLight">Created: ${customFormat(new Date(data.invoiceDate))}</p>
						<p class="text-textLight">Due: ${customFormat(new Date(data.dueDate))}</p>
					</div>

					<div class="grid grid-cols-2 gap-8 mb-8">
						<div>
							<h2 class="text-xl font-semibold mb-2 text-accent">From:</h2>
							<p>${data.user.fullName}</p>
							<p>UTR: ${data.user.utrNumber}</p>
							<p>NIN: ${data.user.ninNumber}</p>
							<p>${data.user.emailAddress}</p>
							<p>${data.user.phoneNumber}</p>
						</div>
						<div>
							<h2 class="text-xl font-semibold mb-2 text-accent">To:</h2>
							<p>${data.customer.name}</p>
							<p>${data.customer.emailAddress}</p>
							<p>${data.customer.phoneNumber}</p>
						</div>
					</div>

					<table class="w-full mb-8">
						<thead>
							<tr class="bg-primaryLight">
								<th class="text-left p-2">Item</th>
								<th class="text-right p-2">Price</th>
							</tr>
						</thead>
						<tbody >
							${data.workItems
								.map(
									(item, index) => `
								<tr key=${index}  >
									<td class="p-2">${item.date}</td>
									<tr class="border-b border-mutedForeground">
									<td class="p-2">${item.descriptionOfWork}</td>
									<td class="text-right p-2">$${item.unitPrice.toFixed(2)}</td>
									</tr>
								</tr>
							`
								)
								.join('')}
						</tbody>
						<tfoot>
							<tr class="font-bold">
								<td class="p-2">Subtotal:</td>
								<td class="text-right p-2">$${subtotal.toFixed(2)}</td>
							</tr>
							<tr class="font-bold">
								<td class="p-2">Tax (${data.taxRate}%):</td>
								<td class="text-right p-2">$${tax.toFixed(2)}</td>
							</tr>
							<tr class="font-bold text-lg">
								<td class="p-2">Total:</td>
								<td class="text-right p-2">$${total.toFixed(2)}</td>
							</tr>
						</tfoot>
					</table>

					<h2 class="text-xl font-semibold mb-2 text-accent">Payments</h2>
					<table class="w-full">
						<thead>
							<tr class="bg-primaryLight">
								<th class="text-left p-2">Date</th>
								<th class="text-right p-2">Amount</th>
							</tr>
						</thead>
						<tbody>
							${data.payments
								.map(
									(payment) => `
								<tr class="border-b border-mutedForeground">
									<td class="p-2">${payment.paymentDate}</td>
									<td class="text-right p-2">$${payment.amountPaid.toFixed(2)}</td>
								</tr>
							`
								)
								.join('')}
						</tbody>
					</table>
				</div>
			</body>
			</html>
		`;
	};

	const handleSave = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		try {
			const { subtotal, total } = calculateTotals();
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
				createdAt: new Date().toISOString(),
			};

			await db.insert(Invoice).values(newInvoice);

			for (const workItem of data.workItems) {
				const workId = await generateId();
				await db.insert(WorkInformation).values({
					id: workId,
					invoiceId: id,
					descriptionOfWork: workItem.descriptionOfWork,
					unitPrice: workItem.unitPrice,
					date: workItem.date,
					totalToPayMinusTax: workItem.unitPrice,
					createdAt: new Date().toISOString(),
				});
			}

			for (const payment of data.payments) {
				const paymentId = await generateId();
				await db.insert(Payment).values({
					id: paymentId,
					invoiceId: id,
					paymentDate: payment.paymentDate,
					amountPaid: payment.amountPaid,
					createdAt: new Date().toISOString(),
				});
			}
			reset();
			router.navigate('/(tabs)/invoices');
		} catch (error) {
			console.error('Error saving invoice:', error);
		}
	};

	const handleSend = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		if (!selectedUser || !selectedCustomer) {
			console.error('User or customer information is missing.');
			return;
		}

		const html = generateHtml({ ...data, user: selectedUser, customer: selectedCustomer });

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
		if (!selectedUser || !selectedCustomer) {
			console.error('User or customer information is missing.');
			return;
		}
		const html = generateHtml({ ...data, user: selectedUser, customer: selectedCustomer });
		const filename = `Invoice_${data.id}_${new Date().toISOString().split('T')[0]}.pdf`;

		try {
			const { uri } = await Print.printToFileAsync({ html });

			const pdfPath = `${FileSystem.cacheDirectory}${filename}`;

			await FileSystem.copyAsync({
				from: uri,
				to: pdfPath,
			});

			// console.log('File saved successfully to:', pdfPath);

			const isSharingAvailable = await Sharing.isAvailableAsync();

			if (isSharingAvailable) {
				await Sharing.shareAsync(pdfPath, {
					mimeType: 'application/pdf',
					dialogTitle: 'Share Invoice PDF',
					UTI: 'com.adobe.pdf',
				});
			} else {
				console.error('Sharing is not available on this device');
			}

			await FileSystem.deleteAsync(uri, { idempotent: true });
			await FileSystem.deleteAsync(pdfPath, { idempotent: true });
		} catch (error) {
			console.error('Error generating or exporting PDF:', error);
		}
	};

	const handlePreview = (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		if (!selectedUser) {
			console.error('User information is missing.');
			return;
		}
		if (!selectedCustomer) {
			console.error('User information is missing.');
			return;
		}
		const html = generateHtml({ ...data, user: selectedUser, customer: selectedCustomer });
		setHtmlPreview(html);
		setIsPreviewVisible(true);
	};

	const handleAddWorkItem = () => {
		const newIndex = workFields.length;
		const dayOfWeek = getDayOfWeek(newIndex);
		appendWork({
			descriptionOfWork: '',
			unitPrice: 0,
			date: dayOfWeek,
			invoiceId: '',
			totalToPayMinusTax: 0,
		});
	};

	// Add refs for TextInput components
	const invoiceIdRef = useRef<TextInput>(null);
	const taxRateRef = useRef<TextInput>(null);
	const workItemRefs = useRef<(TextInput | null)[]>([]);
	const paymentRefs = useRef<(TextInput | null)[]>([]);

	return (
		<ScrollView className='flex-1 p-4 bg-primaryLight'>
			<SafeAreaView className=' pb-10'>
				<Text className='text-textLight'>{`Last added invoice number : ${lastInvoiceId ? lastInvoiceId : 0}`}</Text>
				<Text className='text-lg text-textLight font-bold mb-4'>Invoice Information</Text>
				<View className='justify-between gap-5 mb-5'>
					<Controller
						control={control}
						name='id'
						render={({ field: { onChange, value } }) => (
							<>
								<TextInput
									ref={invoiceIdRef}
									className={`border ${errors.id ? 'border-danger' : 'border-mutedForeground'} p-2 rounded-md`}
									placeholder='Invoice Number'
									value={value}
									onChangeText={onChange}
								/>
								{errors.id && <Text className='text-danger text-xs'>{errors.id.message}</Text>}
							</>
						)}
					/>
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
									className={`border ${errors.taxRate ? 'border-danger' : 'border-mutedForeground'} p-2 rounded-md`}
									placeholder='Tax Rate (%)'
									value={value === 0 ? '' : value?.toString()}
									onChangeText={(text) => onChange(Number(text))}
									keyboardType='number-pad'
								/>
								{errors.taxRate && <Text className='text-danger text-xs'>{errors.taxRate.message}</Text>}
							</>
						)}
					/>
				</View>
				<Text className='text-lg text-textLight  font-bold mb-2'>Work Items</Text>
				{workFields.map((item, index) => (
					<React.Fragment key={item.id || index}>
						<Controller
							control={control}
							name={`workItems.${index}.date`}
							render={({ field: { value } }) => <Text className='text-sm font-bold mb-2 text-textLight'>{value}</Text>}
						/>
						<View className='flex-row items-center justify-center mb-2 gap-2 flex-1 px-4'>
							<Controller
								control={control}
								name={`workItems.${index}.descriptionOfWork`}
								render={({ field: { onChange, value } }) => (
									<TextInput
										ref={(el) => (workItemRefs.current[index] = el)}
										className='border border-mutedForeground p-2 rounded w-3/4'
										multiline={true}
										numberOfLines={2}
										placeholder='Description of Work'
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
										className='border p-2 rounded min-w-20 border-mutedForeground'
										placeholder='Unit Price'
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

				<TouchableOpacity onPress={handleAddWorkItem}>
					<Text className='text-blue-600 mb-4'>Add Work Item</Text>
				</TouchableOpacity>
				<Text className='text-lg text-textLight font-bold mb-2'>Payments</Text>
				{paymentFields.map((item, index) => (
					<View key={item.id} className='flex-row items-center mb-2'>
						<Controller
							control={control}
							name={`payments.${index}.paymentDate`}
							render={({ field: { onChange, value } }) => (
								<TextInput
									ref={(el) => (paymentRefs.current[index * 2] = el)}
									className='border p-2 rounded mb-2 flex-1 mr-2'
									placeholder='Payment Date'
									value={value}
									onChangeText={onChange}
								/>
							)}
						/>
						<Controller
							control={control}
							name={`payments.${index}.amountPaid`}
							render={({ field: { onChange, value } }) => (
								<TextInput
									ref={(el) => (paymentRefs.current[index * 2 + 1] = el)}
									className='border p-2 rounded mb-2 flex-1'
									placeholder='Amount Paid'
									value={value?.toString()}
									onChangeText={(text) => onChange(Number(text))}
									keyboardType='numeric'
								/>
							)}
						/>
						<TouchableOpacity onPress={() => removePayment(index)}>
							<Text className='text-red-600'>Remove</Text>
						</TouchableOpacity>
					</View>
				))}
				<TouchableOpacity onPress={() => appendPayment({ invoiceId: '', paymentDate: '', amountPaid: 0 })}>
					<Text className='text-blue-600 mb-4'>Add Payment</Text>
				</TouchableOpacity>
				<View className=' gap-4'>
					<TouchableOpacity onPress={handleSubmit(handleSave)} className=''>
						<Text className='bg-secondaryLight text-white text-center p-2 rounded'>Save Invoice to Db</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleSubmit(handleSend)} className=''>
						<Text className='bg-success text-white text-center p-2 rounded'>Send Invoice</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleSubmit(handleExportPdf)}>
						<Text className='bg-yellow-600 text-white text-center p-2 rounded'>Export PDF</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleSubmit(handlePreview)}>
						<Text className='bg-purple-600 text-white text-center p-2 rounded'>Preview Invoice</Text>
					</TouchableOpacity>
				</View>

				{/* Modal for HTML Preview */}
				<Modal visible={isPreviewVisible} animationType='slide'>
					<View className='flex-1 pt-10'>
						<TouchableOpacity onPress={() => setIsPreviewVisible(false)} className='p-3'>
							<Text className='text-danger'>Close Preview</Text>
						</TouchableOpacity>
						<WebView originWhitelist={['*']} source={{ html: htmlPreview }} className='flex-1' />
					</View>
				</Modal>
			</SafeAreaView>
		</ScrollView>
	);
};

export default InvoiceFormPage;
