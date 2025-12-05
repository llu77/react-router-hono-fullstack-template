/**
 * Expense Helpers
 * ═══════════════
 * Business logic and database queries for expenses
 */

import { db } from "~/db";
import { expenses, expenseCategories, employees } from "~/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import type { Expense, ExpenseCategory, Employee } from "~/db/schema";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ExpenseSummary {
  totalAmount: number;
  cashAmount: number;
  networkAmount: number;
  expenseCount: number;
}

export interface ExpenseWithDetails extends Expense {
  category: ExpenseCategory;
  employee: Employee | null;
}

// ═══════════════════════════════════════════════════════════
// Query Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Get active expense categories
 */
export function getActiveCategories(): ExpenseCategory[] {
  return db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.isActive, true))
    .orderBy(expenseCategories.sortOrder)
    .all();
}

/**
 * Get category by ID
 */
export function getCategoryById(id: number): ExpenseCategory | undefined {
  return db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.id, id))
    .get();
}

/**
 * Get daily expenses for a branch (not deleted)
 */
export function getDailyExpenses(
  branchId: number,
  date: string
): ExpenseWithDetails[] {
  const result = db
    .select({
      expense: expenses,
      category: expenseCategories,
      employee: employees,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .leftJoin(employees, eq(expenses.employeeId, employees.id))
    .where(
      and(
        eq(expenses.branchId, branchId),
        eq(expenses.date, date),
        isNull(expenses.deletedAt)
      )
    )
    .orderBy(desc(expenses.createdAt))
    .all();

  return result.map((row) => ({
    ...row.expense,
    category: row.category!,
    employee: row.employee,
  }));
}

/**
 * Get expense by ID with details
 */
export function getExpenseById(id: number): ExpenseWithDetails | null {
  const result = db
    .select({
      expense: expenses,
      category: expenseCategories,
      employee: employees,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .leftJoin(employees, eq(expenses.employeeId, employees.id))
    .where(and(eq(expenses.id, id), isNull(expenses.deletedAt)))
    .get();

  if (!result) return null;

  return {
    ...result.expense,
    category: result.category!,
    employee: result.employee,
  };
}

/**
 * Get employees by branch (for advance payment selection)
 */
export function getEmployeesByBranch(branchId: number): Employee[] {
  return db
    .select()
    .from(employees)
    .where(and(eq(employees.branchId, branchId), eq(employees.isActive, true)))
    .orderBy(employees.name)
    .all();
}

// ═══════════════════════════════════════════════════════════
// Calculation Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Calculate expense summary from list
 */
export function calculateExpenseSummary(
  expensesList: Expense[]
): ExpenseSummary {
  return expensesList.reduce(
    (acc, expense) => ({
      totalAmount: acc.totalAmount + expense.amount,
      cashAmount:
        acc.cashAmount + (expense.paymentType === "cash" ? expense.amount : 0),
      networkAmount:
        acc.networkAmount +
        (expense.paymentType === "network" ? expense.amount : 0),
      expenseCount: acc.expenseCount + 1,
    }),
    { totalAmount: 0, cashAmount: 0, networkAmount: 0, expenseCount: 0 }
  );
}

// ═══════════════════════════════════════════════════════════
// Permission Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Check if user can access/modify an expense
 */
export function canAccessExpense(
  expense: Expense,
  userId: number,
  userRole: string,
  userBranchId: number | null
): boolean {
  // Admin can access all
  if (userRole === "admin") return true;

  // Manager can access their branch
  if (userRole === "manager" && expense.branchId === userBranchId) return true;

  // Employee can only access their own expenses
  if (expense.createdBy === userId) return true;

  return false;
}

/**
 * Check if user can delete an expense
 */
export function canDeleteExpense(
  expense: Expense,
  userId: number,
  userRole: string,
  userBranchId: number | null
): boolean {
  // Only admin and manager can delete
  if (userRole === "admin") return true;
  if (userRole === "manager" && expense.branchId === userBranchId) return true;

  return false;
}

// ═══════════════════════════════════════════════════════════
// CRUD Operations
// ═══════════════════════════════════════════════════════════

interface CreateExpenseData {
  date: string;
  categoryId: number;
  amount: number;
  paymentType: "cash" | "network";
  description?: string | null;
  employeeId?: number | null;
  receiptNumber?: string | null;
  branchId: number;
  createdBy: number;
}

/**
 * Create a new expense
 */
export function createExpense(data: CreateExpenseData): Expense {
  return db
    .insert(expenses)
    .values({
      date: data.date,
      categoryId: data.categoryId,
      amount: data.amount,
      paymentType: data.paymentType,
      description: data.description || null,
      employeeId: data.employeeId || null,
      receiptNumber: data.receiptNumber || null,
      branchId: data.branchId,
      createdBy: data.createdBy,
    })
    .returning()
    .get();
}

interface UpdateExpenseData {
  categoryId?: number;
  amount?: number;
  paymentType?: "cash" | "network";
  description?: string | null;
  employeeId?: number | null;
  receiptNumber?: string | null;
}

/**
 * Update an existing expense
 */
export function updateExpense(id: number, data: UpdateExpenseData): Expense {
  return db
    .update(expenses)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(expenses.id, id))
    .returning()
    .get();
}

/**
 * Soft delete an expense
 */
export function deleteExpense(id: number): void {
  db.update(expenses)
    .set({
      deletedAt: new Date().toISOString(),
    })
    .where(eq(expenses.id, id))
    .run();
}
