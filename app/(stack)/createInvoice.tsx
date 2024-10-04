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
import { Customer, User, Invoice, WorkInformation } from '@/db/schema';
import { customerSchema, invoiceSchema, workInformationSchema } from '@/db/zodSchema';

// Types inferred from Zod schemas
type InvoiceType = z.infer<typeof invoiceSchema>;
type WorkInformationType = z.infer<typeof workInformationSchema>;

const InvoiceFormPage = () => {
	const { addInvoice } = useInvoice();
	const {
		control,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<any>({
		resolver: zodResolver(invoiceSchema),
		defaultValues: {
			customerId: '',
			userId: '',
			invoiceDate: '',
			dueDate: '',
			amountAfterTax: 0,
			amountBeforeTax: 0,
			taxRate: 0,
			pdfPath: '',
			createdAt: new Date().toISOString(),
		},
	});

	// For work items
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'work',
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
	// const calculateTotal = () => {
	// 	const workItems = fields; // Cast fields to the correct type
	// 	const subtotal = workItems.reduce((sum: number, item) => {
	// 		const unitPrice = item.unitPrice || 0;
	// 		const days = item.id || 0;
	// 		return sum + unitPrice * days; // Calculate subtotal
	// 	}, 0); // Initialize sum to 0
	// 	const taxRate = control.getValues('taxRate');
	// 	const tax = subtotal * (taxRate / 100);
	// 	return { subtotal, tax, total: subtotal + tax };
	// };

	const generateHtml = (data: InvoiceType) => {
		// const { subtotal, tax, total } = calculateTotal();
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
                        Invoice #: ${data.invoiceDate}<br>
                        Created: ${data.dueDate}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="information">
                <td colspan="2">
                  <table>
                    <tr>
                      <td>${data.customerId}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="heading"><td>Item</td><td>Price</td></tr>
              ${fields
								.map(
									(item: any) =>
										`<tr class="item"><td>${item.descriptionOfWork} (${item.days} days)</td><td>$${(item.unitPrice * item.days).toFixed(2)}</td></tr>`
								)
								.join('')}
              <tr class="total"><td></td><td>Subtotal: $${data.amountAfterTax}</td></tr>
              <tr class="total"><td></td><td>Tax: $${data.taxRate}</td></tr>
              <tr class="total"><td></td><td>Total: $${data.amountAfterTax}</td></tr>
            </table>
          </div>
        </body>
      </html>
    `;
	};

	const handleSave = async (data: InvoiceType) => {
		try {
			const id = await generateId();
			const newInvoice = {
				id,
				customerId: data.customerId,
				userId: data.userId,
				invoiceDate: data.invoiceDate,
				dueDate: data.dueDate,
				amountAfterTax: data.amountAfterTax,
				amountBeforeTax: 0, // Set this to 0 or calculate if needed
				taxRate: data.taxRate, // Ensure taxRate is included
				createdAt: new Date().toISOString(),
			};

			// Save invoice to the database
			await db.insert(Invoice).values(newInvoice).returning();
			// console.log(newInvoice);

			// Insert Work Items
			// for (const workItem of fields) {
			// 	const workItemId = await generateId();
			// 	await db.insert(WorkInformation).values({
			// 		id: workItemId,
			// 		invoiceId: newInvoice.id,
			// 		descriptionOfWork: fields.descriptionOfWork,
			// 		unitPrice: workItem.unitPrice,
			// 		date: new Date().toISOString(), // Adjust to match your requirements
			// 		totalToPayMinusTax: workItem.unitPrice * workItem.days,
			// 		createdAt: new Date().toISOString(),
			// 	});
			// }

			reset(); // Reset form after saving
		} catch (error) {
			console.error('Error saving invoice:', error);
		}
	};

	const handleSend = async (data: InvoiceType) => {
		const html = generateHtml(data);
		const fileUri = `${FileSystem.cacheDirectory}invoice_${data.invoiceDate}.html`;
		await FileSystem.writeAsStringAsync(fileUri, html);
		await MailComposer.composeAsync({
			subject: `Invoice ${data.invoiceDate}`,
			body: 'Please find the attached invoice.',
			attachments: [fileUri],
		});
	};

	const handleExportPdf = async (data: InvoiceType) => {
		const html = generateHtml(data);
		const fileUri = `${FileSystem.cacheDirectory}invoice_${data.invoiceDate}.html`;
		await FileSystem.writeAsStringAsync(fileUri, html);
		await Sharing.shareAsync(fileUri);
	};

	return (
		<ScrollView className='flex-1 p-4 bg-primaryLight'>
			<Text className='text-lg font-bold mb-4'>Invoice Information</Text>
			<View className=' justify-between gap-5 mb-5'>
				<Controller
					control={control}
					name='userId'
					render={({ field: { onChange, value } }) => (
						<PickerWithTouchableOpacity mode='dropdown' items={users} initialValue='Add User' onValueChange={(value) => setValue('userId', value)} />
					)}
				/>
				{errors.userId && <Text className='text-danger text-xs'>{'User field is required'}</Text>}
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
				{errors.customerId && <Text className='text-danger text-xs'>{'Costumer is required'}</Text>}

				<Controller
					control={control}
					name='invoiceDate'
					render={({ field: { onChange, value } }) => (
						<TextInput className='border border-mutedForeground p-2 rounded-md' placeholder='Invoice Date' value={value} onChangeText={onChange} />
					)}
				/>
				{errors.invoiceDate && <Text className='text-danger text-xs'>{'Add date for invoice'}</Text>}

				<Controller
					control={control}
					name='dueDate'
					render={({ field: { onChange, value } }) => (
						<TextInput className='border border-mutedForeground p-2 rounded-md' placeholder='Due Date' value={value} onChangeText={onChange} />
					)}
				/>
				{errors.dueDate && <Text className='text-danger text-xs'>{'Add due date to invoice'}</Text>}

				<Controller
					control={control}
					name='taxRate' // Added taxRate field
					render={({ field: { onChange, value } }) => (
						<TextInput
							className='border border-mutedForeground p-2 rounded-md'
							placeholder='Tax Rate'
							value={value?.toString()}
							onChangeText={(text) => onChange(Number(text))}
							keyboardType='numeric'
						/>
					)}
				/>
				{errors.taxRate && <Text className='text-danger text-xs'>{'Tax Rate is requaier'}</Text>}
			</View>

			<Text className='text-lg font-bold mb-4'>Work Items</Text>
			{fields.map((item: { id: React.Key | null | undefined }, index: number | number[] | undefined) => (
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
						name={`workItems.${index}.days`}
						render={({ field: { onChange, value } }) => (
							<TextInput
								className='border p-2 rounded mb-2 flex-1'
								placeholder='Days'
								value={value?.toString()}
								onChangeText={(text) => onChange(Number(text))}
								keyboardType='numeric'
							/>
						)}
					/>
					<TouchableOpacity onPress={() => remove(index)}>
						<Text className='text-red-600'>Remove</Text>
					</TouchableOpacity>
				</View>
			))}
			<TouchableOpacity onPress={() => append({ descriptionOfWork: '', unitPrice: 0, days: 0 })}>
				<Text className='text-blue-600 mb-4'>Add Work Item</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={handleSubmit(handleSave)}>
				<Text className='bg-blue-600 text-white text-center p-2 rounded'>Save Invoice</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={handleSubmit(handleSend)}>
				<Text className='bg-green-600 text-white text-center p-2 rounded'>Send Invoice</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={handleSubmit(handleExportPdf)}>
				<Text className='bg-yellow-600 text-white text-center p-2 rounded'>Export PDF</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};

export default InvoiceFormPage;
