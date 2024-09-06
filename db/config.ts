import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite/next";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import * as schema from './schema';

export let db: ExpoSQLiteDatabase<typeof schema> | ExpoSQLiteDatabase<any>;
if (Platform.OS === "web") {
  console.warn('SQLite is not supported on the web');
} else {
  try {
    const sqLite: SQLiteDatabase = SQLite.openDatabaseSync("invoice.db", { enableChangeListener: true });
    db = drizzle(sqLite, { schema });
  } catch (error) {
    console.error('Error opening or initializing database:', error);
  }
}


