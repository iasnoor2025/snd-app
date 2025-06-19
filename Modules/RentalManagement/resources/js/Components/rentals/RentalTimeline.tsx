import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, isBefore, isAfter, isSameDay, differenceInDays } from 'date-fns';
import { Rental } from '@/types/models';
import { Separator } from '@/Modules/Core/resources/js/components/ui/separator';
import { 
  Calendar, 
  FileText, 
  Truck, 
  PackageCheck, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Receipt 
} from 'lucide-react';

interface RentalTimelineProps {
  rental: Rental;
}

/**
 * Component to display a timeline of rental events
 */
const RentalTimeline = ({ rental }: RentalTimelineProps) => {
  const { t } = useTranslation('rental');

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Calculate timeline steps based on rental status
  const getTimelineSteps = () => {
    const steps = [];
    const today = new Date();
    
    // Creation step is always present
    steps.push({
      title: 'Rental Created',
      date: formatDate(rental.created_at),
      icon: <Calendar className="h-5 w-5 text-primary" />,
      status: 'completed',
      description: 'Rental request created and registered'
    })
    
    // Quotation step
    if (rental.quotation_id) {
      steps.push({
        title: 'Quotation Generated',
        date: rental.quotation?.created_at ? formatDate(rental.quotation.created_at) : '',
        icon: <FileText className="h-5 w-5 text-blue-500" />,
        status: 'completed',
        description: 'Quotation sent to customer for approval'
      })
    }
    
    // Mobilization step
    if (rental.status === 'mobilization' || ['active', 'completed', 'overdue'].includes(rental.status)) {
      steps.push({
        title: 'Equipment Mobilized',
        date: rental.mobilization_date ? formatDate(rental.mobilization_date) : '',
        icon: <Truck className="h-5 w-5 text-orange-500" />,
        status: 'completed',
        description: 'Equipment transported to customer location'
      })
    }
    
    // Active step
    if (['active', 'completed', 'overdue'].includes(rental.status)) {
      steps.push({
        title: 'Rental Active',
        date: formatDate(rental.start_date),
        icon: <PackageCheck className="h-5 w-5 text-green-500" />,
        status: 'completed',
        description: 'Equipment in use by customer'
      })
    } else if (rental.status === 'pending' && isAfter(today, new Date(rental.start_date))) {
      steps.push({
        title: 'Rental Active',
        date: formatDate(rental.start_date),
        icon: <PackageCheck className="h-5 w-5 text-muted-foreground" />,
        status: 'pending',
        description: 'Equipment in use by customer'
      })
    }
    
    // Completion step
    if (rental.status === 'completed') {
      steps.push({
        title: 'Rental Completed',
        date: formatDate(rental.actual_end_date || rental.expected_end_date),
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        status: 'completed',
        description: 'Equipment returned in good condition'
      })
      
      // Invoice step if we have an invoice date
      if (rental.invoice_date) {
        steps.push({
          title: 'Invoice Generated',
          date: formatDate(rental.invoice_date),
          icon: <Receipt className="h-5 w-5 text-purple-500" />,
          status: 'completed',
          description: 'Final invoice sent to customer'
        })
      }
    } else if (rental.status === 'overdue') {
      steps.push({
        title: 'Rental Overdue',
        date: formatDate(rental.expected_end_date),
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        status: 'current',
        description: 'Equipment has not been returned on time'
      })
    } else {
      // Future expected completion
      steps.push({
        title: 'Expected Completion',
        date: formatDate(rental.expected_end_date),
        icon: <Clock className="h-5 w-5 text-muted-foreground" />,
        status: 'upcoming',
        description: 'Scheduled equipment return date'
      })
    }
    
    return steps;
  };
  
  const timelineSteps = getTimelineSteps();

  return (
    <div className="relative space-y-6">
      {timelineSteps.map((step, index) => (
        <div key={index} className="relative">
          {/* Vertical connecting line between steps */}
          {index < timelineSteps.length - 1 && (
            <div 
              className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                step.status === 'completed' ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
          
          {/* The step itself */}
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
              step.status === 'completed' 
                ? 'bg-primary/10' 
                : step.status === 'current' 
                ? 'bg-red-100 animate-pulse' 
                : 'bg-muted'
            }`}>
              {step.icon}
            </div>
            
            <div>
              <div className="flex items-baseline gap-2">
                <h4 className="text-sm font-medium">{step.title}</h4>
                {step.date && (
                  <span className="text-xs text-muted-foreground">{step.date}</span>
                )}
              </div>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RentalTimeline; 















