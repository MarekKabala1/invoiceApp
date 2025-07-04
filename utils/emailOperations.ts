import * as MailComposer from 'expo-mail-composer';
import { Linking } from 'react-native';
import { emailReminderTemplate } from '@/templates/emailRemaiderTemplate';
import {
	getUserAndBankDetails,
	getCustomerDetails,
	getUsers,
} from './invoiceFormOperations';
import { InvoiceType, CustomerType, UserType } from '@/db/zodSchema';

export const sendPaymentReminder = async (
	invoice: InvoiceType,
	customer: CustomerType,
	user: UserType
): Promise<'success'> => {
	const customerDetails = await getCustomerDetails(invoice.customerId);
	if (!customerDetails || !customerDetails.emailAddress) {
		throw new Error('Customer does not have an email address.');
	}
	const { userDetails, bankDetails } = await getUserAndBankDetails(
		invoice.userId
	);
	if (!userDetails) {
		throw new Error('User details are missing for this invoice.');
	}
	if (!bankDetails) {
		throw new Error('Bank details are missing for this user.');
	}
	const isAvailable = await MailComposer.isAvailableAsync();
	const html = emailReminderTemplate(
		invoice,
		customerDetails.name,
		bankDetails,
		userDetails
	);
	if (isAvailable) {
		await MailComposer.composeAsync({
			recipients: [customerDetails.emailAddress],
			subject: `Payment Reminder: Invoice #${invoice.id} is overdue`,
			body: html,
			isHtml: true,
		});
		return 'success';
	} else {
		const subject = encodeURIComponent(
			`Payment Reminder: Invoice #${invoice.id} is overdue`
		);
		const body = encodeURIComponent(html);
		const mailtoUrl = `mailto:${customerDetails.emailAddress}?subject=${subject}&body=${body}`;
		const supported = await Linking.canOpenURL(mailtoUrl);
		if (supported) {
			await Linking.openURL(mailtoUrl);
			return 'success';
		} else {
			throw new Error(
				'No email app is available. Please install an email app like Gmail.'
			);
		}
	}
};
