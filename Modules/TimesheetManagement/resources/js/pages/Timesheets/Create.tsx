import { AppLayout } from '@/Core';
import { Select } from '@/Core/components/Common/Select';


import { Label } from '@/Core';



import { BreadcrumbItem, PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Clock, User, Calendar, Plus, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, DatePicker, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@CoreUI';



// Define interfaces
interface Assignment {
    id: number;
    type: string;
    name: string;
    project_id?: number;
    rental_id?: number;
    project?: {
        id: number;
        name: string;
    };
    rental?: {
        id: number;
        project_name: string;
        rental_number: string;
    };
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    assignments?: Assignment[];
}

interface Project {
    id: number;
    name: string;
    location?: string;
}

interface Rental {
    id: number;
    equipment: {
        name: string;
    };
    rental_number: string;
    location?: string;
}

interface AssignmentBlock {
    id: number;
    project_id: string;
    rental_id: string;
    start_date: string;
    end_date: string;
    description?: string;
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

    // Assignment creation popup state
    const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
    const [selectedEmployeeForAssignment, setSelectedEmployeeForAssignment] = useState<Employee | null>(null);
    const [newAssignmentData, setNewAssignmentData] = useState({
        type: 'manual',
        name: '',
        project_id: '',
        rental_id: '',
        location: '',
        notes: '',
        start_date: new Date().toISOString().split('T')[0],
    });

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
            project_id: '',
            rental_id: rental_id || '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            description: '',
        },
    ]);

    const [data, setDataState] = useState({
        employee_id: '',
        assignment_id: '',
        date: new Date().toISOString().split('T')[0],
        hours_worked: '8',
        overtime_hours: '0',
        project_id: '',
        rental_id: rental_id || '',
        description: '',
        tasks_completed: '',
        start_time: '08:00',
        end_time: '17:00',
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const setData = (key: string, value: string) => {
        setDataState(prev => ({ ...prev, [key]: value }));
    };

    // Bulk Mode helpers
    const generateDailyOvertimeHours = (start: Date, end: Date) => {
        const newDailyOvertimeHours: Record<string, string> = {};
        const newDailyNormalHours: Record<string, string> = {};
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            newDailyOvertimeHours[dateStr] = '0';
            newDailyNormalHours[dateStr] = '8';
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setDailyOvertimeHours(newDailyOvertimeHours);
        setDailyNormalHours(newDailyNormalHours);
    };

    const addAssignmentBlock = () => {
        setAssignmentBlocks((blocks) => [...blocks, { id: Date.now(), project_id: '', rental_id: '', start_date: '', end_date: '', description: '' }]);
    };

    const removeAssignmentBlock = (id: number) => {
        setAssignmentBlocks((blocks) => blocks.filter((b) => b.id !== id));
    };

    const updateAssignmentBlock = (id: number, field: string, value: string) => {
        setAssignmentBlocks((blocks) => blocks.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
    };

    // Ensure daily grid is generated when Bulk Mode is enabled or date range changes
    useEffect(() => {
        if (isBulkMode && startDate && endDate) {
            generateDailyOvertimeHours(startDate, endDate);
        }
    }, [isBulkMode, startDate, endDate]);

    // Get selected employee's assignments
    const selectedEmployee = employees.find(e => e.id.toString() === data.employee_id);
    const availableAssignments = selectedEmployee?.assignments || [];

    // Handle employee selection
    const handleEmployeeChange = (employeeId: string) => {
        setData('employee_id', employeeId);
        setData('assignment_id', ''); // Reset assignment when employee changes
        setData('project_id', ''); // Reset project when employee changes
        setData('rental_id', ''); // Reset rental when employee changes

        // Check if employee has assignments
        const employee = employees.find(e => e.id.toString() === employeeId);
        if (employee && (!employee.assignments || employee.assignments.length === 0)) {
            setSelectedEmployeeForAssignment(employee);
            setShowAssignmentPopup(true);
        }
    };

    // Handle assignment selection
    const handleAssignmentChange = (assignmentId: string) => {
        setData('assignment_id', assignmentId);

        if (assignmentId) {
            // Clear project/rental when assignment is selected
            setData('project_id', '');
            setData('rental_id', '');
        }
    };

    // Handle project/rental selection (clears assignment)
    const handleProjectChange = (projectId: string) => {
        setData('project_id', projectId);
        if (projectId) {
            setData('assignment_id', '');
        }
    };

    const handleRentalChange = (rentalId: string) => {
        setData('rental_id', rentalId);
        if (rentalId) {
            setData('assignment_id', '');
        }
    };

    // Redirect to assignment creation page
    const redirectToAssignmentPage = () => {
        if (!selectedEmployeeForAssignment) {
            toast.error('No employee selected');
            return;
        }

        // If project is selected, redirect to project resources page
        if (newAssignmentData.type === 'project' && newAssignmentData.project_id) {
            window.location.href = `/projects/${newAssignmentData.project_id}/resources`;
            return;
        }

        // If rental is selected, redirect to rental details page
        if (newAssignmentData.type === 'rental' && newAssignmentData.rental_id) {
            window.location.href = `/rentals/${newAssignmentData.rental_id}`;
            return;
        }

        // Default: redirect to employee assignments page for manual assignments
        const params = new URLSearchParams({
            employee_id: selectedEmployeeForAssignment.id.toString(),
            type: newAssignmentData.type,
        });

        window.location.href = `/employees/${selectedEmployeeForAssignment.id}?tab=assignments&${params.toString()}`;
    };

    const closeAssignmentPopup = () => {
        setShowAssignmentPopup(false);
        setSelectedEmployeeForAssignment(null);
        setNewAssignmentData({
            type: 'manual',
            name: '',
            project_id: '',
            rental_id: '',
            location: '',
            notes: '',
            start_date: new Date().toISOString().split('T')[0],
        });
    };

    // Bulk Mode submit handler
    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.employee_id) {
            toast.error('Please select an employee');
            return;
        }

        setProcessing(true);
        try {
            const timesheets = [];

            // If assignment blocks are empty or invalid, create a default block using bulk date range
            let blocksToProcess = assignmentBlocks;
            if (assignmentBlocks.length === 0 || assignmentBlocks.every(block => !block.start_date || !block.end_date)) {
                blocksToProcess = [{
                    id: 1,
                    start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
                    end_date: endDate ? format(endDate, 'yyyy-MM-dd') : '',
                    project_id: assignmentBlocks[0]?.project_id || '',
                    rental_id: assignmentBlocks[0]?.rental_id || '',
                    description: assignmentBlocks[0]?.description || ''
                }];
            }

            for (const block of blocksToProcess) {
                if (!block.start_date || !block.end_date) {
                    continue;
                }
                let current = new Date(block.start_date);
                const end = new Date(block.end_date);
                while (current <= end) {
                    const dateStr = format(current, 'yyyy-MM-dd');
                    // Clean and validate the data
                    const normalHours = dailyNormalHours[dateStr] || '8';
                    const overtimeHours = dailyOvertimeHours[dateStr] || '0';

                    // Convert 'A' and invalid values to '0'
                    const cleanNormalHours = (normalHours === 'A' || normalHours === '' || isNaN(parseFloat(normalHours))) ? '0' : normalHours;
                    const cleanOvertimeHours = (overtimeHours === 'A' || overtimeHours === '' || isNaN(parseFloat(overtimeHours))) ? '0' : overtimeHours;

                    // Skip if both hours are 0 or empty
                    if (parseFloat(cleanNormalHours) === 0 && parseFloat(cleanOvertimeHours) === 0) {
                        current.setDate(current.getDate() + 1);
                        continue;
                    }

                    timesheets.push({
                        employee_id: data.employee_id,
                        assignment_id: data.assignment_id || null,
                        date: dateStr,
                        hours_worked: cleanNormalHours,
                        overtime_hours: cleanOvertimeHours,
                        project_id: block.project_id !== 'none' ? block.project_id : null,
                        rental_id: block.rental_id !== 'none' ? block.rental_id : null,
                        description: block.description || data.description,
                        tasks_completed: data.tasks_completed,
                        start_time: data.start_time,
                        end_time: data.end_time,
                    });
                    current.setDate(current.getDate() + 1);
                }
            }

            if (timesheets.length === 0) {
                toast.error('No valid timesheets to create');
                setProcessing(false);
                return;
            }

            const res = await fetch(route('timesheets.store-bulk-split'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ timesheets }),
            });

            const responseData = await res.json();
            if (res.ok && responseData.message) {
                toast.success(`${timesheets.length} timesheets created successfully`);
                setProcessing(false);
                window.location.href = route('timesheets.index');
            } else {
                console.error('Bulk create failed:', responseData);
                toast.error(responseData.error || 'Failed to create timesheets');
                setProcessing(false);
            }
        } catch (e) {
            console.error('Bulk create error:', e);
            toast.error('Failed to create timesheets');
            setProcessing(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch(route('timesheets.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Timesheet created successfully');
                router.visit(route('timesheets.index'));
            } else {
                const errorData = await response.json();
                setErrors(errorData.errors || {});
                Object.keys(errorData.errors || {}).forEach(key => {
                    toast.error(errorData.errors[key][0] || errorData.errors[key]);
                });
            }
        } catch (error) {
            console.error('Error creating timesheet:', error);
            toast.error('Failed to create timesheet');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout
            title={t('create_timesheet', 'Create Timesheet')}
            breadcrumbs={breadcrumbs}
            requiredPermission="timesheets.create"
        >
            <Head title={t('create_timesheet', 'Create Timesheet')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-bold tracking-tight">{t('create_timesheet', 'Create Timesheet')}</h1>
                        </div>
                        <p className="text-muted-foreground">Record work hours and assignment details</p>
                    </div>
                    <Button variant="outline" asChild>
                                    <a href={route('timesheets.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Timesheets
                                    </a>
                                </Button>
                            </div>

                {/* Bulk Mode Toggle */}
                <Card>
                    <CardContent className="pt-6">
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
                            <Label htmlFor="bulk_mode">{t('TimesheetManagement:fields.bulk_mode', 'Bulk Mode')}</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Form */}
                {isBulkMode ? (
                    <form onSubmit={handleBulkSubmit} className="space-y-6">
                        {/* Employee Selection for Bulk */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Employee Selection
                                </CardTitle>
                                <CardDescription>
                                    Select employee for bulk timesheet creation
                                </CardDescription>
                        </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employee_id">Employee *</Label>
                                            <Select
                                                value={data.employee_id}
                                        onValueChange={handleEmployeeChange}
                                        options={employees.map((e) => ({
                                            value: e.id.toString(),
                                            label: `${e.first_name} ${e.last_name}`
                                        }))}
                                        placeholder="Select an employee"
                                    />
                                    {errors?.employee_id && (
                                        <p className="text-sm text-red-600">{errors.employee_id}</p>
                                    )}
                                        </div>

                                {/* Assignment Selection for Bulk */}
                                {availableAssignments.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="assignment_id">Assignment (Optional)</Label>
                                            <Select
                                            value={data.assignment_id}
                                            onValueChange={handleAssignmentChange}
                                            options={[
                                                { value: '', label: 'No specific assignment' },
                                                ...availableAssignments.map((assignment) => ({
                                                    value: assignment.id.toString(),
                                                    label: assignment.type === 'project' && assignment.project
                                                        ? `Project: ${assignment.project.name}`
                                                        : assignment.type === 'rental' && assignment.rental
                                                        ? `Rental: ${assignment.rental.rental_number || assignment.rental.project_name}`
                                                        : `${assignment.type}: ${assignment.name}`
                                                }))
                                            ]}
                                            placeholder="Select an assignment"
                                        />
                                        </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Date Range Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Date Range</CardTitle>
                                <CardDescription>Select the month and date range for bulk creation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                        <Label>Start Date</Label>
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
                                        <Label>End Date</Label>
                                                <input
                                                    type="date"
                                                    value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                            disabled
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                />
                                            </div>
                                        </div>
                            </CardContent>
                        </Card>

                        {/* Assignment Blocks */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
                                <CardDescription>Configure project/rental assignments for different date ranges</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {assignmentBlocks.map((block, index) => (
                                    <div key={block.id} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium">Assignment Block {index + 1}</h4>
                                            {assignmentBlocks.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeAssignmentBlock(block.id)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label>Project</Label>
                                                <Select
                                                    value={block.project_id}
                                                    onValueChange={(v) => updateAssignmentBlock(block.id, 'project_id', v)}
                                                    options={[
                                                        { value: '', label: 'No project' },
                                                        ...projects.map((p) => ({ value: p.id.toString(), label: p.name }))
                                                    ]}
                                                />
                                            </div>
                                            {include_rentals && (
                                                <div>
                                                    <Label>Rental</Label>
                                                    <Select
                                                        value={block.rental_id}
                                                        onValueChange={(v) => updateAssignmentBlock(block.id, 'rental_id', v)}
                                                        options={[
                                                            { value: '', label: 'No rental' },
                                                            ...rentals.map((r) => ({
                                                                value: r.id.toString(),
                                                                label: `${r.rental_number} - ${r.equipment?.name || 'Unknown Equipment'}`
                                                            }))
                                                        ]}
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <Label>Start Date</Label>
                                                <input
                                                    type="date"
                                                    value={block.start_date}
                                                    onChange={(e) => updateAssignmentBlock(block.id, 'start_date', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label>End Date</Label>
                                                <input
                                                    type="date"
                                                    value={block.end_date}
                                                    onChange={(e) => updateAssignmentBlock(block.id, 'end_date', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addAssignmentBlock}
                                    className="w-full"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Assignment Block
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Daily Hours Grid */}
                        {Object.keys(dailyNormalHours).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Daily Hours</CardTitle>
                                    <CardDescription>Set normal and overtime hours for each day</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-fixed rounded-lg border border-gray-200 text-sm shadow-sm">
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
                                                    {Object.keys(dailyNormalHours).map((date) => (
                                                        <td key={date} className="border-b border-gray-200 p-1">
                                                                        <input
                                                                type="text"
                                                                value={dailyNormalHours[date]}
                                                                onChange={(e) => setDailyNormalHours(prev => ({ ...prev, [date]: e.target.value }))}
                                                                className="w-full text-center border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded"
                                                                style={{ fontSize: '12px', padding: '2px' }}
                                                                placeholder="8"
                                                                        />
                                                                    </td>
                                                    ))}
                                                        </tr>
                                                        <tr>
                                                    {Object.keys(dailyOvertimeHours).map((date) => (
                                                        <td key={date} className="border-b border-gray-200 p-1">
                                                                        <input
                                                                type="text"
                                                                value={dailyOvertimeHours[date]}
                                                                onChange={(e) => setDailyOvertimeHours(prev => ({ ...prev, [date]: e.target.value }))}
                                                                className="w-full text-center border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded"
                                                                style={{ fontSize: '12px', padding: '2px' }}
                                                                placeholder="0"
                                                                        />
                                                                    </td>
                                                    ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p><strong>Instructions:</strong></p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Enter normal hours in the first row (default: 8)</li>
                                            <li>Enter overtime hours in the second row (default: 0)</li>
                                            <li>Use 'A' for absent days or '0' for no work</li>
                                            <li>Fridays are highlighted in blue</li>
                                        </ul>
                                        </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Work Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Description</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe the work performed..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tasks_completed">Tasks Completed</Label>
                                    <Textarea
                                        id="tasks_completed"
                                        value={data.tasks_completed}
                                        onChange={(e) => setData('tasks_completed', e.target.value)}
                                        placeholder="List specific tasks completed..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions for Bulk Mode */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('timesheets.index'))}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating Timesheets...' : 'Create Bulk Timesheets'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Employee & Assignment Section */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="mr-2 h-5 w-5" />
                                        Employee & Assignment
                                    </CardTitle>
                                    <CardDescription>
                                        Select the employee and their work assignment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Employee Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee *</Label>
                                                    <Select
                                            value={data.employee_id}
                                            onValueChange={handleEmployeeChange}
                                            options={employees.map((e) => ({
                                                value: e.id.toString(),
                                                label: `${e.first_name} ${e.last_name}`
                                            }))}
                                            placeholder="Select an employee"
                                        />
                                        {errors?.employee_id && (
                                            <p className="text-sm text-red-600">{errors.employee_id}</p>
                                        )}
                                                </div>

                                    {/* Assignment Selection */}
                                    {availableAssignments.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="assignment_id">Assignment</Label>
                                                    <Select
                                                value={data.assignment_id}
                                                onValueChange={handleAssignmentChange}
                                                options={[
                                                    { value: '', label: 'No specific assignment' },
                                                    ...availableAssignments.map((assignment) => ({
                                                        value: assignment.id.toString(),
                                                        label: assignment.type === 'project' && assignment.project
                                                            ? `Project: ${assignment.project.name}`
                                                            : assignment.type === 'rental' && assignment.rental
                                                            ? `Rental: ${assignment.rental.rental_number || assignment.rental.project_name}`
                                                            : `${assignment.type}: ${assignment.name}`
                                                    }))
                                                ]}
                                                placeholder="Select an assignment"
                                                    />
                                                </div>
                                    )}

                                    {/* Assignment Display */}
                                    {data.assignment_id && (
                                        <div className="rounded-lg border p-4 bg-blue-50">
                                            <h4 className="font-medium text-sm text-blue-800 mb-2">Selected Assignment</h4>
                                            <div className="text-sm text-blue-700">
                                                {(() => {
                                                    const assignment = availableAssignments.find(a => a.id.toString() === data.assignment_id);
                                                    if (!assignment) return 'Assignment not found';

                                                    if (assignment.type === 'project' && assignment.project) {
                                                        return `Project: ${assignment.project.name}`;
                                                    } else if (assignment.type === 'rental' && assignment.rental) {
                                                        return `Rental: ${assignment.rental.rental_number || assignment.rental.project_name}`;
                                                            } else {
                                                        return `${assignment.type}: ${assignment.name}`;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Project/Rental Selection (when no assignment) */}
                                    {!data.assignment_id && (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="project_id">Project (Optional)</Label>
                                                <Select
                                                    value={data.project_id}
                                                    onValueChange={handleProjectChange}
                                                    options={[
                                                        { value: '', label: 'No project' },
                                                        ...projects.map((p) => ({
                                                            value: p.id.toString(),
                                                            label: p.name
                                                        }))
                                                    ]}
                                                    placeholder="Select a project"
                                                    />
                                                </div>

                                            {include_rentals && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="rental_id">Rental (Optional)</Label>
                                                    <Select
                                                        value={data.rental_id}
                                                        onValueChange={handleRentalChange}
                                                        options={[
                                                            { value: '', label: 'No rental' },
                                                            ...rentals.map((r) => ({
                                                                value: r.id.toString(),
                                                                label: `${r.rental_number} - ${r.equipment?.name || 'Unknown Equipment'}`
                                                            }))
                                                        ]}
                                                        placeholder="Select a rental"
                                                    />
                                                </div>
                                            )}
                                    </div>
                                )}

                                    {/* Warning when no assignment and employee has assignments */}
                                    {!data.assignment_id && availableAssignments.length > 0 && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                This employee has active assignments. Consider selecting one above or use project/rental fields to create a new assignment.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Time Details Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Time Details
                                    </CardTitle>
                                    <CardDescription>
                                        Work date and hours
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date *</Label>
                                        <DatePicker
                                            value={data.date ? new Date(data.date) : null}
                                            onChange={(date) => setData('date', date ? format(date, 'yyyy-MM-dd') : '')}
                                        />
                                        {errors?.date && (
                                            <p className="text-sm text-red-600">{errors.date}</p>
                                        )}
                                    </div>

                                    {/* Hours */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hours_worked">Regular Hours *</Label>
                                                <Input
                                                id="hours_worked"
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="24"
                                                    value={data.hours_worked}
                                                    onChange={(e) => setData('hours_worked', e.target.value)}
                                                placeholder="8"
                                                />
                                            {errors?.hours_worked && (
                                                <p className="text-sm text-red-600">{errors.hours_worked}</p>
                                            )}
                                            </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="overtime_hours">Overtime Hours</Label>
                                                <Input
                                                id="overtime_hours"
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    max="24"
                                                    value={data.overtime_hours}
                                                    onChange={(e) => setData('overtime_hours', e.target.value)}
                                                placeholder="0"
                                                />
                                            {errors?.overtime_hours && (
                                                <p className="text-sm text-red-600">{errors.overtime_hours}</p>
                                            )}
                                            </div>
                                        </div>

                                    {/* Time Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_time">Start Time</Label>
                                            <Input
                                                id="start_time"
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) => setData('start_time', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_time">End Time</Label>
                                            <Input
                                                id="end_time"
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) => setData('end_time', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Total Hours Display */}
                                    <div className="rounded-lg bg-muted/30 p-3">
                                        <div className="text-sm font-medium text-muted-foreground">Total Hours</div>
                                        <div className="text-2xl font-bold">
                                            {(parseFloat(data.hours_worked || '0') + parseFloat(data.overtime_hours || '0')).toFixed(1)}h
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Description</CardTitle>
                                <CardDescription>
                                    Describe the work performed and tasks completed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of work performed..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tasks_completed">Tasks Completed</Label>
                                        <Textarea
                                            id="tasks_completed"
                                            value={data.tasks_completed}
                                            onChange={(e) => setData('tasks_completed', e.target.value)}
                                            placeholder="List of specific tasks completed..."
                                            rows={4}
                                        />
                                </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('timesheets.index'))}
                                disabled={processing}
                            >
                                Cancel
                                    </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Timesheet'}
                                    </Button>
                                </div>
                            </form>
                )}
                </div>

            {/* Assignment Creation Dialog */}
            <Dialog open={showAssignmentPopup} onOpenChange={setShowAssignmentPopup}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Setup Assignment</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This employee has no active assignments. You'll be redirected to the appropriate page to view details and create assignments.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label>Assignment Type</Label>
                            <Select
                                value={newAssignmentData.type}
                                onValueChange={(value) => setNewAssignmentData(prev => ({ ...prev, type: value, name: '', location: '', project_id: '', rental_id: '' }))}
                                options={[
                                    { value: 'manual', label: 'Manual Assignment' },
                                    { value: 'project', label: 'Project Assignment' },
                                    { value: 'rental', label: 'Rental Assignment' },
                                ]}
                            />
                            <p className="text-sm text-muted-foreground">
                                Select the type of assignment you want to create. You'll complete the details on the assignment page.
                            </p>
            </div>

                                                {newAssignmentData.type === 'project' && (
                            <div className="space-y-2">
                                <Label>Project (Optional)</Label>
                                <Select
                                    value={newAssignmentData.project_id}
                                    onValueChange={(value) => setNewAssignmentData(prev => ({ ...prev, project_id: value }))}
                                    options={[
                                        { value: '', label: 'Select a project to pre-fill' },
                                        ...projects.map(p => ({ value: p.id.toString(), label: p.name }))
                                    ]}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Selecting a project will redirect you to the project resources page.
                                </p>
                            </div>
                        )}

                        {newAssignmentData.type === 'rental' && include_rentals && (
                            <div className="space-y-2">
                                <Label>Rental (Optional)</Label>
                                <Select
                                    value={newAssignmentData.rental_id}
                                    onValueChange={(value) => setNewAssignmentData(prev => ({ ...prev, rental_id: value }))}
                                    options={[
                                        { value: '', label: 'Select a rental to pre-fill' },
                                        ...rentals.map(r => ({
                                            value: r.id.toString(),
                                            label: `${r.rental_number} - ${r.equipment?.name || 'Unknown'}`
                                        }))
                                    ]}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Selecting a rental will redirect you to the rental details page.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeAssignmentPopup}>
                            Cancel
                        </Button>
                        <Button onClick={redirectToAssignmentPage}>
                            Go to Assignment Page
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
