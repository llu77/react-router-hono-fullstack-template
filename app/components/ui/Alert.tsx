import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  onClose?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant = "info", title, onClose, children, ...props },
    ref
  ) => {
    const variants = {
      success: {
        container:
          "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        title: "text-green-800 dark:text-green-300",
        content: "text-green-700 dark:text-green-400",
        Icon: CheckCircle,
      },
      error: {
        container:
          "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
        title: "text-red-800 dark:text-red-300",
        content: "text-red-700 dark:text-red-400",
        Icon: XCircle,
      },
      warning: {
        container:
          "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
        icon: "text-yellow-600 dark:text-yellow-400",
        title: "text-yellow-800 dark:text-yellow-300",
        content: "text-yellow-700 dark:text-yellow-400",
        Icon: AlertTriangle,
      },
      info: {
        container:
          "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        title: "text-blue-800 dark:text-blue-300",
        content: "text-blue-700 dark:text-blue-400",
        Icon: Info,
      },
    };

    const { container, icon, title: titleClass, content, Icon } = variants[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "rounded-lg border p-4 flex gap-3",
          container,
          className
        )}
        {...props}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", icon)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn("font-medium mb-1", titleClass)}>{title}</h4>
          )}
          <div className={cn("text-sm", content)}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "flex-shrink-0 p-1 rounded-md transition-colors",
              "hover:bg-black/5 dark:hover:bg-white/5",
              icon
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };
