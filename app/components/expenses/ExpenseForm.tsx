/**
 * ExpenseForm Component
 * ══════════════════════
 * Form for creating/editing expenses
 */

import { useState, useEffect } from "react";
import { Form, useNavigation } from "react-router";
import { Banknote, CreditCard, Calendar, Receipt } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { RadioGroup } from "~/components/ui/RadioGroup";
import { CategorySelect } from "./CategorySelect";
import { cn } from "~/lib/utils";
import { ADVANCE_PAYMENT_CATEGORY_ID } from "~/lib/validations/expense";
import type { ExpenseCategory, Employee, Expense } from "~/db/schema";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ExpenseFormProps {
  categories: ExpenseCategory[];
  employees: Employee[];
  currentDate: string;
  expense?: Expense | null;
  errors?: Record<string, string> | null;
  onCancel?: () => void;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ExpenseForm({
  categories,
  employees,
  currentDate,
  expense,
  errors,
  onCancel,
  className,
}: ExpenseFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!expense;

  // Form state
  const [categoryId, setCategoryId] = useState<number | undefined>(
    expense?.categoryId
  );
  const [paymentType, setPaymentType] = useState<string>(
    expense?.paymentType || "cash"
  );
  const [amount, setAmount] = useState<string>(
    expense?.amount?.toString() || ""
  );

  // Check if advance payment category is selected
  const isAdvancePayment = categoryId === ADVANCE_PAYMENT_CATEGORY_ID;

  // Payment type options
  const paymentOptions = [
    {
      value: "cash",
      label: "نقداً",
      icon: <Banknote size={18} />,
    },
    {
      value: "network",
      label: "شبكة",
      icon: <CreditCard size={18} />,
    },
  ];

  return (
    <Form method="post" className={cn("space-y-5", className)}>
      {/* Hidden fields */}
      <input type="hidden" name="intent" value={isEditing ? "update" : "create"} />
      {isEditing && <input type="hidden" name="id" value={expense.id} />}
      <input type="hidden" name="date" value={currentDate} />

      {/* Date Display (read-only) */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <Calendar size={18} />
        <span>التاريخ: {formatDateArabic(currentDate)}</span>
      </div>

      {/* Category Select */}
      <CategorySelect
        categories={categories}
        value={categoryId}
        onChange={setCategoryId}
        error={errors?.categoryId}
      />

      {/* Amount Input */}
      <Input
        name="amount"
        type="number"
        label="المبلغ"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors?.amount}
        min="0"
        step="0.01"
        leftIcon={<span className="text-sm font-medium">ر.س</span>}
      />

      {/* Payment Type */}
      <RadioGroup
        name="paymentType"
        label="طريقة الدفع"
        options={paymentOptions}
        value={paymentType}
        onChange={setPaymentType}
        variant="cards"
        error={errors?.paymentType}
      />

      {/* Employee Select (for advance payment only) */}
      {isAdvancePayment && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <label
            htmlFor="employeeId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            الموظف <span className="text-red-500">*</span>
          </label>
          <select
            id="employeeId"
            name="employeeId"
            defaultValue={expense?.employeeId || ""}
            className={cn(
              "block w-full rounded-lg border transition-colors duration-200",
              "px-4 py-2.5 text-gray-900 dark:text-gray-100",
              "bg-white dark:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              errors?.employeeId
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
            )}
          >
            <option value="">اختر الموظف...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeCode})
              </option>
            ))}
          </select>
          {errors?.employeeId && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.employeeId}
            </p>
          )}
        </div>
      )}

      {/* Receipt Number (optional) */}
      <Input
        name="receiptNumber"
        type="text"
        label="رقم الفاتورة (اختياري)"
        placeholder="مثال: 12345"
        defaultValue={expense?.receiptNumber || ""}
        error={errors?.receiptNumber}
        leftIcon={<Receipt size={18} />}
      />

      {/* Description (optional) */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          ملاحظات (اختياري)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="أي ملاحظات إضافية..."
          defaultValue={expense?.description || ""}
          className={cn(
            "block w-full rounded-lg border transition-colors duration-200",
            "px-4 py-2.5 text-gray-900 dark:text-gray-100",
            "bg-white dark:bg-gray-800",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20",
            "resize-none"
          )}
        />
        {errors?.description && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {errors.description}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {isEditing ? "تحديث" : "إضافة المصروف"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
      </div>

      {/* General Error */}
      {errors?.general && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {errors.general}
        </p>
      )}
    </Form>
  );
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function formatDateArabic(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("ar-SA", options);
}
