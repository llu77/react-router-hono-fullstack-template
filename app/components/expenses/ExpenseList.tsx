/**
 * ExpenseList Component
 * ══════════════════════
 * Displays list of expenses with actions
 */

import { Form } from "react-router";
import { Trash2, Edit2, Banknote, CreditCard, User, Receipt } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Badge } from "~/components/ui/Badge";
import { CategoryIcon } from "./CategorySelect";
import { cn } from "~/lib/utils";
import type { ExpenseWithDetails } from "~/lib/helpers/expense";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ExpenseListProps {
  expenses: ExpenseWithDetails[];
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (expense: ExpenseWithDetails) => void;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ExpenseList({
  expenses,
  canEdit = false,
  canDelete = false,
  onEdit,
  className,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <Receipt size={48} className="mx-auto opacity-50" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          لا توجد مصاريف مسجلة لهذا اليوم
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          ابدأ بإضافة مصروف جديد
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Expense Item Sub-component
// ═══════════════════════════════════════════════════════════

interface ExpenseItemProps {
  expense: ExpenseWithDetails;
  canEdit: boolean;
  canDelete: boolean;
  onEdit?: (expense: ExpenseWithDetails) => void;
}

function ExpenseItem({
  expense,
  canEdit,
  canDelete,
  onEdit,
}: ExpenseItemProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        {/* Category Icon & Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
            <CategoryIcon
              iconName={expense.category.icon}
              colorName={expense.category.color}
              size={24}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {expense.category.name}
            </h4>

            {/* Payment Type Badge */}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={expense.paymentType === "cash" ? "success" : "primary"}
                size="sm"
              >
                {expense.paymentType === "cash" ? (
                  <>
                    <Banknote size={12} className="ml-1" />
                    نقداً
                  </>
                ) : (
                  <>
                    <CreditCard size={12} className="ml-1" />
                    شبكة
                  </>
                )}
              </Badge>

              {/* Employee (for advance payment) */}
              {expense.employee && (
                <Badge variant="secondary" size="sm">
                  <User size={12} className="ml-1" />
                  {expense.employee.name}
                </Badge>
              )}
            </div>

            {/* Description */}
            {expense.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {expense.description}
              </p>
            )}

            {/* Receipt Number */}
            {expense.receiptNumber && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                فاتورة: {expense.receiptNumber}
              </p>
            )}
          </div>
        </div>

        {/* Amount & Actions */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(expense.amount)}
          </span>

          {/* Actions */}
          {(canEdit || canDelete) && (
            <div className="flex gap-1">
              {canEdit && onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(expense)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Edit2 size={16} />
                </Button>
              )}
              {canDelete && (
                <Form method="post" className="inline">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={expense.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600"
                    onClick={(e) => {
                      if (!confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </Form>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Table View (alternative layout)
// ═══════════════════════════════════════════════════════════

export interface ExpenseTableProps {
  expenses: ExpenseWithDetails[];
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (expense: ExpenseWithDetails) => void;
  className?: string;
}

export function ExpenseTable({
  expenses,
  canEdit = false,
  canDelete = false,
  onEdit,
  className,
}: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        لا توجد مصاريف مسجلة
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
              الصنف
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
              المبلغ
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
              الدفع
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
              الموظف
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
              ملاحظات
            </th>
            {(canEdit || canDelete) && (
              <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">
                إجراءات
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon
                    iconName={expense.category.icon}
                    colorName={expense.category.color}
                    size={16}
                  />
                  <span>{expense.category.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-medium">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={
                    expense.paymentType === "cash" ? "success" : "primary"
                  }
                  size="sm"
                >
                  {expense.paymentType === "cash" ? "نقداً" : "شبكة"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {expense.employee?.name || "-"}
              </td>
              <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                {expense.description || "-"}
              </td>
              {(canEdit || canDelete) && (
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">
                    {canEdit && onEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(expense)}
                      >
                        <Edit2 size={14} />
                      </Button>
                    )}
                    {canDelete && (
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={expense.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            if (
                              !confirm("هل أنت متأكد من حذف هذا المصروف؟")
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </Form>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
