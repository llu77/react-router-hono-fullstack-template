/**
 * Expense Validation Schemas
 * ══════════════════════════
 * Zod schemas for expense validation
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

export const ADVANCE_PAYMENT_CATEGORY_CODE = "advance_payment";
export const ADVANCE_PAYMENT_CATEGORY_ID = 15;
export const PAYMENT_TYPES = ["cash", "network"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

// ═══════════════════════════════════════════════════════════
// Validation Schemas
// ═══════════════════════════════════════════════════════════

/**
 * Base expense schema without conditional validation
 */
export const expenseBaseSchema = z.object({
  categoryId: z
    .number({
      required_error: "يرجى اختيار الصنف",
      invalid_type_error: "صنف غير صالح",
    })
    .int("صنف غير صالح")
    .positive("صنف غير صالح"),

  amount: z
    .number({
      required_error: "يرجى إدخال المبلغ",
      invalid_type_error: "المبلغ يجب أن يكون رقماً",
    })
    .positive("المبلغ يجب أن يكون أكبر من صفر")
    .max(10_000_000, "المبلغ كبير جداً"),

  paymentType: z.enum(PAYMENT_TYPES, {
    required_error: "يرجى اختيار نوع الدفع",
    invalid_type_error: "نوع دفع غير صالح",
  }),

  description: z
    .string()
    .max(500, "الملاحظات طويلة جداً")
    .optional()
    .nullable()
    .transform((val) => val || null),

  employeeId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
    .transform((val) => val || null),

  receiptNumber: z
    .string()
    .max(50, "رقم الفاتورة طويل جداً")
    .optional()
    .nullable()
    .transform((val) => val || null),
});

/**
 * Full expense schema with conditional validation
 * - If category is "advance_payment", employee is required
 */
export const expenseSchema = expenseBaseSchema.superRefine((data, ctx) => {
  if (data.categoryId === ADVANCE_PAYMENT_CATEGORY_ID) {
    if (!data.employeeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى اختيار الموظف للسلفة",
        path: ["employeeId"],
      });
    }
  }
});

/**
 * Schema for updating an expense
 */
export const expenseUpdateSchema = expenseBaseSchema.partial().extend({
  id: z.number().int().positive(),
});

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type ExpenseFormData = z.infer<typeof expenseBaseSchema>;
export type ExpenseUpdateData = z.infer<typeof expenseUpdateSchema>;

// ═══════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════

/**
 * Parse form data to expense data
 */
export function parseExpenseFormData(formData: FormData): {
  data: ExpenseFormData | null;
  errors: Record<string, string> | null;
} {
  const rawData = {
    categoryId: formData.get("categoryId")
      ? parseInt(formData.get("categoryId") as string, 10)
      : undefined,
    amount: formData.get("amount")
      ? parseFloat(formData.get("amount") as string)
      : undefined,
    paymentType: formData.get("paymentType") as string,
    description: (formData.get("description") as string) || null,
    employeeId: formData.get("employeeId")
      ? parseInt(formData.get("employeeId") as string, 10)
      : null,
    receiptNumber: (formData.get("receiptNumber") as string) || null,
  };

  const result = expenseSchema.safeParse(rawData);

  if (result.success) {
    return { data: result.data, errors: null };
  }

  const errors = formatZodErrors(result.error);
  return { data: null, errors };
}

/**
 * Format Zod errors to Record<string, string>
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  return error.errors.reduce(
    (acc, err) => {
      const path = err.path.join(".");
      if (!acc[path]) {
        acc[path] = err.message;
      }
      return acc;
    },
    {} as Record<string, string>
  );
}
