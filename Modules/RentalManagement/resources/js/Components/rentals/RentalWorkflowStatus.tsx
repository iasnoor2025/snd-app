import React from "react";
import { useTranslation } from 'react-i18next';
import { Rental } from "@/Core/types/models";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePermission } from "@/Core";
import { cn } from "@/Core";
import { Inertia } from '@inertiajs/inertia';

// ShadCN UI Components
import { Button } from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/Core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Core";
import { Badge } from "@/Core";

// Icons
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  CircleDashed,
  ClipboardCheck,
  Clock,
  FileText,
  Receipt,
  Truck,
} from "lucide-react";

interface RentalWorkflowStatusProps {
  rental: Rental;
  nextPossibleStates?: string[];
  className?: string;
}

const workflowSteps = [
  {
    id: 'pending',
    name: 'Pending',
    description: 'Rental created, awaiting quotation',
    icon: CircleDashed,
    color: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  {
    id: 'quotation',
    name: 'Quotation',
    description: 'Quotation generated',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'quotation_approved',
    name: 'Quotation Approved',
    description: 'Quotation approved by client',
    icon: ClipboardCheck,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'mobilization',
    name: 'Mobilization',
    description: 'Equipment being dispatched',
    icon: Truck,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: 'mobilization_completed',
    name: 'Mobilization Completed',
    description: 'Equipment delivered to site',
    icon: CheckCircle,
    color: 'bg-teal-100 text-teal-700 border-teal-200'
  },
  {
    id: 'active',
    name: 'Active',
    description: 'Rental in progress',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  {
    id: 'completed',
    name: 'Completed',
    description: 'Rental finished',
    icon: CalendarCheck,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'invoice_prepared',
    name: 'Invoice Prepared',
    description: 'Invoice generated',
    icon: Receipt,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    id: 'payment_pending',
    name: 'Payment Pending',
    description: 'Awaiting payment',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  {
    id: 'overdue',
    name: 'Overdue',
    description: 'Payment overdue',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  {
    id: 'closed',
    name: 'Closed',
    description: 'Rental and payment completed',
    icon: CheckCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  }
];

export default function RentalWorkflowStatus({
  rental,
  nextPossibleStates = [],
  className = ""
}: RentalWorkflowStatusProps) {
  const { t } = useTranslation('rental');

  const { hasPermission } = usePermission();
  const canEditRentals = hasPermission('rentals.edit');

  // Add permission check for showing status action button
  const isAdmin = hasPermission('admin');
  const canEdit = isAdmin || hasPermission('rentals.edit');

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogAction, setDialogAction] = React.useState<{
    title: string;
    description: string;
    confirmText: string;
    action: () => void;
  }>({
    title: "",
    description: "",
    confirmText: "",
    action: () => {},
  })

  // Ensure rental.status is a valid string if not set properly
  const safeStatus = React.useMemo(() => {
    if (!rental.status || typeof rental.status !== 'string') {
      console.warn(`Invalid rental status: ${rental.status}, defaulting to 'pending'`);
      return 'pending';
    }
    return rental.status;
  }, [rental.status]);

  // Find the current step in the workflow
  const currentStep = workflowSteps.find(step => step.id === safeStatus) || workflowSteps[0];
  const currentStepIndex = workflowSteps.findIndex(step => step.id === safeStatus);

  // Determine which steps are next possible states
  const possibleNextSteps = nextPossibleStates && Array.isArray(nextPossibleStates)
    ? workflowSteps.filter(step => nextPossibleStates.includes(step.id))
    : [];

  const confirmAction = (
    title: string,
    description: string,
    confirmText: string,
    action: () => void
  ) => {
    setDialogAction({
      title,
      description,
      confirmText,
      action,
    })
    setIsDialogOpen(true);
  };

  // Action handler factory
  const createActionHandler = (
    statusId: string,
    title: string,
    description: string,
    routeName: string,
    confirmText: string = 'Confirm'
  ) => {
    return () => {
      confirmAction(
        title,
        description,
        confirmText,
        () => {
          // Actually send the POST request to the backend
          try {
            Inertia.post(route(routeName, rental.id), {}, {
              preserveScroll: true,
              preserveState: true,
              replace: true,
              onError: (errors) => {
                console.error('Workflow action error:', errors);
              },
              onSuccess: () => {
                console.log('Workflow action completed successfully');
              }
            });
          } catch (error) {
            console.error('Error in workflow action:', error);
          }
        }
      );
    };
  };

  // Map of status actions
  const statusActions: Record<string, {
    handler: () => void;
    buttonText: string;
    icon: React.ComponentType<any>
  }> = {
    'pending': {
      handler: createActionHandler(
        'quotation',
        'Generate Quotation',
        'Generate a quotation based on the rental details?',
        'rentals.generate-quotation',
        'Generate'
      ),
      buttonText: 'Generate Quotation',
      icon: FileText
    },
    'quotation': {
      handler: createActionHandler(
        'quotation_approved',
        'Approve Quotation',
        'Mark the quotation as approved?',
        'rentals.approve-quotation',
        'Approve'
      ),
      buttonText: 'Approve Quotation',
      icon: CheckCircle
    },
    'quotation_approved': {
      handler: createActionHandler(
        'mobilization',
        'Start Mobilization',
        'Begin the equipment mobilization process?',
        'rentals.start-mobilization',
        'Start'
      ),
      buttonText: 'Start Mobilization',
      icon: Truck
    },
    'mobilization': {
      handler: createActionHandler(
        'mobilization_completed',
        'Complete Mobilization',
        'Mark the mobilization as completed?',
        'rentals.complete-mobilization',
        'Complete'
      ),
      buttonText: 'Complete Mobilization',
      icon: CheckCircle
    },
    'mobilization_completed': {
      handler: createActionHandler(
        'active',
        'Start Rental',
        'Activate this rental? This will mark equipment as rented.',
        'rentals.start',
        'Start'
      ),
      buttonText: 'Start Rental',
      icon: Clock
    },
    'active': {
      handler: createActionHandler(
        'completed',
        'Complete Rental',
        'Mark this rental as completed? Equipment will be marked as available again.',
        'rentals.complete',
        'Complete'
      ),
      buttonText: 'Complete Rental',
      icon: CalendarCheck
    },
    'completed': {
      handler: createActionHandler(
        'invoice_prepared',
        'Create Invoice',
        'Generate an invoice for this rental?',
        'rentals.create-invoice',
        'Create'
      ),
      buttonText: 'Create Invoice',
      icon: Receipt
    },
    'invoice_prepared': {
      handler: createActionHandler(
        'payment_pending',
        'Mark Payment Pending',
        'Mark this rental as payment pending?',
        'rentals.mark-payment-pending',
        'Confirm'
      ),
      buttonText: 'Mark Payment Pending',
      icon: Clock
    },
    'payment_pending': {
      handler: createActionHandler(
        'closed',
        'Mark as Closed',
        'Mark this rental as closed? This is the final state.',
        'rentals.mark-closed',
        'Close'
      ),
      buttonText: 'Mark as Closed',
      icon: CheckCircle
    },
    'overdue': {
      handler: createActionHandler(
        'closed',
        'Mark as Closed',
        'Mark this rental as closed despite being overdue? This is the final state.',
        'rentals.mark-closed',
        'Close'
      ),
      buttonText: 'Mark as Closed',
      icon: CheckCircle
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('rental_status')}</span>
          <Badge
            variant="outline"
            className={`text-sm px-3 py-1 ${currentStep.color}`}>
            {React.createElement(currentStep.icon, { className: "w-4 h-4 mr-2" })}
            {currentStep.name}
          </Badge>
        </CardTitle>
        <CardDescription>
          {currentStep.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Visual Workflow Steps */}
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-4 top-4 h-full w-0.5 bg-gray-200" />
            <div
              className="absolute left-4 top-4 h-full w-0.5 bg-primary transition-all duration-500"
              style={{
                height: `${(currentStepIndex / (workflowSteps.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="space-y-6">
              {workflowSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isUpcoming = index > currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <TooltipProvider key={step.id || `step-${index}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "relative flex items-start gap-4",
                            isCurrent && "bg-gray-50 p-2 rounded-md shadow-sm"
                          )}
                        >
                          {/* Step indicator */}
                          <div
                            className={cn(
                              "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                              isCompleted && "border-primary bg-primary",
                              isCurrent && "border-primary",
                              isUpcoming && "border-gray-200"
                            )}
                          >
                            <StepIcon
                              className={cn(
                                "h-4 w-4",
                                isCompleted && "text-white",
                                isCurrent && "text-primary",
                                isUpcoming && "text-gray-400"
                              )}
                            />
                          </div>

                          {/* Step content */}
                          <div className="flex-1">
                            <h3
                              className={cn(
                                "text-sm font-medium",
                                isCurrent && "text-primary"
                              )}
                            >
                              {step.name}
                              {isCurrent && (
                                <span className="ml-2 inline-block align-middle text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Current</span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                            {/* Render action button for current step if allowed */}
                            {isCurrent && statusActions[step.id] && canEdit && (() => {
                              const Icon = statusActions[step.id].icon;
                              return (
                                <Button
                                  className="mt-2"
                                  size="sm"
                                  variant="default"
                                  onClick={statusActions[step.id].handler}
                                >
                                  {Icon && <Icon className="w-4 h-4 mr-2 inline-block align-text-bottom" />}
                                  {statusActions[step.id].buttonText}
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{step.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>

          {/* Dates info */}
          <div className="text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Start Date:</span>
              <span>{rental.start_date ? format(new Date(rental.start_date), 'MMM d, yyyy') : 'Not set'}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-medium">Expected End:</span>
              <span>{rental.expected_end_date ? format(new Date(rental.expected_end_date), 'MMM d, yyyy') : 'Not set'}</span>
            </div>
            {rental.actual_end_date && (
              <div className="flex justify-between mt-1">
                <span className="font-medium">Actual End:</span>
                <span>{format(new Date(rental.actual_end_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {/* {rental.duration_days !== undefined && (
              <div className="flex justify-between mt-1">
                <span className="font-medium">Duration:</span>
                <span>{rental.duration_days} days</span>
              </div>
            )} */}
          </div>

          {/* Action buttons */}
          {canEditRentals && possibleNextSteps.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              {possibleNextSteps.map(step => {
                const action = statusActions[step.id];
                if (!action) return null;

                const ActionIcon = action.icon;

                return (
                  <Button
                    key={step.id}
                    onClick={action.handler}
                    variant="outline"
                    className="w-full flex items-center justify-start text-left"
                  >
                    <ActionIcon className="w-4 h-4 mr-2" />
                    {action.buttonText}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction.title}</DialogTitle>
            <DialogDescription>{dialogAction.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                dialogAction.action();
                setIsDialogOpen(false);
              }}
            >
              {dialogAction.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

















