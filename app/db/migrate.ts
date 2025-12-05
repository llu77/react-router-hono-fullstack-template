import Database from "better-sqlite3";

/**
 * ملف الترحيل - ينشئ جداول قاعدة البيانات
 */
const sqlite = new Database("revenue.db");

// تفعيل WAL mode
sqlite.pragma("journal_mode = WAL");

console.log("🔄 بدء عملية الترحيل...");

// إنشاء الجداول
sqlite.exec(`
  -- جدول الفروع
  CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- جدول المستخدمين
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'employee' CHECK(role IN ('admin', 'manager', 'employee')),
    branch_id INTEGER REFERENCES branches(id),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
  );

  -- جدول الموظفين
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    employee_code TEXT UNIQUE,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- جدول السجلات الشهرية
  CREATE TABLE IF NOT EXISTS monthly_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    is_closed INTEGER DEFAULT 0,
    closed_at TEXT,
    closed_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- جدول الإيرادات اليومية
  CREATE TABLE IF NOT EXISTS daily_revenues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    monthly_record_id INTEGER REFERENCES monthly_records(id),
    cash REAL NOT NULL DEFAULT 0,
    network REAL NOT NULL DEFAULT 0,
    balance REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    is_matched INTEGER DEFAULT 0,
    mismatch_reason TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
  );

  -- جدول إيرادات الموظفين
  CREATE TABLE IF NOT EXISTS employee_revenues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    daily_revenue_id INTEGER NOT NULL REFERENCES daily_revenues(id),
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    cash_amount REAL NOT NULL DEFAULT 0,
    network_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- جدول فئات المصاريف
  CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- جدول المصاريف
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES expense_categories(id),
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL CHECK(payment_type IN ('cash', 'network')),
    description TEXT,
    employee_id INTEGER REFERENCES employees(id),
    receipt_number TEXT,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,
    deleted_at TEXT
  );

  -- إنشاء الفهارس لتحسين الأداء
  CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
  CREATE INDEX IF NOT EXISTS idx_employees_branch ON employees(branch_id);
  CREATE INDEX IF NOT EXISTS idx_daily_revenues_date ON daily_revenues(date);
  CREATE INDEX IF NOT EXISTS idx_daily_revenues_branch ON daily_revenues(branch_id);
  CREATE INDEX IF NOT EXISTS idx_employee_revenues_daily ON employee_revenues(daily_revenue_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_revenues_unique ON daily_revenues(date, branch_id);

  -- فهارس المصاريف
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_branch ON expenses(branch_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_date_branch ON expenses(date, branch_id);
`);

console.log("✅ تم إنشاء جميع الجداول بنجاح!");

sqlite.close();
