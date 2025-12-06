import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دالة لدمج الـ classes بشكل ذكي
 * تستخدم clsx و tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق الأرقام بالعربية
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ar-SA").format(num);
}

/**
 * تنسيق العملة
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
}

/**
 * تنسيق التاريخ بالعربية
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * الحصول على التاريخ الحالي بتنسيق YYYY-MM-DD
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * الحصول على الشهر والسنة الحاليين
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}
