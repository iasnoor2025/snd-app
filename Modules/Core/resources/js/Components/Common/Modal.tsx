import React, { HTMLAttributes, forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { X, Loader2 } from "lucide-react";

/**
 * Modal component that extends shadcn/ui's dialog with additional features.
 * Supports various sizes, loading states, and customizable content.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   Content goes here
 * </Modal>
 *
 * // With title and description
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 * >
 *   Content goes here
 * </Modal>
 *
 * // With footer
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   footer={
 *     <>
 *       <Button onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="primary">Confirm</Button>
 *     </>
 *   }
 * >
 *   Content goes here
 * </Modal>
 *
 * // With loading state
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   isLoading={true}
 * >
 *   Content goes here
 * </Modal>
 * ```
 */
export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
  /** Title of the modal */
  title?: string;
  /** Description text below the title */
  description?: string;
  /** Footer content */
  footer?: React.ReactNode;
  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Whether clicking outside closes the modal */
  closeOnOutsideClick?: boolean;
  /** Whether the modal is in a loading state */
  isLoading?: boolean;
  /** Whether to show a loading spinner instead of the default loading animation */
  useSpinner?: boolean;
  /** Whether to show a backdrop behind the modal */
  showBackdrop?: boolean;
  /** Whether to center the modal vertically */
  verticalCenter?: boolean;
  /** Whether to animate the modal */
  animate?: boolean;
  /** Whether to trap focus within the modal */
  trapFocus?: boolean;
  /** Whether to close on escape key press */
  closeOnEscape?: boolean;
  /** Custom class name for the backdrop */
  backdropClassName?: string;
  /** Custom class name for the content wrapper */
  contentClassName?: string;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-full sm:m-4",
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      isOpen,
      onClose,
      title,
      description,
      footer,
      size = "md",
      showCloseButton = true,
      closeOnOutsideClick = true,
      isLoading,
      useSpinner = false,
      showBackdrop = true,
      verticalCenter = true,
      animate = true,
      trapFocus = true,
      closeOnEscape = true,
      backdropClassName,
      contentClassName,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={closeOnOutsideClick ? onClose : undefined}
        modal={showBackdrop}
      >
        <DialogContent
          ref={ref}
          className={cn(
            "sm:rounded-lg",
            sizeClasses[size],
            isLoading && "opacity-50 pointer-events-none",
            verticalCenter && "sm:my-auto",
            animate && "animate-in fade-in-0 zoom-in-95 duration-200",
            contentClassName,
            className
          )}
          {...props}
        >
          {(title || description || showCloseButton) && (
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                {title && (
                  <DialogTitle id="dialog-title" className="text-lg font-semibold">
                    {title}
                  </DialogTitle>
                )}
                {description && (
                  <DialogDescription id="dialog-description" className="text-sm text-muted-foreground">
                    {description}
                  </DialogDescription>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onClose}
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              )}
            </div>
          )}
          <div
            className={cn(
              !title && !description && "pt-6",
              "focus:outline-none"
            )}
            role="dialog"
            aria-labelledby={title ? "dialog-title" : undefined}
            aria-describedby={description ? "dialog-description" : undefined}
            tabIndex={-1}
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
              children
            )}
          </div>
          {footer && <div>{footer}</div>}
        </DialogContent>
      </Dialog>
    );
  }
);

Modal.displayName = "Modal";

export { Modal };























