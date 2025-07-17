import { AppLayout } from '@/Core';
import { Select } from '@/Core/components/Common/Select';
import { Button } from '@/Core/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/components/ui/card';
import { Label } from '@/Core';
import { Input } from '@/Core/components/ui/input';
import { Textarea } from '@/Core/components/ui/textarea';
import { DatePicker } from '@/Core/components/ui/date-picker';
import { BreadcrumbItem, PageProps } from '@/Core/types';
import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Clock, User, Calendar, Plus, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Core/components/ui/dialog';
import { Alert, AlertDescription } from '@/Core/components/ui/alert';

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

    // Create assignment function
    const createAssignment = async () => {
        if (!selectedEmployeeForAssignment || !newAssignmentData.name.trim()) {
            toast.error('Please provide assignment name');
            return;
        }

        try {
            const assignmentData = {
                ...newAssignmentData,
                employee_id: selectedEmployeeForAssignment.id,
            };

            const response = await fetch(`/api/employees/${selectedEmployeeForAssignment.id}/assignments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(assignmentData),
            });

            if (response.ok) {
                toast.success('Assignment created successfully');
                setShowAssignmentPopup(false);
                window.location.reload(); // Refresh to get updated assignments
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to create assignment');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            toast.error('Failed to create assignment');
        }
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

                {/* Main Form */}
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

                                {/* Time Range (Optional) */}
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
            </div>

            {/* Assignment Creation Dialog */}
            <Dialog open={showAssignmentPopup} onOpenChange={setShowAssignmentPopup}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Assignment</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This employee has no active assignments. Please create one to proceed.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label>Assignment Type</Label>
                            <Select
                                value={newAssignmentData.type}
                                onValueChange={(value) => setNewAssignmentData(prev => ({ ...prev, type: value }))}
                                options={[
                                    { value: 'manual', label: 'Manual Assignment' },
                                    { value: 'project', label: 'Project Assignment' },
                                    { value: 'rental', label: 'Rental Assignment' },
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Assignment Name *</Label>
                            <Input
                                value={newAssignmentData.name}
                                onChange={(e) => setNewAssignmentData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter assignment name"
                            />
                        </div>

                        {newAssignmentData.type === 'project' && (
                            <div className="space-y-2">
                                <Label>Project</Label>
                                <Select
                                    value={newAssignmentData.project_id}
                                    onValueChange={(value) => setNewAssignmentData(prev => ({ ...prev, project_id: value }))}
                                    options={[
                                        { value: '', label: 'Select a project' },
                                        ...projects.map(p => ({ value: p.id.toString(), label: p.name }))
                                    ]}
                                />
                            </div>
                        )}

                        {newAssignmentData.type === 'rental' && include_rentals && (
                            <div className="space-y-2">
                                <Label>Rental</Label>
                                <Select
                                    value={newAssignmentData.rental_id}
                                    onValueChange={(value) => setNewAssignmentData(prev => ({ ...prev, rental_id: value }))}
                                    options={[
                                        { value: '', label: 'Select a rental' },
                                        ...rentals.map(r => ({
                                            value: r.id.toString(),
                                            label: `${r.rental_number} - ${r.equipment?.name || 'Unknown'}`
                                        }))
                                    ]}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={newAssignmentData.location}
                                onChange={(e) => setNewAssignmentData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Work location"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={newAssignmentData.start_date}
                                onChange={(e) => setNewAssignmentData(prev => ({ ...prev, start_date: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={newAssignmentData.notes}
                                onChange={(e) => setNewAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeAssignmentPopup}>
                            Cancel
                        </Button>
                        <Button onClick={createAssignment} disabled={!newAssignmentData.name.trim()}>
                            Create Assignment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
