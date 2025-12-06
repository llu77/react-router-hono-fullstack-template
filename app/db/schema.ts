import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ==================== الجداول ====================

/**
 * جدول الفروع
 * يحتوي على معلومات الفروع المختلفة
 */
export const branches = sqliteTable("branches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/**
 * جدول المستخدمين
 * يحتوي على بيانات تسجيل الدخول والصلاحيات
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["admin", "manager", "employee"] }).default("employee"),
  branchId: integer("branch_id").references(() => branches.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  lastLogin: text("last_login"),
});

/**
 * جدول الموظفين
 * يحتوي على بيانات الموظفين المرتبطين بالفروع
 */
export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  employeeCode: text("employee_code").unique(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/**
 * جدول السجلات الشهرية
 * يحتوي على أرشيف السجلات الشهرية لكل فرع
 */
export const monthlyRecords = sqliteTable("monthly_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  isClosed: integer("is_closed", { mode: "boolean" }).default(false),
  closedAt: text("closed_at"),
  closedBy: integer("closed_by").references(() => users.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/**
 * جدول الإيرادات اليومية
 * يحتوي على البيانات المالية اليومية
 */
export const dailyRevenues = sqliteTable("daily_revenues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  monthlyRecordId: integer("monthly_record_id").references(() => monthlyRecords.id),

  // البيانات المالية
  cash: real("cash").notNull().default(0),
  network: real("network").notNull().default(0),
  balance: real("balance").notNull().default(0), // الموازنة المحسوبة تلقائياً
  total: real("total").notNull().default(0),

  // حالة المطابقة
  isMatched: integer("is_matched", { mode: "boolean" }).default(false),
  mismatchReason: text("mismatch_reason"), // سبب عدم المطابقة

  // بيانات التتبع
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
});

/**
 * جدول إيرادات الموظفين
 * يحتوي على تفصيل إيرادات كل موظف في اليوم
 */
export const employeeRevenues = sqliteTable("employee_revenues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dailyRevenueId: integer("daily_revenue_id").references(() => dailyRevenues.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  cashAmount: real("cash_amount").notNull().default(0),
  networkAmount: real("network_amount").notNull().default(0),
  totalAmount: real("total_amount").notNull().default(0), // محسوب تلقائياً
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// ==================== العلاقات ====================

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  employees: many(employees),
  monthlyRecords: many(monthlyRecords),
  dailyRevenues: many(dailyRevenues),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  dailyRevenues: many(dailyRevenues),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  branch: one(branches, {
    fields: [employees.branchId],
    references: [branches.id],
  }),
  revenues: many(employeeRevenues),
}));

export const monthlyRecordsRelations = relations(monthlyRecords, ({ one, many }) => ({
  branch: one(branches, {
    fields: [monthlyRecords.branchId],
    references: [branches.id],
  }),
  closedByUser: one(users, {
    fields: [monthlyRecords.closedBy],
    references: [users.id],
  }),
  dailyRevenues: many(dailyRevenues),
}));

export const dailyRevenuesRelations = relations(dailyRevenues, ({ one, many }) => ({
  branch: one(branches, {
    fields: [dailyRevenues.branchId],
    references: [branches.id],
  }),
  monthlyRecord: one(monthlyRecords, {
    fields: [dailyRevenues.monthlyRecordId],
    references: [monthlyRecords.id],
  }),
  createdByUser: one(users, {
    fields: [dailyRevenues.createdBy],
    references: [users.id],
  }),
  employeeRevenues: many(employeeRevenues),
}));

export const employeeRevenuesRelations = relations(employeeRevenues, ({ one }) => ({
  dailyRevenue: one(dailyRevenues, {
    fields: [employeeRevenues.dailyRevenueId],
    references: [dailyRevenues.id],
  }),
  employee: one(employees, {
    fields: [employeeRevenues.employeeId],
    references: [employees.id],
  }),
}));

// ==================== جداول المصاريف ====================

/**
 * جدول فئات المصاريف
 * يحتوي على 15 فئة ثابتة + قابلة للتوسع
 */
export const expenseCategories = sqliteTable("expense_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

/**
 * جدول المصاريف
 * كل مصروف مرتبط بفرع + مستخدم + فئة
 */
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // البيانات الأساسية
  date: text("date").notNull(), // YYYY-MM-DD
  categoryId: integer("category_id")
    .references(() => expenseCategories.id)
    .notNull(),
  amount: real("amount").notNull(),
  paymentType: text("payment_type", { enum: ["cash", "network"] }).notNull(),

  // بيانات إضافية
  description: text("description"),
  employeeId: integer("employee_id").references(() => employees.id), // للسلفة فقط
  receiptNumber: text("receipt_number"),

  // الربط بالفرع والمستخدم
  branchId: integer("branch_id")
    .references(() => branches.id)
    .notNull(),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),

  // التتبع
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"), // Soft delete
});

// ==================== علاقات المصاريف ====================

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  branch: one(branches, {
    fields: [expenses.branchId],
    references: [branches.id],
  }),
  createdByUser: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
  employee: one(employees, {
    fields: [expenses.employeeId],
    references: [employees.id],
  }),
}));

// ==================== الأنواع ====================

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type MonthlyRecord = typeof monthlyRecords.$inferSelect;
export type NewMonthlyRecord = typeof monthlyRecords.$inferInsert;

export type DailyRevenue = typeof dailyRevenues.$inferSelect;
export type NewDailyRevenue = typeof dailyRevenues.$inferInsert;

export type EmployeeRevenue = typeof employeeRevenues.$inferSelect;
export type NewEmployeeRevenue = typeof employeeRevenues.$inferInsert;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type NewExpenseCategory = typeof expenseCategories.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
