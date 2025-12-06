/**
 * RadioGroup Component
 * ═════════════════════
 * Accessible radio button group for form selection
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "~/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "cards";
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      label,
      error,
      hint,
      orientation = "horizontal",
      variant = "default",
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const handleChange = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        <div
          role="radiogroup"
          aria-label={label}
          className={cn(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
          )}
        >
          {options.map((option) => (
            <RadioOption
              key={option.value}
              name={name}
              option={option}
              isSelected={value === option.value}
              onChange={handleChange}
              disabled={disabled || option.disabled}
              variant={variant}
            />
          ))}
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

RadioGroup.displayName = "RadioGroup";

// ═══════════════════════════════════════════════════════════
// Radio Option Sub-component
// ═══════════════════════════════════════════════════════════

interface RadioOptionProps {
  name: string;
  option: RadioOption;
  isSelected: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  variant: "default" | "cards";
}

function RadioOption({
  name,
  option,
  isSelected,
  onChange,
  disabled,
  variant,
}: RadioOptionProps) {
  const id = `${name}-${option.value}`;

  if (variant === "cards") {
    return (
      <label
        htmlFor={id}
        className={cn(
          "relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
          isSelected
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="radio"
          id={id}
          name={name}
          value={option.value}
          checked={isSelected}
          onChange={() => onChange(option.value)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
            isSelected
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300 dark:border-gray-600"
          )}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1">
          {option.icon && <span className="ml-2">{option.icon}</span>}
          <span
            className={cn(
              "font-medium",
              isSelected
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300"
            )}
          >
            {option.label}
          </span>
          {option.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {option.description}
            </p>
          )}
        </div>
      </label>
    );
  }

  // Default variant
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={option.value}
        checked={isSelected}
        onChange={() => onChange(option.value)}
        disabled={disabled}
        className={cn(
          "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2",
          "dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-600"
        )}
      />
      {option.icon && (
        <span className="text-gray-500 dark:text-gray-400">{option.icon}</span>
      )}
      <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
    </label>
  );
}

export { RadioGroup };
