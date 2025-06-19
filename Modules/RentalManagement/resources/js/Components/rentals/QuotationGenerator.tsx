import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/Modules/Core/resources/js/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { usePermission } from "@/Modules/Core/resources/js/hooks/usePermission";
import ToastManager from "@/Modules/Core/resources/js/utils/toast-manager";
import { router } from "@inertiajs/react";

interface QuotationGeneratorProps {
  rentalId: number;
  rentalItems: any[] | undefined;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function QuotationGenerator({
  rentalId,
  rentalItems,
  className = "",
  variant = "default",
  size = "default"
}: QuotationGeneratorProps) {
  const { t } = useTranslation('rental');

  const { hasPermission } = usePermission();
  const [isGenerating, setIsGenerating] = useState(false);
  const canGenerateQuotation = hasPermission('rentals.edit');

  const handleGenerateQuotation = () => {
    // Check permissions
    if (!canGenerateQuotation) {
      ToastManager.error("You don't have permission to generate quotations");
      return;
    }

    // Validate rental items
    if (!rentalItems || rentalItems.length === 0) {
      ToastManager.error("Cannot generate quotation: This rental has no items. Please add items first.");
      return;
    }

    // Set loading state
    setIsGenerating(true);

    // Show toast with loading state
    const toastId = ToastManager.loading("Generating quotation, please wait...");

    try {
      // Create and submit a form - most reliable approach for file generation
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = route("rentals.direct-generate-quotation", rentalId);
      document.body.appendChild(form);

      // Add event listener to dismiss toast on page navigation
      window.addEventListener('beforeunload', () => {
        ToastManager.dismiss(toastId);
      }, { once: true })

      // Submit the form
      form.submit();
    } catch (error) {
      console.error("Error generating quotation:", error);
      ToastManager.dismiss(toastId);
      ToastManager.error("Failed to generate quotation. Please try again.");
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateQuotation}
      disabled={isGenerating || !canGenerateQuotation}
      className={className}
      variant={variant}
      size={size}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Generate Quotation
        </>
      )}
    </Button>
  );
}














