import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { useInvoice } from '@/context/InvoiceContext';
import PickerWithTouchableOpacity from '@/components/Picker';
import { db } from '@/db/config';
import { generateId } from '@/utils/generateUuid';
import { Customer, User, Invoice, WorkInformation, Payment } from '@/db/schema';
import { invoiceSchema, workInformationSchema, paymentSchema } from '@/db/zodSchema';

type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;
type PaymentType = z.infer<typeof paymentSchema>;

const InvoiceFormPage = () => {
	const { addInvoice } = useInvoice();
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
			invoiceDate: new Date().toISOString().split('T')[0],
			dueDate: '',
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
	}, []);

	const calculateTotals = () => {
		const workItems = watch('workItems');
		const subtotal = workItems.reduce((sum, item) => sum + item.unitPrice * (item.date ? 1 : 0), 0);
		const taxRate = watch('taxRate');
		const tax = subtotal * (taxRate / 100);
		const total = subtotal - tax;
		return { subtotal, tax, total };
	};

	useEffect(() => {
		const { subtotal, total } = calculateTotals();
		setValue('amountBeforeTax', subtotal);
		setValue('amountAfterTax', total);
	}, [watch('workItems'), watch('taxRate')]);

	const generateHtml = (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		const { subtotal, tax, total } = calculateTotals();
		return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(2) { text-align: right; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table cellpadding="0" cellspacing="0">
              <tr class="top">
                <td colspan="2">
                  <table>
                    <tr>
                      <td>
                        Invoice #: ${data.id}<br>
                        Created: ${data.invoiceDate}<br>
                        Due: ${data.dueDate}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="information">
                <td colspan="2">
                  <table>
                    <tr>
                      <td>Customer ID: ${data.customerId}</td>
                      <td>User ID: ${data.userId}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="heading"><td>Item</td><td>Price</td></tr>
              ${data.workItems
								.map(
									(item) => `
                <tr class="item">
                  <td>${item.descriptionOfWork} (${item.date})</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                </tr>
              `
								)
								.join('')}
              <tr class="total"><td></td><td>Subtotal: $${subtotal.toFixed(2)}</td></tr>
              <tr class="total"><td></td><td>Tax (${data.taxRate}%): $${tax.toFixed(2)}</td></tr>
              <tr class="total"><td></td><td>Total: $${total.toFixed(2)}</td></tr>
              <tr class="heading"><td>Payments</td><td>Amount</td></tr>
              ${data.payments
								.map(
									(payment) => `
                <tr class="item">
                  <td>${payment.paymentDate}</td>
                  <td>$${payment.amountPaid.toFixed(2)}</td>
                </tr>
              `
								)
								.join('')}
            </table>
          </div>
        </body>
      </html>
    `;
	};

	const handleSave = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		try {
			const id = data.id || '';

			const newInvoice = {
				id,
				customerId: data.customerId,
				userId: data.userId,
				invoiceDate: data.invoiceDate,
				dueDate: data.dueDate,
				amountAfterTax: data.amountAfterTax,
				amountBeforeTax: data.amountBeforeTax,
				taxRate: data.taxRate,
				createdAt: new Date().toISOString(),
			};

			await db.insert(Invoice).values(newInvoice);
			// console.log(newInvoice);

			for (const workItem of data.workItems) {
				const workItemId = await generateId();
				await db.insert(WorkInformation).values({
					id: workItemId,
					invoiceId: id,
					descriptionOfWork: workItem.descriptionOfWork,
					unitPrice: workItem.unitPrice,
					date: workItem.date,
					totalToPayMinusTax: workItem.unitPrice,
					createdAt: new Date().toISOString(),
				});
				// console.log({
				// 	id: workItemId,
				// 	invoiceId: id,
				// 	descriptionOfWork: workItem.descriptionOfWork,
				// 	unitPrice: workItem.unitPrice,
				// 	date: workItem.date,
				// 	totalToPayMinusTax: workItem.unitPrice,
				// });
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
				// console.log({ id: paymentId, invoiceId: id, paymentDate: payment.paymentDate, amountPaid: payment.amountPaid, createdAt: new Date().toISOString() });
			}
			reset();
		} catch (error) {
			console.error('Error saving invoice:', error);
		}
	};

	const handleSend = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		const html = generateHtml(data);
		const fileUri = `${FileSystem.cacheDirectory}invoice_${data.id}.html`;
		await FileSystem.writeAsStringAsync(fileUri, html);
		await MailComposer.composeAsync({
			subject: `Invoice ${data.id}`,
			body: 'Please find the attached invoice.',
			attachments: [fileUri],
		});
	};

	const handleExportPdf = async (data: InvoiceType & { workItems: WorkInformationType[]; payments: PaymentType[] }) => {
		const html = generateHtml(data);
		const fileUri = `${FileSystem.cacheDirectory}invoice_${data.id}.html`;
		await FileSystem.writeAsStringAsync(fileUri, html);
		await Sharing.shareAsync(fileUri);
	};

	return (
		<ScrollView className='flex-1 p-4 bg-primaryLight'>
			<Text className='text-lg text-textLight font-bold mb-4'>Invoice Information</Text>
			<View className='justify-between gap-5 mb-5'>
				<Controller
					control={control}
					name='id'
					render={({ field: { onChange, value } }) => (
						<TextInput className='border border-mutedForeground p-2 rounded-md' placeholder='Invoice Number' value={value} onChangeText={onChange} />
					)}
				/>
				<Controller
					control={control}
					name='userId'
					render={({ field: { onChange, value } }) => (
						<PickerWithTouchableOpacity mode='dropdown' items={users} initialValue='Add User' onValueChange={(value) => setValue('userId', value)} />
					)}
				/>
				<Controller
					control={control}
					name='customerId'
					render={({ field: { onChange, value } }) => (
						<PickerWithTouchableOpacity
							mode='dropdown'
							items={customers}
							initialValue='Add Customer'
							onValueChange={(value) => setValue('customerId', value)}
						/>
					)}
				/>
				<Controller
					control={control}
					name='invoiceDate'
					render={({ field: { onChange, value } }) => (
						<TextInput className='border border-mutedForeground p-2 rounded-md' placeholder='Invoice Date' value={value} onChangeText={onChange} />
					)}
				/>
				<Controller
					control={control}
					name='dueDate'
					render={({ field: { onChange, value } }) => (
						<TextInput className='border border-mutedForeground p-2 rounded-md' placeholder='Due Date' value={value} onChangeText={onChange} />
					)}
				/>
				<Controller
					control={control}
					name='taxRate'
					render={({ field: { onChange, value } }) => (
						<TextInput
							className='border border-mutedForeground p-2 rounded-md'
							placeholder='Tax Rate (%)'
							value={value === 0 ? '' : value?.toString()}
							onChangeText={(text) => onChange(Number(text))}
							keyboardType='number-pad'
						/>
					)}
				/>
			</View>

			<Text className='text-lg text-textLight  font-bold mb-4'>Work Items</Text>
			{workFields.map((item, index) => (
				<View key={item.id} className='flex-row items-center mb-2'>
					<Controller
						control={control}
						name={`workItems.${index}.descriptionOfWork`}
						render={({ field: { onChange, value } }) => (
							<TextInput className='border p-2 rounded mb-2 flex-1 mr-2' placeholder='Description of Work' value={value} onChangeText={onChange} />
						)}
					/>
					<Controller
						control={control}
						name={`workItems.${index}.unitPrice`}
						render={({ field: { onChange, value } }) => (
							<TextInput
								className='border p-2 rounded mb-2 flex-1 mr-2'
								placeholder='Unit Price'
								value={value?.toString()}
								onChangeText={(text) => onChange(Number(text))}
								keyboardType='numeric'
							/>
						)}
					/>
					<Controller
						control={control}
						name={`workItems.${index}.date`}
						render={({ field: { onChange, value } }) => (
							<TextInput className='border p-2 rounded mb-2 flex-1' placeholder='Date' value={value} onChangeText={onChange} />
						)}
					/>
					<TouchableOpacity onPress={() => removeWork(index)}>
						<Text className='text-red-600'>Remove</Text>
					</TouchableOpacity>
				</View>
			))}
			<TouchableOpacity onPress={() => appendWork({ descriptionOfWork: '', unitPrice: 0, date: '', invoiceId: '', totalToPayMinusTax: 0 })}>
				<Text className='text-blue-600 mb-4'>Add Work Item</Text>
			</TouchableOpacity>

			<Text className='text-lg text-textLight font-bold mb-4'>Payments</Text>
			{paymentFields.map((item, index) => (
				<View key={item.id} className='flex-row items-center mb-2'>
					<Controller
						control={control}
						name={`payments.${index}.paymentDate`}
						render={({ field: { onChange, value } }) => (
							<TextInput className='border p-2 rounded mb-2 flex-1 mr-2' placeholder='Payment Date' value={value} onChangeText={onChange} />
						)}
					/>
					<Controller
						control={control}
						name={`payments.${index}.amountPaid`}
						render={({ field: { onChange, value } }) => (
							<TextInput
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

			<View className='mt-4'>
				<TouchableOpacity onPress={handleSubmit(handleSave)} className='mb-2'>
					<Text className='bg-blue-600 text-white text-center p-2 rounded'>Save Invoice</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleSubmit(handleSend)} className='mb-2'>
					<Text className='bg-green-600 text-white text-center p-2 rounded'>Send Invoice</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleSubmit(handleExportPdf)}>
					<Text className='bg-yellow-600 text-white text-center p-2 rounded'>Export PDF</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

export default InvoiceFormPage;
