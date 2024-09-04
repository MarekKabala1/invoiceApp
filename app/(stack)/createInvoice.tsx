import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useInvoice } from '@/context/InvoiceContext';
import { Ionicons } from '@expo/vector-icons';
import { useAssets } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';

const InvoicePage = () => {
	const { addInvoice } = useInvoice();
	const [companyInfo, setCompanyInfo] = useState({ name: '', address: '', cardInfo: '' });
	const [invoiceInfo, setInvoiceInfo] = useState({ date: '', number: '' });
	const [workItems, setWorkItems] = useState([{ description: '', price: 0, days: 1 }]);
	const [taxPercentage, setTaxPercentage] = useState(0);

	const calculateTotal = () => {
		const subtotal = workItems.reduce((sum, item) => sum + item.price * item.days, 0);
		const tax = subtotal * (taxPercentage / 100);
		return { subtotal, tax, total: subtotal + tax };
	};

	const generateHtml = () => {
		const { subtotal, tax, total } = calculateTotal();
		return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(2) { text-align: right; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.details td { padding-bottom: 20px; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.item.last td { border-bottom: none; }
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
                        Invoice #: ${invoiceInfo.number}<br>
                        Created: ${invoiceInfo.date}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="information">
                <td colspan="2">
                  <table>
                    <tr>
                      <td>
                        ${companyInfo.name}<br>
                        ${companyInfo.address}<br>
                        ${companyInfo.cardInfo}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="heading">
                <td>Item</td>
                <td>Price</td>
              </tr>
              ${workItems
								.map(
									(item) => `
                <tr class="item">
                  <td>${item.description} (${item.days} days)</td>
                  <td>$${(item.price * item.days).toFixed(2)}</td>
                </tr>
              `
								)
								.join('')}
              <tr class="total">
                <td></td>
                <td>Subtotal: $${subtotal.toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td></td>
                <td>Tax (${taxPercentage}%): $${tax.toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td></td>
                <td>Total: $${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;
	};

	const handleSave = async () => {
		const newInvoice = {
			id: invoiceInfo.number,
			customerName: companyInfo.name,
			amount: calculateTotal().total,
			dueDate: new Date(invoiceInfo.date),
		};
		addInvoice(newInvoice);

		// Save to file system instead of SQLite
		const fileUri = `${FileSystem.documentDirectory}invoice_${invoiceInfo.number}.json`;
		await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(newInvoice));
	};

	const handleSend = async () => {
		const html = generateHtml();
		const fileUri = `${FileSystem.cacheDirectory}invoice_${invoiceInfo.number}.html`;
		await FileSystem.writeAsStringAsync(fileUri, html);
		await MailComposer.composeAsync({
			subject: `Invoice ${invoiceInfo.number}`,
			body: 'Please find attached invoice.',
			attachments: [fileUri],
		});
	};

	const handleExportPdf = async () => {
		const html = generateHtml();
		const fileUri = `${FileSystem.cacheDirectory}invoice_${invoiceInfo.number}.html`;
		await FileSystem.writeAsStringAsync(fileUri, html);
		await Sharing.shareAsync(fileUri);
	};

	return (
		// <SafeAreaView>
		<ScrollView className='flex-1 p-3 bg-gray-100'>
			<Text className='text-lg font-semibold mt-4 mb-2'>Company Information</Text>
			<TextInput
				className='border border-gray-300 p-2 mb-2 rounded'
				placeholder='Company Name'
				value={companyInfo.name}
				onChangeText={(text) => setCompanyInfo({ ...companyInfo, name: text })}
			/>
			<TextInput
				className='border border-gray-300 p-2 mb-2 rounded'
				placeholder='Company Address'
				value={companyInfo.address}
				onChangeText={(text) => setCompanyInfo({ ...companyInfo, address: text })}
			/>
			<TextInput
				className='border border-gray-300 p-2 mb-2 rounded'
				placeholder='Card Information'
				value={companyInfo.cardInfo}
				onChangeText={(text) => setCompanyInfo({ ...companyInfo, cardInfo: text })}
			/>

			<Text className='text-lg font-semibold mt-4 mb-2'>Invoice Information</Text>
			<TextInput
				className='border border-gray-300 p-2 mb-2 rounded'
				placeholder='Invoice Date'
				value={invoiceInfo.date}
				onChangeText={(text) => setInvoiceInfo({ ...invoiceInfo, date: text })}
			/>
			<TextInput
				className='border border-gray-300 p-2 mb-2 rounded'
				placeholder='Invoice Number'
				value={invoiceInfo.number}
				onChangeText={(text) => setInvoiceInfo({ ...invoiceInfo, number: text })}
			/>

			<Text className='text-lg font-semibold mt-4 mb-2'>Work Items</Text>
			{workItems.map((item, index) => (
				<View key={index} className='mb-4'>
					<TextInput
						className='border border-gray-300 p-2 mb-2 rounded'
						placeholder='Description'
						value={item.description}
						onChangeText={(text) => {
							const newItems = [...workItems];
							newItems[index].description = text;
							setWorkItems(newItems);
						}}
					/>
					<TextInput
						className='border border-gray-300 p-2 mb-2 rounded'
						placeholder='Price'
						keyboardType='numeric'
						value={item.price.toString()}
						onChangeText={(text) => {
							const newItems = [...workItems];
							newItems[index].price = parseFloat(text) || 0;
							setWorkItems(newItems);
						}}
					/>
					<TextInput
						className='border border-gray-300 p-2 mb-2 rounded'
						placeholder='Days'
						keyboardType='numeric'
						value={item.days.toString()}
						onChangeText={(text) => {
							const newItems = [...workItems];
							newItems[index].days = parseInt(text) || 1;
							setWorkItems(newItems);
						}}
					/>
				</View>
			))}
			<TouchableOpacity className='bg-blue-500 p-2 rounded mb-4' onPress={() => setWorkItems([...workItems, { description: '', price: 0, days: 1 }])}>
				<Text className='text-white text-center'>Add Work Item</Text>
			</TouchableOpacity>

			<Text className='text-lg font-semibold mt-4 mb-2'>Tax</Text>
			<TextInput
				className='border border-gray-300 p-2 mb-2 rounded'
				placeholder='Tax Percentage'
				keyboardType='numeric'
				value={taxPercentage.toString()}
				onChangeText={(text) => setTaxPercentage(parseFloat(text) || 0)}
			/>

			<Text className='text-lg font-semibold mt-4 mb-2'>Total</Text>
			<Text className='mb-1'>Subtotal: ${calculateTotal().subtotal.toFixed(2)}</Text>
			<Text className='mb-1'>Tax: ${calculateTotal().tax.toFixed(2)}</Text>
			<Text className='font-bold'>Total: ${calculateTotal().total.toFixed(2)}</Text>

			<View className='flex-row justify-around mt-6'>
				<TouchableOpacity className='bg-green-500 p-3 rounded flex-row items-center' onPress={handleSave}>
					<Ionicons name='save-outline' size={24} color='white' />
					<Text className='text-white ml-2'>Save</Text>
				</TouchableOpacity>
				<TouchableOpacity className='bg-blue-500 p-3 rounded flex-row items-center' onPress={handleSend}>
					<Ionicons name='mail-outline' size={24} color='white' />
					<Text className='text-white ml-2'>Send</Text>
				</TouchableOpacity>
				<TouchableOpacity className='bg-purple-500 p-3 rounded flex-row items-center' onPress={handleExportPdf}>
					<Ionicons name='document-outline' size={24} color='white' />
					<Text className='text-white ml-2'>Export</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
		// </SafeAreaView>
	);
};

export default InvoicePage;
