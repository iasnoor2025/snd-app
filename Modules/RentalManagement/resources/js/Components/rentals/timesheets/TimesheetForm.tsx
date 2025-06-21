import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Head, Link, router, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import { z } from "zod";

// Standardize all UI imports to '@/Core/components/ui/'
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/Core";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Core";
import { Textarea } from "@/Core";
import { Separator } from "@/Core";
import { AlertCircle, CalendarIcon, Clock, Loader2, MoreHorizontal, UserX } from "lucide-react";
import { Calendar } from "@/Core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Core";
import { cn } from "@/Core";
import { toast } from "sonner";
import { TimePicker } from "@/Core";
import { Alert, AlertDescription, AlertTitle } from "@/Core";
import { Checkbox } from "@/Core";

interface Props {
  rentals?: any[];
  rentalItems?: any[];
  operators?: any[];
  equipment?: any[];
  timesheet?: any;
  rental?: any;
  isEditing?: boolean;
  auth?: {
    user: {
      role: string;
    };
  };
}

const formSchema = z.object({
  rental_id: z.number().min(1, "Rental is required"),
  rental_item_id: z.number().min(1, "Equipment is required"),
  operator_id: z.number().min(1, "Operator is required"),
  date: z.date({ required_error: "Date is required" }),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  hours_used: z.coerce.number()
    .min(0.5, "Minimum 0.5 hours required")
    .max(24, "Maximum 24 hours allowed"),
  rate: z.coerce.number().min(0, "Rate must be 0 or greater"),
  notes: z.string().optional(),
  operator_absent: z.boolean().optional(),
  is_bulk: z.boolean().optional(),
  bulk_dates: z.array(z.date()).optional(),
  bulk_rental_items: z.array(z.number()).optional(),
  bulk_operators: z.array(z.number()).optional(),
}).refine((data) => {
  // Validate that end time is after start time
  const start = new Date(`2000-01-01T${data.start_time}`);
  const end = new Date(`2000-01-01T${data.end_time}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["end_time"],
}).refine((data) => {
  // Validate that operator is active
  const operator = operators.find(op => op.id === data.operator_id);
  return operator?.status === 'active';
}, {
  message: "Selected operator is not active",
  path: ["operator_id"],
}).refine((data) => {
  // Validate that rental item belongs to the selected rental
  const rentalItem = rentalItems.find(item => item.id === data.rental_item_id);
  return rentalItem?.rental_id === data.rental_id;
}, {
  message: "Selected equipment does not belong to this rental",
  path: ["rental_item_id"],
}).refine((data) => {
  // Validate that rental is active
  const rental = rentals.find(r => r.id === data.rental_id);
  return rental?.status === 'active';
}, {
  message: "Timesheets can only be created for active rentals",
  path: ["rental_id"],
}).refine((data) => {
  // Validate that rental item has valid equipment
  const rentalItem = rentalItems.find(item => item.id === data.rental_item_id);
  return rentalItem?.equipment_id !== null && rentalItem?.equipment_id !== undefined;
}, {
  message: "Selected equipment is not properly configured",
  path: ["rental_item_id"],
}).refine((data) => {
  // Validate that rental item has a valid rate
  const rentalItem = rentalItems.find(item => item.id === data.rental_item_id);
  return rentalItem?.rate > 0;
}, {
  message: "Selected equipment must have a valid rate",
  path: ["rental_item_id"],
}).refine((data) => {
  // Validate that date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return data.date <= today;
}, {
  message: "Timesheet date cannot be in the future",
  path: ["date"],
}).refine((data) => {
  // Validate that date is not before rental start date
  const rental = rentals.find(r => r.id === data.rental_id);
  if (!rental?.start_date) return true;
  const rentalStartDate = new Date(rental.start_date);
  rentalStartDate.setHours(0, 0, 0, 0);
  return data.date >= rentalStartDate;
}, {
  message: "Timesheet date cannot be before rental start date",
  path: ["date"],
}).refine((data) => {
  // Validate that date is not after rental end date if it exists
  const rental = rentals.find(r => r.id === data.rental_id);
  if (!rental?.end_date) return true;
  const rentalEndDate = new Date(rental.end_date);
  rentalEndDate.setHours(0, 0, 0, 0);
  return data.date <= rentalEndDate;
}, {
  message: "Timesheet date cannot be after rental end date",
  path: ["date"],
}).refine((data) => {
  // Validate bulk operation data if is_bulk is true
  if (data.is_bulk) {
    if (!data.bulk_dates || data.bulk_dates.length === 0) {
      return false;
    }
    if (!data.bulk_rental_items || data.bulk_rental_items.length === 0) {
      return false;
    }
    if (!data.bulk_operators || data.bulk_operators.length === 0) {
      return false;
    }

    // Validate all dates in bulk_dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rental = rentals.find(r => r.id === data.rental_id);
    const rentalStartDate = rental?.start_date ? new Date(rental.start_date) : null;
    const rentalEndDate = rental?.end_date ? new Date(rental.end_date) : null;

    return data.bulk_dates.every(date => {
      if (date > today) return false;
      if (rentalStartDate && date < rentalStartDate) return false;
      if (rentalEndDate && date > rentalEndDate) return false;
      return true;
    })
  }
  return true;
}, {
  message: "Invalid bulk operation data",
  path: ["is_bulk"],
})

export default function TimesheetForm({ rentals = [], rentalItems = [], operators = [], equipment = [], timesheet, rental, isEditing = false, auth }: Props) {
  const { t } = useTranslation('rental');

  const [hours, setHours] = useState<number | null>(0);
  const [selectedRental, setSelectedRental] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [useDirectSubmit, setUseDirectSubmit] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedRentalItem, setSelectedRentalItem] = useState<any | null>(null);
  const [operatorAbsent, setOperatorAbsent] = useState<boolean>(false);

  // Get the selected rental from props or from form data
  const safeRental = rental || (timesheet?.rental_id && rentals.find(r => r.id.toString() === timesheet.rental_id.toString())) || null;
  const safeRentalId = safeRental?.id || timesheet?.rental_id || "";

  // Calculate hours between start and end time when they change
  const calculateHours = (start: string | null, end: string | null) => {
    if (!start || !end) return 0;

    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);

    // Calculate difference in milliseconds and convert to hours
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  };

  // Get the rate for a rental item based on its rate type
  const getRentalItemRate = (rentalItem: any) => {
    if (!rentalItem?.equipment) return rentalItem?.rate || 0;

    const rateType = rentalItem.rate_type;
    const rateField = rateType + '_rate';
    return rentalItem.equipment[rateField] || rentalItem.rate || 0;
  };

  // Filter rental items based on editing mode
  const validRentalItems = useMemo(() => {
    // For editing, include the current timesheet's rental item regardless of equipment status
    if (isEditing && timesheet) {
      return rentalItems.map(item => ({
        ...item,
        equipment: item.equipment,
        rate: getRentalItemRate(item)
      }));
    }

    // For creating, only show items with active equipment
    return rentalItems
      .filter(item => item.equipment && item.equipment.id && item.equipment.status === 'active')
      .map(item => ({
        ...item,
        equipment: item.equipment,
        rate: getRentalItemRate(item)
      }));
  }, [rentalItems, isEditing, timesheet]);

  // Debug logging for equipment data
  useEffect(() => {

  }, [rentalItems]);

  const form = useForm({
    rental_id: safeRental?.id.toString() || "",
    rental_item_id: timesheet?.rental_item_id?.toString() || "",
    equipment_id: "",
    date: timesheet?.date || format(new Date(), "yyyy-MM-dd"),
    start_time: timesheet?.start_time || "08:00",
    end_time: timesheet?.end_time || "17:00",
    hours_used: timesheet?.hours_used?.toString() || "8",
    notes: timesheet?.notes || "",
    operator_id: timesheet?.operator_id?.toString() || "none",
    operator_absent: timesheet?.operator_absent || false,
    rate: timesheet?.rate || 0,
    total_amount: timesheet?.total_amount || 0,
    _token: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || "",
  })

  // Initialize form data when in edit mode
  useEffect(() => {
    if (isEditing && timesheet) {


      // Check if operator is marked as absent
      if (timesheet.operator_absent) {
        setOperatorAbsent(true);
      }

      // Format dates properly for the form
      const formattedDate = timesheet.date
        ? format(new Date(timesheet.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      // Format times - ensure they're in HH:mm format
      const formatTimeValue = (time: any) => {
        if (!time) return "";
        try {
          if (typeof time === 'string') {
            // If it's a time string like "08:00", return it as is
            if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
              return time.substring(0, 5); // Ensure format is HH:MM
            }

            // Otherwise try to parse it as a date
            const date = new Date(time);
            return isNaN(date.getTime()) ? "" : format(date, "HH:mm");
          }
          return "";
        } catch (error) {

          return "";
        }
      };

      const startTime = formatTimeValue(timesheet.start_time);
      const endTime = formatTimeValue(timesheet.end_time);

      // Get equipment ID from either rental item or direct equipment relationship
      const equipmentId = timesheet.rentalItem?.equipment_id || timesheet.equipment_id || "";

      // Find the rental item
      const currentRentalItem = validRentalItems.find(item =>
        item.id.toString() === timesheet.rental_item_id?.toString()
      );

      if (currentRentalItem) {
        setSelectedRentalItem(currentRentalItem);

      }

      // Set form data
      form.setData({
        rental_id: timesheet.rental_id?.toString() || "",
        rental_item_id: timesheet.rental_item_id?.toString() || "",
        equipment_id: equipmentId.toString(),
        date: formattedDate,
        start_time: startTime || "08:00",
        end_time: endTime || "17:00",
        hours_used: timesheet.hours_used?.toString() || "8",
        notes: timesheet.notes || "",
        operator_id: timesheet.operator_id?.toString() || "none",
        operator_absent: timesheet.operator_absent || false,
        rate: timesheet.rate || (currentRentalItem ? getRentalItemRate(currentRentalItem) : 0),
        total_amount: timesheet.total_amount || 0,
      })

      // Set hours for the UI
      setHours(timesheet.hours_used ? parseFloat(timesheet.hours_used.toString()) : 8);

      // Set selected equipment ID
      if (equipmentId) {
        setSelectedEquipmentId(equipmentId.toString());
      }


    }
  }, [isEditing, timesheet]);

  // Handle operator absent checkbox change
  const handleOperatorAbsentChange = (checked: boolean) => {
    setOperatorAbsent(checked);
    form.setData('operator_absent', checked);

    // If operator is absent, set hours to 0
    if (checked) {
      setHours(0);
      form.setData('hours_used', '0');
      form.setData('total_amount', 0);
    } else {
      // Recalculate hours based on times
      const calculatedHours = calculateHours(form.data.start_time, form.data.end_time);
      setHours(calculatedHours);
      form.setData('hours_used', calculatedHours.toString());

      // Update total amount if we have a rate
      if (selectedRentalItem) {
        const rate = getRentalItemRate(selectedRentalItem);
        form.setData('total_amount', rate * calculatedHours);
      }
    }
  };

  // Update hours when start or end time changes
  useEffect(() => {
    if (form.data.start_time && form.data.end_time && !operatorAbsent) {
      const calculatedHours = calculateHours(form.data.start_time, form.data.end_time);
      setHours(calculatedHours);
      form.setData('hours_used', calculatedHours.toString());

      // Update total amount if we have a rate
      if (selectedRentalItem) {
        const rate = getRentalItemRate(selectedRentalItem);
        form.setData('total_amount', rate * calculatedHours);
      }
    }
  }, [form.data.start_time, form.data.end_time, operatorAbsent]);

  // Allow manual adjustment of hours when needed
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setHours(isNaN(value) ? 0 : value);
    form.setData("hours_used", isNaN(value) ? 0 : value);
  };

  // Handle rental selection change with additional error handling
  const handleRentalChange = (rentalId: string) => {
    if (!rentalId) {
      setError("Please select a valid rental");
      return;
    }

    setError(null);
    form.setData("rental_id", rentalId);
    form.setData("rental_item_id", ""); // Reset equipment selection

    try {
      router.get(route("rental-timesheets.create", { rental_id: rentalId }), {}, { preserveState: true })
    } catch (err) {

      setError("Failed to load rental data. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare form data
      const formData = {
        ...form.data,
        hours_used: form.data.hours_used || "0",
        operator_id: form.data.operator_id === "none" ? null : form.data.operator_id,
        operator_absent: operatorAbsent,
      };



      // Make API call based on whether we're editing or creating
      if (isEditing && timesheet) {
        form.put(route("rental-timesheets.update", timesheet.id), {
          onSuccess: () => {
            setSubmitting(false);
            toast.success("Timesheet updated successfully");
            window.location.href = route("rental-timesheets.show", timesheet.id);
          },
          onError: (errors) => handleFormErrors(errors),
        })
      } else {
        form.post(route("rental-timesheets.store"), {
          onSuccess: (page) => {
            setSubmitting(false);
            toast.success("Timesheet created successfully");
            window.location.href = route("rental-timesheets.show", page.props.timesheet.id);
          },
          onError: (errors) => handleFormErrors(errors),
        })
      }
    } catch (error) {

      setSubmitting(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  // Handle rental item selection
  const handleRentalItemChange = (value: string) => {



    const rentalItem = validRentalItems.find(item => item.id.toString() === value);

    if (rentalItem) {
      setSelectedRentalItem(rentalItem);
      const equipmentId = rentalItem.equipment?.id?.toString() || "";
      const rate = getRentalItemRate(rentalItem);
      const hoursValue = parseFloat(form.data.hours_used?.toString() || "0");

      form.setData({
        ...form.data,
        rental_item_id: value,
        equipment_id: equipmentId,
        rate: rate,
        total_amount: rate * hoursValue
      })


    } else {

    }
  };

  // Debug logging




  const basicHtmlFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = document.getElementById('basic-form') as HTMLFormElement;
    formElement.submit();
  };

  // Check if user has admin/manager/accountant role
  const hasAdminAccess = auth?.user?.role === 'admin' ||
                        auth?.user?.role === 'manager' ||
                        auth?.user?.role === 'accountant';

  // Check if timesheet is completed
  const isCompleted = timesheet?.status === 'completed';

  // Add action handlers
  const handleTimesheetAction = (action: 'approve' | 'reject' | 'void' | 'edit' | 'delete') => {
    if (!timesheet?.id) return;

    if (action === 'edit') {
      router.visit(route('rental-timesheets.edit', timesheet.id));
      return;
    }

    if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this timesheet?')) {
        router.delete(route('rental-timesheets.destroy', timesheet.id), {
          onSuccess: () => {
            toast.success('Timesheet deleted successfully');
            router.visit(route('rentals.timesheets', timesheet.rental_id));
          },
          onError: (errors) => {

            toast.error(`Failed to delete timesheet: ${Object.values(errors).join(", ")}`);
          }
        })
      }
      return;
    }

    const actionMap = {
      approve: 'approved',
      reject: 'rejected',
      void: 'voided'
    };

    const confirmMessages = {
      approve: 'Are you sure you want to approve this timesheet?',
      reject: 'Are you sure you want to reject this timesheet?',
      void: 'Are you sure you want to void this timesheet?'
    };

    if (window.confirm(confirmMessages[action])) {
      router.put(route('rental-timesheets.update-status', timesheet.id), {
        status: actionMap[action]
      }, {
        onSuccess: () => {
          toast.success(`Timesheet ${actionMap[action]} successfully`);
          router.reload();
        },
        onError: (errors) => {

          toast.error(`Failed to ${action} timesheet: ${Object.values(errors).join(", ")}`);
        }
      })
    }
  };

  // Equipment Selection Section
  const renderEquipmentSelection = () => {


    if (validRentalItems.length === 0) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('ttl_no_equipment_available')}</AlertTitle>
          <AlertDescription>
            No active equipment is available for this rental. Please ensure equipment is properly assigned to the rental and is active.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        <Select
          value={form.data.rental_item_id?.toString() || ""}
          onValueChange={handleRentalItemChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('ph_select_equipment')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t('lbl_available_equipment')}</SelectLabel>
              {validRentalItems.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.equipment?.name || "Unnamed Equipment"}
                  {item.equipment?.serial_number && (
                    <span className="text-muted-foreground ml-2">
                      (SN: {item.equipment.serial_number})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </>
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);

    // Validate operator availability
    const operator = operators.find(e => e.id === values.operator_id);
    if (!operator || operator.status !== 'active') {
      toast.error("Selected operator is not available");
      setSubmitting(false);
      return;
    }

    // Check for overlapping timesheets
    const overlappingTimesheet = timesheet && timesheets.find(t => {
      if (t.operator_id !== values.operator_id) return false;
      if (format(new Date(t.date), 'yyyy-MM-dd') !== format(values.date, 'yyyy-MM-dd')) return false;

      const existingStart = new Date(`${t.date} ${t.start_time}`);
      const existingEnd = new Date(`${t.date} ${t.end_time}`);
      const newStart = new Date(`${format(values.date, 'yyyy-MM-dd')} ${values.start_time}`);
      const newEnd = new Date(`${format(values.date, 'yyyy-MM-dd')} ${values.end_time}`);

      return (newStart >= existingStart && newStart < existingEnd) ||
             (newEnd > existingStart && newEnd <= existingEnd) ||
             (newStart <= existingStart && newEnd >= existingEnd);
    })

    if (overlappingTimesheet) {
      toast.error("Operator already has a timesheet entry for this time period");
      setSubmitting(false);
      return;
    }

    // Update inertia form data
    form.setData("rental_id", values.rental_id.toString());
    form.setData("operator_id", values.operator_id);
    form.setData("date", format(values.date, "yyyy-MM-dd"));
    form.setData("start_time", values.start_time);
    form.setData("end_time", values.end_time);
    form.setData("hours_used", values.hours.toString());
    form.setData("rate", values.rate);
    form.setData("notes", values.notes || "");

    // Submit the form
    form.post(route("rental-timesheets.store"), {
      onSuccess: () => {
        toast.success("Timesheet entry created successfully");
        router.visit(route("rentals.show", values.rental_id));
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        })
        setSubmitting(false);
      },
    })
  };

  return (
    <form onSubmit={onSubmit} id="timesheet-form">
      <input type="hidden" name="_token" value={form.data._token} />
      {isEditing && <input type="hidden" name="_method" value="PUT" />}
      {/* Other hidden fields for non-Ajax submission */}
      <input type="hidden" name="rental_id" value={form.data.rental_id} />
      <input type="hidden" name="rental_item_id" value={form.data.rental_item_id} />
      <input type="hidden" name="date" value={form.data.date} />
      <input type="hidden" name="start_time" value={form.data.start_time} />
      <input type="hidden" name="end_time" value={form.data.end_time} />
      <input type="hidden" name="hours_used" value={form.data.hours_used} />
      <input type="hidden" name="operator_id" value={form.data.operator_id === 'none' ? '' : form.data.operator_id} />
      <input type="hidden" name="operator_absent" value={operatorAbsent ? '1' : '0'} />
      <input type="hidden" name="notes" value={form.data.notes} />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">{t('ttl_timesheet_details')}</CardTitle>
              <CardDescription>
                {isEditing ? "Update" : "Create"} timesheet for tracking equipment usage
              </CardDescription>
            </div>
            {isEditing && hasAdminAccess && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t('open_menu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isCompleted ? (
                    <>
                      <DropdownMenuItem onClick={() => handleTimesheetAction('approve')}>
                        Approve Timesheet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTimesheetAction('reject')}>
                        Reject Timesheet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTimesheetAction('void')} className="text-destructive">
                        Void Timesheet
                      </DropdownMenuItem>
                    </>
                  ) : null}
                  <DropdownMenuItem onClick={() => handleTimesheetAction('edit')}>
                    Edit Timesheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTimesheetAction('delete')} className="text-destructive">
                    Delete Timesheet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Equipment and Operator Selection in one line */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equipment Selection */}
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                {renderEquipmentSelection()}
                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </div>

              {/* Operator Selection */}
              <div className="space-y-2">
                <Label>Operator</Label>
                <Select
                  value={form.data.operator_id?.toString() || "none"}
                  onValueChange={(value) => {
                    form.setData("operator_id", value === "none" ? null : parseInt(value));
                    // Clear operator absent if no operator is selected
                    if (value === 'none' && operatorAbsent) {
                      handleOperatorAbsentChange(false);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('ph_select_operator')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('opt_no_operator')}</SelectItem>
                    {operators.map((operator) => (
                      <SelectItem key={operator.id} value={operator.id.toString()}>
                        {operator.first_name} {operator.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.operator_id && (
                  <p className="text-xs text-destructive mt-1">{form.errors.operator_id}</p>
                )}
              </div>
            </div>

            {/* Operator Absent Checkbox */}
            {(form.data.operator_id !== 'none' && form.data.operator_id) && (
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="operator_absent"
                  checked={operatorAbsent}
                  onCheckedChange={handleOperatorAbsentChange}
                />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="operator_absent"
                    className="text-base flex items-center gap-1 cursor-pointer"
                  >
                    {t('mark_operator_as_absent')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hours will be set to 0 and no time entries will be recorded
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.data.date && "text-muted-foreground",
                          form.errors.date && "border-destructive",
                        )}
                        disabled={submitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.data.date ? (
                          format(new Date(form.data.date), "MMMM d, yyyy")
                        ) : (
                          <span>{t('select_a_date')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.data.date ? new Date(form.data.date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, "yyyy-MM-dd");
                            form.setData("date", formattedDate);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {form.errors.date && (
                  <p className="text-xs text-destructive mt-1">{form.errors.date}</p>
                )}
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="start_time">{t('lbl_start_time')} <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <TimePicker
                    value={form.data.start_time}
                    onChange={(time) => {
                      form.setData("start_time", time);
                      if (form.data.end_time) {
                        try {
                          // Calculate hours
                          const startDate = new Date(`2023-01-01 ${time}`);
                          const endDate = new Date(`2023-01-01 ${form.data.end_time}`);

                          // If end time is earlier than start time, assume it's the next day
                          let endDateAdjusted = endDate;
                          if (endDate < startDate) {
                            endDateAdjusted = new Date(endDate);
                            endDateAdjusted.setDate(endDateAdjusted.getDate() + 1);
                          }

                          const diffMs = endDateAdjusted.getTime() - startDate.getTime();
                          const diffHours = diffMs / (1000 * 60 * 60);

                          setHours(diffHours);
                          form.setData("hours_used", diffHours.toString());
                        } catch (error) {

                        }
                      }
                    }}
                    disabled={submitting}
                  />
                </div>
                {form.errors.start_time && (
                  <p className="text-xs text-destructive mt-1">{form.errors.start_time}</p>
                )}
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="end_time">{t('end_time')} <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <TimePicker
                    value={form.data.end_time}
                    onChange={(time) => {
                      form.setData("end_time", time);
                      if (form.data.start_time) {
                        try {
                          // Calculate hours
                          const startDate = new Date(`2023-01-01 ${form.data.start_time}`);
                          const endDate = new Date(`2023-01-01 ${time}`);

                          // If end time is earlier than start time, assume it's the next day
                          let endDateAdjusted = endDate;
                          if (endDate < startDate) {
                            endDateAdjusted = new Date(endDate);
                            endDateAdjusted.setDate(endDateAdjusted.getDate() + 1);
                          }

                          const diffMs = endDateAdjusted.getTime() - startDate.getTime();
                          const diffHours = diffMs / (1000 * 60 * 60);

                          setHours(diffHours);
                          form.setData("hours_used", diffHours.toString());
                        } catch (error) {

                        }
                      }
                    }}
                    disabled={submitting}
                  />
                </div>
                {form.errors.end_time && (
                  <p className="text-xs text-destructive mt-1">{form.errors.end_time}</p>
                )}
              </div>
            </div>

            {/* Hours Used */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hours_used">{t('lbl_hours_used')} <span className="text-destructive">*</span></Label>
                <Input
                  id="hours_used"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={form.data.hours_used}
                  onChange={handleHoursChange}
                  disabled={submitting}
                  className={form.errors.hours_used ? "border-destructive" : ""}
                />
                {form.errors.hours_used && (
                  <p className="text-xs text-destructive mt-1">{form.errors.hours_used}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.data.notes}
                onChange={(e) => form.setData("notes", e.target.value)}
                disabled={submitting}
                className={form.errors.notes ? "border-destructive" : ""}
                placeholder={t('ph_enter_any_additional_notes_or_comments')}
                rows={3}
              />
              {form.errors.notes && (
                <p className="text-xs text-destructive mt-1">{form.errors.notes}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"} Timesheet
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Summary and Submit Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="space-y-1.5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('ttl_timesheet_summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span>Date:</span>
                  <span>{form.data.date ? format(new Date(form.data.date), "MMMM d, yyyy") : "Not set"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span>Equipment:</span>
                  <span>{selectedRentalItem?.equipment?.name || "Not selected"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span>Operator:</span>
                  <span>
                    {operatorAbsent ? (
                      <span className="flex items-center gap-1 text-red-600">
                        <UserX className="h-3 w-3" />
                        {t('operator_absent')}
                      </span>
                    ) : form.data.operator_id && form.data.operator_id !== "none" ? (
                      operators.find(op => op.id.toString() === form.data.operator_id)?.first_name + " " +
                      operators.find(op => op.id.toString() === form.data.operator_id)?.last_name
                    ) : (
                      "No operator"
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span>Time:</span>
                  <span>
                    {operatorAbsent ? (
                      <span className="text-red-600">{t('not_applicable')}</span>
                    ) : (
                      `${form.data.start_time || "?"} - ${form.data.end_time || "?"}`
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span>Hours:</span>
                  <span>{operatorAbsent ? "0" : form.data.hours_used}</span>
                </div>
                {selectedRentalItem && (
                  <>
                    <div className="grid grid-cols-2">
                      <span>Rate:</span>
                      <span>${getRentalItemRate(selectedRentalItem)}/hr</span>
                    </div>
                    <div className="grid grid-cols-2 font-bold">
                      <span>Total:</span>
                      <span>
                        ${operatorAbsent ?
                          "0.00" :
                          (getRentalItemRate(selectedRentalItem) * (parseFloat(form.data.hours_used) || 0)).toFixed(2)
                        }
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}















