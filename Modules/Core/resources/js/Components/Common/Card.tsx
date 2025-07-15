import { Loader2 } from 'lucide-react';
import React, { HTMLAttributes, forwardRef } from 'react';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Card as ShadcnCard } from '../../components/ui/card';
import { cn } from '../../lib/utils';

/**
 * Card component that extends shadcn/ui's card with additional features.
 * Supports various variants, loading states, and customizable content.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Card title="Card Title" description="Card description">
 *   Content goes here
 * </Card>
 *
 * // With footer and actions
 * <Card
 *   title="Card Title"
 *   description="Card description"
 *   footer={<Button>Action</Button>}
 *   headerActions={<Button variant="ghost">Edit</Button>}
 * >
 *   Content goes here
 * </Card>
 *
 * // With loading state
 * <Card
 *   title="Loading"
 *   isLoading
 * >
 *   Content goes here
 * </Card>
 *
 * // With hover effect
 * <Card
 *   title="Hover Me"
 *   showHover
 *   onClick={() => console.log("Card clicked")}
 * >
 *   Content goes here
 * </Card>
 * ```
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Title of the card */
    title?: string;
    /** Description text below the title */
    description?: string;
    /** Footer content */
    footer?: React.ReactNode;
    /** Actions to display in the header */
    headerActions?: React.ReactNode;
    /** Whether the card is in a loading state */
    isLoading?: boolean;
    /** Visual style variant */
    variant?: 'default' | 'bordered' | 'elevated' | 'flat' | 'ghost';
    /** Whether to show a hover effect */
    showHover?: boolean;
    /** Whether to show a loading spinner instead of the default loading animation */
    useSpinner?: boolean;
    /** Whether to make the card more compact */
    compact?: boolean;
    /** Whether to center the content */
    centerContent?: boolean;
    /** Whether to show a divider between header and content */
    showHeaderDivider?: boolean;
    /** Whether to show a divider between content and footer */
    showFooterDivider?: boolean;
    /** Whether to make the card full width */
    fullWidth?: boolean;
    /** Whether to make the card full height */
    fullHeight?: boolean;
    /** Whether to show a shadow on hover */
    hoverShadow?: boolean;
    /** Whether to show a border on hover */
    hoverBorder?: boolean;
    /** Whether to animate the card */
    animate?: boolean;
}

const variantClasses = {
    default: 'bg-card text-card-foreground',
    bordered: 'border-2',
    elevated: 'shadow-lg',
    flat: 'bg-muted/50',
    ghost: 'bg-transparent hover:bg-muted/50',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            title,
            description,
            footer,
            headerActions,
            isLoading,
            variant = 'default',
            showHover = false,
            useSpinner = false,
            compact = false,
            centerContent = false,
            showHeaderDivider = false,
            showFooterDivider = false,
            fullWidth = false,
            fullHeight = false,
            hoverShadow = false,
            hoverBorder = false,
            animate = false,
            children,
            onClick,
            ...props
        },
        ref,
    ) => {
        return (
            <ShadcnCard
                ref={ref}
                className={cn(
                    variantClasses[variant],
                    showHover && 'transition-colors hover:bg-muted/50',
                    isLoading && 'pointer-events-none opacity-50',
                    onClick && 'cursor-pointer',
                    compact && 'p-3',
                    fullWidth && 'w-full',
                    fullHeight && 'h-full',
                    hoverShadow && 'transition-shadow hover:shadow-lg',
                    hoverBorder && 'transition-[border] hover:border-2',
                    animate && 'animate-in fade-in-0 duration-300',
                    className,
                )}
                onClick={onClick}
                role={onClick ? 'button' : undefined}
                tabIndex={onClick ? 0 : undefined}
                {...props}
            >
                {(title || description || headerActions) && (
                    <CardHeader
                        className={cn(
                            'flex flex-row items-center justify-between space-y-0',
                            compact ? 'pb-2' : 'pb-4',
                            showHeaderDivider && 'border-b',
                        )}
                    >
                        <div className="space-y-1">
                            {title && (
                                <CardTitle className={cn('leading-none font-semibold tracking-tight', compact && 'text-sm')}>{title}</CardTitle>
                            )}
                            {description && (
                                <CardDescription className={cn('text-sm text-muted-foreground', compact && 'text-xs')}>{description}</CardDescription>
                            )}
                        </div>
                        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
                    </CardHeader>
                )}
                <CardContent className={cn(!title && !description && 'pt-6', centerContent && 'flex items-center justify-center', compact && 'p-2')}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            {useSpinner ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            )}
                        </div>
                    ) : (
                        children
                    )}
                </CardContent>
                {footer && <CardFooter className={cn(showFooterDivider && 'border-t', compact && 'p-2')}>{footer}</CardFooter>}
            </ShadcnCard>
        );
    },
);

Card.displayName = 'Card';

export { Card };
