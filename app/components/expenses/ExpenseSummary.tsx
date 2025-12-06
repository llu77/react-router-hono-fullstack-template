/**
 * ExpenseSummary Component
 * ═════════════════════════
 * Displays summary of daily expenses (total, cash, network)
 */

import { Banknote, CreditCard, Calculator, Receipt } from "lucide-react";
import { Card } from "~/components/ui/Card";
import { cn } from "~/lib/utils";
import type { ExpenseSummary as ExpenseSummaryType } from "~/lib/helpers/expense";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ExpenseSummaryProps {
  summary: ExpenseSummaryType;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function ExpenseSummary({ summary, className }: ExpenseSummaryProps) {
  const stats = [
    {
      label: "إجمالي المصاريف",
      value: summary.totalAmount,
      icon: Calculator,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      iconColor: "text-blue-500",
    },
    {
      label: "نقداً",
      value: summary.cashAmount,
      icon: Banknote,
      color: "green",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      iconColor: "text-green-500",
    },
    {
      label: "شبكة",
      value: summary.networkAmount,
      icon: CreditCard,
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      iconColor: "text-purple-500",
    },
    {
      label: "عدد المصاريف",
      value: summary.expenseCount,
      icon: Receipt,
      color: "gray",
      bgColor: "bg-gray-50 dark:bg-gray-800",
      textColor: "text-gray-600 dark:text-gray-400",
      iconColor: "text-gray-500",
      isCount: true,
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={cn("p-4", stat.bgColor)}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={cn("text-2xl font-bold", stat.textColor)}>
                {stat.isCount
                  ? stat.value
                  : formatCurrency(stat.value)}
              </p>
            </div>
            <div className={cn("p-2 rounded-lg", stat.bgColor)}>
              <stat.icon size={24} className={stat.iconColor} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Compact Summary (for sidebar or smaller spaces)
// ═══════════════════════════════════════════════════════════

export interface CompactSummaryProps {
  summary: ExpenseSummaryType;
  className?: string;
}

export function CompactSummary({ summary, className }: CompactSummaryProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          إجمالي المصاريف
        </span>
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {formatCurrency(summary.totalAmount)}
        </span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Banknote size={14} className="text-green-500" />
          نقداً
        </span>
        <span className="font-medium text-green-600 dark:text-green-400">
          {formatCurrency(summary.cashAmount)}
        </span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <CreditCard size={14} className="text-purple-500" />
          شبكة
        </span>
        <span className="font-medium text-purple-600 dark:text-purple-400">
          {formatCurrency(summary.networkAmount)}
        </span>
      </div>
      <div className="flex justify-between items-center py-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          عدد المصاريف
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {summary.expenseCount}
        </span>
      </div>
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
