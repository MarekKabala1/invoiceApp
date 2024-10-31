import { eq, and, between, desc } from 'drizzle-orm';
import { Transactions } from './schema';

export const getTransactionsByDateRange = async (db: any, startDate: Date, endDate: Date) => {
  return await db
    .select()
    .from(Transactions)
    .where(
      and(
        between(Transactions.date, startDate.toISOString(), endDate.toISOString())
      )
    )
    .orderBy(desc(Transactions.date));
};

export const addTransaction = async (db: any, transaction: any) => {
  return await db.insert(Transactions).values(transaction);
};