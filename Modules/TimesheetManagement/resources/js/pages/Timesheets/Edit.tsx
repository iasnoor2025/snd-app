import { AppLayout } from '@/Core';
import { Select } from '@/Core/components/Common/Select';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Form, FormField, FormItem, FormLabel } from '@/Core/components/ui/form';
import { Input } from '@/Core/components/ui/input';
import { Textarea } from '@/Core/components/ui/textarea';
import { BreadcrumbItem } from '@/Core/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft as ArrowLeftIcon, Save as SaveIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import * as z from 'zod';

// Define interfaces
interface Props {
    timesheet: any;
    employee?: any;
    project?: any;
    rental?: any;
    user?: any;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    employees?: any[];
    projects?: any[];
    rentals?: any[];
}

// Define form validation schema
const formSchema = z.object({
    employee_id: z.string().min(1, { message: 'Employee is required' }),
    date: z.string().min(1, { message: 'Date is required' }),
    hours_worked: z.string().min(1, { message: 'Hours worked is required' }),
    overtime_hours: z.string().optional(),
    project_id: z.string().optional(),
    description: z.string().optional(),
    tasks_completed: z.string().optional(),
    status: z.string().optional(),
});

interface AssignmentBlock {
    id: number;
    project_id: string;
    rental_id: string;
    start_date: string;
    end_date: string;
    description?: string;
}

