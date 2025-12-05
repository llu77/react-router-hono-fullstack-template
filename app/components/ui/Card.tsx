import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "~/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", padding = "md", children, ...props },
    ref
  ) => {
    const variants = {
      default: "bg-white dark:bg-gray-800",
      bordered:
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      elevated:
        "bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-4 pb-4 border-b border-gray-200 dark:border-gray-700", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// Card Title
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-lg font-semibold text-gray-900 dark:text-gray-100",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "CardTitle";

// Card Content
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

// Card Footer
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
