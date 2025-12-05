/**
 * CategorySelect Component
 * ═════════════════════════
 * Expense category dropdown with icons and colors
 */

import { forwardRef } from "react";
import {
  Zap,
  Wifi,
  ShoppingBag,
  Wrench,
  Gift,
  FileText,
  AlertTriangle,
  CreditCard,
  Heart,
  Building,
  FileCheck,
  Home,
  Store,
  Plane,
  HandCoins,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { ExpenseCategory } from "~/db/schema";

// ═══════════════════════════════════════════════════════════
// Icon Mapping
// ═══════════════════════════════════════════════════════════

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Wifi,
  ShoppingBag,
  Wrench,
  Gift,
  FileText,
  AlertTriangle,
  CreditCard,
  Heart,
  Building,
  FileCheck,
  Home,
  Store,
  Plane,
  HandCoins,
};

const colorMap: Record<string, string> = {
  yellow: "text-yellow-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  gray: "text-gray-500",
  green: "text-green-500",
  slate: "text-slate-500",
  red: "text-red-500",
  indigo: "text-indigo-500",
  pink: "text-pink-500",
  amber: "text-amber-500",
  teal: "text-teal-500",
  orange: "text-orange-500",
  cyan: "text-cyan-500",
  sky: "text-sky-500",
  emerald: "text-emerald-500",
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface CategorySelectProps {
  categories: ExpenseCategory[];
  value?: number;
  onChange?: (categoryId: number) => void;
  name?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

const CategorySelect = forwardRef<HTMLSelectElement, CategorySelectProps>(
  (
    {
      categories,
      value,
      onChange,
      name = "categoryId",
      label = "الصنف",
      error,
      disabled,
      className,
    },
    ref
  ) => {
    const selectedCategory = categories.find((c) => c.id === value);

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Icon Display */}
          {selectedCategory && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CategoryIcon
                iconName={selectedCategory.icon}
                colorName={selectedCategory.color}
              />
            </div>
          )}

          <select
            ref={ref}
            id={name}
            name={name}
            value={value || ""}
            onChange={(e) => {
              const categoryId = parseInt(e.target.value, 10);
              if (onChange && !isNaN(categoryId)) {
                onChange(categoryId);
              }
            }}
            disabled={disabled}
            className={cn(
              "block w-full rounded-lg border transition-colors duration-200",
              "px-4 py-2.5 text-gray-900 dark:text-gray-100",
              "bg-white dark:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "appearance-none cursor-pointer",
              selectedCategory ? "pr-10" : "",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20",
              disabled && "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            )}
          >
            <option value="">اختر الصنف...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CategorySelect.displayName = "CategorySelect";

// ═══════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════

interface CategoryIconProps {
  iconName: string | null;
  colorName: string | null;
  size?: number;
}

export function CategoryIcon({
  iconName,
  colorName,
  size = 18,
}: CategoryIconProps) {
  const Icon = iconName ? iconMap[iconName] : null;
  const colorClass = colorName ? colorMap[colorName] : "text-gray-500";

  if (!Icon) return null;

  return <Icon size={size} className={colorClass} />;
}

/**
 * Get category display info for lists
 */
export function getCategoryDisplay(category: ExpenseCategory) {
  return {
    icon: <CategoryIcon iconName={category.icon} colorName={category.color} />,
    name: category.name,
    colorClass: colorMap[category.color || "gray"] || "text-gray-500",
  };
}

export { CategorySelect };
