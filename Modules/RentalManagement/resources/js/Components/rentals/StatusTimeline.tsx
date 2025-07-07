import React, { useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { format } from "date-fns";
import { cn } from "@/Core";
import { ErrorBoundary } from "@/Core";
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

// ShadCN UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Core";

// Icons
import {
  CircleDashed,
  FileText,
  CheckCircle,
  Truck,
  Clock,
  CalendarCheck,
  Receipt,
  AlertCircle,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  name: string;
  description: string;
  date: string | null;
  icon: React.ElementType;
  color: string;
  active: boolean;
}

interface StatusTimelineProps {
  rental: any;
  className?: string;
}

export default function StatusTimeline({ rental, className = "" }: StatusTimelineProps) {
  const { t } = useTranslation('rental');

  const generateTimelineEvents = useCallback((): TimelineEvent[] => {
    // Ensure we have a valid rental with all the properties we need
    if (!rental) {
      return [];
    }

    // Function to safely format dates
    const safeFormatDate = (date: string | null | undefined): string | null => {
      if (!date) return null;
      try {
        return format(new Date(date), "MMM d, yyyy");
      } catch (e) {
        console.error("Invalid date format:", date);
        return null;
      }
    };

    // Define timeline events
    const events: TimelineEvent[] = [
      {
        id: "created",
        name: "Created",
        description: "Rental request created",
        date: safeFormatDate(rental.created_at),
        icon: CircleDashed,
        color: "bg-slate-100 text-slate-700 border-slate-200",
        active: true,
      },
      {
        id: "quotation",
        name: "Quotation",
        description: "Quotation generated",
        date: safeFormatDate(rental.quotation?.created_at),
        icon: FileText,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        active: !!rental.quotation,
      },
      {
        id: "quotation_approved",
        name: "Quotation Approved",
        description: "Approved by customer",
        date: safeFormatDate(rental.approved_at),
        icon: CheckCircle,
        color: "bg-green-100 text-green-700 border-green-200",
        active: !!rental.approved_at,
      },
      {
        id: "mobilization",
        name: "Mobilization",
        description: "Equipment delivery",
        date: safeFormatDate(rental.mobilization_date),
        icon: Truck,
        color: "bg-orange-100 text-orange-700 border-orange-200",
        active: !!rental.mobilization_date,
      },
      {
        id: "active",
        name: "Active",
        description: "Rental in progress",
        date: safeFormatDate(rental.start_date),
        icon: Clock,
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        active: rental.status === "active",
      },
      {
        id: "completed",
        name: "Completed",
        description: "Rental finished",
        date: safeFormatDate(rental.actual_end_date || rental.completed_at),
        icon: CalendarCheck,
        color: "bg-green-100 text-green-700 border-green-200",
        active: !!rental.actual_end_date || !!rental.completed_at,
      },
      {
        id: "invoice",
        name: "Invoice Created",
        description: "Invoice generated",
        date: safeFormatDate(rental.invoice_date),
        icon: Receipt,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        active: !!rental.invoice_date || rental.has_invoices,
      },
      {
        id: "overdue",
        name: "Overdue",
        description: "Payment overdue",
        date: safeFormatDate(rental.payment_due_date),
        icon: AlertCircle,
        color: "bg-red-100 text-red-700 border-red-200",
        active: rental.status === "overdue",
      },
    ];

    return events;
  }, [rental]);

  const timelineEvents = useMemo(() => generateTimelineEvents(), [generateTimelineEvents]);
  const activeEvents = useMemo(() => timelineEvents.filter(event => event.active), [timelineEvents]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('ttl_status_timeline')}</CardTitle>
        <CardDescription>{t('progress_of_your_rental')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activeEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('no_status_events_yet')}</p>
          ) : (
            <ErrorBoundary>
              <ol className="relative border-l border-muted">
                {activeEvents.map((event, index) => (
                  <li key={event.id} className="mb-6 ml-6">
                    <span className={cn(
                      "absolute flex items-center justify-center w-6 h-6 rounded-full -left-3",
                      event.color
                    )}>
                      <event.icon className="w-3 h-3" />
                    </span>
                    <h3 className="flex items-center mb-1 text-sm font-semibold">
                      {event.name}
                    </h3>
                    {event.date && (
                      <time className="block mb-1 text-xs font-normal text-muted-foreground">
                        {formatDateMedium(event.date)}
                      </time>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  </li>
                ))}
              </ol>
            </ErrorBoundary>
          )}
        </div>
      </CardContent>
    </Card>
  );
}














