import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Textarea } from "@/Core";

interface RejectTimesheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: () => void;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  isLoading?: boolean;
}

export const RejectTimesheetDialog: React.FC<RejectTimesheetDialogProps> = ({
  open,
  onOpenChange,
  onReject,
  rejectReason,
  onRejectReasonChange,
  isLoading = false,
}) => {
  const { t } = useTranslation('employee');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {t('ttl_reject_timesheet')}
          </h2>
          <p className="text-sm text-muted-foreground">
            Please provide a reason for rejecting this timesheet.
          </p>
        </div>
        <div className="mt-4">
          <Textarea
            placeholder={t('ph_reason_for_rejection')}
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            rows={4}
          />
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={!rejectReason.trim() || isLoading}
          >
            Reject Timesheet
          </Button>
        </div>
      </div>
    </div>
  );
}; 