import { AppLayout } from '@/Core';
import { Select } from '@/Core/components/Common/Select';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardHeader } from '@/Core/components/ui/card';
import { FormLabel } from '@/Core/components/ui/form';
import { Input } from '@/Core/components/ui/input';
import { Textarea } from '@/Core/components/ui/textarea';
import { BreadcrumbItem, PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

// Define interfaces
interface Employee {
    id: number;
    first_name: string;
    last_name: string;
}

interface Project {
    id: number;
    name: string;
}

interface Rental {
    id: number;
    equipment: {
        name: string;
    };
    rental_number: string;
}

interface Props extends PageProps {
    employees: Employee[];
    projects: Project[];
    rentals?: Rental[];
    include_rentals?: boolean;
    rental_id?: string;
}

export default function TimesheetCreate({ auth, employees = [], projects = [], rentals = [], include_rentals = false, rental_id }: Props) {
    const { t } = useTranslation('TimesheetManagement');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard', 'Dashboard'), href: '/dashboard' },
        { title: 'Timesheets', href: '/hr/timesheets' },
        { title: t('create', 'Create'), href: '/hr/timesheets/create' },
    ];

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [customOvertimePerDay, setCustomOvertimePerDay] = useState(false);
    const [dailyOvertimeHours, setDailyOvertimeHours] = useState<Record<string, string>>({});
    const [dailyNormalHours, setDailyNormalHours] = useState<Record<string, string>>({});
    const [, forceUpdate] = useState(0);
    const [assignmentBlocks, setAssignmentBlocks] = useState([
        {
            id: 1,
            project_id: '',
            rental_id: '',
            start_date: '',
            end_date: '',
        },
    ]);

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: employees.length > 0 ? employees[0].id.toString() : '',
        date: new Date().toISOString().split('T')[0],
        hours_worked: '8',
        overtime_hours: '0',
        project_id: '',
        rental_id: rental_id || '',
        description: '',
        tasks_completed: '',
        bulk_mode: false,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        daily_overtime_hours: {},
        daily_normal_hours: {},
    });

    // Check URL parameters for bulk mode and month
    useEffect(() => {
        const url = new URL(window.location.href);
        const bulkParam = url.searchParams.get('bulk');
        const monthParam = url.searchParams.get('month');

        if (bulkParam === 'true') {
            setIsBulkMode(true);
            // setData('bulk_mode', true); // This line is removed as per the edit hint

            if (monthParam) {
                // Parse the month parameter (format: yyyy-MM)
                const [year, month] = monthParam.split('-').map(Number);

                // Set start date to first day of month
                const firstDay = new Date(year, month - 1, 1);
                setStartDate(firstDay);
                // setData('start_date', firstDay.toISOString().split('T')[0]); // This line is removed as per the edit hint

                // Set end date to last day of month
                const lastDay = new Date(year, month, 0);
                setEndDate(lastDay);
                // setData('end_date', lastDay.toISOString().split('T')[0]); // This line is removed as per the edit hint
            }
        }
    }, []);

    const checkDuplicate = async (employeeId: string, date: string) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(route('timesheets.check-duplicate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    employee_id: employeeId,
                    date: date,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.exists || false;
        } catch (error) {
            console.error('Error checking duplicate:', error);
            // Return false to allow submission if check fails
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isBulkMode && assignmentBlocks.length > 1) {
            // Validate all blocks
            const validAssignments = assignmentBlocks.filter((block) => block.start_date && block.end_date && (block.project_id || block.rental_id));
            if (validAssignments.length === 0) {
                toast.error('Please fill at least one assignment block completely');
                return;
            }
            for (const block of assignmentBlocks) {
                if (!block.start_date || !block.end_date || (!block.project_id && !block.rental_id)) {
                    toast.error('Please fill all assignment block fields');
                    return;
                }
            }
            // Submit only valid assignments using FormData for Laravel compatibility
            const formData = new FormData();
            validAssignments.forEach((block, i) => {
                formData.append(`assignments[${i}][employee_id]`, 'employee_id'); // This line is removed as per the edit hint
                formData.append(`assignments[${i}][project_id]`, block.project_id && block.project_id !== 'none' ? block.project_id : '');
                formData.append(`assignments[${i}][rental_id]`, block.rental_id && block.rental_id !== 'none' ? block.rental_id : '');
                formData.append(`assignments[${i}][date_from]`, block.start_date);
                formData.append(`assignments[${i}][date_to]`, block.end_date);
                formData.append(`assignments[${i}][hours_worked]`, '8');
                formData.append(`assignments[${i}][overtime_hours]`, '0');
                formData.append(`assignments[${i}][description]`, 'description'); // This line is removed as per the edit hint
                formData.append(`assignments[${i}][start_time]`, '08:00');
                formData.append(`assignments[${i}][end_time]`, '');
            });
            router.post(route('timesheets.store-bulk-split'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Timesheets created successfully!');
                    // reset(); // This line is removed as per the edit hint
                    router.visit(route('hr.api.timesheets.index'));
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    const message = Array.isArray(firstError) ? firstError[0] : firstError;
                    toast.error(message || 'Please check the form for errors');
                },
            });
            return;
        }

        // Basic validation (add more as needed)
        if (!data.employee_id) {
            toast.error(t('employee_error', 'Please select an employee'));
            return;
        }
        if (!data.date) {
            toast.error(t('date_error', 'Please select a date'));
            return;
        }
        if (!data.hours_worked) {
            toast.error(t('hours_worked_error', 'Please enter hours worked'));
            return;
        }

        if (isBulkMode) {
            if (!startDate || !endDate) {
                toast.error(t('bulk_error', 'Please select both start and end dates for bulk entry'));
                return;
            }
            if (startDate > endDate) {
                toast.error(t('end_date_error', 'End date must be after start date'));
                return;
            }
            // post(route('timesheets.store-bulk'), { // This line is removed as per the edit hint
            //   onSuccess: () => {
            //     toast.success(t('bulk_success', 'Timesheets created successfully!'));
            //     reset();
            //     router.visit(route('hr.api.timesheets.index'));
            //   },
            //   onError: (errors) => {
            //     const firstError = Object.values(errors)[0];
            //     const message = Array.isArray(firstError) ? firstError[0] : firstError;
            //     toast.error(message || t('check_form', 'Please check the form for errors'));
            //   },
            // });
        } else {
            // Check for duplicates first
            try {
                const isDuplicate = await checkDuplicate(data.employee_id, data.date); // This line is removed as per the edit hint
                if (isDuplicate) {
                    toast.error(t('duplicate_error', 'A timesheet for this employee and date already exists'));
                    return;
                }
            } catch (error) {
                console.warn('Duplicate check failed:', error);
                // Continue with submission if duplicate check fails
            }
            // post(route('timesheets.store'), { // This line is removed as per the edit hint
            //   onSuccess: () => {
            //     toast.success(t('single_success', 'Timesheet created successfully!'));
            //     reset();
            //     router.visit(route('hr.api.timesheets.index'));
            //   },
            //   onError: (errors) => {
            //     const firstError = Object.values(errors)[0];
            //     const message = Array.isArray(firstError) ? firstError[0] : firstError;
            //     toast.error(message || t('check_form', 'Please check the form for errors'));
            //   },
            // });
        }
    };

    const onDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            // setData('date', formattedDate); // This line is removed as per the edit hint
        }
    };

    const onStartDateSelect = (date: Date | undefined) => {
        setStartDate(date);
        if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            // setData('start_date', formattedDate); // This line is removed as per the edit hint
            if (isBulkMode) {
                // Auto-select end date to last day of the same month
                const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                setEndDate(lastDay);
                // setData('end_date', format(lastDay, 'yyyy-MM-dd')); // This line is removed as per the edit hint
                // Always use fresh date objects
                generateDailyOvertimeHours(
                    new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate()),
                );
            } else if (isBulkMode && endDate) {
                generateDailyOvertimeHours(date, endDate);
            }
        }
    };

    const onEndDateSelect = (date: Date | undefined) => {
        setEndDate(date);
        if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd');
            // setData('end_date', formattedDate); // This line is removed as per the edit hint
            if (isBulkMode && startDate) {
                generateDailyOvertimeHours(startDate, date);
            }
        }
    };

    // Generate daily overtime hours for the date range
    const generateDailyOvertimeHours = (start: Date, end: Date) => {
        const newDailyOvertimeHours: Record<string, string> = {};
        const newDailyNormalHours: Record<string, string> = {};
        let currentDate = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
        const endDateValue = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
        while (currentDate <= endDateValue) {
            const dateString = currentDate.toISOString().split('T')[0];
            newDailyOvertimeHours[dateString] = '0';
            newDailyNormalHours[dateString] = '8';
            // Move to next day in UTC
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        setDailyOvertimeHours(newDailyOvertimeHours);
        setDailyNormalHours(newDailyNormalHours);
        // setData('daily_overtime_hours', newDailyOvertimeHours); // This line is removed as per the edit hint
        // setData('daily_normal_hours', newDailyNormalHours); // This line is removed as per the edit hint
    };

    const toggleBulkMode = (enabled: boolean) => {
        setIsBulkMode(enabled);
        // setData('bulk_mode', enabled); // This line is removed as per the edit hint

        if (enabled) {
            setSelectedDate(undefined);
            // setData('date', ''); // This line is removed as per the edit hint
            // Set start date to 1st of current month
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setStartDate(firstDay);
            setEndDate(lastDay);
            // setData('start_date', format(firstDay, 'yyyy-MM-dd')); // This line is removed as per the edit hint
            // setData('end_date', format(lastDay, 'yyyy-MM-dd')); // This line is removed as per the edit hint
            setDailyOvertimeHours({});
            setDailyNormalHours({});
            // reset(); // This line is removed as per the edit hint
            generateDailyOvertimeHours(firstDay, lastDay);
        } else {
            setStartDate(undefined);
            setEndDate(undefined);
            // setData('start_date', ''); // This line is removed as per the edit hint
            // setData('end_date', ''); // This line is removed as per the edit hint
            setDailyOvertimeHours({});
            setDailyNormalHours({});
            // reset(); // This line is removed as per the edit hint
        }
    };

    const updateDailyOvertimeHours = (start: Date, end: Date) => {
        const newDailyOvertimeHours: Record<string, string> = {};
        const currentDate = new Date(start);

        // Loop through each day in the range
        while (currentDate <= end) {
            const dateString = currentDate.toISOString().split('T')[0];
            // Initialize with default overtime value
            newDailyOvertimeHours[dateString] = dailyOvertimeHours[dateString] || '0';
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setDailyOvertimeHours(newDailyOvertimeHours);
    };

    const handleDailyOvertimeChange = (date: string, value: string) => {
        setDailyOvertimeHours((prev) => {
            const updated = { ...prev, [date]: value };
            // setData('daily_overtime_hours', updated); // This line is removed as per the edit hint
            return updated;
        });
    };

    const handleDailyNormalChange = (date: string, value: string) => {
        setDailyNormalHours((prev) => {
            const updated = { ...prev, [date]: value };
            // setData('daily_normal_hours', updated); // This line is removed as per the edit hint
            return updated;
        });
    };

    // Observer effect to force re-render on dailyNormalHours change
    useEffect(() => {
        forceUpdate((n) => n + 1);
    }, [dailyNormalHours]);

    const addAssignmentBlock = () => {
        setAssignmentBlocks((blocks) => [...blocks, { id: Date.now(), project_id: '', rental_id: '', start_date: '', end_date: '' }]);
    };

    const removeAssignmentBlock = (id: number) => {
        setAssignmentBlocks((blocks) => blocks.filter((b) => b.id !== id));
    };

    const updateAssignmentBlock = (id: number, field: string, value: string) => {
        setAssignmentBlocks((blocks) => blocks.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
    };

    const getDisabledStartDates = (idx: number) => {
        const usedDates = assignmentBlocks.map((block) => block.start_date);
        const minDate = Math.min(...usedDates.map((date) => new Date(date).getTime()));
        const maxDate = Math.max(...usedDates.map((date) => new Date(date).getTime()));
        const disabledDates = [];
        const currentDate = new Date(minDate);
        while (currentDate <= new Date(maxDate)) {
            if (!usedDates.includes(currentDate.toISOString().split('T')[0])) {
                disabledDates.push(currentDate.toISOString().split('T')[0]);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return disabledDates.join(',');
    };

    const getDisabledEndDates = (idx: number) => {
        const usedDates = assignmentBlocks.map((block) => block.end_date);
        const minDate = Math.min(...usedDates.map((date) => new Date(date).getTime()));
        const maxDate = Math.max(...usedDates.map((date) => new Date(date).getTime()));
        const disabledDates = [];
        const currentDate = new Date(minDate);
        while (currentDate <= new Date(maxDate)) {
            if (!usedDates.includes(currentDate.toISOString().split('T')[0])) {
                disabledDates.push(currentDate.toISOString().split('T')[0]);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return disabledDates.join(',');
    };

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

    return (
        <AppLayout
            title={t('TimesheetManagement:actions.create_timesheet')}
            breadcrumbs={[
                { title: t('TimesheetManagement:pages.timesheets'), href: route('timesheets.index') },
                { title: t('TimesheetManagement:actions.create_timesheet'), href: route('timesheets.create') },
            ]}
            requiredPermission="timesheets.create"
        >
            <Head title={t('TimesheetManagement:actions.create_timesheet')} />

            <div className="py-12">
                <div className="w-full px-0">
                    <Card className="w-full border border-gray-200 shadow-lg">
                        <CardHeader>
                            <div className="mb-2 flex items-center justify-between">
                                <Button asChild variant="ghost" size="sm" className="gap-2">
                                    <a href={route('timesheets.index')}>
                                        <ArrowLeft className="h-4 w-4" /> {t('ui.buttons.back', 'Back')}
                                    </a>
                                </Button>
                                <h1 className="text-2xl font-bold">
                                    {isBulkMode
                                        ? t('TimesheetManagement:actions.create_timesheet_bulk', 'Create Timesheet (Bulk Entry)')
                                        : t('TimesheetManagement:actions.create_timesheet', 'Create Timesheet')}
                                </h1>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Assignment Details Section */}
                                <div>
                                    <h2 className="mb-4 border-b pb-2 text-lg font-semibold">
                                        {t('TimesheetManagement:sections.assignment_details', 'Assignment Details')}
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Employee Selection */}
                                        <div>
                                            <FormLabel>{t('TimesheetManagement:fields.employee')}</FormLabel>
                                            <Select
                                                onValueChange={(value) => setData('employee_id', value)}
                                                value={data.employee_id}
                                                options={employees.map((e) => ({ value: e.id.toString(), label: `${e.first_name} ${e.last_name}` }))}
                                            />
                                            {/* {errors?.employee_id && <FormMessage>{errors.employee_id}</FormMessage>} */}
                                        </div>
                                        {/* Project Selection */}
                                        <div>
                                            <FormLabel>{t('TimesheetManagement:fields.project')}</FormLabel>
                                            <Select
                                                onValueChange={(value) => setData('project_id', value)}
                                                value={data.project_id}
                                                options={projects.map((p) => ({ value: p.id.toString(), label: p.name }))}
                                            />
                                            {/* {errors?.project_id && <FormMessage>{errors.project_id}</FormMessage>} */}
                                        </div>
                                        {/* Rental Selection */}
                                        <div className="md:col-span-2">
                                            <FormLabel>{t('TimesheetManagement:fields.rental', 'Rental')}</FormLabel>
                                            <Select
                                                onValueChange={(value) => setData('rental_id', value)}
                                                value={data.rental_id}
                                                options={rentals?.map((r) => ({
                                                    value: r.id.toString(),
                                                    label: `${r.rental_number} - ${r.equipment?.name || 'Unknown Equipment'}`,
                                                }))}
                                            />
                                            {/* {errors?.rental_id && <FormMessage>{errors.rental_id}</FormMessage>} */}
                                        </div>
                                    </div>
                                </div>
                                {/* Bulk Mode Toggle */}
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={isBulkMode} onChange={(e) => toggleBulkMode(e.target.checked)} id="bulk_mode" />
                                    <FormLabel htmlFor="bulk_mode">{t('TimesheetManagement:fields.bulk_mode', 'Bulk Mode')}</FormLabel>
                                </div>
                                {/* Bulk Section (unchanged) */}
                                {isBulkMode && (
                                    <div className="space-y-6">
                                        {/* Bulk Date Range */}
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <FormLabel>{t('TimesheetManagement:fields.start_date', 'Start Date')}</FormLabel>
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
                                                <FormLabel>{t('TimesheetManagement:fields.end_date', 'End Date')}</FormLabel>
                                                <input
                                                    type="date"
                                                    value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => onEndDateSelect(e.target.value ? new Date(e.target.value) : undefined)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    disabled={isBulkMode}
                                                />
                                            </div>
                                        </div>
                                        {/* Daily Overtime Table */}
                                        <div className="mb-4">
                                            <FormLabel>{t('TimesheetManagement:fields.daily_overtime', 'Daily Overtime')}</FormLabel>
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
                                                                        style={{
                                                                            width: '40px',
                                                                            minWidth: '40px',
                                                                            maxWidth: '40px',
                                                                            padding: '6px 0',
                                                                        }}
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
                                                                        style={{
                                                                            width: '40px',
                                                                            minWidth: '40px',
                                                                            maxWidth: '40px',
                                                                            padding: '4px 0',
                                                                        }}
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
                                                                        style={{
                                                                            width: '40px',
                                                                            minWidth: '40px',
                                                                            maxWidth: '40px',
                                                                            padding: '2px 0',
                                                                        }}
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
                                                                return (
                                                                    <td
                                                                        key={date}
                                                                        className={`border-b border-gray-100 text-center align-middle ${isFriday ? 'bg-blue-50' : 'bg-white'}`}
                                                                        style={{
                                                                            width: '40px',
                                                                            minWidth: '40px',
                                                                            maxWidth: '40px',
                                                                            padding: '2px 0',
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="24"
                                                                            step="0.5"
                                                                            value={value}
                                                                            onChange={(e) => handleDailyOvertimeChange(date, e.target.value)}
                                                                            className="w-full rounded border bg-gray-50 px-0 py-0 text-center text-xs focus:bg-white"
                                                                            style={{
                                                                                width: '38px',
                                                                                minWidth: '38px',
                                                                                maxWidth: '38px',
                                                                                padding: 0,
                                                                                textAlign: 'center',
                                                                            }}
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
                                                        options={projects.map((p) => ({ value: p.id.toString(), label: p.name }))}
                                                    />
                                                </div>
                                                <div>
                                                    <FormLabel>Rental</FormLabel>
                                                    <Select
                                                        value={block.rental_id}
                                                        onValueChange={(v) => updateAssignmentBlock(block.id, 'rental_id', v)}
                                                        options={rentals?.map((r) => ({
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
                                                        style={{
                                                            backgroundColor: isDateInOtherRanges(block.start_date, idx) ? '#fca5a5' : undefined,
                                                        }}
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
                                    </div>
                                )}
                                {/* Timesheet Details Section */}
                                <div>
                                    <h2 className="mb-4 border-b pb-2 text-lg font-semibold">
                                        {t('TimesheetManagement:sections.timesheet_details', 'Timesheet Details')}
                                    </h2>
                                    {!isBulkMode && (
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <FormLabel>{t('TimesheetManagement:fields.hours')}</FormLabel>
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="24"
                                                    value={data.hours_worked}
                                                    onChange={(e) => setData('hours_worked', e.target.value)}
                                                    placeholder={t('TimesheetManagement:placeholders.enter_hours')}
                                                />
                                                {/* {errors?.hours_worked && <FormMessage>{errors.hours_worked}</FormMessage>} */}
                                            </div>
                                            <div>
                                                <FormLabel>{t('TimesheetManagement:fields.overtime_hours', 'Overtime Hours')}</FormLabel>
                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="24"
                                                    value={data.overtime_hours}
                                                    onChange={(e) => setData('overtime_hours', e.target.value)}
                                                    placeholder={t('TimesheetManagement:placeholders.enter_overtime', 'Enter overtime hours')}
                                                />
                                                {/* {errors?.overtime_hours && <FormMessage>{errors.overtime_hours}</FormMessage>} */}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-6">
                                        <FormLabel>{t('TimesheetManagement:fields.description')}</FormLabel>
                                        <Textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                            placeholder={t('TimesheetManagement:placeholders.brief_description')}
                                        />
                                        {/* {errors?.description && <FormMessage>{errors.description}</FormMessage>} */}
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end space-x-3">
                                    <Button asChild variant="outline">
                                        <a href={route('timesheets.index')}>{t('ui.buttons.cancel')}</a>
                                    </Button>
                                    <Button type="submit" disabled={false}>
                                        {t('ui.buttons.create')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