export default function TimesheetEdit({ timesheet, employee = {}, rental = {}, employees = [], projects = [], rentals = [] }: Props) {
    const { t } = useTranslation('TimesheetManagement');

    const [processing, setProcessing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(timesheet.date ? new Date(timesheet.date) : new Date());

    // Bulk Mode state
    const [isBulkMode, setIsBulkMode] = useState(false);
    const now = new Date();
    const [startDate, setStartDate] = useState<Date | undefined>(new Date(now.getFullYear(), now.getMonth(), 1));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    const [dailyOvertimeHours, setDailyOvertimeHours] = useState<Record<string, string>>({});
    const [dailyNormalHours, setDailyNormalHours] = useState<Record<string, string>>({});
    const [assignmentBlocks, setAssignmentBlocks] = useState<AssignmentBlock[]>([
        {
            id: 1,
            project_id: timesheet.project_id?.toString() || '',
            rental_id: timesheet.rental_id?.toString() || '',
            start_date: timesheet.date,
            end_date: timesheet.date,
            description: timesheet.description || '',
        },
    ]);

    // Add helper to get all selected date ranges except for the current block
    const getSelectedDateRanges = (excludeIdx: number) => {
        return assignmentBlocks
            .filter((_, idx) => idx !== excludeIdx)
            .map((block) => ({
                start: block.start_date,
                end: block.end_date,
            }))
            .filter((block) => block.start && block.end);
    };

    // Helper to check if a date is within any selected range
    const isDateInOtherRanges = (date: string, excludeIdx: number) => {
        const ranges = getSelectedDateRanges(excludeIdx);
        const d = new Date(date);
        return ranges.some(({ start, end }) => {
            if (!start || !end) return false;
            const s = new Date(start);
            const e = new Date(end);
            return d >= s && d <= e;
        });
    };

    // Ensure daily grid is generated when Bulk Mode is enabled or date range changes
    useEffect(() => {
        if (isBulkMode && startDate && endDate && timesheet.employee_id) {
            const fetchAndFill = async () => {
                const start = format(startDate, 'yyyy-MM-dd');
                const end = format(endDate, 'yyyy-MM-dd');
                try {
                    const res = await fetch(`/api/timesheets?employee_id=${timesheet.employee_id}&start_date=${start}&end_date=${end}`);
                    const data = await res.json();
                    const timesheetMap: Record<string, { hours_worked?: number; overtime_hours?: number }> = {};
                    (data.timesheets || []).forEach((ts: { date: string; hours_worked?: number; overtime_hours?: number }) => {
                        timesheetMap[ts.date] = ts;
                    });
                    const newDailyNormalHours: Record<string, string> = {};
                    const newDailyOvertimeHours: Record<string, string> = {};
                    let currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        const dateStr = format(currentDate, 'yyyy-MM-dd');
                        if (timesheetMap[dateStr]) {
                            // Regular hours: if < 0 or not present, show empty (A)
                            const rh = timesheetMap[dateStr].hours_worked;
                            newDailyNormalHours[dateStr] = rh === undefined || rh === null || rh < 0 ? '' : rh.toString();
                            // Overtime: if < 0 or not present, show 0; else show value
                            const ot = timesheetMap[dateStr].overtime_hours;
                            newDailyOvertimeHours[dateStr] = ot === undefined || ot === null || ot < 0 ? '0' : ot.toString();
                        } else {
                            newDailyNormalHours[dateStr] = '';
                            newDailyOvertimeHours[dateStr] = '0';
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    setDailyNormalHours(newDailyNormalHours);
                    setDailyOvertimeHours(newDailyOvertimeHours);
                } catch (e) {
                    generateDailyOvertimeHours(startDate, endDate);
                }
            };
            fetchAndFill();
        } else if (isBulkMode && startDate && endDate) {
            generateDailyOvertimeHours(startDate, endDate);
        }
        // eslint-disable-next-line
    }, [isBulkMode, startDate, endDate, timesheet.employee_id]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
        { title: 'Timesheets', href: '/timesheets' },
        { title: t('edit', 'Edit'), href: '#' },
    ];

    // React Hook Form with Zod validation
    const form = useReactHookForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employee_id: timesheet.employee_id.toString(),
            date: timesheet.date || new Date().toISOString().split('T')[0],
            hours_worked: timesheet.hours_worked?.toString() || '',
            overtime_hours: timesheet.overtime_hours?.toString() || '0',
            project_id: timesheet.project_id?.toString() || '',
            description: timesheet.description || '',
            tasks_completed: timesheet.tasks_completed || '',
            status: timesheet.status || 'submitted',
        },
    });

    const onDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            form.setValue('date', date.toISOString().split('T')[0]);
        }
    };

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        // Convert "none" value back to empty string for project_id
        const formData = {
            ...values,
            project_id: values.project_id === 'none' ? '' : values.project_id,
        };

        setProcessing(true);

        fetch(route('timesheets.update', timesheet.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify(formData),
        }).then(async (res) => {
            if (res.ok) {
                toast.success(t('success', 'Success'));
                setProcessing(false);
                window.location.href = route('timesheets.index');
            } else {
                let errors: any = {};
                try {
                    errors = await res.json();
                } catch (e) {
                    toast.error(t('update_failed', 'Failed to update timesheet'));
                    setProcessing(false);
                    return;
                }
                toast.error(errors.error || t('update_failed', 'Failed to update timesheet'));
                setProcessing(false);
                Object.keys(errors).forEach((key) => {
                    form.setError(key as any, {
                        type: 'manual',
                        message: errors[key],
                    });
                });
            }
        });
    };

    // Bulk Mode helpers (copied from Create page)
    const generateDailyOvertimeHours = (start: Date, end: Date) => {
        const newDailyOvertimeHours: Record<string, string> = {};
        const newDailyNormalHours: Record<string, string> = {};
        let currentDate = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
        const endDateValue = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
        while (currentDate <= endDateValue) {
            const dateString = currentDate.toISOString().split('T')[0];
            newDailyOvertimeHours[dateString] = '0';
            newDailyNormalHours[dateString] = '8';
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        setDailyOvertimeHours(newDailyOvertimeHours);
        setDailyNormalHours(newDailyNormalHours);
    };

    const handleDailyOvertimeChange = (date: string, value: string) => {
        setDailyOvertimeHours((prev) => ({ ...prev, [date]: value }));
    };
    const handleDailyNormalChange = (date: string, value: string) => {
        setDailyNormalHours((prev) => ({ ...prev, [date]: value }));
    };
    const addAssignmentBlock = () => {
        setAssignmentBlocks((blocks) => [...blocks, { id: Date.now(), project_id: '', rental_id: '', start_date: '', end_date: '' }]);
    };
    const removeAssignmentBlock = (id: number) => {
        setAssignmentBlocks((blocks) => blocks.filter((b) => b.id !== id));
    };
    const updateAssignmentBlock = (id: number, field: string, value: string) => {
        setAssignmentBlocks((blocks) => blocks.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
    };

    // Bulk Mode submit handler
    const handleBulkUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate and submit bulk update
        // (You may want to add more validation as in Create page)
        setProcessing(true);
        try {
            const updates = [];
            for (const block of assignmentBlocks) {
                if (!block.start_date || !block.end_date || (!block.project_id && !block.rental_id)) continue;
                let current = new Date(block.start_date);
                const end = new Date(block.end_date);
                while (current <= end) {
                    const dateStr = format(current, 'yyyy-MM-dd');
                    updates.push({
                        id: timesheet.id, // or find by date/employee if needed
                        employee_id: timesheet.employee_id,
                        date: dateStr,
                        hours_worked: dailyNormalHours[dateStr] || '8',
                        overtime_hours: dailyOvertimeHours[dateStr] || '0',
                        project_id: block.project_id !== 'none' ? block.project_id : '',
                        rental_id: block.rental_id !== 'none' ? block.rental_id : '',
                        description: '',
                    });
                    current.setDate(current.getDate() + 1);
                }
            }
            const res = await fetch(route('timesheets.update-bulk'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ updates }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Timesheets updated successfully');
                setProcessing(false);
                window.location.href = route('timesheets.index');
            } else {
                toast.error(data.error || 'Failed to update timesheets');
                setProcessing(false);
            }
        } catch (e) {
            toast.error('Failed to update timesheets');
            setProcessing(false);
        }
    };

    return (
        <AppLayout title={t('edit_timesheet')} breadcrumbs={breadcrumbs}>
            <Head title={t('edit_timesheet')} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">{t('edit_timesheet')}</CardTitle>
                            <CardDescription>
                                Update your work hours and tasks for {timesheet.date && format(new Date(timesheet.date), 'PPP')}
                            </CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                            <a href={route('timesheets.index')}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {t('back_to_timesheets')}
                            </a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Bulk Mode Toggle */}
                        <div className="mb-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isBulkMode}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setIsBulkMode(checked);
                                    if (checked) {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                                        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                        setStartDate(firstDay);
                                        setEndDate(lastDay);
                                        generateDailyOvertimeHours(firstDay, lastDay);
                                    }
                                }}
                                id="bulk_mode"
                            />
                            <FormLabel>{t('TimesheetManagement:fields.bulk_mode', 'Bulk Mode')}</FormLabel>
                        </div>
                        {isBulkMode ? (
                            <form onSubmit={handleBulkUpdate} className="space-y-8">
                                {/* Assignment Details Section */}
                                <div>
                                    <h2 className="mb-4 border-b pb-2 text-lg font-semibold">Assignment Details</h2>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Employee Selection */}
                                        <div>
                                            <FormLabel>Employee</FormLabel>
                                            <Select
                                                value={String(timesheet.employee_id)}
                                                disabled
                                                options={[
                                                    { value: String(timesheet.employee_id), label: `${employee?.first_name} ${employee?.last_name}` },
                                                ]}
                                            />
                                        </div>
                                        {/* Project Selection */}
                                        <div>
                                            <FormLabel>Project</FormLabel>
                                            <Select
                                                value={assignmentBlocks[0].project_id}
                                                onValueChange={(v) => updateAssignmentBlock(assignmentBlocks[0].id, 'project_id', v)}
                                                options={projects.map((p: any) => ({ value: p.id.toString(), label: p.name }))}
                                            />
                                        </div>
                                        {/* Rental Selection */}
                                        <div className="md:col-span-2">
                                            <FormLabel>Rental</FormLabel>
                                            <Select
                                                value={assignmentBlocks[0].rental_id}
                                                onValueChange={(v) => updateAssignmentBlock(assignmentBlocks[0].id, 'rental_id', v)}
                                                options={rentals.map((r: any) => ({
                                                    value: r.id.toString(),
                                                    label: `${r.rental_number} - ${r.equipment?.name || 'Unknown Equipment'}`,
                                                }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Bulk Date Range */}
                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <FormLabel>Start Date</FormLabel>
                                        <input
                                            type="month"
                                            value={startDate ? format(startDate, 'yyyy-MM') : ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const [year, month] = e.target.value.split('-').map(Number);
                                                    const firstDay = new Date(year, month - 1, 1);
                                                    const lastDay = new Date(year, month, 0);
                                                    setStartDate(firstDay);
                                                    setEndDate(lastDay);
                                                    generateDailyOvertimeHours(firstDay, lastDay);
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <FormLabel>End Date</FormLabel>
                                        <input
                                            type="date"
                                            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                            disabled
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                </div>
                                {/* Daily Overtime Table */}
                                <FormLabel>Timesheet Details</FormLabel>
                                <div className="mb-4">
                                    <div className="overflow-x-auto">
                                        <table
                                            className="w-full table-fixed rounded-lg border border-gray-200 text-sm shadow-sm"
                                            style={{ tableLayout: 'fixed' }}
                                        >
                                            <thead className="bg-white">
                                                <tr>
                                                    {Object.keys(dailyNormalHours).map((date) => {
                                                        const day = new Date(date).getDay();
                                                        const isFriday = day === 5;
                                                        return (
                                                            <th
                                                                key={date}
                                                                className={`sticky top-0 z-10 border-b border-gray-200 text-center align-middle font-semibold ${isFriday ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-900'}`}
                                                                style={{ width: '40px', minWidth: '40px', maxWidth: '40px', padding: '6px 0' }}
                                                            >
                                                                {new Date(date).getDate()}
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                                <tr>
                                                    {Object.keys(dailyOvertimeHours).map((date) => {
                                                        const day = new Date(date).getDay();
                                                        const isFriday = day === 5;
                                                        return (
                                                            <th
                                                                key={date}
                                                                className={`sticky top-8 z-10 border-b border-gray-200 text-center align-middle font-semibold ${isFriday ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-900'}`}
                                                                style={{ width: '40px', minWidth: '40px', maxWidth: '40px', padding: '4px 0' }}
                                                            >
                                                                {format(new Date(date), 'EEE')}
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {Object.entries(dailyNormalHours).map(([date, value]) => {
                                                        const day = new Date(date).getDay();
                                                        const isFriday = day === 5;
                                                        const isAbsent = !value || parseFloat(value) === 0;
                                                        return (
                                                            <td
                                                                key={date}
                                                                className={`border-b border-gray-100 text-center align-middle ${isFriday ? 'bg-blue-50' : 'bg-white'}`}
                                                                style={{ width: '40px', minWidth: '40px', maxWidth: '40px', padding: '2px 0' }}
                                                            >
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="24"
                                                                    step="0.5"
                                                                    value={isFriday ? '' : isAbsent ? '' : value}
                                                                    onChange={(e) => handleDailyNormalChange(date, e.target.value)}
                                                                    className={`w-full rounded border bg-gray-50 px-0 py-0 text-center text-xs focus:bg-white ${isFriday ? 'font-bold text-blue-600' : isAbsent ? 'font-bold text-red-600' : ''}`}
                                                                    style={{
                                                                        width: '38px',
                                                                        minWidth: '38px',
                                                                        maxWidth: '38px',
                                                                        padding: 0,
                                                                        textAlign: 'center',
                                                                    }}
                                                                    placeholder={isFriday ? 'F' : isAbsent ? 'A' : ''}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                                <tr>
                                                    {Object.entries(dailyOvertimeHours).map(([date, value]) => {
                                                        const day = new Date(date).getDay();
                                                        const isFriday = day === 5;
                                                        // For overtime, if value is empty or 0, show 0
                                                        const showValue = isFriday ? '' : value && parseFloat(value) !== 0 ? value : '0';
                                                        return (
                                                            <td
                                                                key={date}
                                                                className={`border-b border-gray-100 text-center align-middle ${isFriday ? 'bg-blue-50' : 'bg-white'}`}
                                                                style={{ width: '40px', minWidth: '40px', maxWidth: '40px', padding: '2px 0' }}
                                                            >
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="24"
                                                                    step="0.5"
                                                                    value={showValue}
                                                                    onChange={(e) => handleDailyOvertimeChange(date, e.target.value)}
                                                                    className={`w-full rounded border bg-gray-50 px-0 py-0 text-center text-xs focus:bg-white ${isFriday ? 'font-bold text-blue-600' : ''}`}
                                                                    style={{
                                                                        width: '38px',
                                                                        minWidth: '38px',
                                                                        maxWidth: '38px',
                                                                        padding: 0,
                                                                        textAlign: 'center',
                                                                    }}
                                                                    placeholder={isFriday ? 'F' : ''}
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <h2 className="mb-2 text-lg font-semibold">Split Assignments</h2>
                                {assignmentBlocks.map((block, idx) => (
                                    <div
                                        key={block.id}
                                        className="mb-2 grid grid-cols-1 items-end gap-4 rounded border bg-gray-50 p-4 md:grid-cols-4"
                                    >
                                        <div>
                                            <FormLabel>Project</FormLabel>
                                            <Select
                                                value={block.project_id}
                                                onValueChange={(v) => updateAssignmentBlock(block.id, 'project_id', v)}
                                                options={projects.map((p: any) => ({ value: p.id.toString(), label: p.name }))}
                                            />
                                        </div>
                                        <div>
                                            <FormLabel>Rental</FormLabel>
                                            <Select
                                                value={block.rental_id}
                                                onValueChange={(v) => updateAssignmentBlock(block.id, 'rental_id', v)}
                                                options={rentals.map((r: any) => ({
                                                    value: r.id.toString(),
                                                    label: `${r.rental_number} - ${r.equipment?.name || 'Unknown Equipment'}`,
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <FormLabel>Start Date</FormLabel>
                                            <Input
                                                type="date"
                                                value={block.start_date}
                                                onChange={(e) => updateAssignmentBlock(block.id, 'start_date', e.target.value)}
                                                min={format(startDate || new Date(), 'yyyy-MM-01')}
                                                max={format(endDate || new Date(), 'yyyy-MM-dd')}
                                                disabled={false}
                                                style={{ backgroundColor: isDateInOtherRanges(block.start_date, idx) ? '#fca5a5' : undefined }}
                                                onInput={(e) => {
                                                    if (isDateInOtherRanges(e.currentTarget.value, idx)) {
                                                        e.currentTarget.setCustomValidity('This date is already assigned in another block.');
                                                    } else {
                                                        e.currentTarget.setCustomValidity('');
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <FormLabel>End Date</FormLabel>
                                            <Input
                                                type="date"
                                                value={block.end_date}
                                                onChange={(e) => updateAssignmentBlock(block.id, 'end_date', e.target.value)}
                                                min={block.start_date || format(startDate || new Date(), 'yyyy-MM-01')}
                                                max={format(endDate || new Date(), 'yyyy-MM-dd')}
                                                disabled={false}
                                                style={{ backgroundColor: isDateInOtherRanges(block.end_date, idx) ? '#fca5a5' : undefined }}
                                                onInput={(e) => {
                                                    if (isDateInOtherRanges(e.currentTarget.value, idx)) {
                                                        e.currentTarget.setCustomValidity('This date is already assigned in another block.');
                                                    } else {
                                                        e.currentTarget.setCustomValidity('');
                                                    }
                                                }}
                                            />
                                        </div>
                                        {assignmentBlocks.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => removeAssignmentBlock(block.id)}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" onClick={addAssignmentBlock}>
                                    Add Assignment Block
                                </Button>
                                {/* Timesheet Details Section */}
                                <div>
                                    <h2 className="mb-4 border-b pb-2 text-lg font-semibold">Timesheet Details</h2>
                                    <div className="mt-6">
                                        <FormLabel>Description</FormLabel>
                                        <Textarea
                                            value={assignmentBlocks[0].description || ''}
                                            onChange={(e) => updateAssignmentBlock(assignmentBlocks[0].id, 'description', e.target.value)}
                                            rows={4}
                                            placeholder="Brief description"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end space-x-3">
                                    <Button asChild variant="outline">
                                        <a href={route('timesheets.index')}>Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Update
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''}
                                />

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="employee_id"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel>Employee</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    options={employees.map((employee) => ({
                                                        value: employee.id.toString(),
                                                        label: `${employee.first_name} ${employee.last_name}`,
                                                    }))}
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }: any) => (
                                            <div className="flex flex-col">
                                                <FormLabel>Date</FormLabel>
                                                <Input
                                                    type="date"
                                                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => onDateSelect(e.target.value ? new Date(e.target.value) : undefined)}
                                                    min={format(new Date(), 'yyyy-MM-01')}
                                                    max={format(new Date(), 'yyyy-MM-dd')}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                />
                                            </div>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="hours_worked"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel>{t('lbl_hours_worked')}</FormLabel>
                                                <Input type="number" step="0.5" min="0" max="24" placeholder="8" {...field} />
                                                <CardDescription>Regular hours worked (excluding overtime)</CardDescription>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="overtime_hours"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel>{t('lbl_overtime_hours')}</FormLabel>
                                                <Input type="number" step="0.5" min="0" max="24" placeholder="0" {...field} />
                                                <CardDescription>Additional hours beyond regular schedule</CardDescription>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="project_id"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel>Project (Optional)</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    options={projects.map((project) => ({ value: project.id.toString(), label: project.name }))}
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    options={[
                                                        { value: 'draft', label: 'Draft' },
                                                        { value: 'submitted', label: 'Submitted' },
                                                        { value: 'foreman_approved', label: 'Foreman Approved' },
                                                        { value: 'incharge_approved', label: 'Incharge Approved' },
                                                        { value: 'checking_approved', label: 'Checking Approved' },
                                                        { value: 'manager_approved', label: 'Manager Approved' },
                                                        { value: 'rejected', label: 'Rejected' },
                                                    ]}
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <Textarea placeholder={t('ph_brief_description_of_work_performed')} className="min-h-[80px]" {...field} />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tasks_completed"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel>Tasks Completed (Optional)</FormLabel>
                                            <Textarea
                                                placeholder={t('ph_list_of_tasks_completed_during_this_time')}
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" asChild>
                                        <a href={route('timesheets.index')}>Cancel</a>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <SaveIcon className="mr-2 h-4 w-4" />
                                        {t('update', 'Update')}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
