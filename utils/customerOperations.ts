import { db } from '@/db/config';
import { Customer } from '@/db/schema';
import { CustomerType } from '@/db/zodSchema';
import { generateId } from '@/utils/generateUuid';
import { eq } from 'drizzle-orm';

export const getCustomers = async (
	isUpdateMode: boolean = false,
	customerId?: string
): Promise<CustomerType[]> => {
	try {
		const customersData = await db.select().from(Customer);
		console.log('Fetched customers:', customersData);

		return customersData.map((customer) => ({
			id: customer.id,
			name: customer.name || '',
			address: customer.address || '',
			emailAddress: customer.emailAddress || '',
			phoneNumber: customer.phoneNumber || '',
			createdAt: customer.createdAt || '',
		}));
	} catch (error) {
		console.error('Error fetching customers:', error);
		return [];
	}
};

export const getCustomersForPicker = async (
	isUpdateMode: boolean = false,
	customerId?: string
) => {
	try {
		const customersData = await db.select().from(Customer);

		return customersData.map((customer) => ({
			label: customer.name || '',
			value: customer.id,
		}));
	} catch (error) {
		console.error('Error fetching customers for picker:', error);
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
			.where(eq(Customer.id, customerId));
		console.log('Fetched customer details:', customer);
		if (!customer[0]) return null;

		return {
			id: customer[0].id,
			name: customer[0].name || '',
			address: customer[0].address || '',
			emailAddress: customer[0].emailAddress || '',
			phoneNumber: customer[0].phoneNumber || '',
			createdAt: customer[0].createdAt || '',
		};
	} catch (error) {
		console.error('Error fetching customer details:', error);
		return null;
	}
};

export const handleSaveCustomer = async (
	data: CustomerType,
	isUpdateMode: boolean,
	customerId?: string
): Promise<void> => {
	try {
		console.log('Saving customer:', { data, isUpdateMode, customerId });

		if (isUpdateMode && customerId) {
			console.log('Updating customer with ID:', customerId);
			const result = await db
				.update(Customer)
				.set({
					name: data.name,
					address: data.address,
					emailAddress: data.emailAddress,
					phoneNumber: data.phoneNumber,
				})
				.where(eq(Customer.id, customerId));
			console.log('Update result:', result);
		} else {
			console.log('Creating new customer');
			const id = await generateId();
			if (!id) {
				throw new Error('Failed to generate ID');
			}
			const formData = { ...data, id };
			console.log('Inserting customer data:', formData);
			const result = await db.insert(Customer).values(formData).returning();
			console.log('Insert result:', result);
		}
	} catch (error) {
		console.error('Error saving customer:', error);
		throw error;
	}
};

export const handleDeleteCustomer = async (
	customerId: string
): Promise<void> => {
	try {
		console.log('Deleting customer with ID:', customerId);
		const result = await db.delete(Customer).where(eq(Customer.id, customerId));
		console.log('Delete result:', result);
	} catch (error) {
		console.error('Error deleting customer:', error);
		throw error;
	}
};
