import React, { HTMLAttributes, forwardRef } from "react";
import {
  Accordion as ShadcnAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { cn } from "../../lib/utils";

export interface AccordionItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: "default" | "bordered" | "separated";
  size?: "sm" | "md" | "lg";
  collapsible?: boolean;
  isLoading?: boolean;
}

const variantClasses = {
  default: "",
  bordered: "border rounded-lg",
  separated: "space-y-2",
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      items,
      type = "single",
      defaultValue,
      value,
      onValueChange,
      variant = "default",
      size = "md",
      collapsible = true,
      isLoading,
      ...props
    },
    ref
  ) => {
    return (
      <ShadcnAccordion
        ref={ref}
        type={type}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        collapsible={collapsible}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            disabled={item.disabled || isLoading}
            className={cn(
              variant === "separated" && "border rounded-lg",
              variant === "bordered" && "border-0 first:rounded-t-lg last:rounded-b-lg [&:not(:last-child)]:border-b"
            )}
          >
            <AccordionTrigger
              className={cn(
                sizeClasses[size],
                "hover:no-underline",
                variant === "bordered" && "px-4",
                variant === "separated" && "px-4"
              )}
            >
              <div className="flex items-center gap-2">
                {item.icon && (
                  <span className="inline-flex items-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </div>
            </AccordionTrigger>
            <AccordionContent
              className={cn(
                sizeClasses[size],
                variant === "bordered" && "px-4",
                variant === "separated" && "px-4"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                item.content
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </ShadcnAccordion>
    );
  }
)

Accordion.displayName = "Accordion";

export { Accordion };


























