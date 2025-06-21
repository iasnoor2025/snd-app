import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
// import { RentalStatus } from '@/types/models';
type RentalStatus = string;
import { Check, Clock, AlertCircle } from 'lucide-react';

interface WorkflowStep {
    status: RentalStatus;
    label: string;
    description: string;
}

const workflowSteps: WorkflowStep[] = [
    {
        status: 'pending',
        label: 'Pending',
        description: 'Rental request created',
    },
    {
        status: 'quotation',
        label: 'Quotation Created',
        description: 'Quotation generated',
    },
    {
        status: 'quotation_approved',
        label: 'Quotation Approved',
        description: 'Quotation approved by customer',
    },
    {
        status: 'mobilization',
        label: 'Mobilization',
        description: 'Equipment preparation and delivery',
    },
    {
        status: 'mobilization_completed',
        label: 'Mobilization Completed',
        description: 'Equipment delivered and set up',
    },
    {
        status: 'active',
        label: 'Active',
        description: 'Rental in progress',
    },
    {
        status: 'completed',
        label: 'Completed',
        description: 'Rental completed',
    },
    {
        status: 'invoice_prepared',
        label: 'Invoice Prepared',
        description: 'Invoice generated for rental',
    },
    {
        status: 'payment_pending',
        label: 'Payment Pending',
        description: 'Waiting for payment',
    },
    {
        status: 'overdue',
        label: 'Overdue',
        description: 'Payment overdue',
    },
    {
        status: 'closed',
        label: 'Closed',
        description: 'Rental closed',
    },
];

interface RentalWorkflowStepperProps {
    currentStatus: RentalStatus;
    className?: string;
}

export function RentalWorkflowStepper({
    currentStatus,
    className,
}: RentalWorkflowStepperProps) {
  const { t } = useTranslation('rental');

    // Ensure we have a valid status - default to 'pending' if it's an empty string
    const validStatus = currentStatus || 'pending';

    // Enhanced debugging
    console.log('RentalWorkflowStepper received status:', currentStatus);
    console.log('Using valid status:', validStatus);

    // List all valid statuses for comparison
    console.log('Available workflow steps:', workflowSteps.map(step => step.status));

    // Find the exact step matching the current status
    const currentIndex = workflowSteps.findIndex(
        (step) => step.status === validStatus
    );

    console.log('Found status index:', currentIndex, 'for status:', validStatus);

    // Use 0 as a fallback if the status isn't found in the steps
    const stepIndex = currentIndex >= 0 ? currentIndex : 0;

    return (
        <div className={cn('w-full', className)}>
            <div className="relative">
                {/* Progress line */}
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                <div
                    className="absolute left-4 top-0 h-full w-0.5 bg-primary transition-all duration-500"
                    style={{
                        height: `${(stepIndex / (workflowSteps.length - 1)) * 100}%`,
                    }}
                />

                {/* Steps */}
                <div className="space-y-8">
                    {workflowSteps.map((step, index) => {
                        const isCompleted = index < stepIndex;
                        const isCurrent = index === stepIndex;
                        const isUpcoming = index > stepIndex;

                        return (
                            <div
                                key={step.status || 'step-' + index}
                                className={cn(
                                    'relative flex items-start gap-4',
                                    isCurrent && 'bg-gray-50 p-2 rounded-md shadow-sm' // Highlight current step
                                )}
                            >
                                {/* Step indicator */}
                                <div
                                    className={cn(
                                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
                                        isCompleted && 'border-primary bg-primary',
                                        isCurrent && 'border-primary border-2',
                                        isUpcoming && 'border-gray-200'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4 text-white" />
                                    ) : isCurrent ? (
                                        <Clock className="h-4 w-4 text-primary" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-gray-200" />
                                    )}
                                </div>

                                {/* Step content */}
                                <div className="flex-1">
                                    <h3
                                        className={cn(
                                            'text-sm font-medium',
                                            isCompleted && 'text-primary',
                                            isCurrent && 'text-primary font-bold', // Make current text bolder
                                            isUpcoming && 'text-gray-500'
                                        )}
                                    >
                                        {step.label || 'Unknown Step'}
                                        {isCurrent && (
                                            <span className="ml-2 inline-block bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </h3>
                                    <p className={cn(
                                        "text-sm",
                                        isCurrent ? "text-gray-700" : "text-gray-500"
                                    )}>
                                        {step.description || 'No description available'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
















