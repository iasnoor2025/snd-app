import React, { HTMLAttributes, forwardRef } from "react";
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Tab item configuration
 */
export interface TabItem {
  /** Unique value for the tab */
  value: string;
  /** Display label for the tab */
  label: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Content to display when tab is active */
  content: React.ReactNode;
  /** Optional tooltip text */
  tooltip?: string;
  /** Optional badge content */
  badge?: React.ReactNode;
  /** Optional description text */
  description?: string;
}

/**
 * Tabs component that extends shadcn/ui's tabs with additional features.
 * Supports various orientations, variants, and customizable content.
 *
 * @example
 * ```tsx
 * const items = [
 *   {
 *     value: "tab1",
 *     label: "Tab 1",
 *     content: "Content for tab 1"
 *   },
 *   {
 *     value: "tab2",
 *     label: "Tab 2",
 *     icon: <Icon />,
 *     content: "Content for tab 2"
 *   }
 * ];
 *
 * // Basic usage
 * <Tabs items={items} />
 *
 * // With variant and size
 * <Tabs
 *   items={items}
 *   variant="pills"
 *   size="lg"
 * />
 *
 * // With loading state
 * <Tabs
 *   items={items}
 *   isLoading
 * />
 *
 * // With vertical orientation
 * <Tabs
 *   items={items}
 *   orientation="vertical"
 * />
 * ```
 */
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of tab items */
  items: TabItem[];
  /** Initial active tab value */
  defaultValue?: string;
  /** Controlled active tab value */
  value?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  /** Tab list orientation */
  orientation?: "horizontal" | "vertical";
  /** Visual style variant */
  variant?: "default" | "bordered" | "pills" | "underline" | "minimal";
  /** Size of the tabs */
  size?: "sm" | "md" | "lg";
  /** Whether to make tabs full width */
  fullWidth?: boolean;
  /** Whether tabs are in loading state */
  isLoading?: boolean;
  /** Whether to show a loading spinner instead of the default loading animation */
  useSpinner?: boolean;
  /** Whether to animate tab transitions */
  animate?: boolean;
  /** Whether to show tab descriptions */
  showDescriptions?: boolean;
  /** Whether to make tabs more compact */
  compact?: boolean;
  /** Whether to center tab content */
  centerContent?: boolean;
  /** Whether to show a divider below tabs */
  showDivider?: boolean;
  /** Whether to show hover effects */
  showHover?: boolean;
  /** Whether to show active tab indicator animation */
  animateIndicator?: boolean;
}

const variantClasses = {
  default: "",
  bordered: "border rounded-lg",
  pills: "bg-muted p-1 rounded-lg",
  underline: "border-b border-border",
  minimal: "gap-4",
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const Tabs = forwardRef<HTMLDivElement, TabsProps>(;
  (;
    {
      className,
      items,
      defaultValue,
      value,
      onValueChange,
      orientation = "horizontal",
      variant = "default",
      size = "md",
      fullWidth = false,
      isLoading,
      useSpinner = false,
      animate = true,
      showDescriptions = false,
      compact = false,
      centerContent = false,
      showDivider = false,
      showHover = true,
      animateIndicator = true,
      ...props
    },
    ref
  ) => {
    return (
      <ShadcnTabs
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        className={cn(
          "w-full",
          orientation === "vertical" && "flex gap-4",
          animate && "animate-in fade-in-0 duration-300",
          className
        )}
        {...props}
      >
        <TabsList
          className={cn(
            variantClasses[variant],
            fullWidth && "w-full",
            orientation === "vertical" && "flex-col h-auto",
            showDivider && orientation === "horizontal" && "border-b",
            compact && "p-1 gap-1"
          )}
        >
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={item.disabled || isLoading}
              className={cn(
                sizeClasses[size],
                fullWidth && "flex-1",
                orientation === "vertical" && "w-full justify-start",
                showHover && "transition-colors hover:bg-muted/50",
                animateIndicator && "data-[state=active]:transition-all",
                compact && "px-2 py-1"
              )}
              title={item.tooltip}
            >
              <div className="flex items-center gap-2">
                {item.icon && (
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                <div className="flex flex-col items-start">
                  <span className="flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2">{item.badge}</span>
                    )}
                  </span>
                  {showDescriptions && item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        {items.map((item) => (
          <TabsContent
            key={item.value}
            value={item.value}
            className={cn(
              "mt-4",
              orientation === "vertical" && "mt-0 flex-1",
              animate && "animate-in fade-in-0 slide-in-from-right-1 duration-300",
              centerContent && "flex items-center justify-center"
            )}
            role="tabpanel"
            aria-label={item.label}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                {useSpinner ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                )}
              </div>
            ) : (
              item.content
            )}
          </TabsContent>
        ))}
      </ShadcnTabs>
    );
  }
);

Tabs.displayName = "Tabs";

export { Tabs };



</div>






















