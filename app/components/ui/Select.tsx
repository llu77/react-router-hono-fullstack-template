import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder = "اختر...",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              "block w-full rounded-lg border transition-colors duration-200 appearance-none",
              "px-4 py-2.5 pr-10 text-gray-900 dark:text-gray-100",
              "bg-white dark:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20",
              disabled && "bg-gray-100 dark:bg-gray-700 cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
