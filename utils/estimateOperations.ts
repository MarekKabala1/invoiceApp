import { db } from '@/db/config';
import {
	Customer,
	User,
	Estimate,
	EstimateNotes,
	EstimateTerms,
	BankDetails,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from './generateUuid';
import { calculateEstimateTotals } from './estimateCalculations';
import {
	CustomerType,
	EstimateType,
	EstimateNotesType,
	EstimateTermsType,
	BankDetailsType,
	UserType,
} from '@/db/zodSchema';
import { Linking } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { generateEstimateHtml } from '@/templates/estimateTemplate';
import { generateAndSavePdf } from './pdfOperations';

export const getLastEstimateId = async (): Promise<string> => {
	try {
		const getEstimates = await db.select().from(Estimate);
		if (!getEstimates || getEstimates.length === 0) {
			return '0';
		}

		const sortedData = [...getEstimates].sort((a, b) => {
			const idA = Number(a.id);
			const idB = Number(b.id);
			return idB - idA;
		});

		const mostRecentId = sortedData[0]?.id;
		if (!mostRecentId) {
			return '0';
		}
		return mostRecentId;
	} catch (error) {
		console.error('Error getting estimates:', error);
		return '0';
	}
};

export const getCustomers = async (
	isUpdateMode: boolean,
	estimateCustomerId?: string
): Promise<Array<{ label: string; value: string }>> => {
	try {
		const customers = await db.select().from(Customer);
		const customerOptions = customers.map((customer) => ({
			label: customer.name || '',
			value: customer.id,
		}));

		if (isUpdateMode && estimateCustomerId) {
			const selectedCustomer = customers.find(
				(customer) => customer.id === estimateCustomerId
			);
			if (selectedCustomer) {
				return [
					{
						label: selectedCustomer.name || '',
						value: selectedCustomer.id,
					},
					...customerOptions.filter(
						(option) => option.value !== estimateCustomerId
					),
				];
			}
		}

		return customerOptions;
	} catch (error) {
		console.error('Error fetching customers:', error);
		return [];
	}
};

export const getUsers = async (
	isUpdateMode: boolean,
	estimateUserId?: string
): Promise<Array<{ label: string; value: string }>> => {
	try {
		const users = await db.select().from(User);
		const userOptions = users.map((user) => ({
			label: user.fullName || '',
			value: user.id,
		}));

		if (isUpdateMode && estimateUserId) {
			const selectedUser = users.find((user) => user.id === estimateUserId);
			if (selectedUser) {
				return [
					{
						label: selectedUser.fullName || '',
						value: selectedUser.id,
					},
					...userOptions.filter((option) => option.value !== estimateUserId),
				];
			}
		}

		return userOptions;
	} catch (error) {
		console.error('Error fetching users:', error);
		return [];
	}
};

export const getCustomerDetails = async (
	customerId: string
): Promise<CustomerType | null> => {
	try {
		const customer = await db
			.select()
			.from(Customer)
			.where(eq(Customer.id, customerId))
			.limit(1);
		return customer[0] as CustomerType;
	} catch (error) {
		console.error('Error fetching customer details:', error);
		return null;
	}
};

export const getUserAndBankDetails = async (
	userId: string
): Promise<{
	userDetails: UserType;
	bankDetails: BankDetailsType;
}> => {
	try {
		const user = await db
			.select()
			.from(User)
			.where(eq(User.id, userId))
			.limit(1);
		const bankDetails = await db
			.select()
			.from(BankDetails)
			.where(eq(BankDetails.userId, userId))
			.limit(1);

		return {
			userDetails: user[0] as UserType,
			bankDetails: bankDetails[0] as BankDetailsType,
		};
	} catch (error) {
		console.error('Error fetching user and bank details:', error);
		throw error;
	}
};

export const handleSaveEstimate = async (
	data: EstimateType & {
		notes: EstimateNotesType[];
	},
	isUpdateMode: boolean,
	note: string,
	noteItemId?: string
): Promise<void> => {
	const { subtotal, tax, total } = calculateEstimateTotals(
		data.amountBeforeTax,
		data.taxRate,
		data.discount || 0,
		data.taxValue || false
	);
	const id = data.id || '';

	const newEstimate = {
		id,
		customerId: data.customerId,
		userId: data.userId,
		estimateDate: data.estimateDate,
		estimateEndTime: data.estimateEndTime,
		currency: data.currency,
		discount: data.discount || 0,
		taxRate: data.taxRate,
		amountBeforeTax: data.amountBeforeTax,
		amountAfterTax: total,
		taxValue: data.taxValue || false,
		isAccepted: data.isAccepted || false,
	};

	if (isUpdateMode) {
		const updatedEstimate = {
			...data,
			taxRate: data.taxRate,
			amountAfterTax: total,
			estimateDate: data.estimateDate,
			estimateEndTime: data.estimateEndTime,
			taxValue: data.taxValue || false,
			isAccepted: data.isAccepted || false,
		};
		await db.update(Estimate).set(updatedEstimate).where(eq(Estimate.id, id));
	} else {
		await db.insert(Estimate).values(newEstimate);
	}

	await handleEstimateNotes(id, data, note, noteItemId, isUpdateMode);
};

const handleEstimateNotes = async (
	id: string,
	data: EstimateType,
	note: string,
	noteItemId?: string,
	isUpdateMode?: boolean
): Promise<void> => {
	if (isUpdateMode && noteItemId) {
		await db
			.update(EstimateNotes)
			.set({
				noteText: note,
				noteDate: data.estimateDate,
			})
			.where(eq(EstimateNotes.id, noteItemId));
	} else {
		const noteId = await generateId();
		const estimateNote = {
			id: noteId,
			estimateId: id,
			noteDate: data.estimateDate,
			noteText: note,
		};
		await db.insert(EstimateNotes).values(estimateNote);
	}
};

export const handleSendEstimate = async (
	data: EstimateType & {
		notes: EstimateNotesType[];
	},
	selectedUser: UserType,
	selectedCustomer: CustomerType,
	bankDetails: BankDetailsType,
	note: string
): Promise<void> => {
	const { subtotal, tax, total } = calculateEstimateTotals(
		data.amountBeforeTax,
		data.taxRate,
		data.discount || 0,
		data.taxValue || false
	);

	const html = generateEstimateHtml({
		data: {
			...data,
			user: selectedUser,
			customer: selectedCustomer,
			bankDetails: bankDetails,
			notesText: note,
			notes: data.notes,
		},
		tax,
		subtotal,
		total,
	});

	try {
		const { uri } = await Print.printToFileAsync({ html });

		const isAvailable = await Sharing.isAvailableAsync();
		if (isAvailable) {
			const estimateDate = new Date(data.estimateDate).toLocaleDateString();
			const fileName = `Estimate_${data.id}_${estimateDate.replace(/\//g, '-')}.pdf`;
			const newUri = `${FileSystem.documentDirectory}${fileName}`;

			await FileSystem.moveAsync({
				from: uri,
				to: newUri,
			});

			await Sharing.shareAsync(newUri, {
				mimeType: 'application/pdf',
				dialogTitle: `Share Estimate ${data.id}`,
			});
		} else {
			throw new Error('Sharing is not available on this device.');
		}
	} catch (error) {
		console.error('Error generating or sharing PDF:', error);
		throw error;
	}
};

export const handleExportPdfEstimate = async (
	data: EstimateType & {
		notes: EstimateNotesType[];
	},
	selectedUser: UserType,
	selectedCustomer: CustomerType,
	bankDetails: BankDetailsType,
	note: string,
	isPreview: boolean
): Promise<void> => {
	const { subtotal, tax, total } = calculateEstimateTotals(
		data.amountBeforeTax,
		data.taxRate,
		data.discount || 0,
		data.taxValue || false
	);

	const html = generateEstimateHtml({
		data: {
			...data,
			user: selectedUser,
			customer: selectedCustomer,
			bankDetails: bankDetails,
			notesText: note,
			notes: data.notes,
		},
		tax,
		subtotal,
		total,
	});

	const filename = `Estimate_${data.id}_${new Date(data.estimateDate).toISOString().split('T')[0]}.pdf`;

	const { uri: tempUri } = await Print.printToFileAsync({
		html,
		base64: false,
	});

	await FileSystem.moveAsync({
		from: tempUri,
		to: `${FileSystem.documentDirectory}${filename}`,
	});
};

export const handlePreviewEstimate = (
	data: EstimateType & {
		notes: EstimateNotesType[];
	},
	selectedUser: UserType,
	selectedCustomer: CustomerType,
	bankDetails: BankDetailsType,
	note: string,
	isPreview: boolean
): string => {
	const { subtotal, tax, total } = calculateEstimateTotals(
		data.amountBeforeTax,
		data.taxRate,
		data.discount || 0,
		data.taxValue || false
	);

	return generateEstimateHtml({
		data: {
			...data,
			user: selectedUser,
			customer: selectedCustomer,
			bankDetails: bankDetails,
			notesText: note,
			notes: data.notes,
		},
		subtotal,
		tax,
		total,
		isPreview,
	});
};

export const getEstimateTerms = async (
	estimateId: string
): Promise<EstimateTermsType[]> => {
	try {
		const terms = await db
			.select()
			.from(EstimateTerms)
			.where(eq(EstimateTerms.estimateId, estimateId));

		return terms.map((term) => ({
			id: term.id,
			estimateId: term.estimateId || '',
			termText: term.termText || '',
			createdAt: term.createdAt || '',
		}));
	} catch (error) {
		console.error('Error fetching estimate terms:', error);
		return [];
	}
};

export const saveEstimateTerms = async (
	estimateId: string,
	terms: string[]
): Promise<void> => {
	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(EstimateTerms)
				.where(eq(EstimateTerms.estimateId, estimateId));

			for (const termText of terms) {
				if (termText.trim()) {
					const termId = await generateId();
					await tx.insert(EstimateTerms).values({
						id: termId,
						estimateId,
						termText: termText.trim(),
					});
				}
			}
		});
	} catch (error) {
		console.error('Error saving estimate terms:', error);
		throw error;
	}
};

export const deleteEstimateTerms = async (
	estimateId: string
): Promise<void> => {
	try {
		await db
			.delete(EstimateTerms)
			.where(eq(EstimateTerms.estimateId, estimateId));
	} catch (error) {
		console.error('Error deleting estimate terms:', error);
		throw error;
	}
};
