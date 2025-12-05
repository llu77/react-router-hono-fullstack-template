/**
 * Expenses Page
 * ═══════════════
 * Daily expense tracking with categories
 */

import { useState } from "react";
import { useOutletContext } from "react-router";
import type { Route } from "./+types/_dashboard.expenses";
import { Header } from "~/components/layout";
import { Card, CardContent } from "~/components/ui";
import { Button } from "~/components/ui/Button";
import { Alert } from "~/components/ui/Alert";
import {
  ExpenseForm,
  ExpenseList,
  ExpenseSummary,
} from "~/components/expenses";
import { Plus, X, Receipt } from "lucide-react";
import { getCurrentDate, formatDate } from "~/lib/utils";
import {
  getActiveCategories,
  getDailyExpenses,
  getEmployeesByBranch,
  calculateExpenseSummary,
  createExpense,
  deleteExpense,
  canDeleteExpense,
  getExpenseById,
} from "~/lib/helpers/expense";
import { parseExpenseFormData } from "~/lib/validations/expense";
import {
  successResponse,
  errorResponse,
  handleError,
  type ActionResponse,
} from "~/lib/errors";
import type { ExpenseWithDetails } from "~/lib/helpers/expense";

// ═══════════════════════════════════════════════════════════
// Meta
// ═══════════════════════════════════════════════════════════

export function meta() {
  return [{ title: "المصاريف | نظام إدارة الإيرادات" }];
}

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface OutletContext {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
    branchId: number | null;
    branchName?: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Loader - Load categories, employees, and daily expenses
// ═══════════════════════════════════════════════════════════

export function loader({ request }: Route.LoaderArgs) {
  // Get date from URL or use current date
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const currentDate = dateParam || getCurrentDate();

  // For now, we'll load data based on the first branch
  // In production, this would come from the user's session
  const branchId = 1; // Default branch

  try {
    // Load all required data
    const categories = getActiveCategories();
    const employees = getEmployeesByBranch(branchId);
    const expenses = getDailyExpenses(branchId, currentDate);
    const summary = calculateExpenseSummary(expenses);

    return {
      categories,
      employees,
      expenses,
      summary,
      currentDate,
      branchId,
    };
  } catch (error) {
    console.error("Error loading expenses:", error);
    return {
      categories: [],
      employees: [],
      expenses: [],
      summary: { totalAmount: 0, cashAmount: 0, networkAmount: 0, expenseCount: 0 },
      currentDate,
      branchId: 1,
      error: "حدث خطأ في تحميل البيانات",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// Action - Handle form submissions (create, update, delete)
// ═══════════════════════════════════════════════════════════

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionResponse> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    switch (intent) {
      case "create": {
        // Parse and validate form data
        const { data, errors } = parseExpenseFormData(formData);

        if (errors) {
          return errorResponse("يرجى تصحيح الأخطاء", errors);
        }

        if (!data) {
          return errorResponse("بيانات غير صالحة");
        }

        // Get date and branch from form
        const date = formData.get("date") as string;
        const branchId = 1; // Default for now
        const createdBy = 1; // Default user for now

        // Create expense
        const expense = createExpense({
          date,
          categoryId: data.categoryId,
          amount: data.amount,
          paymentType: data.paymentType,
          description: data.description,
          employeeId: data.employeeId,
          receiptNumber: data.receiptNumber,
          branchId,
          createdBy,
        });

        return successResponse(expense, "تم إضافة المصروف بنجاح");
      }

      case "delete": {
        const id = parseInt(formData.get("id") as string, 10);

        if (isNaN(id)) {
          return errorResponse("معرف غير صالح");
        }

        // Get expense to check permissions
        const expense = getExpenseById(id);

        if (!expense) {
          return errorResponse("المصروف غير موجود");
        }

        // Check permission (simplified - in production use session user)
        const canDelete = canDeleteExpense(expense, 1, "admin", 1);

        if (!canDelete) {
          return errorResponse("غير مصرح بحذف هذا المصروف");
        }

        // Delete expense (soft delete)
        deleteExpense(id);

        return successResponse(null, "تم حذف المصروف بنجاح");
      }

      default:
        return errorResponse("إجراء غير معروف");
    }
  } catch (error) {
    return handleError(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export default function ExpensesPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { categories, employees, expenses, summary, currentDate, error } =
    loaderData;

  // Get user from outlet context
  const { user } = useOutletContext<OutletContext>();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithDetails | null>(
    null
  );

  // Permission checks
  const canEdit = user.role === "admin" || user.role === "manager";
  const canDelete = user.role === "admin" || user.role === "manager";

  // Handle edit
  const handleEdit = (expense: ExpenseWithDetails) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  // Success/Error messages from action
  const successMessage =
    actionData && "success" in actionData && actionData.success
      ? actionData.message
      : null;

  const errorMessage =
    actionData && "success" in actionData && !actionData.success
      ? actionData.error
      : null;

  const formErrors =
    actionData && "errors" in actionData ? actionData.errors : null;

  return (
    <div className="min-h-screen">
      <Header
        title="المصاريف اليومية"
        subtitle={`${formatDate(currentDate)} - ${user.branchName || "الفرع الرئيسي"}`}
      />

      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {(error || errorMessage) && (
          <Alert variant="error">{error || errorMessage}</Alert>
        )}

        {/* Success Alert */}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {/* Summary Cards */}
        <ExpenseSummary summary={summary} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expenses List - 2 columns */}
          <div className="lg:col-span-2">
            <Card variant="bordered" padding="none">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      مصاريف اليوم
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({expenses.length} مصروف)
                    </span>
                  </div>
                  {!isFormOpen && (
                    <Button
                      size="sm"
                      onClick={() => setIsFormOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <Plus size={16} />
                      إضافة مصروف
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4">
                <ExpenseList
                  expenses={expenses}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onEdit={handleEdit}
                />
              </div>
            </Card>
          </div>

          {/* Form Panel - 1 column */}
          <div className="lg:col-span-1">
            {isFormOpen ? (
              <Card variant="bordered" padding="none">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {editingExpense ? "تعديل مصروف" : "إضافة مصروف جديد"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFormClose}
                    className="text-gray-500"
                  >
                    <X size={18} />
                  </Button>
                </div>
                <CardContent>
                  <ExpenseForm
                    categories={categories}
                    employees={employees}
                    currentDate={currentDate}
                    expense={editingExpense}
                    errors={formErrors}
                    onCancel={handleFormClose}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card
                variant="bordered"
                className="bg-gray-50 dark:bg-gray-800/50 border-dashed cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsFormOpen(true)}
              >
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    إضافة مصروف جديد
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    اضغط هنا لإضافة مصروف
                  </p>
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card variant="bordered" className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                إحصائيات سريعة
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    أكثر فئة إنفاقاً
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getTopCategory(expenses) || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    متوسط المصروف
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {expenses.length > 0
                      ? formatCurrencyShort(summary.totalAmount / expenses.length)
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    نسبة النقد
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {summary.totalAmount > 0
                      ? `${Math.round((summary.cashAmount / summary.totalAmount) * 100)}%`
                      : "-"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

function getTopCategory(expenses: ExpenseWithDetails[]): string | null {
  if (expenses.length === 0) return null;

  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      const catName = exp.category.name;
      acc[catName] = (acc[catName] || 0) + exp.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return topCategory ? topCategory[0] : null;
}

function formatCurrencyShort(amount: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}
