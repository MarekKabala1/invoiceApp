import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite/next";


const sqLite: SQLiteDatabase = openDatabaseSync("invoice.db");
export const db = drizzle(sqLite);

