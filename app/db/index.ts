import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// إنشاء اتصال قاعدة البيانات
const sqlite = new Database("revenue.db");

// تفعيل WAL mode للأداء الأفضل
sqlite.pragma("journal_mode = WAL");

// إنشاء instance من Drizzle
export const db = drizzle(sqlite, { schema });

// تصدير schema للاستخدام في أماكن أخرى
export * from "./schema";
