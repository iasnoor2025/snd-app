import { z } from 'zod';
import { commonSchemas, requiredString } from './common.schema';
import { useTranslation } from 'react-i18next';

export const leaveTypes = [
  { id: 'annual', name: 'Annual Leave' },
  { id: 'sick', name: 'Sick Leave' },
  { id: 'personal', name: 'Personal Leave' },
  { id: 'unpaid', name: 'Unpaid Leave' },
  { id: 'maternity', name: 'Maternity Leave' },
  { id: 'paternity', name: 'Paternity Leave' },
  { id: 'bereavement', name: 'Bereavement Leave' },
  { id: 'other', name: 'Other' },
] as const;

export const leaveTypeIds = leaveTypes.map(type => type.id);

/**
 * Schema for leave request validation
 */
export const leaveRequestSchema = z.object({
  employee_id: z.string().min(1, { message: "Employee is required" }),
  leave_type: z.enum(leaveTypeIds, {
    errorMap: () => ({ message: "Leave type is required" }),
  }),
  start_date: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Please enter a valid date",
  }),
  end_date: z.date({
    required_error: "End date is required",
    invalid_type_error: "Please enter a valid date",
  }).refine((date) => date >= new Date(), {
    message: "End date must be in the future",
  }),
  reason: requiredString('Reason'),
  notes: commonSchemas.notes,
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
}).refine((data) => data.end_date >= data.start_date, {
  message: "End date must be after start date",
  path: ["end_date"],
});

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;


